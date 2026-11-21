import { useState } from 'react';
import type {
  UserProfile,
  HouseholdOption,
  CommuteMode,
  HomeType,
  CookingFuel,
  HeatingFuel,
  VentilationType,
  IndoorSmokingType,
} from '../../types';
import { detectDeviceLocation } from '../../services/airQualityService';
import {
  getInitialLocationState,
  getInitialLifestyleState,
  buildOnboardingProfile,
} from './onboardingFormDefaults';

export type SubmissionState = 'idle' | 'loading' | 'success';

export function useOnboardingForm(
  userProfile: UserProfile | null,
  saveUserProfile: (profile: UserProfile) => Promise<unknown>,
  completeOnboarding: () => void,
  showToast: (title: string, message?: string, type?: 'success' | 'warning' | 'error') => void
) {
  const initLoc = getInitialLocationState(userProfile);
  const initLife = getInitialLifestyleState(userProfile);

  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string>('');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string>('');

  const [country, setCountry] = useState<string>(initLoc.country);
  const [cityOrPin, setCityOrPin] = useState<string>(initLoc.cityOrPin);
  const [detectedCoords, setDetectedCoords] = useState<{ lat: number; lon: number } | undefined>(
    initLoc.detectedCoords
  );
  const [locationSource, setLocationSource] = useState<'manual' | 'geolocation' | 'pin'>(
    initLoc.locationSource
  );

  const [householdMembers, setHouseholdMembers] = useState<HouseholdOption[]>(
    initLife.householdMembers
  );
  const [healthConsiderations, setHealthConsiderations] = useState<string[]>(
    initLife.healthConsiderations
  );
  const [healthOtherText, setHealthOtherText] = useState<string>(initLife.healthOtherText);
  const [commuteMode, setCommuteMode] = useState<CommuteMode | ''>(initLife.commuteMode);
  const [homeType, setHomeType] = useState<HomeType | ''>(initLife.homeType);
  const [cookingFuel, setCookingFuel] = useState<CookingFuel | ''>(initLife.cookingFuel);
  const [heatingFuel, setHeatingFuel] = useState<HeatingFuel | ''>(initLife.heatingFuel);
  const [hasAirPurifier, setHasAirPurifier] = useState<boolean>(initLife.hasAirPurifier);
  const [ventilationType, setVentilationType] = useState<VentilationType>(initLife.ventilationType);
  const [indoorSmoking, setIndoorSmoking] = useState<IndoorSmokingType>(initLife.indoorSmoking);

  const toggleHouseholdOption = (option: HouseholdOption) => {
    if (option === 'adults_only') {
      setHouseholdMembers(householdMembers.includes('adults_only') ? [] : ['adults_only']);
    } else {
      const filtered = householdMembers.filter((m) => m !== 'adults_only');
      setHouseholdMembers(
        filtered.includes(option) ? filtered.filter((m) => m !== option) : [...filtered, option]
      );
    }
  };

  const toggleHealthOption = (option: string) => {
    if (healthConsiderations.includes(option)) {
      setHealthConsiderations(healthConsiderations.filter((h) => h !== option));
      if (option === 'Other') setHealthOtherText('');
    } else {
      setHealthConsiderations([...healthConsiderations, option]);
    }
  };

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setLocationErrorMsg('');
    setLocationSuccessMsg('');
    setLocationSource('geolocation');
    setCityOrPin('');
    if (householdMembers.length === 0) setHouseholdMembers(['adults_only']);

    try {
      const detected = await detectDeviceLocation(country);
      setCityOrPin('');
      if (detected.country) setCountry(detected.country);
      setDetectedCoords(detected.coords);
      setLocationSource('geolocation');
      setLocationSuccessMsg('Using your device location. It is not stored.');
      showToast('Location Detected', 'Using your device location. It is not stored.', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not access device location.';
      setLocationErrorMsg(message);
      showToast(
        'Location Access Required',
        'Please enter your city or PIN code manually.',
        'warning'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleCityOrPinChange = (val: string) => {
    setCityOrPin(val);
    setLocationSource(/^\d+$/.test(val.trim()) ? 'pin' : 'manual');
    setDetectedCoords(undefined);
    setLocationSuccessMsg('');
    setLocationErrorMsg('');
  };

  const isLocationProvided =
    locationSource === 'geolocation' || Boolean(detectedCoords) || cityOrPin.trim().length >= 2;
  const isStep1Valid = Boolean(country && isLocationProvided && householdMembers.length > 0);
  const isStep2Valid = Boolean(commuteMode && homeType && cookingFuel && heatingFuel);

  const handleGeneratePlan = async () => {
    if (!isStep2Valid || submissionState !== 'idle') return;
    setSubmissionState('loading');
    try {
      const profileData = buildOnboardingProfile({
        country,
        cityOrPin,
        locationSource,
        detectedCoords,
        householdMembers,
        healthConsiderations,
        healthOtherText,
        commuteMode,
        homeType,
        cookingFuel,
        heatingFuel,
        hasAirPurifier,
        ventilationType,
        indoorSmoking,
      });

      const minDelay = new Promise((resolve) => setTimeout(resolve, 1400));
      await Promise.all([saveUserProfile(profileData), minDelay]);
      setSubmissionState('success');
      setTimeout(() => {
        completeOnboarding();
      }, 500);
    } catch {
      setSubmissionState('idle');
      showToast(
        'Unable to Save Plan',
        'Could not initialize your plan. Please check your connection and try again.',
        'error'
      );
    }
  };

  return {
    submissionState,
    isSubmitting: submissionState !== 'idle',
    isLocating,
    locationSuccessMsg,
    locationErrorMsg,
    country,
    setCountry,
    cityOrPin,
    handleCityOrPinChange,
    householdMembers,
    toggleHouseholdOption,
    healthConsiderations,
    toggleHealthOption,
    healthOtherText,
    setHealthOtherText,
    commuteMode,
    setCommuteMode,
    homeType,
    setHomeType,
    cookingFuel,
    setCookingFuel,
    heatingFuel,
    setHeatingFuel,
    hasAirPurifier,
    setHasAirPurifier,
    ventilationType,
    setVentilationType,
    indoorSmoking,
    setIndoorSmoking,
    handleUseMyLocation,
    handleGeneratePlan,
    isStep1Valid,
    isStep2Valid,
  };
}
