import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCurrentAirQuality } from '../server/airQualityService.ts';
import { resolveLocation } from '../server/geocodingService.ts';

test('Provider Integration: Successful Geocoding and AQI Response', async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url: unknown) => {
    const urlStr = String(url);
    if (urlStr.includes('geocoding-api.open-meteo.com')) {
      return new Response(
        JSON.stringify({
          results: [
            {
              id: 1259229,
              name: 'Pune',
              latitude: 18.5196,
              longitude: 73.8553,
              country: 'India',
              country_code: 'IN',
              admin1: 'Maharashtra',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (urlStr.includes('air-quality-api.open-meteo.com')) {
      return new Response(
        JSON.stringify({
          timezone: 'Asia/Kolkata',
          current: {
            time: '2026-11-20T12:00',
            us_aqi: 142,
            pm2_5: 52.4,
            pm10: 110.2,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('Not Found', { status: 404 });
  };

  try {
    const loc = await resolveLocation({ query: 'Pune', countryCode: 'IN' });
    assert.equal(loc.name, 'Pune');
    assert.equal(loc.country, 'India');
    assert.equal(loc.latitude, 18.52);

    const aqi = await fetchCurrentAirQuality(loc.latitude, loc.longitude, 'IN');
    assert.equal(aqi.value, 142);
    assert.equal(aqi.category, 'Unhealthy for Sensitive Groups');
    assert.equal(aqi.scale, 'US AQI');
    assert.equal(aqi.pollutants.pm2_5, 52.4);
    assert.equal(aqi.pollutants.pm10, 110.2);
    assert.equal(aqi.spatialResolutionKm, 45);
  } finally {
    global.fetch = originalFetch;
  }
});

test('Provider Integration: HTTP 500 error from upstream AQI provider', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('Server Error', { status: 500 });

  try {
    await assert.rejects(
      async () => {
        await fetchCurrentAirQuality(18.52, 73.85, 'IN');
      },
      (err: unknown) => {
        const error = err as { code?: string };
        assert.equal(error.code, 'AIR_QUALITY_UNAVAILABLE');
        return true;
      }
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('Provider Integration: Missing AQI in provider response', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(
      JSON.stringify({
        current: { time: '2026-11-20T12:00', pm2_5: 25.0 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  try {
    await assert.rejects(
      async () => {
        await fetchCurrentAirQuality(18.52, 73.85, 'IN');
      },
      (err: unknown) => {
        const error = err as { code?: string };
        assert.equal(error.code, 'AIR_QUALITY_UNAVAILABLE');
        return true;
      }
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('Provider Integration: Location not found returns LOCATION_NOT_FOUND', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  try {
    await assert.rejects(
      async () => {
        await resolveLocation({ query: 'NonExistentCityXYZ123', countryCode: 'IN' });
      },
      (err: unknown) => {
        const error = err as { code?: string };
        assert.equal(error.code, 'LOCATION_NOT_FOUND');
        return true;
      }
    );
  } finally {
    global.fetch = originalFetch;
  }
});
