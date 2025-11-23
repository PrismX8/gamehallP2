const express = require('express');
const router = express.Router();
const { VisitorStats, OnlineUser } = require('../database/models');

// Get total visitor count
router.get('/total', async (req, res) => {
  try {
    const count = await VisitorStats.get();
    res.json({ totalVisitors: count });
  } catch (error) {
    console.error('Error fetching visitor count:', error);
    res.status(500).json({ error: 'Failed to fetch visitor count' });
  }
});

// Increment visitor count
router.post('/increment', async (req, res) => {
  try {
    const count = await VisitorStats.increment();
    res.json({ totalVisitors: count });
  } catch (error) {
    console.error('Error incrementing visitor count:', error);
    res.status(500).json({ error: 'Failed to increment count' });
  }
});

// Set visitor count (admin)
router.post('/set', async (req, res) => {
  try {
    const { count } = req.body;
    if (typeof count !== 'number') {
      return res.status(400).json({ error: 'Count must be a number' });
    }
    await VisitorStats.set(count);
    res.json({ success: true, totalVisitors: count });
  } catch (error) {
    console.error('Error setting visitor count:', error);
    res.status(500).json({ error: 'Failed to set count' });
  }
});

// Get online users
router.get('/online', async (req, res) => {
  try {
    const users = await OnlineUser.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

module.exports = router;

