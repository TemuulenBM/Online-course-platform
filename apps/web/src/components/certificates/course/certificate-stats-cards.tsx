'use client';

import { ClipboardCheck, TrendingUp, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CertificateStatsCardsProps {
  totalIssued: number;
  thisMonth: number;
  pending: number;
}

/** Сургалтын сертификатын 3 stats карт */
export function CertificateStatsCards({
  totalIssued,
  thisMonth,
  pending,
}: CertificateStatsCardsProps) {
  const t = useTranslations('certificates');

  const stats = [
    {
      label: t('totalIssued'),
      value: totalIssued,
      icon: ClipboardCheck,
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      label: t('thisMonth'),
      value: thisMonth,
      icon: TrendingUp,
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      label: t('pendingApproval'),
      value: pending,
      icon: Clock,
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary/10 flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
            <stat.icon className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
