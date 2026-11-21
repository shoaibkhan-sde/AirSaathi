import type { UserProfile, CityLocation } from '../../types/index.ts';
import type { HouseholdProtectionCard } from './smartTipsTypes.ts';
import { extractVulnerabilities, AQI_MODERATE_MAX } from './smartTipsRules.ts';

export function buildExposureCard(
  profile: UserProfile | null,
  city: CityLocation
): HouseholdProtectionCard {
  const isHigh = city.aqi > AQI_MODERATE_MAX;
  const mode = profile?.commuteMode || 'Walking';

  if (mode === 'Walking' || mode === 'Bicycle') {
    return {
      id: 'prot-exposure-active',
      tag: 'Commute Protection',
      title: isHigh ? 'Wear N95 Mask on Active Transit' : 'Low-Emission Active Commute',
      description: isHigh
        ? 'Traffic corridors concentrate tailpipe soot. Wear a sealed N95 respirator and choose tree-lined routes.'
        : 'Ambient air is suitable for walking or cycling. Park-adjacent corridors keep exposure minimal.',
      iconType: isHigh ? 'alert' : 'shield',
      priority: isHigh ? 'High' : 'Low',
    };
  }

  if (mode === 'Car') {
    return {
      id: 'prot-exposure-car',
      tag: 'In-Cabin Protection',
      title: 'Run Cabin Air Recirculation in Traffic',
      description:
        'Switch your vehicle air system to internal recirculation mode when idling near heavy diesel vehicles.',
      iconType: 'wind',
      priority: isHigh ? 'High' : 'Medium',
    };
  }

  return {
    id: 'prot-exposure-transit',
    tag: 'Transit Hub Guidance',
    title: isHigh ? 'Mask Up at Transit Stops' : 'Sustainable Public Transit',
    description: isHigh
      ? 'Bus shelters and open platforms accumulate diesel exhaust. A properly fitted mask shields airways.'
      : 'Shared metro and electric transit significantly cut your daily per-passenger carbon footprint.',
    iconType: isHigh ? 'alert' : 'shield',
    priority: isHigh ? 'High' : 'Low',
  };
}

export function buildHouseholdMemberCard(
  profile: UserProfile | null,
  city: CityLocation
): HouseholdProtectionCard {
  const vuln = extractVulnerabilities(profile);
  const isHigh = city.aqi > AQI_MODERATE_MAX;

  if (vuln.hasChildren) {
    return {
      id: 'prot-household-children',
      tag: 'Child Air Protection',
      title: isHigh ? 'Indoor Play During Smog Hours' : 'Safe Outdoor Play for Children',
      description: isHigh
        ? 'Children breathe 50% more air per kilogram of body weight. Move heavy playground activities indoors.'
        : 'Clean atmospheric conditions support healthy outdoor playground exercise and development.',
      iconType: 'users',
      priority: isHigh ? 'High' : 'Low',
    };
  }

  if (vuln.hasSeniors) {
    return {
      id: 'prot-household-seniors',
      tag: 'Senior Health Advisory',
      title: isHigh ? 'Avoid Chilly Morning Inversion Smog' : 'Favorable Air for Senior Wellness',
      description: isHigh
        ? 'Cold morning air combined with trapped soot constricts coronary vessels. Walk in the late afternoon.'
        : 'Air quality is favorable for gentle morning walks and outdoor terrace stretching.',
      iconType: 'users',
      priority: isHigh ? 'High' : 'Low',
    };
  }

  if (vuln.hasRespiratory || vuln.hasHeart) {
    return {
      id: 'prot-household-sensitive',
      tag: 'Airway Precaution',
      title: isHigh ? 'Shield Sensitive Airways' : 'Normal Activity Support',
      description: isHigh
        ? 'Keep prescribed quick-relief inhalers accessible and minimize exertion along major roadways.'
        : 'Current particulate levels carry low respiratory risk; maintain normal daily activities.',
      iconType: 'alert',
      priority: isHigh ? 'High' : 'Low',
    };
  }

  return {
    id: 'prot-household-adults',
    tag: 'Adult Wellness',
    title: isHigh ? 'Protect Deep Alveolar Tissues' : 'Optimal Cardiovascular Air',
    description: isHigh
      ? 'Heavy respiration during cardio pulls ultrafine particles into deeper lung sacs. Shift workouts indoors.'
      : 'Favorable air quality supports full outdoor running, cycling, and fitness routines.',
    iconType: 'shield',
    priority: isHigh ? 'Medium' : 'Low',
  };
}

export function buildVentilationCard(profile: UserProfile | null): HouseholdProtectionCard {
  const isSolid = /wood|biomass|coal|kerosene/i.test(
    `${profile?.cookingFuel || ''} ${profile?.heatingFuel || ''}`
  );
  if (isSolid) {
    return {
      id: 'prot-vent-solid',
      tag: 'Combustion Safety',
      title: 'Maintain Dedicated Solid-Fuel Exhaust',
      description:
        'Solid biomass produces dangerous carbon monoxide and fine soot. Ensure active, unblocked outdoor venting.',
      iconType: 'flame',
      priority: 'High',
    };
  }

  const hasPurifier = Boolean(profile?.hasAirPurifier);
  if (hasPurifier) {
    return {
      id: 'prot-vent-purifier',
      tag: 'Indoor Filtration',
      title: 'Run HEPA Purifier in Occupied Rooms',
      description:
        'Mechanical HEPA filters capture microscopic particles down to 0.3 microns that settle on living furniture.',
      iconType: 'wind',
      priority: 'Medium',
    };
  }

  if (profile?.ventilationType === 'Open windows regularly') {
    return {
      id: 'prot-vent-windows',
      tag: 'Window Management',
      title: 'Time Window Ventilation to Clean Hours',
      description:
        'Because your household opens windows regularly, seal them during morning and evening inversions.',
      iconType: 'wind',
      priority: 'Medium',
    };
  }

  return {
    id: 'prot-vent-dust',
    tag: 'Home Dust Control',
    title: 'Damp-Wipe Surfaces & Seal Drafts',
    description:
      'Use damp microfiber cloths rather than dry sweeping to prevent resuspending coarse dust particles.',
    iconType: 'wind',
    priority: 'Low',
  };
}

export function buildPollutantCard(city: CityLocation): HouseholdProtectionCard {
  const isPM25 = city.dominantPollutant === 'PM2.5';
  const val = isPM25 ? city.pm2_5 : city.pm10;
  const numStr = typeof val === 'number' ? ` (${val} µg/m³)` : '';

  return {
    id: 'prot-dominant-pollutant',
    tag: 'Dominant Pollutant',
    title: isPM25 ? `Fine Particulates PM2.5${numStr}` : `Coarse Dust PM10${numStr}`,
    description: isPM25
      ? 'Microscopic particles under 2.5 µm penetrate pulmonary alveoli directly into the cardiovascular bloodstream.'
      : 'Coarse dust particles under 10 µm primarily trigger eye, throat, and upper bronchial passage irritation.',
    iconType: 'alert',
    priority: city.aqi > AQI_MODERATE_MAX ? 'High' : 'Medium',
  };
}
