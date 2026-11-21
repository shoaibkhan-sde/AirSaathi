import React from 'react';
import { Bot, MapPin, AlertCircle, BookmarkPlus, BookOpen } from 'lucide-react';
import type { ChatMessage } from '../../types';
import type { ActionProposal } from '../../context/AppContextTypes';

interface AssistantMessageBubbleProps {
  msg: ChatMessage;
  onSaveProposal: (proposal: ActionProposal) => void;
}

export const AssistantMessageBubble: React.FC<AssistantMessageBubbleProps> = ({
  msg,
  onSaveProposal,
}) => {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-brand-teal dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex-1 bg-white dark:bg-[#182228] border border-brand-border dark:border-slate-700/80 rounded-2xl rounded-tl-sm p-5 shadow-card space-y-4 text-xs">
        {msg.text && (
          <p className="text-[13px] text-brand-text dark:text-slate-200 leading-relaxed">
            {msg.text}
          </p>
        )}

        {msg.structured && (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-btn border border-emerald-200/60 dark:border-emerald-800/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                1. Direct Expert Recommendation
              </span>
              <p className="font-semibold text-brand-text dark:text-white text-[13px] leading-relaxed">
                {msg.structured.directAnswer}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                2. Priority Action Steps
              </span>
              <ul className="space-y-1.5">
                {msg.structured.recommendedActions.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="w-4 h-4 rounded-full bg-brand-teal-light dark:bg-brand-teal-dark text-brand-teal dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-btn bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="font-semibold text-brand-text dark:text-slate-200 block mb-1">
                3. Physiological & Environmental Mechanism
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {msg.structured.whyThisHelps}
              </p>
            </div>

            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300 bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-btn border border-sky-200/60 dark:border-sky-800/40">
              <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong>4. Localized Context: </strong>
                {msg.structured.localContext}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 5. Peer-Reviewed Evidence & Standards
              </span>
              <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 space-y-0.5 text-[11px]">
                {msg.structured.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>

            <div className="p-2.5 rounded-btn bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>6. Important Boundaries & Limitations: </strong>
                {msg.structured.limitations}
              </div>
            </div>

            {msg.structured.actionProposal && (
              <div className="pt-2 border-t border-brand-border/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-brand-text dark:text-white block">
                    Proposal: {msg.structured.actionProposal.routineTitle}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {msg.structured.actionProposal.details}
                  </span>
                </div>

                <button
                  onClick={() => onSaveProposal(msg.structured!.actionProposal!)}
                  className="px-3 py-1.5 rounded-btn bg-brand-teal text-white font-semibold flex items-center gap-1 hover:bg-brand-teal-dark transition-colors shadow-subtle shrink-0"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to My Plan</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
