import React from 'react';
import { Home, Baby, UserCheck, Activity, Check } from 'lucide-react';
import type { HouseholdOption } from '../../types';
import { HealthConsiderationsSelector } from './HealthConsiderationsSelector';

interface HouseholdCardProps {
  householdMembers: HouseholdOption[];
  onToggleHousehold: (option: HouseholdOption) => void;
  healthConsiderations: string[];
  onToggleHealth: (option: string) => void;
  healthOtherText: string;
  onHealthOtherChange: (text: string) => void;
}

export const HouseholdCard: React.FC<HouseholdCardProps> = ({
  householdMembers,
  onToggleHousehold,
  healthConsiderations,
  onToggleHealth,
  healthOtherText,
  onHealthOtherChange,
}) => {
  return (
    <div className="bg-white dark:bg-[#182622] rounded-2xl border border-[#D5ECE3] dark:border-[#284237] p-5 sm:p-6 shadow-xs hover:shadow-subtle transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#E4F5EE] dark:bg-[#1C382D] text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-[17px] text-[#143B35] dark:text-white leading-tight">
            Your household
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Who should your clean-air plan look after?
          </p>
        </div>
      </div>

      {/* Household Multi-Select Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {/* Option 1: Children under 12 */}
        <button
          type="button"
          role="checkbox"
          aria-checked={householdMembers.includes('children')}
          onClick={() => onToggleHousehold('children')}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all focus-visible:outline-none ${
            householdMembers.includes('children')
              ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] shadow-xs'
              : 'border-[#D5ECE3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1C2C28]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
              <Baby aria-hidden="true" className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[14px] text-slate-800 dark:text-white">Children</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">under 12</div>
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              householdMembers.includes('children')
                ? 'border-[#087C73] bg-[#087C73] text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {householdMembers.includes('children') && <Check aria-hidden="true" className="w-3 h-3 stroke-[3]" />}
          </div>
        </button>

        {/* Option 2: Adults over 65 */}
        <button
          type="button"
          role="checkbox"
          aria-checked={householdMembers.includes('seniors')}
          onClick={() => onToggleHousehold('seniors')}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all focus-visible:outline-none ${
            householdMembers.includes('seniors')
              ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] shadow-xs'
              : 'border-[#D5ECE3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1C2C28]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
              <UserCheck aria-hidden="true" className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[14px] text-slate-800 dark:text-white">Adults</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">65+</div>
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              householdMembers.includes('seniors')
                ? 'border-[#087C73] bg-[#087C73] text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {householdMembers.includes('seniors') && <Check aria-hidden="true" className="w-3 h-3 stroke-[3]" />}
          </div>
        </button>

        {/* Option 3: Adults 18 to 65 only (Exclusive) */}
        <button
          type="button"
          role="checkbox"
          aria-checked={householdMembers.includes('adults_only')}
          onClick={() => onToggleHousehold('adults_only')}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all focus-visible:outline-none ${
            householdMembers.includes('adults_only')
              ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] shadow-xs'
              : 'border-[#D5ECE3] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#1C2C28]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-800 dark:text-cyan-300">
              <Activity aria-hidden="true" className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[14px] text-slate-800 dark:text-white">Adults</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">18 to 65 only</div>
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
              householdMembers.includes('adults_only')
                ? 'border-[#087C73] bg-[#087C73] text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {householdMembers.includes('adults_only') && <Check aria-hidden="true" className="w-3 h-3 stroke-[3]" />}
          </div>
        </button>
      </div>

      <HealthConsiderationsSelector
        healthConsiderations={healthConsiderations}
        onToggleHealth={onToggleHealth}
        healthOtherText={healthOtherText}
        onHealthOtherChange={onHealthOtherChange}
      />
    </div>
  );
};
