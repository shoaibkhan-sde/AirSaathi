import React, { useState, useEffect, lazy, Suspense } from 'react';
import type { ChatMessage } from '../../types';
import { useApp } from '../../context/AppContext';
import { loadChatHistory, saveChatHistory, clearChatHistory } from '../../services/chatStorage';
import { requestAssistantReply } from '../../services/chatService';
import { FloatingBotLauncher } from './FloatingBotLauncher';

const ChatWindow = lazy(() =>
  import('./ChatWindow').then((m) => ({ default: m.ChatWindow }))
);

export const AirSaathiAssistant: React.FC = () => {
  const { activePage, currentCity, userProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      timestamp: timeStr,
      text,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      const result = await requestAssistantReply(text, messages, {
        activePage,
        city: currentCity,
        profile: userProfile,
      });

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: result.reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ast_err_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '⚠️ Unable to process request. Please check your internet connection and try again.',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    clearChatHistory();
    setMessages([]);
  };

  return (
    <>
      <FloatingBotLauncher isOpen={isOpen} onClick={() => setIsOpen(true)} />
      {isOpen && (
        <Suspense fallback={null}>
          <ChatWindow
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            messages={messages}
            onSendMessage={handleSendMessage}
            onResetChat={handleResetChat}
            isLoading={isLoading}
          />
        </Suspense>
      )}
    </>
  );
};
