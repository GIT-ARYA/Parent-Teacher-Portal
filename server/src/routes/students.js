const express = require('express');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');
const router = express.Router();

/**
 * POST /api/students
 * Create a student (teacher or admin)
 */
router.post('/', auth, async (req, res) => {
  try {
    if (!['teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      className: req.body.className,
      rollNumber: req.body.rollNumber,
      dob: req.body.dob ? new Date(req.body.dob) : undefined,
      guardians: req.body.guardians || []
    };

    const student = await Student.create(payload);
    res.json(student);
  } catch (err) {
    console.error('Create student error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/students
 */
router.get('/', auth, async (req, res) => {
  try {
    const q = {};
    if (req.query.className) q.className = req.query.className;
    if (req.query.guardianId) q.guardians = req.query.guardianId;
    if (req.query.behaviourTag) q['behaviourNotes.tag'] = req.query.behaviourTag;

    const students = await Student.find(q)
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
