'use client';

import { VoteButtons } from '../vote-buttons';

interface VoteSidebarProps {
  voteScore: number;
  userVote: 'up' | 'down' | null;
  onVote: (voteType: 'up' | 'down') => void;
}

/** Desktop-д зүүн талд sticky vote sidebar */
export function VoteSidebar({ voteScore, userVote, onVote }: VoteSidebarProps) {
  return (
    <div className="hidden md:flex flex-col items-center sticky top-24 pt-2">
      <VoteButtons
        voteScore={voteScore}
        userVote={userVote}
        onVote={onVote}
        variant="vertical"
        size="md"
      />
    </div>
  );
}
