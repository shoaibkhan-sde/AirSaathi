import React from 'react';
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { COUNTRIES } from './onboardingConstants';

interface LocationSelectorCardProps {
  country: string;
  onCountryChange: (val: string) => void;
  cityOrPin: string;
  onCityOrPinChange: (val: string) => void;
  isLocating: boolean;
  onUseMyLocation: () => void;
  locationSuccessMsg: string;
  locationErrorMsg: string;
}

export const LocationSelectorCard: React.FC<LocationSelectorCardProps> = ({
  country,
  onCountryChange,
  cityOrPin,
  onCityOrPinChange,
  isLocating,
  onUseMyLocation,
  locationSuccessMsg,
  locationErrorMsg,
}) => {
  return (
    <div className="bg-white dark:bg-[#182622] rounded-2xl border border-[#D5ECE3] dark:border-[#284237] p-5 sm:p-6 shadow-xs hover:shadow-subtle transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#E4F5EE] dark:bg-[#1C382D] text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-[17px] text-[#143B35] dark:text-white leading-tight">
            Your location
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            We'll use this to check nearby air quality and local conditions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        {/* Country Selector */}
        <div className="sm:col-span-4">
          <label htmlFor="onboarding-country" className="block text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            Country
          </label>
          <select
            id="onboarding-country"
            value={country}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#087C73]/30"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* City or PIN input */}
        <div className="sm:col-span-5">
          <label htmlFor="onboarding-city" className="block text-[12px] font-bold text-slate-600 dark:text-slate-300 mb-1">
            City or PIN code
          </label>
          <input
            id="onboarding-city"
            type="text"
            value={cityOrPin}
            onChange={(e) => onCityOrPinChange(e.target.value)}
            placeholder="e.g. Pune or 411001"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0E7DE] dark:border-slate-700 bg-white dark:bg-[#1C2C28] text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087C73]/30"
          />
        </div>

        {/* Use my location button */}
        <div className="sm:col-span-3">
          <button
            type="button"
            onClick={onUseMyLocation}
            disabled={isLocating}
            aria-busy={isLocating}
            className="w-full py-2.5 px-3 rounded-xl border border-[#087C73] text-[#087C73] dark:text-emerald-400 hover:bg-[#EBF7F2] dark:hover:bg-[#1D352C] font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 focus-visible:outline-none"
          >
            {isLocating ? (
              <>
                <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <MapPin aria-hidden="true" className="w-4 h-4" />
                <span>Use my location</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div role="status" aria-live="polite">
        {locationSuccessMsg && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <CheckCircle2 aria-hidden="true" className="w-3.5 h-3.5" />
            <span>{locationSuccessMsg}</span>
          </div>
        )}

        {locationErrorMsg && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
            <AlertCircle aria-hidden="true" className="w-3.5 h-3.5" />
            <span>{locationErrorMsg}</span>
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 flex items-center justify-between flex-wrap gap-1">
        <span>
          ⓘ Approximate location data is used only to find local air quality. You can edit it
          anytime.
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Data © OpenStreetMap contributors
        </span>
      </div>
    </div>
  );
};
