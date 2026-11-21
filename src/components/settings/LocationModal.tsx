import React, { useEffect } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import type { CityLocation } from '../../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCities: CityLocation[];
  currentCity: CityLocation;
  onSelectCity: (city: CityLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  availableCities,
  currentCity,
  onSelectCity,
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

  return (
    <div
      id="location-picker-panel"
      role="region"
      aria-label="City Monitoring Hub Selector"
      className="px-4 py-4 md:px-5 bg-slate-50/80 dark:bg-slate-900/40 border-t border-brand-border/60 dark:border-slate-800 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-heading font-bold text-[14px] text-brand-text dark:text-white">
          Select City Monitoring Hub
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close location selector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mb-3">
        Switch to a genuine regional monitoring station:
      </p>

      {/* Genuine monitoring stations - search bar and static AQI chips removed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableCities.slice(0, 5).map((c) => {
          const isSelected = c.id === currentCity.id || c.name === currentCity.name;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelectCity(c);
                onClose();
              }}
              className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-colors ${
                isSelected
                  ? 'border-[#087C73] bg-[#E4F5EE] dark:bg-[#1C382D] font-semibold text-[#087C73] dark:text-emerald-300 shadow-xs'
                  : 'border-brand-border dark:border-slate-800 bg-white dark:bg-[#182228] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-brand-text dark:text-slate-200'
              }`}
            >
              <div className="flex items-start gap-2 min-w-0">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-[12.5px] truncate">
                    {c.name}, {c.country}
                  </div>
                  <div className="text-[10.5px] text-slate-400 truncate">{c.stationName}</div>
                </div>
              </div>
              {isSelected && (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#087C73] text-white">
                    Active • AQI {currentCity.aqi}
                  </span>
                  <Check className="w-4 h-4 text-[#087C73] dark:text-emerald-400 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
