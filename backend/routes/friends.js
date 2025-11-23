const express = require('express');
const router = express.Router();
const { Friend, UserProfile } = require('../database/models');

// Store io instance (set by server.js)
let ioInstance = null;

// Function to set io instance
function setIO(io) {
  ioInstance = io;
}

// Helper to find socket by visitorId
function findSocketByVisitorId(visitorId) {
  if (!ioInstance) return null;
  return Array.from(ioInstance.sockets.sockets.values())
    .find(s => s.visitorId === visitorId);
}

// Get all friends for a user
router.get('/:userId', async (req, res) => {
  try {
    const friends = await Friend.getAll(req.params.userId);
    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Add a friend
router.post('/', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and Friend ID are required' });
    }
    await Friend.add(userId, friendId);
    
    // Emit socket events for real-time updates
    if (ioInstance) {
      const userSocket = findSocketByVisitorId(userId);
      const friendSocket = findSocketByVisitorId(friendId);
      
      if (userSocket) {
        userSocket.emit('friend:added', { userId, friendId });
      }
      if (friendSocket) {
        friendSocket.emit('friend:added', { userId: friendId, friendId: userId });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Failed to add friend' });
  }
});

// Remove a friend
router.delete('/', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and Friend ID are required' });
    }
    await Friend.remove(userId, friendId);
    
    // Emit socket events for real-time updates
    if (ioInstance) {
      const userSocket = findSocketByVisitorId(userId);
      const friendSocket = findSocketByVisitorId(friendId);
      
      if (userSocket) {
        userSocket.emit('friend:removed', { userId, friendId });
      }
      if (friendSocket) {
        friendSocket.emit('friend:removed', { userId: friendId, friendId: userId });
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const profile = await UserProfile.get(req.params.userId);
    res.json(profile || null);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Set user profile
router.post('/profile', async (req, res) => {
  try {
    const { userId, profile } = req.body;
    if (!userId || !profile) {
      return res.status(400).json({ error: 'User ID and profile are required' });
    }
    await UserProfile.set(userId, profile);
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting profile:', error);
    res.status(500).json({ error: 'Failed to set profile' });
  }
});

module.exports = { router, setIO };

