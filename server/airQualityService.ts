import type { AQICategoryUS, AirQualityCurrentResponse } from './types.ts';
import { roundCoordinate, isValidCoordinate } from './geocodingService.ts';
import { serverConfig } from './config.ts';
import { safeFetch } from './httpClient.ts';

interface AQICacheEntry {
  data: AirQualityCurrentResponse;
  timestamp: number;
}

const aqiCache = new Map<string, AQICacheEntry>();
const AQI_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Maps integer US AQI value to exact category boundary defined in Phase 2 spec:
 * 0–50: Good
 * 51–100: Moderate
 * 101–150: Unhealthy for Sensitive Groups
 * 151–200: Unhealthy
 * 201–300: Very Unhealthy
 * Above 300: Hazardous
 */
export function mapUSAQICategory(aqi: number): AQICategoryUS {
  const rounded = Math.round(aqi);
  if (rounded <= 50) return 'Good';
  if (rounded <= 100) return 'Moderate';
  if (rounded <= 150) return 'Unhealthy for Sensitive Groups';
  if (rounded <= 200) return 'Unhealthy';
  if (rounded <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export async function fetchCurrentAirQuality(
  latitude: number,
  longitude: number,
  countryCode?: string
): Promise<AirQualityCurrentResponse> {
  if (!isValidCoordinate(latitude, longitude)) {
    throw {
      code: 'INVALID_INPUT',
      message: 'Invalid coordinate parameters for air quality lookup.',
    };
  }

  const roundedLat = roundCoordinate(latitude);
  const roundedLon = roundCoordinate(longitude);
  const cacheKey = `aqi_${roundedLat}_${roundedLon}`;

  const cached = aqiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < AQI_CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = serverConfig.OPEN_METEO_API_KEY;
  const baseUrl = serverConfig.OPEN_METEO_API_BASE_URL;

  const params = new URLSearchParams({
    latitude: roundedLat.toString(),
    longitude: roundedLon.toString(),
    current: 'us_aqi,pm2_5,pm10',
    timezone: 'auto',
  });

  const isIndia =
    (countryCode && countryCode.toUpperCase() === 'IN') ||
    (roundedLat >= 6 && roundedLat <= 37 && roundedLon >= 68 && roundedLon <= 98);
  if (isIndia) {
    params.set('domains', 'cams_global');
  }

  if (apiKey) {
    params.set('apikey', apiKey);
  }

  const apiUrl = `${baseUrl}/v1/air-quality?${params.toString()}`;
  let response: Response;

  try {
    response = await safeFetch(apiUrl, {
      timeoutMs: 8000,
      headers: { Accept: 'application/json' },
    });
  } catch (err: unknown) {
    const isTimeout =
      (typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: unknown }).code === 'UPSTREAM_TIMEOUT') ||
      (err instanceof Error && err.name === 'AbortError');
    throw {
      code: isTimeout ? 'UPSTREAM_TIMEOUT' : 'AIR_QUALITY_UNAVAILABLE',
      message: isTimeout
        ? 'Open-Meteo Air Quality service timed out. Please try again.'
        : 'Open-Meteo Air Quality service is currently unreachable.',
    };
  }

  if (!response.ok) {
    throw {
      code: 'AIR_QUALITY_UNAVAILABLE',
      message: `Open-Meteo Air Quality provider returned HTTP ${response.status}.`,
    };
  }

  let json: {
    timezone?: string;
    current?: {
      time?: string;
      us_aqi?: number | null;
      pm2_5?: number | null;
      pm10?: number | null;
    };
  };

  try {
    json = await response.json();
  } catch {
    throw {
      code: 'INVALID_UPSTREAM_RESPONSE',
      message: 'Failed to parse air quality service response.',
    };
  }

  if (!json.current || json.current.us_aqi === undefined || json.current.us_aqi === null) {
    throw {
      code: 'AIR_QUALITY_UNAVAILABLE',
      message: 'Air quality index value is temporarily unavailable for these coordinates.',
    };
  }

  const aqiValue = Math.max(0, Math.round(json.current.us_aqi));
  const category = mapUSAQICategory(aqiValue);

  // Pollutant mapping: null represents unavailable rather than zero
  const pm2_5 =
    typeof json.current.pm2_5 === 'number' ? Math.round(json.current.pm2_5 * 10) / 10 : null;
  const pm10 =
    typeof json.current.pm10 === 'number' ? Math.round(json.current.pm10 * 10) / 10 : null;

  let dominantPollutant = 'PM2.5';
  if (pm10 !== null && pm2_5 !== null && pm10 > pm2_5 * 2.5) {
    dominantPollutant = 'PM10';
  }

  const result: AirQualityCurrentResponse = {
    value: aqiValue,
    scale: 'US AQI',
    category: category,
    dataType: 'model_estimate',
    source: 'Open-Meteo CAMS Global',
    observedAt: json.current.time || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    spatialResolutionKm: 45,
    timezone: json.timezone || 'Asia/Kolkata',
    dominantPollutant,
    pollutants: {
      pm2_5,
      pm10,
      unit: 'µg/m³',
    },
    modelNotice:
      'Local air-quality estimate • Modelled data (Global CAMS ~45km spatial resolution). Not a street sensor.',
  };

  aqiCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
