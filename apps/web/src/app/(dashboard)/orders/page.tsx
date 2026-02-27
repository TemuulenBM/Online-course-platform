'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Palette,
  Code,
  Database,
  Languages,
  Brain,
} from 'lucide-react';
import { useMyOrders } from '@/hooks/api';
import { OrderStatusBadge } from '@/components/payments/order-status-badge';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';
import type { Order, OrderStatus } from '@ocp/shared-types';

const PAGE_LIMIT = 10;

/** Курс icon-ны хялбар mapping */
const courseIcons = [Palette, Code, Database, Languages, Brain];

/** Төлөв шүүлтүүрийн сонголтууд */
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'filterAll' },
  { value: 'paid', label: 'statusPaid' },
  { value: 'pending', label: 'statusPending' },
  { value: 'processing', label: 'statusProcessing' },
  { value: 'failed', label: 'statusFailed' },
  { value: 'refunded', label: 'statusRefunded' },
];

/** Icon-ны background өнгөнүүд */
const iconBgColors = [
  'bg-primary/10 text-primary',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-rose-100 text-rose-600',
];

export default function OrdersPage() {
  const t = useTranslations('payments');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useMyOrders({
    page,
    limit: PAGE_LIMIT,
    status: statusFilter || undefined,
  });

  const orders = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  /** Нэгтгэл тоо тооцоолох */
  const totalSpent = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount, 0);
  const paidCount = orders.filter((o) => o.status === 'paid').length;
  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'processing',
  ).length;

  /** Үйлдлийн товч */
  const getActionText = (order: Order) => {
    if (order.status === 'paid') return t('viewInvoice');
    if (order.status === 'pending' || order.status === 'processing') return t('pay');
    return t('details');
  };

  const getActionLink = (order: Order) => {
    if (order.status === 'paid' && order.invoiceId) {
      return ROUTES.INVOICE_DETAIL(order.invoiceId);
    }
    return ROUTES.ORDER_DETAIL(order.id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              {t('myOrders')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">{t('myOrdersSubtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative min-w-[180px]">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">
                {t('filterStatus')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('courseOrLesson')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('date')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    {t('action')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-10 rounded" />
                            <Skeleton className="h-4 w-40" />
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-5">
                          <Skeleton className="h-6 w-24 mx-auto rounded-full" />
                        </td>
                        <td className="px-6 py-5">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-5">
                          <Skeleton className="h-4 w-20 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : orders.map((order, index) => {
                      const IconComponent = courseIcons[index % courseIcons.length];
                      const iconColor = iconBgColors[index % iconBgColors.length];
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-10 rounded flex items-center justify-center ${iconColor}`}
                              >
                                <IconComponent className="size-5" />
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {order.courseTitle || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="font-medium">₮{order.amount.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <OrderStatusBadge status={order.status as OrderStatus} />
                          </td>
                          <td className="px-6 py-5 text-slate-500 dark:text-slate-400 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('sv-SE')}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <Link
                              href={getActionLink(order)}
                              className="text-primary hover:text-primary/80 font-medium text-sm"
                            >
                              {getActionText(order)}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="px-6 py-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/20">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('showingOf', { shown: orders.length, total: totalCount })}
              </p>
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
              <CreditCard className="size-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {t('noOrders')}
            </h3>
            <p className="text-sm text-slate-500">{t('noOrdersDescription')}</p>
          </div>
        )}

        {/* Summary cards */}
        {!isLoading && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CreditCard className="size-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('totalSpent')}
                </p>
                <p className="text-xl font-extrabold">₮{totalSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                <CheckCircle className="size-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('confirmedOrders')}
                </p>
                <p className="text-xl font-extrabold">
                  {t('confirmedCount', { count: paidCount })}
                </p>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
              <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('pendingOrders')}
                </p>
                <p className="text-xl font-extrabold">
                  {t('pendingCount', { count: pendingCount })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
