import React, { useState } from 'react';
import { ThumbsUp, Heart, Laugh, Star, Zap, CheckCircle, X } from 'lucide-react';

type Reaction = '👍' | '❤️' | '😂' | '⭐' | '⚡' | '✅' | '🎉' | '🔥';

interface ReactionPickerProps {
  onReact: (emoji: Reaction) => void;
  onClose: () => void;
}

export function ReactionPicker({ onReact, onClose }: ReactionPickerProps) {
  const reactions: Reaction[] = ['👍', '❤️', '😂', '⭐', '⚡', '✅', '🎉', '🔥'];

  return (
    <div className="absolute bottom-full mb-2 right-0 backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-white/20 p-2 flex gap-1 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
      {reactions.map((emoji) => (
        <button
          key={emoji}
          onClick={() => {
            onReact(emoji);
            onClose();
          }}
          className="group relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-125"
          title={`Réagir avec ${emoji}`}
        >
          <span className="text-2xl">{emoji}</span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-200" />
        </button>
      ))}
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-red-50 transition-all duration-200 ml-2 border-l border-gray-200"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
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
