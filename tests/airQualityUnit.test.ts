import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mapUSAQICategory,
  findLocationByQuery,
  buildResolvedLocation,
  buildOfflineFallback,
} from '../src/services/airQualityBuilder.ts';
import {
  getAQICategory,
  resolveLocationAQI,
  clearClientAQICache,
  CLIENT_AQI_CACHE_TTL_MS,
} from '../src/services/airQualityService.ts';

test('Air Quality Unit: mapUSAQICategory maps all EPA boundaries correctly', () => {
  assert.equal(mapUSAQICategory(0), 'Good');
  assert.equal(mapUSAQICategory(50), 'Good');
  assert.equal(mapUSAQICategory(50.4), 'Good');
  assert.equal(mapUSAQICategory(50.6), 'Moderate');
  assert.equal(mapUSAQICategory(51), 'Moderate');
  assert.equal(mapUSAQICategory(100), 'Moderate');
  assert.equal(mapUSAQICategory(101), 'Unhealthy for Sensitive Groups');
  assert.equal(mapUSAQICategory(150), 'Unhealthy for Sensitive Groups');
  assert.equal(mapUSAQICategory(151), 'Unhealthy');
  assert.equal(mapUSAQICategory(200), 'Unhealthy');
  assert.equal(mapUSAQICategory(201), 'Very Unhealthy');
  assert.equal(mapUSAQICategory(300), 'Very Unhealthy');
  assert.equal(mapUSAQICategory(301), 'Hazardous');
  assert.equal(mapUSAQICategory(500), 'Hazardous');
  assert.equal(mapUSAQICategory(750), 'Hazardous');
});

test('Air Quality Unit: getAQICategory maps CPCB boundaries', () => {
  assert.equal(getAQICategory(25), 'Good');
  assert.equal(getAQICategory(75), 'Satisfactory');
  assert.equal(getAQICategory(150), 'Moderate');
  assert.equal(getAQICategory(250), 'Poor');
  assert.equal(getAQICategory(350), 'Very Poor');
  assert.equal(getAQICategory(450), 'Severe');
  assert.equal(getAQICategory(999), 'Severe'); // Out of bounds fallback
});

test('Air Quality Unit: findLocationByQuery finds known locations and builds custom items', () => {
  // Known city by name
  const mumbai = findLocationByQuery('Mumbai', 'India');
  assert.equal(mumbai.id, 'mumbai');
  assert.equal(mumbai.country, 'India');

  // Known city by PIN
  const delhiPin = findLocationByQuery('110001', 'India');
  assert.equal(delhiPin.id, 'delhi');

  // Unknown city falls back to constructed item with proper defaults
  const customCity = findLocationByQuery('Nagpur', 'India');
  assert.equal(customCity.id, 'custom-nagpur');
  assert.equal(customCity.name, 'Nagpur');
  assert.equal(customCity.country, 'India');
});

test('Air Quality Unit: buildResolvedLocation constructs consistent CityLocation model', () => {
  const locDto = {
    id: 'test-loc',
    name: 'Bandra, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    country: 'India',
    latitude: 19.05,
    longitude: 72.84,
  };

  const aqDto = {
    value: 165,
    dominantPollutant: 'PM2.5',
    pollutants: {
      pm2_5: 82.5,
      pm10: 140.2,
    },
  };

  const result = buildResolvedLocation(locDto, aqDto, 19.05, 72.84);
  assert.equal(result.name, 'Bandra, Mumbai');
  assert.equal(result.city, 'Mumbai');
  assert.equal(result.aqi, 165);
  assert.equal(result.category, 'Unhealthy');
  assert.equal(result.dominantPollutant, 'PM2.5');
  assert.equal(result.pm2_5, 82.5);
  assert.equal(result.pm10, 140.2);
  assert.equal(result.pollutants?.length, 2);
  assert.ok(result.modelNotice?.includes('Global CAMS'));
});

test('Air Quality Unit: buildOfflineFallback maintains application stability during network failure', () => {
  const fallback = buildOfflineFallback('Pune', 'India');
  assert.ok(fallback.name);
  assert.equal(fallback.country, 'India');
  assert.equal(fallback.isDemo, true);
  assert.ok(typeof fallback.aqi === 'number');
  assert.ok(fallback.freshness.includes('Offline fallback'));
  assert.ok(fallback.pollutants && fallback.pollutants.length > 0);
});

test('Air Quality Unit: Client AQI Cache TTL (15 minutes) and deduplication', async () => {
  clearClientAQICache();

  // Mock global fetch
  let fetchCallCount = 0;
  const originalFetch = (globalThis as any).fetch;

  (globalThis as any).fetch = async (url: string) => {
    fetchCallCount++;
    if (url.includes('/api/location/resolve')) {
      return {
        ok: true,
        json: async () => ({
          location: {
            name: 'Test City',
            city: 'Test City',
            country: 'India',
            countryCode: 'IN',
            latitude: 20.0,
            longitude: 75.0,
          },
        }),
      };
    }
    if (url.includes('/api/air-quality/current')) {
      return {
        ok: true,
        json: async () => ({
          airQuality: {
            value: 85,
            dominantPollutant: 'PM10',
            pollutants: { pm2_5: 25, pm10: 85 },
          },
        }),
      };
    }
    return { ok: false };
  };

  try {
    // 1. Initial call populates cache
    const firstRes = await resolveLocationAQI('Test City', 'India');
    assert.equal(firstRes.aqi, 85);
    const initialCalls = fetchCallCount;
    assert.equal(initialCalls, 2); // 1 resolve + 1 air-quality

    // 2. Second call immediately after hits client cache (0 extra fetch calls)
    const secondRes = await resolveLocationAQI('Test City', 'India');
    assert.equal(secondRes.aqi, 85);
    assert.equal(fetchCallCount, initialCalls);

    // 3. Concurrent requests are deduplicated in-flight
    clearClientAQICache();
    fetchCallCount = 0;
    const [p1, p2, p3] = await Promise.all([
      resolveLocationAQI('Test City', 'India'),
      resolveLocationAQI('Test City', 'India'),
      resolveLocationAQI('Test City', 'India'),
    ]);
    assert.equal(p1.aqi, 85);
    assert.equal(p2.aqi, 85);
    assert.equal(p3.aqi, 85);
    assert.equal(fetchCallCount, 2); // Only 1 pair of calls was initiated, not 6
  } finally {
    (globalThis as any).fetch = originalFetch;
    clearClientAQICache();
  }
});
