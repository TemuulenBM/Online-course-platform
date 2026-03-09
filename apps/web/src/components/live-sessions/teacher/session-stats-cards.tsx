'use client';

import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SessionStatsCardsProps {
  /** Нийт заасан цаг */
  totalHours: number;
  /** Энэ долоо хоногийн цаг */
  weeklyHours: number;
  /** Сүүлийн 7 хоногийн ирцийн трэнд (0-100 хувь) */
  attendanceTrend?: number[];
}

/** Default sparkline өгөгдөл — component гадна тогтмол reference */
const DEFAULT_TREND = [65, 72, 80, 75, 85, 90, 88];

/** Нийт цаг + Энэ долоо хоног — sparkline-тэй stat cards. */
export function SessionStatsCards({
  totalHours,
  weeklyHours,
  attendanceTrend = DEFAULT_TREND,
}: SessionStatsCardsProps) {
  // useMemo ашиглан render бүрт шинэ массив үүсэхээс сэргийлнэ — recharts infinite loop-оос хамгаална
  const sparkData = useMemo(
    () => attendanceTrend.map((v, i) => ({ idx: i, value: v })),
    [attendanceTrend],
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Нийт цаг */}
      <div className="relative overflow-hidden rounded-xl bg-primary p-4 text-white">
        <p className="text-[10px] font-bold uppercase opacity-80">Нийт цаг</p>
        <p className="text-2xl font-black">{totalHours}</p>
        {/* Sparkline overlay */}
        <div className="absolute inset-x-0 bottom-0 h-10 opacity-30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#ffffff"
                fill="#ffffff"
                strokeWidth={1.5}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Энэ долоо хоног */}
      <div className="relative overflow-hidden rounded-xl bg-slate-800 p-4 text-white">
        <p className="text-[10px] font-bold uppercase opacity-80">Энэ долоо хоног</p>
        <p className="text-2xl font-black">{weeklyHours}</p>
        {/* Sparkline overlay */}
        <div className="absolute inset-x-0 bottom-0 h-10 opacity-30">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                strokeWidth={1.5}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
