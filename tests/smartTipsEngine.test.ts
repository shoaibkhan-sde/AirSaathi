import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSmartTips } from '../src/services/recommendations/smartTipsEngine.ts';
import type { UserProfile, CityLocation } from '../src/types/index.ts';

function createMockCity(aqi: number, dominant: 'PM2.5' | 'PM10' = 'PM2.5'): CityLocation {
  return {
    id: 'test-city',
    name: 'Test City',
    city: 'Test City',
    region: 'Delhi',
    country: 'India',
    stationName: 'Central Monitoring',
    latitude: 28.61,
    longitude: 77.23,
    aqi,
    category:
      aqi <= 50
        ? 'Good'
        : aqi <= 100
          ? 'Moderate'
          : aqi <= 150
            ? 'Unhealthy for Sensitive Groups'
            : 'Unhealthy',
    dominantPollutant: dominant,
    pm2_5: dominant === 'PM2.5' ? 85 : 20,
    pm10: dominant === 'PM10' ? 140 : 45,
    lastUpdated: 'Just now',
    freshness: 'live',
    temperature: '26°C',
    humidity: '45%',
    windSpeed: '10 km/h',
    isDemo: false,
    source: 'manual',
  };
}

function createBaseProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    country: 'India',
    city: 'Test City',
    locationSource: 'manual',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Walking',
    homeType: 'Apartment',
    cookingFuel: 'LPG or piped gas',
    heatingFuel: 'No heating / Not applicable',
    hasAirPurifier: false,
    ventilationType: 'Mostly closed windows',
    indoorSmoking: 'No',
    onboardingCompleted: true,
    ...overrides,
  };
}

test('Smart Tips: initializes routines with completed=false and saved=false', () => {
  const city = createMockCity(40);
  const profile = createBaseProfile();
  const result = generateSmartTips(profile, city);

  assert.equal(result.routines.length, 3);
  for (const r of result.routines) {
    assert.equal(r.completed, false);
    assert.equal(r.saved, false);
  }
});

test('Smart Tips: promotes children indoor play precautions during high AQI', () => {
  const city = createMockCity(160);
  const profile = createBaseProfile({ householdMembers: ['children'] });
  const result = generateSmartTips(profile, city);

  assert.equal(result.featuredTip.priority, 'High');
  const childCard = result.protectionCards.find((c) => c.id === 'prot-household-children');
  assert.ok(childCard);
  assert.equal(childCard?.priority, 'High');
  assert.match(childCard?.description || '', /50% more air/);
});

test('Smart Tips: prioritizes senior cardiovascular advisory for older adults', () => {
  const city = createMockCity(170);
  const profile = createBaseProfile({ householdMembers: ['seniors'] });
  const result = generateSmartTips(profile, city);

  const seniorCard = result.protectionCards.find((c) => c.id === 'prot-household-seniors');
  assert.ok(seniorCard);
  assert.equal(seniorCard?.priority, 'High');
  assert.match(seniorCard?.description || '', /coronary/);
});

test('Smart Tips: triggers early caution for asthma / respiratory conditions', () => {
  const city = createMockCity(125);
  const profile = createBaseProfile({ healthConsiderations: ['Asthma or lung conditions'] });
  const result = generateSmartTips(profile, city);

  const morningTip = result.routines.find((r) => r.timeOfDay === 'morning');
  assert.ok(morningTip);
  assert.equal(morningTip?.priority, 'High');
  assert.match(morningTip?.reason || '', /bronchial|Sensitive airways/);
});

test('Smart Tips: calibrates exposure card for car commute mode', () => {
  const city = createMockCity(155);
  const profile = createBaseProfile({ commuteMode: 'Car' });
  const result = generateSmartTips(profile, city);

  const exposureCard = result.protectionCards.find((c) => c.tag === 'In-Cabin Protection');
  assert.ok(exposureCard);
  assert.match(exposureCard?.title || '', /Cabin Air Recirculation/);
});

test('Smart Tips: generates combustion safety card for biomass cooking fuel', () => {
  const city = createMockCity(40);
  const profile = createBaseProfile({ cookingFuel: 'Biomass / wood' });
  const result = generateSmartTips(profile, city);

  const ventCard = result.protectionCards.find((c) => c.tag === 'Combustion Safety');
  assert.ok(ventCard);
  assert.equal(ventCard?.priority, 'High');
  assert.match(ventCard?.description || '', /carbon monoxide/);
});

test('Smart Tips: activates bedroom HEPA purifier guidance when purifier owned', () => {
  const city = createMockCity(80);
  const profile = createBaseProfile({ hasAirPurifier: true });
  const result = generateSmartTips(profile, city);

  const eveningTip = result.routines.find((r) => r.timeOfDay === 'evening');
  assert.ok(eveningTip);
  assert.match(eveningTip?.title || '', /HEPA purifier/);
});

test('Smart Tips: calibrates dominant pollutant card for PM2.5 vs PM10', () => {
  const cityPM10 = createMockCity(110, 'PM10');
  const result = generateSmartTips(createBaseProfile(), cityPM10);

  const pollutantCard = result.protectionCards.find((c) => c.id === 'prot-dominant-pollutant');
  assert.ok(pollutantCard);
  assert.match(pollutantCard?.title || '', /PM10/);
  assert.match(pollutantCard?.title || '', /140 µg\/m³/);
});
