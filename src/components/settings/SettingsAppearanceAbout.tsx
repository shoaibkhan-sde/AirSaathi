import React from 'react';
import { Sun, Moon, Info } from 'lucide-react';
import type { UserPreferences } from '../../context/AppContextTypes';

interface SettingsAppearanceAboutProps {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

export const SettingsAppearanceAbout: React.FC<SettingsAppearanceAboutProps> = ({
  preferences,
  updatePreferences,
}) => {
  return (
    <>
      {/* 4. Appearance */}
      <div className="py-3 px-4 md:px-5 md:py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-btn bg-brand-bg dark:bg-slate-800 text-brand-teal dark:text-emerald-400 mt-0.5">
            {preferences.theme === 'dark' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="font-heading font-bold text-[15px] text-brand-text dark:text-white">
              Appearance
            </h3>
            <p className="text-brand-text-secondary dark:text-slate-400 mt-0.5">
              {preferences.theme === 'dark' ? 'Dark mode' : 'Light mode'}
            </p>
          </div>
        </div>

        <select
          value={preferences.theme}
          onChange={(e) => updatePreferences({ theme: e.target.value as 'light' | 'dark' })}
          className="px-3 py-1.5 rounded-btn border border-brand-border dark:border-slate-700 bg-white dark:bg-[#182228] font-semibold text-brand-text dark:text-white shadow-subtle shrink-0"
        >
          <option value="light">Light mode</option>
          <option value="dark">Dark mode</option>
        </select>
      </div>

      {/* 5. About AirSaathi */}
      <div className="py-3 px-4 md:px-5 md:py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-btn bg-brand-bg dark:bg-slate-800 text-brand-teal dark:text-emerald-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-[15px] text-brand-text dark:text-white">
              About AirSaathi
            </h3>
            <p className="text-brand-text-secondary dark:text-slate-400 mt-0.5">
              AI-Powered Environmental Wellness Companion
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">"Breathe Better. Live Healthier."</p>
          </div>
        </div>

        <span className="text-[12px] font-bold text-slate-500 font-mono">Version 1.0.0</span>
      </div>
    </>
  );
};
