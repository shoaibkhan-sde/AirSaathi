import type { RoutineActivity } from '../types';

export const MOCK_ROUTINES: RoutineActivity[] = [
  {
    id: 'rt-1',
    timeOfDay: 'morning',
    timeSlot: '06:30 – 08:30 AM',
    title: 'Indoor Yoga & Core Routine',
    recommendation: 'Replace outdoor jogging with living room yoga or indoor treadmill.',
    reason: 'Winter thermal inversion traps peak PM2.5 nearest ground level during sunrise hours.',
    suggestedAlternative:
      'Stretch, brisk indoor circuit training, or yoga near an active purifier.',
    effort: 'Low',
    completed: true,
    saved: true,
    impact: {
      originalActivity: '45-minute outdoor morning run along main arterial road',
      suggestedAlternative: '45-minute indoor yoga / dumbbell circuit in living room',
      personalExposureReduction: '75–85% reduction in inhaled PM2.5',
      estimatedEmissionReductionKg: 0,
      cityWideNotice:
        'Changing personal exercise avoids high physiological pollution intake; it does not change city emissions.',
      assumptions: [
        'Assumes outdoor PM2.5 = 162 µg/m³; indoor sealed PM2.5 = 28 µg/m³ with active purifier; 3x increased respiration rate during running.',
      ],
      limitations:
        'Calculations model typical adult lung tidal volume. Individual respiratory sensitivities may vary.',
    },
  },
  {
    id: 'rt-2',
    timeOfDay: 'morning',
    timeSlot: '08:45 – 09:30 AM',
    title: 'Metro / Rapid Transit Commute',
    recommendation: 'Board the underground transit line instead of driving solo in traffic.',
    reason: 'Congested road corridors suffer 4x higher carbon monoxide and black carbon peaks.',
    suggestedAlternative: 'Take Line 1 subway or carpool with a co-worker.',
    effort: 'Medium',
    completed: false,
    saved: true,
    impact: {
      originalActivity: 'Solo gasoline car commute (14 km roundtrip)',
      suggestedAlternative: 'Metro rail transit + 800m brisk walk with N95 mask',
      personalExposureReduction: '40% lower exposure to direct vehicle exhaust tailpipes',
      estimatedEmissionReductionKg: 2.1,
      cityWideNotice:
        'Saves approx 2.1 kg CO₂ emissions. Collective transit adoption reduces overall urban traffic idling.',
      assumptions: [
        'Gasoline vehicle avg 150g CO₂/km vs electrified rail avg ~20g CO₂/passenger-km.',
      ],
      limitations: 'Estimates vary based on vehicle efficiency, fuel type, and power grid mix.',
    },
  },
  {
    id: 'rt-3',
    timeOfDay: 'afternoon',
    timeSlot: '12:30 – 02:00 PM',
    title: 'Kitchen Exhaust & Balanced Ventilation',
    recommendation:
      'Run kitchen range hood on high while cooking; crack opposite window for 10 min.',
    reason:
      'High-heat frying produces intense indoor PM2.5 spikes exceeding 250 µg/m³ without strong exhaust.',
    suggestedAlternative:
      'Cook with lids on; switch on extractor fan 2 minutes before igniting burners.',
    effort: 'Low',
    completed: false,
    saved: false,
    impact: {
      originalActivity: 'Open-pan frying without mechanical range hood exhaust',
      suggestedAlternative:
        'Lidded preparation with range hood exhaust on high + cross-ventilation',
      personalExposureReduction: '65–70% reduction in indoor cooking particulate buildup',
      estimatedEmissionReductionKg: 0.1,
      cityWideNotice:
        'Indoor cooking protection primarily safeguards household respiratory health.',
      assumptions: ['Gas flame & cooking aerosol baseline vs forced exhaust evacuation rate.'],
      limitations:
        'Exhaust performance depends heavily on duct hygiene and room air exchange rate.',
    },
  },
  {
    id: 'rt-4',
    timeOfDay: 'evening',
    timeSlot: '06:00 – 08:30 PM',
    title: 'Protected Evening Errands',
    recommendation:
      'Wear a well-fitted particulate respirator (N95 / FFP2) for outdoor pedestrian trips.',
    reason: 'Evening rush hour combines cooling temperatures with heavy diesel freight transit.',
    suggestedAlternative: 'Bundle errands together or use neighborhood local grocery drop.',
    effort: 'Low',
    completed: false,
    saved: false,
    impact: {
      originalActivity: 'Unprotected 40-minute walk through evening traffic market',
      suggestedAlternative: 'Consolidated 15-minute trip with certified N95 respirator mask',
      personalExposureReduction: 'Up to 90% filtration of inhaled particulates with tight seal',
      estimatedEmissionReductionKg: 0,
      cityWideNotice: 'Personal protective equipment provides individual protection only.',
      assumptions: ['Properly fitted N95 filter media with minimal perimeter leakage.'],
      limitations:
        'Does not filter gaseous pollutants (such as ozone or nitrogen dioxide) without activated carbon layer.',
    },
  },
];
