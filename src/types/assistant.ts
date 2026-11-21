export type NavPage =
  'home' | 'tips' | 'indoor' | 'sustainability' | 'guide' | 'settings';

export type UIStateMode = 'normal' | 'loading' | 'empty' | 'error' | 'success' | 'disabled';

export interface AssistantStructuredResponse {
  directAnswer: string;
  recommendedActions: string[];
  whyThisHelps: string;
  localContext: string;
  evidence: string[];
  limitations: string;
  actionProposal?: {
    routineTitle: string;
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    details: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  structured?: AssistantStructuredResponse;
}
