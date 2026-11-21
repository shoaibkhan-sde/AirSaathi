export type SmartTipPriority = 'High' | 'Medium' | 'Low';

export type SmartTipTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'all';

export interface SmartTipRecommendation {
  id: string;
  title: string;
  description: string;
  timeOfDay: SmartTipTimeOfDay;
  timeSlot?: string;
  priority: SmartTipPriority;
  reason: string;
  relevantFactors: string[];
  effort: 'Low' | 'Medium' | 'High';
  completed: boolean;
  saved: boolean;
  learnMoreDetails?: {
    mechanism: string;
    action: string;
    scientificContext: string;
  };
}

export interface HouseholdProtectionCard {
  id: string;
  title: string;
  description: string;
  tag: string;
  iconType: 'shield' | 'users' | 'wind' | 'alert' | 'flame';
  priority: SmartTipPriority;
}

export interface SmartTipsResult {
  featuredTip: SmartTipRecommendation;
  routines: SmartTipRecommendation[];
  protectionCards: HouseholdProtectionCard[];
}
