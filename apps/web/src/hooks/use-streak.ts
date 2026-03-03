'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ocp-streak';

/** localStorage-д streak тоолуур хадгалах hook */
export function useStreak(): number {
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: { count: number; lastDate: string } = raw
      ? (JSON.parse(raw) as { count: number; lastDate: string })
      : { count: 0, lastDate: '' };

    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    let newCount: number;
    if (data.lastDate === today) {
      newCount = data.count; // Өнөөдөр аль хэдийн зочилсон — өөрчлөгдөхгүй
    } else if (data.lastDate === yesterday) {
      newCount = data.count + 1; // Дараалсан өдөр — нэмэгдэнэ
    } else {
      newCount = 1; // Тасалдсан эсвэл анх удаа — дахин эхлэх
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: newCount, lastDate: today }));
    setStreakCount(newCount);
  }, []);

  return streakCount;
}
