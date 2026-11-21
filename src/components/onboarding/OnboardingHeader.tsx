import React from 'react';
import { Clock } from 'lucide-react';

interface OnboardingHeaderProps {
  step: 1 | 2;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step }) => {
  return (
    <header className="w-full border-b border-[#D5ECE3] dark:border-[#224A37] bg-white/70 dark:bg-[#0D1619]/80 backdrop-blur-xs relative z-10 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between">
        {/* Brand Logo with verified leaf icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center">
            <img
              src="/assets/airsaathi/airsaathi-leaf-icon.png"
              alt="AirSaathi Logo"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-xs"
            />
          </div>
          <div>
            <span className="font-heading font-extrabold text-[22px] md:text-[24px] text-[#0A4D45] dark:text-emerald-400 tracking-tight leading-none block">
              AirSaathi
            </span>
            <span className="text-[11px] text-[#4F7E78] dark:text-slate-400 font-medium block -mt-0.5">
              Breathe Better. Live Healthier.
            </span>
          </div>
        </div>

        {/* Progress & Time Estimate */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[12px] md:text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              Set up your household
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={step}
            aria-valuemin={1}
            aria-valuemax={2}
            aria-label={`Onboarding step ${step} of 2`}
            className="w-16 sm:w-20 h-2 bg-[#D8EDE5] dark:bg-slate-700 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-[#087C73] dark:bg-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] sm:text-[12px] text-slate-500 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>About 1 minute</span>
          </div>
        </div>
      </div>
    </header>
  );
};
