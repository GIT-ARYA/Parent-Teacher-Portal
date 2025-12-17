const mongoose = require('mongoose');

const assignmentProgressSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    status: {
      type: String,
      enum: ['assigned', 'completed'],
      default: 'assigned',
    },
    marks: {
      type: Number,
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    rollNumber: String,

    parentName: String,
    parentEmail: String,
    parentPassword: String,

    guardians: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Phase 1 – keep as-is
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
      },
    ],

    // Phase 2 – NEW
    assignmentProgress: [assignmentProgressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
