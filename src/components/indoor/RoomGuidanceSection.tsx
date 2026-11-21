import React, { useState } from 'react';
import { Check, Sofa, Bed, UtensilsCrossed, Briefcase, RotateCcw } from 'lucide-react';
import type { RoomGuidance } from '../../types';

interface RoomGuidanceSectionProps {
  rooms: RoomGuidance[];
  onToggleAction: (roomId: string, actionId: string) => void;
  onResetChecklist?: () => void;
}

const getRoomIcon = (id: string) => {
  switch (id) {
    case 'kitchen':
      return UtensilsCrossed;
    case 'living':
      return Sofa;
    case 'bedroom':
      return Bed;
    case 'study':
    default:
      return Briefcase;
  }
};

const getPriorityBadge = (priority?: string) => {
  const norm = priority?.toLowerCase();
  if (norm === 'high') {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
  }
  if (norm === 'medium') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
};

export const RoomGuidanceSection: React.FC<RoomGuidanceSectionProps> = ({
  rooms,
  onToggleAction,
  onResetChecklist,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'kitchen');
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const handleReset = () => {
    if (window.confirm('Reset all checklist progress in this room-based checklist?')) {
      onResetChecklist?.();
    }
  };

  return (
    <section className="bg-white dark:bg-[#182228] border border-brand-border dark:border-[#28353E] rounded-section p-6 shadow-subtle">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-4 border-b border-brand-border dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-heading font-extrabold text-[20px] text-brand-text dark:text-white">
              Room-Based Air Checklist
            </h2>
            {onResetChecklist && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Reset checklist items"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
          <p className="text-[13px] text-brand-text-secondary dark:text-slate-400 mt-0.5">
            Behavioral source control and room protections prioritized by health impact.
          </p>
        </div>

        <div role="tablist" aria-label="Room categories" className="flex items-center gap-1.5 p-1 bg-brand-bg dark:bg-slate-800/60 rounded-btn border border-brand-border dark:border-slate-700 overflow-x-auto">
          {rooms.map((room) => {
            const Icon = getRoomIcon(room.id);
            const isSelected = room.id === (selectedRoom?.id || selectedRoomId);
            return (
              <button
                key={room.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none ${
                  isSelected
                    ? 'bg-brand-teal text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-brand-text'
                }`}
              >
                <Icon aria-hidden="true" className="w-3.5 h-3.5" />
                <span>{room.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedRoom && (
        <div>
          <div className="mb-4">
            <h3 className="font-heading font-bold text-[16px] text-brand-text dark:text-white">
              {selectedRoom.name} Habits & Protections
            </h3>
            <p className="text-[12px] text-brand-text-secondary dark:text-slate-400">
              {selectedRoom.description}
            </p>
          </div>

          <div className="space-y-3">
            {selectedRoom.actions.map((act) => (
              <button
                key={act.id}
                type="button"
                role="checkbox"
                aria-checked={act.completed}
                aria-label={`Mark ${act.title} as ${act.completed ? 'incomplete' : 'complete'}`}
                onClick={() => onToggleAction(selectedRoom.id, act.id)}
                className={`w-full text-left p-3.5 rounded-panel border flex items-start justify-between gap-3 transition-all cursor-pointer focus-visible:outline-none ${
                  act.completed
                    ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-900/40'
                    : 'border-brand-border dark:border-slate-800 hover:border-brand-teal/40 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      act.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {act.completed && <Check aria-hidden="true" className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-semibold text-[14px] ${
                          act.completed
                            ? 'line-through text-slate-400'
                            : 'text-brand-text dark:text-white'
                        }`}
                      >
                        {act.title}
                      </span>
                      <span
                        className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getPriorityBadge(
                          act.priority
                        )}`}
                      >
                        {act.priority}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          act.costLevel === 'Free'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : act.costLevel === 'Low-cost'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                        }`}
                      >
                        {act.costLevel}
                      </span>
                    </div>

                    <p className="text-[12px] text-brand-text-secondary dark:text-slate-400 mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-brand-teal shrink-0 mt-0.5">
                  {act.completed ? 'Done' : 'Mark done'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
