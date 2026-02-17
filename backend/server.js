const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');

// Load env vars only in local development
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Attach io to app to use in controllers
app.set('io', io);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);


// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Allow clients to request joining a specific room (e.g. user id)
  socket.on('join', (roomId) => {
    if (roomId) {
      socket.join(roomId.toString());
      console.log(`Client ${socket.id} explicitly joined room ${roomId}`);
    } else {
      console.log(`Client ${socket.id} attempted to join empty room - ignored`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Video App API is running...');
});

const PORT = process.env.PORT || 5006;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Global error handlers to prevent silent crashes
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
