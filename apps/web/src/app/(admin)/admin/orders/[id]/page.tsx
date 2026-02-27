'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Info, Receipt, CheckCircle, XCircle, ZoomIn, History, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderDetail, useApproveOrder, useRejectOrder } from '@/hooks/api';
import { OrderStatusBadge } from '@/components/payments/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

export default function AdminOrderDetailPage() {
  const t = useTranslations('payments');
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const { data: order, isLoading } = useOrderDetail(orderId);
  const approveOrder = useApproveOrder();
  const rejectOrder = useRejectOrder();

  const [approveNote, setApproveNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  /** Зөвшөөрөх */
  const handleApprove = () => {
    approveOrder.mutate(
      { id: orderId, adminNote: approveNote || undefined },
      {
        onSuccess: () => {
          toast.success(t('adminOrderApproved'));
          router.push(ROUTES.ADMIN_ORDERS);
        },
        onError: () => {
          toast.error(t('adminOrderApproveError'));
        },
      },
    );
  };

  /** Татгалзах */
  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error(t('adminRejectReasonRequired'));
      return;
    }
    rejectOrder.mutate(
      { id: orderId, reason: rejectReason },
      {
        onSuccess: () => {
          toast.success(t('adminOrderRejected'));
          router.push(ROUTES.ADMIN_ORDERS);
        },
        onError: () => {
          toast.error(t('adminOrderRejectError'));
        },
      },
    );
  };

  /** Approve/reject боломжтой эсэх */
  const canAction = order?.status === 'pending' || order?.status === 'processing';

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mb-4">
            <Link href={ROUTES.ADMIN_ORDERS} className="hover:text-primary transition-colors">
              {t('adminOrders')}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-primary font-medium">{t('adminOrderDetail')}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    {t('adminOrderTitle', {
                      id: `#${order?.id?.slice(0, 8).toUpperCase()}`,
                    })}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">{t('adminOrderCheckDesc')}</p>
                </>
              )}
            </div>
            {!isLoading && order && <OrderStatusBadge status={order.status} showDot />}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Зүүн 2/3 — Мэдээлэл + Баримт */}
          <div className="lg:col-span-2 space-y-6">
            {/* Үндсэн мэдээлэл */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="size-5 text-primary" />
                {t('basicInfo')}
              </h3>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex justify-between pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('adminStudent')}</span>
                    <span className="font-medium">{order?.userName || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('adminEmail')}</span>
                    <span className="font-medium">{order?.userEmail || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t('adminPaymentAmount')}
                    </span>
                    <span className="font-bold text-primary">
                      ₮{order?.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('date')}</span>
                    <span className="font-medium text-right">
                      {order
                        ? new Date(order.createdAt).toLocaleString('sv-SE', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">{t('adminCourse')}</span>
                    <span className="font-medium">{order?.courseTitle || '-'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      {t('adminPaymentMethod')}
                    </span>
                    <span className="font-medium">{order?.paymentMethod || t('bankTransfer')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Баримт зураг */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Receipt className="size-5 text-primary" />
                {t('adminPaymentProof')}
              </h3>
              {isLoading ? (
                <Skeleton className="w-full h-[400px] rounded-lg" />
              ) : order?.proofImageUrl ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <img
                    alt="Payment Receipt"
                    className="w-full h-auto object-contain max-h-[600px]"
                    src={order.proofImageUrl}
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => window.open(order.proofImageUrl!, '_blank')}
                      className="bg-white/90 dark:bg-slate-900/90 p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                      <ZoomIn className="size-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <p>{t('adminNoProof')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Баруун 1/3 — Admin Actions */}
          <div className="space-y-6">
            {/* Зөвшөөрөх */}
            {canAction && (
              <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="size-5" />
                  {t('adminApprove')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('adminNote')}
                    </label>
                    <textarea
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-primary focus:ring-primary text-sm min-h-[100px] p-3"
                      placeholder={t('adminApprovePlaceholder')}
                    />
                  </div>
                  <button
                    onClick={handleApprove}
                    disabled={approveOrder.isPending}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <CheckCircle className="size-5" />
                    {t('adminApprove')}
                  </button>
                </div>
              </div>
            )}

            {/* Татгалзах */}
            {canAction && (
              <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border-l-4 border-l-rose-500 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <XCircle className="size-5" />
                  {t('adminReject')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('adminRejectReason')}
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:border-rose-500 focus:ring-rose-500 text-sm min-h-[100px] p-3"
                      placeholder={t('adminRejectPlaceholder')}
                    />
                  </div>
                  <button
                    onClick={handleReject}
                    disabled={rejectOrder.isPending}
                    className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50"
                  >
                    <XCircle className="size-5" />
                    {t('adminReject')}
                  </button>
                </div>
              </div>
            )}

            {/* Аль хэдийн шийдвэрлэгдсэн */}
            {!isLoading && !canAction && order && (
              <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-2">{t('adminAlreadyProcessed')}</h3>
                <p className="text-sm text-slate-500">{t('adminAlreadyProcessedDesc')}</p>
                {order.adminNote && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                    <span className="font-medium">{t('adminNote')}: </span>
                    {order.adminNote}
                  </div>
                )}
              </div>
            )}

            {/* Audit info */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-start gap-3">
                <History className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {t('adminAuditTitle')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('adminAuditDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
