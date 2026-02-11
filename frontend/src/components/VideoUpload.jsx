import { useState, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const VideoUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmingDismiss, setConfirmingDismiss] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check for existing upload session
    const savedUpload = localStorage.getItem('activeVideoUpload');
    if (savedUpload) {
        const { id, title: savedTitle } = JSON.parse(savedUpload);
        setUploading(true);
        setStatusMessage('Resuming processing tracking...');
        setTitle(savedTitle);
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join');
    });

    socket.on('video:progress', (data) => {
      console.log('Progress update received:', data);
      
      // If we are tracking an active upload, verify it matches
      const activeUpload = localStorage.getItem('activeVideoUpload');
      const activeId = activeUpload ? JSON.parse(activeUpload).id : null;

      if (activeId === data.videoId) {
        setProgress(data.progress);
        setStatusMessage(data.message);
        
        if (data.status === 'Completed' || data.status === 'Flagged') {
            setUploading(false);
            setFile(null);
            setTitle('');
            localStorage.removeItem('activeVideoUpload');
            if (onUploadComplete) onUploadComplete();
        }
      }
    });

    socket.on('video:deleted', (videoId) => {
      const activeUpload = localStorage.getItem('activeVideoUpload');
      const activeId = activeUpload ? JSON.parse(activeUpload).id : null;
      if (activeId === videoId) {
        setUploading(false);
        setFile(null);
        setTitle('');
        localStorage.removeItem('activeVideoUpload');
      }
    });

    return () => {
      console.log('Disconnecting socket');
      socket.disconnect();
    };
  }, [onUploadComplete]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setTitle(selectedFile.name.split('.')[0]);
      setError('');
    } else {
      setError('Please select a valid video file.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setStatusMessage('Uploading to server...');
    setError('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);

    try {
      const { data } = await api.post('/videos/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Only use this for the first 10% (upload phase)
          setProgress(Math.min(percentCompleted * 0.1, 10));
        },
      });
      
      // Store in localStorage to persist tracking after refresh
      localStorage.setItem('activeVideoUpload', JSON.stringify({
          id: data._id,
          title: data.title
      }));

    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl shadow-slate-200/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Upload Video</h3>
        {uploading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
      </div>

      {!uploading ? (
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              file ? 'border-blue-600/30 bg-blue-50/30' : 'border-slate-100 hover:border-blue-200 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="video-input"
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
            />
            <label htmlFor="video-input" className="cursor-pointer flex flex-col items-center gap-3">
              <div className={`p-4 rounded-2xl transition-colors ${file ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-slate-900 font-bold">
                {file ? file.name : 'Choose a video file'}
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">MP4, MOV up to 100MB</p>
            </label>
          </div>

          {file && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Video Title</label>
                <input
                  type="text"
                  placeholder="Enter video name..."
                  className="w-full bg-slate-50 border border-slate-100 text-slate-900 px-4 py-3 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-semibold"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <button
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
              >
                Start Processing
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">{statusMessage}</span>
              <span className="text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-[11px] text-blue-800 leading-relaxed font-bold">
              We are optimizing your video for streaming. You can safely stay on this page.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {confirmingDismiss ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                <button 
                  onClick={() => {
                    setUploading(false);
                    setFile(null);
                    setTitle('');
                    localStorage.removeItem('activeVideoUpload');
                    setConfirmingDismiss(false);
                  }}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white rounded-2xl hover:bg-black transition-all"
                >
                  Yes, Dismiss
                </button>
                <button 
                  onClick={() => setConfirmingDismiss(false)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
                <button
                    onClick={() => setConfirmingDismiss(true)}
                    className="w-full py-3 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest border border-slate-100 rounded-2xl hover:bg-slate-50"
                >
                    Dismiss Tracking
                </button>
            )}

            {confirmingDelete ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-300">
                <button 
                  onClick={async () => {
                    const activeUpload = JSON.parse(localStorage.getItem('activeVideoUpload'));
                    if (activeUpload) {
                        try {
                            await api.delete(`/videos/${activeUpload.id}`);
                            setUploading(false);
                            setFile(null);
                            setTitle('');
                            localStorage.removeItem('activeVideoUpload');
                            if (onUploadComplete) onUploadComplete();
                        } catch (err) {
                            alert('Failed to delete video');
                        }
                    }
                    setConfirmingDelete(false);
                  }}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
              </div>
            ) : (
                <button
                    onClick={() => setConfirmingDelete(true)}
                    className="w-full py-3 text-[10px] font-black text-red-500 hover:text-white hover:bg-red-600 transition-all uppercase tracking-widest rounded-2xl border border-red-50/50"
                >
                    Stop & Delete permanent
                </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
