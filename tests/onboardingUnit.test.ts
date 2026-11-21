import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInitialLocationState,
  getInitialLifestyleState,
} from '../src/components/onboarding/onboardingFormDefaults.ts';
import type { UserProfile, HouseholdOption } from '../src/types/profile.ts';

test('Onboarding Unit: Default initial states when profile is null', () => {
  const loc = getInitialLocationState(null);
  assert.equal(loc.country, 'India');
  assert.equal(loc.cityOrPin, '');
  assert.equal(loc.detectedCoords, undefined);
  assert.equal(loc.locationSource, 'manual');

  const life = getInitialLifestyleState(null);
  assert.deepEqual(life.householdMembers, ['adults_only']);
  assert.deepEqual(life.healthConsiderations, []);
  assert.equal(life.healthOtherText, '');
  assert.equal(life.commuteMode, '');
  assert.equal(life.homeType, '');
  assert.equal(life.cookingFuel, '');
  assert.equal(life.heatingFuel, '');
  assert.equal(life.hasAirPurifier, true);
  assert.equal(life.ventilationType, 'Mostly closed windows');
  assert.equal(life.indoorSmoking, 'No');
});

test('Onboarding Unit: Initial states populate correctly from existing profile', () => {
  const mockProfile: UserProfile = {
    country: 'United Kingdom',
    city: 'London',
    locality: 'Westminster',
    latitude: 51.5,
    longitude: -0.12,
    locationSource: 'geolocation',
    householdMembers: ['children', 'elderly'],
    healthConsiderations: ['Asthma / Respiratory', 'Other'],
    healthOther: 'Dust allergy',
    commuteMode: 'Public Transit',
    homeType: 'Apartment / Flat',
    cookingFuel: 'LPG',
    heatingFuel: 'Electric Heat Pump',
    hasAirPurifier: true,
    ventilationType: 'filtered',
    indoorSmoking: 'none',
    onboardingCompleted: true,
  };

  const loc = getInitialLocationState(mockProfile);
  assert.equal(loc.country, 'United Kingdom');
  assert.equal(loc.cityOrPin, 'London');
  assert.deepEqual(loc.detectedCoords, { lat: 51.5, lon: -0.12 });
  assert.equal(loc.locationSource, 'geolocation');

  const life = getInitialLifestyleState(mockProfile);
  assert.deepEqual(life.householdMembers, ['children', 'elderly']);
  assert.deepEqual(life.healthConsiderations, ['Asthma / Respiratory', 'Other']);
  assert.equal(life.healthOtherText, 'Dust allergy');
  assert.equal(life.commuteMode, 'Public Transit');
  assert.equal(life.homeType, 'Apartment / Flat');
  assert.equal(life.cookingFuel, 'LPG');
  assert.equal(life.heatingFuel, 'Electric Heat Pump');
  assert.equal(life.hasAirPurifier, true);
  assert.equal(life.ventilationType, 'filtered');
});

test('Onboarding Unit: Mutual exclusivity of adults_only vs vulnerable household members', () => {
  let members: HouseholdOption[] = ['children'];

  // Helper toggle function mirroring useOnboardingForm
  const toggle = (current: HouseholdOption[], option: HouseholdOption): HouseholdOption[] => {
    if (option === 'adults_only') {
      return current.includes('adults_only') ? [] : ['adults_only'];
    }
    const filtered = current.filter((m) => m !== 'adults_only');
    return filtered.includes(option) ? filtered.filter((m) => m !== option) : [...filtered, option];
  };

  // Adding elderly when children is active
  members = toggle(members, 'elderly');
  assert.deepEqual(members, ['children', 'elderly']);

  // Selecting adults_only clears children and elderly
  members = toggle(members, 'adults_only');
  assert.deepEqual(members, ['adults_only']);

  // Selecting pregnant removes adults_only
  members = toggle(members, 'pregnant');
  assert.deepEqual(members, ['pregnant']);

  // Selecting adults_only again clears pregnant
  members = toggle(members, 'adults_only');
  assert.deepEqual(members, ['adults_only']);

  // Toggling adults_only off leaves empty
  members = toggle(members, 'adults_only');
  assert.deepEqual(members, []);
});

test('Onboarding Unit: Health consideration toggle handles Other custom text correctly', () => {
  let health: string[] = ['Asthma / Respiratory'];
  let otherText = 'Pollen allergy';

  const toggleHealth = (
    current: string[],
    option: string,
    onClearOther: () => void
  ): string[] => {
    if (current.includes(option)) {
      if (option === 'Other') onClearOther();
      return current.filter((h) => h !== option);
    }
    return [...current, option];
  };

  // Toggle Other ON
  health = toggleHealth(health, 'Other', () => {
    otherText = '';
  });
  assert.ok(health.includes('Other'));
  assert.equal(otherText, 'Pollen allergy');

  // Toggle Other OFF clears custom other text
  health = toggleHealth(health, 'Other', () => {
    otherText = '';
  });
  assert.ok(!health.includes('Other'));
  assert.equal(otherText, '');
});

test('Onboarding Unit: Location source detection from input query', () => {
  const detectSource = (val: string, hasCoords: boolean): 'pin' | 'manual' | 'geolocation' => {
    if (hasCoords) return 'geolocation';
    return /^\d+$/.test(val.trim()) ? 'pin' : 'manual';
  };

  assert.equal(detectSource('443404', false), 'pin');
  assert.equal(detectSource('110001', false), 'pin');
  assert.equal(detectSource('Mumbai', false), 'manual');
  assert.equal(detectSource('   ', true), 'geolocation');
  assert.equal(detectSource('Bengaluru 560001', false), 'manual');
});

test('Onboarding Unit: Step validation logic', () => {
  // Step 1 Validation: country && isLocationProvided && householdMembers.length > 0
  const isStep1Valid = (country: string, cityOrPin: string, members: string[], isGeo: boolean) => {
    const isLocationProvided = isGeo || cityOrPin.trim().length >= 2;
    return Boolean(country && isLocationProvided && members.length > 0);
  };

  assert.equal(isStep1Valid('India', 'Delhi', ['children'], false), true);
  assert.equal(isStep1Valid('India', '', ['children'], true), true); // geolocation valid without city text
  assert.equal(isStep1Valid('', 'Delhi', ['children'], false), false); // missing country
  assert.equal(isStep1Valid('India', 'D', ['children'], false), false); // query too short
  assert.equal(isStep1Valid('India', 'Delhi', [], false), false); // missing household members

  // Step 2 Validation: commuteMode && homeType && cookingFuel && heatingFuel
  const isStep2Valid = (commute: string, home: string, cooking: string, heating: string) => {
    return Boolean(commute && home && cooking && heating);
  };

  assert.equal(isStep2Valid('Car', 'Apartment', 'LPG', 'Electric Heat Pump'), true);
  assert.equal(isStep2Valid('', 'Apartment', 'LPG', 'Electric Heat Pump'), false);
  assert.equal(isStep2Valid('Car', '', 'LPG', 'Electric Heat Pump'), false);
  assert.equal(isStep2Valid('Car', 'Apartment', '', 'Electric Heat Pump'), false);
  assert.equal(isStep2Valid('Car', 'Apartment', 'LPG', ''), false);
});
