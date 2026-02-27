const express = require('express');
const router = express.Router();

const { auth } = require('../middleware/auth');
const Meeting = require('../models/Meeting');
const Student = require('../models/Student');

function canAccessStudent(user, student) {
  if (!student) return false;
  if (user.role === 'teacher' || user.role === 'admin') return true;
  if (user.role === 'parent') {
    return (student.parentEmail || '').toLowerCase() === (user.email || '').toLowerCase();
  }
  return false;
}

router.get('/', auth, async (req, res) => {
  try {
    let meetings;

    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      meetings = await Meeting.find()
        .populate('student', 'firstName lastName className parentEmail')
        .sort({ startsAt: 1 });
    } else if (req.user.role === 'parent') {
      const students = await Student.find({
        parentEmail: req.user.email,
      }).select('_id');

      const studentIds = students.map((s) => s._id);

      meetings = await Meeting.find({ student: { $in: studentIds } })
        .populate('student', 'firstName lastName className parentEmail')
        .sort({ startsAt: 1 });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(meetings);
  } catch (err) {
    console.error('List meetings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { studentId, title, agenda, startsAt, durationMinutes, meetingLink } = req.body;

    if (!studentId || !title || !startsAt) {
      return res.status(400).json({ error: 'studentId, title and startsAt are required' });
    }

    const student = await Student.findById(studentId);
    if (!canAccessStudent(req.user, student)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const meeting = await Meeting.create({
      student: studentId,
      title,
      agenda,
      startsAt,
      durationMinutes,
      meetingLink,
      createdBy: req.user._id,
    });

    const populated = await Meeting.findById(meeting._id).populate(
      'student',
      'firstName lastName className parentEmail'
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error('Create meeting error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:meetingId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const meeting = await Meeting.findById(req.params.meetingId).populate('student');

    if (!meeting || !canAccessStudent(req.user, meeting.student)) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    meeting.status = status;
    await meeting.save();

    const populated = await Meeting.findById(meeting._id).populate(
      'student',
      'firstName lastName className parentEmail'
    );

    res.json(populated);
  } catch (err) {
    console.error('Update meeting status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
