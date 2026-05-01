import React, { useState } from 'react';
import { Plus, X, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  question: string;
  options: PollOption[];
  deadline?: string;
  allowMultiple: boolean;
}

interface PollCreatorProps {
  onCreatePoll: (poll: Poll) => void;
  onCancel: () => void;
}

export function PollCreator({ onCreatePoll, onCancel }: PollCreatorProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [deadline, setDeadline] = useState('');
  const [allowMultiple, setAllowMultiple] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (!question.trim() || validOptions.length < 2) {
      return;
    }

    const poll: Poll = {
      question: question.trim(),
      options: validOptions.map((text, index) => ({
        id: `opt-${Date.now()}-${index}`,
        text,
        votes: 0
      })),
      deadline: deadline || undefined,
      allowMultiple
    };

    onCreatePoll(poll);
  };

  return (
    <div className="backdrop-blur-xl bg-white/95 rounded-2xl border border-white/20 shadow-2xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Créer un sondage</h3>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Question du sondage</label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question..."
          className="text-base"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium mb-2">Options (minimum 2)</label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 2 && (
              <button
                onClick={() => handleRemoveOption(index)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-red-500" />
              </button>
            )}
          </div>
        ))}
        {options.length < 10 && (
          <button
            onClick={handleAddOption}
            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full justify-center border border-dashed border-blue-300"
          >
            <Plus className="w-4 h-4" />
            Ajouter une option
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date limite (optionnel)</label>
          <Input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="allowMultiple"
            checked={allowMultiple}
            onChange={(e) => setAllowMultiple(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="allowMultiple" className="text-sm text-gray-700">
            Permettre plusieurs réponses
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button
          onClick={handleCreate}
          disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Créer le sondage
        </Button>
      </div>
    </div>
  );
}

interface PollViewProps {
  poll: Poll;
  onVote: (optionIds: string[]) => void;
  currentVotes: string[];
  totalVotes: number;
  hasVoted: boolean;
}

export function PollView({ poll, onVote, currentVotes, totalVotes, hasVoted }: PollViewProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleToggleOption = (optionId: string) => {
    if (poll.allowMultiple) {
      setSelectedOptions(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmitVote = () => {
    if (selectedOptions.length > 0) {
      onVote(selectedOptions);
    }
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/90 to-indigo-50/90 rounded-2xl border border-purple-200/50 shadow-lg p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-900 mb-1">{poll.question}</h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              {totalVotes} vote{totalVotes !== 1 && 's'}
            </span>
            {poll.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Jusqu'au {new Date(poll.deadline).toLocaleDateString('fr-CA')}
              </span>
            )}
            {poll.allowMultiple && (
              <span className="bg-purple-100 px-2 py-0.5 rounded-full text-xs font-medium text-purple-700">
                Choix multiple
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isSelected = selectedOptions.includes(option.id);
          const hasVotedForThis = currentVotes.includes(option.id);

          return (
            <div key={option.id} className="relative">
              <button
                onClick={() => !hasVoted && handleToggleOption(option.id)}
                disabled={hasVoted}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  hasVoted
                    ? 'cursor-default'
                    : isSelected
                    ? 'border-purple-400 bg-purple-100'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${hasVotedForThis ? 'text-purple-700' : 'text-gray-900'}`}>
                    {option.text}
                    {hasVotedForThis && ' ✓'}
                  </span>
                  {hasVoted && (
                    <span className="text-sm font-bold text-purple-600">{percentage}%</span>
                  )}
                </div>
                {hasVoted && (
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {!hasVoted && selectedOptions.length > 0 && (
        <Button
          onClick={handleSubmitVote}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Voter {selectedOptions.length > 1 && `(${selectedOptions.length} options)`}
        </Button>
      )}
    </div>
  );
}
