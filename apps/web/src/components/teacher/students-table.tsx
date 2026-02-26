'use client';

import { MoreVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Статус badge-ийн өнгө */
const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-primary/20 text-primary',
  cancelled: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  expired: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

interface StudentsTableProps {
  enrollments: EnrollmentWithCourse[];
  onViewDetails?: (enrollment: EnrollmentWithCourse) => void;
}

/** Нэрний эхний үсгүүдийг авах (avatar initials) */
function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Огноо форматлах */
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Оюутнуудын хүснэгт — дизайны дагуу */
export function StudentsTable({ enrollments, onViewDetails }: StudentsTableProps) {
  const t = useTranslations('enrollments');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-primary/10 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('studentName')}
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('emailAddress')}
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('status')}
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('enrolledDate')}
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('completedDate')}
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-primary/5">
            {enrollments.map((enrollment) => (
              <TableRow
                key={enrollment.id}
                className="hover:bg-primary/5 transition-colors border-0"
              >
                {/* Нэр + avatar */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      {getInitials(enrollment.userName)}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {enrollment.userName || '—'}
                    </span>
                  </div>
                </TableCell>

                {/* Имэйл */}
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm italic">
                  {enrollment.userEmail || '—'}
                </TableCell>

                {/* Статус badge */}
                <TableCell>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[enrollment.status] || statusStyles.active}`}
                  >
                    {enrollment.status}
                  </span>
                </TableCell>

                {/* Элссэн огноо */}
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                  {formatDate(enrollment.createdAt)}
                </TableCell>

                {/* Дуусгасан огноо */}
                <TableCell className="text-sm">
                  <span
                    className={
                      enrollment.completedAt
                        ? 'text-slate-600 dark:text-slate-400'
                        : 'text-slate-400 dark:text-slate-600'
                    }
                  >
                    {formatDate(enrollment.completedAt)}
                  </span>
                </TableCell>

                {/* Actions dropdown */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-primary transition-colors p-1"
                      >
                        <MoreVertical className="size-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails?.(enrollment)}>
                        {t('viewDetails')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
