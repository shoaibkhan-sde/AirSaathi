export type EcoCategory = 'transport' | 'energy' | 'household' | 'waste';
export type EcoImpactLevel = 'High' | 'Medium' | 'Low';
export type EcoCostLevel = 'Free' | 'Low Cost' | 'Investment';
export type EcoIcon = 'car' | 'bus' | 'zap' | 'leaf' | 'bike' | 'utensils' | 'home' | 'footprints';

export interface EcoAlternative {
  id: string;
  category: EcoCategory;
  title: string;
  description: string;
  icon: EcoIcon;
  estimatedBenefit?: string;
  impactLevel: EcoImpactLevel;
  costLevel: EcoCostLevel;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  tag: string;
}

export interface SustainableAction {
  id: string;
  category: EcoCategory;
  title: string;
  description: string;
  co2SavingsKg: number;
  calculationBasis: string;
  frequency: 'daily' | 'weekly';
  completed: boolean;
}

export interface ContributingAction {
  id: string;
  title: string;
  co2SavedKg: number;
}

export interface SustainabilityImpactSummary {
  hasActivityData: boolean;
  totalCo2SavedKg: number;
  completedActionsCount: number;
  totalActionsCount: number;
  reportingPeriod: string;
  contributingActions: ContributingAction[];
}

export interface SustainabilityData {
  impact: SustainabilityImpactSummary;
  recommendedAlternatives: EcoAlternative[];
  allAlternatives: EcoAlternative[];
  actions: SustainableAction[];
}
