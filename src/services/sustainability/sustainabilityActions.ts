import type { UserProfile } from '../../types/index.ts';
import type { SustainableAction } from './sustainabilityTypes.ts';
import { EMISSION_FACTORS } from './sustainabilityCalculations.ts';

export function generateSustainableActions(
  profile: UserProfile | null,
  completedMap: Record<string, boolean>
): SustainableAction[] {
  const isWfh = profile?.commuteMode === 'Work from home';
  const isTransit = profile?.commuteMode === 'Bus' || profile?.commuteMode === 'Metro or train';
  const isWalking = profile?.commuteMode === 'Walking' || profile?.commuteMode === 'Bicycle';

  const travelTitle = isWfh
    ? 'Walk or Bike for Neighborhood Errands'
    : isTransit
      ? 'Complete Today’s Commute via Transit or Walking'
      : isWalking
        ? 'Active Walk or Bike for Today’s Mobility'
        : 'Take Public Transit or Walk a Trip';

  const travelDesc = isWfh
    ? 'Replaced a motor-delivery or car errand with active walking.'
    : 'Avoided solo motor vehicle tailpipe emissions on a routine journey.';

  const baseActions: Omit<SustainableAction, 'completed'>[] = [
    {
      id: 'action-transit',
      category: 'transport',
      title: travelTitle,
      description: travelDesc,
      co2SavingsKg: EMISSION_FACTORS.TRANSIT_TRIP_SAVINGS_KG,
      calculationBasis:
        'Based on shifting ~10 km roundtrip from personal car (~150g/km) to transit (~30g/km).',
      frequency: 'daily',
    },
    {
      id: 'action-standby',
      category: 'energy',
      title: 'Power Down Idle Strips & Phantom Loads',
      description: 'Switched off TV, game consoles, and chargers from the wall when not active.',
      co2SavingsKg: EMISSION_FACTORS.STANDBY_POWER_SAVINGS_KG,
      calculationBasis:
        'Avoids ~0.4 kWh daily standby draw at average Indian grid factor ~0.82 kg CO₂/kWh.',
      frequency: 'daily',
    },
    {
      id: 'action-plastic',
      category: 'waste',
      title: 'Zero Single-Use Plastic on Daily Outings',
      description: 'Carried a refillable water bottle and reusable cloth bag for shopping.',
      co2SavingsKg: EMISSION_FACTORS.PLASTIC_AVOIDANCE_SAVINGS_KG,
      calculationBasis:
        'Avoids production & disposal footprint of 2 disposable PET bottles/takeaway items.',
      frequency: 'daily',
    },
    {
      id: 'action-thermostat',
      category: 'energy',
      title: 'Moderate Cooling Thermostat (24°C)',
      description: 'Kept air conditioning at 24°C with fan assist instead of maximum chill.',
      co2SavingsKg: EMISSION_FACTORS.THERMOSTAT_SAVINGS_KG,
      calculationBasis: 'Saves ~1.5 kWh/day of compressor cooling load vs 19°C operation.',
      frequency: 'daily',
    },
    {
      id: 'action-cooking',
      category: 'household',
      title: 'Efficient Lid & Pressure Cooking',
      description: 'Used covered pots and pressure cookers to shorten cooking fuel burn time.',
      co2SavingsKg: EMISSION_FACTORS.EFFICIENT_COOKING_SAVINGS_KG,
      calculationBasis: 'Conserves approx 150g of cooking gas per day through heat retention.',
      frequency: 'daily',
    },
    {
      id: 'action-foodwaste',
      category: 'waste',
      title: 'Plan Portions & Zero Edible Food Waste',
      description: 'Planned meals to prevent perishable food spoil and diversion to landfills.',
      co2SavingsKg: EMISSION_FACTORS.FOOD_WASTE_SAVINGS_KG,
      calculationBasis:
        'Prevents anaerobic landfill decomposition of ~200g organic food scraps (~2.5 kg CO₂e/kg).',
      frequency: 'daily',
    },
  ];

  return baseActions.map((action) => ({
    ...action,
    completed: Boolean(completedMap[action.id]),
  }));
}
