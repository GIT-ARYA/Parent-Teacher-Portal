const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// 🔍 Find user by email (used for messaging)
router.get('/by-email/:email', auth, async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error('Find user by email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
