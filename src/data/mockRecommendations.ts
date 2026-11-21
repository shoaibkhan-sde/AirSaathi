import type { RecommendationItem } from '../types';
export { MOCK_ROUTINES } from './mockRoutines.ts';
export { MOCK_ROOMS } from './mockRooms.ts';

export const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'rec-1',
    title: 'Keep windows closed until air quality improves.',
    description:
      'Outdoor ambient PM2.5 is elevated. Sealing natural ventilation during morning hours avoids indoor pollution influx.',
    category: 'routine',
    iconType: 'window',
    whyItMatters:
      'Outdoor fine dust infiltrates unsealed windows rapidly, reaching 60–80% of outdoor concentration within 2 hours.',
    alternative:
      'Perform quick 10-minute cross-ventilation in the mid-afternoon when surface temperature rises and wind disperses inversion.',
    effort: 'Low',
    exposureReduction: 'Up to 65% indoor infiltration cut',
    saved: true,
    completed: false,
  },
  {
    id: 'rec-2',
    title: 'Use an air purifier in living spaces.',
    description:
      'Keep your True HEPA filter active on auto/medium mode in occupied rooms to scrub recirculating particulates.',
    category: 'indoor',
    iconType: 'purifier',
    whyItMatters:
      'Mechanical filtration traps microscopic PM2.5 and allergen particles that settle in communal living quarters.',
    alternative:
      'If purifier is unavailable, isolate a low-traffic bedroom and use clean cotton towel seal beneath doorframes.',
    effort: 'Low',
    exposureReduction: 'Clears 85–95% of room particulates within 45 mins',
    saved: false,
    completed: true,
  },
  {
    id: 'rec-3',
    title: 'Choose low-emission transport.',
    description:
      'Opt for metro, electric bus, or combined public transit rather than idling in congested single-occupancy vehicles.',
    category: 'travel',
    iconType: 'bike',
    whyItMatters:
      'Traffic jams generate localized micro-zones of toxic NOx and soot right at breathing level.',
    alternative:
      'Car-pool with neighbors or schedule non-urgent travel outside peak rush windows (8:00–10:30 AM).',
    effort: 'Medium',
    exposureReduction: 'Reduces direct roadway particulate inhalation by up to 50%',
    saved: false,
    completed: false,
  },
];
