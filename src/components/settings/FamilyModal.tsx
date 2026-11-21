import React, { useEffect } from 'react';
import { Baby, UserCheck, Activity, Check, X } from 'lucide-react';
import type { HouseholdOption, UserProfile } from '../../types';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  showToast: (
    title: string,
    message?: string,
    type?: 'info' | 'success' | 'warning' | 'error'
  ) => void;
}

export const FamilyModal: React.FC<FamilyModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  showToast,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const members = userProfile?.householdMembers || ['adults_only'];

  const handleToggle = (option: HouseholdOption) => {
    let updated: HouseholdOption[];
    if (option === 'adults_only') {
      updated = members.includes('adults_only') ? [] : ['adults_only'];
    } else {
      const filtered = members.filter((m) => m !== 'adults_only');
      updated = filtered.includes(option)
        ? filtered.filter((m) => m !== option)
        : [...filtered, option];
      if (updated.length === 0) updated = ['adults_only'];
    }

    onUpdateProfile({ householdMembers: updated });
    showToast('Household profile updated', undefined, 'info');
  };

  return (
    <div
      id="family-picker-panel"
      role="region"
      aria-label="Household Profile Preferences"
      className="px-4 py-4 md:px-5 bg-slate-50/80 dark:bg-slate-900/40 border-t border-brand-border/60 dark:border-slate-800 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-heading font-bold text-[14px] text-brand-text dark:text-white">
            Your household
          </h4>
          <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
            Who should your clean-air plan look after?
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close household selector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
        {/* Option 1: Children under 12 */}
        <button
          type="button"
          role="checkbox"
          aria-checked={members.includes('children')}
          onClick={() => handleToggle('children')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all focus-visible:outline-none ${
            members.includes('children')
              ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] shadow-xs'
              : 'border-brand-border dark:border-slate-700 bg-white dark:bg-[#182228] hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
              <Baby className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[13px] text-slate-800 dark:text-white">Children</div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400">under 12</div>
            </div>
          </div>
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              members.includes('children')
                ? 'border-[#087C73] bg-[#087C73] text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {members.includes('children') && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
        </button>

        {/* Option 2: Adults 65+ */}
        <button
          type="button"
          role="checkbox"
          aria-checked={members.includes('seniors')}
          onClick={() => handleToggle('seniors')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all focus-visible:outline-none ${
            members.includes('seniors')
              ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] shadow-xs'
              : 'border-brand-border dark:border-slate-700 bg-white dark:bg-[#182228] hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-800 dark:text-teal-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[13px] text-slate-800 dark:text-white">Adults</div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400">65+</div>
            </div>
          </div>
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              members.includes('seniors')
                ? 'border-[#087C73] bg-[#087C73] text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {members.includes('seniors') && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
        </button>

        {/* Option 3: Adults 18 to 65 only */}
        <button
          type="button"
          role="checkbox"
          aria-checked={members.includes('adults_only')}
          onClick={() => handleToggle('adults_only')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all focus-visible:outline-none ${
            members.includes('adults_only')
              ? 'border-[#087C73] bg-[#E8F6F1] dark:bg-[#1B362C] shadow-xs'
              : 'border-brand-border dark:border-slate-700 bg-white dark:bg-[#182228] hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-800 dark:text-cyan-300">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[13px] text-slate-800 dark:text-white">Adults</div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400">18 to 65 only</div>
            </div>
          </div>
          <div
            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
              members.includes('adults_only')
                ? 'border-[#087C73] bg-[#087C73] text-white'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {members.includes('adults_only') && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
        </button>
      </div>
    </div>
  );
};
