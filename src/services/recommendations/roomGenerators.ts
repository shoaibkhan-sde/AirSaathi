import type { UserProfile, CityLocation, RoomGuidance } from '../../types/index.ts';
import { generateIndoorAirGuidance } from './indoorAirEngine.ts';

/**
 * Generates personalized room checklists derived from the centralized indoor air engine.
 */
export function generatePersonalizedRoomGuidance(
  profile: UserProfile,
  city?: CityLocation | null,
  checklistState: Record<string, boolean> = {}
): RoomGuidance[] {
  const result = generateIndoorAirGuidance(profile, city, checklistState);
  return result.rooms;
}
