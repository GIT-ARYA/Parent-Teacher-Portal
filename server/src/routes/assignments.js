// server/src/routes/assignments.js
const express = require('express');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * POST /api/assignments
 * Create assignment (teacher/admin)
 * Body: { title, subject, description, assignedTo: [studentIds], dueDate }
 */
router.post('/', auth, requireRole('teacher'), async (req, res) => {
  try {
    const payload = {
      title: req.body.title,
      subject: req.body.subject,
      description: req.body.description,
      assignedBy: req.user._id,
      assignedTo: req.body.assignedTo || [],
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
    };
    const a = await Assignment.create(payload);
    // Optionally push assignment id into students.assignments
    if (payload.assignedTo.length) {
      await Student.updateMany(
        { _id: { $in: payload.assignedTo } },
        { $addToSet: { assignments: a._id } }
      );
    }
    res.json(a);
  } catch (err) {
    console.error('Create assignment error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PATCH /api/assignments/:id/grade
 * Add a grade entry (teacher/admin)
 * Body: { studentId, score, remarks }
 */
router.patch('/:id/grade', auth, requireRole('teacher'), async (req, res) => {
  try {
    const { studentId, score, remarks } = req.body;
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });
    a.grades.push({ student: studentId, score, remarks });
    await a.save();
    res.json(a);
  } catch (err) {
    console.error('Grade assignment error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/assignments
 * List assignments (optional ?studentId= & ?subject=)
 */
router.get('/', auth, async (req, res) => {
  try {
    const q = {};
    if (req.query.studentId) q.assignedTo = req.query.studentId;
    if (req.query.subject) q.subject = req.query.subject;
    const list = await Assignment.find(q).populate('assignedBy', 'name email').populate('assignedTo', 'firstName lastName');
    res.json(list);
  } catch (err) {
    console.error('List assignments error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
