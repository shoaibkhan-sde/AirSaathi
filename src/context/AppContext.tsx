import React, { useState, useEffect } from 'react';
import type { NavPage, UIStateMode, CityLocation, RecommendationItem } from '../types';
import {
  DEFAULT_GENUINE_CITIES,
  MOCK_RECOMMENDATIONS,
  MOCK_ROUTINES,
  MOCK_ROOMS,
} from '../data/mockData';
import type { UserPreferences } from './AppContextTypes';
import { AppContext } from './AppContextInstance';
import { useToastManager } from './useToastManager';
import { useAppInteractions } from './useAppInteractions';
import { useProfileSync } from './useProfileSync';

export type {
  UserPreferences,
  ToastMessage,
  ActionProposal,
  AppContextType,
} from './AppContextTypes';

import {
  MAX_GENUINE_LOCATIONS,
  RECENT_LOCATIONS_STORAGE_KEY,
  CURRENT_CITY_STORAGE_KEY,
  loadInitialRecentCities,
  loadInitialCurrentCity,
} from './appCityStorage.ts';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<NavPage>('home');
  const [availableCities, setAvailableCities] = useState<CityLocation[]>(loadInitialRecentCities);
  const [currentCity, setCurrentCity] = useState<CityLocation>(() =>
    loadInitialCurrentCity(availableCities[0] || DEFAULT_GENUINE_CITIES[0])
  );
  const [recommendations, setRecommendations] =
    useState<RecommendationItem[]>(MOCK_RECOMMENDATIONS);
  const [uiStateMode, setUiStateMode] = useState<UIStateMode>('normal');

  const [preferences, setPreferences] = useState<UserPreferences>({
    name: 'Sarah',
    householdType: 'family',
    hasPurifier: true,
    outdoorExerciseTime: 'morning',
    notificationsEnabled: true,
    theme: 'light',
    onboardingCompleted: true,
  });

  const { toasts, showToast, removeToast } = useToastManager();

  const {
    routines,
    setRoutines,
    rooms,
    setRooms,
    chatMessages,
    setChatMessages,
    isAssistantTyping,
    setIsAssistantTyping,
    toggleCompleteRoutine,
    toggleSaveRoutine,
    toggleRoomAction,
    sendUserMessage,
    addRoutineFromProposal,
  } = useAppInteractions(MOCK_ROUTINES, MOCK_ROOMS, showToast);

  const {
    userProfile,
    isOnboardingActive,
    saveUserProfile,
    completeOnboarding,
    updateUserProfile,
    retakeOnboarding,
    resetOnboarding,
    getAQICategoryInfo,
  } = useProfileSync({
    currentCity,
    setCurrentCity,
    setRecommendations,
    setRoutines,
    setRooms,
    setActivePage,
    showToast,
  });

  const selectCity = (city: CityLocation) => {
    setCurrentCity(city);
    try {
      localStorage.setItem(CURRENT_CITY_STORAGE_KEY, JSON.stringify(city));
    } catch {
      // Storage unavailable
    }
    setAvailableCities((prev) => {
      const filtered = prev.filter(
        (c) => c.id !== city.id && c.name.toLowerCase() !== city.name.toLowerCase()
      );
      const updated = [city, ...filtered].slice(0, MAX_GENUINE_LOCATIONS);
      try {
        localStorage.setItem(RECENT_LOCATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage unavailable
      }
      return updated;
    });

    if (userProfile) {
      const cityName = city.city || city.name.split(',')[0].trim();
      updateUserProfile(
        {
          city: cityName,
          country: city.country,
          state: city.state || city.region,
          locality: city.locality || cityName,
          latitude: city.latitude,
          longitude: city.longitude,
          locationSource: 'manual',
        },
        city
      );
    }
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
  }, [preferences.theme]);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        currentCity,
        setCurrentCity: selectCity,
        availableCities,
        selectCity,
        recommendations,
        routines,
        rooms,
        chatMessages,
        setChatMessages,
        isAssistantTyping,
        setIsAssistantTyping,
        preferences,
        updatePreferences,
        uiStateMode,
        setUiStateMode,
        userProfile,
        isOnboardingActive,
        saveUserProfile,
        completeOnboarding,
        updateUserProfile,
        retakeOnboarding,
        resetOnboarding,
        toasts,
        showToast,
        removeToast,
        getAQICategoryInfo,
        toggleCompleteRoutine,
        toggleSaveRoutine,
        toggleRoomAction,
        sendUserMessage,
        addRoutineFromProposal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { useApp } from './useApp';
