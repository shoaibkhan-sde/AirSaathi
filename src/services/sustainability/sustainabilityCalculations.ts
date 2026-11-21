import type { SustainableAction, ContributingAction } from './sustainabilityTypes.ts';

/**
 * Transparent emission factors and reference baselines:
 * - Gasoline passenger vehicle: ~150g CO2/km (urban cycle). Shifting 10km roundtrip = ~1.5 kg CO2 avoided.
 * - Public urban transit: ~30g CO2/passenger-km. Avoided over car = ~1.2 kg CO2/trip.
 * - Standby power / phantom loads: 50W continuous load = ~0.4 kWh/day. At grid factor ~0.82 kg CO2/kWh = ~0.3 kg CO2/day.
 * - AC moderate thermostat (24C vs 20C): ~1.5 kWh/day saved = ~0.6 kg CO2/day.
 * - Covered & pressure cooking: ~20% LPG conserved = ~0.4 kg CO2/day.
 * - Food waste prevention: 200g avoided landfill methane = ~0.5 kg CO2e.
 * - Single-use plastic avoidance: reusable bag/bottle = ~0.1 kg CO2/day.
 */
export const EMISSION_FACTORS = {
  TRANSIT_TRIP_SAVINGS_KG: 1.2,
  STANDBY_POWER_SAVINGS_KG: 0.3,
  PLASTIC_AVOIDANCE_SAVINGS_KG: 0.1,
  THERMOSTAT_SAVINGS_KG: 0.6,
  EFFICIENT_COOKING_SAVINGS_KG: 0.4,
  FOOD_WASTE_SAVINGS_KG: 0.5,
} as const;

export function calculateCompletedImpact(
  actions: SustainableAction[],
  completedMap: Record<string, boolean>
): {
  totalCo2SavedKg: number;
  completedCount: number;
  contributing: ContributingAction[];
} {
  let total = 0;
  let count = 0;
  const contributing: ContributingAction[] = [];

  for (const action of actions) {
    if (completedMap[action.id]) {
      count += 1;
      total += action.co2SavingsKg;
      contributing.push({
        id: action.id,
        title: action.title,
        co2SavedKg: action.co2SavingsKg,
      });
    }
  }

  // Round to 1 decimal place to prevent floating-point drift
  const roundedTotal = Math.round(total * 10) / 10;

  return {
    totalCo2SavedKg: roundedTotal,
    completedCount: count,
    contributing,
  };
}
