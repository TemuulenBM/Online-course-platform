'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Eye } from 'lucide-react';
import { usePendingOrders } from '@/hooks/api';
import { OrderStatusBadge } from '@/components/payments/order-status-badge';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import type { OrderStatus } from '@ocp/shared-types';

const PAGE_LIMIT = 10;

/** Төлөв tab-ууд */
const STATUS_TABS: { value: string; labelKey: string }[] = [
  { value: '', labelKey: 'adminFilterAll' },
  { value: 'processing', labelKey: 'adminFilterProcessing' },
  { value: 'paid', labelKey: 'adminFilterApproved' },
  { value: 'failed', labelKey: 'adminFilterRejected' },
];

export default function AdminOrdersPage() {
  const t = useTranslations('payments');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = usePendingOrders({
    page,
    limit: PAGE_LIMIT,
    status: statusFilter || undefined,
  });

  const orders = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  /** Tab солих */
  const handleTabChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  /** Хэрэглэгчийн initials */
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(/[\s.]+/);
      return parts
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
    }
    return (email?.[0] || 'U').toUpperCase();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('adminPendingOrders')}
          </h1>
          <p className="text-slate-500 mt-1">
            {t('adminPendingOrdersSubtitle', { count: totalCount })}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    {t('adminUser')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    {t('adminCourse')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    {t('adminPayment')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                    {t('adminProof')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 text-right">
                    {t('action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-9 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="size-12 rounded-lg" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {getInitials(order.userName, order.userEmail)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{order.userName || '-'}</span>
                              <span className="text-xs text-slate-500">
                                {order.userEmail || '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {order.courseTitle || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            ₮{order.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <OrderStatusBadge status={order.status as OrderStatus} showDot />
                        </td>
                        <td className="px-6 py-4">
                          {order.proofImageUrl ? (
                            <div className="relative group cursor-pointer size-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img
                                src={order.proofImageUrl}
                                alt="Proof"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="size-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={ROUTES.ADMIN_ORDER_DETAIL(order.id)}
                            className="text-sm font-bold text-primary hover:text-primary/80 px-4 py-2 rounded-lg hover:bg-primary/5 transition-all"
                          >
                            {t('adminVerify')}
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {t('showingOf', { shown: orders.length, total: totalCount })}
              </span>
              {totalCount > PAGE_LIMIT && (
                <CoursesPagination
                  page={page}
                  total={totalCount}
                  limit={PAGE_LIMIT}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>

        {/* Empty state */}
        {!isLoading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Eye className="size-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {t('adminNoOrders')}
            </h3>
            <p className="text-sm text-slate-500">{t('adminNoOrdersDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
