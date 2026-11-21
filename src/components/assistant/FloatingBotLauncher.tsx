import React from 'react';

interface FloatingBotLauncherProps {
  onClick: () => void;
  isOpen: boolean;
}

export const FloatingBotLauncher: React.FC<FloatingBotLauncherProps> = ({ onClick, isOpen }) => {
  if (isOpen) return null;

  return (
    <button
      id="floating-bot-launcher"
      type="button"
      onClick={onClick}
      aria-label="Open AirSaathi Assistant"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className="fixed right-4 sm:right-6 bottom-20 md:bottom-[90px] z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#087C73] via-[#0B8E84] to-[#10A79B] text-white shadow-[0_6px_22px_rgba(8,124,115,0.36)] hover:shadow-[0_8px_28px_rgba(8,124,115,0.50)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group cursor-pointer focus-visible:outline-none"
    >
      {/* Friendly Bot Face SVG */}
      <svg
        aria-hidden="true"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:rotate-3 transition-transform duration-200"
      >
        {/* Antenna */}
        <circle cx="18" cy="4" r="2.2" fill="#E6FFFA" />
        <line x1="18" y1="6.2" x2="18" y2="10" stroke="#E6FFFA" strokeWidth="2" strokeLinecap="round" />

        {/* Head Shell */}
        <rect
          x="6"
          y="10"
          width="24"
          height="19"
          rx="7"
          fill="white"
          fillOpacity="0.96"
          stroke="#D8F5EE"
          strokeWidth="1.2"
        />

        {/* Ears */}
        <rect x="3.5" y="16" width="2.5" height="7" rx="1.25" fill="#E6FFFA" />
        <rect x="30" y="16" width="2.5" height="7" rx="1.25" fill="#E6FFFA" />

        {/* Face Screen Visor */}
        <rect x="9" y="13" width="18" height="12" rx="4" fill="#0E3D38" />

        {/* Glowing Eyes */}
        <ellipse cx="14" cy="18" rx="2" ry="2.5" fill="#34D399" />
        <circle cx="14.6" cy="17.2" r="0.7" fill="white" />

        <ellipse cx="22" cy="18" rx="2" ry="2.5" fill="#34D399" />
        <circle cx="22.6" cy="17.2" r="0.7" fill="white" />

        {/* Gentle Smiling Mouth */}
        <path
          d="M15 22.2C15.8 23.2 16.8 23.6 18 23.6C19.2 23.6 20.2 23.2 21 22.2"
          stroke="#34D399"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>

      {/* Online indicator dot */}
      <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-[#142028]" />
      </span>
    </button>
  );
};
