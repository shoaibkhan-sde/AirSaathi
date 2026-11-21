import type { RoomGuidance } from '../../types/index.ts';

export type IndoorTipCategory = 'source_control' | 'ventilation' | 'personal_protection';
export type IndoorTipIcon = 'purifier' | 'window' | 'stove' | 'shield' | 'flame' | 'leaf';
export type IndoorPriority = 'High' | 'Medium' | 'Optional';

export interface IndoorHeroGuidance {
  statusTitle: string;
  sensorNote: string;
  description: string;
  guidanceTitle: string;
  guidanceSubtitle: string;
  statusPill: string;
  hasOutdoorAqi: boolean;
}

export interface IndoorQuickTip {
  id: string;
  category: IndoorTipCategory;
  title: string;
  description: string;
  iconType: IndoorTipIcon;
  priority: IndoorPriority;
}

export interface IndoorAirResult {
  hero: IndoorHeroGuidance;
  quickTips: IndoorQuickTip[];
  rooms: RoomGuidance[];
}
