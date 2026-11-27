import React from 'react';
import { Flame, Shield, Leaf, UtensilsCrossed } from 'lucide-react';
import type {
  IndoorQuickTip,
  IndoorTipIcon,
} from '../../services/recommendations/indoorAirTypes.ts';

interface IndoorQuickTipsProps {
  tips: IndoorQuickTip[];
}

const TIP_ICON_ELEMENTS: Record<IndoorTipIcon, React.ReactElement> = {
  flame: (
    <div className="w-9 h-9 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/60 dark:border-amber-900/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
      <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 stroke-[2.2]" />
    </div>
  ),
  stove: (
    <div className="w-9 h-9 rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/60 dark:border-orange-900/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
      <UtensilsCrossed className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400 stroke-[2.2]" />
    </div>
  ),
  window: (
    <div className="w-9 h-9 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] dark:bg-blue-950/60 dark:border-blue-900/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
      <svg
        className="w-5 h-5 text-[#2563EB] dark:text-blue-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    </div>
  ),
  shield: (
    <div className="w-9 h-9 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 dark:border-emerald-900/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
      <Shield className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
    </div>
  ),
  leaf: (
    <div className="w-9 h-9 rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] dark:bg-emerald-950/60 dark:border-emerald-900/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
      <Leaf className="w-4.5 h-4.5 text-[#16A34A] dark:text-emerald-400 stroke-[2.2]" />
    </div>
  ),
  purifier: (
    <div className="w-9 h-9 rounded-xl border border-[#D5EFEA] bg-[#E8FAF7] dark:bg-teal-950/60 dark:border-teal-900/60 flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105">
      <svg
        className="w-5 h-5 text-[#0E8784] dark:text-teal-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="6" y="3" width="12" height="18" rx="4" />
        <circle cx="12" cy="8" r="1.8" fill="currentColor" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="16" x2="15" y2="16" />
      </svg>
    </div>
  ),
};

const renderTipIcon = (type: IndoorTipIcon) =>
  TIP_ICON_ELEMENTS[type] || TIP_ICON_ELEMENTS.purifier;

export const IndoorQuickTips: React.FC<IndoorQuickTipsProps> = ({ tips }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="font-sans font-bold text-[16px] md:text-[18px] text-brand-text dark:text-white tracking-tight">
          Personalized Quick Tips
        </h2>
        <span className="text-[12px] font-semibold text-brand-text-secondary dark:text-slate-400">
          Source, Ventilation & Air Sanctuary
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {tips.map((tip) => (
          <div
            key={tip.id}
            className="p-4 rounded-2xl bg-white dark:bg-[#182228] border border-brand-border/80 dark:border-[#28353E] shadow-subtle hover:shadow-card hover:border-brand-teal/30 transition-all flex flex-col items-center justify-center text-center min-h-[135px] select-none group"
          >
            {renderTipIcon(tip.iconType)}
            <h3 className="font-sans font-bold text-[13px] md:text-[14px] text-brand-text dark:text-white leading-tight">
              {tip.title}
            </h3>
            <p className="text-[11.5px] md:text-[12px] font-normal text-brand-text-secondary dark:text-slate-400 mt-1 leading-snug">
              {tip.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
