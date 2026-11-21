import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSustainabilityData,
  generatePersonalizedAlternatives,
  generateSustainableActions,
  calculateCompletedImpact,
  loadCompletedActions,
  saveCompletedActions,
  resetCompletedActions,
} from '../src/services/sustainability/sustainabilityEngine.ts';
import type { UserProfile } from '../src/types/index.ts';

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

test('Sustainability: Car commute generates public transit and active walking shift', () => {
  const profile = createMockProfile({ commuteMode: 'Car' });
  const alternatives = generatePersonalizedAlternatives(profile);

  assert.ok(alternatives.some((a) => a.id === 'alt-transit-shift'));
  assert.ok(alternatives.some((a) => a.id === 'alt-active-walk'));
  assert.ok(!alternatives.some((a) => a.id === 'alt-wfh-walk'));
});

test('Sustainability: Public transit user receives first/last mile links rather than redundant transit recommendation', () => {
  const busProfile = createMockProfile({ commuteMode: 'Bus' });
  const metroProfile = createMockProfile({ commuteMode: 'Metro or train' });

  const busAlts = generatePersonalizedAlternatives(busProfile);
  const metroAlts = generatePersonalizedAlternatives(metroProfile);

  assert.ok(busAlts.some((a) => a.id === 'alt-transit-connect'));
  assert.ok(!busAlts.some((a) => a.id === 'alt-transit-shift'));

  assert.ok(metroAlts.some((a) => a.id === 'alt-transit-connect'));
  assert.ok(!metroAlts.some((a) => a.id === 'alt-transit-shift'));
});

test('Sustainability: Work-from-home users do not receive daily commute advice', () => {
  const profile = createMockProfile({ commuteMode: 'Work from home' });
  const alternatives = generatePersonalizedAlternatives(profile);
  const actions = generateSustainableActions(profile, {});

  assert.ok(alternatives.some((a) => a.id === 'alt-wfh-walk'));
  assert.ok(!alternatives.some((a) => a.id === 'alt-transit-shift'));

  const travelAction = actions.find((a) => a.id === 'action-transit');
  assert.match(travelAction?.title || '', /Neighborhood Errands/i);
});

test('Sustainability: Walking and cycling users receive zero-tailpipe active corridor guidance', () => {
  const walkProfile = createMockProfile({ commuteMode: 'Walking' });
  const bikeProfile = createMockProfile({ commuteMode: 'Bicycle' });

  const walkAlts = generatePersonalizedAlternatives(walkProfile);
  const bikeAlts = generatePersonalizedAlternatives(bikeProfile);

  assert.ok(walkAlts.some((a) => a.id === 'alt-active-maintain'));
  assert.ok(bikeAlts.some((a) => a.id === 'alt-active-maintain'));
});

test('Sustainability: Cooking fuel tailors kitchen energy advice', () => {
  const lpgProfile = createMockProfile({ cookingFuel: 'LPG or piped gas' });
  const indProfile = createMockProfile({ cookingFuel: 'Electricity / induction' });
  const bioProfile = createMockProfile({ cookingFuel: 'Biomass / wood' });

  const lpgAlts = generatePersonalizedAlternatives(lpgProfile);
  const indAlts = generatePersonalizedAlternatives(indProfile);
  const bioAlts = generatePersonalizedAlternatives(bioProfile);

  assert.ok(lpgAlts.some((a) => a.id === 'alt-cook-lpg'));
  assert.ok(indAlts.some((a) => a.id === 'alt-cook-induction'));
  assert.ok(bioAlts.some((a) => a.id === 'alt-cook-clean'));
});

test('Sustainability: Zero completed actions displays empty state and 0 kg CO2', () => {
  const profile = createMockProfile();
  const data = generateSustainabilityData(profile, {});

  assert.equal(data.impact.hasActivityData, false);
  assert.equal(data.impact.totalCo2SavedKg, 0);
  assert.equal(data.impact.completedActionsCount, 0);
  assert.equal(data.impact.contributingActions.length, 0);
});

test('Sustainability: Completed actions calculate transparent CO2 without fabrication', () => {
  const profile = createMockProfile();
  const completedMap = {
    'action-transit': true, // 1.2 kg
    'action-standby': true, // 0.3 kg
  };

  const data = generateSustainabilityData(profile, completedMap);

  assert.equal(data.impact.hasActivityData, true);
  assert.equal(data.impact.completedActionsCount, 2);
  assert.equal(data.impact.totalCo2SavedKg, 1.5);
  assert.equal(data.impact.contributingActions.length, 2);
  assert.equal(data.impact.contributingActions[0].id, 'action-transit');
  assert.equal(data.impact.contributingActions[1].id, 'action-standby');
});

test('Sustainability: Duplicate checks or non-existent action keys do not inflate impact', () => {
  const actions = generateSustainableActions(createMockProfile(), {});
  const malformedMap = {
    'action-transit': true,
    'non-existent-action': true,
    random_junk: true,
  };

  const { totalCo2SavedKg, completedCount } = calculateCompletedImpact(actions, malformedMap);

  assert.equal(completedCount, 1);
  assert.equal(totalCo2SavedKg, 1.2);
});

test('Sustainability: Missing or null profile does not crash and provides sensible fallbacks', () => {
  const data = generateSustainabilityData(null, {});

  assert.ok(data.recommendedAlternatives.length > 0);
  assert.ok(data.allAlternatives.length >= 3);
  assert.equal(data.actions.length, 6);
  assert.equal(data.impact.hasActivityData, false);
  assert.equal(data.impact.totalCo2SavedKg, 0);
});

test('Sustainability: Storage functions safely handle environments without localStorage', () => {
  // In node.js test runner, global localStorage may be absent or polyfilled
  assert.doesNotThrow(() => {
    saveCompletedActions({ 'action-transit': true });
    const loaded = loadCompletedActions();
    assert.equal(typeof loaded, 'object');
    resetCompletedActions();
  });
});
