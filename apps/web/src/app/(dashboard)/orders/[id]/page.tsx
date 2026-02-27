'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Info,
  Upload,
  CloudUpload,
  Send,
  CheckCircle,
  Download,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrderDetail, useUploadProof } from '@/hooks/api';
import { OrderStatusBadge } from '@/components/payments/order-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

export default function OrderDetailPage() {
  const t = useTranslations('payments');
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const { data: order, isLoading } = useOrderDetail(orderId);
  const uploadProof = useUploadProof();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Файл сонгох */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /** Баримт илгээх */
  const handleSubmitProof = () => {
    if (!selectedFile) return;
    uploadProof.mutate(
      { id: orderId, file: selectedFile },
      {
        onSuccess: () => {
          toast.success(t('proofUploaded'));
          setSelectedFile(null);
          setPreviewUrl(null);
        },
        onError: () => {
          toast.error(t('proofUploadError'));
        },
      },
    );
  };

  /** Drag & drop */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  /** Upload хэсэг харуулах эсэх */
  const canUpload = order?.status === 'pending' || order?.status === 'processing';

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Буцах */}
        <div className="mb-8">
          <Link
            href={ROUTES.ORDERS}
            className="flex items-center gap-2 text-primary font-medium text-sm hover:underline mb-1"
          >
            <ArrowLeft className="size-4" />
            {t('backToOrders')}
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('orderInfo')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{t('orderInfoSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Зүүн 2/3 — Мэдээлэл + Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Үндсэн мэдээлэл */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-bold flex items-center gap-2">
                  <Info className="size-5 text-primary" />
                  {t('basicInfo')}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">{t('orderNumber')}</span>
                      <span className="font-semibold">#{order?.id?.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">{t('courseName')}</span>
                      <span className="font-semibold">{order?.courseTitle || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">
                        {t('totalAmountLabel')}
                      </span>
                      <span className="font-bold text-lg text-primary">
                        ₮{order?.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500 dark:text-slate-400">{t('status')}</span>
                      {order && <OrderStatusBadge status={order.status} />}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upload хэсэг */}
            {!isLoading && canUpload && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <Upload className="size-5 text-primary" />
                    {t('uploadProofTitle')}
                  </h3>
                </div>
                <div className="p-8">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-primary/20 rounded-xl p-10 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center gap-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 rounded-lg border border-slate-200"
                        />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {selectedFile?.name}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center mb-4">
                          <CloudUpload className="size-8 text-primary" />
                        </div>
                        <h4 className="font-bold text-lg mb-1">{t('uploadArea')}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
                          {t('uploadAreaNote')}
                        </p>
                        <span className="px-6 py-2 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30">
                          {t('selectFile')}
                        </span>
                        <p className="mt-4 text-xs text-slate-400 uppercase tracking-widest font-medium">
                          {t('uploadFormats')}
                        </p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {selectedFile && (
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleSubmitProof}
                        disabled={uploadProof.isPending}
                        className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all disabled:opacity-50"
                      >
                        <span>{t('submitProof')}</span>
                        <Send className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Аль хэдийн upload хийсэн баримт */}
            {!isLoading && order?.proofImageUrl && (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold flex items-center gap-2">
                    <CheckCircle className="size-5 text-green-500" />
                    {t('uploadedProof')}
                  </h3>
                </div>
                <div className="p-6">
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img
                      src={order.proofImageUrl}
                      alt="Payment proof"
                      className="w-full h-auto max-h-[400px] object-contain bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Баруун 1/3 — Заавар + Холбоосууд */}
          <div className="space-y-6">
            {/* Заавар карт */}
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-xl p-6 text-white shadow-xl shadow-primary/20">
              <h4 className="font-bold text-lg mb-3">{t('instructions')}</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li className="flex gap-2">
                  <CheckCircle className="size-4 shrink-0 mt-0.5" />
                  <span>
                    {t('instructionTransferNote', {
                      orderId: `#${order?.id?.slice(0, 8).toUpperCase() || '...'}`,
                    })}
                  </span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{t('instructionBankInfo')}</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{t('instructionAutoActivate')}</span>
                </li>
              </ul>
            </div>

            {/* Хэрэгтэй холбоосууд */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h4 className="font-bold mb-4">{t('usefulLinks')}</h4>
              <div className="space-y-2">
                {order?.invoiceId && (
                  <Link
                    href={ROUTES.INVOICE_DETAIL(order.invoiceId)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <span className="text-sm font-medium">{t('downloadInvoice')}</span>
                    <Download className="size-4 text-slate-400 group-hover:text-primary" />
                  </Link>
                )}
                <Link
                  href={ROUTES.ORDERS}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-sm font-medium">{t('allOrders')}</span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-primary" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
