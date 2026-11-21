import type { UserProfile, CityLocation, RoomGuidance, RoomActionItem } from '../../types/index.ts';

export { buildKitchenRoom } from './indoorAirKitchen.ts';

function createAction(
  id: string,
  title: string,
  description: string,
  priority: 'High' | 'Medium' | 'Optional',
  costLevel: 'Free' | 'Low-cost' | 'Investment',
  state: Record<string, boolean>
): RoomActionItem {
  return { id, title, description, priority, costLevel, completed: Boolean(state[id]) };
}

export function buildLivingRoom(
  profile: UserProfile | null,
  city: CityLocation | null | undefined,
  state: Record<string, boolean>
): RoomGuidance {
  const isHigh = (city?.aqi ?? 50) > 100;
  const hasPurifier = Boolean(profile?.hasAirPurifier);

  const actions = [
    isHigh
      ? createAction(
          'lr-window-boundaries',
          'Maintain Closed Streetward Windows',
          'Keep front windows sealed against ambient traffic plumes.',
          'High',
          'Free',
          state
        )
      : createAction(
          'lr-fresh-flush',
          'Midday Natural Cross-Ventilation',
          'Open opposing windows for 15–20 minutes to flush stale CO₂.',
          'Medium',
          'Free',
          state
        ),
    hasPurifier
      ? createAction(
          'lr-purifier-placement',
          'Position Purifier 1 Foot from Walls',
          'Allows unobstructed 360-degree intake circulation across gathering areas.',
          'Medium',
          'Free',
          state
        )
      : createAction(
          'lr-door-sweep',
          'Install Entryway Draft Sweep',
          'A 5mm bottom door sweep blocks corridor particulate and dust ingress.',
          'Optional',
          'Low-cost',
          state
        ),
  ];

  return {
    id: 'living',
    name: 'Living Room',
    status: isHigh ? 'Moderate' : 'Clean',
    description: 'Primary household gathering hub and doorway barrier zone.',
    actions,
  };
}

export function buildBedroom(
  profile: UserProfile | null,
  state: Record<string, boolean>
): RoomGuidance {
  const hasPurifier = Boolean(profile?.hasAirPurifier);
  const sens = profile?.healthConsiderations || [];
  const hasSens = sens.some((s) => /asthma|lung|respirat/i.test(s));

  const actions = [
    hasPurifier
      ? createAction(
          'br-purifier-sleep',
          'Nocturnal Bedroom Air Sanctuary',
          'Run purifier on quiet auto mode 45 minutes before sleep for clean rest.',
          'High',
          'Free',
          state
        )
      : createAction(
          'br-draft-stopper',
          'Seal Sleeping Door Margins',
          'Place a draft stopper at bedroom door margins to create an overnight clean pocket.',
          'High',
          'Low-cost',
          state
        ),
    hasSens
      ? createAction(
          'br-no-fragrance',
          'Zero Scented Spray or Chemical Fragrance',
          'Eliminate aerosol fresheners and candles that trigger bronchial irritation.',
          'High',
          'Free',
          state
        )
      : createAction(
          'br-linens-warm',
          'Wash Bed Linens in Warm Water Weekly',
          'Neutralizes microscopic dust mite reservoirs and settled micro-dust.',
          'Medium',
          'Free',
          state
        ),
  ];

  return {
    id: 'bedroom',
    name: 'Primary Bedroom',
    status: 'Clean',
    description: 'Restorative sleep sanctuary where 7–9 hours of breathing takes place.',
    actions,
  };
}

export function buildStudyRoom(state: Record<string, boolean>): RoomGuidance {
  return {
    id: 'study',
    name: 'Study & Workspace',
    status: 'Clean',
    description: 'Dedicated workspace for remote work and closed-door concentration.',
    actions: [
      createAction(
        'st-cross-draft',
        'Dedicated Screen-Break Airing',
        'Open study window for 10 minutes when ambient air is clean to disperse CO₂.',
        'Medium',
        'Free',
        state
      ),
      createAction(
        'st-printer-vent',
        'Isolate Laser Printer Exhaust',
        'Position printers away from desk breathing zones to avoid ozone inhalation.',
        'Optional',
        'Free',
        state
      ),
    ],
  };
}
