/**
 * Constants for geocoding and server-side spatial operations.
 */

export const MIN_LATITUDE = -90;
export const MAX_LATITUDE = 90;
export const MIN_LONGITUDE = -180;
export const MAX_LONGITUDE = 180;

export const COORDINATE_DECIMAL_PLACES = 2;
export const COORDINATE_ROUND_FACTOR = 100;

export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const NOMINATIM_RATE_LIMIT_MS = 1050; // Respect OpenStreetMap 1 req/sec policy
export const HTTP_TIMEOUT_MS = 6000;
export const OPEN_METEO_TIMEOUT_MS = 7000;

export const DEFAULT_COUNTRY = 'India';
export const DEFAULT_COUNTRY_CODE = 'IN';
