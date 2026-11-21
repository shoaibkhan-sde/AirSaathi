import type { CommuteMode } from '../../types/index.ts';
import type { EcoAlternative } from './sustainabilityTypes.ts';

export function getMobilityAlternatives(commute?: CommuteMode): EcoAlternative[] {
  if (commute === 'Car') {
    return [
      {
        id: 'alt-transit-shift',
        category: 'transport',
        title: 'Shift Short Trips to Public Transit',
        description: 'Taking the bus or metro for solo trips avoids direct tailpipe emissions.',
        icon: 'bus',
        estimatedBenefit: '~1.2 kg CO₂ / trip',
        impactLevel: 'High',
        costLevel: 'Low Cost',
        difficulty: 'Easy',
        tag: 'Transportation',
      },
      {
        id: 'alt-active-walk',
        category: 'transport',
        title: 'Walk or Bike for Errands Under 2 km',
        description: 'Replace brief car start-stops with active walking to cut fuel spikes.',
        icon: 'bike',
        estimatedBenefit: '~0.4 kg CO₂ / errand',
        impactLevel: 'Medium',
        costLevel: 'Free',
        difficulty: 'Easy',
        tag: 'Active Mobility',
      },
    ];
  }

  if (commute === 'Motorcycle or scooter') {
    return [
      {
        id: 'alt-transit-metro',
        category: 'transport',
        title: 'Explore Urban Rail & Electric Transit',
        description: 'Switching two-wheeler commutes to rail lowers road smog exposure.',
        icon: 'bus',
        estimatedBenefit: '~0.7 kg CO₂ / trip',
        impactLevel: 'Medium',
        costLevel: 'Low Cost',
        difficulty: 'Easy',
        tag: 'Clean Transit',
      },
    ];
  }

  if (commute === 'Work from home') {
    return [
      {
        id: 'alt-wfh-walk',
        category: 'transport',
        title: 'Active Walking Neighborhood Errands',
        description: 'Complete local pharmacy & grocery runs on foot instead of delivery apps.',
        icon: 'footprints',
        estimatedBenefit: '~0.5 kg CO₂ / trip',
        impactLevel: 'Medium',
        costLevel: 'Free',
        difficulty: 'Easy',
        tag: 'Local Living',
      },
    ];
  }

  if (commute === 'Bus' || commute === 'Metro or train') {
    return [
      {
        id: 'alt-transit-connect',
        category: 'transport',
        title: 'First & Last Mile Walking Links',
        description: 'Maintain transit habits and link stations on foot instead of autos.',
        icon: 'footprints',
        estimatedBenefit: 'Zero-Emission Habit',
        impactLevel: 'Medium',
        costLevel: 'Free',
        difficulty: 'Easy',
        tag: 'Sustainable Transit',
      },
    ];
  }

  if (commute === 'Walking' || commute === 'Bicycle') {
    return [
      {
        id: 'alt-active-maintain',
        category: 'transport',
        title: 'Low-Exposure Green Corridors',
        description: 'Select tree-shaded residential side streets away from vehicle smog.',
        icon: 'leaf',
        estimatedBenefit: 'Zero Tailpipe Impact',
        impactLevel: 'High',
        costLevel: 'Free',
        difficulty: 'Easy',
        tag: 'Active Living',
      },
    ];
  }

  return [
    {
      id: 'alt-transit-general',
      category: 'transport',
      title: 'Public Transit for Urban Travel',
      description: 'Utilize metro and urban bus routes to avoid solo vehicle congestion.',
      icon: 'bus',
      estimatedBenefit: '~1.0 kg CO₂ / trip',
      impactLevel: 'High',
      costLevel: 'Low Cost',
      difficulty: 'Easy',
      tag: 'Clean Mobility',
    },
  ];
}
