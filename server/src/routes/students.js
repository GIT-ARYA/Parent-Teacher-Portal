const express = require('express');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * CREATE STUDENT
 * Ensures parent user + guardian link ALWAYS exist
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

    // 🔐 Ensure parent user always exists & matches shown password
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
        // keep login credentials in sync
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

      // existing UI fields (unchanged)
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
 * Parent sees only their children
 * Auto-fixes old students missing guardian links
 */
router.get('/', auth, async (req, res) => {
  try {
    let students;

    if (req.user.role === 'parent') {
      students = await Student.find({ guardians: req.user._id });
    } else {
      students = await Student.find({});
    }

    // 🔁 Auto-heal legacy students (NO UI change)
    for (const student of students) {
      if (
        student.parentEmail &&
        (!student.guardians || student.guardians.length === 0)
      ) {
        const parentUser = await User.findOne({
          email: student.parentEmail,
          role: 'parent',
        });

        if (parentUser) {
          student.guardians = [parentUser._id];
          await student.save();
        }
      }
    }

    const populated = await Student.find(
      req.user.role === 'parent'
        ? { guardians: req.user._id }
        : {}
    )
      .populate('guardians', 'name email')
      .populate('assignments');

    res.json(populated);
  } catch (err) {
    console.error('List students error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET SINGLE STUDENT
 */
router.get('/:id', auth, async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('guardians', 'name email')
    .populate('assignments');

  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json(student);
});

/**
 * DELETE STUDENT
 */
router.delete('/:id', auth, async (req, res) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
