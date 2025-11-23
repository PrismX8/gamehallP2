const db = require('./db');

// Contact Messages
const ContactMessage = {
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { id, name, email, subject, message, timestamp, date } = data;
      const sql = `INSERT INTO contact_messages (id, name, email, subject, message, timestamp, date) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.getDb().run(sql, [id, name, email, subject, message, timestamp, date], function(err) {
        if (err) reject(err);
        else resolve({ id, ...data });
      });
    });
  },
  
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM contact_messages ORDER BY timestamp DESC`;
      db.getDb().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  getById: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM contact_messages WHERE id = ?`;
      db.getDb().get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// Chat Messages
const ChatMessage = {
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { id, user, text, color, time, uid, avatar, avatarImage, reactions } = data;
      const reactionsStr = reactions ? JSON.stringify(reactions) : null;
      const sql = `INSERT INTO chat_messages (id, user, text, color, time, uid, avatar, avatarImage, reactions) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.getDb().run(sql, [id, user, text, color, time, uid, avatar, avatarImage, reactionsStr], function(err) {
        if (err) reject(err);
        else resolve({ id, ...data });
      });
    });
  },
  
  getRecent: (limit = 50) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT *, reactions FROM chat_messages ORDER BY time DESC LIMIT ?`;
      db.getDb().all(sql, [limit], (err, rows) => {
        if (err) reject(err);
        else {
          const messages = rows.map(row => ({
            ...row,
            reactions: row.reactions ? JSON.parse(row.reactions) : {}
          }));
          resolve(messages.reverse()); // Return in chronological order
        }
      });
    });
  },
  
  updateReactions: (id, reactions) => {
    return new Promise((resolve, reject) => {
      const reactionsStr = JSON.stringify(reactions);
      const sql = `UPDATE chat_messages SET reactions = ? WHERE id = ?`;
      db.getDb().run(sql, [reactionsStr, id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  delete: (id) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM chat_messages WHERE id = ?`;
      db.getDb().run(sql, [id], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  deleteAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM chat_messages`;
      db.getDb().run(sql, [], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Online Users
const OnlineUser = {
  setOnline: (visitorId, username) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const sql = `INSERT OR REPLACE INTO online_users (visitor_id, username, online, timestamp) 
                   VALUES (?, ?, 1, ?)`;
      db.getDb().run(sql, [visitorId, username, timestamp], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  setOffline: (visitorId) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const sql = `UPDATE online_users SET online = 0, last_seen = ? WHERE visitor_id = ?`;
      db.getDb().run(sql, [timestamp, visitorId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM online_users WHERE online = 1`;
      db.getDb().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  cleanup: (maxAge = 3600000) => { // Remove users offline for more than 1 hour
    return new Promise((resolve, reject) => {
      const cutoff = Date.now() - maxAge;
      const sql = `DELETE FROM online_users WHERE online = 0 AND last_seen < ?`;
      db.getDb().run(sql, [cutoff], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Visitor Stats
const VisitorStats = {
  increment: () => {
    return new Promise((resolve, reject) => {
      db.getDb().run(
        `UPDATE visitor_stats SET total_visitors = total_visitors + 1, updated_at = CURRENT_TIMESTAMP`,
        function(err) {
          if (err) reject(err);
          else VisitorStats.get().then(resolve).catch(reject);
        }
      );
    });
  },
  
  get: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT total_visitors FROM visitor_stats LIMIT 1`;
      db.getDb().get(sql, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total_visitors : 0);
      });
    });
  },
  
  set: (count) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE visitor_stats SET total_visitors = ?, updated_at = CURRENT_TIMESTAMP`;
      db.getDb().run(sql, [count], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Banned Users
const BannedUser = {
  create: (data) => {
    return new Promise((resolve, reject) => {
      const { uid, username, reason, banned_by, banned_at, expires_at } = data;
      const sql = `INSERT OR REPLACE INTO banned_users (uid, username, reason, banned_by, banned_at, expires_at) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.getDb().run(sql, [uid, username, reason, banned_by, banned_at, expires_at], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM banned_users WHERE expires_at IS NULL OR expires_at > ?`;
      db.getDb().all(sql, [Date.now()], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  isBanned: (uid) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM banned_users WHERE uid = ? AND (expires_at IS NULL OR expires_at > ?)`;
      db.getDb().get(sql, [uid, Date.now()], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  },
  
  remove: (uid) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM banned_users WHERE uid = ?`;
      db.getDb().run(sql, [uid], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Moderation Settings
const ModerationSettings = {
  get: (key) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT value FROM moderation_settings WHERE key = ?`;
      db.getDb().get(sql, [key], (err, row) => {
        if (err) reject(err);
        else resolve(row ? JSON.parse(row.value) : null);
      });
    });
  },
  
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT key, value FROM moderation_settings`;
      db.getDb().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else {
          const settings = {};
          rows.forEach(row => {
            settings[row.key] = JSON.parse(row.value);
          });
          resolve(settings);
        }
      });
    });
  },
  
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      const valueStr = JSON.stringify(value);
      const sql = `INSERT OR REPLACE INTO moderation_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`;
      db.getDb().run(sql, [key, valueStr], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Profanity Words
const ProfanityWord = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT word FROM profanity_words`;
      db.getDb().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.word));
      });
    });
  },
  
  add: (word) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR IGNORE INTO profanity_words (word) VALUES (?)`;
      db.getDb().run(sql, [word], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  remove: (word) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM profanity_words WHERE word = ?`;
      db.getDb().run(sql, [word], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  setAll: (words) => {
    return new Promise((resolve, reject) => {
      db.getDb().run('DELETE FROM profanity_words', [], (err) => {
        if (err) {
          reject(err);
          return;
        }
        if (words.length === 0) {
          resolve();
          return;
        }
        const sql = `INSERT INTO profanity_words (word) VALUES (?)`;
        const stmt = db.getDb().prepare(sql);
        words.forEach(word => {
          stmt.run([word]);
        });
        stmt.finalize((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }
};

// Moderation Stats
const ModerationStats = {
  get: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM moderation_stats LIMIT 1`;
      db.getDb().get(sql, [], (err, row) => {
        if (err) reject(err);
        else {
          if (!row) {
            // Initialize if doesn't exist
            db.getDb().run('INSERT INTO moderation_stats (blocked_messages, banned_users) VALUES (0, 0)', (err) => {
              if (err) reject(err);
              else resolve({ blocked_messages: 0, banned_users: 0 });
            });
          } else {
            resolve({
              blocked_messages: row.blocked_messages || 0,
              banned_users: row.banned_users || 0
            });
          }
        }
      });
    });
  },
  
  update: (stats) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE moderation_stats SET blocked_messages = ?, banned_users = ?, updated_at = CURRENT_TIMESTAMP`;
      db.getDb().run(sql, [stats.blocked_messages || 0, stats.banned_users || 0], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Friends
const Friend = {
  add: (userId, friendId) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES (?, ?)`;
      db.getDb().run(sql, [userId, friendId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  remove: (userId, friendId) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`;
      db.getDb().run(sql, [userId, friendId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  getAll: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT friend_id FROM friends WHERE user_id = ?`;
      db.getDb().all(sql, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.friend_id));
      });
    });
  }
};

// User Profiles
const UserProfile = {
  get: (userId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM user_profiles WHERE user_id = ?`;
      db.getDb().get(sql, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM user_profiles ORDER BY updated_at DESC`;
      db.getDb().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  set: (userId, profile) => {
    return new Promise((resolve, reject) => {
      const { username, avatar, avatarImage, color, status } = profile;
      const sql = `INSERT OR REPLACE INTO user_profiles (user_id, username, avatar, avatarImage, color, status, updated_at) 
                   VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`;
      db.getDb().run(sql, [userId, username, avatar, avatarImage, color, status || null], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Canvas
const Canvas = {
  addStroke: (id, strokeData) => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR REPLACE INTO canvas_strokes (id, stroke_data) VALUES (?, ?)`;
      db.getDb().run(sql, [id, JSON.stringify(strokeData)], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  getAllStrokes: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, stroke_data FROM canvas_strokes ORDER BY created_at ASC`;
      db.getDb().all(sql, [], (err, rows) => {
        if (err) reject(err);
        else {
          const strokes = rows.map(row => ({
            id: row.id,
            ...JSON.parse(row.stroke_data)
          }));
          resolve(strokes);
        }
      });
    });
  },
  
  clear: () => {
    return new Promise((resolve, reject) => {
      db.getDb().run('DELETE FROM canvas_strokes', [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Typing Indicators
const TypingIndicator = {
  set: (visitorId, username) => {
    return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const sql = `INSERT OR REPLACE INTO typing_indicators (visitor_id, username, timestamp) VALUES (?, ?, ?)`;
      db.getDb().run(sql, [visitorId, username, timestamp], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  remove: (visitorId) => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM typing_indicators WHERE visitor_id = ?`;
      db.getDb().run(sql, [visitorId], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  
  getAll: () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT visitor_id, username FROM typing_indicators WHERE timestamp > ?`;
      const cutoff = Date.now() - 5000; // Only show typing from last 5 seconds
      db.getDb().all(sql, [cutoff], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  cleanup: () => {
    return new Promise((resolve, reject) => {
      const cutoff = Date.now() - 10000; // Remove typing indicators older than 10 seconds
      const sql = `DELETE FROM typing_indicators WHERE timestamp < ?`;
      db.getDb().run(sql, [cutoff], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = {
  ContactMessage,
  ChatMessage,
  OnlineUser,
  VisitorStats,
  BannedUser,
  ModerationSettings,
  ProfanityWord,
  ModerationStats,
  Friend,
  UserProfile,
  Canvas,
  TypingIndicator
};

