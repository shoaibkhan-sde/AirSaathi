import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BackgroundLeaves } from '../common/BackgroundLeaves';
import { OnboardingHeader } from './OnboardingHeader';
import { HouseholdStep } from './HouseholdStep';
import { LifestyleStep } from './LifestyleStep';
import { useOnboardingForm } from './useOnboardingForm';

export const OnboardingView: React.FC = () => {
  const { userProfile, saveUserProfile, completeOnboarding, showToast } = useApp();
  const [step, setStep] = useState<1 | 2>(1);

  const form = useOnboardingForm(userProfile, saveUserProfile, completeOnboarding, showToast);

  return (
    <div className="min-h-screen bg-[#F6FAF7] dark:bg-[#0E1614] flex flex-col justify-between relative overflow-hidden transition-colors selection:bg-[#20836D]/20">
      <BackgroundLeaves />
      <OnboardingHeader step={step} />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 focus:outline-none"
      >
        {step === 1 ? (
          <HouseholdStep
            country={form.country}
            onCountryChange={form.setCountry}
            cityOrPin={form.cityOrPin}
            onCityOrPinChange={form.handleCityOrPinChange}
            isLocating={form.isLocating}
            onUseMyLocation={form.handleUseMyLocation}
            locationSuccessMsg={form.locationSuccessMsg}
            locationErrorMsg={form.locationErrorMsg}
            householdMembers={form.householdMembers}
            onToggleHousehold={form.toggleHouseholdOption}
            healthConsiderations={form.healthConsiderations}
            onToggleHealth={form.toggleHealthOption}
            healthOtherText={form.healthOtherText}
            onHealthOtherChange={form.setHealthOtherText}
            onContinue={() => setStep(2)}
            isValid={form.isStep1Valid}
          />
        ) : (
          <LifestyleStep
            commuteMode={form.commuteMode}
            onCommuteChange={form.setCommuteMode}
            homeType={form.homeType}
            onHomeTypeChange={form.setHomeType}
            cookingFuel={form.cookingFuel}
            onCookingFuelChange={form.setCookingFuel}
            heatingFuel={form.heatingFuel}
            onHeatingFuelChange={form.setHeatingFuel}
            hasAirPurifier={form.hasAirPurifier}
            onAirPurifierChange={form.setHasAirPurifier}
            ventilationType={form.ventilationType}
            onVentilationChange={form.setVentilationType}
            indoorSmoking={form.indoorSmoking}
            onSmokingChange={form.setIndoorSmoking}
            onBack={() => setStep(1)}
            onSubmit={form.handleGeneratePlan}
            submissionState={form.submissionState}
            isSubmitting={form.isSubmitting}
            isValid={form.isStep2Valid}
          />
        )}
      </main>

      <footer className="w-full py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10 border-t border-[#D5ECE3]/50 dark:border-[#224A37]/50">
        AirSaathi • Personalized Indoor & Commute Clean-Air Intelligence
      </footer>
    </div>
  );
};
