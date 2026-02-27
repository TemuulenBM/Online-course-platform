'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';

/** Баталгаажуулалт хуудасны header — Лого + навигаци + Нэвтрэх товч */
export function VerifyHeader() {
  const t = useTranslations('certificates');

  return (
    <header className="flex items-center justify-between border-b border-primary/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md px-6 md:px-20 py-4 sticky top-0 z-50">
      <Link href={ROUTES.HOME} className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white">
          <GraduationCap className="size-5" />
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight">Learnify</h2>
      </Link>
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href={ROUTES.COURSES}
            className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
          >
            {t('courses')}
          </Link>
          <Link
            href="#"
            className="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
          >
            {t('about')}
          </Link>
        </nav>
        <Button asChild size="sm" className="shadow-lg shadow-primary/20">
          <Link href={ROUTES.LOGIN}>{t('login')}</Link>
        </Button>
      </div>
    </header>
  );
}
