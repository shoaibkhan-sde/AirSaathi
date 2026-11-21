import test from 'node:test';
import assert from 'node:assert/strict';
import { generateIndoorAirGuidance } from '../src/services/recommendations/indoorAirEngine.ts';
import { saveCleanProfile } from '../src/context/profileStorage.ts';
import type { UserProfile, CityLocation } from '../src/types/index.ts';

function createMockCity(aqi: number): CityLocation {
  return {
    id: 'test-city',
    name: 'Pune',
    city: 'Pune',
    region: 'Maharashtra',
    country: 'India',
    stationName: 'Central Monitoring',
    latitude: 18.52,
    longitude: 73.85,
    aqi,
    category:
      aqi <= 50
        ? 'Good'
        : aqi <= 100
          ? 'Moderate'
          : aqi <= 150
            ? 'Unhealthy for Sensitive Groups'
            : 'Unhealthy',
    dominantPollutant: 'PM2.5',
    pm2_5: 55,
    pm10: 95,
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
    city: 'Pune',
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

test('Indoor Air: Biomass cooking fuel produces solid-fuel source-control guidance', () => {
  const profile = createBaseProfile({ cookingFuel: 'Biomass / wood' });
  const result = generateIndoorAirGuidance(profile, createMockCity(40));

  const sourceTip = result.quickTips.find((t) => t.category === 'source_control');
  assert.equal(sourceTip?.id, 'tip-source-biomass');
  assert.match(sourceTip?.description || '', /chimney draft|combustion smoke/);

  const kitchen = result.rooms.find((r) => r.id === 'kitchen');
  assert.equal(kitchen?.status, 'Attention');
  assert.ok(kitchen?.actions.some((a) => a.id === 'kt-biomass-exhaust'));
});

test('Indoor Air: LPG produces kitchen pre-draft and grease maintenance guidance', () => {
  const profile = createBaseProfile({ cookingFuel: 'LPG or piped gas' });
  const result = generateIndoorAirGuidance(profile, createMockCity(40));

  const sourceTip = result.quickTips.find((t) => t.category === 'source_control');
  assert.equal(sourceTip?.id, 'tip-source-lpg');

  const kitchen = result.rooms.find((r) => r.id === 'kitchen');
  assert.ok(kitchen?.actions.some((a) => a.id === 'kt-lpg-chimney'));
  assert.ok(kitchen?.actions.some((a) => a.id === 'kt-lpg-grease'));
});

test('Indoor Air: Induction does not produce combustion smoke warnings', () => {
  const profile = createBaseProfile({ cookingFuel: 'Electricity / induction' });
  const result = generateIndoorAirGuidance(profile, createMockCity(40));

  const sourceTip = result.quickTips.find((t) => t.category === 'source_control');
  assert.equal(sourceTip?.id, 'tip-source-induction');
  assert.doesNotMatch(sourceTip?.description || '', /smoke|chimney/i);

  const kitchen = result.rooms.find((r) => r.id === 'kitchen');
  assert.ok(!kitchen?.actions.some((a) => a.id.includes('biomass')));
  assert.ok(kitchen?.actions.some((a) => a.id === 'kt-ind-lids'));
});

test('Indoor Air: Elevated outdoor AQI prioritizes streetward window sealing', () => {
  const profile = createBaseProfile();
  const result = generateIndoorAirGuidance(profile, createMockCity(165));

  const ventTip = result.quickTips.find((t) => t.category === 'ventilation');
  assert.equal(ventTip?.id, 'tip-vent-elevated');
  assert.match(result.hero.description, /minimized with window seals/);

  const living = result.rooms.find((r) => r.id === 'living');
  assert.ok(living?.actions.some((a) => a.id === 'lr-window-boundaries'));
});

test('Indoor Air: Favorable outdoor AQI recommends natural cross-ventilation', () => {
  const profile = createBaseProfile();
  const result = generateIndoorAirGuidance(profile, createMockCity(45));

  const ventTip = result.quickTips.find((t) => t.category === 'ventilation');
  assert.equal(ventTip?.id, 'tip-vent-favorable');
  assert.match(result.hero.description, /natural fresh air exchange/);

  const living = result.rooms.find((r) => r.id === 'living');
  assert.ok(living?.actions.some((a) => a.id === 'lr-fresh-flush'));
});

test('Indoor Air: Children trigger damp-wipe dust control recommendations', () => {
  const profile = createBaseProfile({ householdMembers: ['children'], hasAirPurifier: false });
  const result = generateIndoorAirGuidance(profile, createMockCity(80));

  const protectTip = result.quickTips.find((t) => t.category === 'personal_protection');
  assert.equal(protectTip?.id, 'tip-protect-vulnerable-damp');
});

test('Indoor Air: Asthma/respiratory sensitivity triggers aerosol avoidance in bedroom', () => {
  const profile = createBaseProfile({
    healthConsiderations: ['Asthma or lung conditions'],
    hasAirPurifier: false,
  });
  const result = generateIndoorAirGuidance(profile, createMockCity(80));

  const bedroom = result.rooms.find((r) => r.id === 'bedroom');
  const fragAction = bedroom?.actions.find((a) => a.id === 'br-no-fragrance');
  assert.ok(fragAction);
  assert.match(fragAction?.description || '', /bronchial/);
});

test('Indoor Air: Air purifier ownership activates nocturnal bedroom sanctuary', () => {
  const profileWith = createBaseProfile({ hasAirPurifier: true });
  const resultWith = generateIndoorAirGuidance(profileWith, createMockCity(80));
  const protectTip = resultWith.quickTips.find((t) => t.category === 'personal_protection');
  assert.equal(protectTip?.id, 'tip-protect-purifier');

  const bedroom = resultWith.rooms.find((r) => r.id === 'bedroom');
  assert.ok(bedroom?.actions.some((a) => a.id === 'br-purifier-sleep'));
});

test('Indoor Air: Work-from-home users receive Study checklist, others do not', () => {
  const wfhProfile = createBaseProfile({ commuteMode: 'Work from home' });
  const normalProfile = createBaseProfile({ commuteMode: 'Walking' });

  const wfhResult = generateIndoorAirGuidance(wfhProfile, createMockCity(60));
  const normalResult = generateIndoorAirGuidance(normalProfile, createMockCity(60));

  assert.ok(wfhResult.rooms.some((r) => r.id === 'study'));
  assert.ok(!normalResult.rooms.some((r) => r.id === 'study'));
});

test('Indoor Air: Checklist completion state correctly maps from storage', () => {
  const profile = createBaseProfile();
  const storedState = { 'kt-lpg-chimney': true, 'lr-window-boundaries': true };
  const result = generateIndoorAirGuidance(profile, createMockCity(160), storedState);

  const kitchen = result.rooms.find((r) => r.id === 'kitchen');
  const chimney = kitchen?.actions.find((a) => a.id === 'kt-lpg-chimney');
  assert.equal(chimney?.completed, true);

  const grease = kitchen?.actions.find((a) => a.id === 'kt-lpg-grease');
  assert.equal(grease?.completed, false);
});

test('Indoor Air: Gracefully handles missing AQI and null profile', () => {
  const result = generateIndoorAirGuidance(null, null);
  assert.equal(result.hero.statusTitle, 'Indoor air sensor not connected');
  assert.equal(result.hero.hasOutdoorAqi, false);
  assert.equal(result.quickTips.length, 3);
  assert.equal(result.rooms.length, 3);
});

test('Indoor Air: Health considerations survive profile save in profileStorage', () => {
  const profile = createBaseProfile({
    healthConsiderations: ['Asthma or lung conditions', 'Pregnancy'],
    healthOther: 'Dust allergy',
  });
  const saved = saveCleanProfile(profile, createMockCity(50));
  assert.deepEqual(saved.healthConsiderations, ['Asthma or lung conditions', 'Pregnancy']);
  assert.equal(saved.healthOther, 'Dust allergy');
});
