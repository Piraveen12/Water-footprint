import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
import numpy as np
import PIL.Image
import io

# Load pre-trained MobileNetV2 model
# We use weights='imagenet' to get a model pre-trained on ImageNet labels
model = None

def get_model():
    global model
    if model is None:
        print("Loading MobileNetV2 model...")
        model = MobileNetV2(weights='imagenet')
        print("Model loaded successfully.")
    return model

def classify_image(img_path_or_file):
    """
    Classifies an image using MobileNetV2.
    Returns the top prediction label and confidence score.
    """
    try:
        # Load and preprocess the image
        if isinstance(img_path_or_file, str):
            img = image.load_img(img_path_or_file, target_size=(224, 224))
        else:
            # Assume it's a file-like object from Flask
            img = PIL.Image.open(img_path_or_file)
            img = img.convert('RGB')
            img = img.resize((224, 224))
            
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)

        # Run prediction
        preds = get_model().predict(x)
        
        # Decode the results into a list of tuples (class, description, probability)
        # We take the top 1 result
        decoded = decode_predictions(preds, top=1)[0][0]
        
        label = decoded[1] # e.g., 'banana'
        confidence = float(decoded[2])
        
        return {
            "label": label.replace("_", " "),
            "confidence": round(confidence * 100, 2)
        }
    except Exception as e:
        print(f"CNN Error: {e}")
        return None

if __name__ == "__main__":
    # Test with a dummy image if run directly
    print("Testing MobileNetV2...")
    # This would require an actual image file to test
    pass
