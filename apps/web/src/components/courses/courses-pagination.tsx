'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoursesPaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/** Courses жагсаалтын pagination */
export function CoursesPagination({ page, total, limit, onPageChange }: CoursesPaginationProps) {
  const totalPages = Math.ceil(total / limit) || 0;
  if (totalPages <= 1) return null;

  /** Харуулах хуудасны дугаарууд тооцоолох */
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className="flex justify-center items-center gap-2 mt-16">
      <button
        type="button"
        onClick={() => page > 1 && onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          'size-10 flex items-center justify-center rounded-xl transition-all',
          page <= 1
            ? 'bg-white dark:bg-slate-800 border border-primary/10 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'bg-white dark:bg-slate-800 border border-primary/10 text-slate-400 hover:text-primary cursor-pointer',
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {getPageNumbers().map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="text-slate-400 mx-1">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'size-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all cursor-pointer',
              p === page
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-800 border border-primary/10 text-slate-600 dark:text-slate-400 hover:text-primary',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => page < totalPages && onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'size-10 flex items-center justify-center rounded-xl transition-all',
          page >= totalPages
            ? 'bg-white dark:bg-slate-800 border border-primary/10 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'bg-white dark:bg-slate-800 border border-primary/10 text-slate-400 hover:text-primary cursor-pointer',
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
