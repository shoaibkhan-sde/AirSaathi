import type { UserProfile, CityLocation } from '../../types/index.ts';
import type { HomeRecommendationCard } from './homeRecommendationTypes.ts';
import { buildAmbientCard, buildHouseholdCard } from './homeRecommendationRules.ts';

export * from './homeRecommendationTypes.ts';
export * from './homeRecommendationRules.ts';

export function buildLifestyleCard(
  profile: UserProfile | null,
  city?: CityLocation | null
): HomeRecommendationCard {
  const isElevated = typeof city?.aqi === 'number' && city.aqi > 100;
  const commute = profile?.commuteMode;

  if (isElevated) {
    const isOpenAirCommute = /walk|bicycle|bike|motorcycle|scooter|two-wheeler/i.test(commute || '');
    if (isOpenAirCommute) {
      return {
        id: 'home-rec-commute-mask',
        title: 'Wear an N95 outdoors',
        subtitle: 'Filter traffic particulates during active travel.',
        fullDesc:
          'Active commuting and riding two-wheelers increases direct exposure to traffic exhaust. A well-fitted respirator protects lungs.',
        iconType: 'shield',
        iconColor: 'text-[#E11D48]',
        iconBg: 'bg-[#FFF1F2] border-[#FFE4E6]',
        targetPage: 'tips',
      };
    }
    return {
      id: 'home-rec-commute-cabin',
      title: 'Recirculate cabin air',
      subtitle: 'Keep vehicle AC in recirculation mode in traffic.',
      fullDesc: 'Closing outside air vents reduces in-cabin particulate penetration.',
      iconType: 'car',
      iconColor: 'text-[#D97706]',
      iconBg: 'bg-[#FFFBEB] border-[#FEF3C7]',
      targetPage: 'tips',
    };
  }

  if (commute === 'Car') {
    return {
      id: 'home-rec-transit-shift',
      title: 'Shift short trips to transit',
      subtitle: 'Avoid solo vehicle tailpipe emissions.',
      fullDesc: 'Shifting a short urban trip to public transit avoids direct CO₂ emissions.',
      iconType: 'bus',
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-[#F0FBF5] border-[#DCF7E6]',
      targetPage: 'sustainability',
    };
  }

  if (commute === 'Walking' || commute === 'Bicycle') {
    return {
      id: 'home-rec-transit-active',
      title: 'Active low-emission travel',
      subtitle: 'Good air quality supports outdoor mobility.',
      fullDesc: 'Clean ambient air makes today ideal for zero-tailpipe walking or cycling.',
      iconType: 'bike',
      iconColor: 'text-[#16A34A]',
      iconBg: 'bg-[#F0FBF5] border-[#DCF7E6]',
      targetPage: 'sustainability',
    };
  }

  if (commute === 'Work from home') {
    return {
      id: 'home-rec-lifestyle-wfh',
      title: 'Power down idle strips',
      subtitle: 'Unplug home office chargers to cut phantom draw.',
      fullDesc: 'Eliminating standby phantom loads conserves household electricity.',
      iconType: 'zap',
      iconColor: 'text-[#059669]',
      iconBg: 'bg-[#ECFDF5] border-[#D1FAE5]',
      targetPage: 'sustainability',
    };
  }

  return {
    id: 'home-rec-transit-general',
    title: 'Choose low-emission transit',
    subtitle: 'Walk, cycle, or use transit when practical.',
    fullDesc: 'Combine errands and use electrified transit to reduce street-level smog.',
    iconType: 'bus',
    iconColor: 'text-[#16A34A]',
    iconBg: 'bg-[#F0FBF5] border-[#DCF7E6]',
    targetPage: 'sustainability',
  };
}

export function generateHomeRecommendations(
  profile: UserProfile | null,
  city?: CityLocation | null
): [HomeRecommendationCard, HomeRecommendationCard, HomeRecommendationCard] {
  const card1 = buildAmbientCard(profile, city);
  const card2 = buildHouseholdCard(profile, city);
  const card3 = buildLifestyleCard(profile, city);

  return [card1, card2, card3];
}
