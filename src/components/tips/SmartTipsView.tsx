import React, { useState, useMemo } from 'react';
import { Check, ArrowRight, X, ShieldAlert, Sparkles, Lightbulb } from 'lucide-react';
import { RoutineTimeline } from './RoutineTimeline';
import { HouseholdProtectionSection } from './HouseholdProtectionSection';
import { useApp } from '../../context/AppContext';
import { generateSmartTips } from '../../services/recommendations/smartTipsEngine';

export const SmartTipsView: React.FC = () => {
  const { userProfile, currentCity, routines: contextRoutines } = useApp();
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  const tipsResult = useMemo(() => {
    return generateSmartTips(userProfile, currentCity);
  }, [userProfile, currentCity]);

  const routines = useMemo(() => {
    return tipsResult.routines.map((r) => {
      const match = contextRoutines.find((cr) => cr.id === r.id);
      return {
        ...r,
        completed: match ? match.completed : false,
        saved: match ? match.saved : false,
      };
    });
  }, [tipsResult.routines, contextRoutines]);

  const featured = tipsResult.featuredTip;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Title & Tagline with Focused Icon & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/60 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0 shadow-xs">
            <Lightbulb className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[22px] sm:text-[24px] md:text-[28px] text-brand-text dark:text-white leading-tight">
              Smart Tips
            </h1>
            <p className="text-[12.5px] sm:text-[13.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
              Actionable, personalized advice calibrated for {currentCity.name}.
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-xs font-semibold text-amber-800 dark:text-amber-300 self-start sm:self-auto">
          <span>Personalized Habits</span>
        </div>
      </div>

      {/* Hero Smart Tip Card - Retains existing layout & illustration */}
      <div className="bg-[#EEF5FB] dark:bg-[#142028] border border-[#D2E2F0] dark:border-[#22333E] rounded-2xl md:rounded-[20px] overflow-hidden shadow-subtle hover:shadow-card transition-all select-none">
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Left Runner Athletic Shoe Illustration */}
          <div className="w-full md:w-[260px] lg:w-[280px] shrink-0 h-24 sm:h-36 md:h-auto md:aspect-[613/720] relative overflow-hidden bg-[#E2EDF7] dark:bg-slate-900/60 flex items-center justify-center select-none">
            <img
              src="/assets/airsaathi/airsaathi-running-shoe.webp"
              alt="Physical Activity Guidance"
              loading="lazy"
              decoding="async"
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
              className="w-full h-full object-contain object-center pointer-events-none select-none block"
            />
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 p-4 sm:p-6 md:p-7 flex flex-col justify-between bg-gradient-to-br from-[#EEF5FB] via-[#F4F8FC] to-[#EAF2F9] dark:from-[#142028] dark:to-[#17242E]">
            <div>
              <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5 sm:mb-2">
                {featured.priority === 'High'
                  ? 'High Priority Health Guidance'
                  : 'Physical Activity & Air Guidance'}
              </span>

              <h2 className="font-sans font-bold text-[18px] sm:text-[22px] md:text-[24px] text-brand-text dark:text-white leading-tight tracking-tight">
                {featured.title}
              </h2>

              <p className="text-[12.5px] sm:text-[13.5px] md:text-[14px] text-brand-text-secondary dark:text-slate-300 mt-1.5 sm:mt-2 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">
                {featured.description}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="mt-3 sm:mt-auto pt-3 sm:pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#D6F4E4] dark:bg-emerald-950/70 border border-[#A8E8C3] dark:border-emerald-800/80 shadow-xs">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#168752] dark:bg-emerald-500 flex items-center justify-center shrink-0 shadow-xs">
                  {featured.priority === 'High' ? (
                    <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                  ) : (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[3.5]" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[11.5px] sm:text-[12.5px] text-[#124B33] dark:text-emerald-200 leading-tight">
                    {featured.priority === 'High'
                      ? 'Exposure Precaution'
                      : 'Personalized Recommendation'}
                  </span>
                  <span className="text-[10.5px] sm:text-[11px] text-[#1B6344] dark:text-emerald-300 font-medium leading-tight">
                    {featured.relevantFactors[0] || `US AQI ${currentCity.aqi}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLearnMoreOpen(!learnMoreOpen)}
                className="text-[12.5px] sm:text-[13px] md:text-[14px] font-semibold text-brand-teal dark:text-emerald-400 hover:text-brand-teal-dark flex items-center gap-1.5 group cursor-pointer self-start sm:self-auto py-1"
              >
                <span>{learnMoreOpen ? 'Hide details' : 'Learn more'}</span>
                <ArrowRight
                  className={`w-4 h-4 transition-transform ${learnMoreOpen ? '-rotate-90' : 'group-hover:translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Inline Scientific Context & Rationale Card - Pop-up at exact place, NO black background! */}
        {learnMoreOpen && (
          <div className="border-t border-[#D2E2F0] dark:border-[#22333E] bg-white/95 dark:bg-[#182228] p-5 sm:p-6 md:p-7 animate-fade-in relative">
            <button
              type="button"
              onClick={() => setLearnMoreOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-brand-teal dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Scientific Context & Rationale
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-[17px] md:text-[18px] text-brand-text dark:text-white mb-3">
              {featured.title}
            </h3>

            <div className="space-y-3 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-btn border border-slate-200/80 dark:border-slate-700">
                <strong className="text-slate-800 dark:text-slate-200 block mb-1">
                  Why it matters right now:
                </strong>
                <p>{featured.reason}</p>
              </div>

              {featured.learnMoreDetails && (
                <>
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">
                      Biological Mechanism:{' '}
                    </strong>
                    {featured.learnMoreDetails.mechanism}
                  </p>
                  <p>
                    <strong className="text-slate-800 dark:text-slate-200">
                      Standard Guidelines:{' '}
                    </strong>
                    {featured.learnMoreDetails.scientificContext}
                  </p>
                </>
              )}

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-btn border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                <strong>Recommended Action: </strong>
                {featured.learnMoreDetails?.action || featured.description}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setLearnMoreOpen(false)}
                className="px-4 py-1.5 rounded-btn bg-[#0E8784] hover:bg-[#0B726F] text-white font-semibold text-xs transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Routine Section */}
      <div className="mt-8">
        <RoutineTimeline routines={routines} />
      </div>

      {/* Household Air Protection Section */}
      <HouseholdProtectionSection cards={tipsResult.protectionCards} />
    </div>
  );
};