'use client';

import { useState, useEffect, useCallback } from 'react';

/** Countdown hook-ийн буцаах утгууд */
interface CountdownResult {
  /** Өдрийн тоо */
  days: number;
  /** Цагийн тоо */
  hours: number;
  /** Минутын тоо */
  minutes: number;
  /** Секундын тоо */
  seconds: number;
  /** Нийт үлдсэн секунд */
  totalSeconds: number;
  /** 30 мин-аас бага үлдсэн эсэх (amber өнгө) */
  isUrgent: boolean;
  /** 5 мин-аас бага үлдсэн эсэх (red өнгө) */
  isImminent: boolean;
  /** Хугацаа дууссан эсэх */
  isExpired: boolean;
  /** Форматлагдсан текст: "02:34:15" */
  formatted: string;
}

/**
 * Бодит цагийн countdown hook.
 * Session эхлэх хугацааг тоолж, секунд бүр шинэчлэгдэнэ.
 */
export function useCountdown(targetDate: string | null | undefined): CountdownResult {
  const calculateRemaining = useCallback(() => {
    if (!targetDate) return 0;
    const diff = new Date(targetDate).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  }, [targetDate]);

  const [totalSeconds, setTotalSeconds] = useState(calculateRemaining);

  useEffect(() => {
    setTotalSeconds(calculateRemaining());
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTotalSeconds(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calculateRemaining]);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatted =
    days > 0
      ? `${days}өд ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isUrgent: totalSeconds > 0 && totalSeconds <= 1800,
    isImminent: totalSeconds > 0 && totalSeconds <= 300,
    isExpired: totalSeconds <= 0,
    formatted,
  };
}
