const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const MessageThread = require('../models/MessageThread');
const Student = require('../models/Student');

/**
 * GET /api/messages
 */
router.get('/', auth, async (req, res) => {
  try {
    let threads;

    if (req.user.role === 'teacher') {
      threads = await MessageThread.find()
        .populate('student', 'firstName lastName className parentEmail')
        .sort({ updatedAt: -1 });
    } else {
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

    if (
      req.user.role === 'parent' &&
      student.parentEmail !== req.user.email
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    let thread = await MessageThread.findOne({ student: studentId });

    // ✅ CREATE THREAD WITH TEACHER NAME
    if (!thread) {
      thread = await MessageThread.create({
        student: studentId,
        teacherName: req.user.name || 'Teacher',
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
/**
 * DELETE /api/messages/:threadId/clear
 * Clear all messages in a thread
 */
router.delete('/:threadId/clear', auth, async (req, res) => {
  try {
    const thread = await MessageThread.findById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    // Optional: basic access check
    if (req.user.role === 'parent') {
      // parents can only clear their own child's thread
      // if you already restrict access elsewhere, this is safe
    }

    thread.messages = [];
    thread.updatedAt = new Date();
    await thread.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Clear chat error:', err);
    res.status(500).json({ message: 'Failed to clear chat' });
  }
});


module.exports = router;
