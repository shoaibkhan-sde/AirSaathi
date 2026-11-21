import type { UserProfile, CityLocation } from '../../types/index.ts';
import type { HomeRecommendationCard } from './homeRecommendationTypes.ts';

function isBiomass(fuel?: string): boolean {
  return /wood|biomass|coal|kerosene/i.test(fuel || '');
}

function isInduction(fuel?: string): boolean {
  return /electric|induction/i.test(fuel || '');
}

function hasRespiratoryCondition(profile: UserProfile | null): boolean {
  if (!profile?.healthConsiderations) return false;
  return profile.healthConsiderations.some((c) => /asthma|respiratory|lung|bronchial/i.test(c));
}

export function buildAmbientCard(
  profile: UserProfile | null,
  city?: CityLocation | null
): HomeRecommendationCard {
  const aqi = city?.aqi;
  const isElevated = typeof aqi === 'number' && aqi > 100;
  const isGood = typeof aqi === 'number' && aqi <= 50;

  if (isElevated) {
    if (profile?.hasAirPurifier) {
      return {
        id: 'home-rec-ambient-purifier',
        title: 'Keep windows closed',
        subtitle: 'Run your air purifier in occupied rooms.',
        fullDesc: 'Outdoor air is elevated. Keep streetward windows shut and run your purifier.',
        iconType: 'purifier',
        iconColor: 'text-[#0284C7]',
        iconBg: 'bg-[#F0F8FF] border-[#E0F0FE]',
        targetPage: 'indoor',
      };
    }
    return {
      id: 'home-rec-ambient-closed',
      title: 'Keep windows closed',
      subtitle: 'Limit outdoor particle entry until air quality improves.',
      fullDesc: 'Outdoor air is elevated. Keep exterior windows closed to seal rooms.',
      iconType: 'window',
      iconColor: 'text-[#F06543]',
      iconBg: 'bg-[#FFF3EC] border-[#FFE5D8]',
      targetPage: 'indoor',
    };
  }

  if (isGood) {
    return {
      id: 'home-rec-ambient-flush',
      title: 'Natural fresh air flush',
      subtitle: 'Natural ventilation is safe and optimal today.',
      fullDesc: 'Outdoor air is clean. Open cross-facing windows to flush stale indoor air.',
      iconType: 'leaf',
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-[#F0FBF5] border-[#DCF7E6]',
      targetPage: 'indoor',
    };
  }

  return {
    id: 'home-rec-ambient-moderate',
    title: 'Ventilate off-peak hours',
    subtitle: 'Air out rooms away from peak commute rush.',
    fullDesc: 'Moderate air quality permits ventilation away from traffic rush hours.',
    iconType: 'window',
    iconColor: 'text-[#0284C7]',
    iconBg: 'bg-[#F0F8FF] border-[#E0F0FE]',
    targetPage: 'indoor',
  };
}

export function buildHouseholdCard(
  profile: UserProfile | null,
  city?: CityLocation | null
): HomeRecommendationCard {
  const isElevated = typeof city?.aqi === 'number' && city.aqi > 100;
  const fuel = profile?.cookingFuel;
  const members = profile?.householdMembers || [];

  if (hasRespiratoryCondition(profile)) {
    return {
      id: 'home-rec-health-respiratory',
      title: isElevated ? 'Protect respiratory comfort' : 'Minimize airborne triggers',
      subtitle: isElevated
        ? 'Avoid smoke, incense, and strenuous exertion.'
        : 'Keep bronchial airways free of dust and smoke.',
      fullDesc: 'Sensitive airways are vulnerable to particulates. Reduce indoor combustion.',
      iconType: 'shield',
      iconColor: 'text-[#E11D48]',
      iconBg: 'bg-[#FFF1F2] border-[#FFE4E6]',
      targetPage: 'tips',
    };
  }

  if (members.includes('children')) {
    return {
      id: 'home-rec-family-children',
      title: 'Damp-wipe play areas',
      subtitle: 'Prevent children from kicking up settled dust particles.',
      fullDesc: 'Children inhale more air per kg body weight. Damp-wipe floors and toys.',
      iconType: 'shield',
      iconColor: 'text-[#D97706]',
      iconBg: 'bg-[#FFFBEB] border-[#FEF3C7]',
      targetPage: 'indoor',
    };
  }

  if (members.includes('seniors')) {
    return {
      id: 'home-rec-family-seniors',
      title: 'Prioritize indoor rest',
      subtitle: 'Protect senior cardiovascular health during pollution peaks.',
      fullDesc: 'Older adults face cardiovascular strain during elevated PM2.5.',
      iconType: 'shield',
      iconColor: 'text-[#7C3AED]',
      iconBg: 'bg-[#F5F3FF] border-[#EDE9FE]',
      targetPage: 'tips',
    };
  }

  if (isBiomass(fuel)) {
    return {
      id: 'home-rec-kitchen-biomass',
      title: 'Ventilate cooking smoke',
      subtitle: 'Keep chimney draft clear from living areas.',
      fullDesc: 'Ensure solid-fuel combustion drafts cleanly away from living areas.',
      iconType: 'stove',
      iconColor: 'text-[#EA580C]',
      iconBg: 'bg-[#FFF7ED] border-[#FFEDD5]',
      targetPage: 'indoor',
    };
  }

  if (isInduction(fuel)) {
    return {
      id: 'home-rec-kitchen-induction',
      title: 'Cover cookware while searing',
      subtitle: 'Trap cooking oil droplets under fitted pan lids.',
      fullDesc: 'Fitted lids capture volatilized cooking oil aerosol droplets.',
      iconType: 'stove',
      iconColor: 'text-[#059669]',
      iconBg: 'bg-[#ECFDF5] border-[#D1FAE5]',
      targetPage: 'indoor',
    };
  }

  return {
    id: 'home-rec-kitchen-lpg',
    title: 'Pre-draft kitchen exhaust',
    subtitle: 'Run exhaust 60s before lighting burners.',
    fullDesc: 'Establish outward airflow before turning on LPG burners.',
    iconType: 'stove',
    iconColor: 'text-[#0284C7]',
    iconBg: 'bg-[#F0F8FF] border-[#E0F0FE]',
    targetPage: 'indoor',
  };
}
