import React from 'react';
import { Plus, Sparkles, Wind, Ban, Shield, ChevronDown } from 'lucide-react';
import type { VentilationType, IndoorSmokingType } from '../../../types';

interface LifestyleAdditionalDetailsProps {
  hasAirPurifier: boolean;
  onAirPurifierChange: (val: boolean) => void;
  ventilationType: VentilationType;
  onVentilationChange: (val: VentilationType) => void;
  indoorSmoking: IndoorSmokingType;
  onSmokingChange: (val: IndoorSmokingType) => void;
}

export const LifestyleAdditionalDetails: React.FC<LifestyleAdditionalDetailsProps> = ({
  hasAirPurifier,
  onAirPurifierChange,
  ventilationType,
  onVentilationChange,
  indoorSmoking,
  onSmokingChange,
}) => {
  return (
    <div className="bg-[#EBF7F2] dark:bg-[#142A21]/70 rounded-2xl border border-[#CCE8DC] dark:border-[#224A35] p-4 sm:p-4.5">
      <div className="flex items-start gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-full bg-[#087C73] text-white flex items-center justify-center shrink-0 mt-0.5">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-[13.5px] text-[#0E3D35] dark:text-white leading-tight">
            Tell us more (optional)
          </h3>
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
            Help us provide even more personalized recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-0.5">
        {/* Air Purifier */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Do you use an air purifier?</span>
          </div>
          <div role="radiogroup" aria-label="Do you use an air purifier?" className="grid grid-cols-2 gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={hasAirPurifier}
              onClick={() => onAirPurifierChange(true)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none ${
                hasAirPurifier
                  ? 'border-[#087C73] bg-[#087C73] text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!hasAirPurifier}
              onClick={() => onAirPurifierChange(false)}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none ${
                !hasAirPurifier
                  ? 'border-[#087C73] bg-[#087C73] text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {/* Ventilation */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
            <Wind className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>How is home ventilated?</span>
          </div>
          <div className="relative">
            <select
              id="lifestyle-ventilation"
              aria-label="How is home ventilated?"
              value={ventilationType}
              onChange={(e) => onVentilationChange(e.target.value as VentilationType)}
              className="w-full px-3 py-2 pr-7 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-xs font-medium text-slate-800 dark:text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">Select an option</option>
              <option value="Open windows regularly">Open windows regularly</option>
              <option value="Mostly closed windows">Mostly closed windows</option>
              <option value="Mechanical ventilation / AC">Mechanical ventilation / AC</option>
              <option value="Depends on outdoor air quality">Depends on outdoor AQI</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Indoor smoking */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
            <Ban className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Indoor smoking or vaping?</span>
          </div>
          <div role="radiogroup" aria-label="Indoor smoking or vaping?" className="grid grid-cols-2 gap-2">
            {(['Yes', 'No'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={indoorSmoking === opt}
                onClick={() => onSmokingChange(opt)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none ${
                  indoorSmoking === opt
                    ? 'border-[#087C73] bg-[#087C73] text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <Shield className="w-3.5 h-3.5 text-[#087C73] shrink-0" />
        <span>Your answers help us personalize recommendations for your household.</span>
      </div>
    </div>
  );
};
