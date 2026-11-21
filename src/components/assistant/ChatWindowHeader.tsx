import React from 'react';
import { RotateCcw, X, Sparkles } from 'lucide-react';

interface ChatWindowHeaderProps {
  onClose: () => void;
  onReset: () => void;
}

export const ChatWindowHeader: React.FC<ChatWindowHeaderProps> = ({ onClose, onReset }) => {
  return (
    <div className="px-4 py-3 bg-gradient-to-r from-[#087C73] via-[#09877E] to-[#0D9A90] text-white flex items-center justify-between shadow-xs select-none">
      {/* Bot Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-xs border border-white/25 flex items-center justify-center shrink-0 shadow-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-white"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading font-extrabold text-[14.5px] leading-tight text-white tracking-tight">
              AirSaathi Assistant
            </h3>
            <Sparkles className="w-3 h-3 text-emerald-200" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-100/90 leading-none">
              Gemini AI • Ready
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onReset}
          title="Start new conversation"
          aria-label="Start new conversation"
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Close assistant"
          aria-label="Close assistant"
          className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
