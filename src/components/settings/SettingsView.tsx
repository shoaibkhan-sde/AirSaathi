import React, { useState } from 'react';
import { MapPin, RotateCcw, Users, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LocationModal } from './LocationModal';
import { FamilyModal } from './FamilyModal';
import { SettingsAppearanceAbout } from './SettingsAppearanceAbout';
import { getHouseholdSummary } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    currentCity,
    availableCities,
    selectCity,
    preferences,
    updatePreferences,
    retakeOnboarding,
    showToast,
    userProfile,
    updateUserProfile,
    getAQICategoryInfo,
  } = useApp();

  const [locationModal, setLocationModal] = useState(false);
  const [familyModal, setFamilyModal] = useState(false);
  const aqiInfo = getAQICategoryInfo(currentCity.aqi);

  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in max-w-3xl mx-auto w-full">
      {/* Page Header with Focused Icon & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/60 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 shadow-xs">
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[22px] sm:text-[24px] md:text-[28px] text-brand-text dark:text-white leading-tight">
              Settings
            </h1>
            <p className="text-[12.5px] sm:text-[13.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
              Manage your locations and family profile preferences.
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 self-start sm:self-auto">
          <span>Household Preferences</span>
        </div>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-[#182228] border border-brand-border dark:border-[#28353E] rounded-section divide-y divide-brand-border/60 dark:divide-slate-800 shadow-subtle text-xs">
        {/* 1. Location */}
        <div>
          <div className="py-3 px-4 md:px-5 md:py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-btn bg-brand-bg dark:bg-slate-800 text-brand-teal dark:text-emerald-400 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading font-bold text-[15px] text-brand-text dark:text-white">
                    Location
                  </h3>
                  {typeof currentCity.aqi === 'number' && currentCity.aqi > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ backgroundColor: aqiInfo.bg, color: aqiInfo.color }}
                    >
                      Dynamic AQI {currentCity.aqi} • {currentCity.category}
                    </span>
                  )}
                </div>
                <p className="text-brand-text-secondary dark:text-slate-400 mt-0.5">
                  {currentCity.name}, {currentCity.country}
                </p>
                <span className="text-[11px] text-slate-400">
                  Connected station: {currentCity.stationName}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLocationModal(!locationModal)}
              aria-expanded={locationModal}
              aria-controls="location-picker-panel"
              aria-label={locationModal ? 'Close location picker' : 'Change location'}
              className="px-3.5 py-1.5 rounded-btn border border-brand-border dark:border-slate-700 font-semibold text-brand-text dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none"
            >
              {locationModal ? 'Close' : 'Change'}
            </button>
          </div>

          <LocationModal
            isOpen={locationModal}
            onClose={() => setLocationModal(false)}
            availableCities={availableCities}
            currentCity={currentCity}
            onSelectCity={(city) => {
              selectCity(city);
              showToast(`Location updated to ${city.name}`, undefined, 'info');
            }}
          />
        </div>

        {/* 2. Reset Household Questionnaire */}
        <div className="py-3 px-4 md:px-5 md:py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-btn bg-brand-bg dark:bg-slate-800 text-brand-teal dark:text-emerald-400 mt-0.5">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[15px] text-brand-text dark:text-white">
                Reset Household Questionnaire
              </h3>
              <p className="text-brand-text-secondary dark:text-slate-400 mt-0.5">
                Re-calibrate your lifestyle, ventilation, and family precautions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={retakeOnboarding}
            className="px-3.5 py-1.5 rounded-btn border border-brand-border dark:border-slate-700 font-semibold text-brand-text dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            Retake Wizard
          </button>
        </div>

        {/* 3. Family Profile */}
        <div>
          <div className="py-3 px-4 md:px-5 md:py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-btn bg-brand-bg dark:bg-slate-800 text-brand-teal dark:text-emerald-400 mt-0.5">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-[15px] text-brand-text dark:text-white">
                  Family Profile
                </h3>
                <p className="text-brand-text-secondary dark:text-slate-400 mt-0.5">
                  Manage family members & sensitivity profiles
                </p>
                <span className="text-[11px] text-slate-400">
                  Current: {getHouseholdSummary(userProfile?.householdMembers)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFamilyModal(!familyModal)}
              aria-expanded={familyModal}
              aria-controls="family-picker-panel"
              aria-label={familyModal ? 'Close family profile manager' : 'Manage family profile'}
              className="px-3.5 py-1.5 rounded-btn border border-brand-border dark:border-slate-700 font-semibold text-brand-text dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:outline-none"
            >
              {familyModal ? 'Close' : 'Manage'}
            </button>
          </div>

          <FamilyModal
            isOpen={familyModal}
            onClose={() => setFamilyModal(false)}
            userProfile={userProfile}
            onUpdateProfile={updateUserProfile}
            showToast={showToast}
          />
        </div>

        {/* 4. Appearance & 5. About */}
        <SettingsAppearanceAbout preferences={preferences} updatePreferences={updatePreferences} />
      </div>
    </div>
  );
};
