const mongoose = require('mongoose');

const BehaviourNoteSchema = new mongoose.Schema({
  note: String,
  tag: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    className: { type: String },
    rollNumber: { type: String },
    dob: { type: Date },

    // ✅ NEW — required by existing UI (DO NOT REMOVE)
    parentName: { type: String },
    parentEmail: { type: String },
    parentPassword: { type: String },

    // real relationship
    guardians: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    behaviourNotes: [BehaviourNoteSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', StudentSchema);
