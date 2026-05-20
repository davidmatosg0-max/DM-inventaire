import React from 'react';
import { X } from 'lucide-react';

const REACTION_CATALOG = [
  '👍', '👏', '🙌', '🙏', '🤝', '💪',
  '✅', '📌', '📅', '📞', '💡', '📝',
  '📦', '🚚', '🛠️', '📈', '📎', '🔔',
  '👀', '⚠️', '🔥', '⭐', '✨', '🎉',
  '❤️', '💙', '💚', '😊', '🙂', '😄',
  '🚀', '🏁', '🎯', '🤗', '💬', '📣',
] as const;

export type Reaction = typeof REACTION_CATALOG[number];

interface ReactionPickerProps {
  onReact: (emoji: Reaction) => void;
  onClose: () => void;
}

export function ReactionPicker({ onReact, onClose }: ReactionPickerProps) {
  return (
    <div className="absolute bottom-full right-0 z-50 mb-2 w-[308px] rounded-2xl border border-white/20 bg-white/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Réactions</p>
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-500"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {REACTION_CATALOG.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReact(emoji);
              onClose();
            }}
            className="group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 hover:bg-blue-50"
            title={`Réagir avec ${emoji}`}
          >
            <span className="text-[22px] leading-none">{emoji}</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-emerald-500/0 group-hover:from-blue-500/10 group-hover:to-emerald-500/10 transition-all duration-200" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  onReact: (emoji: Reaction) => void;
  currentUserId: string;
}

export function MessageReactions({ reactions, onReact, currentUserId }: MessageReactionsProps) {
  if (!reactions || Object.keys(reactions).length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
      {Object.entries(reactions).map(([emoji, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji as Reaction)}
            className={`group relative flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-all duration-200 hover:scale-110 ${
              hasReacted
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300 shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
            }`}
            title={`${userIds.length} personne(s)`}
          >
            <span className="text-base">{emoji}</span>
            <span className={`text-xs font-medium ${hasReacted ? 'text-blue-700' : 'text-gray-600'}`}>
              {userIds.length}
            </span>
            {hasReacted && (
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
