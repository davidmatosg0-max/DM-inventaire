import React, { useState } from 'react';
import { 
  Reply, 
  Forward, 
  Copy, 
  Edit2, 
  Trash2, 
  Star, 
  Pin, 
  Archive,
  MoreVertical,
  Smile,
  Check
} from 'lucide-react';
import { Button } from '../ui/button';

interface MessageActionsProps {
  onReply: () => void;
  onForward?: () => void;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
  onTogglePin?: () => void;
  onArchive: () => void;
  onReact: () => void;
  isStarred: boolean;
  isPinned?: boolean;
  canEdit?: boolean;
}

export function MessageActions({
  onReply,
  onForward,
  onCopy,
  onEdit,
  onDelete,
  onToggleStar,
  onTogglePin,
  onArchive,
  onReact,
  isStarred,
  isPinned,
  canEdit
}: MessageActionsProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      {/* Quick actions (always visible on hover) */}
      <div className="absolute top-0 right-0 transform -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-1">
        <button
          onClick={onReact}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          title="Réagir"
        >
          <Smile className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={onReply}
          className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          title="Répondre"
        >
          <Reply className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={onToggleStar}
          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
          title={isStarred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Star className={`w-4 h-4 ${isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
        </button>
        {onTogglePin && (
          <button
            onClick={onTogglePin}
            className="p-2 hover:bg-purple-50 rounded-lg transition-colors duration-200"
            title={isPinned ? 'Détacher' : 'Épingler'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-purple-400 text-purple-400' : 'text-gray-600'}`} />
          </button>
        )}
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="Plus d'actions"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div className="absolute top-0 right-0 mt-10 backdrop-blur-xl bg-white/95 rounded-xl shadow-2xl border border-white/20 py-2 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          <button
            onClick={() => {
              onCopy();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors duration-200 flex items-center gap-3 text-sm"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span>Copier le message</span>
          </button>

          {onForward && (
            <button
              onClick={() => {
                onForward();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors duration-200 flex items-center gap-3 text-sm"
            >
              <Forward className="w-4 h-4 text-gray-600" />
              <span>Transférer</span>
            </button>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors duration-200 flex items-center gap-3 text-sm"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
              <span>Modifier</span>
            </button>
          )}

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => {
              onArchive();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 text-sm"
          >
            <Archive className="w-4 h-4 text-gray-600" />
            <span>Archiver</span>
          </button>

          <button
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-red-50 transition-colors duration-200 flex items-center gap-3 text-sm text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

interface QuickReplyButtonProps {
  onClick: () => void;
}

export function QuickReplyButton({ onClick }: QuickReplyButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 px-3 py-1.5 mt-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 transition-all duration-200 hover:shadow-md"
    >
      <Reply className="w-3.5 h-3.5 text-blue-600" />
      <span className="text-sm font-medium text-blue-700">Réponse rapide</span>
    </button>
  );
}
