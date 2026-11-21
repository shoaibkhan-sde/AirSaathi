export type AQICategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Satisfactory'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface CandidateLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  postcode?: string;
}

export interface PollutantDetail {
  code: string;
  name: string;
  value: number;
  unit: string;
  status: AQICategory;
  standardLimit: string;
  healthImpact: string;
  sources: string;
}

export interface CityLocation {
  id: string;
  name: string;
  city?: string;
  region: string;
  country: string;
  locality?: string;
  district?: string;
  state?: string;
  attribution?: string;
  stationName: string;
  aqi: number;
  category: AQICategory;
  dominantPollutant: string;
  lastUpdated: string;
  freshness: string;
  temperature: string;
  humidity: string;
  windSpeed: string;
  isDemo: boolean;
  latitude?: number;
  longitude?: number;
  scale?: string;
  source?: string;
  modelNotice?: string;
  spatialResolutionKm?: number;
  pm2_5?: number | null;
  pm10?: number | null;
  pollutants?: PollutantDetail[];
}
