import type { LocationResolveRequest, ResolvedLocation } from './types.ts';
import {
  MIN_LATITUDE,
  MAX_LATITUDE,
  MIN_LONGITUDE,
  MAX_LONGITUDE,
  COORDINATE_ROUND_FACTOR,
  DEFAULT_CACHE_TTL_MS,
  DEFAULT_COUNTRY,
} from './constants.ts';
import { SerializedRateLimiter, nominatimRateLimiter } from './rateLimiter.ts';
import { activeReverseProvider, NominatimReverseProvider } from './reverseGeocoding.ts';
import type { ReverseGeocodingProvider } from './reverseGeocoding.ts';
import { findStaticLocation } from './staticLocations.ts';
import {
  forwardGeocodePin,
  forwardGeocodeOpenMeteo,
  forwardGeocodeNominatim,
} from './forwardGeocoding.ts';

export {
  SerializedRateLimiter,
  nominatimRateLimiter,
  activeReverseProvider,
  NominatimReverseProvider,
};
export type { ReverseGeocodingProvider };

interface CacheEntry {
  data: ResolvedLocation;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function roundCoordinate(val: number): number {
  return Math.round(val * COORDINATE_ROUND_FACTOR) / COORDINATE_ROUND_FACTOR;
}

export function isValidCoordinate(lat?: unknown, lon?: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= MIN_LATITUDE &&
    lat <= MAX_LATITUDE &&
    lon >= MIN_LONGITUDE &&
    lon <= MAX_LONGITUDE
  );
}

function checkCache(cacheKey: string): ResolvedLocation | null {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DEFAULT_CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function saveCache(cacheKey: string, data: ResolvedLocation): ResolvedLocation {
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

/**
 * Resolves a manual text query or PIN code using local registry and forward providers.
 */
async function resolveForwardQuery(query: string, countryCode?: string): Promise<ResolvedLocation> {
  const code = countryCode ? countryCode.trim().toUpperCase() : 'IN';
  const cacheKey = `query_${code}_${query.toLowerCase()}`;
  const cached = checkCache(cacheKey);
  if (cached) return cached;

  const staticMatch = findStaticLocation(query);
  if (staticMatch) {
    const isPin = /^\d{4,6}$/.test(query);
    return saveCache(cacheKey, {
      id: `loc_${staticMatch.city.toLowerCase()}`,
      name: staticMatch.city,
      city: staticMatch.city,
      region: staticMatch.region,
      state: staticMatch.region,
      country: staticMatch.country,
      countryCode: staticMatch.countryCode,
      latitude: roundCoordinate(staticMatch.lat),
      longitude: roundCoordinate(staticMatch.lon),
      postcode: isPin ? query : staticMatch.pinCodes[0],
      source: isPin ? 'pin' : 'manual',
      precision: isPin ? 'postal_code' : 'city',
    });
  }

  if (/^\d{4,6}$/.test(query)) {
    const pinRes = await forwardGeocodePin(query);
    if (pinRes) return saveCache(cacheKey, pinRes);
  }

  const openMeteoRes = await forwardGeocodeOpenMeteo(query, code);
  if (openMeteoRes) return saveCache(cacheKey, openMeteoRes);

  const nominatimRes = await forwardGeocodeNominatim(query, code);
  if (nominatimRes) return saveCache(cacheKey, nominatimRes);

  throw {
    code: 'LOCATION_NOT_FOUND',
    message: `No matching places found for "${query}" in ${code}. Please check spelling or postal code.`,
  };
}

/**
 * Resolves approximate device coordinates using reverse geocoding.
 */
async function resolveReverseCoords(req: LocationResolveRequest): Promise<ResolvedLocation> {
  if (
    !isValidCoordinate(req.latitude, req.longitude) ||
    req.latitude === undefined ||
    req.longitude === undefined
  ) {
    throw {
      code: 'INVALID_INPUT',
      message: 'Coordinates must be valid finite numbers within [-90, 90] and [-180, 180].',
    };
  }

  const roundedLat = roundCoordinate(req.latitude);
  const roundedLon = roundCoordinate(req.longitude);
  const cacheKey = `coords_${roundedLat}_${roundedLon}`;
  const cached = checkCache(cacheKey);
  if (cached) return cached;

  const rev = await activeReverseProvider.reverseGeocode(roundedLat, roundedLon);
  const settlement = rev?.city || 'Current Location';
  const resolvedCountry =
    rev?.country || req.previousCountry || (req.countryCode === 'IN' ? DEFAULT_COUNTRY : undefined);
  const resolvedCountryCode = rev?.countryCode || req.countryCode?.toUpperCase();

  const displayName =
    settlement === 'Current Location'
      ? rev?.district
        ? `Current Location (${rev.district})`
        : 'Current Location'
      : rev?.state && settlement !== rev.state
        ? `${settlement}, ${rev.state}`
        : settlement;

  return saveCache(cacheKey, {
    id: `loc_${roundedLat}_${roundedLon}`,
    name: displayName,
    city: settlement,
    locality: rev?.locality,
    district: rev?.district,
    state: rev?.state,
    region: rev?.state || rev?.district || 'Local Region',
    country: resolvedCountry || 'Unknown',
    countryCode: resolvedCountryCode || '',
    postcode: rev?.postcode,
    latitude: roundedLat,
    longitude: roundedLon,
    source: 'geolocation',
    precision: 'coordinates',
    attribution: rev?.attribution || 'Data © OpenStreetMap contributors',
  });
}

/**
 * Public Location Resolution Coordinator.
 * Prioritizes explicit text queries over stale coordinates.
 */
export async function resolveLocation(req: LocationResolveRequest): Promise<ResolvedLocation> {
  const query = req.query?.trim();
  const isExplicit = Boolean(
    query &&
    query !== 'Your location' &&
    !query.toLowerCase().includes('device location') &&
    !query.toLowerCase().includes('current location')
  );

  if (isExplicit && query) {
    return resolveForwardQuery(query, req.countryCode);
  }

  if (req.latitude !== undefined && req.longitude !== undefined) {
    return resolveReverseCoords(req);
  }

  throw {
    code: 'INVALID_INPUT',
    message: 'Please provide either a valid city name, postal code, or device location.',
  };
}
