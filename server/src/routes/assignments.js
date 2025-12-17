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
 * CREATE assignment (Teacher only)
 */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden' });
    }

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

    // Phase 1 (existing behavior)
    await Student.updateMany(
      { _id: { $in: studentIds } },
      {
        $addToSet: {
          assignments: assignment._id,
          // Phase 2 (NEW)
          assignmentProgress: {
            assignment: assignment._id,
            status: 'assigned',
          },
        },
      }
    );

    res.json(assignment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

/**
 * DELETE assignment (Teacher only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const assignmentId = req.params.id;

    await Assignment.findByIdAndDelete(assignmentId);

    // Cleanup (safe)
    await Student.updateMany(
      {},
      {
        $pull: {
          assignments: assignmentId,
          assignmentProgress: { assignment: assignmentId },
        },
      }
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Delete failed' });
  }
});

/**
 * PHASE 2: GRADE assignment (Teacher only)
 */
router.post('/:id/grade', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const assignmentId = req.params.id;
    const { grades } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    for (const g of grades) {
      if (g.marks > assignment.maxMarks) {
        return res.status(400).json({
          error: `Marks cannot exceed max marks (${assignment.maxMarks})`,
        });
      }

      await Student.updateOne(
        {
          _id: g.studentId,
          'assignmentProgress.assignment': assignmentId,
        },
        {
          $set: {
            'assignmentProgress.$.status': 'completed',
            'assignmentProgress.$.marks': g.marks,
            'assignmentProgress.$.gradedAt': new Date(),
            'assignmentProgress.$.gradedBy': req.user._id,
          },
        }
      );
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
});


module.exports = router;
