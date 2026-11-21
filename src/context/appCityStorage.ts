import type { CityLocation } from '../types/index.ts';
import { DEFAULT_GENUINE_CITIES } from '../data/mockData.ts';

export const MAX_GENUINE_LOCATIONS = 5;
export const RECENT_LOCATIONS_STORAGE_KEY = 'airsaathi_recent_locations';
export const CURRENT_CITY_STORAGE_KEY = 'airsaathi_current_city';

export function loadInitialRecentCities(): CityLocation[] {
  try {
    const raw = localStorage.getItem(RECENT_LOCATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, MAX_GENUINE_LOCATIONS);
      }
    }
  } catch {
    // Storage unavailable
  }
  return DEFAULT_GENUINE_CITIES.slice(0, MAX_GENUINE_LOCATIONS);
}

export function loadInitialCurrentCity(fallback: CityLocation): CityLocation {
  try {
    const raw = localStorage.getItem(CURRENT_CITY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return parsed as CityLocation;
      }
    }
  } catch {
    // Storage unavailable
  }
  return fallback;
}
