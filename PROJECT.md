# VidStream - Video Upload & Processing Platform

## 📺 About Project

**VidStream** is a web application that allows users to:
- **Upload videos** from their computer
- **Watch real-time progress** as videos are processed
- **Store videos** in the cloud
- **Stream videos** to watch anytime, anywhere
- **Manage teams** and organize videos by organization

Think of it like **YouTube** but with real-time processing status and organization-based access control.

---

## 🎯 Key Features

### 1. **User Authentication**
- Users can sign up with email and password
- Secure login system using JWT (Security tokens)
- Each user belongs to an Organization

### 2. **Video Upload**
- Upload videos from your computer
- Real-time progress bar showing upload status
- Shows which stage: Uploading → Optimizing → Analyzing

### 3. **Video Processing**
- Videos are automatically optimized for web streaming
- Analyzes videos for security (detects sensitive content)
- Sends real-time updates to the browser while processing

### 4. **Video Streaming**
- Watch uploaded videos directly in the browser
- Smooth playback with video player controls
- Only authorized users can stream videos (security)

### 5. **Organization Dashboard**
- View all videos in your organization
- See processing status of each video
- Manage team members
- Organized, dark-mode professional interface

---

## 💻 Technologies Used

### **Backend (Server)**
| Technology | What It Does |
|-----------|-------------|
| **Node.js** | Runs JavaScript on the server |
| **Express.js** | Web framework for creating API endpoints |
| **MongoDB** | Database to store user/video information |
| **Socket.io** | Real-time communication (live progress updates) |
| **FFmpeg** | Tool to process and optimize videos |
| **JWT** | Secure authentication tokens |
| **Multer** | Handles file uploads |
| **Bcrypt** | Secure password encryption |

### **Frontend (Website)**
| Technology | What It Does |
|-----------|-------------|
| **React** | JavaScript library for building user interfaces |
| **Vite** | Fast development and build tool |
| **Tailwind CSS** | Modern styling framework (dark mode) |
| **Axios** | Sends requests to the backend API |
| **Socket.io Client** | Receives real-time updates from server |
| **React Router** | Navigation between pages |
| **Lucide Icons** | Nice looking icons |

### **Database**
| Technology | What It Does |
|-----------|-------------|
| **MongoDB Atlas** | Cloud database (stores everything) |
| **Mongoose** | JavaScript library to interact with MongoDB |

---

## 🏗️ How It Works - Simple Flow

```
1. User Signs Up
   ↓
2. User Logs In (gets JWT token)
   ↓
3. User Selects Video File
   ↓
4. File Uploaded to Backend
   ↓
5. Backend Processes Video (FFmpeg)
   ↓
6. Real-Time Updates Sent to Browser (Socket.io)
   ↓
7. Video Stored in Database
   ↓
8. User Can Stream/Watch Video
   ↓
9. Only Authorized Users Can Watch
```

---

## 📁 Project Structure

```
video-app-project/
│
├── backend/                    (Server Code)
│   ├── server.js              (Main server file)
│   ├── package.json           (Backend dependencies)
│   ├── config/
│   │   └── db.js              (Database connection)
│   ├── models/
│   │   ├── User.js            (User information)
│   │   ├── Video.js           (Video information)
│   │   └── Organization.js    (Team/Organization info)
│   ├── controllers/
│   │   ├── authController.js  (Login/Register logic)
│   │   └── videoController.js (Upload/Stream logic)
│   ├── routes/
│   │   ├── authRoutes.js      (Login/Register endpoints)
│   │   └── videoRoutes.js     (Upload/Stream endpoints)
│   ├── services/
│   │   └── processingService.js (Video processing logic)
│   └── middleware/
│       └── auth.js            (Security checks)
│
├── frontend/                   (Website Code)
│   ├── src/
│   │   ├── App.jsx            (Main app component)
│   │   ├── main.jsx           (Entry point)
│   │   ├── pages/
│   │   │   ├── Login.jsx      (Login page)
│   │   │   ├── Register.jsx   (Sign up page)
│   │   │   └── Dashboard.jsx  (Main dashboard)
│   │   ├── components/
│   │   │   ├── VideoUpload.jsx (Upload widget)
│   │   │   ├── VideoPlayer.jsx (Video player)
│   │   │   └── UserManagement.jsx (Manage team)
│   │   ├── context/
│   │   │   └── AuthContext.jsx (Login state)
│   │   └── services/
│   │       └── api.js         (Talks to backend)
│   ├── package.json           (Frontend dependencies)
│   ├── vite.config.js         (Build configuration)
│   └── tailwind.config.js     (Styling configuration)
│
└── Documentation Files
    ├── DEPLOYMENT_GUIDE.md    (How to host on cloud)
    ├── LOCAL_TESTING_GUIDE.md (How to test locally)
    └── PHASE_*.md             (Development notes)
```

---

## 🔐 Security Features

1. **Password Encryption** - Passwords are hashed with Bcrypt
2. **JWT Tokens** - Users get secure tokens for authentication
3. **Database Validation** - Only authorized users can access videos
4. **CORS Protection** - Backend only accepts requests from trusted sources
5. **File Validation** - Only video files allowed in uploads
6. **Organization Isolation** - Users can only see their organization's videos

---

## 🚀 How to Run Locally

### **Backend Setup**
```powershell
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### **Frontend Setup**
```powershell
cd frontend
npm install
npm run dev
# Website runs on http://localhost:5173
```

### **What You Need**
- Node.js installed
- MongoDB Atlas account (free)
- `.env` file with MongoDB connection string

---

## ☁️ How to Host on Cloud (Free)

### **Step 1: Database** - MongoDB Atlas
- Free cloud database to store everything

### **Step 2: Backend** - Render
- Free server to run your backend code

### **Step 3: Frontend** - Vercel
- Free hosting to deploy your website

**Total Cost: $0** ✅

---

## 📊 Data Flow Diagram

```
User's Computer
       ↓
    Browser (Vercel)
       ↓
       ├─→ Requests Data ────→ Backend (Render)
       │                           ↓
       │                      Processes Requests
       │                           ↓
       │                      MongoDB Atlas
       │                      (Cloud Database)
       │                           ↓
       │                      Returns Data
       │                           ↓
       └────────←─────────────────←
       ↓
   Display to User
```

---

## 🎓 What You Learned

This project covers:
- **Full-Stack Development** - Both frontend and backend
- **Real-Time Communication** - Socket.io for live updates
- **File Processing** - FFmpeg for video optimization
- **Database Design** - MongoDB schemas and relationships
- **Authentication** - JWT tokens and secure login
- **API Development** - RESTful backend endpoints
- **Cloud Deployment** - Hosting on free platforms
- **Frontend Framework** - React for interactive UI

---

## 🛠️ Technologies at a Glance

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + Vite | Interactive website |
| **Backend** | Node.js + Express | Server and API |
| **Database** | MongoDB | Store data |
| **Real-Time** | Socket.io | Live updates |
| **Video Processing** | FFmpeg | Optimize videos |
| **Authentication** | JWT + Bcrypt | Secure login |
| **Hosting** | Render + Vercel + MongoDB Atlas | Cloud deployment |

---

## 📝 Summary

VidStream is a **complete web application** that demonstrates:
- How to build a **full-stack application**
- How to handle **real-time updates** in web apps
- How to process **video files** on the server
- How to **secure user data** with authentication
- How to **deploy on cloud for free**

It's like a mini version of YouTube with real-time processing status! 🎥

