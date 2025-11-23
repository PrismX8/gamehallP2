# Deployment Guide - SHS Game Hall

This guide will help you deploy your app to production using:
- **Frontend** → Vercel (free)
- **Backend** → Fly.io (free)
- **Database** → SQLite (stored in Fly.io app)

---

## 🚀 Step 1: Deploy Backend to Fly.io

### 1.1 Install Fly CLI

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### 1.2 Login to Fly.io

```bash
fly auth login
```

This will open your browser to authenticate.

### 1.3 Navigate to Backend Directory

```bash
cd backend
```

### 1.4 Launch Your App

```bash
fly launch
```

When prompted:
- **"Would you like to deploy?"** → Type `Yes`
- **"App name?"** → Type your app name (e.g., `shs-backend`)
- **"Internal port?"** → Type `3000`
- **"Add PostgreSQL?"** → Type `No` (we're using SQLite)
- **"Deploy now?"** → Type `Yes`

### 1.5 Update fly.toml (if needed)

The `fly.toml` file is already configured with WebSocket support. If you need to change the app name, edit the `app` field:

```toml
app = "your-app-name"
```

### 1.6 Set Environment Variables

```bash
fly secrets set CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

Replace `your-frontend-domain.vercel.app` with your actual Vercel domain.

### 1.7 Deploy

```bash
fly deploy
```

Your backend is now live at: `https://your-app-name.fly.dev`

---

## 🌐 Step 2: Update Frontend Configuration

### 2.1 Update Backend URL in script.js

Open `script.js` and find the `DEFAULT_BACKEND_URL` constant (around line 98). Update it with your Fly.io app URL:

```javascript
const DEFAULT_BACKEND_URL = 'https://your-app-name.fly.dev';
```

### 2.2 Alternative: Use window.BACKEND_URL

You can also set the backend URL dynamically by adding this to your `index.html` before the script.js loads:

```html
<script>
  window.BACKEND_URL = 'https://your-app-name.fly.dev';
</script>
```

---

## 📦 Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 3.2 Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Import your GitHub repository (or upload manually)
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (root of your project)
   - **Build Command:** (leave empty - static site)
   - **Output Directory:** `./` (or leave empty)
6. Click **"Deploy"**

### 3.3 Deploy via CLI (Alternative)

```bash
vercel
```

Follow the prompts to deploy.

---

## ✅ Step 4: Verify Deployment

### 4.1 Test Backend Health

Visit: `https://your-app-name.fly.dev/api/health`

You should see:
```json
{"status":"ok","timestamp":1234567890}
```

### 4.2 Test Frontend

Visit your Vercel URL and check:
- ✅ Page loads
- ✅ Backend connects (check browser console)
- ✅ WebSocket connection works
- ✅ Canvas drawing works
- ✅ Chat works
- ✅ Friends system works

---

## 🔧 Troubleshooting

### WebSocket Connection Issues

If WebSockets aren't working:
1. Check `fly.toml` has the correct WebSocket configuration
2. Verify CORS_ORIGIN is set correctly: `fly secrets set CORS_ORIGIN=https://your-frontend.vercel.app`
3. Check Fly.io logs: `fly logs`

### Database Issues

SQLite database is stored in the Fly.io app's persistent storage. It persists between deployments.

To view logs:
```bash
fly logs
```

To SSH into the app:
```bash
fly ssh console
```

### CORS Errors

Make sure `CORS_ORIGIN` environment variable is set correctly:
```bash
fly secrets set CORS_ORIGIN=https://your-frontend.vercel.app
```

---

## 📝 Environment Variables

### Backend (Fly.io)

Set these using `fly secrets set`:

```bash
fly secrets set CORS_ORIGIN=https://your-frontend.vercel.app
fly secrets set NODE_ENV=production
```

### Frontend (Vercel)

No environment variables needed for the frontend (static site).

---

## 🔄 Updating Your Deployment

### Update Backend

```bash
cd backend
fly deploy
```

### Update Frontend

Vercel automatically deploys on every push to your main branch, or you can manually deploy:

```bash
vercel --prod
```

---

## 💰 Cost

- **Vercel:** Free forever (for personal projects)
- **Fly.io:** Free tier includes:
  - 3 shared CPUs
  - 3GB RAM
  - 160GB outbound data transfer
  - Free public IP
- **SQLite:** Free (stored in Fly.io app)

**Total Cost: $0/month** 🎉

---

## 📚 Additional Resources

- [Fly.io Docs](https://fly.io/docs/)
- [Vercel Docs](https://vercel.com/docs)
- [Socket.io Deployment](https://socket.io/docs/v4/deployment/)

---

## 🎉 You're Done!

Your app is now live and accessible to everyone!

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app-name.fly.dev`

