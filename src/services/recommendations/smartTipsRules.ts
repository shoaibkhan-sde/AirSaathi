import type { UserProfile, CityLocation } from '../../types/index.ts';
import type { SmartTipRecommendation } from './smartTipsTypes.ts';
import {
  AQI_GOOD_MAX,
  AQI_MODERATE_MAX,
  AQI_USG_MAX,
  extractVulnerabilities,
} from './smartTipsVulnerabilities.ts';

export {
  AQI_GOOD_MAX,
  AQI_MODERATE_MAX,
  AQI_USG_MAX,
  AQI_UNHEALTHY_MAX,
  extractVulnerabilities,
} from './smartTipsVulnerabilities.ts';

function tip(
  item: Omit<SmartTipRecommendation, 'effort' | 'completed' | 'saved'>
): SmartTipRecommendation {
  return { ...item, effort: 'Low', completed: false, saved: false };
}

export function buildMorningRule(
  profile: UserProfile | null,
  city: CityLocation
): SmartTipRecommendation {
  const vuln = extractVulnerabilities(profile);
  const aqi = city.aqi;

  if (aqi > AQI_USG_MAX) {
    return tip({
      id: 'tip-morning-severe-indoor',
      title: 'Move morning exercise and children’s play indoors',
      description: `Ambient US AQI is ${aqi} (${city.category}). Morning temperature inversions trap pollutants near ground level.`,
      timeOfDay: 'morning',
      timeSlot: '06:30 – 08:30 AM',
      priority: 'High',
      reason:
        'Heavy cardio increases respiration rate 5-fold, pulling soot deep into pulmonary alveoli.',
      relevantFactors: [`US AQI ${aqi}`, ...vuln.factors],
      learnMoreDetails: {
        mechanism: 'Mouth breathing during cardio bypasses upper respiratory mucosal filtration.',
        action: 'Shift running or sports to an indoor mat routine, stretching, or yoga.',
        scientificContext:
          'WHO/EPA guidelines advise avoiding prolonged outdoor exertion above AQI 150.',
      },
    });
  }

  if (aqi > AQI_MODERATE_MAX && vuln.isVulnerable) {
    return tip({
      id: 'tip-morning-usg-caution',
      title: 'Schedule outdoor morning exertion cautiously',
      description: `Air is Unhealthy for Sensitive Groups (AQI ${aqi}). Sensitive members should reduce prolonged outdoor workouts.`,
      timeOfDay: 'morning',
      timeSlot: '07:00 – 08:30 AM',
      priority: 'High',
      reason:
        'Sensitive airways react with prompt inflammation when exercising in morning traffic plumes.',
      relevantFactors: [`US AQI ${aqi}`, ...vuln.factors],
      learnMoreDetails: {
        mechanism:
          'Fine particulate matter triggers bronchial hyper-reactivity in sensitive individuals.',
        action: 'Choose light walking in green corridors over intensive roadway cardio.',
        scientificContext:
          'EPA recommends reduced outdoor exertion for sensitive groups between AQI 101–150.',
      },
    });
  }

  if (aqi > AQI_GOOD_MAX) {
    return tip({
      id: 'tip-morning-mod-routine',
      title: 'Moderate outdoor morning activities',
      description: `US AQI is ${aqi} (Moderate). Suitable for general public; sensitive individuals should assess personal comfort.`,
      timeOfDay: 'morning',
      timeSlot: '07:00 – 08:30 AM',
      priority: 'Medium',
      reason:
        'Particulate levels are acceptable for general activities with minimal respiratory risk.',
      relevantFactors: [`US AQI ${aqi}`],
      learnMoreDetails: {
        mechanism:
          'Pollutant concentrations remain below acute irritation thresholds for the general population.',
        action: 'Maintain normal morning walking or cycling while listening to your body.',
        scientificContext:
          'EPA classifies Moderate air as acceptable for general physical activities.',
      },
    });
  }

  return tip({
    id: 'tip-morning-good-fresh',
    title: 'Favorable morning air for outdoor exercise and walking',
    description: `US AQI is ${aqi} (Good). Clean atmospheric conditions support outdoor runs, cycling, and natural house ventilation.`,
    timeOfDay: 'morning',
    timeSlot: '06:30 – 08:30 AM',
    priority: 'Low',
    reason:
      'Particulate concentrations are within clean standards, maximizing cardiovascular benefits.',
    relevantFactors: [`Clean ambient air (${aqi})`],
    learnMoreDetails: {
      mechanism: 'Clean air delivers uncompromised oxygen without provoking airway inflammation.',
      action: 'Take full advantage of morning outdoor runs, park walks, and opening windows.',
      scientificContext: 'AQI 0–50 represents clean air with little to no public health risk.',
    },
  });
}

export function buildAfternoonRule(
  profile: UserProfile | null,
  city: CityLocation
): SmartTipRecommendation {
  const isHigh = city.aqi > AQI_MODERATE_MAX;
  return tip({
    id: isHigh ? 'tip-afternoon-sealed-vent' : 'tip-afternoon-solar-vent',
    title: isHigh
      ? 'Maintain closed window boundaries through afternoon'
      : 'Utilize afternoon solar mixing for natural cross-ventilation',
    description: isHigh
      ? `Outdoor AQI remains elevated at ${city.aqi}. Keep street windows sealed and use indoor filtration.`
      : 'Solar heating lifts the ground mixing layer. Open high windows briefly to flush carbon dioxide.',
    timeOfDay: 'afternoon',
    timeSlot: '01:30 – 03:00 PM',
    priority: 'Medium',
    reason: isHigh
      ? 'Open windows during high ambient pollution allow soot to penetrate interior furnishings.'
      : 'Afternoon thermal updrafts dilute surface pollutants compared to morning or dusk hours.',
    relevantFactors: [
      isHigh ? `Elevated AQI ${city.aqi}` : 'Favorable daytime mixing',
      profile?.homeType || 'Home',
    ],
    learnMoreDetails: {
      mechanism: isHigh
        ? 'Unfiltered infiltration can bring indoor particulate concentrations up to 70% of outdoor air.'
        : 'Solar ground warming breaks temperature inversions, dispersing surface particulate plumes.',
      action: isHigh
        ? 'Rely on interior fans or AC on recirculation rather than open outdoor windows.'
        : 'Open opposing windows for 15–20 minutes to exchange stale indoor air.',
      scientificContext: isHigh
        ? 'Source control and boundary sealing are primary indoor air defense principles.'
        : 'Diurnal boundary layer dynamics create an afternoon window for brief natural air exchange.',
    },
  });
}

export function buildEveningRule(
  profile: UserProfile | null,
  city: CityLocation
): SmartTipRecommendation {
  const hasPurifier = Boolean(profile?.hasAirPurifier);
  return tip({
    id: 'tip-evening-sanctuary',
    title: hasPurifier
      ? 'Activate bedroom HEPA purifier 45 minutes before sleep'
      : 'Seal bedroom windows against evening traffic cooling plume',
    description: hasPurifier
      ? 'Run purifier on medium mode in closed bedrooms to establish clean air for deep REM recovery.'
      : 'Dusk cooling traps vehicle emissions. Keep sleeping spaces sealed with draft stoppers.',
    timeOfDay: 'evening',
    timeSlot: '07:30 – 09:30 PM',
    priority: city.aqi > AQI_MODERATE_MAX ? 'High' : 'Medium',
    reason: 'Evening temperature drops suppress dispersion, concentrating ground emissions.',
    relevantFactors: [
      hasPurifier ? 'Air purifier available' : 'Natural barrier sealing',
      `Evening AQI ${city.aqi}`,
    ],
    learnMoreDetails: {
      mechanism:
        'Clean air during 7–8 hours of sleep significantly lowers 24-hour cumulative particulate dosage.',
      action: hasPurifier
        ? 'Close bedroom door and run purifier on quiet auto mode.'
        : 'Ensure window frames and door sweeps form a snug seal against outdoor dust.',
      scientificContext:
        'Studies show bedroom air sanctuaries cut overnight PM2.5 inhalation by up to 75%.',
    },
  });
}
