import React from 'react';
import { ArrowLeft, ArrowRight, Leaf, Check } from 'lucide-react';
import type {
  CommuteMode,
  HomeType,
  CookingFuel,
  HeatingFuel,
  VentilationType,
  IndoorSmokingType,
} from '../../types';
import type { SubmissionState } from './useOnboardingForm';
import { PrimaryHomeLifestyleFields } from './lifestyle/PrimaryHomeLifestyleFields';
import { LifestyleAdditionalDetails } from './lifestyle/LifestyleAdditionalDetails';

interface LifestyleStepProps {
  commuteMode: CommuteMode | '';
  onCommuteChange: (val: CommuteMode) => void;
  homeType: HomeType | '';
  onHomeTypeChange: (val: HomeType) => void;
  cookingFuel: CookingFuel | '';
  onCookingFuelChange: (val: CookingFuel) => void;
  heatingFuel: HeatingFuel | '';
  onHeatingFuelChange: (val: HeatingFuel) => void;
  hasAirPurifier: boolean;
  onAirPurifierChange: (val: boolean) => void;
  ventilationType: VentilationType;
  onVentilationChange: (val: VentilationType) => void;
  indoorSmoking: IndoorSmokingType;
  onSmokingChange: (val: IndoorSmokingType) => void;
  onBack: () => void;
  onSubmit: () => void;
  submissionState?: SubmissionState;
  isSubmitting: boolean;
  isValid: boolean;
}

export const LifestyleStep: React.FC<LifestyleStepProps> = ({
  commuteMode,
  onCommuteChange,
  homeType,
  onHomeTypeChange,
  cookingFuel,
  onCookingFuelChange,
  heatingFuel,
  onHeatingFuelChange,
  hasAirPurifier,
  onAirPurifierChange,
  ventilationType,
  onVentilationChange,
  indoorSmoking,
  onSmokingChange,
  onBack,
  onSubmit,
  submissionState,
  isSubmitting,
  isValid,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      <div className="bg-white dark:bg-[#182622] rounded-2xl sm:rounded-3xl border border-[#D5ECE3] dark:border-[#284237] p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4 sm:space-y-5">
        <PrimaryHomeLifestyleFields
          commuteMode={commuteMode}
          onCommuteChange={onCommuteChange}
          homeType={homeType}
          onHomeTypeChange={onHomeTypeChange}
          cookingFuel={cookingFuel}
          onCookingFuelChange={onCookingFuelChange}
          heatingFuel={heatingFuel}
          onHeatingFuelChange={onHeatingFuelChange}
        />

        <LifestyleAdditionalDetails
          hasAirPurifier={hasAirPurifier}
          onAirPurifierChange={onAirPurifierChange}
          ventilationType={ventilationType}
          onVentilationChange={onVentilationChange}
          indoorSmoking={indoorSmoking}
          onSmokingChange={onSmokingChange}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-[48px] sm:h-[52px] px-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-[#182622] font-bold text-sm text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || (submissionState ? submissionState !== 'idle' : isSubmitting)}
          aria-busy={submissionState === 'loading'}
          className={`flex-1 sm:flex-initial h-[48px] sm:h-[52px] px-6 sm:px-8 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-subtle focus-visible:outline-none ${
            submissionState === 'success'
              ? 'bg-[#107569] text-white shadow-card cursor-default'
              : submissionState === 'loading'
                ? 'bg-[#087C73] text-white opacity-95 cursor-wait'
                : isValid && !isSubmitting
                  ? 'bg-[#087C73] hover:bg-[#066760] text-white cursor-pointer hover:shadow-card'
                  : 'bg-[#C7DFD7] dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          }`}
        >
          {submissionState === 'loading' ? (
            <>
              <Leaf className="w-5 h-5 animate-spin motion-reduce:animate-pulse text-emerald-200" />
              <span>Preparing Your Clean-Air Plan...</span>
            </>
          ) : submissionState === 'success' ? (
            <>
              <Check className="w-5 h-5 text-white stroke-[3] animate-scale-in" />
              <span>Plan Ready!</span>
            </>
          ) : (
            <>
              <span>Generate My Clean-Air Plan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
