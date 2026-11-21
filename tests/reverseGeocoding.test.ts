import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLocation, SerializedRateLimiter } from '../server/geocodingService.ts';

test('Reverse Geocoding: Resolves Nandura town from production-rounded coordinates (20.83, 76.46)', async () => {
  const originalFetch = global.fetch;

  global.fetch = async (url: unknown) => {
    const urlStr = String(url);
    if (urlStr.includes('nominatim.openstreetmap.org/reverse')) {
      return new Response(
        JSON.stringify({
          place_id: 245900229,
          licence: 'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright',
          osm_type: 'way',
          osm_id: 269773400,
          lat: '20.8341705',
          lon: '76.4591941',
          category: 'highway',
          type: 'residential',
          display_name:
            'Ward Number 2, Mahamdpur, Nandura, Buldhana District, Maharashtra, 443404, India',
          address: {
            neighbourhood: 'Ward Number 2',
            city_district: 'Mahamdpur',
            town: 'Nandura',
            county: 'Nandura',
            state_district: 'Buldhana District',
            state: 'Maharashtra',
            ISO3166_2_lvl4: 'IN-MH',
            postcode: '443404',
            country: 'India',
            country_code: 'in',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('Not Found', { status: 404 });
  };

  try {
    const result = await resolveLocation({
      latitude: 20.83,
      longitude: 76.46,
    });

    assert.equal(result.city, 'Nandura');
    assert.equal(result.district, 'Buldhana District');
    assert.equal(result.state, 'Maharashtra');
    assert.equal(result.country, 'India');
    assert.equal(result.countryCode, 'IN');
    assert.equal(result.postcode, '443404');
    assert.equal(result.name, 'Nandura, Maharashtra');
    assert.equal(result.latitude, 20.83);
    assert.equal(result.longitude, 76.46);
    assert.notEqual(result.city, 'Station');
    assert.notEqual(result.country, 'United States');
    assert.equal(
      result.attribution,
      'Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright'
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('Reverse Geocoding: Rejects top-level POI / station names in favor of settlement town', async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    return new Response(
      JSON.stringify({
        name: 'Nandura Railway Station',
        amenity: 'railway_station',
        address: {
          town: 'Nandura',
          state_district: 'Buldhana District',
          state: 'Maharashtra',
          country: 'India',
          country_code: 'in',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await resolveLocation({ latitude: 20.83, longitude: 76.46 });
    assert.equal(result.city, 'Nandura');
    assert.notEqual(result.city, 'Nandura Railway Station');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Reverse Geocoding: Missing settlement falls back to "Current Location", NOT district', async () => {
  const originalFetch = global.fetch;

  global.fetch = async () => {
    return new Response(
      JSON.stringify({
        address: {
          county: 'Rural County',
          state_district: 'Rural District',
          state: 'Maharashtra',
          country: 'India',
          country_code: 'in',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await resolveLocation({ latitude: 19.45, longitude: 75.12 });
    assert.equal(result.city, 'Current Location');
    assert.equal(result.district, 'Rural District');
    assert.notEqual(result.city, 'Rural District');
    assert.notEqual(result.city, 'Rural County');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Reverse Geocoding: Provider failure preserves user previous country (No India hardcoding)', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response('Provider Error', { status: 500 });

  try {
    const result = await resolveLocation({
      latitude: 45.42,
      longitude: -75.69,
      countryCode: 'CA',
      previousCountry: 'Canada',
    });

    assert.equal(result.name, 'Current Location');
    assert.equal(result.country, 'Canada');
    assert.equal(result.countryCode, 'CA');
    assert.notEqual(result.country, 'India');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Rate Limiter: Serialized FIFO queue processes consecutive tasks with minimum interval', async () => {
  const limiter = new SerializedRateLimiter(60);
  const timestamps: number[] = [];

  const task = async () => {
    timestamps.push(Date.now());
    return 'ok';
  };

  const [res1, res2] = await Promise.all([limiter.enqueue(task), limiter.enqueue(task)]);

  assert.equal(res1, 'ok');
  assert.equal(res2, 'ok');
  assert.equal(timestamps.length, 2);
  const diff = timestamps[1] - timestamps[0];
  assert.ok(diff >= 55, `Expected interval >= 55ms, got ${diff}ms`);
});
