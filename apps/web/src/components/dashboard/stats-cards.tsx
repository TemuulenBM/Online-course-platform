'use client';

import { useTranslations } from 'next-intl';

/** Статистик карт бүрийн тохиргоо */
const statsConfig = [
  {
    labelKey: 'enrolledCourse' as const,
    value: 24,
    bg: 'bg-[#FFF8E7]',
    border: 'border-[#FFE5D3]/50',
    iconStroke: '#FFB84C',
    iconPath: (
      <>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </>
    ),
  },
  {
    labelKey: 'lesson' as const,
    value: 34,
    bg: 'bg-[#F0EBF8]',
    border: 'border-[#DDD5F0]/50',
    iconStroke: '#8A93E5',
    iconPath: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <rect x="7" y="7" width="3" height="9" />
        <rect x="14" y="7" width="3" height="5" />
      </>
    ),
  },
  {
    labelKey: 'certificate' as const,
    value: 10,
    bg: 'bg-[#EAF0FC]',
    border: 'border-[#D0E0FF]/50',
    iconStroke: '#5D8FFC',
    iconPath: (
      <>
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </>
    ),
  },
];

export function StatsCards() {
  const t = useTranslations('dashboard');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {statsConfig.map((stat) => (
        <div
          key={stat.labelKey}
          className={`${stat.bg} rounded-3xl p-6 flex flex-col border ${stat.border} shadow-sm relative overflow-hidden group`}
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 z-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={stat.iconStroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {stat.iconPath}
            </svg>
          </div>
          <div className="flex flex-col z-10">
            <span className="text-[28px] font-bold text-gray-900 leading-none mb-1">
              {stat.value}
            </span>
            <span className="text-xs font-semibold text-gray-600">{t(stat.labelKey)}</span>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        </div>
      ))}
    </div>
  );
}
