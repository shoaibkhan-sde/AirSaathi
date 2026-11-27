import { useState, useEffect } from 'react';
import type {
  UserProfile,
  CityLocation,
  NavPage,
  AQICategory,
  RecommendationItem,
  RoutineActivity,
  RoomGuidance,
} from '../types';
import { resolveLocationAQI } from '../services/airQualityService';
import {
  generatePersonalizedRecommendations,
  generatePersonalizedRoutines,
  generatePersonalizedRoomGuidance,
} from '../services/recommendationEngine';
import { loadSavedProfile, saveCleanProfile, PROFILE_STORAGE_KEY } from './profileStorage';
import { CPCB_CATEGORIES } from '../data/mockData';

interface UseProfileSyncProps {
  currentCity: CityLocation;
  setCurrentCity: (city: CityLocation) => void;
  setRecommendations: (recs: RecommendationItem[]) => void;
  setRoutines: (routines: RoutineActivity[]) => void;
  setRooms: (rooms: RoomGuidance[]) => void;
  setActivePage: (page: NavPage) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'info') => void;
}

function formatResolvedCityName(resolved: CityLocation, profile: UserProfile): void {
  const isGeo = profile.locationSource === 'geolocation' || profile.city === 'Your location';
  if (isGeo) {
    const stateName = resolved.state || resolved.region || 'Maharashtra';
    resolved.name = stateName ? `Your location, ${stateName}` : 'Your location';
    resolved.city = 'Your location';
  } else {
    const cityName = resolved.city || resolved.name || profile.city;
    const stateName = resolved.state || resolved.region || '';
    resolved.name =
      stateName && !cityName.toLowerCase().includes(stateName.toLowerCase())
        ? `${cityName}, ${stateName}`
        : cityName;
    resolved.city = cityName;
  }
}

export function useProfileSync({
  currentCity,
  setCurrentCity,
  setRecommendations,
  setRoutines,
  setRooms,
  setActivePage,
  showToast,
}: UseProfileSyncProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(loadSavedProfile);
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(
    () => !userProfile?.onboardingCompleted
  );

  const applyResolvedLocation = (resolved: CityLocation, profile: UserProfile) => {
    formatResolvedCityName(resolved, profile);
    setCurrentCity(resolved);
    try {
      localStorage.setItem('airsaathi_current_city', JSON.stringify(resolved));
    } catch {
      // Storage unavailable
    }
    setRecommendations(generatePersonalizedRecommendations(profile, resolved));
    setRoutines(generatePersonalizedRoutines(profile, resolved));
    setRooms(generatePersonalizedRoomGuidance(profile));
  };

  const saveUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
    const isGeo = profile.locationSource === 'geolocation' || profile.city === 'Your location';
    const coords =
      isGeo && profile.latitude && profile.longitude
        ? { lat: profile.latitude, lon: profile.longitude }
        : undefined;
    const resolved = await resolveLocationAQI(profile.city, profile.country, coords);

    applyResolvedLocation(resolved, profile);
    const cleanProfile = saveCleanProfile(profile, resolved);
    setUserProfile(cleanProfile);
    return cleanProfile;
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    setActivePage('home');
    showToast(
      'Clean-Air Plan Ready!',
      'Your personalized dashboard and recommendations are active.',
      'success'
    );
  };

  const updateUserProfile = (updates: Partial<UserProfile>, activeCity?: CityLocation) => {
    if (!userProfile) return;
    const targetCity = activeCity || currentCity;
    const updated: UserProfile = { ...userProfile, ...updates };
    const cleanProfile = saveCleanProfile(updated, targetCity);
    setUserProfile(cleanProfile);
    setRecommendations(generatePersonalizedRecommendations(cleanProfile, targetCity));
    setRoutines(generatePersonalizedRoutines(cleanProfile, targetCity));
    setRooms(generatePersonalizedRoomGuidance(cleanProfile));
  };

  const retakeOnboarding = () => setIsOnboardingActive(true);
  const resetOnboarding = () => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setUserProfile(null);
    setIsOnboardingActive(true);
    showToast('Questionnaire Reset', 'Please re-calibrate your household.', 'info');
  };

  const getAQICategoryInfo = (aqi: number) => {
    const item =
      CPCB_CATEGORIES.find((c) => aqi >= c.min && aqi <= c.max) ||
      CPCB_CATEGORIES[CPCB_CATEGORIES.length - 1];
    return {
      category: item.category as AQICategory,
      color: item.color,
      bg: item.bg,
      desc: item.desc,
    };
  };

  useEffect(() => {
    if (userProfile?.onboardingCompleted) {
      const isGeo = userProfile.locationSource === 'geolocation';
      const coords =
        isGeo && userProfile.latitude && userProfile.longitude
          ? { lat: userProfile.latitude, lon: userProfile.longitude }
          : undefined;
      resolveLocationAQI(userProfile.city, userProfile.country, coords)
        .then((res) => applyResolvedLocation(res, userProfile))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    userProfile,
    setUserProfile,
    isOnboardingActive,
    saveUserProfile,
    completeOnboarding,
    updateUserProfile,
    retakeOnboarding,
    resetOnboarding,
    getAQICategoryInfo,
  };
}
