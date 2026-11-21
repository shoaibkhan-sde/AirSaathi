import React from 'react';
import { Check } from 'lucide-react';
import type { SustainableAction } from '../../services/sustainability/sustainabilityTypes';

interface SustainableActionsSectionProps {
  actions: SustainableAction[];
  onToggleAction: (actionId: string) => void;
}

export const SustainableActionsSection: React.FC<SustainableActionsSectionProps> = ({
  actions,
  onToggleAction,
}) => {
  return (
    <section id="sustainable-actions" className="space-y-3.5 scroll-mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[20px] text-brand-text dark:text-white">
            Your Sustainable Actions
          </h2>
          <p className="text-[12.5px] text-brand-text-secondary dark:text-slate-400">
            Check off completed actions to record transparent CO₂ avoidance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {actions.map((action) => {
          const isDone = action.completed;

          return (
            <button
              key={action.id}
              type="button"
              role="checkbox"
              aria-checked={isDone}
              aria-label={`Mark ${action.title} as ${isDone ? 'incomplete' : 'completed'}`}
              onClick={() => onToggleAction(action.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none focus-visible:outline-none ${
                isDone
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-700/60 shadow-xs'
                  : 'bg-white dark:bg-[#182228] border-brand-border dark:border-[#28353E] hover:border-brand-teal/40 shadow-subtle'
              }`}
            >
              {/* Checkbox Visual Indicator */}
              <div
                aria-hidden="true"
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 bg-white dark:bg-slate-800'
                }`}
              >
                {isDone && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3
                    className={`font-heading font-bold text-[14.5px] leading-tight ${
                      isDone
                        ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-85'
                        : 'text-brand-text dark:text-white'
                    }`}
                  >
                    {action.title}
                  </h3>
                  <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                    +{action.co2SavingsKg} kg CO₂
                  </span>
                </div>

                <p className="text-[12.5px] text-brand-text-secondary dark:text-slate-300 leading-snug">
                  {action.description}
                </p>

                <div className="text-[11px] text-slate-400 dark:text-slate-400 mt-1.5 font-medium">
                  Basis: {action.calculationBasis}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
