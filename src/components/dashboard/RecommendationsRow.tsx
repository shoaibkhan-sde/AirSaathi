import React, { useMemo } from 'react';
import { Home, Bike, Bus, Car, Zap, Leaf, Shield, Utensils } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateHomeRecommendations,
  HomeRecIconType,
} from '../../services/recommendations/homeRecommendations';

function renderHomeIcon(iconType: HomeRecIconType, colorClass: string) {
  switch (iconType) {
    case 'purifier':
      return (
        <svg
          className={`w-5 h-5 ${colorClass}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="6" y="3" width="12" height="18" rx="4" />
          <circle cx="12" cy="8" r="1.8" fill="currentColor" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      );
    case 'window':
      return <Home className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'shield':
      return <Shield className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'stove':
      return <Utensils className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'bike':
      return <Bike className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'bus':
      return <Bus className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'car':
      return <Car className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'zap':
      return <Zap className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
    case 'leaf':
    default:
      return <Leaf className={`w-5 h-5 ${colorClass} stroke-[2.2]`} />;
  }
}

export const RecommendationsRow: React.FC = () => {
  const { userProfile, currentCity } = useApp();

  const cards = useMemo(() => {
    return generateHomeRecommendations(userProfile, currentCity);
  }, [userProfile, currentCity]);

  return (
    <section className="shrink-0">
      {/* Section Header */}
      <div className="mb-2.5">
        <h2 className="font-sans font-bold text-[16px] md:text-[17px] text-brand-text dark:text-white tracking-tight">
          Today's Recommendations
        </h2>
      </div>

      {/* Exactly THREE sub-cards in one horizontal row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white dark:bg-[#182228] border border-brand-border/80 dark:border-[#28353E] rounded-2xl p-3.5 sm:p-4 shadow-subtle hover:shadow-card hover:border-brand-teal/30 transition-all flex flex-col items-center justify-center text-center min-h-[120px] md:min-h-[130px] h-auto select-none group"
          >
            {/* Centered Icon with pastel rounded container */}
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${card.iconBg}`}
            >
              {renderHomeIcon(card.iconType, card.iconColor)}
            </div>

            {/* Recommendation Title */}
            <h3 className="font-sans font-semibold text-[13px] md:text-[14px] text-brand-text dark:text-white leading-tight">
              {card.title}
            </h3>

            {/* Supporting Sentence */}
            <p className="text-[12px] md:text-[13px] font-normal text-brand-text-secondary dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
