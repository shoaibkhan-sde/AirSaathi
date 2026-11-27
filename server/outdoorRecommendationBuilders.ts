import type { BackendRecommendation } from './types.ts';

export const HIGH_AQI_THRESHOLD = 100;
export const SEVERE_AQI_THRESHOLD = 200;

export function buildOutdoorRec(
  aqi: number,
  isVulnerable: boolean,
  affected: string[],
  commute: string
): BackendRecommendation {
  if (aqi > SEVERE_AQI_THRESHOLD) {
    return {
      id: 'rec-outdoor-severe',
      title: 'Postpone strenuous outdoor exercise',
      description:
        'Shift intense cardiovascular activities and children’s outdoor play indoors until ambient pollution clears.',
      whyItMatters:
        'Heavy physical exertion significantly increases minute ventilation and fine particulate delivery into deeper pulmonary alveoli.',
      alternative: 'Indoor bodyweight workouts, gentle stretching, or yoga in a filtered room.',
      effort: 'Low',
      priority: 'High',
      relevantProfileFactors:
        affected.length > 0
          ? [`High ambient AQI (${aqi})`, `Household includes: ${affected.join(', ')}`]
          : [`Hazardous ambient AQI (${aqi})`],
      sourceCategory: 'Health Precaution',
      saved: false,
      completed: false,
    };
  }
  if (aqi > HIGH_AQI_THRESHOLD) {
    return {
      id: 'rec-outdoor-moderate-high',
      title: 'Time outdoor workouts around midday solar clearing',
      description:
        'Morning temperature inversions trap surface soot; if exercising outdoors, target late morning or early afternoon.',
      whyItMatters:
        'Ground-level temperature inversions break as midday sunlight warms the surface, diluting local pollutants.',
      alternative:
        'Light evening walking on quiet residential routes rather than near arterial avenues.',
      effort: 'Low',
      priority: isVulnerable ? 'High' : 'Medium',
      relevantProfileFactors: [`Current ambient US AQI: ${aqi}`, commute],
      sourceCategory: 'Atmospheric Guidance',
      saved: false,
      completed: false,
    };
  }
  return {
    id: 'rec-outdoor-good',
    title: 'Favorable ambient conditions for outdoor activities',
    description:
      'Local air quality currently supports normal outdoor routines, walking, and natural park recreation.',
    whyItMatters:
      'Outdoor physical movement provides vital cardiovascular and mental wellness benefits when ambient air is clean.',
    effort: 'Low',
    priority: 'Low',
    relevantProfileFactors: [`Good/Moderate ambient AQI (${aqi})`],
    sourceCategory: 'General Wellness',
    saved: false,
    completed: false,
  };
}

function buildActiveCommuteRec(isHigh: boolean, aqi: number): BackendRecommendation {
  return {
    id: isHigh ? 'rec-commute-active-smog' : 'rec-commute-active-clean',
    title: isHigh
      ? 'Choose tree-lined corridors or certified barrier for active commute'
      : 'Active commuting keeps community emissions low',
    description: isHigh
      ? 'Take secondary streets with dense roadside canopy, and consider an N95 respirator.'
      : 'Your walking or cycling avoids fossil combustion, directly benefiting neighborhood air.',
    whyItMatters: isHigh
      ? 'Active breathing near diesel transit directly exposes airways to freshly combusted soot.'
      : 'Zero-emission commutes reduce localized street-canyon NO₂ and particulate concentrations.',
    alternative: isHigh ? 'Ride shared metro or electric transit on high smog mornings.' : undefined,
    effort: isHigh ? 'Medium' : 'Low',
    priority: isHigh ? 'High' : 'Medium',
    relevantProfileFactors: isHigh
      ? ['Active walking/cycling commute', `Elevated AQI (${aqi})`]
      : ['Walking/cycling commute'],
    sourceCategory: isHigh ? 'Commute Optimization' : 'Community Impact',
    saved: false,
    completed: false,
  };
}

function buildVehicleCommuteRec(isHigh: boolean, aqi: number): BackendRecommendation {
  return {
    id: 'rec-commute-car-recirc',
    title: 'Enable in-cabin air recirculation in congested queues',
    description:
      'Set your car air system to internal recirculation mode when idling near heavy diesel vehicles.',
    whyItMatters:
      'Without recirculation, cabin fan intakes pull tailpipe exhaust directly into the passenger cabin.',
    effort: 'Low',
    priority: isHigh ? 'High' : 'Medium',
    relevantProfileFactors: ['Car/taxi commuter', `Ambient AQI (${aqi})`],
    sourceCategory: 'In-Cabin Protection',
    saved: false,
    completed: false,
  };
}

function buildGeneralTransitCommuteRec(isHigh: boolean, commute: string): BackendRecommendation {
  return {
    id: 'rec-commute-general',
    title: isHigh
      ? 'Wear mask during open platform transit transfers'
      : 'Shared transit reduces per-passenger emissions',
    description: isHigh
      ? 'Bus bays and crowded interchange platforms concentrate diesel soot.'
      : 'Shared transit carries a much lower per-passenger environmental footprint.',
    whyItMatters:
      'Transit hub choke points experience elevated localized soot before passengers board filtered carriages.',
    effort: 'Low',
    priority: isHigh ? 'High' : 'Medium',
    relevantProfileFactors: [commute],
    sourceCategory: 'Transit Guidance',
    saved: false,
    completed: false,
  };
}

export function buildCommuteRec(commute: string, aqi: number): BackendRecommendation {
  const isHigh = aqi > HIGH_AQI_THRESHOLD;
  const c = commute.toLowerCase();
  if (c.includes('walk') || c.includes('cycl') || c.includes('bicycle')) {
    return buildActiveCommuteRec(isHigh, aqi);
  }
  if (c.includes('car') || c.includes('taxi')) {
    return buildVehicleCommuteRec(isHigh, aqi);
  }
  return buildGeneralTransitCommuteRec(isHigh, commute);
}
