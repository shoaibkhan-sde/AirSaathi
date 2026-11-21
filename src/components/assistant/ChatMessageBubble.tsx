import React from 'react';
import type { ChatMessage } from '../../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

function renderInlineText(raw: string) {
  // Parses **bold** into <strong> tags without any literal asterisks
  const parts = raw.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2).replace(/\*/g, '')}
        </strong>
      );
    }
    // Remove any remaining stray asterisks
    return part.replace(/\*/g, '');
  });
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const text = message.text || message.structured?.directAnswer || '';

  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          // Filter out empty lines or orphan bullet symbols
          if (!trimmed || trimmed === '•' || trimmed === '*' || trimmed === '-') {
            return null;
          }

          if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
            const clean = trimmed.replace(/^[*•-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-[12.5px] leading-relaxed">
                <span className="text-[#087C73] dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{renderInlineText(clean)}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-[12.5px] leading-relaxed">
              {renderInlineText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] bg-[#087C73] text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-xs text-[12.5px] leading-relaxed">
          <p className="whitespace-pre-wrap">{text.replace(/\*/g, '')}</p>
          <span className="block text-[10px] text-emerald-100/70 text-right mt-1">
            {message.timestamp}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 animate-fade-in">
      {/* Bot Avatar Icon */}
      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 text-[#087C73] dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M12 8V4H8" />
          <path d="M9 13v2" />
          <path d="M15 13v2" />
        </svg>
      </div>

      <div className="flex-1 max-w-[85%] bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-slate-800 dark:text-slate-100 shadow-xs">
        {renderFormattedText(text)}
        <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};
