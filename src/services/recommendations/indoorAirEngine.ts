import type { UserProfile, CityLocation, RoomGuidance } from '../../types/index.ts';
import type { IndoorAirResult, IndoorHeroGuidance, IndoorQuickTip } from './indoorAirTypes.ts';
import {
  buildKitchenRoom,
  buildLivingRoom,
  buildBedroom,
  buildStudyRoom,
} from './indoorAirRooms.ts';

export * from './indoorAirTypes.ts';
export * from './indoorChecklistStorage.ts';
export * from './indoorAirRooms.ts';

function isBiomass(fuel?: string): boolean {
  return /wood|biomass|coal|kerosene/i.test(fuel || '');
}

function isInduction(fuel?: string): boolean {
  return /electric|induction/i.test(fuel || '');
}

export function buildIndoorHero(
  profile: UserProfile | null,
  city?: CityLocation | null
): IndoorHeroGuidance {
  const hasAqi = typeof city?.aqi === 'number';
  const aqi = city?.aqi || 0;
  const isHigh = aqi > 100;
  const fuel = profile?.cookingFuel || 'Standard';

  if (!hasAqi || !city) {
    return {
      statusTitle: 'Indoor air sensor not connected',
      sensorNote:
        "AirSaathi currently doesn't have direct indoor air measurements. Your indoor AQI is unknown, not zero.",
      description:
        'Showing general indoor air quality precautions calibrated to your household profile.',
      guidanceTitle: 'Personalized indoor guidance is active',
      guidanceSubtitle:
        'Recommendations below use your household profile and current outdoor air quality.',
      statusPill: `Calibrated for ${fuel} Household Habits`,
      hasOutdoorAqi: false,
    };
  }

  const desc = isHigh
    ? `Outdoor air in ${city.name} is ${city.category} (US AQI ${aqi}). Minimize outdoor air infiltration by keeping street-facing windows closed, minimized with window seals.`
    : `Outdoor air in ${city.name} is ${city.category} (US AQI ${aqi}). Ambient conditions permit natural fresh air exchange to flush accumulated indoor carbon dioxide.`;

  return {
    statusTitle: 'Indoor air sensor not connected',
    sensorNote:
      "AirSaathi currently doesn't have direct indoor air measurements. Your indoor AQI is unknown, not zero.",
    description: desc,
    guidanceTitle: 'Personalized indoor guidance is active',
    guidanceSubtitle:
      'Recommendations below use your household profile and current outdoor air quality.',
    statusPill: `Calibrated for ${fuel} & ${city.category} Outdoor Air`,
    hasOutdoorAqi: true,
  };
}

export function buildIndoorQuickTips(
  profile: UserProfile | null,
  city?: CityLocation | null
): IndoorQuickTip[] {
  const tips: IndoorQuickTip[] = [];
  const fuel = profile?.cookingFuel || '';
  const aqi = city?.aqi ?? 50;

  // 1. Source Control
  if (isBiomass(fuel)) {
    tips.push({
      id: 'tip-source-biomass',
      category: 'source_control',
      title: 'Ventilate Solid-Fuel Smoke',
      description:
        'Maintain unblocked chimney draft and keep living quarters sealed from combustion smoke.',
      iconType: 'flame',
      priority: 'High',
    });
  } else if (isInduction(fuel)) {
    tips.push({
      id: 'tip-source-induction',
      category: 'source_control',
      title: 'Contain Cooking Aerosols',
      description:
        'Use fitted pan lids during searing to prevent volatilized oil droplet spread into living rooms.',
      iconType: 'stove',
      priority: 'Medium',
    });
  } else {
    tips.push({
      id: 'tip-source-lpg',
      category: 'source_control',
      title: 'Pre-Draft Kitchen Exhaust',
      description:
        'Run chimney or exhaust 60 seconds before lighting burners to establish steady outward airflow.',
      iconType: 'stove',
      priority: 'Medium',
    });
  }

  // 2. Ventilation
  if (aqi > 100) {
    tips.push({
      id: 'tip-vent-elevated',
      category: 'ventilation',
      title: 'Seal Streetward Windows',
      description:
        'Keep exterior windows closed during high smog hours without sacrificing interior airflow.',
      iconType: 'window',
      priority: 'High',
    });
  } else {
    tips.push({
      id: 'tip-vent-favorable',
      category: 'ventilation',
      title: 'Natural Cross-Ventilation',
      description:
        'Open opposing windows for 15–20 minutes when outdoor air is clean to flush stale CO₂.',
      iconType: 'window',
      priority: 'Medium',
    });
  }

  // 3. Personal Protection & Air Sanctuary
  const hasPurifier = Boolean(profile?.hasAirPurifier);
  const sens = profile?.healthConsiderations || [];
  const hasSens = sens.some((s) => /asthma|lung|respirat|heart|pregnan/i.test(s));

  if (hasPurifier) {
    tips.push({
      id: 'tip-protect-purifier',
      category: 'personal_protection',
      title: 'Nocturnal Bedroom Sanctuary',
      description:
        'Operate your HEPA purifier in sleeping areas 45 minutes before bedtime for restorative breathing.',
      iconType: 'purifier',
      priority: 'High',
    });
  } else if (hasSens || (profile?.householdMembers || []).includes('children')) {
    tips.push({
      id: 'tip-protect-vulnerable-damp',
      category: 'personal_protection',
      title: 'Damp-Wipe Dust Reservoirs',
      description:
        'Use damp microfiber cloths instead of dry brooms to avoid kicking up floor allergens into breathing zones.',
      iconType: 'shield',
      priority: 'High',
    });
  } else {
    tips.push({
      id: 'tip-protect-general-linens',
      category: 'personal_protection',
      title: 'Weekly Warm Linen Wash',
      description:
        'Washing bed linens weekly at warm temperatures eliminates microscopic dust mites and settled particles.',
      iconType: 'leaf',
      priority: 'Optional',
    });
  }

  return tips;
}

export function generateIndoorAirGuidance(
  profile: UserProfile | null,
  city?: CityLocation | null,
  checklistState: Record<string, boolean> = {}
): IndoorAirResult {
  const hero = buildIndoorHero(profile, city);
  const quickTips = buildIndoorQuickTips(profile, city);

  const rooms: RoomGuidance[] = [
    buildKitchenRoom(profile, checklistState),
    buildLivingRoom(profile, city, checklistState),
    buildBedroom(profile, checklistState),
  ];

  if (profile?.commuteMode === 'Work from home') {
    rooms.push(buildStudyRoom(checklistState));
  }

  return { hero, quickTips, rooms };
}
