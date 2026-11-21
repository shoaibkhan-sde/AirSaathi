import React from 'react';
import { Activity, ShieldCheck, Home } from 'lucide-react';

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ onSelect }) => {
  const cards = [
    {
      topic: 'Understanding AQI',
      question: "What does today's AQI mean for my health?",
      icon: Activity,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60',
    },
    {
      topic: 'Outdoor Safety',
      question: 'Is it safe to exercise outdoors today?',
      icon: ShieldCheck,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60',
    },
    {
      topic: 'Indoor Protection',
      question: 'How can I reduce indoor air pollution?',
      icon: Home,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200/80 dark:border-teal-800/60',
    },
  ];

  return (
    <div className="space-y-3.5 my-2 animate-fade-in">
      {/* Intro Box */}
      <div className="p-3.5 rounded-2xl bg-[#EBF7F4] dark:bg-[#142A24] border border-[#C6EFE4] dark:border-[#1E4A3E] text-slate-700 dark:text-slate-200 shadow-xs">
        <p className="text-[12.5px] leading-relaxed">
          <strong className="text-[#094E46] dark:text-emerald-300 block mb-1">
            Hi! I'm your AirSaathi Assistant.
          </strong>
          I can help you understand air quality, reduce pollution exposure, and make healthier
          choices for your household.
        </p>
      </div>

      {/* Suggested Question Cards */}
      <div className="space-y-2">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
          Suggested Topics:
        </span>
        <div className="flex flex-col gap-2">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(c.question)}
                className={`w-full text-left p-2.5 rounded-xl border ${c.bg} hover:border-[#087C73] dark:hover:border-emerald-500 hover:shadow-xs transition-all group cursor-pointer flex items-start gap-2.5`}
              >
                <div
                  className={`w-6 h-6 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${c.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                    {c.topic}
                  </span>
                  <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#087C73] dark:group-hover:text-emerald-300 leading-snug">
                    {c.question}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
