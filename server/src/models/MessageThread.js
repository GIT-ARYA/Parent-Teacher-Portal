const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderRole: {
    type: String,
    enum: ['teacher', 'parent'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const messageThreadSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true, // one thread per student
    },

    // ✅ NEW: teacher display name (stored once)
    teacherName: {
  type: String,
  default: '',
},

    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessageThread', messageThreadSchema);
