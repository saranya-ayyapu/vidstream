const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Video = require('../models/Video');
const { processVideo } = require('../services/processingService');

const GLOBAL_ORG_ID = '000000000000000000000001';

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
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
      return res.status(404).json({ message: 'Video not found' });
    }

    // Authorization: User can only stream their own videos
    if (video.uploaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to stream this video' });
    }

    // Sensitivity Check: Restricted content logic can be added here if needed in the future
    // For now, all authorized users (Admin/Viewer) can view content they have access to.

    const videoPath = path.resolve(video.path);
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
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

    // Delete physical files
    if (fs.existsSync(video.path)) {
      fs.unlinkSync(video.path);
    }

    // If optimized file exists, delete it too
    const outputDir = path.dirname(video.path);
    const optimizedPath = path.join(outputDir, `optimized-${video.filename}`);
    if (fs.existsSync(optimizedPath)) {
      fs.unlinkSync(optimizedPath);
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
