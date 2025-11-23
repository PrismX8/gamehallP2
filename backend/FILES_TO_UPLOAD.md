# Backend Files to Upload

## ✅ Files You MUST Upload

### Core Files (Required)
- `server.js` - Main server file
- `package.json` - Dependencies list
- `package-lock.json` - Locked dependency versions

### Database Files (Required)
- `database/db.js` - Database connection
- `database/models.js` - Database models
- `scripts/init-database.js` - Database initialization script

### Routes (Required)
- `routes/canvas.js` - Canvas API routes
- `routes/contact.js` - Contact form routes
- `routes/friends.js` - Friends system routes
- `routes/moderation.js` - Moderation routes
- `routes/visitors.js` - Visitor tracking routes

### Socket Handlers (Required)
- `socket/handlers.js` - WebSocket event handlers

### Data Directory (Required - but empty is OK)
- `data/` folder (create it if it doesn't exist)
- ⚠️ **Don't upload** `data/database.db` - it will be created automatically

### Optional but Recommended
- `README.md` - Documentation
- `.gitignore` - Git ignore rules

---

## ❌ Files You Should NOT Upload

### Don't Upload These:
- `node_modules/` - Will be installed automatically by `npm install`
- `.env` - Contains secrets (create new one on hosting platform)
- `data/database.db` - Database file (will be created fresh)
- `data/*.db-journal` - Database journal files
- `logs/` - Log files
- `*.log` - Log files
- `Dockerfile` - Only needed for Docker deployments
- `fly.toml` - Only needed for Fly.io
- `install.bat` / `install.sh` - Installation scripts (not needed)
- `start.bat` / `start.sh` - Start scripts (not needed)

---

## 📦 Quick Upload Checklist

When uploading to Replit (or any hosting service), upload these folders/files:

```
backend/
├── server.js                    ✅ UPLOAD
├── package.json                 ✅ UPLOAD
├── package-lock.json            ✅ UPLOAD
├── database/
│   ├── db.js                    ✅ UPLOAD
│   └── models.js                ✅ UPLOAD
├── routes/
│   ├── canvas.js                ✅ UPLOAD
│   ├── contact.js               ✅ UPLOAD
│   ├── friends.js               ✅ UPLOAD
│   ├── moderation.js            ✅ UPLOAD
│   └── visitors.js              ✅ UPLOAD
├── socket/
│   └── handlers.js              ✅ UPLOAD
├── scripts/
│   └── init-database.js         ✅ UPLOAD
└── data/                        ✅ CREATE EMPTY FOLDER
    └── (empty - database will be created)
```

---

## 🚀 After Uploading

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Initialize database (first time only):**
   ```bash
   npm run init-db
   ```

3. **Set environment variables:**
   - Create `.env` file with:
     ```
     PORT=3000
     CORS_ORIGIN=*
     NODE_ENV=production
     ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Or just click "Run" in Replit

---

## 📝 Minimum Required Files

If you want the absolute minimum, you need:
1. `server.js`
2. `package.json`
3. `database/` folder (with `db.js` and `models.js`)
4. `routes/` folder (all route files)
5. `socket/` folder (with `handlers.js`)
6. `scripts/init-database.js` (for first-time setup)
7. Empty `data/` folder

That's it! Everything else will be installed or created automatically.

