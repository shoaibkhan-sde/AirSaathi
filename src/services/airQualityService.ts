import type { CityLocation, AQICategory } from '../types';
import { CPCB_CATEGORIES } from '../data/mockData.ts';
import { KNOWN_LOCATIONS } from './locationDirectory.ts';
import type { LocationDirectoryItem } from './locationDirectory.ts';
import {
  COORDINATE_DECIMAL_FACTOR,
  GEOLOCATION_TIMEOUT_MS,
  GEOLOCATION_MAX_AGE_MS,
} from './aqiConstants.ts';
import {
  mapUSAQICategory,
  findLocationByQuery,
  buildResolvedLocation,
  buildOfflineFallback,
} from './airQualityBuilder.ts';

export type { LocationDirectoryItem };
export { KNOWN_LOCATIONS, mapUSAQICategory, findLocationByQuery };

interface ClientAQICacheEntry {
  data: CityLocation;
  timestamp: number;
}

const clientAqiCache = new Map<string, ClientAQICacheEntry>();
const inFlightAqiRequests = new Map<string, Promise<CityLocation>>();
export const CLIENT_AQI_CACHE_TTL_MS = 15 * 60 * 1000;

export function clearClientAQICache(): void {
  clientAqiCache.clear();
  inFlightAqiRequests.clear();
}

export function getAQICategory(aqi: number): AQICategory {
  const found = CPCB_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max);
  return (found ? found.category : 'Severe') as AQICategory;
}

async function fetchApiLocationAqi(
  query: string,
  country: string,
  rounded?: { lat: number; lon: number }
): Promise<CityLocation | null> {
  try {
    const locRes = await fetch('/api/location/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query.trim() || undefined,
        countryCode: country === 'India' ? 'IN' : undefined,
        previousCountry: country,
        latitude: rounded?.lat,
        longitude: rounded?.lon,
      }),
    });
    if (!locRes.ok) return null;

    const loc = (await locRes.json()).location;
    const aqiRes = await fetch('/api/air-quality/current', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: loc.latitude,
        longitude: loc.longitude,
        countryCode: loc.countryCode,
      }),
    });
    if (!aqiRes.ok) return null;

    const aqiData = (await aqiRes.json()).airQuality;
    return buildResolvedLocation(loc, aqiData, loc.latitude, loc.longitude);
  } catch {
    return null;
  }
}

export async function resolveLocationAQI(
  query = 'Delhi',
  country = 'India',
  coords?: { lat: number; lon: number }
): Promise<CityLocation> {
  const isExplicit =
    query.trim() &&
    query.trim().toLowerCase() !== 'your location' &&
    query.trim().toLowerCase() !== 'current location';

  const rounded =
    !isExplicit && coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lon)
      ? {
          lat: Math.round(coords.lat * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR,
          lon: Math.round(coords.lon * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR,
        }
      : undefined;

  const cacheKey = `${query.trim().toLowerCase()}_${country.toLowerCase()}_${rounded?.lat ?? ''}_${rounded?.lon ?? ''}`;
  const cached = clientAqiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_AQI_CACHE_TTL_MS) {
    return cached.data;
  }

  const existing = inFlightAqiRequests.get(cacheKey);
  if (existing) return existing;

  const fetchPromise = (async () => {
    const apiResult = await fetchApiLocationAqi(query, country, rounded);
    if (apiResult) {
      clientAqiCache.set(cacheKey, { data: apiResult, timestamp: Date.now() });
      return apiResult;
    }
    return buildOfflineFallback(query, country);
  })().finally(() => {
    inFlightAqiRequests.delete(cacheKey);
  });

  inFlightAqiRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export interface DeviceLocationResult {
  city: string;
  name: string;
  country?: string;
  countryCode?: string;
  district?: string;
  state?: string;
  locality?: string;
  postalCode?: string;
  attribution?: string;
  coords: { lat: number; lon: number };
}

async function resolveCoordsWithBackend(
  lat: number,
  lon: number,
  currentCountry?: string
): Promise<DeviceLocationResult> {
  try {
    const res = await fetch('/api/location/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude: lat, longitude: lon, previousCountry: currentCountry }),
    });
    if (res.ok) {
      const loc = (await res.json()).location;
      return {
        city: loc.city || loc.name || 'Current Location',
        name: loc.name || loc.city || 'Current Location',
        country: loc.country && loc.country !== 'Unknown' ? loc.country : currentCountry,
        countryCode: loc.countryCode,
        district: loc.district,
        state: loc.state,
        locality: loc.locality,
        postalCode: loc.postcode,
        attribution: loc.attribution,
        coords: { lat, lon },
      };
    }
  } catch {
    // Return fallback
  }

  return {
    city: 'Current Location',
    name: 'Current Location',
    country: currentCountry,
    coords: { lat, lon },
  };
}

export async function detectDeviceLocation(
  currentCountry?: string
): Promise<DeviceLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your current browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat =
          Math.round(pos.coords.latitude * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR;
        const lon =
          Math.round(pos.coords.longitude * COORDINATE_DECIMAL_FACTOR) / COORDINATE_DECIMAL_FACTOR;
        const result = await resolveCoordsWithBackend(lat, lon, currentCountry);
        resolve(result);
      },
      (err) =>
        reject(
          new Error(
            err.code === 1 ? 'Location permission was denied.' : 'Location position is unavailable.'
          )
        ),
      {
        timeout: GEOLOCATION_TIMEOUT_MS,
        enableHighAccuracy: true,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
      }
    );
  });
}
