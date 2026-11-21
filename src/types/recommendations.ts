export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: 'routine' | 'indoor' | 'travel';
  iconType: 'window' | 'purifier' | 'bike' | 'plant' | 'mask' | 'stove' | 'workout';
  whyItMatters: string;
  alternative?: string;
  effort: 'Low' | 'Medium' | 'High';
  exposureReduction?: string;
  saved: boolean;
  completed: boolean;
}

export interface RoutineActivity {
  id: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  timeSlot: string;
  title: string;
  recommendation: string;
  reason: string;
  suggestedAlternative: string;
  effort: 'Low' | 'Medium' | 'High';
  priority?: 'High' | 'Medium' | 'Low';
  relevantFactors?: string[];
  learnMoreDetails?: {
    mechanism: string;
    action: string;
    scientificContext: string;
  };
  completed: boolean;
  saved: boolean;
  impact?: {
    originalActivity: string;
    suggestedAlternative: string;
    personalExposureReduction: string;
    estimatedEmissionReductionKg?: number;
    cityWideNotice: string;
    assumptions: string[];
    limitations: string;
  };
}

export interface RoomActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low' | 'optional' | 'High' | 'Medium' | 'Low' | 'Optional';
  costLevel: 'Free' | 'Low-cost' | 'Investment';
  completed: boolean;
}

export interface RoomGuidance {
  id: string;
  name: string;
  status: 'Clean' | 'Moderate' | 'Attention';
  description: string;
  actions: RoomActionItem[];
}
