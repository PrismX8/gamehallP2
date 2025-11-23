# 🚀 Custom Backend for SHS Game Hall

Complete custom backend solution to replace Firebase with your own server.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [What's Included](#whats-included)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Migration Guide](#migration-guide)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

## ⚡ Quick Start

### Windows:
```cmd
cd backend
install.bat
start.bat
```

### Mac/Linux:
```bash
cd backend
chmod +x install.sh start.sh
./install.sh
./start.sh
```

### Manual:
```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm start
```

Server runs on `http://localhost:3000`

## 📦 What's Included

### Backend Server
- ✅ Node.js/Express REST API
- ✅ Socket.io for real-time features
- ✅ SQLite database (no external setup needed)
- ✅ All Firebase features replicated

### Frontend Client
- ✅ Firebase-compatible API wrapper
- ✅ Works with existing code (minimal changes)
- ✅ Automatic WebSocket management

### Documentation
- ✅ `SETUP_BACKEND.md` - Detailed setup
- ✅ `MIGRATION_GUIDE.md` - Migration steps
- ✅ `QUICK_START.md` - 5-minute guide
- ✅ `BACKEND_SUMMARY.md` - Complete overview

## 🔧 Installation

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)

### Step-by-Step

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy example file
   cp .env.example .env  # Mac/Linux
   copy .env.example .env  # Windows
   
   # Edit .env file
   PORT=3000
   CORS_ORIGIN=http://localhost:8080
   ```

3. **Initialize Database**
   ```bash
   npm run init-db
   ```

4. **Start Server**
   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

## ⚙️ Configuration

Edit `backend/.env`:

```env
# Server Port
PORT=3000

# Environment
NODE_ENV=development

# CORS - Set to your frontend URL
CORS_ORIGIN=http://localhost:8080
# For development, you can use: CORS_ORIGIN=*

# Database Path
DB_PATH=./data/database.db
```

## 🔄 Migration Guide

### Step 1: Update HTML Files

**Remove:**
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
```

**Add:**
```html
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>
<script src="backend-api-client.js"></script>
```

### Step 2: Update JavaScript

**Replace Firebase initialization:**
```javascript
// OLD
const firebaseConfig = { ... };
firebase.initializeApp(firebaseConfig);
let db = firebase.database();

// NEW
const backendAPI = initializeBackend({
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'http://localhost:3000'
});

backendAPI.connect(username || 'Anonymous').then(() => {
  let db = backendAPI.database(); // Firebase-compatible!
  // Your existing code works!
});
```

**See `MIGRATION_GUIDE.md` for complete details.**

## 📡 API Endpoints

### Contact Messages
- `POST /api/contact` - Create message
- `GET /api/contact` - List all messages
- `GET /api/contact/:id` - Get specific message

### Visitors
- `GET /api/visitors/total` - Get total count
- `POST /api/visitors/increment` - Increment count
- `GET /api/visitors/online` - Get online users

### Moderation
- `GET /api/moderation/banned` - List banned users
- `POST /api/moderation/banned` - Ban user
- `DELETE /api/moderation/banned/:uid` - Unban user
- `GET /api/moderation/settings` - Get settings
- `GET /api/moderation/profanity` - Get profanity words
- `GET /api/moderation/stats` - Get statistics

### Friends
- `GET /api/friends/:userId` - Get user's friends
- `POST /api/friends` - Add friend
- `DELETE /api/friends` - Remove friend

### Canvas
- `GET /api/canvas/strokes` - Get all strokes
- `POST /api/canvas/strokes` - Add stroke
- `DELETE /api/canvas/strokes` - Clear canvas

### Health Check
- `GET /api/health` - Server status

## 🔌 WebSocket Events

### Client → Server
- `chat:send` - Send chat message
- `chat:typing` - User is typing
- `chat:stop-typing` - User stopped typing
- `chat:reaction` - Add message reaction
- `canvas:stroke` - Send canvas stroke
- `canvas:clear` - Clear canvas

### Server → Client
- `chat:initial` - Initial chat messages
- `chat:message` - New chat message
- `chat:reaction` - Reaction updated
- `chat:typing` - Typing users list
- `visitors:online` - Online users
- `visitors:total` - Total visitor count
- `canvas:stroke` - New canvas stroke
- `canvas:clear` - Canvas cleared

## 💾 Database

SQLite database: `backend/data/database.db`

**View Contact Messages:**
```bash
sqlite3 backend/data/database.db
SELECT * FROM contact_messages ORDER BY timestamp DESC;
```

**Or use API:**
```bash
curl http://localhost:3000/api/contact
```

## 🚀 Production Deployment

### PM2 (Recommended)
```bash
npm install -g pm2
cd backend
pm2 start server.js --name shs-backend
pm2 save
pm2 startup
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Systemd (Linux)
See `SETUP_BACKEND.md` for systemd service setup.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
# Or kill process:
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -ti:3000 | xargs kill
```

### CORS Errors
Update `CORS_ORIGIN` in `.env` to match your frontend URL.

### Database Errors
```bash
npm run init-db
```

### Connection Refused
- Check server is running
- Verify port in `.env`
- Check firewall

### "initializeBackend is not defined"
Make sure `backend-api-client.js` is loaded before your script.

## 📚 Documentation Files

- **SETUP_BACKEND.md** - Detailed setup instructions
- **MIGRATION_GUIDE.md** - Complete migration guide
- **QUICK_START.md** - Quick 5-minute setup
- **BACKEND_SUMMARY.md** - Complete feature overview
- **backend/README.md** - Backend API documentation

## 🔒 Security Notes

For production, consider:
- ✅ Authentication/Authorization
- ✅ Rate limiting
- ✅ HTTPS/SSL
- ✅ Input validation
- ✅ Database backups
- ✅ Environment variable security
- ✅ Proper CORS configuration

## ✅ Features Implemented

- ✅ Contact form storage
- ✅ Real-time chat
- ✅ Online user tracking
- ✅ Visitor counter
- ✅ Moderation system
- ✅ Friends system
- ✅ Canvas/drawing
- ✅ Typing indicators
- ✅ Message reactions

## 🎯 Next Steps

1. ✅ Install backend
2. 📝 Migrate frontend (see `MIGRATION_GUIDE.md`)
3. 🧪 Test all features
4. 🔒 Add security measures
5. 🚀 Deploy to production

## 💡 Tips

- Use `npm run dev` for development (auto-reload)
- Check `backend/README.md` for API details
- Use database browser tools for easier data viewing
- Set up PM2 for production auto-restart
- Monitor server logs for issues

## 📞 Support

- Check documentation files for detailed guides
- Review error messages in console
- Verify all environment variables are set
- Test API endpoints directly

---

**You're all set! Your custom backend is ready to replace Firebase.** 🎉

