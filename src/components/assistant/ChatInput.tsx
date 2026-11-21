import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white dark:bg-[#142028] border-t border-brand-border/70 dark:border-slate-800 flex items-end gap-2"
    >
      <div className="flex-1 relative bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-[#087C73] dark:focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-[#087C73]/20 transition-all overflow-hidden">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask me anything about air quality..."
          aria-label="Ask me anything about air quality"
          disabled={isLoading}
          className="w-full max-h-[100px] resize-none px-3.5 py-2.5 text-[13px] bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={!text.trim() || isLoading}
        aria-label="Send message"
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-xs ${
          text.trim() && !isLoading
            ? 'bg-[#087C73] hover:bg-[#066860] text-white cursor-pointer active:scale-95'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
        ) : (
          <Send className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </form>
  );
};
