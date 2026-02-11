import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Upload, Users, CheckCircle2, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

const OnboardingTour = ({ onComplete, isModal = false }) => {
  const [step, setStep] = useState(0);
  const { user } = useAuth();

  const steps = [
    {
      title: "Welcome to VidStream",
      description: "Your intelligent video management platform. Stream, organize, and ensure safety with AI-powered content analysis.",
      hint: "Let's take a quick tour to get you started!",
      icon: <Logo iconOnly className="w-12 h-12" />,
      color: "blue"
    },
    {
      title: "Your Personal Video Library",
      description: "Access all your uploaded videos in one place. Search, filter, and stream high-quality content instantly.",
      hint: "Only your videos appear here—your content stays private.",
      icon: <LayoutDashboard className="w-10 h-10 text-blue-600" />,
      color: "blue"
    },
    {
      title: "Upload New Videos",
      description: "Share your content with the platform. Our AI automatically optimizes videos and analyzes them for safety.",
      hint: "We support all major video formats up to 100MB.",
      icon: <Upload className="w-10 h-10 text-emerald-600" />,
      color: "emerald"
    },
    ...(user.role === 'Admin' ? [{
      title: "Manage Your Team",
      description: "As an admin, you can manage user roles and permissions for your organization.",
      hint: "Visit the Members tab to manage your team.",
      icon: <Users className="w-10 h-10 text-purple-600" />,
      color: "purple"
    }] : []),
    {
      title: "Pro Tips",
      description: "Use search and filters to quickly find videos, monitor processing status, and delete old content as needed.",
      hint: "Quality over quantity—organize your library effectively.",
      icon: <Zap className="w-10 h-10 text-amber-600" />,
      color: "amber"
    },
    {
      title: "You're All Set!",
      description: "Start uploading videos, organizing your library, and streaming with confidence. Need help? Access the Help tab anytime.",
      hint: "Happy streaming! 🎬",
      icon: <CheckCircle2 className="w-12 h-12 text-emerald-500" />,
      color: "emerald"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${isModal ? 'bg-slate-900/40 backdrop-blur-md' : 'bg-slate-900/50 backdrop-blur-lg'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-[40px] shadow-2xl border border-white/80 overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 p-2.5 hover:bg-slate-100 text-slate-300 hover:text-slate-900 rounded-2xl transition-all z-20 active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-12 md:p-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
              variants={containerVariants}
            >
              {/* Icon Container */}
              <motion.div 
                variants={itemVariants}
                className={`inline-flex p-5 rounded-[28px] bg-${steps[step].color}-50 border border-${steps[step].color}-100 shadow-lg`}
              >
                {steps[step].icon}
              </motion.div>

              {/* Title */}
              <motion.div variants={itemVariants} className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {steps[step].title}
                </h2>
                <div className={`h-1 w-20 bg-${steps[step].color}-600 rounded-full`} />
              </motion.div>

              {/* Description */}
              <motion.p 
                variants={itemVariants}
                className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl"
              >
                {steps[step].description}
              </motion.p>

              {/* Hint Box */}
              <motion.div 
                variants={itemVariants}
                className={`bg-${steps[step].color}-50 border-l-4 border-${steps[step].color}-600 p-4 rounded-lg flex items-start gap-3`}
              >
                <BookOpen className={`w-5 h-5 text-${steps[step].color}-600 flex-shrink-0 mt-0.5`} />
                <p className={`text-sm font-semibold text-${steps[step].color}-900`}>
                  {steps[step].hint}
                </p>
              </motion.div>

              {/* Progress Indicators */}
              <motion.div variants={itemVariants} className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ width: i === step ? 32 : 8 }}
                      animate={{ width: i === step ? 32 : 8 }}
                      className={`h-2 rounded-full transition-all ${
                        i === step ? `bg-${steps[step].color}-600` : i < step ? `bg-slate-300` : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest text-${steps[step].color}-600`}>
                  {step + 1} / {steps.length}
                </span>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-3 pt-6"
              >
                <button
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:bg-slate-100 text-slate-600 active:enabled:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  className={`flex-grow flex items-center justify-center gap-3 bg-gradient-to-r from-${steps[step].color}-600 to-${steps[step].color}-500 hover:from-${steps[step].color}-700 hover:to-${steps[step].color}-600 text-white font-black py-3 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs`}
                >
                  {step === steps.length - 1 ? (
                    <>
                      <span>Get Started</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
      </motion.div>
    </div>
  );
};

export default OnboardingTour;
