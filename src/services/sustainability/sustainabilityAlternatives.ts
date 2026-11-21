import type { UserProfile } from '../../types/index.ts';
import type { EcoAlternative } from './sustainabilityTypes.ts';
import { getMobilityAlternatives } from './sustainabilityMobility.ts';

export * from './sustainabilityMobility.ts';

export function generatePersonalizedAlternatives(profile: UserProfile | null): EcoAlternative[] {
  const alternatives: EcoAlternative[] = [...getMobilityAlternatives(profile?.commuteMode)];
  const fuel = profile?.cookingFuel;
  const home = profile?.homeType;

  // 1. Kitchen and cooking fuel alternatives
  if (fuel === 'LPG or piped gas') {
    alternatives.push({
      id: 'alt-cook-lpg',
      category: 'household',
      title: 'Fitted Lids & Pressure Cooking',
      description:
        'Using fitted pot lids and pressure cookers traps steam, reducing burner run-time by 25%.',
      icon: 'utensils',
      estimatedBenefit: '~0.4 kg CO₂ / cooking day',
      impactLevel: 'Medium',
      costLevel: 'Free',
      difficulty: 'Easy',
      tag: 'Kitchen Efficiency',
    });
  } else if (fuel === 'Electricity / induction') {
    alternatives.push({
      id: 'alt-cook-induction',
      category: 'household',
      title: 'Induction Batch Cooking',
      description:
        'Cook sequential dishes while cooktops are pre-warmed to maximize electrical heat transfer.',
      icon: 'zap',
      estimatedBenefit: 'High Energy Efficiency',
      impactLevel: 'Medium',
      costLevel: 'Free',
      difficulty: 'Easy',
      tag: 'Kitchen Efficiency',
    });
  } else if (fuel === 'Biomass / wood') {
    alternatives.push({
      id: 'alt-cook-clean',
      category: 'household',
      title: 'Transition to Clean Induction or LPG',
      description:
        'Modern electric induction cookers eliminate indoor combustion particles and reduce carbon.',
      icon: 'zap',
      estimatedBenefit: 'High Health & Carbon Benefit',
      impactLevel: 'High',
      costLevel: 'Investment',
      difficulty: 'Moderate',
      tag: 'Clean Cooking',
    });
  }

  // 2. Electrical energy efficiency
  alternatives.push({
    id: 'alt-energy-phantom',
    category: 'energy',
    title: 'Switch Off Phantom Power Strips',
    description:
      'Turn off entertainment consoles, Wi-Fi docks, and laptop chargers when not in use.',
    icon: 'zap',
    estimatedBenefit: '~0.3 kg CO₂ / day',
    impactLevel: 'Medium',
    costLevel: 'Free',
    difficulty: 'Easy',
    tag: 'Energy Saving',
  });

  alternatives.push({
    id: 'alt-energy-thermostat',
    category: 'energy',
    title: 'Comfortable Thermostat Setting (24°C)',
    description:
      'Setting room AC to 24°C with a ceiling fan conserves up to 24% electricity over 18°C.',
    icon: 'home',
    estimatedBenefit: '~0.6 kg CO₂ / day',
    impactLevel: 'High',
    costLevel: 'Free',
    difficulty: 'Easy',
    tag: 'Cooling Efficiency',
  });

  if (home === 'Independent house') {
    alternatives.push({
      id: 'alt-home-solar',
      category: 'energy',
      title: 'Rooftop Solar & Water Heating',
      description:
        'Harness decentralized solar energy on your roof to offset grid generation coal emissions.',
      icon: 'home',
      estimatedBenefit: 'Up to 3,000 kg CO₂ / year',
      impactLevel: 'High',
      costLevel: 'Investment',
      difficulty: 'Advanced',
      tag: 'Renewable Power',
    });
  }

  // 3. Waste reduction
  alternatives.push({
    id: 'alt-waste-plastic',
    category: 'waste',
    title: 'Reusable Daily Containers & Bags',
    description:
      'Carrying a cotton bag and stainless steel bottle keeps single-use plastic out of waste streams.',
    icon: 'leaf',
    estimatedBenefit: '~0.1 kg CO₂ / day',
    impactLevel: 'Low',
    costLevel: 'Low Cost',
    difficulty: 'Easy',
    tag: 'Waste Reduction',
  });

  return alternatives;
}
