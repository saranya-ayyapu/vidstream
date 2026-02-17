import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, AlertTriangle, Info, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { user } = useAuth();
  
  if (!video) return null;

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = userInfo?.token;
  const streamingUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5006/api'}/videos/stream/${video._id}?token=${token}`;
  
  const isRestricted = video.sensitivity === 'Flagged' && user.role === 'Viewer';

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl group">
      {/* Sensitivity Overlay for Flagged Content */}
      {video.sensitivity === 'Flagged' && !isRestricted && ( 
        <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 text-[11px] font-black uppercase tracking-widest">
            <AlertTriangle className="w-4 h-4" />
            <span>Sensitive Content Flagged</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-red-400 font-black">Restricted</span>
        </div>
      )}
      
      {video.sensitivity === 'Safe' && (
        <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 text-[11px] font-black uppercase tracking-widest">Content Verified Safe</span>
        </div>
      )}

      {isRestricted ? (
        <div className="aspect-video bg-slate-50 flex flex-col items-center justify-center p-12 text-center border-b border-slate-50">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border-2 border-red-100">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Access Restricted</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-[280px] leading-relaxed">
            This flagged content is only accessible to Project Admins and Editors.
          </p>
        </div>
      ) : (
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full"
            src={streamingUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Simple Custom Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <div className="flex items-center justify-between">
                  <button 
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                      {isPlaying ? <Pause className="text-white w-6 h-6 fill-white" /> : <Play className="text-white w-6 h-6 fill-white" />}
                  </button>
                  
                  <div className="flex items-center gap-4">
                      <Volume2 className="text-white w-5 h-5" />
                      <Maximize className="text-white w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
                  </div>
              </div>
          </div>
        </div>
      )}

      <div className="p-6 flex justify-between items-start bg-white">
        <div>
          <h4 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{video.title}</h4>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
            {new Date(video.createdAt).toLocaleDateString(undefined, { dateStyle: 'full' })} • {(video.size / (1024 * 1024)).toFixed(2)} MB {video.duration ? `• ${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : ''}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            video.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
            video.status === 'Flagged' ? 'bg-red-50 text-red-600 border-red-100' : 
            'bg-blue-50 text-blue-600 border-blue-100 animate-pulse'
        }`}>
            {video.status}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
