'use client';

import { Users, BookOpen, GraduationCap, Award, ShoppingCart } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';
import type { PlatformStats } from '@ocp/shared-types';

/** Stat карт — дизайны дагуу */
function StatCard({
  label,
  value,
  changePercent,
  icon: Icon,
}: {
  label: string;
  value: number;
  changePercent?: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#9c7aff]/5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <div className="size-9 rounded-xl bg-[#9c7aff]/5 flex items-center justify-center">
          <Icon className="size-[18px] text-[#9c7aff]" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <AnimatedCounter value={value} className="text-2xl font-bold text-slate-900" />
        {changePercent !== undefined && changePercent !== 0 && (
          <span
            className={`text-xs font-bold mb-1 ${
              changePercent > 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {changePercent > 0 ? '+' : ''}
            {changePercent}%
          </span>
        )}
        {changePercent === 0 && <span className="text-xs font-bold mb-1 text-slate-400">0%</span>}
      </div>
    </div>
  );
}

/** 5 stat карт grid — дизайны дагуу */
export function DashboardStatsGrid({ stats }: { stats: PlatformStats | undefined }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      <StatCard
        label="Нийт хэрэглэгч"
        value={stats?.users.total ?? 0}
        changePercent={12}
        icon={Users}
      />
      <StatCard
        label="Нийт курсууд"
        value={stats?.courses.total ?? 0}
        changePercent={4}
        icon={BookOpen}
      />
      <StatCard
        label="Суралцагчид"
        value={stats?.enrollments.total ?? 0}
        changePercent={18}
        icon={GraduationCap}
      />
      <StatCard
        label="Сертификат"
        value={stats?.certificates.total ?? 0}
        changePercent={0}
        icon={Award}
      />
      <StatCard
        label="Нийт захиалга"
        value={stats?.orders.total ?? 0}
        changePercent={22}
        icon={ShoppingCart}
      />
    </div>
  );
}
