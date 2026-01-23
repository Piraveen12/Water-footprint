# Deploying Water Footprint Tracker to Vercel

This guide will help you deploy your full-stack application (React Frontend + Flask Backend) to Vercel.

## Prerequisites

1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Vercel CLI**: Install it globally using npm:
    ```bash
    npm install -g vercel
    ```

## deployment Steps

### 1. Login to Vercel
Open your terminal in the project root (`f:\s8 project\New folder`) and run:
```bash
vercel login
```
Follow the instructions to log in (email or GitHub).

### 2. Deploy Project
Run the deploy command:
```bash
vercel
```
You will be asked a series of questions. Authenticate and select the following options:
- **Set up and deploy?**: `Y`
- **Which scope?**: Select your account.
- **Link to existing project?**: `N`
- **Project Name**: `water-footprint-tracker` (or your choice)
- **In which directory is your code located?**: `./` (Just press Enter)
- **Want to modify these settings?**: `N` (We created `vercel.json` to handle this)

### 3. Configure Environment Variables
**CRITICAL STEP**: Your app needs the Google Gemini API Key to work.

1.  Go to the Vercel Dashboard for your new project.
2.  Click on **Settings** > **Environment Variables**.
3.  Add a new variable:
    - **Key**: `GOOGLE_API_KEY`
    - **Value**: (Copy your key from your local `.env` file)
4.  Save the variable.

### 4. Redeploy
For the environment variables to take effect, you must redeploy.
```bash
vercel --prod
```

## Verification
- Open the "Production" URL provided by Vercel.
- Try scanning an item or using the ChatBot.
- If it works, you are live! 🚀

## Troubleshooting
- **Build Errors**: Check the "Logs" tab in Vercel dashboard.
- **API Errors**: Ensure `GOOGLE_API_KEY` is set correctly.
- **404 on API**: Double-check `vercel.json` routes (routes `/api` to backend).
