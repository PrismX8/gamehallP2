# Quick Start Guide - Custom Backend

Get your custom backend up and running in 5 minutes!

## Windows Users

### Step 1: Install Backend
Double-click `backend/install.bat` or run in command prompt:
```cmd
cd backend
install.bat
```

### Step 2: Start Server
Double-click `backend/start.bat` or run:
```cmd
cd backend
npm start
```

## Mac/Linux Users

### Step 1: Install Backend
```bash
cd backend
chmod +x install.sh
./install.sh
```

### Step 2: Start Server
```bash
cd backend
chmod +x start.sh
./start.sh
```

Or use npm directly:
```bash
cd backend
npm start
```

## Manual Installation (All Platforms)

If the scripts don't work, follow these steps:

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `backend/.env` and set:
```env
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start Server
```bash
npm start
```

## Verify It's Working

Open your browser and go to:
```
http://localhost:3000/api/health
```

You should see:
```json
{"status":"ok","timestamp":1234567890}
```

## Next Steps

1. ✅ Backend is running
2. 📝 Update your HTML files (see MIGRATION_GUIDE.md)
3. 🧪 Test your website
4. 🚀 Deploy to production

## Troubleshooting

**Port 3000 already in use?**
- Change `PORT=3000` to `PORT=3001` in `backend/.env`
- Update frontend API URL to match

**Can't connect from frontend?**
- Check `CORS_ORIGIN` in `backend/.env` matches your frontend URL
- For development, you can set it to `*` (less secure)

**Database errors?**
- Make sure you ran `npm run init-db`
- Check that `backend/data` folder exists

For more help, see `SETUP_BACKEND.md` or `MIGRATION_GUIDE.md`.

