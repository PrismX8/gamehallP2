# How to Start the Servers

## Quick Start (Windows)

### 1. Start Backend Server
Open a terminal/command prompt and run:
```cmd
cd backend
npm start
```

Or double-click `backend/start.bat`

The backend will start on **http://localhost:3000**

### 2. Start Frontend Server (Optional)
Open a **second** terminal/command prompt and run:
```cmd
node serve-frontend.js
```

The frontend will start on **http://localhost:8080**

### 3. Open in Browser
Go to: **http://localhost:8080**

---

## Alternative: Open HTML Directly

You can also just open `index.html` directly in your browser (double-click it), but:
- ⚠️ Some features may not work (CORS issues)
- ✅ The frontend server is recommended for full functionality

---

## First Time Setup

If you haven't installed dependencies yet:

### Backend Setup
```cmd
cd backend
npm install
npm run init-db
npm start
```

### Frontend Setup
No installation needed! Just run:
```cmd
node serve-frontend.js
```

---

## What Each Server Does

### Backend Server (Port 3000)
- Handles API requests
- Manages WebSocket connections (Socket.io)
- Stores data in SQLite database
- Required for chat, canvas, visitor counter, etc.

### Frontend Server (Port 8080)
- Serves your HTML/CSS/JS files
- Prevents CORS issues
- Makes development easier

---

## Troubleshooting

**Backend won't start?**
- Make sure port 3000 is not in use
- Check if you ran `npm install` in the `backend` folder
- Check if you ran `npm run init-db` to initialize the database

**Frontend can't connect to backend?**
- Make sure backend is running on port 3000
- Check browser console for errors
- Verify `CORS_ORIGIN` in `backend/.env` (should be `http://localhost:8080` or `*`)

**Port already in use?**
- Change the port in `backend/.env` (for backend)
- Or change `PORT = 8080` in `serve-frontend.js` (for frontend)

---

## Development Mode (Auto-reload)

For backend development with auto-reload:
```cmd
cd backend
npm run dev
```

This uses `nodemon` to automatically restart the server when you make changes.

