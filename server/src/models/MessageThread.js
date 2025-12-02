// server/src/models/MessageThread.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  body: { type: String },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { _id: false });

const ThreadSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('MessageThread', ThreadSchema);
