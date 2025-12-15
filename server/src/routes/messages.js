const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const MessageThread = require('../models/MessageThread');
const Student = require('../models/Student');

/**
 * GET /api/messages
 * Teacher: all student threads
 * Parent: only their children threads
 */
router.get('/', auth, async (req, res) => {
  try {
    let threads;

    if (req.user.role === 'teacher') {
      threads = await MessageThread.find()
        .populate('student', 'firstName lastName className parentEmail')
        .sort({ updatedAt: -1 });
    } else {
      // parent
      const students = await Student.find({
        parentEmail: req.user.email,
      }).select('_id');

      const studentIds = students.map((s) => s._id);

      threads = await MessageThread.find({
        student: { $in: studentIds },
      })
        .populate('student', 'firstName lastName className parentEmail')
        .sort({ updatedAt: -1 });
    }

    res.json(threads);
  } catch (err) {
    console.error('List messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/messages/send
 * Auto-create thread if missing
 */
router.post('/send', auth, async (req, res) => {
  try {
    const { studentId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Parent safety check
    if (
      req.user.role === 'parent' &&
      student.parentEmail !== req.user.email
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let thread = await MessageThread.findOne({ student: studentId });

    if (!thread) {
      thread = await MessageThread.create({
        student: studentId,
        messages: [],
      });
    }

    thread.messages.push({
      senderRole: req.user.role,
      text,
    });

    thread.updatedAt = new Date();
    await thread.save();

    const populated = await MessageThread.findById(thread._id).populate(
      'student',
      'firstName lastName className parentEmail'
    );

    res.json(populated);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
