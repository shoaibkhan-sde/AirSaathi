import type {
  BackendRecommendation,
  AirQualityCurrentResponse,
  OnboardingCompleteRequest,
} from './types.ts';
import {
  buildOutdoorRec,
  buildCommuteRec,
  HIGH_AQI_THRESHOLD,
  SEVERE_AQI_THRESHOLD,
} from './outdoorRecommendationBuilders.ts';
import { buildIndoorRec } from './indoorRecommendationBuilders.ts';

export { HIGH_AQI_THRESHOLD, SEVERE_AQI_THRESHOLD };

const MAX_RECOMMENDATIONS_COUNT = 4;

function extractVulnerabilities(profile: OnboardingCompleteRequest): {
  isVulnerable: boolean;
  affectedGroups: string[];
} {
  const affected: string[] = [];
  if (profile.householdMembers.some((m) => /children|under 12/i.test(m))) affected.push('children');
  if (profile.householdMembers.some((m) => /seniors|65/i.test(m))) affected.push('older adults');

  const sensitivities = profile.healthSensitivities || [];
  if (sensitivities.some((s) => /asthma|respiratory|lung/i.test(s)))
    affected.push('respiratory sensitivity');
  if (sensitivities.some((s) => /heart/i.test(s))) affected.push('heart conditions');
  if (sensitivities.some((s) => /pregnan/i.test(s))) affected.push('pregnancy');

  return { isVulnerable: affected.length > 0, affectedGroups: affected };
}

function buildHeatingRec(heating: string): BackendRecommendation | null {
  if (!/wood|biomass|coal|solid/i.test(heating)) return null;
  return {
    id: 'rec-heating-solid',
    title: 'Avoid unvented open fires inside sleeping spaces',
    description:
      'Open coal or wood heaters in poorly ventilated bedrooms create hazardous carbon monoxide spikes.',
    whyItMatters:
      'Carbon monoxide binds to hemoglobin and causes invisible, potentially fatal oxygen deprivation.',
    effort: 'Medium',
    priority: 'High',
    relevantProfileFactors: ['Solid heating fuel'],
    sourceCategory: 'Heating Safety',
    saved: false,
    completed: false,
  };
}

/**
 * Generates personalized clean-air recommendations based on AQI and household factors.
 */
export function generatePersonalizedRecommendations(
  aqiData: AirQualityCurrentResponse,
  profile: OnboardingCompleteRequest
): BackendRecommendation[] {
  const recommendations: BackendRecommendation[] = [];
  const { isVulnerable, affectedGroups } = extractVulnerabilities(profile);

  recommendations.push(
    buildOutdoorRec(aqiData.value, isVulnerable, affectedGroups, profile.commuteMode)
  );
  recommendations.push(buildCommuteRec(profile.commuteMode, aqiData.value));
  recommendations.push(
    buildIndoorRec(
      profile.cookingFuel,
      Boolean(profile.hasAirPurifier),
      aqiData.value,
      profile.homeType
    )
  );

  const heatingRec = buildHeatingRec(profile.heatingFuel);
  if (heatingRec) recommendations.push(heatingRec);

  return recommendations.slice(0, MAX_RECOMMENDATIONS_COUNT);
}
