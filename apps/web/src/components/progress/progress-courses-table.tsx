'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentWithCourse } from '@ocp/shared-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCourseProgress } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

interface ProgressCoursesTableProps {
  enrollments: EnrollmentWithCourse[];
}

/** Миний суралцаж буй сургалтуудын table */
export function ProgressCoursesTable({ enrollments }: ProgressCoursesTableProps) {
  const t = useTranslations('progress');

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-primary/10 overflow-hidden">
      <div className="px-6 py-4 border-b border-primary/5">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          {t('myCoursesTable')}
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-primary/5">
            <TableHead className="text-xs font-semibold text-slate-500 uppercase">
              {t('courseName')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">
              {t('type')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase">
              {t('progressCol')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">
              {t('status')}
            </TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">
              {t('lastUpdated')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => (
            <ProgressCourseRow key={enrollment.id} enrollment={enrollment} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Enrollment row — per-row progress fetch */
function ProgressCourseRow({ enrollment }: { enrollment: EnrollmentWithCourse }) {
  const t = useTranslations('progress');
  const { data: progress } = useCourseProgress(
    enrollment.status === 'active' || enrollment.status === 'completed' ? enrollment.courseId : '',
  );

  const percentage =
    enrollment.status === 'completed' ? 100 : (progress?.courseProgressPercentage ?? 0);

  const isCompleted = enrollment.status === 'completed';
  const courseSlug = enrollment.courseSlug || enrollment.courseId;

  return (
    <TableRow className="hover:bg-primary/5 border-primary/5 cursor-pointer">
      <TableCell>
        <Link href={ROUTES.COURSE_PROGRESS(courseSlug)} className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="size-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-1">
            {enrollment.courseTitle || enrollment.courseId}
          </span>
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge
          variant="outline"
          className="text-[10px] font-semibold border-primary/20 text-primary"
        >
          {t('type')}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="min-w-[100px]">
          <Progress value={percentage} className="h-2 mb-1" />
          <span className="text-xs text-slate-500 font-medium">{percentage}%</span>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {isCompleted ? (
          <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold">
            {t('completed')}
          </Badge>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('active')}
          </span>
        )}
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-xs text-slate-500">
          {new Date(enrollment.updatedAt).toLocaleDateString('mn-MN')}
        </span>
      </TableCell>
    </TableRow>
  );
}
