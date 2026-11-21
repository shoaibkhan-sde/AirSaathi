import { useState } from 'react';
import type { RoutineActivity, RoomGuidance, ChatMessage } from '../types';
import type { ActionProposal } from './AppContextTypes';
import { PREDEFINED_ASSISTANT_ANSWERS } from '../data/mockData';

export function useAppInteractions(
  initialRoutines: RoutineActivity[],
  initialRooms: RoomGuidance[],
  showToast: (title: string, message?: string, type?: 'success' | 'info') => void
) {
  const [routines, setRoutines] = useState<RoutineActivity[]>(initialRoutines);
  const [rooms, setRooms] = useState<RoomGuidance[]>(initialRooms);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState<boolean>(false);

  const toggleCompleteRoutine = (id: string) => {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const toggleSaveRoutine = (id: string) => {
    setRoutines((prev) => prev.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r)));
  };

  const toggleRoomAction = (roomId: string, actionId: string) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              actions: room.actions.map((act) =>
                act.id === actionId ? { ...act, completed: !act.completed } : act
              ),
            }
          : room
      )
    );
  };

  const sendUserMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsAssistantTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let key = 'indoor_air';
      if (lower.includes('exercise') || lower.includes('running') || lower.includes('jog')) {
        key = 'exercise';
      } else if (lower.includes('commute') || lower.includes('travel') || lower.includes('metro')) {
        key = 'commute';
      } else if (lower.includes('budget') || lower.includes('diy') || lower.includes('cost')) {
        key = 'affordable_home';
      } else if (
        lower.includes('mask') ||
        lower.includes('exposure') ||
        lower.includes('traffic')
      ) {
        key = 'exposure';
      }

      const ans = PREDEFINED_ASSISTANT_ANSWERS[key] || PREDEFINED_ASSISTANT_ANSWERS['indoor_air'];
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        structured: ans,
      };
      setChatMessages((prev) => [...prev, botMsg]);
      setIsAssistantTyping(false);
    }, 600);
  };

  const addRoutineFromProposal = (proposal: ActionProposal) => {
    const newRoutine: RoutineActivity = {
      id: `prop_${Date.now()}`,
      timeOfDay: proposal.timeOfDay,
      timeSlot:
        proposal.timeOfDay === 'morning'
          ? '08:00 – 09:00 AM'
          : proposal.timeOfDay === 'afternoon'
            ? '01:30 – 02:30 PM'
            : '07:30 – 08:30 PM',
      title: proposal.routineTitle,
      recommendation: proposal.details,
      reason: 'AI Companion calibrated routine',
      suggestedAlternative: 'Maintain daily consistency',
      effort: 'Low',
      completed: false,
      saved: true,
    };
    setRoutines((prev) => [newRoutine, ...prev]);
    showToast('Routine Added to Plan', proposal.routineTitle, 'success');
  };

  return {
    routines,
    setRoutines,
    rooms,
    setRooms,
    chatMessages,
    setChatMessages,
    isAssistantTyping,
    setIsAssistantTyping,
    toggleCompleteRoutine,
    toggleSaveRoutine,
    toggleRoomAction,
    sendUserMessage,
    addRoutineFromProposal,
  };
}
