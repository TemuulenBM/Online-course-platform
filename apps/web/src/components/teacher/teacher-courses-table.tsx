'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Archive, BookOpen, Globe, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Course } from '@ocp/shared-types';
import { ROUTES } from '@/lib/constants';

/** Төлөв badge стиль */
const statusStyles: Record<string, string> = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  archived: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

interface TeacherCoursesTableProps {
  courses: Course[];
  onPublish: (courseId: string) => void;
  onArchive: (courseId: string) => void;
}

/** Багшийн сургалтуудын хүснэгт — шинэ дизайн */
export function TeacherCoursesTable({ courses, onPublish, onArchive }: TeacherCoursesTableProps) {
  const t = useTranslations('teacher');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('courseTitle')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('statusColumn')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('courseCategory')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('coursePrice')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('createdDate')}
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
              >
                {/* Гарчиг + thumbnail */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                      {course.thumbnailUrl ? (
                        <Image
                          src={course.thumbnailUrl}
                          alt={course.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="size-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-sm">{course.title}</span>
                  </div>
                </td>

                {/* Төлөв */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyles[course.status] || statusStyles.draft}`}
                  >
                    {course.status.toUpperCase()}
                  </span>
                </td>

                {/* Ангилал */}
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {course.categoryName || '-'}
                </td>

                {/* Үнэ */}
                <td className="px-6 py-4 text-sm font-medium">
                  {course.price && course.price > 0
                    ? `₮${course.price.toLocaleString()}`
                    : t('free')}
                </td>

                {/* Үүсгэсэн огноо */}
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(course.createdAt).toLocaleDateString('mn-MN')}
                </td>

                {/* Үйлдэл */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={ROUTES.TEACHER_COURSE_EDIT(course.id)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
                      title={t('edit')}
                    >
                      <Pencil className="size-4" />
                    </Link>
                    {course.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => onPublish(course.id)}
                        className="p-1.5 hover:bg-primary/10 rounded text-primary transition-colors"
                        title={t('publishCourse')}
                      >
                        <Globe className="size-4" />
                      </button>
                    )}
                    {course.status === 'published' && (
                      <button
                        type="button"
                        onClick={() => onArchive(course.id)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
                        title={t('archiveCourse')}
                      >
                        <Archive className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
