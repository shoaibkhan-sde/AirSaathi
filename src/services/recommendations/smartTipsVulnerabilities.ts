import type { UserProfile } from '../../types/index.ts';

export const AQI_GOOD_MAX = 50;
export const AQI_MODERATE_MAX = 100;
export const AQI_USG_MAX = 150;
export const AQI_UNHEALTHY_MAX = 200;

export function extractVulnerabilities(profile?: UserProfile | null) {
  const members = profile?.householdMembers || [];
  const sens = profile?.healthConsiderations || [];
  const hasChildren = members.includes('children');
  const hasSeniors = members.includes('seniors');
  const hasRespiratory = sens.some((s) => /asthma|respiratory|lung/i.test(s));
  const hasHeart = sens.some((s) => /heart/i.test(s));
  const hasPregnancy = sens.some((s) => /pregnan/i.test(s));

  const factors: string[] = [];
  if (hasChildren) factors.push('Children in home');
  if (hasSeniors) factors.push('Older adults (65+)');
  if (hasRespiratory) factors.push('Respiratory sensitivity');
  if (hasHeart) factors.push('Cardiovascular sensitivity');
  if (hasPregnancy) factors.push('Pregnancy consideration');

  return {
    isVulnerable: factors.length > 0,
    hasChildren,
    hasSeniors,
    hasRespiratory,
    hasHeart,
    hasPregnancy,
    factors,
  };
}
