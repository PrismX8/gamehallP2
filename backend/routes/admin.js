const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Simple password protection (set ADMIN_PASSWORD in environment variables)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Middleware to check admin password
const checkAdmin = (req, res, next) => {
  const password = req.query.password || req.body.password || req.headers['x-admin-password'];
  
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Admin password required. Add ?password=YOUR_PASSWORD to the URL'
    });
  }
  next();
};

// Admin dashboard - overview
router.get('/', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    
    // Get counts for all tables
    const counts = {};
    
    const tables = [
      'contact_messages',
      'chat_messages',
      'online_users',
      'banned_users',
      'friends',
      'user_profiles',
      'canvas_strokes',
      'typing_indicators'
    ];
    
    for (const table of tables) {
      await new Promise((resolve, reject) => {
        database.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          if (err) {
            counts[table] = 0;
            resolve();
          } else {
            counts[table] = row.count;
            resolve();
          }
        });
      });
    }
    
    // Get visitor stats
    const visitorStats = await new Promise((resolve, reject) => {
      database.get('SELECT * FROM visitor_stats ORDER BY updated_at DESC LIMIT 1', (err, row) => {
        if (err) reject(err);
        else resolve(row || { total_visitors: 0 });
      });
    });
    
    res.json({
      message: 'Admin Dashboard',
      timestamp: Date.now(),
      counts,
      visitorStats,
      endpoints: {
        chat: '/api/admin/chat?password=YOUR_PASSWORD',
        contacts: '/api/admin/contacts?password=YOUR_PASSWORD',
        users: '/api/admin/users?password=YOUR_PASSWORD',
        friends: '/api/admin/friends?password=YOUR_PASSWORD',
        canvas: '/api/admin/canvas?password=YOUR_PASSWORD',
        banned: '/api/admin/banned?password=YOUR_PASSWORD',
        stats: '/api/admin/stats?password=YOUR_PASSWORD'
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all chat messages
router.get('/chat', checkAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM chat_messages ORDER BY time DESC LIMIT ? OFFSET ?',
      [limit, offset],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Database error', message: err.message });
        } else {
          res.json({
            count: rows.length,
            limit,
            offset,
            messages: rows.map(row => ({
              ...row,
              reactions: row.reactions ? JSON.parse(row.reactions) : null
            }))
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all contact messages
router.get('/contacts', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM contact_messages ORDER BY timestamp DESC',
      [],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Database error', message: err.message });
        } else {
          res.json({
            count: rows.length,
            messages: rows
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all user profiles
router.get('/users', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM user_profiles ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Database error', message: err.message });
        } else {
          res.json({
            count: rows.length,
            users: rows
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all friends relationships
router.get('/friends', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM friends ORDER BY created_at DESC',
      [],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Database error', message: err.message });
        } else {
          res.json({
            count: rows.length,
            friendships: rows
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get canvas strokes
router.get('/canvas', checkAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM canvas_strokes ORDER BY created_at DESC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Database error', message: err.message });
        } else {
          res.json({
            count: rows.length,
            limit,
            strokes: rows.map(row => ({
              id: row.id,
              stroke_data: JSON.parse(row.stroke_data),
              created_at: row.created_at
            }))
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get banned users
router.get('/banned', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    
    database.all(
      'SELECT * FROM banned_users ORDER BY banned_at DESC',
      [],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: 'Database error', message: err.message });
        } else {
          res.json({
            count: rows.length,
            banned: rows
          });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get statistics
router.get('/stats', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    
    const stats = {};
    
    // Get all counts
    const tables = [
      'contact_messages',
      'chat_messages',
      'online_users',
      'banned_users',
      'friends',
      'user_profiles',
      'canvas_strokes'
    ];
    
    for (const table of tables) {
      await new Promise((resolve) => {
        database.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
          stats[table] = row ? row.count : 0;
          resolve();
        });
      });
    }
    
    // Get visitor stats
    database.get('SELECT * FROM visitor_stats ORDER BY updated_at DESC LIMIT 1', (err, row) => {
      if (err) {
        stats.visitor_stats = { total_visitors: 0 };
      } else {
        stats.visitor_stats = row || { total_visitors: 0 };
      }
      
      // Get moderation stats
      database.get('SELECT * FROM moderation_stats ORDER BY updated_at DESC LIMIT 1', (err, row) => {
        if (err) {
          stats.moderation_stats = { blocked_messages: 0, banned_users: 0 };
        } else {
          stats.moderation_stats = row || { blocked_messages: 0, banned_users: 0 };
        }
        
        res.json({
          timestamp: Date.now(),
          stats
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Download database (returns JSON of all data)
router.get('/export', checkAdmin, async (req, res) => {
  try {
    const database = db.getDb();
    const exportData = {};
    
    const tables = [
      'contact_messages',
      'chat_messages',
      'online_users',
      'banned_users',
      'friends',
      'user_profiles',
      'canvas_strokes',
      'visitor_stats',
      'moderation_stats',
      'moderation_settings',
      'profanity_words'
    ];
    
    for (const table of tables) {
      await new Promise((resolve) => {
        database.all(`SELECT * FROM ${table}`, [], (err, rows) => {
          if (!err) {
            exportData[table] = rows || [];
          }
          resolve();
        });
      });
    }
    
    res.json({
      export_date: new Date().toISOString(),
      data: exportData
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;

