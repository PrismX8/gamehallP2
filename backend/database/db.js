const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/database.db');

let db = null;

// Initialize database and create tables
function init() {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
      createTables().then(resolve).catch(reject);
    });
  });
}

// Create all necessary tables
function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      // Contact messages
      `CREATE TABLE IF NOT EXISTS contact_messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Chat messages
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        user TEXT NOT NULL,
        text TEXT NOT NULL,
        color TEXT,
        time INTEGER NOT NULL,
        uid TEXT NOT NULL,
        avatar TEXT,
        avatarImage TEXT,
        reactions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Online users
      `CREATE TABLE IF NOT EXISTS online_users (
        visitor_id TEXT PRIMARY KEY,
        username TEXT,
        online INTEGER DEFAULT 1,
        timestamp INTEGER NOT NULL,
        last_seen INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Visitor count
      `CREATE TABLE IF NOT EXISTS visitor_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_visitors INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Banned users
      `CREATE TABLE IF NOT EXISTS banned_users (
        uid TEXT PRIMARY KEY,
        username TEXT,
        reason TEXT,
        banned_by TEXT,
        banned_at INTEGER NOT NULL,
        expires_at INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Moderation settings
      `CREATE TABLE IF NOT EXISTS moderation_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Profanity words
      `CREATE TABLE IF NOT EXISTS profanity_words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Moderation stats
      `CREATE TABLE IF NOT EXISTS moderation_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blocked_messages INTEGER DEFAULT 0,
        banned_users INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Friends
      `CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        friend_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )`,
      
      // User profiles
      `CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        avatar TEXT,
        avatarImage TEXT,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Canvas strokes
      `CREATE TABLE IF NOT EXISTS canvas_strokes (
        id TEXT PRIMARY KEY,
        stroke_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Canvas meta
      `CREATE TABLE IF NOT EXISTS canvas_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Typing indicators
      `CREATE TABLE IF NOT EXISTS typing_indicators (
        visitor_id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach((sql) => {
      db.run(sql, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          reject(err);
          return;
        }
        completed++;
        if (completed === total) {
          // Initialize visitor stats if empty
          db.get('SELECT * FROM visitor_stats LIMIT 1', (err, row) => {
            if (!row) {
              db.run('INSERT INTO visitor_stats (total_visitors) VALUES (0)', (err) => {
                if (err) console.error('Error initializing visitor stats:', err);
                resolve();
              });
            } else {
              resolve();
            }
          });
        }
      });
    });
  });
}

// Get database instance
function getDb() {
  return db;
}

// Close database connection
function close() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  init,
  getDb,
  close
};

