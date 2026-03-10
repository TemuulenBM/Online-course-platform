'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ocp-streak';

/** Local timezone-д 'YYYY-MM-DD' огноо буцаана (UTC биш) */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** localStorage-д streak тоолуур хадгалах hook */
export function useStreak(): number {
  const [streakCount, setStreakCount] = useState(0);

  useEffect(() => {
    const today = toLocalDateStr(new Date());
    const raw = localStorage.getItem(STORAGE_KEY);
    const data: { count: number; lastDate: string } = raw
      ? (JSON.parse(raw) as { count: number; lastDate: string })
      : { count: 0, lastDate: '' };

    const yesterday = toLocalDateStr(new Date(Date.now() - 86_400_000));

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
