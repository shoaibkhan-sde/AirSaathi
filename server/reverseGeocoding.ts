import type { LocationHierarchy } from './types.ts';
import { HTTP_TIMEOUT_MS } from './constants.ts';
import { nominatimRateLimiter } from './rateLimiter.ts';
import { serverConfig } from './config.ts';
import { safeFetch } from './httpClient.ts';

export interface ReverseGeocodingProvider {
  name: string;
  reverseGeocode(
    lat: number,
    lon: number
  ): Promise<(LocationHierarchy & { attribution?: string }) | null>;
}

/**
 * OpenStreetMap Nominatim Reverse Geocoding Provider.
 * Extracts settlement (city/town/village) with strict POI rejection.
 */
export class NominatimReverseProvider implements ReverseGeocodingProvider {
  name = 'OpenStreetMap Nominatim';

  async reverseGeocode(
    lat: number,
    lon: number
  ): Promise<(LocationHierarchy & { attribution?: string }) | null> {
    const userAgent = serverConfig.NOMINATIM_USER_AGENT;
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&addressdetails=1&zoom=14&layer=address&accept-language=en`;

    return nominatimRateLimiter.enqueue(async () => {
      try {
        const res = await safeFetch(url, {
          timeoutMs: HTTP_TIMEOUT_MS,
          headers: { 'User-Agent': userAgent, Accept: 'application/json' },
        });
        if (!res.ok) return null;

        const json = await res.json();
        const addr = json.address || {};
        return {
          city: addr.city || addr.town || addr.village || addr.municipality || undefined,
          locality: addr.suburb || addr.neighbourhood || addr.city_district || undefined,
          district: addr.state_district || addr.county || undefined,
          state: addr.state || undefined,
          country: addr.country || undefined,
          countryCode: addr.country_code ? addr.country_code.toUpperCase() : undefined,
          postcode: addr.postcode || undefined,
          attribution: json.licence || 'Data © OpenStreetMap contributors',
        };
      } catch {
        return null;
      }
    });
  }
}

export const activeReverseProvider: ReverseGeocodingProvider = new NominatimReverseProvider();
