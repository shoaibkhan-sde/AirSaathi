import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { SustainabilityImpactSummary } from '../../services/sustainability/sustainabilityTypes';

interface MyProgressSectionProps {
  impact: SustainabilityImpactSummary;
  onReset: () => void;
}

export const MyProgressSection: React.FC<MyProgressSectionProps> = ({ impact, onReset }) => {
  const { completedActionsCount, totalActionsCount, totalCo2SavedKg } = impact;
  const percentage =
    totalActionsCount > 0 ? Math.round((completedActionsCount / totalActionsCount) * 100) : 0;

  return (
    <section className="p-5 rounded-panel bg-white dark:bg-[#182228] border border-brand-border dark:border-[#28353E] shadow-subtle space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-[16px] md:text-[18px] text-brand-text dark:text-white leading-tight">
            My Progress
          </h2>
          <p className="text-[12px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
            Based strictly on verified, checked-off sustainable actions.
          </p>
        </div>

        {completedActionsCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[12px] font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Cycle</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-[12.5px] font-semibold text-brand-text dark:text-slate-200 mb-1.5">
          <span>
            {completedActionsCount} of {totalActionsCount} actions completed
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            {percentage}% • {totalCo2SavedKg} kg CO₂ avoided
          </span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Sustainable actions progress"
          className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
        >
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </section>
  );
};
