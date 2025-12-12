const express = require('express');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/students
 * Create student + auto-create parent account
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

    // ✅ Create / reuse parent account
    if (parentEmail && parentPassword) {
      parentUser = await User.findOne({ email: parentEmail });

      if (!parentUser) {
        const passwordHash = await bcrypt.hash(parentPassword, 10);

        parentUser = await User.create({
          name: parentName || 'Parent',
          email: parentEmail,
          passwordHash,
          role: 'parent',
        });
      }
    }

    // ✅ Create student (KEEP existing fields for UI)
    const student = await Student.create({
      firstName,
      lastName,
      className,
      rollNumber,
      dob: dob ? new Date(dob) : undefined,

      // existing UI-dependent fields (DO NOT REMOVE)
      parentName,
      parentEmail,
      parentPassword,

      // real relationship
      guardians: parentUser ? [parentUser._id] : [],
    });

    res.json(student);
  } catch (err) {
    console.error('Create student error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/students
 */
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find()
      .limit(500)
      .populate('guardians', 'name email')
      .populate('assignments');

    res.json(students);
  } catch (err) {
    console.error('List students error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/students/:id
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('guardians', 'name email')
      .populate('assignments');

    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json(student);
  } catch (err) {
    console.error('Get student error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/students/:id
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Student not found' });

    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;
