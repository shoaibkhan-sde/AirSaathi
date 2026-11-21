import React, { useState, useMemo } from 'react';
import { Check, Leaf, Wind } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IndoorQuickTips } from './IndoorQuickTips';
import { RoomGuidanceSection } from './RoomGuidanceSection';
import {
  generateIndoorAirGuidance,
  loadIndoorChecklistState,
  saveIndoorChecklistState,
  resetIndoorChecklistState,
} from '../../services/recommendations/indoorAirEngine';

export const IndoorAirView: React.FC = () => {
  const { userProfile, currentCity, toggleRoomAction } = useApp();
  const [checklistState, setChecklistState] =
    useState<Record<string, boolean>>(loadIndoorChecklistState);

  const indoorGuidance = useMemo(() => {
    return generateIndoorAirGuidance(userProfile, currentCity, checklistState);
  }, [userProfile, currentCity, checklistState]);

  const handleToggleAction = (roomId: string, actionId: string) => {
    setChecklistState((prev) => {
      const updated = { ...prev, [actionId]: !prev[actionId] };
      saveIndoorChecklistState(updated);
      return updated;
    });
    toggleRoomAction(roomId, actionId);
  };

  const handleResetChecklist = () => {
    resetIndoorChecklistState();
    setChecklistState({});
  };

  const { hero, quickTips, rooms } = indoorGuidance;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header with Focused Icon & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/60 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0 shadow-xs">
            <Wind className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[22px] sm:text-[24px] md:text-[28px] text-brand-text dark:text-white leading-tight">
              Indoor Air
            </h1>
            <p className="text-[12.5px] sm:text-[13.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
              Household-specific, actionable habits for cleaner air at home.
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 text-xs font-semibold text-teal-800 dark:text-teal-300 self-start sm:self-auto">
          <span>Room Protection</span>
        </div>
      </div>

      {/* Hero Card: Air Quality Indoors */}
      <div className="w-full min-h-[170px] sm:min-h-[240px] md:min-h-[290px] rounded-2xl md:rounded-[20px] overflow-hidden border border-[#C8EFE5] dark:border-[#1E4A3E] shadow-subtle relative transition-all group shrink-0 select-none">
        <img
          src="/assets/airsaathi/airsaathi-indoor-living-room.webp"
          alt="Clean contemporary indoor living room with sofa and plants"
          loading="lazy"
          decoding="async"
          draggable="false"
          onDragStart={(e) => e.preventDefault()}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        />

        {/* High-Contrast Gradients: Solid mint/forest overlay across text zone (0% to ~58%), smoothly transitioning toward background room */}
        <div
          className="absolute inset-0 pointer-events-none dark:hidden"
          style={{
            background:
              'linear-gradient(90deg, #EBF8F5 0%, #EBF8F5 56%, rgba(235,248,245,0.96) 66%, rgba(235,248,245,0.70) 78%, rgba(235,248,245,0.20) 90%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none hidden dark:block"
          style={{
            background:
              'linear-gradient(90deg, #09211C 0%, #09211C 56%, rgba(9,33,28,0.96) 66%, rgba(9,33,28,0.70) 78%, rgba(9,33,28,0.20) 90%, transparent 100%)',
          }}
        />

        <div className="relative z-10 h-full p-4 sm:p-6 md:p-7 flex flex-col justify-between">
          <div>
            <span className="text-[12px] sm:text-[13px] md:text-[14px] font-bold text-[#0A332A] dark:text-emerald-300 tracking-tight">
              Air Quality Indoors
            </span>
          </div>

          <div className="flex items-start gap-3 sm:gap-4 md:gap-5 my-2 sm:my-3 max-w-[520px] lg:max-w-[540px]">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-[#0F766E] dark:bg-emerald-600 text-white mt-0.5 sm:mt-1">
              <Leaf className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>

            <div className="flex-1 min-w-0">
              {/* 1. Indoor Measurement Status */}
              <h2 className="font-heading font-extrabold text-[17px] sm:text-[21px] md:text-[23px] text-[#083329] dark:text-white leading-tight tracking-tight">
                {hero.statusTitle}
              </h2>
              <p className="hidden sm:block text-[13px] sm:text-[13.5px] md:text-[14px] text-slate-700 dark:text-slate-200 mt-1 leading-snug">
                {hero.sensorNote}
              </p>

              {/* 3. Outdoor AQI displayed separately */}
              <p className="text-[12px] sm:text-[13.5px] md:text-[14.5px] font-semibold text-[#093C30] dark:text-emerald-200 mt-1 sm:mt-2 leading-snug sm:leading-relaxed">
                {hero.description}
              </p>

              {/* 2. Visually subtle informational section: Explain what AirSaathi can still do */}
              <div className="hidden sm:block mt-2.5 pt-2 border-t border-[#0A332A]/10 dark:border-emerald-500/20 text-[12px] sm:text-[12.5px] text-slate-600 dark:text-slate-300 leading-normal">
                <span className="font-semibold text-[#083329] dark:text-emerald-300">
                  {hero.guidanceTitle}:{' '}
                </span>
                <span>{hero.guidanceSubtitle}</span>
              </div>
            </div>
          </div>

          {/* Status Pill */}
          <div className="self-start mt-1">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 rounded-full border text-[11px] sm:text-[12px] md:text-[13px] font-semibold text-[#09382E] dark:text-emerald-200 shadow-xs"
              style={{
                backgroundColor: 'rgba(235, 250, 244, 0.96)',
                borderColor: 'rgba(52, 211, 153, 0.45)',
              }}
            >
              <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400 stroke-[3]" />
              <span>{hero.statusPill}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <IndoorQuickTips tips={quickTips} />

      {/* Room-by-Room Practical Guidance */}
      <RoomGuidanceSection
        rooms={rooms}
        onToggleAction={handleToggleAction}
        onResetChecklist={handleResetChecklist}
      />
    </div>
  );
};
