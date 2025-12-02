// server/src/models/Assignment.js
const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  score: { type: Number },
  remarks: { type: String }
}, { _id: false });

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String },
  description: { type: String },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  dueDate: { type: Date },
  grades: [GradeSchema]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
