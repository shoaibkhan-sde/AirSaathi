import type { UserProfile, CityLocation, RecommendationItem } from '../../types';

const HIGH_AQI_THRESHOLD = 150;
const SEVERE_AQI_THRESHOLD = 250;
const MAX_RECOMMENDATIONS = 3;

function getActiveCommuteRec(isHighAQI: boolean): RecommendationItem {
  return {
    id: isHighAQI ? 'rec-travel-active-high' : 'rec-travel-active-mod',
    title: isHighAQI ? 'Calibrate active commute route' : 'Enjoy active commute with low-traffic routing',
    description: isHighAQI
      ? 'Shift morning travel by 35 minutes to bypass inversion, and choose tree-lined secondary streets.'
      : 'Conditions are acceptable for walking and cycling. Opt for park corridors rather than highway lanes.',
    category: 'travel',
    iconType: 'bike',
    whyItMatters: isHighAQI
      ? 'Deep breathing during morning exercise doubles particulate lung deposition.'
      : 'Buffer vegetation naturally filters coarse road dust and vehicular plumes.',
    alternative: isHighAQI ? 'Take rapid metro/bus on high smog mornings or wear an N95 respirator.' : undefined,
    effort: isHighAQI ? 'Medium' : 'Low',
    exposureReduction: isHighAQI ? 'Avoids peak morning vehicle emission plumes' : 'Reduces direct roadside exhaust exposure',
    saved: false,
    completed: false,
  };
}

function getVehicleCommuteRec(): RecommendationItem {
  return {
    id: 'rec-travel-car',
    title: 'Run cabin air recirculation in heavy traffic',
    description: 'Activate internal recirculation mode when commuting on congested avenues.',
    category: 'travel',
    iconType: 'mask',
    whyItMatters: 'Direct vehicle exhaust entering cabin air increases nitrogen dioxide and particulate load.',
    effort: 'Low',
    exposureReduction: 'Cuts in-cabin particulate infiltration by up to 70%',
    saved: false,
    completed: false,
  };
}

function getTransitCommuteRec(): RecommendationItem {
  return {
    id: 'rec-travel-transit',
    title: 'Keep N95 respirator ready for transit stops',
    description: 'Roadside bus shelters and open platforms experience high localized diesel exhaust.',
    category: 'travel',
    iconType: 'mask',
    whyItMatters: 'Short stops near idling diesel transit deliver disproportionately high fine soot.',
    effort: 'Low',
    exposureReduction: 'Shields against direct tailpipe exhaust bursts',
    saved: false,
    completed: false,
  };
}

function getCommuteRec(commuteMode: string, isHighAQI: boolean): RecommendationItem {
  if (commuteMode === 'Bicycle' || commuteMode === 'Walking') {
    return getActiveCommuteRec(isHighAQI);
  }
  if (commuteMode === 'Car') {
    return getVehicleCommuteRec();
  }
  return getTransitCommuteRec();
}

function getBiomassIndoorRec(): RecommendationItem {
  return {
    id: 'rec-cooking-biomass',
    title: 'Ensure dedicated kitchen draft during cooking',
    description: 'Keep kitchen exhaust or high windows active during solid-fuel cooking.',
    category: 'indoor',
    iconType: 'stove',
    whyItMatters: 'Unvented biomass smoke contains intense concentrations of fine soot and carbon monoxide.',
    effort: 'Medium',
    exposureReduction: 'Diverts primary combustion products outdoors',
    saved: false,
    completed: false,
  };
}

function getPurifierIndoorRec(): RecommendationItem {
  return {
    id: 'rec-indoor-purifier',
    title: 'Run HEPA purifier in active living spaces',
    description: 'Operate your purifier continuously on medium mode in occupied family areas.',
    category: 'indoor',
    iconType: 'purifier',
    whyItMatters: 'Mechanical filtration continuously captures microscopic particles that settle on furniture.',
    effort: 'Low',
    exposureReduction: 'Clears up to 90% of recirculating indoor particulates',
    saved: true,
    completed: false,
  };
}

function getVentilationIndoorRec(city: string): RecommendationItem {
  return {
    id: 'rec-indoor-vent',
    title: 'Time natural ventilation with afternoon sun',
    description: `Current AQI in ${city} peaks in morning. Open windows briefly in mid-afternoon.`,
    category: 'indoor',
    iconType: 'window',
    whyItMatters: 'Midday solar warming disperses ground-level inversion smog naturally.',
    effort: 'Low',
    exposureReduction: 'Avoids morning particulate ingress by up to 60%',
    saved: false,
    completed: false,
  };
}

function getIndoorRec(profile: UserProfile, _aqi: number): RecommendationItem {
  if (profile.cookingFuel === 'Biomass / wood') {
    return getBiomassIndoorRec();
  }
  if (profile.hasAirPurifier) {
    return getPurifierIndoorRec();
  }
  return getVentilationIndoorRec(profile.city);
}

function getChildrenHouseholdRec(cityName: string): RecommendationItem {
  return {
    id: 'rec-household-children',
    title: 'Prioritize indoor playtime during morning inversion',
    description: `Calibrated for children in ${cityName}: Move heavy cardio and playground activities indoors.`,
    category: 'routine',
    iconType: 'workout',
    whyItMatters: 'Children breathe more air per kilogram of body weight, increasing particulate vulnerability.',
    effort: 'Low',
    exposureReduction: 'Shields growing lungs from peak pollution',
    saved: false,
    completed: false,
  };
}

function getSeniorsHouseholdRec(cityName: string): RecommendationItem {
  return {
    id: 'rec-household-seniors',
    title: 'Schedule gentle walking after morning smog clears',
    description: `Tailored for seniors in ${cityName}: Shift outdoor exercise to late afternoon (04:30 PM).`,
    category: 'routine',
    iconType: 'workout',
    whyItMatters: 'Cold morning air inversion fine particulates constrict coronary and bronchial vessels.',
    effort: 'Low',
    exposureReduction: 'Minimizes cardiovascular exposure during morning spikes',
    saved: false,
    completed: false,
  };
}

function getAdultsHouseholdRec(isSevere: boolean): RecommendationItem {
  return {
    id: 'rec-routine-adults-workout',
    title: isSevere ? 'Choose indoor workout facility today' : 'Optimize workout window for cleaner air',
    description: isSevere
      ? 'High ambient AQI traps particulates near ground level. Opt for a ventilated indoor gym.'
      : 'Solar radiation disperses ground particulates. Best outdoor exercise window is 03:00–05:00 PM.',
    category: 'routine',
    iconType: 'workout',
    whyItMatters: 'Strenuous cardio bypasses nasal filtration, pulling soot into deep airway branches.',
    effort: 'Low',
    exposureReduction: 'Protects deep lung tissues during high pollution',
    saved: false,
    completed: false,
  };
}

function getHouseholdRec(profile: UserProfile, city: CityLocation): RecommendationItem {
  const isHigh = city.aqi > HIGH_AQI_THRESHOLD;
  const isSevere = city.aqi > SEVERE_AQI_THRESHOLD;
  if (profile.householdMembers.includes('children') && isHigh) {
    return getChildrenHouseholdRec(city.name);
  }
  if (profile.householdMembers.includes('seniors')) {
    return getSeniorsHouseholdRec(city.name);
  }
  return getAdultsHouseholdRec(isSevere);
}

export function generatePersonalizedRecommendations(
  profile: UserProfile,
  city: CityLocation
): RecommendationItem[] {
  const isHighAQI = city.aqi > HIGH_AQI_THRESHOLD;
  return [
    getCommuteRec(profile.commuteMode, isHighAQI),
    getIndoorRec(profile, city.aqi),
    getHouseholdRec(profile, city),
  ].slice(0, MAX_RECOMMENDATIONS);
}
