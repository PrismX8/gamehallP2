# Custom Backend Setup Guide

This guide will walk you through setting up your custom backend to replace Firebase.

## Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)

## Step-by-Step Setup

### Step 1: Install Backend Dependencies

Open a terminal/command prompt in the project root and run:

```bash
cd backend
npm install
```

This will install all required packages:
- Express (web server)
- Socket.io (real-time WebSocket)
- SQLite3 (database)
- CORS (cross-origin support)
- And other dependencies

### Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   (On Linux/Mac: `cp .env.example .env`)

2. Open `.env` in the `backend` folder and configure:

   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8080
   DB_PATH=./data/database.db
   ```

   **Important:** Change `CORS_ORIGIN` to match your frontend URL. If you're serving your HTML files from `file://` or a different port, you may need to set it to `*` (less secure, but works for development).

### Step 3: Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

This creates the SQLite database file and all necessary tables.

### Step 4: Start the Backend Server

**For development (with auto-reload):**
```bash
npm run dev
```

**For production:**
```bash
npm start
```

You should see:
```
🚀 Backend server running on port 3000
📡 Socket.io server ready for connections
🌐 CORS enabled for: http://localhost:8080
Database initialized successfully
```

### Step 5: Update Frontend to Use Custom Backend

1. **Add Socket.io Client Library**

   Add this to your HTML files (before your scripts):
   ```html
   <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
   ```

2. **Replace Firebase SDK with Backend API Client**

   In your HTML files, replace:
   ```html
   <!-- Remove these -->
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
   ```

   With:
   ```html
   <!-- Add these -->
   <script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
   <script src="../backend-api-client.js"></script>
   ```

3. **Update JavaScript Code**

   Replace Firebase initialization code with:

   ```javascript
   // Old Firebase code (remove this)
   const firebaseConfig = { ... };
   firebase.initializeApp(firebaseConfig);
   let db = firebase.database();

   // New Backend API code (add this)
   const backendAPI = initializeBackend({
     apiUrl: 'http://localhost:3000/api',
     wsUrl: 'http://localhost:3000'
   });

   // Connect to backend
   backendAPI.connect(username || 'Anonymous').then(() => {
     console.log('Connected to custom backend');
     // Your code here
   }).catch(err => {
     console.error('Failed to connect to backend:', err);
   });

   // Use backendAPI.database() for Firebase-compatible API
   let db = backendAPI.database();
   ```

## Testing the Setup

### Test 1: Check Server is Running

Open your browser and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{"status":"ok","timestamp":1234567890}
```

### Test 2: Test Contact Form

1. Open your contact form page
2. Fill out and submit the form
3. Check the backend console - you should see the request logged
4. Verify in database:
   ```bash
   sqlite3 backend/data/database.db
   SELECT * FROM contact_messages;
   ```

### Test 3: Test Chat

1. Open your main page with chat
2. Send a message
3. Check backend console for WebSocket connection
4. Open another browser tab/window
5. Send a message from the second window
6. Both windows should see the message in real-time

## Viewing Contact Messages

### Method 1: Using SQLite CLI

```bash
cd backend
sqlite3 data/database.db
SELECT * FROM contact_messages ORDER BY timestamp DESC;
.exit
```

### Method 2: Using API

```bash
curl http://localhost:3000/api/contact
```

### Method 3: Using Database Browser

1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `backend/data/database.db`
3. Browse the `contact_messages` table

## Production Deployment

### Option 1: PM2 (Recommended for VPS/Server)

```bash
npm install -g pm2
cd backend
pm2 start server.js --name shs-backend
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### Option 2: Systemd Service (Linux)

Create `/etc/systemd/system/shs-backend.service`:

```ini
[Unit]
Description=SHS Game Hall Backend
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/backend
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable shs-backend
sudo systemctl start shs-backend
```

### Option 3: Docker

See `backend/README.md` for Docker setup.

## Troubleshooting

### "Cannot find module" errors
- Make sure you ran `npm install` in the `backend` folder
- Check that `node_modules` folder exists

### "Port 3000 already in use"
- Change PORT in `.env` file
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill
  ```

### CORS errors in browser
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- For development, you can set it to `*` (less secure)

### Database errors
- Make sure you ran `npm run init-db`
- Check that `backend/data` folder exists and is writable
- Check file permissions

### WebSocket connection fails
- Make sure backend server is running
- Check that `wsUrl` in frontend matches backend URL
- Check browser console for errors
- Verify Socket.io library is loaded

## Next Steps

1. ✅ Backend server running
2. ✅ Database initialized
3. ✅ Frontend updated to use backend API
4. ✅ Test all features (contact, chat, etc.)
5. ⚠️ Remove Firebase SDK references from all HTML files
6. ⚠️ Update privacy policy to remove Firebase mentions
7. ⚠️ Deploy to production server

## Support

If you encounter issues:
1. Check backend console for error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Make sure all dependencies are installed

