import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types
from dotenv import load_dotenv
import PIL.Image
from pymongo import MongoClient
import datetime

load_dotenv(override=True)

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
CORS(app)

# --- MongoDB Configuration ---
# Connect to local MongoDB instance
try:
    mongo_client = MongoClient("mongodb://localhost:27017/")
    db = mongo_client["water_footprint_db"]
    history_collection = db["user_history"]
    print("Combined to MongoDB: water_footprint_db")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    history_collection = None

# --- Gemini API Configuration ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY not found in environment variables.")
    client = None
else:
    print(f"Loaded API Key: {GOOGLE_API_KEY[:10]}...") # Verify which key is loaded
    client = genai.Client(api_key=GOOGLE_API_KEY)
    
    # Debug: List available models
    try:
        print("Checking available models...")
        for m in client.models.list():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"Warning: Could not list models: {e}")

def generate_with_fallback(contents, is_json=True):
    # Models to try in order of preference
    candidate_models = [
        'gemini-2.5-flash',
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro',
        'gemini-1.5-pro-001',
        'gemini-2.0-flash-exp'
    ]

    for model_name in candidate_models:
        try:
            print(f"Trying model: {model_name}...")
            response = client.models.generate_content(
                model=model_name, 
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json' if is_json else 'text/plain'
                )
            )
            print(f"Success with model: {model_name}")
            return response
        except Exception as e:
            print(f"Failed with {model_name}: {e}")
            continue
    raise Exception("No suitable Gemini model found.")

def get_water_footprint_analysis(input_data, is_image=False):
    if not client:
        raise Exception("API Key not configured")

    prompt = """
    Identify the item in this input (image or text). 
    Provide a comprehensive environmental impact analysis, focusing on water usage.
    
    Return a STRICT JSON object with this exact schema:
    {
        "item_name": "string",
        "scientific_name": "string",
        "category": "string",
        "confidence_score": "number (0-100)",
        "water_footprint_liters": number,
        "water_footprint_unit": "string (e.g. 'L/kg')",
        "description": "string (brief overview)",
        "severity": "string (Low, Medium, High)",
        "breakdown": {
            "green_water": number,
            "blue_water": number,
            "grey_water": number
        },
        "carbon_footprint": "string (e.g. '0.5 kg CO2e/kg')",
        "land_use": "string (e.g. '0.2 m²/kg')",
        "regional_comparison": [
            {"region": "Global Average", "value": number},
            {"region": "Arid Regions", "value": number},
            {"region": "Temperate", "value": number},
            {"region": "Tropical", "value": number}
        ],
        "tips": ["string", "string"],
        "recommendations": ["string", "string"],
        "production_insights": "string (brief text about how it's made)",
        "translation": {
            "hindi": { 
                "item_name": "string", 
                "category": "string",
                "description": "string",
                "tips": ["string"],
                "recommendations": ["string"],
                "production_insights": "string"
            },
            "tamil": { 
                "item_name": "string", 
                "category": "string",
                "description": "string",
                "tips": ["string"],
                "recommendations": ["string"],
                "production_insights": "string"
            },
            "telugu": { 
                "item_name": "string", 
                "category": "string",
                "description": "string",
                "tips": ["string"],
                "recommendations": ["string"],
                "production_insights": "string"
            },
            "malayalam": { 
                "item_name": "string", 
                "category": "string",
                "description": "string",
                "tips": ["string"],
                "recommendations": ["string"],
                "production_insights": "string"
            },
            "kannada": { 
                "item_name": "string", 
                "category": "string",
                "description": "string",
                "tips": ["string"],
                "recommendations": ["string"],
                "production_insights": "string"
            }
        }
    }
    """
    
    try:
        if is_image:
            response = generate_with_fallback([prompt, input_data])
        else:
            response = generate_with_fallback(prompt + f"\nInput item: {input_data}")
            
        print(f"Gemini Response: {response.text}") # Debugging
        
        return json.loads(response.text)
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise e

# --- Endpoints ---

@app.route('/api/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID required"}), 400
    
    if history_collection is None:
        return jsonify({"error": "Database not connected"}), 500

    try:
        # Fetch history from Mongo, excluding _id
        history = list(history_collection.find({"user_id": user_id}, {"_id": 0}))
        return jsonify(history)
    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"error": "Failed to fetch history"}), 500

@app.route('/api/history', methods=['POST'])
def add_history():
    data = request.get_json()
    if not data or 'user_id' not in data or 'item' not in data:
        return jsonify({"error": "Invalid data format"}), 400
    
    if history_collection is None:
        return jsonify({"error": "Database not connected"}), 500

    try:
        # Add timestamp if not present
        item = data['item']
        if 'timestamp' not in item:
            item['timestamp'] = datetime.datetime.now().isoformat()
            
        record = {
            "user_id": data['user_id'],
            **item 
        }
        
        history_collection.insert_one(record)
        return jsonify({"status": "success", "message": "Saved to history"})
    except Exception as e:
        print(f"Database Error: {e}")
        return jsonify({"error": "Failed to save history"}), 500

@app.route('/api/footprint', methods=['POST'])
def footprint():
    try:
        if 'image' in request.files:
            image_file = request.files['image']
            img = PIL.Image.open(image_file)
            result = get_water_footprint_analysis(img, is_image=True)
            return jsonify(result)
        
        data = request.get_json()
        if data and 'text' in data:
            item_text = data['text']
            result = get_water_footprint_analysis(item_text, is_image=False)
            return jsonify(result)

        return jsonify({"error": "No image or text provided"}), 400
    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided"}), 400
    
    user_message = data['message']
    
    if not client:
         return jsonify({"error": "API Key not configured"}), 500

    chat_prompt = """
    You are 'AquaBot', a friendly and knowledgeable Water Sustainability Expert.
    Your goal is to help users understand their water footprint and provide practical, daily-life tips to reduce usage.
    
    User Query: {user_message}
    
    Guidelines:
    - Be concise, encouraging, and easy to understand.
    - Focus on 'daily human needs' like cooking, cleaning, hygiene, and shopping.
    - If asked about non-environmental topics, politely steer back to water/sustainability.
    - Provide 1-2 specific actionable tips if relevant.
    
    Return a JSON object:
    {{
        "reply": "string (your helpful response)"
    }}
    """
    
    try:
        response = generate_with_fallback(chat_prompt.format(user_message=user_message))
        return jsonify(json.loads(response.text))
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"error": "I'm having trouble thinking right now. Try again!"}), 500

@app.route('/api/analyze-habits', methods=['POST'])
def analyze_habits():
    data = request.get_json()
    if not data or 'items' not in data:
        return jsonify({"error": "No items provided"}), 400
        
    items = data['items']
    if not items:
         return jsonify({"analysis": "No history available yet. Scan more items!", "recommendations": []})

    if not client:
         return jsonify({"error": "API Key not configured"}), 500

    # Summarize items for prompt
    items_summary = "\n".join([f"- {item.get('item_name', 'Unknown')}: {item.get('water_footprint_liters', 0)} L" for item in items])

    prompt = f"""
    Analyze the following list of items consumed by a user and their water footprint:
    {items_summary}

    1. Identify the most water-consuming products in this list.
    2. Provide a summary of their usage pattern.
    3. Suggest 3 specific, actionable alternatives or habit changes to reduce their water footprint based on THESE specific items.

    Return a JSON object:
    {{
        "most_consuming": ["item1", "item2"],
        "usage_pattern": "string (summary of habits)",
        "recommendations": ["suggestion 1", "suggestion 2", "suggestion 3"]
    }}
    """
    
    try:
        response = generate_with_fallback(prompt)
        return jsonify(json.loads(response.text))
    except Exception as e:
        print(f"Habit Analysis Error: {e}")
        return jsonify({"error": "Failed to analyze habits."}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"error": "Path not found"}), 404
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
