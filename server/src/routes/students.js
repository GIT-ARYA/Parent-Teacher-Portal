const express = require('express');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * CREATE STUDENT + ENSURE PARENT LOGIN WORKS
 */
router.post('/', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      firstName,
      lastName,
      className,
      rollNumber,
      dob,
      parentName,
      parentEmail,
      parentPassword,
    } = req.body;

    let parentUser = null;

    // 🔐 ALWAYS sync parent user
    if (parentEmail && parentPassword) {
      parentUser = await User.findOne({ email: parentEmail });

      const passwordHash = await bcrypt.hash(parentPassword, 10);

      if (!parentUser) {
        parentUser = await User.create({
          name: parentName || 'Parent',
          email: parentEmail,
          passwordHash,
          role: 'parent',
        });
      } else {
        // 🔁 update password so login always matches shown password
        parentUser.passwordHash = passwordHash;
        await parentUser.save();
      }
    }

    const student = await Student.create({
      firstName,
      lastName,
      className,
      rollNumber,
      dob: dob ? new Date(dob) : undefined,

      // UI-required fields (unchanged)
      parentName,
      parentEmail,
      parentPassword,

      guardians: parentUser ? [parentUser._id] : [],
    });

    res.json(student);
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET STUDENTS
 * Parent sees ONLY their children
 */
router.get('/', auth, async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'parent') {
      query.guardians = req.user._id;
    }

    const students = await Student.find(query)
      .populate('guardians', 'name email')
      .populate('assignments');

    res.json(students);
  } catch (err) {
    console.error('List students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('guardians', 'name email')
    .populate('assignments');

  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

router.delete('/:id', auth, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
