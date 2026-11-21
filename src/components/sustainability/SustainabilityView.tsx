import React, { useState, useMemo } from 'react';
import { Leaf } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateSustainabilityData,
  loadCompletedActions,
  saveCompletedActions,
  resetCompletedActions,
} from '../../services/sustainability/sustainabilityEngine';
import { SustainabilityHero } from './SustainabilityHero';
import { EcoAlternativesSection } from './EcoAlternativesSection';
import { SustainableActionsSection } from './SustainableActionsSection';
import { MyProgressSection } from './MyProgressSection';

export const SustainabilityView: React.FC = () => {
  const { userProfile } = useApp();

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(loadCompletedActions);

  const sustainabilityData = useMemo(() => {
    return generateSustainabilityData(userProfile, completedMap);
  }, [userProfile, completedMap]);

  const handleToggleAction = (actionId: string) => {
    setCompletedMap((prev) => {
      const updated = { ...prev, [actionId]: !prev[actionId] };
      saveCompletedActions(updated);
      return updated;
    });
  };

  const handleResetActions = () => {
    resetCompletedActions();
    setCompletedMap({});
  };

  const handleExploreActions = () => {
    const el = document.getElementById('sustainable-actions');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const { impact, recommendedAlternatives, allAlternatives, actions } = sustainabilityData;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
      {/* Page Header with Focused Icon & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/60 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 shadow-xs">
            <Leaf className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[22px] sm:text-[24px] md:text-[28px] text-brand-text dark:text-white leading-tight">
              Sustainability
            </h1>
            <p className="text-[12.5px] sm:text-[13.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
              Actionable, household-tailored habits for a lower carbon footprint.
            </p>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold text-emerald-800 dark:text-emerald-300 self-start sm:self-auto">
          <span>Carbon Reduction</span>
        </div>
      </div>

      {/* 1. Dynamic Impact Hero Card */}
      <SustainabilityHero impact={impact} onExploreActions={handleExploreActions} />

      {/* 2. Personalized Eco-Friendly Alternatives (In-place expand, no black background!) */}
      <EcoAlternativesSection
        recommendedAlternatives={recommendedAlternatives}
        allAlternatives={allAlternatives}
      />

      {/* 3. Sustainable Actions Tracking */}
      <SustainableActionsSection actions={actions} onToggleAction={handleToggleAction} />

      {/* 4. Compact Progress Summary */}
      <MyProgressSection impact={impact} onReset={handleResetActions} />
    </div>
  );
};
