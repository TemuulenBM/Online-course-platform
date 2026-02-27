'use client';

import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

/** Сертификат байхгүй үеийн empty state */
export function CertificatesEmpty() {
  const t = useTranslations('certificates');

  return (
    <div className="mt-12 py-16 px-6 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
      <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <Trophy className="size-10" />
      </div>
      <h3 className="text-xl font-bold mb-2">{t('noCertificates')}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">{t('noCertificatesDesc')}</p>
      <Button asChild size="lg" className="shadow-lg shadow-primary/25">
        <Link href={ROUTES.COURSES}>{t('browseCourses')}</Link>
      </Button>
    </div>
  );
}
