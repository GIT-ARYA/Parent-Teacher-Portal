// server/src/routes/messages.js
const express = require('express');
const Thread = require('../models/MessageThread');
const { auth } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/messages
 * List threads for current user
 */
router.get('/', auth, async (req, res) => {
  try {
    const threads = await Thread.find({ participants: req.user._id })
      .populate('participants', 'name email')
      .populate('student', 'firstName lastName');
    res.json(threads);
  } catch (err) {
    console.error('List threads error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/messages/thread
 * Create or return existing thread between a set of participants (and optional student link)
 * Body: { participantIds: [id1,id2], studentId }
 */
router.post('/thread', auth, async (req, res) => {
  try {
    const { participantIds = [], studentId } = req.body;
    if (!Array.isArray(participantIds) || participantIds.length < 1) {
      return res.status(400).json({ error: 'participantIds must be an array of user ids' });
    }

    // Try to find an existing thread with same participants and same student
    let thread = await Thread.findOne({
      student: studentId || null,
      participants: { $all: participantIds, $size: participantIds.length }
    });

    if (!thread) {
      thread = await Thread.create({ participants: participantIds, student: studentId || undefined, messages: [] });
    }

    await thread.populate('participants', 'name email').populate('student', 'firstName lastName');
    res.json(thread);
  } catch (err) {
    console.error('Create/get thread error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/messages/:threadId/message
 * Post a message into a thread
 * Body: { body: "text" }
 */
router.post('/:threadId/message', auth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message body required' });

    const thread = await Thread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    // ensure current user is participant
    const isParticipant = thread.participants.some(p => p.toString() === req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ error: 'Not a thread participant' });

    const msg = { sender: req.user._id, body, timestamp: new Date() };
    thread.messages.push(msg);
    await thread.save();

    const populated = await Thread.findById(thread._id).populate('participants', 'name email').populate('student', 'firstName lastName');
    res.json(populated);
  } catch (err) {
    console.error('Post message error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
