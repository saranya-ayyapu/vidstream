# VidStream

 A lightweight video upload and streaming demo with server-side processing simulation and real-time progress updates.

 This project demonstrates a small single-organization video library platform with upload, processing (FFmpeg simulated), safety analysis, and a responsive frontend that receives realtime progress via Socket.io.

 **Key technologies**
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, Cloudinary (for file storage), fluent-ffmpeg (simulated in many local environments)
- Frontend: React (Vite), Tailwind CSS, socket.io-client

# VidStream

A simple video upload and streaming demo with a responsive frontend that shows live processing progress.

This repository contains a minimal web app where users can register, upload videos, and view their video library. Uploads are processed server-side and the frontend receives progress updates so users can follow processing until completion.

Key points
- User accounts and authentication
- Upload videos and see processing progress in real time
- Completed videos appear in the library and can be played back

Tech overview
- Server: Node.js + Express (handles API and processing)
- Client: React (Vite) with a simple UI for upload and library

Quick local steps
1. Create any required environment files for server and client (backend and frontend `.env` files).
2. Install dependencies and run both servers:

```powershell
# backend
cd D:\assignment\video-app-project\backend
npm install
npm run dev

# frontend (new terminal)
cd D:\assignment\video-app-project\frontend
npm install
npm run dev
```

3. Open the frontend URL shown by Vite (usually http://localhost:5173), register or login, then upload a small test video.

What to expect during testing
- The upload phase will show initial upload progress.
- The UI should receive processing updates and reach 100% automatically.
- Once processing completes the app navigates to the library and the new video appears without manually refreshing.

Troubleshooting hints
- If the UI doesn't update automatically, check the browser console for socket/connect logs.
- Confirm both backend and frontend are running and the frontend is configured to connect to the backend socket URL.

If you want, I can further simplify this README, add a short contributor note, or add optional security improvements such as token-protected socket connections.
- The server emits per-user socket events (`video:progress`, `video:new`, `video:updated`, `video:deleted`) — clients join a per-user room using their user id.

- Processing uses FFmpeg when available; when FFmpeg isn't present the service simulates progress to allow UI testing.
