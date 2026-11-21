import type { ChatMessage } from '../types';

const STORAGE_KEY = 'airsaathi_chat_history';

export function loadChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (m) => m && typeof m.id === 'string' && (m.sender === 'user' || m.sender === 'assistant')
      );
    }
  } catch (err) {
    console.warn('[AirSaathi Chat] Failed to load chat history from localStorage', err);
  }
  return [];
}

export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.warn('[AirSaathi Chat] Failed to save chat history to localStorage', err);
  }
}

export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[AirSaathi Chat] Failed to clear chat history from localStorage', err);
  }
}
