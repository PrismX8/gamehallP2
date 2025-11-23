# Quick Deployment Checklist

## Backend (Fly.io)

1. **Install Fly CLI:**
   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Deploy:**
   ```bash
   cd backend
   fly launch
   ```
   - App name: `shs-backend` (or your choice)
   - Port: `3000`
   - PostgreSQL: `No`
   - Deploy: `Yes`

4. **Set CORS (after frontend is deployed):**
   ```bash
   fly secrets set CORS_ORIGIN=https://your-frontend.vercel.app
   ```

5. **Get your backend URL:**
   Your backend will be at: `https://your-app-name.fly.dev`

---

## Frontend (Vercel)

1. **Update backend URL in `script.js`:**
   - Find line ~98: `const DEFAULT_BACKEND_URL = 'https://shs-backend.fly.dev';`
   - Replace with your actual Fly.io URL

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repo
   - Deploy

3. **Update CORS in Fly.io:**
   ```bash
   fly secrets set CORS_ORIGIN=https://your-app.vercel.app
   ```

---

## Done! 🎉

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app-name.fly.dev`

See `DEPLOYMENT.md` for detailed instructions.

