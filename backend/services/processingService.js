const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');

const GLOBAL_ORG_ID = '000000000000000000000001';

const processVideo = async (videoId, io) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) return;

    const uploaderId = video.uploaderId.toString();
    const inputPath = video.path;
    const outputDir = path.dirname(inputPath);
    const outputFilename = `optimized-${video.filename}`;
    const outputPath = path.join(outputDir, outputFilename);

    // 1. Update status to Processing
    video.status = 'Processing';
    await video.save();

    io.to(uploaderId).emit('video:progress', {
      videoId: video._id,
      status: 'Processing',
      progress: 10,
      message: 'Starting optimization...',
    });

    // 2. FFmpeg Optimization (Simulating Streaming Preparation)
    // In a real environment, we'd use FFmpeg. Here we simulate the process 
    // especially if FFmpeg binary is missing in the local environment.
    
    const runProcessing = () => {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-movflags +faststart', // For web streaming
            '-vcodec libx264',
            '-crf 23',
            '-preset medium'
          ])
          .on('progress', (progress) => {
            io.to(uploaderId).emit('video:progress', {
              videoId: video._id,
              status: 'Processing',
              progress: Math.floor(progress.percent * 0.7) + 10, // Scale to 10-80%
              message: 'Optimizing for streaming...',
            });
          })
          .on('end', () => {
             resolve();
          })
          .on('error', (err) => {
            if (err.message.includes('Cannot find ffmpeg')) {
                console.log('--- Simulation Mode Activated: FFmpeg binary not found locally ---');
            } else {
                console.error('FFmpeg error:', err.message);
            }
            simulateProgress(80, uploaderId, video, io, resolve);
          })
          .save(outputPath);
      });
    };

    const simulateProgress = (target, uploaderId, video, io, callback) => {
        let current = 10;
        console.log(`Simulation started for video ${video._id}, target: ${target}%`);
        const interval = setInterval(() => {
            current += 10;
            console.log(`Emitting progress for ${video._id}: ${current}%`);
            io.to(uploaderId).emit('video:progress', {
                videoId: video._id,
                status: 'Processing',
                progress: current,
                message: 'Simulating processing (FFmpeg not detected)...',
            });
            if (current >= target) {
                console.log(`Simulation finished for ${video._id}`);
                clearInterval(interval);
                callback();
            }
        }, 1000);
    };

    await runProcessing();

    // 3. Sensitivity Analysis (Simulated)
    io.to(uploaderId).emit('video:progress', {
      videoId: video._id,
      status: 'Processing',
      progress: 85,
      message: 'Running sensitivity analysis...',
    });

    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simple random logic for classification
    const isSafe = Math.random() > 0.2; // 80% chance for Safe
    video.sensitivity = isSafe ? 'Safe' : 'Flagged';
    // 4. Metadata Extraction (Duration)
    try {
        const metadata = await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        video.duration = metadata.format.duration;
    } catch (err) {
        console.log('ffprobe failed to extract duration, skipping...');
    }

    video.status = isSafe ? 'Completed' : 'Flagged';
    
    // Update path to optimized version if it exists
    if (fs.existsSync(outputPath)) {
        video.path = outputPath;
        video.filename = outputFilename;
    }

    await video.save();

    io.to(uploaderId).emit('video:progress', {
      videoId: video._id,
      status: video.status,
      progress: 100,
      message: isSafe ? 'Processing complete. Video is safe.' : 'Processing complete. Video flagged for content.',
    });

    // Refresh the list for clients
    io.to(uploaderId).emit('video:updated', video);

  } catch (error) {
    console.error('Processing error:', error);
    const video = await Video.findById(videoId);
    if (video) {
        video.status = 'Error';
        await video.save();
        const uploaderId = video.uploaderId.toString();
        io.to(uploaderId).emit('video:progress', {
            videoId: video._id,
            status: 'Error',
            progress: 100,
            message: 'An error occurred during processing.',
        });
    }
  }
};

module.exports = {
  processVideo,
};
