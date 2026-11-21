import { useCallback, useRef, useState } from 'react';
import { notify } from '../../../utils/notify';
import type { VoteResult, VoteValue } from '../types';

// Shared by posts and comments. Updates the UI immediately, then reconciles
// with the server's numbers, and rolls back if the request fails.
export function useVote(
  initial: VoteResult,
  send: (value: VoteValue) => Promise<VoteResult>,
) {
  const [state, setState] = useState<VoteResult>(initial);
  const pending = useRef(false);

  const vote = useCallback(
    async (direction: 1 | -1) => {
      if (pending.current) return;
      pending.current = true;

      const previous = state;
      // Pressing the active arrow again clears the vote.
      const next: VoteValue = previous.viewerVote === direction ? 0 : direction;
      setState({ score: previous.score - previous.viewerVote + next, viewerVote: next });

      try {
        setState(await send(next));
      } catch {
        setState(previous);
        notify.error("Couldn't save your vote. Try again.");
      } finally {
        pending.current = false;
      }
    },
    [state, send],
  );

  return { ...state, vote };
}
