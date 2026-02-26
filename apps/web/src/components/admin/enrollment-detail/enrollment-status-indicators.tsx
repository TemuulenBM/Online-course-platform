'use client';

import { CheckCircle, ShieldCheck, Clock, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EnrollmentStatusIndicatorsProps {
  currentStatus: string;
}

const statuses = [
  {
    key: 'active',
    icon: CheckCircle,
    bgActive: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30',
    textActive: 'text-green-600 dark:text-green-400',
    iconColor: 'text-green-500',
  },
  {
    key: 'completed',
    icon: ShieldCheck,
    bgActive: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30',
    textActive: 'text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-500',
  },
  {
    key: 'expired',
    icon: Clock,
    bgActive: 'bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700',
    textActive: 'text-slate-500 dark:text-slate-400',
    iconColor: 'text-slate-500',
  },
  {
    key: 'cancelled',
    icon: XCircle,
    bgActive: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30',
    textActive: 'text-red-600 dark:text-red-400',
    iconColor: 'text-red-500',
  },
];

/** Статусын тэмдэглэгээ — баруун sidebar */
export function EnrollmentStatusIndicators({ currentStatus }: EnrollmentStatusIndicatorsProps) {
  const t = useTranslations('enrollments');

  return (
    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-primary/10">
      <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
        {t('statusIndicators')}
      </h3>
      <div className="space-y-3">
        {statuses.map((s) => {
          const isActive = currentStatus === s.key;
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className={`flex items-center justify-between p-2 rounded-lg border ${s.bgActive} ${!isActive ? 'opacity-60' : ''}`}
            >
              <span className={`text-xs font-bold uppercase ${s.textActive}`}>{s.key}</span>
              <Icon className={`size-4 ${s.iconColor}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
