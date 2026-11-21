import type { ResolvedLocation, CandidateLocation } from './types.ts';
import { HTTP_TIMEOUT_MS, OPEN_METEO_TIMEOUT_MS, COORDINATE_ROUND_FACTOR } from './constants.ts';
import { nominatimRateLimiter } from './rateLimiter.ts';
import { serverConfig } from './config.ts';
import { safeFetch } from './httpClient.ts';

function roundCoord(val: number): number {
  return Math.round(val * COORDINATE_ROUND_FACTOR) / COORDINATE_ROUND_FACTOR;
}

/**
 * Searches postal codes via OpenStreetMap Nominatim.
 */
export async function forwardGeocodePin(query: string): Promise<ResolvedLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(query)}&country=India&format=jsonv2&addressdetails=1&accept-language=en`;
    const pinResult = await nominatimRateLimiter.enqueue(async () => {
      try {
        const res = await safeFetch(url, {
          timeoutMs: HTTP_TIMEOUT_MS,
          headers: {
            'User-Agent': serverConfig.NOMINATIM_USER_AGENT,
            Accept: 'application/json',
          },
        });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    });

    if (!Array.isArray(pinResult) || pinResult.length === 0) return null;
    const first = pinResult[0];
    const addr = first.address || {};
    const settlement =
      addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Local Area';
    const state = addr.state || 'Maharashtra';

    return {
      id: `pin_${query}`,
      name: settlement,
      city: settlement,
      district: addr.state_district || addr.county,
      region: state,
      state: state,
      country: addr.country || 'India',
      countryCode: (addr.country_code || 'in').toUpperCase(),
      latitude: roundCoord(parseFloat(first.lat)),
      longitude: roundCoord(parseFloat(first.lon)),
      postcode: addr.postcode || query,
      source: 'pin',
      precision: 'postal_code',
      attribution: first.licence || 'Data © OpenStreetMap contributors',
    };
  } catch {
    return null;
  }
}

/**
 * Searches places via Open-Meteo Geocoding API.
 */
export async function forwardGeocodeOpenMeteo(
  query: string,
  countryCode?: string
): Promise<ResolvedLocation | null> {
  const apiKey = serverConfig.OPEN_METEO_API_KEY;
  const baseUrl = serverConfig.OPEN_METEO_API_BASE_URL.replace('air-quality-api', 'geocoding-api');

  const params = new URLSearchParams({ name: query, count: '6', language: 'en' });
  if (countryCode && countryCode.length === 2) params.set('countryCode', countryCode);
  if (apiKey) params.set('apikey', apiKey);

  let json: any = null;
  try {
    const res = await safeFetch(`${baseUrl}/v1/search?${params.toString()}`, {
      timeoutMs: OPEN_METEO_TIMEOUT_MS,
      headers: { Accept: 'application/json' },
    });
    if (res.ok) json = await res.json();
  } catch {
    return null;
  }

  if (!json?.results || json.results.length === 0) return null;
  const primary = json.results[0];
  const candidates: CandidateLocation[] = json.results.map((r: any) => ({
    id: `geo_${r.id}`,
    name: r.name,
    region: r.admin1 || '',
    country: r.country,
    countryCode: (r.country_code || countryCode || '').toUpperCase(),
    latitude: roundCoord(r.latitude),
    longitude: roundCoord(r.longitude),
    postcode: r.postcodes?.[0],
  }));

  return {
    id: `geo_${primary.id}`,
    name: primary.name,
    city: primary.name,
    region: primary.admin1 || '',
    state: primary.admin1 || '',
    country: primary.country,
    countryCode: (primary.country_code || countryCode || '').toUpperCase(),
    latitude: roundCoord(primary.latitude),
    longitude: roundCoord(primary.longitude),
    postcode: primary.postcodes?.[0],
    source: /^\d{4,6}$/.test(query) ? 'pin' : 'manual',
    precision: /^\d{4,6}$/.test(query) ? 'postal_code' : 'city',
    candidates: candidates.length > 1 ? candidates : undefined,
  };
}

/**
 * Searches places via OpenStreetMap Nominatim forward search fallback.
 */
export async function forwardGeocodeNominatim(
  query: string,
  countryCode: string = 'in'
): Promise<ResolvedLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=${countryCode.toLowerCase()}&format=jsonv2&addressdetails=1&accept-language=en`;
    const searchResult = await nominatimRateLimiter.enqueue(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': process.env.NOMINATIM_USER_AGENT?.trim() || 'AirSaathi-Web/1.0',
            Accept: 'application/json',
          },
        });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      } finally {
        clearTimeout(timeoutId);
      }
    });

    if (!Array.isArray(searchResult) || searchResult.length === 0) return null;
    const first = searchResult[0];
    const addr = first.address || {};
    const settlement =
      addr.city || addr.town || addr.village || addr.municipality || first.name || query;
    const state = addr.state || 'Maharashtra';

    return {
      id: `osm_${first.place_id || query}`,
      name: settlement,
      city: settlement,
      district: addr.state_district || addr.county,
      region: state,
      state: state,
      country: addr.country || 'India',
      countryCode: (addr.country_code || 'in').toUpperCase(),
      latitude: roundCoord(parseFloat(first.lat)),
      longitude: roundCoord(parseFloat(first.lon)),
      postcode: addr.postcode,
      source: 'manual',
      precision: 'city',
      attribution: first.licence || 'Data © OpenStreetMap contributors',
    };
  } catch {
    return null;
  }
}
