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

/** Breadcrumb навигац — Хичээлүүд > Ангилал */
export function CourseDetailHeader({ categoryName }: CourseDetailHeaderProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex items-center gap-3">
      <SidebarTrigger className="md:hidden" />
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={ROUTES.COURSES} className="hover:text-primary transition-colors">
          {t('title')}
        </Link>
        {categoryName && (
          <>
            <ChevronRight className="size-3" />
            <span className="text-primary font-medium">{categoryName}</span>
          </>
        )}
      </nav>
    </div>
  );
}
