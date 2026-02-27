'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@ocp/shared-types';

/** Төлөвийн өнгөний mapping */
const statusStyles: Record<OrderStatus, string> = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  failed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  refunded: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

/** Төлөвийн dot өнгө */
const dotStyles: Record<OrderStatus, string> = {
  paid: 'bg-green-500',
  pending: 'bg-amber-500',
  processing: 'bg-amber-500',
  failed: 'bg-slate-400',
  refunded: 'bg-slate-400',
};

/** i18n key-ний mapping */
const statusKeys: Record<OrderStatus, string> = {
  paid: 'statusPaid',
  pending: 'statusPending',
  processing: 'statusProcessing',
  failed: 'statusFailed',
  refunded: 'statusRefunded',
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showDot?: boolean;
}

export function OrderStatusBadge({ status, showDot = false }: OrderStatusBadgeProps) {
  const t = useTranslations('payments');

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold',
        statusStyles[status] || statusStyles.pending,
      )}
    >
      {showDot && (
        <span
          className={cn('size-1.5 rounded-full mr-2', dotStyles[status] || dotStyles.pending)}
        />
      )}
      {t(statusKeys[status] || 'statusPending')}
    </span>
  );
}
