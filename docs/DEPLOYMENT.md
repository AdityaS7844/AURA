# AURA — Production Deployment Guide (Vercel & Cloud Backend)

This guide walks you through deploying **AURA** to production:
1. **Frontend**: Deployed to **Vercel** (Global CDN, instant SSL, automatic CI/CD).
2. **Backend**: Deployed to **Render** or **Railway** (Persistent Python FastAPI container with SQLite and Gemini SDK).

---

## Part 1: Deploying the Frontend to Vercel

The frontend is a React 19 Single-Page Application (SPA) built with Vite and Tailwind CSS. We have already pre-configured `vercel.json` with SPA route rewrites so direct navigation and refreshes to `/wardrobe`, `/stylist`, `/planner`, etc., work seamlessly.

### Step 1.1: Push Your Code to GitHub

Your GitHub CLI is already authenticated as `@AdityaS7844`. To create the repository and push your code:

```bash
# Create a public or private GitHub repository and push current code
gh repo create AURA --public --source=. --push
```
*(Or use `--private` if you prefer a private repository).*

---

### Step 1.2: Import on Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Under **"Import Git Repository"**, select **`AURA`**.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build` *(auto-detected)*
   - **Output Directory**: `dist` *(auto-detected)*
   - **Install Command**: `npm install` *(auto-detected)*
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com/api/v1` *(set this once your backend is deployed in Part 2)*
5. Click **Deploy**.

Vercel will build and deploy your site in ~30 seconds, giving you a live production domain (e.g. `https://aura-wardrobe.vercel.app`).

---

## Part 2: Deploying the FastAPI Backend (Render / Railway)

Because AURA uses SQLite (`wardrobe.db`) and local photo uploads, the backend needs a persistent container environment (rather than ephemeral serverless lambdas). **Render** provides free web services for FastAPI.

### Option A: Deploy on Render (Free & Recommended)

1. Sign up / Log in to [https://render.com](https://render.com) with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your **`AURA`** GitHub repository.
4. Set the following configuration:
   - **Name**: `aura-backend`
   - **Region**: Closest to you (e.g. `Singapore` or `Frankfurt`)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python scripts/seed.py`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   ```ini
   SECRET_KEY=generate_a_long_random_jwt_secret_here
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   DATABASE_URL=sqlite:///./wardrobe.db
   UPLOAD_DIR=./uploads
   FRONTEND_ORIGIN=https://your-frontend.vercel.app
   GEMINI_API_KEY=your_actual_google_gemini_api_key
   GEMINI_MODEL=gemini-3-flash-preview
   ```
6. Click **Create Web Service**.

Once deployed, Render gives you a live URL, e.g., `https://aura-backend.onrender.com`.

---

## Part 3: Connecting Frontend and Backend

1. In your **Vercel Dashboard**:
   - Go to your `AURA` project -> **Settings** -> **Environment Variables**.
   - Add/Update:
     - `VITE_API_BASE_URL` = `https://aura-backend.onrender.com/api/v1`
2. In your **Render Dashboard**:
   - Go to `aura-backend` -> **Environment Variables**.
   - Ensure `FRONTEND_ORIGIN` matches your Vercel URL (e.g. `https://aura-wardrobe.vercel.app`) to allow CORS.
3. Redeploy the frontend on Vercel (or trigger a git push) to apply the new API base URL.

---

## Verification Checklist

- [ ] Vercel URL loads the Landing Page with 1-Click Demo Login.
- [ ] Direct URLs like `/wardrobe` and `/planner` don't return 404 on page refresh (handled by `frontend/vercel.json`).
- [ ] User registration, login, and JWT tokens work against the live API.
- [ ] AI Stylist generates outfit recommendations using Gemini with the production API key.
- [ ] Calendar planner and insights correctly persist to the SQLite database.
