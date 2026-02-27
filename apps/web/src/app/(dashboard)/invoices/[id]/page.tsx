'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Download, Printer, Share2, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import { useInvoiceDetail } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants';

export default function InvoiceDetailPage() {
  const t = useTranslations('payments');
  const params = useParams<{ id: string }>();
  const invoiceId = params.id;

  const { data: invoice, isLoading } = useInvoiceDetail(invoiceId);

  /** PDF татах */
  const handleDownloadPdf = () => {
    if (invoice?.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    }
  };

  /** Хэвлэх */
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[800px] mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500">{t('invoiceNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Header actions */}
      <div className="max-w-[800px] mx-auto mb-6 flex items-center justify-between">
        <Link
          href={ROUTES.INVOICES}
          className="flex items-center gap-2 text-primary font-medium text-sm hover:underline"
        >
          <ArrowLeft className="size-4" />
          {t('backToInvoices')}
        </Link>
        <div className="flex items-center gap-3">
          {invoice.pdfUrl && (
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 h-10 bg-primary text-white text-sm font-bold px-4 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Download className="size-4" />
              <span>{t('downloadPdf')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice document */}
      <div className="max-w-[800px] mx-auto bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none">
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-dashed border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold">
                {t('invoice')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                {t('invoiceOfficialDocument')}
              </p>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 self-start md:self-end">
                {t('statusPaid')}
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {t('invoiceNumberLabel')}:{' '}
                <span className="text-slate-900 dark:text-slate-100 font-bold">
                  {invoice.invoiceNumber}
                </span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                {t('invoiceDateLabel')}:{' '}
                <span className="text-slate-900 dark:text-slate-100 font-bold">
                  {new Date(invoice.createdAt).toLocaleDateString('mn-MN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Төлөгч & Нийлүүлэгч */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex flex-col gap-4">
            <h3 className="text-primary text-xs font-bold uppercase tracking-widest">
              {t('payer')}
            </h3>
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <User className="size-6" />
              </div>
              <div>
                <p className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight">
                  {invoice.userName || '-'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {invoice.userEmail || '-'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:items-end md:text-right">
            <h3 className="text-primary text-xs font-bold uppercase tracking-widest">
              {t('issuer')}
            </h3>
            <div>
              <p className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight">
                {t('companyName')}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('companyAddress')}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('companyEmail')}</p>
            </div>
          </div>
        </div>

        {/* Items хүснэгт */}
        <div className="p-8 md:p-12">
          <div className="w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('itemName')}
                  </th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                    {t('quantity')}
                  </th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    {t('unitPrice')}
                  </th>
                  <th className="px-4 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">
                    {t('total')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-100 font-semibold">
                        {invoice.courseTitle || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center text-slate-700 dark:text-slate-300">1</td>
                  <td className="px-4 py-6 text-right text-slate-700 dark:text-slate-300">
                    ₮{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-6 text-right font-bold text-slate-900 dark:text-slate-100">
                    ₮{invoice.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="px-8 md:px-12 pb-8 md:pb-12 flex flex-col items-end">
          <div className="w-full md:w-64 space-y-3">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="text-sm">{t('subtotal')}:</span>
              <span className="font-medium">₮{invoice.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span className="text-sm">{t('vatLabel')}:</span>
              <span className="font-medium">₮0</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('totalAmountLabel')}:
              </span>
              <span className="text-xl font-bold text-primary">
                ₮{invoice.amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 md:px-12 py-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="size-4" />
            <span>{t('invoiceVerified')}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
            >
              <Printer className="size-5" />
            </button>
            <button className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
              <Share2 className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
