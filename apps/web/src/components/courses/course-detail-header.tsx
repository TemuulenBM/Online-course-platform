'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/constants';

interface CourseDetailHeaderProps {
  courseTitle: string;
}

/** Breadcrumb навигац — Сургалтууд > Сургалтын нэр */
export function CourseDetailHeader({ courseTitle }: CourseDetailHeaderProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex items-center gap-3">
      <SidebarTrigger className="md:hidden" />
      <nav className="flex items-center gap-1.5 text-sm font-medium">
        <Link href={ROUTES.COURSES} className="text-slate-500 hover:text-primary transition-colors">
          {t('title')}
        </Link>
        <ChevronRight className="size-4 text-slate-300" />
        <span className="text-slate-900 dark:text-white truncate max-w-[300px]">{courseTitle}</span>
      </nav>
    </div>
  );
}
