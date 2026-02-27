'use client';

import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Сургалтад сертификат олгогдоогүй empty state */
export function CourseCertificatesEmpty() {
  const t = useTranslations('certificates');

  return (
    <div className="mt-8 py-16 bg-white dark:bg-slate-900 border border-dashed border-primary/30 rounded-2xl flex flex-col items-center text-center">
      <div className="w-24 h-24 mb-6 relative">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative w-full h-full bg-primary/5 rounded-full flex items-center justify-center text-primary/40">
          <CreditCard className="size-12" />
        </div>
      </div>
      <h3 className="text-lg font-bold mb-2">{t('noCoursesCertificates')}</h3>
      <p className="text-slate-500 max-w-xs text-sm">{t('noCoursesCertificatesDesc')}</p>
    </div>
  );
}
