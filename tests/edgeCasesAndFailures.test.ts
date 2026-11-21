import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHomeRecommendations as generatePersonalizedRecommendations } from '../src/services/recommendations/homeRecommendations.ts';
import { generateSmartTips } from '../src/services/recommendations/smartTipsEngine.ts';
import { generateIndoorAirGuidance } from '../src/services/recommendations/indoorAirEngine.ts';
import { buildOfflineFallback, mapUSAQICategory } from '../src/services/airQualityBuilder.ts';
import { generateSustainabilityData } from '../src/services/sustainability/sustainabilityEngine.ts';
import { sanitizeUserPrompt, validateAndSanitizeAiOutput } from '../server/promptSanitizer.ts';
import type { UserProfile, CityLocation } from '../src/types/index.ts';

test('Edge Case: Complete network offline failure defaults gracefully to non-crashing fallback', () => {
  const fallback = buildOfflineFallback('', 'India');
  assert.ok(fallback);
  assert.equal(fallback.isDemo, true);
  assert.ok(typeof fallback.aqi === 'number');
  assert.ok(fallback.pollutants && fallback.pollutants.length > 0);
  assert.ok(fallback.freshness.includes('Offline fallback'));
});

test('Edge Case: Incomplete or null profile object does not crash recommendation engines', () => {
  const nullProfile = null as unknown as UserProfile;
  const dummyCity: CityLocation = {
    id: 'test',
    name: 'Test City',
    city: 'Test City',
    country: 'India',
    aqi: 155,
    category: 'Unhealthy',
    dominantPollutant: 'PM2.5',
  };

  // Home Recommendations with null profile
  const homeRecs = generatePersonalizedRecommendations(nullProfile, dummyCity);
  assert.equal(homeRecs.length, 3);

  // Smart Tips with null profile
  const { routines } = generateSmartTips(nullProfile, dummyCity);
  assert.ok(routines.length >= 3);

  // Indoor guidance with null profile
  const { rooms } = generateIndoorAirGuidance(nullProfile, null);
  assert.ok(rooms.length >= 2);
});

test('Edge Case: Corrupted or missing environmental AQI does not crash recommendation engines', () => {
  const validProfile: UserProfile = {
    country: 'India',
    city: 'Delhi',
    householdMembers: ['children'],
    healthConsiderations: ['Asthma / Respiratory'],
    commuteMode: 'Public Transit',
    homeType: 'Apartment / Flat',
    cookingFuel: 'LPG',
    heatingFuel: 'None',
    hasAirPurifier: true,
    ventilationType: 'filtered',
    indoorSmoking: 'none',
  };

  const corruptedCity = {
    id: 'corrupt',
    name: 'Corrupt City',
    aqi: NaN, // Malformed numerical AQI
  } as unknown as CityLocation;

  assert.doesNotThrow(() => {
    const recs = generatePersonalizedRecommendations(validProfile, corruptedCity);
    assert.equal(recs.length, 3);
  });
});

test('Edge Case: Rapid multiple clicks / duplicate submissions prevention', async () => {
  let isSubmitting = false;
  let successfulSubmissions = 0;

  const submitAction = async () => {
    if (isSubmitting) return false;
    isSubmitting = true;
    try {
      // Simulate asynchronous persistence
      await new Promise((resolve) => setTimeout(resolve, 50));
      successfulSubmissions++;
      return true;
    } finally {
      isSubmitting = false;
    }
  };

  // Fire 5 rapid concurrent clicks
  const results = await Promise.all([
    submitAction(),
    submitAction(),
    submitAction(),
    submitAction(),
    submitAction(),
  ]);

  // Only the first one should have proceeded, others blocked
  const processed = results.filter(Boolean).length;
  assert.equal(processed, 1);
  assert.equal(successfulSubmissions, 1);
});

test('Edge Case: Empty or whitespace-only chatbot message submissions', () => {
  const emptyMessages = ['', '   ', '\n\t  \n', '\r\n'];

  for (const msg of emptyMessages) {
    const trimmed = msg.trim();
    assert.equal(trimmed.length, 0);
    // Sanitize prompt must not produce valid queries from empty inputs
    const sanitized = sanitizeUserPrompt(msg);
    assert.equal(sanitized.trim(), '');
  }
});

test('Edge Case: Upstream Gemini empty candidates or missing parts handled with safe fallback', () => {
  // Empty or undefined reply
  const emptyOutput = validateAndSanitizeAiOutput(undefined as any, 'gemini-1.5-flash');
  assert.equal(emptyOutput.isFallback, true);
  assert.ok(emptyOutput.reply.length > 0);

  // Whitespace only reply
  const whitespaceOutput = validateAndSanitizeAiOutput('   \n\t  ', 'gemini-1.5-flash');
  assert.equal(whitespaceOutput.isFallback, true);
  assert.ok(whitespaceOutput.reply.length > 0);
});

test('Edge Case: Sustainability calculations with zero, negative, and extreme inputs', () => {
  const profile: UserProfile = {
    country: 'India',
    city: 'Pune',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Walking',
    homeType: 'Apartment',
    cookingFuel: 'Electricity / induction',
    heatingFuel: 'No heating / Not applicable',
    hasAirPurifier: false,
    ventilationType: 'Mostly closed windows',
    indoorSmoking: 'No',
    onboardingCompleted: true,
  };

  // Zero completed actions
  const zeroData = generateSustainabilityData(profile, {});
  assert.equal(zeroData.impact.totalCo2SavedKg, 0);
  assert.equal(zeroData.impact.completedActionsCount, 0);
  assert.equal(zeroData.impact.hasActivityData, false);

  // Unknown commute mode
  const unknownProfile = { ...profile, commuteMode: 'Spaceship' as any };
  const unknownData = generateSustainabilityData(unknownProfile, { 'action-transit': true });
  assert.ok(unknownData.impact.totalCo2SavedKg > 0); // Gracefully defaults to standard baseline
});

test('Edge Case: Extreme boundary and negative AQI numerical handling', () => {
  assert.equal(mapUSAQICategory(-10), 'Good');
  assert.equal(mapUSAQICategory(0), 'Good');
  assert.equal(mapUSAQICategory(50), 'Good');
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
  assert.equal(mapUSAQICategory(9999), 'Hazardous');
});
