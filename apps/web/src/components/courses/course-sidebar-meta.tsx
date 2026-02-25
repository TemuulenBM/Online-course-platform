'use client';

import { BadgeCheck, Calendar, Clock, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { CourseEnrollButton } from './course-enroll-button';

interface CourseSidebarMetaProps {
  course: Course;
}

/** Sticky sidebar — үнэ, мета, худалдаж авах/элсэх товч, сургах зүйлс */
export function CourseSidebarMeta({ course }: CourseSidebarMetaProps) {
  const t = useTranslations('courses');
  const displayPrice = course.discountPrice ?? course.price;
  const isFree = !displayPrice || displayPrice === 0;
  const hasDiscount =
    course.discountPrice != null && course.price != null && course.discountPrice < course.price;
  const discountPercent =
    hasDiscount && course.price ? Math.round((1 - course.discountPrice! / course.price) * 100) : 0;

  const videoHours = Math.floor(course.durationMinutes / 60);
  const videoMins = course.durationMinutes % 60;
  const durationText =
    videoHours > 0
      ? `${videoHours} ${t('hour')} ${videoMins} ${t('min')}`
      : `${videoMins} ${t('min')}`;

  const publishedDate = course.publishedAt
    ? new Date(course.publishedAt).toLocaleDateString('mn-MN')
    : '-';

  return (
    <div className="sticky top-24 space-y-6">
      {/* Үнэ карт */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-primary/5 border border-primary/10 ring-1 ring-primary/5">
        {/* Үнэ */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {isFree ? t('free') : `${displayPrice?.toLocaleString()}₮`}
          </span>
          {hasDiscount && (
            <>
              <span className="text-lg text-slate-400 line-through">
                {course.price?.toLocaleString()}₮
              </span>
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-auto">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        {/* Meta мөрүүд */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="size-4" />
              {t('duration')}
            </div>
            <span className="font-semibold">{durationText}</span>
          </div>
          <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500">
              <Globe className="size-4" />
              {t('language')}
            </div>
            <span className="font-semibold">{course.language || t('mongolian')}</span>
          </div>
          <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="size-4" />
              {t('publishedAt')}
            </div>
            <span className="font-semibold">{publishedDate}</span>
          </div>
        </div>

        {/* Худалдаж авах / Элсэх товчнууд */}
        <CourseEnrollButton courseId={course.id} isFree={isFree} />

        {/* Буцаан олголтын мэдэгдэл */}
        <p className="text-[11px] text-center text-slate-400 mt-4">{t('refundPolicy')}</p>
      </div>

      {/* Юу сурах вэ? карт */}
      <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/20">
        <h5 className="font-bold mb-4 text-sm text-primary uppercase tracking-wider">
          {t('whatYouLearn')}
        </h5>
        <div className="space-y-3">
          <div className="flex gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <BadgeCheck className="size-5 text-primary shrink-0" />
            <span>{t('learningBenefit1')}</span>
          </div>
          <div className="flex gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <BadgeCheck className="size-5 text-primary shrink-0" />
            <span>{t('learningBenefit2')}</span>
          </div>
          <div className="flex gap-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <BadgeCheck className="size-5 text-primary shrink-0" />
            <span>{t('learningBenefit3')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
