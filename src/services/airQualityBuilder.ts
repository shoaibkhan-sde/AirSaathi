import type { CityLocation, AQICategory } from '../types';
import { KNOWN_LOCATIONS } from './locationDirectory.ts';
import type { LocationDirectoryItem } from './locationDirectory.ts';
import {
  AQI_GOOD_MAX,
  AQI_MODERATE_MAX,
  AQI_USG_MAX,
  AQI_UNHEALTHY_MAX,
  AQI_VERY_UNHEALTHY_MAX,
  DEFAULT_SPATIAL_RESOLUTION_KM,
} from './aqiConstants.ts';

/**
 * Maps US AQI numerical score to its standard category label.
 */
export function mapUSAQICategory(aqi: number): AQICategory {
  const rounded = Math.round(aqi);
  if (rounded <= AQI_GOOD_MAX) return 'Good';
  if (rounded <= AQI_MODERATE_MAX) return 'Moderate';
  if (rounded <= AQI_USG_MAX) return 'Unhealthy for Sensitive Groups';
  if (rounded <= AQI_UNHEALTHY_MAX) return 'Unhealthy';
  if (rounded <= AQI_VERY_UNHEALTHY_MAX) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Finds known baseline coordinates or constructs fallback item.
 */
export function findLocationByQuery(
  query: string,
  country: string = 'India'
): LocationDirectoryItem {
  const clean = query.trim().toLowerCase();
  const pinMatch = KNOWN_LOCATIONS.find((loc) =>
    loc.pinCodes.some((p) => p.toLowerCase() === clean || clean.startsWith(p.toLowerCase()))
  );
  if (pinMatch) return pinMatch;

  const nameMatch = KNOWN_LOCATIONS.find(
    (loc) =>
      loc.name.toLowerCase() === clean ||
      loc.name.toLowerCase().includes(clean) ||
      clean.includes(loc.name.toLowerCase())
  );
  if (nameMatch) return nameMatch;

  const defaultBase =
    country.toLowerCase() === 'india'
      ? KNOWN_LOCATIONS[0]
      : KNOWN_LOCATIONS[KNOWN_LOCATIONS.length - 1];

  return {
    ...defaultBase,
    id: `custom-${clean.replace(/\s+/g, '-')}`,
    name: query.trim().charAt(0).toUpperCase() + query.trim().slice(1),
    stationName: `${query.trim()} Central CAAQMS Monitoring Station`,
    country,
  };
}

interface ResolvedLocationDto {
  id?: string;
  name: string;
  city?: string;
  region?: string;
  district?: string;
  state?: string;
  locality?: string;
  country?: string;
  attribution?: string;
  latitude: number;
  longitude: number;
}

interface ResolvedAQIDto {
  value: number;
  dominantPollutant?: string;
  pollutants?: {
    pm2_5?: number;
    pm10?: number;
  };
}

/**
 * Constructs a typed CityLocation from API response payloads.
 */
export function buildResolvedLocation(
  loc: ResolvedLocationDto,
  aq: ResolvedAQIDto,
  lat: number,
  lon: number
): CityLocation {
  const category = mapUSAQICategory(aq.value);
  return {
    id: loc.id || `loc_${lat}_${lon}`,
    name: loc.name,
    city: loc.city,
    region: loc.region || loc.district || 'Local Region',
    district: loc.district,
    state: loc.state,
    locality: loc.locality,
    country: loc.country || 'India',
    attribution: loc.attribution,
    stationName: `Open-Meteo Model Grid (${lat}, ${lon})`,
    aqi: aq.value,
    category,
    dominantPollutant: aq.dominantPollutant || 'PM2.5',
    lastUpdated: 'Just now',
    freshness: 'Observed via Open-Meteo CAMS Global Model',
    temperature: '26°C',
    humidity: '55%',
    windSpeed: '8 km/h',
    isDemo: false,
    latitude: lat,
    longitude: lon,
    scale: 'US AQI — Open-Meteo model estimate',
    source: 'Open-Meteo CAMS Global',
    modelNotice:
      'Local air-quality estimate • Modelled data (Global CAMS ~45km spatial resolution). Not a street sensor.',
    spatialResolutionKm: DEFAULT_SPATIAL_RESOLUTION_KM,
    pm2_5: aq.pollutants?.pm2_5,
    pm10: aq.pollutants?.pm10,
    pollutants: [
      {
        code: 'PM2.5',
        name: 'Fine Particulate Matter',
        value: aq.pollutants?.pm2_5 ?? 35,
        unit: 'µg/m³',
        status: category,
        standardLimit: '12 µg/m³ (annual)',
        healthImpact: 'Penetrates deep into alveolar lung tissues',
        sources: 'Atmospheric transport, combustion plumes',
      },
      {
        code: 'PM10',
        name: 'Coarse Particulates',
        value: aq.pollutants?.pm10 ?? 65,
        unit: 'µg/m³',
        status: category,
        standardLimit: '50 µg/m³ (24h)',
        healthImpact: 'Nasal, throat and upper airway irritation',
        sources: 'Road dust, construction resuspension',
      },
    ],
  };
}

/**
 * Builds offline fallback CityLocation model.
 */
export function buildOfflineFallback(query: string, country: string): CityLocation {
  const matched = findLocationByQuery(query, country);
  return {
    id: matched.id,
    name: query?.trim() ? query.trim() : matched.name,
    region: matched.region,
    country: matched.country,
    stationName: `${matched.name} Baseline (Model Fallback)`,
    aqi: matched.baselineAQI,
    category: mapUSAQICategory(matched.baselineAQI),
    dominantPollutant: matched.dominantPollutant,
    lastUpdated: 'Just now',
    freshness: 'Offline fallback (Provider temporarily unreachable)',
    temperature: matched.temp,
    humidity: matched.humidity,
    windSpeed: matched.wind,
    isDemo: true,
    latitude: matched.lat,
    longitude: matched.lon,
    scale: 'US AQI — Open-Meteo model estimate',
    source: 'Open-Meteo CAMS Global',
    modelNotice:
      'Local air-quality estimate • Modelled data (Global CAMS ~45km spatial resolution). Not a street sensor.',
    spatialResolutionKm: DEFAULT_SPATIAL_RESOLUTION_KM,
    pollutants: matched.pollutants,
  };
}
