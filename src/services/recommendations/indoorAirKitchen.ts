import type { UserProfile, RoomGuidance, RoomActionItem } from '../../types/index.ts';

function isBiomass(fuel?: string): boolean {
  return /wood|biomass|coal|kerosene/i.test(fuel || '');
}

function isInduction(fuel?: string): boolean {
  return /electric|induction/i.test(fuel || '');
}

function createAction(
  id: string,
  title: string,
  description: string,
  priority: 'High' | 'Medium' | 'Optional',
  costLevel: 'Free' | 'Low-cost' | 'Investment',
  state: Record<string, boolean>
): RoomActionItem {
  return { id, title, description, priority, costLevel, completed: Boolean(state[id]) };
}

export function buildKitchenRoom(
  profile: UserProfile | null,
  state: Record<string, boolean>
): RoomGuidance {
  const fuel = profile?.cookingFuel || '';
  const biomass = isBiomass(fuel);
  const induction = isInduction(fuel);

  const actions = biomass
    ? [
        createAction(
          'kt-biomass-exhaust',
          'Maintain Dedicated Solid-Fuel Venting',
          'Ensure unblocked outdoor chimney draft throughout burning.',
          'High',
          'Free',
          state
        ),
        createAction(
          'kt-biomass-isolate',
          'Isolate Kitchen from Sleeping Quarters',
          'Keep interior bedroom doors shut to prevent smoke drift.',
          'High',
          'Free',
          state
        ),
      ]
    : induction
      ? [
          createAction(
            'kt-ind-lids',
            'Cover Pans During Searing & Frying',
            'Tight lids trap aerosolized cooking oil and volatile vapors.',
            'Medium',
            'Free',
            state
          ),
          createAction(
            'kt-ind-clean',
            'Wipe Flat Induction Margins Post-Cooking',
            'Eliminates scorched residue that re-vaporizes on next stove use.',
            'Optional',
            'Free',
            state
          ),
        ]
      : [
          createAction(
            'kt-lpg-chimney',
            'Activate Exhaust Before Lighting Burners',
            'Start range hood 60 seconds early to establish an outward draft.',
            'High',
            'Free',
            state
          ),
          createAction(
            'kt-lpg-grease',
            'Bi-Weekly Grease Filter Degreasing',
            'Clean metal mesh filters; grease buildup cuts airflow by 40%.',
            'Medium',
            'Free',
            state
          ),
        ];

  return {
    id: 'kitchen',
    name: 'Kitchen',
    status: biomass ? 'Attention' : 'Moderate',
    description: `High-activity cooking zone utilizing ${fuel || 'standard fuel'}.`,
    actions,
  };
}
