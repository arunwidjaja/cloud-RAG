import { Mic } from 'lucide-react';

const AnimatedMic = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* SVG circle animation */}
        <svg className="absolute inset-0 w-16 h-16" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth="2"
            style={{
              strokeDasharray: '175',
              strokeDashoffset: '175',
              animation: 'dashAnimation 2s linear infinite'
            }}
          />
        </svg>
        
        {/* Microphone icon */}
        <div className="relative z-10 p-4">
          <Mic className="w-8 h-8 text-red-500" />
        </div>
        
        {/* Pulsing background */}
        <div 
          className="absolute inset-0 rounded-full bg-red-500 opacity-20"
          style={{
            animation: 'pulseAnimation 2s ease-in-out infinite'
          }}
        />
      </div>
      
      <div
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
        }}
      >
        <style>
          {`
            @keyframes dashAnimation {
              to {
                stroke-dashoffset: 0;
              }
            }
            
            @keyframes pulseAnimation {
              0%, 100% {
                opacity: 0.2;
                transform: scale(1);
              }
              50% {
                opacity: 0.3;
                transform: scale(1.05);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AnimatedMic;