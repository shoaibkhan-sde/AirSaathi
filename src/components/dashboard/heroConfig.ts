import type { CityLocation, UserProfile } from '../../types';

export interface AQIBadgeConfig {
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  adviceText: string;
}

interface AQIThresholdConfig extends AQIBadgeConfig {
  minAqi: number;
}

const AQI_THRESHOLDS: AQIThresholdConfig[] = [
  {
    minAqi: 300,
    badgeColor: '#881337',
    badgeBg: 'rgba(255, 228, 230, 0.95)',
    badgeBorder: 'rgba(136, 19, 55, 0.35)',
    adviceText: 'Hazardous air quality. Everyone should avoid all outdoor physical exertion.',
  },
  {
    minAqi: 200,
    badgeColor: '#8B5CF6',
    badgeBg: 'rgba(245, 243, 255, 0.95)',
    badgeBorder: 'rgba(139, 92, 246, 0.35)',
    adviceText: 'Avoid outdoor exertion. Wear sealed N95 respirator if stepping outside.',
  },
  {
    minAqi: 150,
    badgeColor: '#EF4444',
    badgeBg: 'rgba(254, 242, 242, 0.95)',
    badgeBorder: 'rgba(239, 68, 68, 0.3)',
    adviceText:
      'Everyone may experience health effects; sensitive groups should avoid outdoor exertion.',
  },
  {
    minAqi: 100,
    badgeColor: '#F97316',
    badgeBg: 'rgba(255, 237, 226, 0.95)',
    badgeBorder: 'rgba(249, 115, 22, 0.3)',
    adviceText:
      'Children, seniors, and respiratory-sensitive individuals should reduce outdoor exertion.',
  },
  {
    minAqi: 50,
    badgeColor: '#F59E0B',
    badgeBg: 'rgba(254, 252, 232, 0.95)',
    badgeBorder: 'rgba(245, 158, 11, 0.3)',
    adviceText:
      'Air quality is acceptable; unusually sensitive individuals should consider limiting heavy exertion.',
  },
];

const DEFAULT_AQI_BADGE: AQIBadgeConfig = {
  badgeColor: '#10B981',
  badgeBg: 'rgba(236, 253, 245, 0.95)',
  badgeBorder: 'rgba(16, 185, 129, 0.3)',
  adviceText: 'Air quality is favorable for outdoor activities.',
};

export function getAQIBadgeConfig(aqi: number): AQIBadgeConfig {
  const match = AQI_THRESHOLDS.find((t) => aqi > t.minAqi);
  return match || DEFAULT_AQI_BADGE;
}

export function getHeroDisplayLocation(
  currentCity: CityLocation,
  userProfile: UserProfile | null
): string {
  const isGeoLocation =
    (userProfile?.locationSource === 'geolocation' || currentCity.source === 'geolocation') &&
    (currentCity.city === 'Your location' ||
      currentCity.name.startsWith('Your location') ||
      !userProfile?.city ||
      userProfile.city === 'Your location');

  const stateName = currentCity.state || currentCity.region || userProfile?.state;

  if (isGeoLocation) {
    return stateName ? `Your location, ${stateName}` : 'Your location';
  }

  const rawName = currentCity.city || currentCity.name;
  const cleanCity = rawName.split(',')[0].trim();
  if (stateName && cleanCity && !cleanCity.toLowerCase().includes(stateName.toLowerCase())) {
    return `${cleanCity}, ${stateName}`;
  }
  return currentCity.name;
}
