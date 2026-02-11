import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import io from 'socket.io-client';
import VideoUpload from '../components/VideoUpload';
import VideoPlayer from '../components/VideoPlayer';
import UserManagement from '../components/UserManagement';
import Logo from '../components/Logo';
import OnboardingTour from '../components/OnboardingTour';
import ContextualTour from '../components/ContextualTour';
import { LogOut, LayoutDashboard, Video, Search, Filter, Loader2, Play, Users, Trash2, CheckCircle2, ShieldAlert, Clock, X, Upload, HelpCircle, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('library');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [deletingId, setDeletingId] = useState(null);
  const [showTour, setShowTour] = useState(false);
  const [showContextualTour, setShowContextualTour] = useState(false);
  const { user, logout, completeWalkthrough } = useAuth();

  // Auto-scroll to top when player opens
  useEffect(() => {
    if (selectedVideo) {
      const mainContent = document.querySelector('main');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedVideo]);

  // Check for onboarding tour (first time users)
  useEffect(() => {
    if (user && !user.hasSeenWalkthrough) {
      const timer = setTimeout(() => setShowTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchVideos = useCallback(async () => {
    try {
      const { data } = await api.get('/videos');
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch videos', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      setVideos(prev => prev.filter(v => v._id !== id));
      if (selectedVideo?._id === id) setSelectedVideo(null);
      setDeletingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete video');
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchVideos();

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    
    socket.emit('join');

    socket.on('video:new', (newVideo) => {
      setVideos(prev => [newVideo, ...prev]);
    });

    socket.on('video:progress', (data) => {
      setVideos(prev => prev.map(v => 
        v._id === data.videoId ? { ...v, status: data.status } : v
      ));
    });

    socket.on('video:updated', (updatedVideo) => {
        setVideos(prev => prev.map(v => 
          v._id === updatedVideo._id ? updatedVideo : v
        ));
    });

    socket.on('video:deleted', (videoId) => {
      setVideos(prev => prev.filter(v => v._id !== videoId));
      if (selectedVideo?._id === videoId) setSelectedVideo(null);
    });

    return () => socket.disconnect();
  }, [fetchVideos, user.organizationId]);

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' ? true : v.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col hidden lg:flex">
        <div className="mb-10 px-2 flex items-center gap-2">
          <Logo />
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-2 flex-grow">
          <button 
            data-tour="library-tab"
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'library' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Library
          </button>

          <button 
            data-tour="upload-tab"
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Video
          </button>
          
          {user.role === 'Admin' && (
            <button 
              data-tour="members-tab"
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'members' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-5 h-5" />
              Members
            </button>
          )}

          <button 
            data-tour="help-tab"
            onClick={() => setShowContextualTour(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:bg-blue-50 hover:text-blue-600`}
          >
            <HelpCircle className="w-5 h-5" />
            Quick Tour
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600 border border-slate-200">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-900">{user.name}</p>
              {user.role === 'Admin' && (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.role}</p>
              )}
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Logo iconOnly className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">VidStream</h2>
                <p className="text-slate-500 text-sm font-semibold tracking-wide">Stream videos with ease</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-12">
          {activeTab === 'library' ? (
            <>
              {/* Full Player View */}
              {selectedVideo ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Back Header */}
                  <div className="mb-6 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedVideo(null)}
                      className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold uppercase text-xs tracking-widest transition-colors p-3 -ml-3 hover:bg-blue-50 rounded-xl"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                      Back to Library
                    </button>
                    {(user.role === 'Admin' || selectedVideo.uploaderId === user._id) && (
                      <button 
                        onClick={() => {
                          setDeletingId(selectedVideo._id);
                        }}
                        className="p-2.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-200 shadow-sm transition-all"
                        title="Delete Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Main Player */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden mb-8">
                    <div className="p-1 bg-black">
                      <VideoPlayer video={selectedVideo} />
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">{selectedVideo.title}</h2>
                        <p className="text-slate-500 font-semibold mb-4">
                          Added {new Date(selectedVideo.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-2">Status</p>
                            <p className={`text-sm font-black uppercase ${
                              selectedVideo.status === 'Completed' ? 'text-emerald-600' : 
                              selectedVideo.status === 'Flagged' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {selectedVideo.status}
                            </p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-2">Safety</p>
                            <p className={`text-sm font-black uppercase ${
                              selectedVideo.sensitivity === 'Safe' ? 'text-emerald-600' : 
                              selectedVideo.sensitivity === 'Flagged' ? 'text-red-600' : 'text-slate-400'
                            }`}>
                              {selectedVideo.sensitivity || 'Analysing...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deletingId === selectedVideo._id && (
                      <div className="lg:col-span-3 bg-red-50 border-2 border-red-200 rounded-2xl p-6 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-red-900">Delete this video?</h3>
                          <p className="text-sm text-red-700">This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-sm uppercase"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(selectedVideo._id)}
                            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-sm uppercase"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Toolbar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="relative group flex-1" data-tour="search-bar">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search videos..." 
                        className="w-full bg-white border border-slate-200 text-slate-900 pl-12 pr-4 py-3 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0" data-tour="filter-buttons">
                      <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {['All', 'Completed', 'Flagged', 'Processing'].map((f) => (
                          <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                              filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Video Grid */}
                  <div className="space-y-6">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
                        <div className="bg-blue-50 p-4 rounded-2xl mb-4">
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <p className="text-slate-500 font-semibold">Fetching your high-quality library...</p>
                      </div>
                    ) : filteredVideos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredVideos.map((vid) => (
                          <div 
                            key={vid._id}
                            className="group relative bg-white rounded-2xl border-2 border-slate-100 transition-all cursor-pointer overflow-hidden hover:border-blue-200 hover:shadow-xl"
                            onClick={() => setSelectedVideo(vid)}
                          >
                            <div className="aspect-video bg-slate-50 flex items-center justify-center relative border-b border-slate-50">
                              <Video className="w-12 h-12 text-slate-200 group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-all duration-300">
                                  <Play className="w-6 h-6 text-white fill-current" />
                                </div>
                              </div>
                              {vid.status === 'Completed' && vid.sensitivity === 'Safe' && (
                                <div className="absolute top-3 left-3 bg-emerald-500 text-white p-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-emerald-500/90 border border-emerald-400/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Safe</span>
                                </div>
                              )}

                              {vid.status === 'Flagged' && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white p-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-red-500/90 border border-red-400/20">
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Flagged</span>
                                </div>
                              )}

                              {vid.status === 'Processing' && (
                                <div className="absolute top-3 left-3 bg-blue-500 text-white p-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-sm bg-blue-500/90 border border-blue-400/20 animate-pulse">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">Processing</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4 bg-white">
                              <h3 className="text-slate-900 font-bold truncate mb-1">{vid.title}</h3>
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                  {new Date(vid.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                                {vid.status !== 'Completed' && vid.status !== 'Flagged' && (
                                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg border border-blue-100 font-bold uppercase tracking-widest animate-pulse">
                                    {vid.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                          <Video className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-extrabold text-xl mb-2">Your library is empty</h3>
                        <p className="text-slate-400 text-sm max-w-[280px] font-medium leading-relaxed">
                          Upload your first video to start streaming in high-definition.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : activeTab === 'upload' ? (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="mb-12 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6 border border-blue-100 shadow-sm">
                  <Upload className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Upload New Content</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Contribute to the enterprise library</p>
              </div>
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl p-2">
                <VideoUpload 
                  onUploadComplete={() => {
                    fetchVideos();
                    setActiveTab('library');
                  }} 
                />
              </div>
            </div>
          ) : activeTab === 'help' ? (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="mb-12 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-blue-50 text-blue-600 mb-6 border border-blue-100 shadow-sm">
                  <HelpCircle className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">How to Use VidStream</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Learn about all features and best practices</p>
              </div>
              
              <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl overflow-hidden">
                <button
                  onClick={() => setShowContextualTour(true)}
                  className="w-full p-8 md:p-12 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start gap-6">
                    <div className="p-4 rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                      <HelpCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-grow text-left">
                      <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Take the Interactive Tour</h3>
                      <p className="text-slate-500 font-semibold mb-4">Walk through VidStream step-by-step with our interactive guide. Learn about all the features and how to get the most out of your video library.</p>
                      <span className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider">
                        Start Tour
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </button>

                <div className="border-t border-slate-100" />

                <div className="p-8 md:p-12 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <LayoutDashboard className="w-6 h-6 text-blue-600" />
                      Video Library
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed ml-9">
                      Your personal video library shows only the videos you've uploaded. You can search, filter by status, and stream your content anytime. Each video shows its processing status and safety analysis result.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <Upload className="w-6 h-6 text-emerald-600" />
                      Upload Videos
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed ml-9">
                      Use the Upload tab to add new videos to your library. Our system automatically optimizes your videos for streaming and runs safety analysis. Videos up to 100MB in size are supported.
                    </p>
                  </div>

                  {user.role === 'Admin' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <Users className="w-6 h-6 text-purple-600" />
                        Team Management
                      </h3>
                      <p className="text-slate-600 font-medium leading-relaxed ml-9">
                        As an admin, use the Members tab to manage your organization's users. You can view user details and manage roles and permissions.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      Safety & Status
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed ml-9">
                      Each video goes through automated processing and safety analysis. Videos are marked as "Safe" or "Flagged" based on content analysis. The status badge shows the current processing state.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <UserManagement />
          )}
        </div>
      </main>

      {/* Onboarding Tour Overlay - First Time Users */}
      {showTour && (
        <OnboardingTour 
          onComplete={async () => {
            setShowTour(false);
            await completeWalkthrough();
          }}
          isModal={activeTab === 'help'}
        />
      )}

      {/* Contextual Tour - Interactive Walkthrough */}
      {showContextualTour && (
        <ContextualTour
          onComplete={() => setShowContextualTour(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
