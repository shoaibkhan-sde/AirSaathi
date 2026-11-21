import type { UserProfile } from '../../types/index.ts';
import type { SustainabilityData } from './sustainabilityTypes.ts';
import { calculateCompletedImpact } from './sustainabilityCalculations.ts';
import { generatePersonalizedAlternatives } from './sustainabilityAlternatives.ts';
import { generateSustainableActions } from './sustainabilityActions.ts';

export * from './sustainabilityTypes.ts';
export * from './sustainabilityCalculations.ts';
export * from './sustainabilityStorage.ts';
export * from './sustainabilityAlternatives.ts';
export * from './sustainabilityActions.ts';

export function generateSustainabilityData(
  profile: UserProfile | null,
  completedMap: Record<string, boolean>
): SustainabilityData {
  const allAlternatives = generatePersonalizedAlternatives(profile);
  const recommendedAlternatives = allAlternatives.slice(0, 3);
  const actions = generateSustainableActions(profile, completedMap);

  const { totalCo2SavedKg, completedCount, contributing } = calculateCompletedImpact(
    actions,
    completedMap
  );

  const hasActivityData = completedCount > 0;

  return {
    impact: {
      hasActivityData,
      totalCo2SavedKg,
      completedActionsCount: completedCount,
      totalActionsCount: actions.length,
      reportingPeriod: 'Tracked Impact',
      contributingActions: contributing,
    },
    recommendedAlternatives,
    allAlternatives,
    actions,
  };
}
