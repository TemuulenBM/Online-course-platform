'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Receipt, CheckCircle, Clock, ChevronRight, HelpCircle } from 'lucide-react';
import { useMyInvoices } from '@/hooks/api';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ROUTES } from '@/lib/constants';

const PAGE_LIMIT = 10;

export default function InvoicesPage() {
  const t = useTranslations('payments');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useMyInvoices({ page, limit: PAGE_LIMIT });

  const invoices = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  /** Нэгтгэл тооцоолол */
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidCount = invoices.length;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Receipt className="size-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('myInvoices')}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border border-border">
            <p className="text-sm text-muted-foreground mb-2">{t('invoiceTotalAmount')}</p>
            <h3 className="text-2xl font-bold text-foreground">₮{totalAmount.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5" />
              {t('invoiceCount', { count: totalCount })}
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border">
            <p className="text-sm text-muted-foreground mb-2">{t('invoicePaidAmount')}</p>
            <h3 className="text-2xl font-bold text-foreground">₮{totalAmount.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-2 text-xs text-green-500 font-medium">
              <CheckCircle className="size-3.5" />
              {t('paidInvoices', { count: paidCount })}
            </div>
          </div>
          <div className="bg-primary p-6 rounded-2xl shadow-lg shadow-primary/20 flex flex-col justify-between">
            <div>
              <p className="text-sm text-white/80 mb-2">{t('invoiceLatestDate')}</p>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {invoices[0] ? new Date(invoices[0].createdAt).toLocaleDateString('sv-SE') : '-'}
              </h3>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-bold">{t('transactionHistory')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('invoiceNumber')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('courseOrLesson')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-32" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-40" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-4 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="group hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                          {invoice.courseTitle || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(invoice.createdAt).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="px-6 py-4 font-bold text-foreground">
                          ₮{invoice.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-[11px] font-bold rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                            {t('statusPaid')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={ROUTES.INVOICE_DETAIL(invoice.id)}>
                            <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalCount > 0 && (
            <div className="p-6 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('showingOf', { shown: invoices.length, total: totalCount })}
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
        {!isLoading && invoices.length === 0 && (
          <EmptyState
            icon={Receipt}
            title={t('noInvoices')}
            description={t('noInvoicesDescription')}
          />
        )}

        {/* Help */}
        {!isLoading && invoices.length > 0 && (
          <div className="flex items-center justify-between p-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-primary shadow-sm">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <p className="font-bold">{t('invoiceHelpTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('invoiceHelpDesc')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
