'use client';

import { useState, useCallback } from 'react';

const REACTIONS = [
  { emoji: '\uD83D\uDC4F', label: 'Clap' },
  { emoji: '\u2753', label: 'Question' },
  { emoji: '\uD83D\uDC4D', label: 'Thumbs up' },
  { emoji: '\uD83C\uDF89', label: 'Celebrate' },
] as const;

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

/**
 * Floating reaction товчнууд — дарахад emoji дээш хөвнө.
 */
export function ReactionOverlay() {
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [nextId, setNextId] = useState(0);

  const handleReaction = useCallback(
    (emoji: string) => {
      const id = nextId;
      const x = 20 + Math.random() * 60; // 20%-80% хооронд
      setNextId((prev) => prev + 1);
      setFloating((prev) => [...prev, { id, emoji, x }]);

      // 2 секундын дараа устгана
      setTimeout(() => {
        setFloating((prev) => prev.filter((r) => r.id !== id));
      }, 2000);
    },
    [nextId],
  );

  return (
    <div className="relative">
      {/* Floating emoji-ууд */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-40 overflow-hidden">
        {floating.map((r) => (
          <span
            key={r.id}
            className="absolute animate-[float-up_2s_ease-out_forwards] text-2xl"
            style={{ left: `${r.x}%`, bottom: 0 }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Reaction товчнууд */}
      <div className="flex items-center justify-center gap-3">
        {REACTIONS.map((r) => (
          <button
            key={r.label}
            onClick={() => handleReaction(r.emoji)}
            className="rounded-full bg-white/80 px-3 py-2 text-lg shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            title={r.label}
          >
            {r.emoji}
          </button>
        ))}
      </div>

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) scale(1.3);
          }
        }
      `}</style>
    </div>
  );
}
