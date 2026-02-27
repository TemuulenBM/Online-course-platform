'use client';

import { CheckCircle, Download, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Certificate } from '@ocp/shared-types';

interface VerifyResultProps {
  certificate: Certificate;
}

/** Баталгаажуулалт амжилттай — сертификатын мэдээлэл */
export function VerifyResult({ certificate }: VerifyResultProps) {
  const t = useTranslations('certificates');

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold tracking-tight">{t('verificationResult')}</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="size-3.5" />
          <span>{t('verified')}</span>
        </div>
      </div>

      {/* Certificate Detail Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="p-8 md:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                {t('student')}
              </p>
              <h3 className="text-2xl font-bold">{certificate.userName}</h3>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-primary uppercase tracking-widest">
                {t('courseName')}
              </p>
              <h4 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {certificate.courseTitle}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('number')}
                </p>
                <p className="font-mono text-slate-700 dark:text-slate-300">
                  {certificate.certificateNumber}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {t('issuedDate')}
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-300">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Badge side */}
          <div className="bg-primary/5 dark:bg-primary/10 p-8 flex flex-col items-center justify-center text-center border-l border-primary/10">
            <div className="size-24 rounded-full bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center mb-4">
              <Award className="size-12 text-primary" />
            </div>
            <p className="text-sm font-semibold text-primary mb-2">{t('officialCertificate')}</p>
            {certificate.pdfUrl && (
              <button
                type="button"
                onClick={() => window.open(certificate.pdfUrl!, '_blank')}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
              >
                <Download className="size-3.5" />
                <span>{t('downloadPdf')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
