import React, { useState } from 'react';
import { Car, Bus, Zap, Leaf, Bike, Utensils, Home, Footprints, ChevronDown } from 'lucide-react';
import type { EcoAlternative, EcoIcon } from '../../services/sustainability/sustainabilityTypes';

interface EcoAlternativesSectionProps {
  recommendedAlternatives: EcoAlternative[];
  allAlternatives: EcoAlternative[];
}

const ICON_MAP: Record<EcoIcon, React.ComponentType<{ className?: string }>> = {
  car: Car,
  bus: Bus,
  zap: Zap,
  leaf: Leaf,
  bike: Bike,
  utensils: Utensils,
  home: Home,
  footprints: Footprints,
};

export const EcoAlternativesSection: React.FC<EcoAlternativesSectionProps> = ({
  recommendedAlternatives,
  allAlternatives,
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? allAlternatives : recommendedAlternatives;
  const hasMore = allAlternatives.length > recommendedAlternatives.length;

  return (
    <section className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-extrabold text-[18px] md:text-[20px] text-brand-text dark:text-white">
            Eco-Friendly Alternatives
          </h2>
          <p className="text-[12.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
            Calibrated to your commute, kitchen setup, and living habits.
          </p>
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-[12.5px] font-semibold text-brand-teal dark:text-emerald-400 flex items-center gap-1 hover:underline active:opacity-80"
          >
            <span>{showAll ? 'Show less' : `View all (${allAlternatives.length})`}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAll ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayed.map((alt) => {
          const IconComp = ICON_MAP[alt.icon] || Leaf;

          return (
            <div
              key={alt.id}
              className="p-5 rounded-panel bg-white dark:bg-[#182228] border border-brand-border dark:border-[#28353E] shadow-subtle hover:border-brand-teal/40 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center bg-[#E6F7F0] dark:bg-emerald-950/60 text-[#14734D] dark:text-emerald-300">
                    <IconComp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {alt.tag}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-[15px] text-brand-text dark:text-white leading-tight mb-1.5">
                  {alt.title}
                </h3>
                <p className="text-[12.5px] text-brand-text-secondary dark:text-slate-300 leading-relaxed">
                  {alt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11.5px]">
                {alt.estimatedBenefit && (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    {alt.estimatedBenefit}
                  </span>
                )}
                <span className="text-slate-400 dark:text-slate-500 font-medium ml-auto">
                  {alt.costLevel} • {alt.difficulty}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
