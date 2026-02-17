const express = require('express');
const {
  upload,
  uploadVideo,
  getVideos,
  streamVideo,
  deleteVideo,
} = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/upload',
  protect,
  authorize('Admin', 'Editor'),
  upload.single('video'),
  uploadVideo
);

router.get('/', protect, getVideos);
router.get('/stream/:id', protect, streamVideo);
router.delete('/:id', protect, deleteVideo);

module.exports = router;
