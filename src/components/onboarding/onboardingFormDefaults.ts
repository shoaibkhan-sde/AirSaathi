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

export interface FormLocationState {
  country: string;
  cityOrPin: string;
  detectedCoords?: { lat: number; lon: number };
  locationSource: 'manual' | 'geolocation' | 'pin';
}

export interface FormLifestyleState {
  householdMembers: HouseholdOption[];
  healthConsiderations: string[];
  healthOtherText: string;
  commuteMode: CommuteMode | '';
  homeType: HomeType | '';
  cookingFuel: CookingFuel | '';
  heatingFuel: HeatingFuel | '';
  hasAirPurifier: boolean;
  ventilationType: VentilationType;
  indoorSmoking: IndoorSmokingType;
}

export function getInitialLocationState(userProfile: UserProfile | null): FormLocationState {
  const isCustomCity =
    userProfile?.city &&
    userProfile.city !== 'Your location' &&
    !userProfile.city.includes('device location');

  return {
    country: userProfile?.country || 'India',
    cityOrPin: isCustomCity ? userProfile.city : '',
    detectedCoords:
      userProfile?.locationSource === 'geolocation' &&
      userProfile?.latitude &&
      userProfile?.longitude
        ? { lat: userProfile.latitude, lon: userProfile.longitude }
        : undefined,
    locationSource: userProfile?.locationSource || 'manual',
  };
}

export function getInitialLifestyleState(userProfile: UserProfile | null): FormLifestyleState {
  return {
    householdMembers:
      userProfile?.householdMembers && userProfile.householdMembers.length > 0
        ? userProfile.householdMembers
        : ['adults_only'],
    healthConsiderations: userProfile?.healthConsiderations || [],
    healthOtherText: userProfile?.healthOther || '',
    commuteMode: userProfile?.commuteMode || '',
    homeType: userProfile?.homeType || '',
    cookingFuel: userProfile?.cookingFuel || '',
    heatingFuel: userProfile?.heatingFuel || '',
    hasAirPurifier: userProfile?.hasAirPurifier ?? true,
    ventilationType: userProfile?.ventilationType || 'Mostly closed windows',
    indoorSmoking: userProfile?.indoorSmoking || 'No',
  };
}

export interface BuildProfileArgs {
  country: string;
  cityOrPin: string;
  locationSource: 'manual' | 'geolocation' | 'pin';
  detectedCoords?: { lat: number; lon: number };
  householdMembers: HouseholdOption[];
  healthConsiderations: string[];
  healthOtherText: string;
  commuteMode: CommuteMode | '';
  homeType: HomeType | '';
  cookingFuel: CookingFuel | '';
  heatingFuel: HeatingFuel | '';
  hasAirPurifier: boolean;
  ventilationType: VentilationType;
  indoorSmoking: IndoorSmokingType;
}

export function buildOnboardingProfile(args: BuildProfileArgs): UserProfile {
  const isManualOrPin =
    Boolean(args.cityOrPin.trim()) || args.locationSource === 'manual' || args.locationSource === 'pin';
  const finalCity = args.cityOrPin.trim() || 'Your location';
  const finalSource = args.cityOrPin.trim()
    ? /^\d+$/.test(args.cityOrPin.trim())
      ? 'pin'
      : 'manual'
    : args.locationSource;

  return {
    country: args.country,
    city: finalCity,
    postalCode: /^\d{5,6}$/.test(args.cityOrPin.trim()) ? args.cityOrPin.trim() : undefined,
    latitude: isManualOrPin ? undefined : args.detectedCoords?.lat,
    longitude: isManualOrPin ? undefined : args.detectedCoords?.lon,
    locationSource: finalSource,
    householdMembers: args.householdMembers,
    healthConsiderations: args.healthConsiderations,
    healthOther: args.healthConsiderations.includes('Other') ? args.healthOtherText : undefined,
    commuteMode: args.commuteMode as CommuteMode,
    homeType: args.homeType as HomeType,
    cookingFuel: args.cookingFuel as CookingFuel,
    heatingFuel: args.heatingFuel as HeatingFuel,
    hasAirPurifier: args.hasAirPurifier,
    ventilationType: args.ventilationType,
    indoorSmoking: args.indoorSmoking,
    onboardingCompleted: true,
  };
}
