# Fix "EADDRINUSE: address already in use" Error in Replit

## The Problem
Port 5000 is already in use. This usually happens when:
- Another process is running on port 5000
- A previous server instance didn't stop properly
- Replit has another service running

## Quick Fix

### Option 1: Stop All Running Processes (Recommended)

1. **Stop the current process:**
   - Click the **"Stop"** button in Replit (square icon)
   - Wait a few seconds

2. **Kill any processes using port 5000:**
   In the Replit shell, run:
   ```bash
   pkill -f node
   ```
   Or:
   ```bash
   killall node
   ```

3. **Start fresh:**
   - Click **"Run"** again
   - The server should start on port 5000

### Option 2: Use a Different Port

1. **Go to Secrets tab** (lock icon in sidebar)

2. **Add/Update PORT secret:**
   - Key: `PORT`
   - Value: `3000` (or any other available port)

3. **Restart the server:**
   - Click "Stop" then "Run"

### Option 3: Let Replit Handle It Automatically

1. **Remove PORT from Secrets** (if you added it)
   - Delete the `PORT` secret

2. **Replit will automatically use port 5000**
   - Just click "Run"
   - Replit handles the port automatically

## Recommended Solution

**For Replit, you don't need to set PORT manually.** Replit automatically uses port 5000 and exposes it.

**Steps:**
1. Click **"Stop"** button
2. Wait 2-3 seconds
3. Click **"Run"** button
4. Replit will automatically use port 5000

Your backend URL will be: `https://your-app-name.repl.co`

## Verify It's Working

After starting, check the console output. You should see:
```
🚀 Backend server running on 0.0.0.0:5000
📡 Socket.io server ready for connections
```

Then test: `https://your-app-name.repl.co/api/health`

