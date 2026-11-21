import test from 'node:test';
import assert from 'node:assert/strict';
import {
  loadIndoorChecklistState,
  saveIndoorChecklistState,
  resetIndoorChecklistState,
  INDOOR_CHECKLIST_STORAGE_KEY,
} from '../src/services/recommendations/indoorChecklistStorage.ts';
import {
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from '../src/services/chatStorage.ts';
import type { ChatMessage } from '../src/types/index.ts';

function setupMockLocalStorage(initialStore: Record<string, string> = {}) {
  const store = { ...initialStore };
  let shouldThrow = false;

  const mock = {
    getItem: (key: string) => {
      if (shouldThrow) throw new Error('Storage access denied (Quota or Security)');
      return store[key] ?? null;
    },
    setItem: (key: string, value: string) => {
      if (shouldThrow) throw new Error('Storage access denied (Quota or Security)');
      store[key] = value;
    },
    removeItem: (key: string) => {
      if (shouldThrow) throw new Error('Storage access denied (Quota or Security)');
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    setThrow: (val: boolean) => {
      shouldThrow = val;
    },
    getStore: () => store,
  };

  (globalThis as any).localStorage = mock;
  return mock;
}

test('Storage Resilience: Indoor Checklist Storage handles normal and corrupted states', () => {
  const mockStorage = setupMockLocalStorage();

  assert.deepEqual(loadIndoorChecklistState(), {});

  saveIndoorChecklistState({ 'kitchen-exhaust': true, 'bedroom-seal': false });
  assert.deepEqual(loadIndoorChecklistState(), {
    'kitchen-exhaust': true,
    'bedroom-seal': false,
  });

  mockStorage.setItem(INDOOR_CHECKLIST_STORAGE_KEY, 'INVALID{JSON');
  assert.deepEqual(loadIndoorChecklistState(), {});

  mockStorage.setItem(INDOOR_CHECKLIST_STORAGE_KEY, JSON.stringify(12345));
  assert.deepEqual(loadIndoorChecklistState(), {});

  saveIndoorChecklistState({ test: true });
  resetIndoorChecklistState();
  assert.deepEqual(loadIndoorChecklistState(), {});

  mockStorage.setThrow(true);
  assert.doesNotThrow(() => saveIndoorChecklistState({ test: true }));
  assert.doesNotThrow(() => resetIndoorChecklistState());
  assert.deepEqual(loadIndoorChecklistState(), {});
  mockStorage.setThrow(false);
});

test('Storage Resilience: Chat Storage filters invalid items and handles corruptions', () => {
  const mockStorage = setupMockLocalStorage();

  assert.deepEqual(loadChatHistory(), []);

  const validMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      sender: 'user',
      text: 'What is today AQI?',
      timestamp: '10:00 AM',
    },
    {
      id: 'msg-2',
      sender: 'assistant',
      text: 'Current AQI is 120.',
      timestamp: '10:01 AM',
    },
  ];
  saveChatHistory(validMessages);
  assert.deepEqual(loadChatHistory(), validMessages);

  const dirtyArray = [
    { id: 'good-1', sender: 'user', text: 'Hi', timestamp: '10:00' },
    { sender: 'assistant', text: 'Missing id' },
    { id: 'bad-sender', sender: 'hacker', text: 'Invalid sender' },
    null,
    undefined,
    'string-instead-of-object',
  ];
  mockStorage.setItem('airsaathi_chat_history', JSON.stringify(dirtyArray));
  const recovered = loadChatHistory();
  assert.equal(recovered.length, 1);
  assert.equal(recovered[0].id, 'good-1');

  mockStorage.setItem('airsaathi_chat_history', '<<<NOT JSON>>>');
  assert.deepEqual(loadChatHistory(), []);

  saveChatHistory(validMessages);
  clearChatHistory();
  assert.deepEqual(loadChatHistory(), []);

  mockStorage.setThrow(true);
  assert.doesNotThrow(() => saveChatHistory(validMessages));
  assert.doesNotThrow(() => clearChatHistory());
  assert.deepEqual(loadChatHistory(), []);
  mockStorage.setThrow(false);
});
