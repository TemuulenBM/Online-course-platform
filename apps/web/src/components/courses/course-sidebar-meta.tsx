'use client';

import { BarChart3, Clock, Globe, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { CourseEnrollButton } from './course-enroll-button';

interface CourseSidebarMetaProps {
  course: Course;
}

/** Мета мөр */
function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

/** Sticky sidebar — үнэ, элсэх товч, мета мэдээлэл */
export function CourseSidebarMeta({ course }: CourseSidebarMetaProps) {
  const t = useTranslations('courses');
  const displayPrice = course.discountPrice ?? course.price;
  const isFree = !displayPrice || displayPrice === 0;
  const hasDiscount =
    course.discountPrice != null && course.price != null && course.discountPrice < course.price;

  return (
    <div className="sticky top-6 flex flex-col gap-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      {/* Үнэ */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-slate-900 dark:text-white">
          {isFree ? t('free') : `₮${displayPrice?.toLocaleString()}`}
        </span>
        {hasDiscount && (
          <span className="text-sm text-slate-400 line-through">
            ₮{course.price?.toLocaleString()}
          </span>
        )}
      </div>

      {/* Элсэх товч */}
      <CourseEnrollButton courseId={course.id} isFree={isFree} />

      {/* Мета мэдээлэл */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {course.instructorName && (
          <MetaRow icon={User} label={t('instructor')} value={course.instructorName} />
        )}
        <MetaRow icon={BarChart3} label={t('difficulty')} value={t(course.difficulty)} />
        <MetaRow
          icon={Clock}
          label={t('duration')}
          value={`${course.durationMinutes} ${t('minutes')}`}
        />
        <MetaRow icon={Globe} label={t('courseLanguage')} value={course.language} />
      </div>
    </div>
  );
}
