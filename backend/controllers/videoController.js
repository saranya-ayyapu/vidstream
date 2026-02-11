const multer = require('multer');

const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const Video = require('../models/Video');
const { processVideo } = require('../services/processingService');

const GLOBAL_ORG_ID = '000000000000000000000001';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "vidstream-videos",
    resource_type: "video",
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only videos are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// @desc    Upload a video
// @route   POST /api/videos/upload
// @access  Private
const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const io = req.app.get('io');

    const video = await Video.create({
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      organizationId: GLOBAL_ORG_ID,
      uploaderId: req.user._id,
      status: 'Processing',
    });

    // Notify user about new video
    io.to(req.user._id.toString()).emit('video:new', video);

    res.status(201).json(video);

    // Initial Processing Status
    io.to(req.user._id.toString()).emit('video:progress', {
      videoId: video._id,
      status: 'Processing',
      progress: 0,
      message: 'Video uploaded, starting processing pipeline...',
    });

    // Trigger FFmpeg processing in background
    processVideo(video._id, io);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all videos for the current user
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
  try {
    // Users see only their own videos, not other users' videos
    const videos = await Video.find({ uploaderId: req.user._id }).sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Stream a video (Range Requests)
// @route   GET /api/videos/stream/:id
// @access  Private
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.redirect(video.path);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Authorization: Only Admin or the person who uploaded can delete
    if (req.user.role !== 'Admin' && video.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    await Video.deleteOne({ _id: video._id });

    // Notify user via Socket.io
    const io = req.app.get('io');
    io.to(video.uploaderId.toString()).emit('video:deleted', video._id);

    res.json({ message: 'Video removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  upload,
  uploadVideo,
  getVideos,
  streamVideo,
  deleteVideo,
};
