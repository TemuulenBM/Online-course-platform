'use client';

import { useEffect, useRef } from 'react';
import { useQuizStore } from '@/stores/quiz-store';

/**
 * Quiz countdown таймер.
 * Zustand store-ийн tick() action-г секунд тутамд дуудна.
 * Хугацааны хязгаартай quiz-д л render хийгдэнэ.
 */
export function QuizTimer() {
  const timeRemaining = useQuizStore((s) => s.timeRemainingSeconds);
  const hasTimeLimit = useQuizStore((s) => s.hasTimeLimit);
  const tick = useQuizStore((s) => s.tick);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasTimeLimit) return;

    intervalRef.current = setInterval(() => {
      tick();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasTimeLimit, tick]);

  if (!hasTimeLimit) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  /** Сүүлийн 5 минутад анхааруулга */
  const isWarning = timeRemaining <= 300 && timeRemaining > 60;
  /** Сүүлийн 1 минутад яаралтай анхааруулга */
  const isCritical = timeRemaining <= 60;

  return (
    <span
      className={`font-bold tabular-nums text-lg transition-colors ${
        isCritical
          ? 'text-red-500 animate-pulse'
          : isWarning
            ? 'text-amber-500 animate-pulse-slow'
            : 'text-foreground'
      }`}
    >
      {formatted}
    </span>
  );
}
