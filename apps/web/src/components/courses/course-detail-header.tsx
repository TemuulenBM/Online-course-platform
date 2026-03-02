'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/constants';

interface CourseDetailHeaderProps {
  courseTitle: string;
  categoryName?: string;
}

/** Breadcrumb навигац — Хичээлүүд > Ангилал > Сургалтын нэр */
export function CourseDetailHeader({ courseTitle, categoryName }: CourseDetailHeaderProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex items-center gap-3">
      <SidebarTrigger className="md:hidden" />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={ROUTES.COURSES} className="hover:text-primary transition-colors">
          {t('title')}
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span className="hover:text-primary transition-colors">{categoryName}</span>
          </>
        )}
        {courseTitle && (
          <>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span
              className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[300px]"
              title={courseTitle}
            >
              {courseTitle}
            </span>
          </>
        )}
      </nav>
    </div>
  );
}
