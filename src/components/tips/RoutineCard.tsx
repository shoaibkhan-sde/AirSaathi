import React from 'react';
import { Clock, Check, Bookmark, Sun, Sunset, Moon } from 'lucide-react';
import type { RoutineActivity } from '../../types';
import type { SmartTipRecommendation } from '../../services/recommendations/smartTipsTypes';

interface RoutineCardProps {
  routine: RoutineActivity | SmartTipRecommendation;
  onToggleComplete: () => void;
  onToggleSave: () => void;
}

const getTimeIcon = (time: 'morning' | 'afternoon' | 'evening' | 'all') => {
  switch (time) {
    case 'morning':
      return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    case 'afternoon':
      return <Sunset className="w-3.5 h-3.5 text-orange-500" />;
    case 'evening':
      return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-emerald-500" />;
  }
};

const getPriorityBadge = (priority?: 'High' | 'Medium' | 'Low') => {
  if (priority === 'High') {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
  }
  if (priority === 'Medium') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
  }
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
};

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  onToggleComplete,
  onToggleSave,
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#182228] border ${
        routine.completed
          ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/10'
          : 'border-brand-border dark:border-[#28353E]'
      } rounded-panel p-4 sm:p-5 shadow-subtle hover:shadow-card transition-all`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={routine.completed}
            aria-label={`Mark ${routine.title} as ${routine.completed ? 'incomplete' : 'completed'}`}
            onClick={onToggleComplete}
            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors focus-visible:outline-none ${
              routine.completed
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 hover:border-emerald-600 text-transparent'
            }`}
            title={routine.completed ? 'Mark incomplete' : 'Mark completed'}
          >
            <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {getTimeIcon(routine.timeOfDay)}
                <Clock className="w-3 h-3 ml-0.5" /> {routine.timeSlot}
              </span>

              {routine.priority && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(
                    routine.priority
                  )}`}
                >
                  {routine.priority} Priority
                </span>
              )}

              <span className="text-[11px] font-medium text-slate-400">
                Effort:{' '}
                <strong className="text-slate-600 dark:text-slate-300">{routine.effort}</strong>
              </span>
            </div>

            <h3
              className={`font-heading font-bold text-[15px] sm:text-[16px] leading-snug ${
                routine.completed
                  ? 'line-through text-slate-400'
                  : 'text-brand-text dark:text-white'
              }`}
            >
              {routine.title}
            </h3>

            <p className="text-[13px] text-brand-text-secondary dark:text-slate-300 mt-1 leading-relaxed">
              {'recommendation' in routine && routine.recommendation
                ? routine.recommendation
                : 'description' in routine
                  ? routine.description
                  : ''}
            </p>

            <div className="mt-2.5 p-2.5 rounded-btn bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <strong className="text-brand-text dark:text-slate-200">Why this matters: </strong>
              <span className="text-slate-600 dark:text-slate-400">{routine.reason}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={routine.saved}
          aria-label={`Save ${routine.title} to My Plan`}
          className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none ${
            routine.saved ? 'text-brand-teal fill-brand-teal' : 'text-slate-400'
          }`}
          title={routine.saved ? 'Saved' : 'Save to My Plan'}
        >
          <Bookmark aria-hidden="true" className={`w-4 h-4 ${routine.saved ? 'fill-current text-brand-teal' : ''}`} />
        </button>
      </div>
    </div>
  );
};
