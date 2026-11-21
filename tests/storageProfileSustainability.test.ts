import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadCompletedActions,
  saveCompletedActions,
  resetCompletedActions,
  SUSTAINABILITY_ACTIONS_STORAGE_KEY,
} from '../src/services/sustainability/sustainabilityStorage.ts';
import {
  loadSavedProfile,
  saveCleanProfile,
  PROFILE_STORAGE_KEY,
} from '../src/context/profileStorage.ts';
import type { UserProfile, CityLocation } from '../src/types/index.ts';

function setupMockLocalStorage(initialStore: Record<string, string> = {}) {
  const store = { ...initialStore };
  let shouldThrow = false;

  const mock = {
    getItem: (key: string) => {
      if (shouldThrow) throw new Error('Storage access denied (Quota or Security)');
      return store[key] ?? null;
    },
    setItem: (key: string, value: string) => {
      if (shouldThrow) throw new Error('Storage access denied (Quota or Security)');
      store[key] = value;
    },
    removeItem: (key: string) => {
      if (shouldThrow) throw new Error('Storage access denied (Quota or Security)');
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    setThrow: (val: boolean) => {
      shouldThrow = val;
    },
    getStore: () => store,
  };

  (globalThis as any).localStorage = mock;
  return mock;
}

test('Storage Resilience: Sustainability Storage protects against undefined/corrupted environments', () => {
  const mockStorage = setupMockLocalStorage();

  assert.deepEqual(loadCompletedActions(), {});

  saveCompletedActions({ 'metro-shift': true, 'wfh-plug': true });
  assert.deepEqual(loadCompletedActions(), {
    'metro-shift': true,
    'wfh-plug': true,
  });

  mockStorage.setItem(SUSTAINABILITY_ACTIONS_STORAGE_KEY, '{corrupted');
  assert.deepEqual(loadCompletedActions(), {});

  mockStorage.setItem(SUSTAINABILITY_ACTIONS_STORAGE_KEY, '"hello world"');
  assert.deepEqual(loadCompletedActions(), {});

  saveCompletedActions({ test: true });
  resetCompletedActions();
  assert.deepEqual(loadCompletedActions(), {});

  mockStorage.setThrow(true);
  assert.doesNotThrow(() => saveCompletedActions({ test: true }));
  assert.doesNotThrow(() => resetCompletedActions());
  assert.deepEqual(loadCompletedActions(), {});
  mockStorage.setThrow(false);
});

test('Storage Resilience: Profile Storage privacy rounding and exception tolerance', () => {
  const mockStorage = setupMockLocalStorage();

  assert.equal(loadSavedProfile(), null);

  const rawProfile: UserProfile = {
    country: 'India',
    city: 'Pune',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Public Transit',
    homeType: 'Apartment / Flat',
    cookingFuel: 'LPG',
    heatingFuel: 'None',
    hasAirPurifier: false,
    ventilationType: 'natural',
    indoorSmoking: 'none',
    locationSource: 'geolocation',
  };

  const resolvedLocation: CityLocation = {
    id: 'pune',
    name: 'Pune',
    city: 'Pune',
    country: 'India',
    latitude: 18.5204303,
    longitude: 73.8567437,
    aqi: 110,
    category: 'Moderate',
    pm2_5: 35,
    pm10: 60,
  };

  const saved = saveCleanProfile(rawProfile, resolvedLocation);
  assert.equal(saved.latitude, 18.52);
  assert.equal(saved.longitude, 73.86);
  assert.equal(saved.onboardingCompleted, true);
  assert.ok(saved.onboardingCompletedAt);

  const loaded = loadSavedProfile();
  assert.equal(loaded?.city, 'Your location');
  assert.equal(loaded?.latitude, 18.52);

  mockStorage.setItem(PROFILE_STORAGE_KEY, 'corrupted JSON string');
  assert.equal(loadSavedProfile(), null);

  mockStorage.setThrow(true);
  assert.doesNotThrow(() => saveCleanProfile(rawProfile, resolvedLocation));
  assert.equal(loadSavedProfile(), null);
  mockStorage.setThrow(false);
});
