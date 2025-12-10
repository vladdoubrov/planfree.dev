# 🚀 Quick Deployment Guide

## Fastest Way: Deploy in 5 Minutes

### Part 1: Deploy Server (Railway)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `planfree.dev` repository
4. Select the branch with your changes
5. Railway will auto-detect the Node.js app
6. Add environment variable:
   - Click **"Variables"** tab
   - Add: `ORIGIN` = `*` (we'll update this after client deploys)
7. Click **"Deploy"**
8. Copy your Railway URL (e.g., `https://your-app.up.railway.app`)

### Part 2: Deploy Client (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select `planfree.dev` repository
4. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** Vue.js (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add environment variable:
   - `VUE_APP_SERVER` = Your Railway URL (e.g., `https://your-app.up.railway.app`)
6. Click **"Deploy"**
7. Done! Your app is live 🎉

### Part 3: Update CORS (Important!)

1. Go back to Railway
2. Update `ORIGIN` variable to your Vercel URL (e.g., `https://your-app.vercel.app`)
3. Redeploy if needed

---

## Alternative: Render.com (All-in-One)

If you prefer everything on one platform:

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Create **two services**:
   - **Web Service** for server (root directory: `/`, start command: `npm start`)
   - **Static Site** for client (root directory: `client`, build command: `npm run build`, publish: `dist`)
3. Set environment variables as above
4. Both will deploy automatically

---

## What You'll Need to Do:

✅ Railway account (free)
✅ Vercel account (free) OR Render account (free)
✅ Push the railway.json config (I've created it)
✅ Update environment variables as shown above

**Your app will be live in ~5 minutes!** 🚀
