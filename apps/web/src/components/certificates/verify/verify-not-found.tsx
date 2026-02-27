'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Сертификат олдсонгүй алдааны state */
export function VerifyNotFound() {
  const t = useTranslations('certificates');

  return (
    <div className="flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl">
      <div className="flex items-center justify-center size-10 rounded-full bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-300 shrink-0">
        <AlertCircle className="size-5" />
      </div>
      <div className="flex flex-col">
        <p className="font-bold text-rose-800 dark:text-rose-200">{t('notFound')}</p>
        <p className="text-sm text-rose-600 dark:text-rose-400">{t('notFoundDesc')}</p>
      </div>
    </div>
  );
}
