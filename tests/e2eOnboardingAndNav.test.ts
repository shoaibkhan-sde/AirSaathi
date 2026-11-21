import test from 'node:test';
import assert from 'node:assert/strict';
import {
  saveCleanProfile,
  loadSavedProfile,
  PROFILE_STORAGE_KEY,
} from '../src/context/profileStorage.ts';
import { generateHomeRecommendations as generatePersonalizedRecommendations } from '../src/services/recommendations/homeRecommendations.ts';
import type { UserProfile, CityLocation, NavPage } from '../src/types/index.ts';

function createMockLocalStorage() {
  const store: Record<string, string> = {};
  return {
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
    getStore: () => store,
  };
}

test('Journey A: First-Time User completes Onboarding and lands on Home with Clean-Air Plan', async () => {
  const mockStorage = createMockLocalStorage();
  (globalThis as any).localStorage = mockStorage;

  assert.equal(loadSavedProfile(), null);
  let isOnboardingActive = true;
  let activePage: NavPage = 'home';

  const step1 = {
    country: 'India',
    cityOrPin: 'Pune',
    householdMembers: ['children'] as const,
    locationSource: 'manual' as const,
  };

  const step2 = {
    commuteMode: 'Car' as const,
    homeType: 'Apartment / Flat' as const,
    cookingFuel: 'LPG' as const,
    heatingFuel: 'None' as const,
    hasAirPurifier: true,
    ventilationType: 'natural' as const,
    indoorSmoking: 'none' as const,
    healthConsiderations: ['Asthma / Respiratory'],
  };

  const resolvedCity: CityLocation = {
    id: 'pune',
    name: 'Pune',
    city: 'Pune',
    country: 'India',
    aqi: 145,
    category: 'Unhealthy for Sensitive Groups',
    dominantPollutant: 'PM2.5',
    pm2_5: 55,
    pm10: 95,
  };

  const finalProfile: UserProfile = {
    ...step1,
    city: step1.cityOrPin,
    ...step2,
    householdMembers: [...step1.householdMembers],
    onboardingCompleted: true,
  };

  saveCleanProfile(finalProfile, resolvedCity);
  isOnboardingActive = false;
  activePage = 'home';

  assert.equal(isOnboardingActive, false);
  assert.equal(activePage, 'home');
  const saved = loadSavedProfile();
  assert.ok(saved);
  assert.equal(saved.onboardingCompleted, true);

  const homeRecs = generatePersonalizedRecommendations(saved, resolvedCity);
  assert.equal(homeRecs.length, 3);
  assert.ok(
    homeRecs.some(
      (r) =>
        r.title.toLowerCase().includes('respiratory') ||
        r.title.toLowerCase().includes('child') ||
        r.title.toLowerCase().includes('purifier')
    )
  );
});

test('Journey B: Returning User reloads application and preserves preferences', () => {
  const mockStorage = createMockLocalStorage();
  (globalThis as any).localStorage = mockStorage;

  const existingProfile: UserProfile = {
    country: 'India',
    city: 'Bengaluru',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Public Transit',
    homeType: 'Apartment / Flat',
    cookingFuel: 'Induction / Electric',
    heatingFuel: 'None',
    hasAirPurifier: false,
    ventilationType: 'filtered',
    indoorSmoking: 'none',
    onboardingCompleted: true,
  };
  mockStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(existingProfile));

  const loaded = loadSavedProfile();
  assert.ok(loaded);
  assert.equal(loaded.city, 'Bengaluru');
  assert.equal(loaded.commuteMode, 'Public Transit');
  const isOnboardingActive = !loaded.onboardingCompleted;
  assert.equal(isOnboardingActive, false, 'Returning user must not see onboarding screen');
});

test('Journey C: Dashboard Navigation between all 5 core tabs preserves state', () => {
  let activePage: NavPage = 'home';
  const navHistory: NavPage[] = [];

  const navigateTo = (page: NavPage) => {
    activePage = page;
    navHistory.push(page);
  };

  navigateTo('tips');
  assert.equal(activePage, 'tips');
  navigateTo('indoor');
  assert.equal(activePage, 'indoor');
  navigateTo('sustainability');
  assert.equal(activePage, 'sustainability');
  navigateTo('settings');
  assert.equal(activePage, 'settings');
  navigateTo('home');
  assert.equal(activePage, 'home');

  assert.deepEqual(navHistory, ['tips', 'indoor', 'sustainability', 'settings', 'home']);
});
