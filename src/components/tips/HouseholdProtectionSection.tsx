import React from 'react';
import { Shield, Users, Wind, AlertTriangle, Flame } from 'lucide-react';
import type { HouseholdProtectionCard } from '../../services/recommendations/smartTipsTypes';

interface HouseholdProtectionSectionProps {
  cards: HouseholdProtectionCard[];
}

const getIcon = (type: HouseholdProtectionCard['iconType']) => {
  switch (type) {
    case 'shield':
      return <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'users':
      return <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    case 'wind':
      return <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    case 'flame':
      return <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'alert':
    default:
      return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
  }
};

const getPriorityBadgeClass = (priority: HouseholdProtectionCard['priority']) => {
  switch (priority) {
    case 'High':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    case 'Low':
    default:
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
  }
};

export const HouseholdProtectionSection: React.FC<HouseholdProtectionSectionProps> = ({
  cards,
}) => {
  if (!cards || cards.length === 0) return null;

  return (
    <div className="space-y-3.5 mt-8">
      <div>
        <h2 className="font-heading font-extrabold text-[20px] text-brand-text dark:text-white leading-tight">
          Your Household's Air Protection
        </h2>
        <p className="text-[12.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
          Actionable safeguards calibrated for your household members and domestic environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {cards.map((card) => (
          <div
            key={card.id}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#182228] border border-brand-border dark:border-[#28353E] shadow-subtle hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getIcon(card.iconType)}
                  </div>
                  <span className="text-[11.5px] font-bold text-slate-600 dark:text-slate-300">
                    {card.tag}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(
                    card.priority
                  )}`}
                >
                  {card.priority} Priority
                </span>
              </div>

              <h3 className="font-heading font-bold text-[14.5px] text-brand-text dark:text-white leading-snug">
                {card.title}
              </h3>
              <p className="text-[12.5px] text-brand-text-secondary dark:text-slate-300 mt-1.5 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
