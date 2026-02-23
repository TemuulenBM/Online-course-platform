'use client';

import { Award, Download, Heart, Infinity, PlayCircle, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { CourseEnrollButton } from './course-enroll-button';

interface CourseSidebarMetaProps {
  course: Course;
}

/** Sticky sidebar — үнэ, элсэх товч, course includes, instructor card */
export function CourseSidebarMeta({ course }: CourseSidebarMetaProps) {
  const t = useTranslations('courses');
  const displayPrice = course.discountPrice ?? course.price;
  const isFree = !displayPrice || displayPrice === 0;
  const hasDiscount =
    course.discountPrice != null && course.price != null && course.discountPrice < course.price;
  const discountPercent =
    hasDiscount && course.price ? Math.round((1 - course.discountPrice! / course.price) * 100) : 0;
  const videoHours = Math.round((course.durationMinutes / 60) * 10) / 10;

  return (
    <div className="sticky top-6 flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      {/* Үнэ */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl font-black text-slate-900 dark:text-white">
          {isFree ? t('free') : `₮${displayPrice?.toLocaleString()}`}
        </span>
        {hasDiscount && (
          <>
            <span className="text-sm text-slate-400 line-through">
              ₮{course.price?.toLocaleString()}
            </span>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-md">
              {discountPercent}% {t('off')}
            </span>
          </>
        )}
      </div>

      {/* Элсэх товч */}
      <CourseEnrollButton courseId={course.id} isFree={isFree} />

      {/* Free Trial товч */}
      <button
        type="button"
        className="w-full border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-sm hover:border-[#8A93E5] hover:text-[#8A93E5] transition-colors"
      >
        {t('freeTrial')}
      </button>

      {/* Separator */}
      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* This course includes */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {t('courseIncludes')}
        </span>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <PlayCircle className="size-4 shrink-0 text-slate-500" />
          <span>{t('videoHours', { hours: videoHours })}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <Download className="size-4 shrink-0 text-slate-500" />
          <span>{t('downloadResources')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <Infinity className="size-4 shrink-0 text-slate-500" />
          <span>{t('lifetimeAccess')}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <Award className="size-4 shrink-0 text-slate-500" />
          <span>{t('certificateCompletion')}</span>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* Share + Heart + Guarantee */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-[#8A93E5] hover:text-[#8A93E5] transition-colors"
          >
            <Share2 className="size-4" />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:border-red-400 hover:text-red-400 transition-colors"
          >
            <Heart className="size-4" />
          </button>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {t('moneyBack')}
        </span>
      </div>

      {/* Separator */}
      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* Meet Instructor */}
      <div className="flex flex-col gap-4">
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {t('meetInstructor')}
        </span>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8A93E5] to-[#A78BFA] flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-white">
              {course.instructorName?.charAt(0) || '?'}
            </span>
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white">
              {course.instructorName || 'Instructor'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('seniorInstructor')}</p>
          </div>
        </div>

        {/* Instructor stats — static placeholder */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg py-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">24.5k</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('students')}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg py-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">15</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('title')}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg py-2">
            <p className="text-sm font-bold text-slate-900 dark:text-white">4.9</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Rating</p>
          </div>
        </div>

        {/* View Profile товч */}
        <button
          type="button"
          className="w-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium hover:border-[#8A93E5] hover:text-[#8A93E5] transition-colors"
        >
          {t('viewInstructorProfile')}
        </button>
      </div>
    </div>
  );
}
