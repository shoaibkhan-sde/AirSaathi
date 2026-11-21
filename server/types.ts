export type AQICategoryUS =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface LocationHierarchy {
  city?: string; // Settlement name only: city, town, village, or municipality
  locality?: string; // Suburb, neighborhood, or quarter
  district?: string; // Administrative district or county
  state?: string; // State or province
  country?: string; // Country name
  countryCode?: string; // ISO 3166-1 alpha-2
  postcode?: string; // Postal code
}

export interface LocationResolveRequest {
  query?: string;
  countryCode?: string;
  previousCountry?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface CandidateLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  postcode?: string;
  attribution?: string;
}

export interface ResolvedLocation extends LocationHierarchy {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  source: 'manual' | 'geolocation' | 'pin';
  precision: 'city' | 'coordinates' | 'postal_code';
  candidates?: CandidateLocation[];
  attribution?: string;
}

export interface PollutantValues {
  pm2_5: number | null;
  pm10: number | null;
  unit: 'µg/m³';
}

export interface AirQualityCurrentResponse {
  value: number;
  scale: 'US AQI';
  category: AQICategoryUS;
  dataType: 'model_estimate';
  source: 'Open-Meteo CAMS Global';
  observedAt: string;
  fetchedAt: string;
  spatialResolutionKm: number;
  timezone: string;
  pollutants: PollutantValues;
  dominantPollutant: string;
  modelNotice: string;
}

export interface BackendRecommendation {
  id: string;
  title: string;
  description: string;
  category?: 'routine' | 'indoor' | 'travel';
  iconType?: 'window' | 'purifier' | 'bike' | 'plant' | 'mask' | 'stove' | 'workout';
  whyItMatters: string;
  alternative?: string;
  effort: 'Low' | 'Medium' | 'High';
  priority: 'High' | 'Medium' | 'Low';
  relevantProfileFactors: string[];
  sourceCategory: string;
  saved: boolean;
  completed: boolean;
}

export interface OnboardingCompleteRequest {
  location: {
    query?: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    country?: string;
  };
  householdMembers: string[];
  healthSensitivities?: string[];
  commuteMode: string;
  homeType: string;
  cookingFuel: string;
  heatingFuel: string;
  hasAirPurifier?: boolean;
  ventilationType?: string;
  indoorSmoking?: string;
  budgetPreference?: string;
}

export interface OnboardingCompleteResponse {
  status: 'success';
  location: ResolvedLocation;
  airQuality: AirQualityCurrentResponse;
  recommendations: BackendRecommendation[];
}

export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'LOCATION_NOT_FOUND'
  | 'LOCATION_AMBIGUOUS'
  | 'GEOLOCATION_UNAVAILABLE'
  | 'AIR_QUALITY_UNAVAILABLE'
  | 'UPSTREAM_TIMEOUT'
  | 'INVALID_UPSTREAM_RESPONSE'
  | 'INTERNAL_ERROR';

export interface ApiErrorResponse {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
}
