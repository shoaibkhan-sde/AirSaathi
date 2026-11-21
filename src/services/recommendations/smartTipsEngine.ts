import type { UserProfile, CityLocation } from '../../types/index.ts';
import type { SmartTipsResult, SmartTipRecommendation } from './smartTipsTypes.ts';
import {
  buildMorningRule,
  buildAfternoonRule,
  buildEveningRule,
  AQI_GOOD_MAX,
} from './smartTipsRules.ts';
import {
  buildExposureCard,
  buildHouseholdMemberCard,
  buildVentilationCard,
  buildPollutantCard,
} from './smartTipsProtectionRules.ts';

export * from './smartTipsTypes.ts';
export * from './smartTipsRules.ts';
export * from './smartTipsProtectionRules.ts';

function selectFeaturedTip(
  routines: SmartTipRecommendation[],
  city: CityLocation
): SmartTipRecommendation {
  const highPriority = routines.find((r) => r.priority === 'High');
  if (highPriority) return highPriority;

  if (city.aqi <= AQI_GOOD_MAX) {
    const goodMorning = routines.find((r) => r.id === 'tip-morning-good-fresh');
    if (goodMorning) return goodMorning;
  }

  return routines[0];
}

/**
 * Centrally evaluates user onboarding profile and real-time environmental data
 * to produce deterministic, prioritized Smart Tips routines and household protection guidance.
 */
export function generateSmartTips(
  profile: UserProfile | null,
  city: CityLocation
): SmartTipsResult {
  const morning = buildMorningRule(profile, city);
  const afternoon = buildAfternoonRule(profile, city);
  const evening = buildEveningRule(profile, city);
  const routines: SmartTipRecommendation[] = [morning, afternoon, evening];

  const protectionCards = [
    buildExposureCard(profile, city),
    buildHouseholdMemberCard(profile, city),
    buildVentilationCard(profile),
    buildPollutantCard(city),
  ];

  const featuredTip = selectFeaturedTip(routines, city);

  return {
    featuredTip,
    routines,
    protectionCards,
  };
}
