import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHomeRecommendations as generatePersonalizedRecommendations } from '../src/services/recommendations/homeRecommendations.ts';
import { generateSmartTips } from '../src/services/recommendations/smartTipsEngine.ts';
import { generateIndoorAirGuidance } from '../src/services/recommendations/indoorAirEngine.ts';
import { saveCleanProfile, loadSavedProfile } from '../src/context/profileStorage.ts';
import type { UserProfile, CityLocation } from '../src/types/index.ts';

function setupMockLocalStorage() {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
}

test('Integration Flow 1: Onboarding inputs -> Profile storage -> Personalized Home recommendations', () => {
  setupMockLocalStorage();

  const onboardingInput: UserProfile = {
    country: 'India',
    city: 'Delhi',
    householdMembers: ['children', 'elderly'],
    healthConsiderations: ['Asthma / Respiratory'],
    commuteMode: 'Two-Wheeler / Bike',
    homeType: 'Apartment / Flat',
    cookingFuel: 'LPG',
    heatingFuel: 'None',
    hasAirPurifier: true,
    ventilationType: 'filtered',
    indoorSmoking: 'none',
  };

  const resolvedCity: CityLocation = {
    id: 'delhi-loc',
    name: 'New Delhi',
    city: 'Delhi',
    country: 'India',
    aqi: 280,
    category: 'Very Unhealthy',
    dominantPollutant: 'PM2.5',
    pm2_5: 145,
    pm10: 220,
  };

  const savedProfile = saveCleanProfile(onboardingInput, resolvedCity);
  assert.equal(savedProfile.onboardingCompleted, true);

  const loadedProfile = loadSavedProfile();
  assert.ok(loadedProfile);
  assert.equal(loadedProfile.city, 'Delhi');

  const recs = generatePersonalizedRecommendations(loadedProfile, resolvedCity);
  assert.equal(recs.length, 3);

  const titles = recs.map((r) => r.title.toLowerCase());
  const hasVulnerableProtection = titles.some(
    (t) =>
      t.includes('child') ||
      t.includes('elderly') ||
      t.includes('school') ||
      t.includes('respiratory') ||
      t.includes('mask')
  );
  assert.ok(hasVulnerableProtection, 'Severe AQI + vulnerable members must yield high-priority advisory');
});

test('Integration Flow 2: User profile -> Smart Tips recommendation engine -> Displayed routines', () => {
  const profile: UserProfile = {
    country: 'India',
    city: 'Mumbai',
    householdMembers: ['children'],
    healthConsiderations: [],
    commuteMode: 'Public Transit',
    homeType: 'Apartment / Flat',
    cookingFuel: 'Induction / Electric',
    heatingFuel: 'None',
    hasAirPurifier: false,
    ventilationType: 'natural',
    indoorSmoking: 'none',
  };

  const city: CityLocation = {
    id: 'mumbai',
    name: 'Mumbai',
    city: 'Mumbai',
    country: 'India',
    aqi: 75,
    category: 'Moderate',
    dominantPollutant: 'PM10',
    pm2_5: 20,
    pm10: 75,
  };

  const { routines, protectionCards } = generateSmartTips(profile, city);
  assert.ok(routines.length >= 3);

  const morning = routines.find((r) => r.timeOfDay === 'morning');
  assert.ok(morning);
  assert.equal(morning.completed, false);
  assert.equal(morning.saved, false);

  const pollutantCard = protectionCards.find(
    (r) => r.title.toLowerCase().includes('pm10') || r.category === 'pollutant'
  );
  assert.ok(pollutantCard);
});

test('Integration Flow 3: User profile + Live AQI -> Indoor Air recommendation engine -> Room guidance', () => {
  const biomassProfile: UserProfile = {
    country: 'India',
    city: 'Nashik',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Walking',
    homeType: 'Independent House / Villa',
    cookingFuel: 'Biomass / Wood / Coal',
    heatingFuel: 'Biomass / Fireplace',
    hasAirPurifier: false,
    ventilationType: 'natural',
    indoorSmoking: 'none',
  };

  const { rooms } = generateIndoorAirGuidance(biomassProfile, null);
  const kitchen = rooms.find((r) => r.name.toLowerCase().includes('kitchen'));
  assert.ok(kitchen);

  const kitchenActionTexts = kitchen.actions
    .map((a) => `${a.title} ${a.description}`.toLowerCase())
    .join(' ');
  assert.ok(
    kitchenActionTexts.includes('biomass') ||
      kitchenActionTexts.includes('solid fuel') ||
      kitchenActionTexts.includes('smoke') ||
      kitchenActionTexts.includes('flue') ||
      kitchenActionTexts.includes('draft'),
    'Biomass cooking must trigger specialized combustion ventilation guidance'
  );
});
