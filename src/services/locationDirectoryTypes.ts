import type { PollutantDetail } from '../types';

export interface LocationDirectoryItem {
  id: string;
  name: string;
  region: string;
  country: string;
  pinCodes: string[];
  lat: number;
  lon: number;
  stationName: string;
  baselineAQI: number;
  dominantPollutant: string;
  temp: string;
  humidity: string;
  wind: string;
  pollutants: PollutantDetail[];
}
