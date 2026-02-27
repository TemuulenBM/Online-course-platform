'use client';

import { GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Certificate } from '@ocp/shared-types';

interface CertificatePreviewProps {
  certificate: Certificate;
}

/** Визуал сертификат карт — дэлгэрэнгүй хуудаст */
export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const t = useTranslations('certificates');

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-primary/20">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -ml-24 -mb-24" />

      <div className="m-4 md:m-8 p-8 md:p-16 flex flex-col items-center text-center relative z-10 border-[12px] border-primary/10 bg-clip-padding">
        {/* Logo / Header */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
            <GraduationCap className="size-8" />
          </div>
          <h3 className="text-primary font-bold tracking-[0.2em] text-sm md:text-base">
            LEARNIFY ACADEMY
          </h3>
          <div className="h-px w-24 bg-primary/30" />
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
          {t('certificateOfCompletion')}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">{t('certifyThat')}</p>

        <h2 className="text-2xl md:text-4xl font-bold text-primary mb-8 italic">
          {certificate.userName}
        </h2>

        <p className="text-slate-500 dark:text-slate-400 text-lg mb-2 max-w-2xl">
          {t('completedCourse')}
        </p>

        <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-12">
          {certificate.courseTitle}
        </h3>

        {/* Verification Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 w-full items-end gap-8 mt-4 border-t border-slate-100 dark:border-slate-800 pt-10">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
              {t('issuedDate')}
            </p>
            <p className="text-slate-800 dark:text-slate-200 font-medium">{formattedDate}</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            {certificate.qrCodeUrl ? (
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <img
                  alt="QR code"
                  src={certificate.qrCodeUrl}
                  className="w-20 h-20 object-contain"
                />
              </div>
            ) : (
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm w-24 h-24 flex items-center justify-center">
                <div className="size-16 bg-slate-100 rounded animate-pulse" />
              </div>
            )}
            <p className="text-slate-400 text-[10px] uppercase tracking-tighter">Scan to verify</p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
              {t('certificateNumber')}
            </p>
            <p className="text-slate-800 dark:text-slate-200 font-medium">
              #{certificate.certificateNumber}
            </p>
          </div>
        </div>

        {/* Signatures */}
        <div className="flex justify-between w-full mt-16 px-4 md:px-10">
          <div className="flex flex-col items-center">
            <div className="h-12 w-32 border-b border-slate-300 mb-2 flex items-center justify-center">
              <span className="font-serif italic text-slate-400 text-xl">Signature</span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">{t('executiveDirector')}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-32 border-b border-slate-300 mb-2 flex items-center justify-center">
              <span className="font-serif italic text-slate-400 text-xl">Signature</span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase">{t('courseManager')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
