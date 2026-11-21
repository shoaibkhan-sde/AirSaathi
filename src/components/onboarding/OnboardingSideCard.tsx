import React from 'react';
import { Activity, Shield, Home, Check } from 'lucide-react';

interface OnboardingSideCardProps {
  step: 1 | 2;
}

export const OnboardingSideCard: React.FC<OnboardingSideCardProps> = ({ step }) => {
  return (
    <div className="lg:col-span-4 bg-[#EBF7F2] dark:bg-[#142A21] rounded-2xl sm:rounded-3xl border border-[#CCE8DC] dark:border-[#224A35] overflow-hidden shadow-subtle flex flex-col justify-between">
      {/* Top Illustration: Family */}
      <div className="w-full h-44 sm:h-48 overflow-hidden shrink-0">
        <img
          src="/assets/airsaathi-onboarding-family-bubble.webp"
          alt="Family in protected clean-air home"
          className="w-full h-full object-cover object-top block"
        />
      </div>

      {/* Title & Value Props */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        <h3 className="font-heading font-extrabold text-[17px] sm:text-[18px] text-[#0E3D35] dark:text-white mb-2.5 sm:mb-3">
          {step === 1 ? 'A plan that fits your home' : 'A healthier tomorrow, together'}
        </h3>

        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              {step === 1 ? (
                <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-300 stroke-[2.5]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 stroke-[2.5]" />
              )}
            </div>
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
              {step === 1 ? 'Local air-quality updates' : 'Personalized clean-air tips'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
              {step === 1 ? (
                <Shield className="w-4 h-4 text-teal-700 dark:text-teal-300 stroke-[2.5]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300 stroke-[2.5]" />
              )}
            </div>
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
              {step === 1 ? 'Safer daily activity guidance' : 'Local air quality updates'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 flex items-center justify-center shrink-0">
              {step === 1 ? (
                <Home className="w-4 h-4 text-cyan-700 dark:text-cyan-300 stroke-[2.5]" />
              ) : (
                <Check className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-300 stroke-[2.5]" />
              )}
            </div>
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
              Practical indoor-air suggestions
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Card View: City Skyline */}
      <div className="w-full h-18 sm:h-20 overflow-hidden border-t border-[#CCE8DC]/60 dark:border-[#224A35]/60 shrink-0">
        <img
          src="/assets/airsaathi-onboarding-city-skyline.webp"
          alt="Clean city environment"
          className="w-full h-full object-cover block"
        />
      </div>
    </div>
  );
};
