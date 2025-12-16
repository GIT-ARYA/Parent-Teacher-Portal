const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

/**
 * GET assignments
 * Teacher → all
 * Parent → only their children
 */
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const list = await Assignment.find()
        .populate('assignedTo', 'firstName lastName')
        .sort({ createdAt: -1 });

      return res.json(list);
    }

    // Parent
    const students = await Student.find({
      parentEmail: req.user.email,
    }).select('_id');

    const ids = students.map(s => s._id);

    const list = await Assignment.find({
      assignedTo: { $in: ids },
    })
      .populate('assignedTo', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load assignments' });
  }
});

/**
 * CREATE assignment
 */
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      subject,
      description,
      dueDate,
      maxMarks,
      studentIds,
    } = req.body;

    const assignment = await Assignment.create({
      title,
      subject,
      description,
      dueDate,
      maxMarks,
      assignedTo: studentIds,
      createdBy: req.user._id,
    });

    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $addToSet: { assignments: assignment._id } }
    );

    res.json(assignment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * DELETE assignment
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
