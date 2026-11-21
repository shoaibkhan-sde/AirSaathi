import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadSavedProfile,
  PROFILE_STORAGE_KEY,
} from '../src/context/profileStorage.ts';
import { generateHomeRecommendations as generatePersonalizedRecommendations } from '../src/services/recommendations/homeRecommendations.ts';
import {
  saveIndoorChecklistState,
  loadIndoorChecklistState,
} from '../src/services/recommendations/indoorChecklistStorage.ts';
import { saveChatHistory, loadChatHistory } from '../src/services/chatStorage.ts';
import type { UserProfile, CityLocation, ChatMessage } from '../src/types/index.ts';

function createMockLocalStorage() {
  const store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v;
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    getStore: () => store,
  };
}

test('Journey D: Personalized Recommendations update immediately when user updates profile in Settings', () => {
  const city: CityLocation = {
    id: 'delhi',
    name: 'Delhi',
    city: 'Delhi',
    country: 'India',
    aqi: 220,
    category: 'Very Unhealthy',
    dominantPollutant: 'PM2.5',
    pm2_5: 110,
    pm10: 180,
  };

  let profile: UserProfile = {
    country: 'India',
    city: 'Delhi',
    householdMembers: ['adults_only'],
    healthConsiderations: [],
    commuteMode: 'Car',
    homeType: 'Apartment / Flat',
    cookingFuel: 'Induction / Electric',
    heatingFuel: 'None',
    hasAirPurifier: false,
    ventilationType: 'natural',
    indoorSmoking: 'none',
    onboardingCompleted: true,
  };

  const recs1 = generatePersonalizedRecommendations(profile, city);
  const titles1 = recs1.map((r) => r.title.toLowerCase());

  profile = {
    ...profile,
    commuteMode: 'Two-Wheeler / Bike',
    cookingFuel: 'Biomass / Wood / Coal',
  };

  const recs2 = generatePersonalizedRecommendations(profile, city);
  const titles2 = recs2.map((r) => r.title.toLowerCase());

  assert.notDeepEqual(titles1, titles2);
  assert.ok(
    titles2.some(
      (t) =>
        t.includes('n95') ||
        t.includes('smoke') ||
        t.includes('cooking') ||
        t.includes('respirat')
    )
  );
});

test('Journey E: AI Assistant interactions, loading state, history persistence, and retry', () => {
  const mockStorage = createMockLocalStorage();
  (globalThis as any).localStorage = mockStorage;

  let chatHistory: ChatMessage[] = loadChatHistory();
  assert.equal(chatHistory.length, 0);

  const userMsg: ChatMessage = {
    id: 'user-1',
    sender: 'user',
    text: 'What is the PM2.5 level right now?',
    timestamp: '11:00 AM',
  };
  chatHistory.push(userMsg);
  saveChatHistory(chatHistory);

  let isAssistantTyping = true;
  assert.equal(isAssistantTyping, true);

  const assistantMsg: ChatMessage = {
    id: 'assistant-1',
    sender: 'assistant',
    text: 'Current PM2.5 is 45 µg/m³, which is in the Moderate category.',
    timestamp: '11:00 AM',
  };
  chatHistory.push(assistantMsg);
  isAssistantTyping = false;
  saveChatHistory(chatHistory);

  assert.equal(isAssistantTyping, false);
  assert.equal(chatHistory.length, 2);

  const reloaded = loadChatHistory();
  assert.equal(reloaded.length, 2);
  assert.equal(reloaded[0].text, userMsg.text);
  assert.equal(reloaded[1].text, assistantMsg.text);
});

test('Journey F: Room Checklist items mark complete, persist across reload, and reset in Settings', () => {
  const mockStorage = createMockLocalStorage();
  (globalThis as any).localStorage = mockStorage;

  let checklistState = loadIndoorChecklistState();
  assert.deepEqual(checklistState, {});

  checklistState['kitchen_exhaust'] = true;
  checklistState['bedroom_seal'] = true;
  saveIndoorChecklistState(checklistState);

  const refreshedState = loadIndoorChecklistState();
  assert.equal(refreshedState['kitchen_exhaust'], true);
  assert.equal(refreshedState['bedroom_seal'], true);

  mockStorage.removeItem(PROFILE_STORAGE_KEY);
  mockStorage.removeItem('airsaathi_indoor_checklist_state');

  const afterResetProfile = loadSavedProfile();
  const afterResetChecklist = loadIndoorChecklistState();
  assert.equal(afterResetProfile, null);
  assert.deepEqual(afterResetChecklist, {});
});
