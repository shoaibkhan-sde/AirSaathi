import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoutineCard } from './RoutineCard';
import type { RoutineActivity } from '../../types';
import type { SmartTipRecommendation } from '../../services/recommendations/smartTipsTypes';

interface RoutineTimelineProps {
  routines?: (RoutineActivity | SmartTipRecommendation)[];
}

export const RoutineTimeline: React.FC<RoutineTimelineProps> = ({ routines: propRoutines }) => {
  const { routines: contextRoutines, toggleCompleteRoutine, toggleSaveRoutine } = useApp();
  const routines = propRoutines || contextRoutines;
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const filteredRoutines = routines.filter((r) => {
    if (timeFilter === 'all') return true;
    return r.timeOfDay === timeFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header and Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#182228] border border-brand-border dark:border-[#28353E] rounded-panel shadow-subtle">
        <div>
          <h2 className="font-heading font-extrabold text-[18px] text-brand-text dark:text-white leading-tight">
            Your Recommended Routine
          </h2>
          <p className="text-[12px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
            Diurnal activity schedule calibrated to ambient particulate levels.
          </p>
        </div>

        {/* Time of Day filter */}
        <div role="tablist" aria-label="Filter routines by time of day" className="flex items-center gap-1 text-xs self-start sm:self-auto">
          {(['all', 'morning', 'afternoon', 'evening'] as const).map((time) => (
            <button
              key={time}
              type="button"
              role="tab"
              aria-selected={timeFilter === time}
              onClick={() => setTimeFilter(time)}
              className={`px-3 py-1.5 rounded-btn capitalize font-semibold transition-colors focus-visible:outline-none ${
                timeFilter === time
                  ? 'bg-brand-teal text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Timeline Items */}
      <div className="space-y-3">
        {filteredRoutines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            onToggleComplete={() => toggleCompleteRoutine(routine.id)}
            onToggleSave={() => toggleSaveRoutine(routine.id)}
          />
        ))}
      </div>
    </div>
  );
};
