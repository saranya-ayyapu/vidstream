const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Uploading', 'Processing', 'Completed', 'Flagged', 'Error'],
    default: 'Uploading',
  },
  sensitivity: {
    type: String,
    enum: ['Safe', 'Flagged', 'Pending'],
    default: 'Pending',
  },
  size: {
    type: Number, // In bytes
  },
  duration: {
    type: Number, // In seconds
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  uploaderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Video', videoSchema);
