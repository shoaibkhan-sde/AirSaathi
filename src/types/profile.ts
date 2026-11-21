export type HouseholdOption = 'children' | 'seniors' | 'adults_only';

export function getHouseholdSummary(members?: HouseholdOption[]): string {
  if (!members || members.length === 0 || members.includes('adults_only')) {
    return 'Adults (18 to 65 only)';
  }
  const parts: string[] = [];
  if (members.includes('children')) parts.push('Children (under 12)');
  if (members.includes('seniors')) parts.push('Adults (65+)');
  return parts.join(', ');
}

export type CommuteMode =
  | 'Walking'
  | 'Bicycle'
  | 'Bus'
  | 'Metro or train'
  | 'Car'
  | 'Motorcycle or scooter'
  | 'Work from home'
  | 'Other';

export type HomeType = 'Apartment' | 'Independent house' | 'Shared accommodation' | 'Other';

export type CookingFuel =
  'LPG or piped gas' | 'Electricity / induction' | 'Biomass / wood' | 'Kerosene' | 'Other';

export type HeatingFuel =
  | 'Electric heater / heat pump'
  | 'LPG / natural gas'
  | 'Wood / biomass'
  | 'Other fuel'
  | 'No heating / Not applicable';

export type VentilationType =
  | 'Open windows regularly'
  | 'Mostly closed windows'
  | 'Mechanical ventilation / AC'
  | 'Depends on outdoor air quality';

export type IndoorSmokingType = 'Yes' | 'No' | 'Prefer not to say';

export interface UserProfile {
  country: string;
  city: string;
  locality?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  locationSource: 'manual' | 'geolocation' | 'pin';
  attribution?: string;
  householdMembers: HouseholdOption[];
  healthConsiderations: string[];
  healthOther?: string;
  commuteMode: CommuteMode;
  homeType: HomeType;
  cookingFuel: CookingFuel;
  heatingFuel: HeatingFuel;
  hasAirPurifier: boolean;
  ventilationType: VentilationType;
  indoorSmoking: IndoorSmokingType;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
}
