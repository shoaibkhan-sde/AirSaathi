import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHomeRecommendations } from '../src/services/recommendations/homeRecommendations.ts';
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
    pm2_5: 65,
    pm10: 105,
    lastUpdated: 'Just now',
    freshness: 'live',
    temperature: '26°C',
    humidity: '45%',
    windSpeed: '10 km/h',
    isDemo: false,
    source: 'manual',
  };
}

function createMockProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    country: 'India',
    city: 'Pune',
    locationSource: 'manual',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Car',
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

test('Home Recs: Scenario 1 - Unhealthy outdoor AQI + LPG cooking + existing purifier', () => {
  const profile = createMockProfile({
    hasAirPurifier: true,
    cookingFuel: 'LPG or piped gas',
  });
  const city = createMockCity(165); // Unhealthy

  const cards = generateHomeRecommendations(profile, city);

  assert.equal(cards.length, 3);
  // Card 1: Recommends running air purifier with closed windows
  assert.equal(cards[0].id, 'home-rec-ambient-purifier');
  assert.match(cards[0].title, /Keep windows closed/i);
  assert.match(cards[0].subtitle, /air purifier/i);

  // Card 2: Kitchen LPG pre-draft
  assert.equal(cards[1].id, 'home-rec-kitchen-lpg');
  assert.match(cards[1].title, /Pre-draft kitchen exhaust/i);

  // Card 3: Traffic cabin air recirculation
  assert.equal(cards[2].id, 'home-rec-commute-cabin');
});

test('Home Recs: Scenario 2 - Good outdoor AQI + induction cooking + no purifier', () => {
  const profile = createMockProfile({
    hasAirPurifier: false,
    cookingFuel: 'Electricity / induction',
    commuteMode: 'Walking',
  });
  const city = createMockCity(35); // Good

  const cards = generateHomeRecommendations(profile, city);

  assert.equal(cards.length, 3);
  // Card 1: Fresh air flush
  assert.equal(cards[0].id, 'home-rec-ambient-flush');
  assert.match(cards[0].title, /fresh air/i);

  // Card 2: Induction aerosol control
  assert.equal(cards[1].id, 'home-rec-kitchen-induction');
  assert.match(cards[1].title, /Cover cookware/i);

  // Card 3: Active low-emission travel (AQI is good!)
  assert.equal(cards[2].id, 'home-rec-transit-active');
  assert.match(cards[2].title, /Active low-emission travel/i);
});

test('Home Recs: Scenario 3 - Biomass cooking + children in household', () => {
  const profile = createMockProfile({
    householdMembers: ['children'],
    cookingFuel: 'Biomass / wood',
  });
  const city = createMockCity(80); // Moderate

  const cards = generateHomeRecommendations(profile, city);

  assert.equal(cards.length, 3);
  // Card 1: Moderate ventilation
  assert.equal(cards[0].id, 'home-rec-ambient-moderate');

  // Card 2: Children damp-wipe takes priority for vulnerable household members
  assert.equal(cards[1].id, 'home-rec-family-children');
  assert.match(cards[1].title, /Damp-wipe play areas/i);

  // Card 3: Commute / lifestyle
  assert.ok(cards[2]);
});

test('Home Recs: Scenario 4 - Respiratory health considerations + unhealthy AQI', () => {
  const profile = createMockProfile({
    healthConsiderations: ['Asthma or lung conditions'],
    commuteMode: 'Bicycle',
  });
  const city = createMockCity(170); // Unhealthy

  const cards = generateHomeRecommendations(profile, city);

  assert.equal(cards.length, 3);
  // Card 1: Keep windows closed (no purifier fallback)
  assert.equal(cards[0].id, 'home-rec-ambient-closed');

  // Card 2: Respiratory protection advisory
  assert.equal(cards[1].id, 'home-rec-health-respiratory');
  assert.match(cards[1].title, /Protect respiratory comfort/i);

  // Card 3: N95 respirator for active bicycle commute during unhealthy AQI
  assert.equal(cards[2].id, 'home-rec-commute-mask');
  assert.match(cards[2].title, /Wear an N95/i);
});

test('Home Recs: Scenario 5 - Work-from-home user receives phantom load power advice', () => {
  const profile = createMockProfile({ commuteMode: 'Work from home' });
  const city = createMockCity(40); // Good

  const cards = generateHomeRecommendations(profile, city);

  assert.equal(cards.length, 3);
  // Card 3: Home office power down
  assert.equal(cards[2].id, 'home-rec-lifestyle-wfh');
  assert.match(cards[2].title, /Power down idle strips/i);
});

test('Home Recs: Scenario 6 - Missing or null AQI and null profile handles safely', () => {
  const cardsNullCity = generateHomeRecommendations(createMockProfile(), null);
  const cardsNullProfile = generateHomeRecommendations(null, null);

  assert.equal(cardsNullCity.length, 3);
  assert.equal(cardsNullProfile.length, 3);

  for (const card of cardsNullProfile) {
    assert.ok(card.id);
    assert.ok(card.title);
    assert.ok(card.subtitle);
    assert.ok(card.fullDesc);
    assert.ok(card.targetPage);
  }
});

test('Home Recs: Scenario 7 - Exactly three distinct cards in every scenario without duplicates', () => {
  const testAqiValues = [20, 75, 120, 180, 250, 400];
  const testFuels: UserProfile['cookingFuel'][] = [
    'LPG or piped gas',
    'Electricity / induction',
    'Biomass / wood',
  ];

  for (const aqi of testAqiValues) {
    for (const fuel of testFuels) {
      const profile = createMockProfile({ cookingFuel: fuel });
      const city = createMockCity(aqi);
      const cards = generateHomeRecommendations(profile, city);

      assert.equal(cards.length, 3);
      // Ensure unique card IDs
      const uniqueIds = new Set(cards.map((c) => c.id));
      assert.equal(uniqueIds.size, 3, `Duplicate IDs detected in AQI ${aqi} + ${fuel}`);
    }
  }
});
