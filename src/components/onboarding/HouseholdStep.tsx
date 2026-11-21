import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import type { HouseholdOption } from '../../types';
import { LocationSelectorCard } from './LocationSelectorCard';
import { HouseholdCard } from './HouseholdCard';
import { OnboardingSideCard } from './OnboardingSideCard';

interface HouseholdStepProps {
  country: string;
  onCountryChange: (val: string) => void;
  cityOrPin: string;
  onCityOrPinChange: (val: string) => void;
  isLocating: boolean;
  onUseMyLocation: () => void;
  locationSuccessMsg: string;
  locationErrorMsg: string;
  householdMembers: HouseholdOption[];
  onToggleHousehold: (opt: HouseholdOption) => void;
  healthConsiderations: string[];
  onToggleHealth: (opt: string) => void;
  healthOtherText: string;
  onHealthOtherChange: (text: string) => void;
  onContinue: () => void;
  isValid: boolean;
}

export const HouseholdStep: React.FC<HouseholdStepProps> = ({
  country,
  onCountryChange,
  cityOrPin,
  onCityOrPinChange,
  isLocating,
  onUseMyLocation,
  locationSuccessMsg,
  locationErrorMsg,
  householdMembers,
  onToggleHousehold,
  healthConsiderations,
  onToggleHealth,
  healthOtherText,
  onHealthOtherChange,
  onContinue,
  isValid,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col space-y-4 sm:space-y-5">
          <LocationSelectorCard
            country={country}
            onCountryChange={onCountryChange}
            cityOrPin={cityOrPin}
            onCityOrPinChange={onCityOrPinChange}
            isLocating={isLocating}
            onUseMyLocation={onUseMyLocation}
            locationSuccessMsg={locationSuccessMsg}
            locationErrorMsg={locationErrorMsg}
          />

          <HouseholdCard
            householdMembers={householdMembers}
            onToggleHousehold={onToggleHousehold}
            healthConsiderations={healthConsiderations}
            onToggleHealth={onToggleHealth}
            healthOtherText={healthOtherText}
            onHealthOtherChange={onHealthOtherChange}
          />
        </div>

        <OnboardingSideCard step={1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <button
            type="button"
            onClick={onContinue}
            disabled={!isValid}
            className={`w-full h-[52px] px-6 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-subtle ${
              isValid
                ? 'bg-[#087C73] hover:bg-[#066760] text-white cursor-pointer hover:shadow-card'
                : 'bg-[#C7DFD7] dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Continue to lifestyle</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[12px] text-slate-500 dark:text-slate-400 mt-2">
            Your location is needed to calculate local AQI. Household details can be updated later.
          </p>
        </div>

        <div className="lg:col-span-4">
          <div className="h-[52px] px-3.5 rounded-xl bg-white/90 dark:bg-[#182622] border border-[#CCE8DC] dark:border-[#224A35] shadow-xs flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight">
                Your details stay in your control
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                You can update your answers anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
