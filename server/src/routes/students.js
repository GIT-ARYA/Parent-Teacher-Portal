const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

/**
 * GET all students
 */
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load students' });
  }
});

/**
 * GET single student (DETAIL VIEW)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      // ✅ THIS IS THE FIX
      .populate('assignmentProgress.assignment');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load student' });
  }
});

module.exports = router;
