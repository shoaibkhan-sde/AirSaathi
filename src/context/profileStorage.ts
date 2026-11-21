import type { UserProfile, CityLocation } from '../types';

export const PROFILE_STORAGE_KEY = 'airsaathi_user_profile';
const COORDINATE_FACTOR = 100;

export function loadSavedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCleanProfile(profile: UserProfile, resolved: CityLocation): UserProfile {
  const isGeo = profile.locationSource === 'geolocation';
  const finalLat =
    typeof resolved.latitude === 'number' && Number.isFinite(resolved.latitude)
      ? Math.round(resolved.latitude * COORDINATE_FACTOR) / COORDINATE_FACTOR
      : undefined;
  const finalLon =
    typeof resolved.longitude === 'number' && Number.isFinite(resolved.longitude)
      ? Math.round(resolved.longitude * COORDINATE_FACTOR) / COORDINATE_FACTOR
      : undefined;

  const clean: UserProfile = {
    country: resolved.country || profile.country,
    city: isGeo ? 'Your location' : resolved.city || resolved.name || profile.city,
    locality: resolved.locality,
    district: resolved.district,
    state: resolved.state || resolved.region,
    latitude: finalLat,
    longitude: finalLon,
    locationSource: isGeo ? 'geolocation' : /^\d+$/.test(profile.city.trim()) ? 'pin' : 'manual',
    attribution: resolved.attribution,
    householdMembers: profile.householdMembers,
    healthConsiderations: profile.healthConsiderations || [],
    healthOther: profile.healthOther,
    commuteMode: profile.commuteMode,
    homeType: profile.homeType,
    cookingFuel: profile.cookingFuel,
    heatingFuel: profile.heatingFuel,
    hasAirPurifier: profile.hasAirPurifier,
    ventilationType: profile.ventilationType,
    indoorSmoking: profile.indoorSmoking,
    onboardingCompleted: true,
    onboardingCompletedAt: new Date().toISOString(),
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(clean));
    }
  } catch {
    // Storage unavailable
  }
  return clean;
}
