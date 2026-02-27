'use client';

import Image from 'next/image';
import { BookOpen, CheckCircle, PlayCircle, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';

interface CourseHeroProps {
  course: Course;
}

/** Сургалтын дэлгэрэнгүй hero — video, badge, title, instructor, тайлбар, сургах зүйлс, tags */
export function CourseHero({ course }: CourseHeroProps) {
  const t = useTranslations('courses');

  return (
    <div className="space-y-6">
      {/* Video / Thumbnail preview */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl ring-1 ring-primary/10 relative group">
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
          <PlayCircle className="size-16 text-white" />
        </div>
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <BookOpen className="size-16 text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </div>

      {/* Badge мөр */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
          {t(course.difficulty)}
        </span>
        {course.categoryName && (
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
            {course.categoryName}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
        {course.title}
      </h1>

      {/* Instructor + Rating мөр */}
      <div className="flex items-center gap-4 py-2">
        {course.instructorName && (
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {course.instructorName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('instructor')}</p>
              <p className="text-sm font-bold">{course.instructorName}</p>
            </div>
          </div>
        )}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="size-4 fill-current" />
          <span className="font-bold text-slate-900 dark:text-slate-100">4.8</span>
          <span className="text-slate-400 text-xs">(128 {t('reviews')})</span>
        </div>
      </div>

      {/* Хичээлийн тухай */}
      <div className="prose dark:prose-invert max-w-none">
        <h3 className="text-xl font-bold mb-3">{t('aboutCourse')}</h3>
        <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {course.description.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Сургах зүйлс жагсаалт */}
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 list-none pl-0">
          <li className="flex items-start gap-2 text-sm">
            <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
            {t('learningOutcome1')}
          </li>
          <li className="flex items-start gap-2 text-sm">
            <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
            {t('learningOutcome2')}
          </li>
          <li className="flex items-start gap-2 text-sm">
            <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
            {t('learningOutcome3')}
          </li>
          <li className="flex items-start gap-2 text-sm">
            <CheckCircle className="size-4 text-primary shrink-0 mt-0.5" />
            {t('learningOutcome4')}
          </li>
        </ul>
      </div>

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <div className="pt-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">
            {t('tagsHeading')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-medium text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
