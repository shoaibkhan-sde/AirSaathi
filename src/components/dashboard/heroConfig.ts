import type { CityLocation, UserProfile } from '../../types';

export interface AQIBadgeConfig {
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  adviceText: string;
}

export function getAQIBadgeConfig(aqi: number): AQIBadgeConfig {
  if (aqi > 300) {
    return {
      badgeColor: '#881337',
      badgeBg: 'rgba(255, 228, 230, 0.95)',
      badgeBorder: 'rgba(136, 19, 55, 0.35)',
      adviceText: 'Hazardous air quality. Everyone should avoid all outdoor physical exertion.',
    };
  }
  if (aqi > 200) {
    return {
      badgeColor: '#8B5CF6',
      badgeBg: 'rgba(245, 243, 255, 0.95)',
      badgeBorder: 'rgba(139, 92, 246, 0.35)',
      adviceText: 'Avoid outdoor exertion. Wear sealed N95 respirator if stepping outside.',
    };
  }
  if (aqi > 150) {
    return {
      badgeColor: '#EF4444',
      badgeBg: 'rgba(254, 242, 242, 0.95)',
      badgeBorder: 'rgba(239, 68, 68, 0.3)',
      adviceText:
        'Everyone may experience health effects; sensitive groups should avoid outdoor exertion.',
    };
  }
  if (aqi > 100) {
    return {
      badgeColor: '#F97316',
      badgeBg: 'rgba(255, 237, 226, 0.95)',
      badgeBorder: 'rgba(249, 115, 22, 0.3)',
      adviceText:
        'Children, seniors, and respiratory-sensitive individuals should reduce outdoor exertion.',
    };
  }
  if (aqi > 50) {
    return {
      badgeColor: '#F59E0B',
      badgeBg: 'rgba(254, 252, 232, 0.95)',
      badgeBorder: 'rgba(245, 158, 11, 0.3)',
      adviceText:
        'Air quality is acceptable; unusually sensitive individuals should consider limiting heavy exertion.',
    };
  }
  return {
    badgeColor: '#10B981',
    badgeBg: 'rgba(236, 253, 245, 0.95)',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    adviceText: 'Air quality is favorable for outdoor activities.',
  };
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
