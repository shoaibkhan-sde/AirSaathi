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
export const CLIENT_AQI_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

export function clearClientAQICache(): void {
  clientAqiCache.clear();
  inFlightAqiRequests.clear();
}

export function getAQICategory(aqi: number): AQICategory {
  const found = CPCB_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max);
  return (found ? found.category : 'Severe') as AQICategory;
}

export async function resolveLocationAQI(
  query: string,
  country: string = 'India',
  coords?: { lat: number; lon: number }
): Promise<CityLocation> {
  const isExplicit = Boolean(
    query &&
    query.trim() !== 'Your location' &&
    !query.toLowerCase().includes('device location') &&
    !query.toLowerCase().includes('current location')
  );

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
  if (existing) {
    return existing;
  }

  const fetchPromise = (async () => {
    try {
      const locRes = await fetch('/api/location/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query?.trim() || undefined,
          countryCode: country === 'India' ? 'IN' : undefined,
          previousCountry: country,
          latitude: rounded?.lat,
          longitude: rounded?.lon,
        }),
      });

      if (locRes.ok) {
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
        if (aqiRes.ok) {
          const resolved = buildResolvedLocation(
            loc,
            (await aqiRes.json()).airQuality,
            loc.latitude,
            loc.longitude
          );
          clientAqiCache.set(cacheKey, { data: resolved, timestamp: Date.now() });
          return resolved;
        }
      }
    } catch {
      // Graceful offline fallback
    }

    return buildOfflineFallback(query, country);
  })().finally(() => {
    inFlightAqiRequests.delete(cacheKey);
  });

  inFlightAqiRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
}

export async function detectDeviceLocation(currentCountry?: string): Promise<{
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
}> {
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

        try {
          const res = await fetch('/api/location/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: lat,
              longitude: lon,
              previousCountry: currentCountry,
            }),
          });
          if (res.ok) {
            const loc = (await res.json()).location;
            resolve({
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
            });
            return;
          }
        } catch {
          // Fallback
        }

        resolve({
          city: 'Current Location',
          name: 'Current Location',
          country: currentCountry,
          coords: { lat, lon },
        });
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
