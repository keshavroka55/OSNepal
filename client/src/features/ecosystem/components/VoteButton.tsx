import { ChevronDown, ChevronUp } from 'lucide-react';
import { compactNumber } from '../relativeTime';
import type { VoteValue } from '../types';

interface VoteButtonProps {
  score: number;
  viewerVote: VoteValue;
  onVote: (direction: 1 | -1) => void;
  /** What is being voted on, for screen readers. */
  label: string;
  orientation?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

// Shared by posts and comments. 44px touch targets on phones.
export function VoteButton({ score, viewerVote, onVote, label, orientation = 'vertical', disabled }: VoteButtonProps) {
  const arrow = (direction: 1 | -1) => {
    const active = viewerVote === direction;
    const Icon = direction === 1 ? ChevronUp : ChevronDown;
    return (
      <button
        type="button"
        disabled={disabled}
        aria-pressed={active}
        aria-label={`${direction === 1 ? 'Upvote' : 'Downvote'} ${label}`}
        onClick={() => onVote(direction)}
        className={`inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-surface-raised disabled:opacity-50 sm:h-7 sm:w-7 ${
          active ? (direction === 1 ? 'text-primary' : 'text-danger') : 'text-text-muted'
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={active ? 3 : 2} aria-hidden="true" />
      </button>
    );
  };

  return (
    <div
      className={`flex shrink-0 items-center ${orientation === 'vertical' ? 'flex-col' : 'flex-row gap-1'}`}
      role="group"
      aria-label={`Votes for ${label}`}
    >
      {arrow(1)}
      <span className="tabular min-w-[2ch] text-center text-sm font-medium text-text" aria-live="polite">
        {compactNumber(score)}
      </span>
      {arrow(-1)}
    </div>
  );
}
