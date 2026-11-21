import type { UserProfile, CityLocation, RoutineActivity } from '../../types';
import { generateSmartTips } from './smartTipsEngine';

/**
 * Generates personalized routines derived from the centralized Smart Tips engine.
 */
export function generatePersonalizedRoutines(
  profile: UserProfile,
  city: CityLocation
): RoutineActivity[] {
  const { routines } = generateSmartTips(profile, city);
  return routines.map((r) => ({
    id: r.id,
    timeOfDay: r.timeOfDay === 'all' ? 'morning' : r.timeOfDay,
    timeSlot: r.timeSlot || '08:00 – 09:00 AM',
    title: r.title,
    recommendation: r.description,
    reason: r.reason,
    suggestedAlternative: r.learnMoreDetails?.action || 'Follow indoor exercise alternatives',
    effort: r.effort,
    priority: r.priority,
    relevantFactors: r.relevantFactors,
    learnMoreDetails: r.learnMoreDetails,
    completed: r.completed,
    saved: r.saved,
  }));
}
