'use client';

import { FilterX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentStatus } from '@ocp/shared-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StatusFilter = EnrollmentStatus | 'all';
type SortOption = 'newest' | 'oldest';

interface StudentsFilterBarProps {
  statusFilter: StatusFilter;
  sortBy: SortOption;
  onStatusChange: (value: StatusFilter) => void;
  onSortChange: (value: SortOption) => void;
  onClear: () => void;
}

/** Оюутнуудын шүүлтүүр — status + sort + clear */
export function StudentsFilterBar({
  statusFilter,
  sortBy,
  onStatusChange,
  onSortChange,
  onClear,
}: StudentsFilterBarProps) {
  const t = useTranslations('enrollments');
  const tm = useTranslations('myCourses');

  const hasFilters = statusFilter !== 'all' || sortBy !== 'newest';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Status filter */}
        <div className="flex flex-col min-w-[200px]">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            {t('filterByStatus')}
          </label>
          <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{tm('active')}</SelectItem>
              <SelectItem value="completed">{tm('completed')}</SelectItem>
              <SelectItem value="cancelled">{tm('cancelled')}</SelectItem>
              <SelectItem value="expired">{tm('expired')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="flex flex-col min-w-[200px]">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            {t('sortBy')}
          </label>
          <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('newestFirst')}</SelectItem>
              <SelectItem value="oldest">{t('oldestFirst')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 text-slate-500 hover:text-primary text-sm font-medium px-4 py-2.5 transition-colors"
          >
            <FilterX className="size-4" />
            {t('clearFilters')}
          </button>
        )}
      </div>
    </div>
  );
}
