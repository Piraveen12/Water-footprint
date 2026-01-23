# Manual Deployment Guide

Since you have chosen to deploy manually, the application has been configured as a **Single Server Application**. This means the Python (Flask) backend will serve both the API *and* the React frontend files.

## Prerequisite: Build the Frontend
Before the backend can serve the frontend, you must build the React application into static files.

1.  Open terminal in `frontend/`
2.  Run `npm run build`
    - This creates a `dist/` folder in `frontend/` containing the optimized website.

## Approach 1: Run Locally (Production Mode)
You can test the "deployed" version on your own machine.

1.  **Build Frontend**: `cd frontend` then `npm run build`
2.  **Run Backend**: `cd backend` then `python app.py`
3.  **Access App**: Open `http://localhost:5000` in your browser.
    - Note: You do NOT need to run `npm run dev`. The Python server handles everything.

## Approach 2: Deploy to a Cloud Server (VPS, Render, Railway, etc.)

If you are uploading this to a server (like an Ubuntu VPS or a cloud platform):

1.  **Upload Code**: Copy all files to the server.
2.  **Install Python Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
3.  **Install Node Dependencies & Build**:
    ```bash
    cd frontend
    npm install
    npm run build
    ```
4.  **Run the Server**:
    - **Development/Simple**: `python app.py`
    - **Production (Linux)**: Use `gunicorn`:
      ```bash
      gunicorn app:app
      ```
    - **Production (Windows)**: Use `waitress` (install with `pip install waitress`):
      ```bash
      waitress-serve --listen=*:5000 app:app
      ```

## Environment Variables
Ensure your server has the `.env` file in the `backend/` directory or appropriate environment variables set:
- `GOOGLE_API_KEY`: Your Gemini API Key.
