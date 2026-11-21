import type { BackendRecommendation } from './types.ts';
import { HIGH_AQI_THRESHOLD } from './outdoorRecommendationBuilders.ts';

export function buildIndoorRec(
  cooking: string,
  hasPurifier: boolean,
  aqi: number,
  homeType: string
): BackendRecommendation {
  const isSolid = /wood|biomass|coal|kerosene/i.test(cooking);
  if (isSolid) {
    return {
      id: 'rec-indoor-solid-fuel',
      title: 'Ensure continuous kitchen ventilation during solid-fuel cooking',
      description:
        'Solid biomass produces intense unburned soot and carbon monoxide. Maintain dedicated outdoor airflow.',
      whyItMatters:
        'Trapped indoor biomass combustion smoke poses higher immediate respiratory danger than ambient air.',
      effort: 'Medium',
      priority: 'High',
      relevantProfileFactors: ['Biomass/solid cooking fuel', homeType],
      sourceCategory: 'Indoor Hazard Control',
      saved: false,
      completed: false,
    };
  }
  if (/lpg|gas/i.test(cooking)) {
    return {
      id: 'rec-indoor-gas-vent',
      title: 'Turn on kitchen exhaust whenever cooking with gas',
      description:
        'Gas burners produce nitrogen dioxide (NO₂). Run the range hood or crack a kitchen window outward.',
      whyItMatters:
        'Unvented gas combustion can raise indoor NO₂ above WHO health guidelines within 20 minutes.',
      effort: 'Low',
      priority: 'Medium',
      relevantProfileFactors: ['LPG / piped gas cooking'],
      sourceCategory: 'Kitchen Air Practice',
      saved: false,
      completed: false,
    };
  }
  return {
    id: hasPurifier ? 'rec-indoor-purifier-opt' : 'rec-indoor-no-purifier',
    title: hasPurifier
      ? 'Run HEPA air purifier in primary bedroom on quiet mode'
      : 'Adopt practical dust-dampening methods without an air purifier',
    description: hasPurifier
      ? 'Keep your purifier running continuously in closed bedrooms overnight.'
      : 'Use damp microfiber cloths to wipe surfaces; place weather-stripping along drafty door thresholds.',
    whyItMatters: hasPurifier
      ? 'Overnight clean air exposure lowers airway inflammation accumulated during the day.'
      : 'Dry sweeping resuspends settled coarse dust into the breathing zone.',
    effort: 'Low',
    priority: aqi > HIGH_AQI_THRESHOLD ? 'High' : 'Medium',
    relevantProfileFactors: hasPurifier
      ? ['Air purifier available', `Ambient AQI (${aqi})`]
      : ['No air purifier installed', homeType],
    sourceCategory: hasPurifier ? 'Filtration Optimization' : 'Low-Cost Home Care',
    saved: false,
    completed: false,
  };
}

export function buildHeatingRec(heating: string): BackendRecommendation | null {
  if (!/wood|biomass|coal|solid/i.test(heating)) return null;
  return {
    id: 'rec-heating-solid',
    title: 'Avoid unvented open fires inside sleeping spaces',
    description:
      'Open coal or wood heaters in poorly ventilated bedrooms create hazardous carbon monoxide spikes.',
    whyItMatters:
      'Carbon monoxide binds to hemoglobin and causes invisible, potentially fatal oxygen deprivation.',
    effort: 'Medium',
    priority: 'High',
    relevantProfileFactors: ['Solid heating fuel'],
    sourceCategory: 'Heating Safety',
    saved: false,
    completed: false,
  };
}
