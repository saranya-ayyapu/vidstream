import React from 'react';

const Logo = ({ className = "w-8 h-8", iconOnly = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        {/* Modern Play Button Logo */}
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className={className}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="7" fill="url(#logo-gradient)" />
          <path 
            d="M16 12L10 16V8L16 12Z" 
            fill="white" 
          />
          <path 
            d="M17 7L19 5" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            opacity="0.5"
          />
        </svg>
      </div>
      {!iconOnly && (
        <span className="text-xl font-black tracking-tighter text-slate-900">
          Vid<span className="text-blue-600">Stream</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
