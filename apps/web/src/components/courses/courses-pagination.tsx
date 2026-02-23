'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoursesPaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

/** Courses жагсаалтын pagination — Stitch стиль */
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
    <nav className="flex justify-center items-center gap-2 mt-8">
      {/* Previous */}
      <button
        type="button"
        onClick={() => page > 1 && onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          'w-10 h-10 rounded-lg border flex items-center justify-center transition-all',
          page <= 1
            ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#8A93E5] hover:text-[#8A93E5] cursor-pointer',
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((p, idx) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-10 h-10 flex items-center justify-center text-slate-400"
          >
            <MoreHorizontal className="size-4" />
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'w-10 h-10 rounded-lg text-sm font-semibold flex items-center justify-center transition-all cursor-pointer',
              p === page
                ? 'bg-[#8A93E5] text-white shadow-md shadow-[#8A93E5]/25'
                : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#8A93E5] hover:text-[#8A93E5]',
            )}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        type="button"
        onClick={() => page < totalPages && onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'w-10 h-10 rounded-lg border flex items-center justify-center transition-all',
          page >= totalPages
            ? 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#8A93E5] hover:text-[#8A93E5] cursor-pointer',
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
