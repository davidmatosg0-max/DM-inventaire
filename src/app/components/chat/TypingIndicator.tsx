import React from 'react';

interface TypingIndicatorProps {
  userName: string;
  departmentName: string;
}

export function TypingIndicator({ userName, departmentName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-blue-50/90 rounded-xl border border-blue-200/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-gray-600 font-medium">
        <span className="font-bold text-[#1a4d7a]">{userName}</span>
        {' '}de{' '}
        <span className="font-semibold text-[#2d9561]">{departmentName}</span>
        {' '}est en train d'écrire...
      </span>
    </div>
  );
}

interface TypingIndicatorCompactProps {
  count: number;
}

export function TypingIndicatorCompact({ count }: TypingIndicatorCompactProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="backdrop-blur-xl bg-white/95 px-4 py-2 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-[#1a4d7a] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-[#2d9561] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-[#1a4d7a] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-xs font-medium text-gray-700">
          {count} {count === 1 ? 'personne écrit' : 'personnes écrivent'}...
        </span>
      </div>
    </div>
  );
}
