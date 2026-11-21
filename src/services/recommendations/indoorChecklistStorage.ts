export const INDOOR_CHECKLIST_STORAGE_KEY = 'airsaathi_indoor_checklist_state';

export function loadIndoorChecklistState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(INDOOR_CHECKLIST_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function saveIndoorChecklistState(state: Record<string, boolean>): void {
  try {
    localStorage.setItem(INDOOR_CHECKLIST_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable
  }
}

export function resetIndoorChecklistState(): void {
  try {
    localStorage.removeItem(INDOOR_CHECKLIST_STORAGE_KEY);
  } catch {
    // Storage unavailable
  }
}
