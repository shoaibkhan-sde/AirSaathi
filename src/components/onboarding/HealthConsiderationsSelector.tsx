import React from 'react';
import { Wind, Heart, Flower2, MoreHorizontal, Check } from 'lucide-react';

interface HealthConsiderationsSelectorProps {
  healthConsiderations: string[];
  onToggleHealth: (option: string) => void;
  healthOtherText: string;
  onHealthOtherChange: (text: string) => void;
}

const HEALTH_OPTIONS = [
  {
    id: 'Asthma or respiratory condition',
    label: 'Asthma or respiratory condition',
    icon: Wind,
    color: 'text-sky-600',
  },
  { id: 'Heart condition', label: 'Heart condition', icon: Heart, color: 'text-rose-500' },
  {
    id: 'Allergies or sensitivities',
    label: 'Allergies / environmental sensitivities',
    icon: Flower2,
    color: 'text-amber-500',
  },
  { id: 'Other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-500' },
];

export const HealthConsiderationsSelector: React.FC<HealthConsiderationsSelectorProps> = ({
  healthConsiderations,
  onToggleHealth,
  healthOtherText,
  onHealthOtherChange,
}) => {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="font-heading font-bold text-[14px] text-slate-700 dark:text-slate-200">
          Any health considerations? (Optional)
        </h3>
        <span className="text-[11px] text-slate-400">Select all that apply</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HEALTH_OPTIONS.map((h) => {
          const Icon = h.icon;
          const isSelected = healthConsiderations.includes(h.id);
          return (
            <button
              key={h.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => onToggleHealth(h.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left text-xs transition-colors focus-visible:outline-none ${
                isSelected
                  ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] font-semibold text-[#087C73] dark:text-emerald-300'
                  : 'border-[#DDEEE6] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1A2A26] text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon aria-hidden="true" className={`w-4 h-4 ${h.color}`} />
                <span>{h.label}</span>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'border-[#087C73] bg-[#087C73] text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {isSelected && <Check aria-hidden="true" className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {healthConsiderations.includes('Other') && (
        <div className="mt-3 animate-fade-in">
          <input
            type="text"
            value={healthOtherText}
            onChange={(e) => onHealthOtherChange(e.target.value)}
            placeholder="Please specify (e.g. chronic sinusitis, infant bronchitis)"
            aria-label="Specify health condition"
            className="w-full px-3.5 py-2 rounded-xl border border-[#D0E7DE] dark:border-slate-700 text-xs bg-white dark:bg-[#1C2C28] text-slate-800 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};
