import type { NavPage } from '../../types/index.ts';

export type HomeNavTarget = NavPage;

export type HomeRecIconType =
  'window' | 'purifier' | 'shield' | 'stove' | 'bike' | 'bus' | 'car' | 'leaf' | 'zap';

export interface HomeRecommendationCard {
  id: string;
  title: string;
  subtitle: string;
  fullDesc: string;
  iconType: HomeRecIconType;
  iconColor: string;
  iconBg: string;
  targetPage: HomeNavTarget;
}
