import React, { useState } from 'react';
import { Bot, Send, MapPin, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssistantMessageBubble } from './AssistantMessageBubble';

const SUGGESTED_QUESTIONS = [
  { label: 'Improve indoor air quality', key: 'indoor_air' },
  { label: 'Should I exercise outdoors today?', key: 'exercise' },
  { label: 'Reduce daily pollution exposure', key: 'exposure' },
  { label: 'Affordable ways to protect home', key: 'affordable_home' },
  { label: 'Make commute more sustainable', key: 'commute' },
];

export const AirGuideView: React.FC = () => {
  const { chatMessages, sendUserMessage, isAssistantTyping, currentCity, addRoutineFromProposal } =
    useApp();

  const [inputQuery, setInputQuery] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAssistantTyping) return;
    sendUserMessage(inputQuery);
    setInputQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-brand-border/60 dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-brand-teal dark:text-emerald-400 shrink-0 shadow-xs">
            <Bot className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-[22px] sm:text-[24px] md:text-[28px] text-brand-text dark:text-white leading-tight">
              Ask your AirSaathi
            </h1>
            <p className="text-[12.5px] sm:text-[13.5px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
              Context-aware environmental companion with structured, evidence-backed guidance.
            </p>
          </div>
        </div>

        {/* Current City Context Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-surface dark:bg-[#182228] border border-brand-border dark:border-slate-700 text-xs text-brand-text dark:text-slate-200 shadow-subtle self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-brand-teal" />
          <span className="font-semibold">{currentCity.name}</span>
          <span className="text-slate-400">
            • AQI {currentCity.aqi} ({currentCity.category})
          </span>
        </div>
      </div>

      {/* Suggested Questions Pills */}
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Recommended Consultation Topics:
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q.key}
              onClick={() => sendUserMessage(q.label)}
              disabled={isAssistantTyping}
              className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-[#182228] border border-brand-border dark:border-slate-700 hover:border-brand-teal/60 text-brand-text dark:text-slate-200 font-medium transition-all shadow-subtle hover:bg-slate-50 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation History Area */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation history"
        className="space-y-4 min-h-[380px] bg-brand-surface/40 dark:bg-slate-900/30 p-4 md:p-6 rounded-section border border-brand-border/80 dark:border-slate-800"
      >
        {chatMessages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end animate-fade-in">
                <div className="bg-brand-teal text-white px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-lg text-[13px] shadow-sm leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <AssistantMessageBubble
              key={msg.id}
              msg={msg}
              onSaveProposal={addRoutineFromProposal}
            />
          );
        })}

        {/* Typing indicator */}
        {isAssistantTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 animate-fade-in p-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-teal" />
            <span>AirSaathi is synthesizing evidence and local meteorological factors...</span>
          </div>
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="relative">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask about smog precautions, routines, or home air in ${currentCity.name}...`}
          aria-label={`Ask about smog precautions, routines, or home air in ${currentCity.name}`}
          disabled={isAssistantTyping}
          className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-brand-border dark:border-slate-700 bg-white dark:bg-[#182228] text-brand-text dark:text-white text-xs shadow-card focus:outline-none focus:ring-2 focus:ring-brand-teal/40"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || isAssistantTyping}
          aria-label="Send message"
          className="absolute right-2 top-2 p-2 rounded-lg bg-brand-teal text-white disabled:opacity-40 hover:bg-brand-teal-dark transition-all focus-visible:outline-none"
        >
          <Send aria-hidden="true" className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
