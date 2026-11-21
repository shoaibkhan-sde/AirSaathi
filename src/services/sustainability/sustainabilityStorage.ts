export const SUSTAINABILITY_ACTIONS_STORAGE_KEY = 'airsaathi_sustainability_actions';

export function loadCompletedActions(): Record<string, boolean> {
  if (typeof localStorage === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(SUSTAINABILITY_ACTIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCompletedActions(state: Record<string, boolean>): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(SUSTAINABILITY_ACTIONS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable
  }
}

export function resetCompletedActions(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(SUSTAINABILITY_ACTIONS_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}
