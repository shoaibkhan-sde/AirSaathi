import React, { useRef, useEffect, useState } from 'react';
import type { ChatMessage } from '../../types';
import { ChatWindowHeader } from './ChatWindowHeader';
import { ChatMessageBubble } from './ChatMessageBubble';
import { SuggestedQuestions } from './SuggestedQuestions';
import { ChatInput } from './ChatInput';
import { Loader2, AlertCircle } from 'lucide-react';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onResetChat: () => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onResetChat,
  isLoading,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.getElementById('floating-bot-launcher')?.focus();
    };
  }, [onClose]);

  if (!isOpen) return null;

  const handleConfirmReset = () => {
    onResetChat();
    setShowConfirmReset(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="AirSaathi Assistant Chat"
      className="fixed right-3 sm:right-6 bottom-16 sm:bottom-20 md:bottom-[90px] z-50 w-[calc(100vw-24px)] sm:w-[400px] h-[520px] max-h-[78vh] sm:max-h-[82vh] bg-white dark:bg-[#142028] border border-brand-border dark:border-[#22333E] rounded-2xl md:rounded-[22px] shadow-[0_12px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden animate-fade-in select-none"
    >
      {/* Header */}
      <ChatWindowHeader onClose={onClose} onReset={() => setShowConfirmReset(true)} />

      {/* Confirmation Overlay for New Conversation */}
      {showConfirmReset && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-2 text-xs animate-fade-in">
          <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Clear conversation history?</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowConfirmReset(false)}
              className="px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Conversation Scrollable Body */}
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation messages"
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 select-text"
      >
        {messages.length === 0 ? (
          <SuggestedQuestions onSelect={onSendMessage} />
        ) : (
          messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)
        )}

        {/* AI Typing Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 p-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#087C73] dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span>AirSaathi is synthesizing environmental guidance...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} isLoading={isLoading} />

      {/* Footer Info Pill */}
      <div className="px-3 py-1 bg-slate-50 dark:bg-[#111A20] border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
        <span>Persistent in browser localStorage • Cross-tab available</span>
      </div>
    </div>
  );
};
