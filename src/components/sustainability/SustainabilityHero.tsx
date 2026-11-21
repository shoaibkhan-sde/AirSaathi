import React, { useState } from 'react';
import { ArrowDown, Info, Sparkles, X } from 'lucide-react';
import type { SustainabilityImpactSummary } from '../../services/sustainability/sustainabilityTypes';

interface SustainabilityHeroProps {
  impact: SustainabilityImpactSummary;
  onExploreActions: () => void;
}

export const SustainabilityHero: React.FC<SustainabilityHeroProps> = ({
  impact,
  onExploreActions,
}) => {
  const [calcOpen, setCalcOpen] = useState(false);
  const { hasActivityData, totalCo2SavedKg, completedActionsCount, reportingPeriod } = impact;

  return (
    <div className="bg-[#E5F6EE] dark:bg-[#142A20] border border-[#C5E8D6] dark:border-[#224A35] rounded-section overflow-hidden shadow-subtle hover:shadow-card transition-all">
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        {/* Left Dewy Green Leaves Photo */}
        <div className="md:col-span-5 h-24 sm:h-36 md:h-auto md:min-h-[220px] min-h-0 relative overflow-hidden">
          <img
            src="/assets/airsaathi-sustainability-leaves.webp"
            alt="Fresh green foliage with morning dew droplets"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center select-none"
            draggable={false}
          />
        </div>

        {/* Right Impact Metric with Minimalist Tree Illustration */}
        <div className="md:col-span-7 p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="space-y-2.5 sm:space-y-3 z-10 max-w-[340px]">
            {hasActivityData ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-extrabold text-[20px] sm:text-[22px] md:text-[26px] text-[#11291E] dark:text-white leading-tight">
                    Your Impact
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/10 text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Verified
                  </span>
                </div>

                <div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] font-bold text-[#2C5E45] dark:text-emerald-300">
                    CO₂ Saved
                  </div>
                  <div className="font-heading font-extrabold text-[30px] sm:text-[36px] md:text-[44px] text-[#11291E] dark:text-white leading-none tracking-tight mt-0.5 sm:mt-1">
                    {totalCo2SavedKg} kg
                  </div>
                  <div className="text-[12px] sm:text-[13px] md:text-[14px] text-[#4D7561] dark:text-slate-300 font-medium mt-1">
                    {reportingPeriod} • {completedActionsCount} action
                    {completedActionsCount > 1 ? 's' : ''} completed
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCalcOpen(!calcOpen)}
                  className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12px] font-semibold text-[#1C6044] dark:text-emerald-300 hover:underline pt-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>{calcOpen ? 'Hide calculation details' : 'How this is calculated'}</span>
                </button>
              </>
            ) : (
              <>
                <div>
                  <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#2C5E45] dark:text-emerald-300">
                    Action Tracker
                  </span>
                  <h2 className="font-heading font-extrabold text-[18px] sm:text-[20px] md:text-[24px] text-[#11291E] dark:text-white leading-snug mt-0.5">
                    Your Impact Starts Here
                  </h2>
                </div>

                <p className="text-[12.5px] sm:text-[13.5px] md:text-[14px] text-[#335A46] dark:text-slate-300 leading-relaxed font-normal">
                  Complete sustainable actions to start tracking your environmental impact.
                </p>

                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="button"
                    onClick={onExploreActions}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-btn bg-[#18533C] hover:bg-[#134431] text-white text-[12.5px] sm:text-[13px] font-bold shadow-xs transition-all active:scale-95"
                  >
                    <span>Explore Sustainable Actions</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tree Illustration */}
          <div className="w-16 h-16 sm:w-28 sm:h-28 md:w-44 md:h-44 shrink-0 flex items-center justify-center self-end md:self-center">
            <img
              src="/assets/airsaathi-sustainability-tree-transparent.webp"
              alt="Environmental tree impact"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Inline Calculation Transparency Panel - Exact place, NO black background! */}
      {calcOpen && (
        <div className="border-t border-[#C5E8D6] dark:border-[#224A35] bg-white/95 dark:bg-[#182228] p-5 sm:p-6 md:p-7 animate-fade-in relative">
          <button
            type="button"
            onClick={() => setCalcOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close calculation details"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="font-heading font-extrabold text-[16px] md:text-[17px] text-brand-text dark:text-white mb-2">
            How AirSaathi Estimates Avoided CO₂
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            <p>
              Carbon avoidance is calculated strictly from verified actions you complete in the
              Action Tracker:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <p>
                <strong>1. Transit (1.2 kg CO₂/trip):</strong> Shifting a 10 km roundtrip from
                petrol car (~150g/km) to transit (~30g/km).
              </p>
              <p>
                <strong>2. Standby Draw (0.3 kg CO₂/day):</strong> Cutting ~50W continuous idle load
                (~0.4 kWh at grid factor 0.82 kg/kWh).
              </p>
              <p>
                <strong>3. Thermostat 24°C (0.6 kg CO₂/day):</strong> Avoiding ~1.5 kWh/day of
                continuous compressor load.
              </p>
              <p>
                <strong>4. Kitchen Lids (0.4 kg CO₂/day):</strong> Trapping heat saves ~25% cooking
                gas (~150g LPG/day).
              </p>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              When 0 actions are checked, AirSaathi shows zero saved emissions rather than
              speculative data.
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setCalcOpen(false)}
              className="px-3.5 py-1.5 rounded-btn bg-[#18533C] hover:bg-[#134431] text-white font-semibold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
