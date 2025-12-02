// server/src/routes/students.js
const express = require('express');
const Student = require('../models/Student');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * POST /api/students
 * Create a student (teacher or admin)
 * Body: { firstName, lastName, className, rollNumber, dob, guardians: [guardianId,...] }
 */
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const payload = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      className: req.body.className,
      rollNumber: req.body.rollNumber,
      dob: req.body.dob ? new Date(req.body.dob) : undefined,
      guardians: req.body.guardians || []
    };
    const s = await Student.create(payload);
    res.json(s);
  } catch (err) {
    console.error('Create student error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/students
 * List students with optional filters:
 * ?className=7A&guardianId=<id>&behaviourTag=<tag>
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
 * Get student detail
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const s = await Student.findById(req.params.id)
      .populate('guardians', 'name email')
      .populate('assignments');
    if (!s) return res.status(404).json({ error: 'Not found' });
    res.json(s);
  } catch (err) {
    console.error('Get student error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
