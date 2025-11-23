# Replit Setup Steps (After Uploading Files)

## Step 1: Install Dependencies

In the Replit shell, run:
```bash
npm install
```

Or Replit might auto-detect and install automatically when you click "Run".

---

## Step 2: Create .env File

1. Click the **"Secrets"** tab (lock icon) in Replit sidebar, OR
2. Create a new file called `.env` in the root of your project

**IMPORTANT:** Replit uses port 5000 by default. You have two options:

### Option A: Use Replit's Default Port (5000) - RECOMMENDED
**In Replit Secrets tab:**
- Click "New Secret"
- Key: `PORT`, Value: `5000` (Replit's default)
- Key: `CORS_ORIGIN`, Value: `*`
- Key: `NODE_ENV`, Value: `production`

### Option B: Use Port 3000 (if 5000 is busy)
**In Replit Secrets tab:**
- Click "New Secret"
- Key: `PORT`, Value: `3000`
- Key: `CORS_ORIGIN`, Value: `*`
- Key: `NODE_ENV`, Value: `production`

**Note:** If you get "EADDRINUSE" error, Replit is already using that port. Use Option A (port 5000) instead.

---

## Step 3: Initialize Database (First Time Only)

In the Replit shell, run:
```bash
npm run init-db
```

This creates the SQLite database and all tables.

---

## Step 4: Start the Server

Click the **"Run"** button in Replit, or run:
```bash
npm start
```

---

## Step 5: Get Your Backend URL

After the server starts, Replit will show you a URL like:
- `https://your-app-name.repl.co`
- Or `https://your-app-name--username.repl.co`

**Copy this URL!** You'll need it for the frontend.

---

## Step 6: Test Your Backend

Open the URL in a browser and add `/api/health`:
```
https://your-app-name.repl.co/api/health
```

You should see:
```json
{"status":"ok","timestamp":1234567890}
```

If you see this, your backend is working! ✅

---

## Step 7: Update Frontend

1. Open `script.js` in your frontend project
2. Find line ~98 where it says:
   ```javascript
   const DEFAULT_BACKEND_URL = 'https://shs-backend.fly.dev';
   ```
3. Replace it with your Replit URL:
   ```javascript
   const DEFAULT_BACKEND_URL = 'https://your-app-name.repl.co';
   ```

---

## Step 8: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Deploy

---

## Step 9: Update CORS (After Frontend is Deployed)

Once your frontend is live on Vercel, update the CORS setting:

1. In Replit, go to **Secrets** tab
2. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
3. Restart the server (click "Stop" then "Run" again)

---

## Troubleshooting

### Server won't start?
- Check the console for errors
- Make sure `npm install` completed successfully
- Verify `package.json` is in the root directory

### Database errors?
- Run `npm run init-db` again
- Make sure the `data/` folder exists

### CORS errors?
- Update `CORS_ORIGIN` in Secrets to match your frontend URL
- Restart the server after changing secrets

### WebSocket not working?
- Make sure your Replit URL uses `https://` (not `http://`)
- Check that the server is running and shows "Socket.io server ready"

---

## ✅ You're Done!

Your backend should now be:
- ✅ Running on Replit
- ✅ Accessible via public URL
- ✅ Ready to connect to your frontend

Next: Deploy your frontend to Vercel and update the backend URL in `script.js`!

