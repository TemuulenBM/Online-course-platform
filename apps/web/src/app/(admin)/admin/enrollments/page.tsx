'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/constants';

/** Admin элсэлтүүдийн жагсаалт — placeholder хуудас */
export default function AdminEnrollmentsPage() {
  const t = useTranslations('enrollments');
  const ta = useTranslations('admin');

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-3xl font-bold text-foreground">{ta('enrollments')}</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-primary/30">
          <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <GraduationCap className="size-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {t('enrollmentsList')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
            {t('enrollmentsListDesc')}
          </p>
          <Link
            href={ROUTES.TEACHER_COURSES}
            className="mt-6 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
          >
            {t('students')}
          </Link>
        </div>
      </div>
    </div>
  );
}
