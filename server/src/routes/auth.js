const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // 🔧 FIX: reconcile parent password if user exists but hash mismatch
    if (user && user.role === 'parent') {
      const student = await Student.findOne({
        parentEmail: normalizedEmail,
      });

      if (student?.parentPassword) {
        const matches = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!matches && password === student.parentPassword) {
          // 🔁 repair hash ONCE
          user.passwordHash = await bcrypt.hash(password, 10);
          await user.save();
        }
      }
    }

    // Normal auth flow
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
