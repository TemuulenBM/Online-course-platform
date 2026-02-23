'use client';

import { useTranslations } from 'next-intl';
import type { Category } from '@ocp/shared-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoursesFilterBarProps {
  categoryId?: string;
  difficulty?: string;
  sortBy?: string;
  sortOrder?: string;
  categories?: Category[];
  onFilterChange: (key: string, value: string | undefined) => void;
}

/** Ангилал, түвшин, эрэмбэ шүүлтүүр */
export function CoursesFilterBar({
  categoryId,
  difficulty,
  sortBy,
  sortOrder,
  categories,
  onFilterChange,
}: CoursesFilterBarProps) {
  const t = useTranslations('courses');

  /** Sort утга нэгтгэх */
  const sortValue = sortBy && sortOrder ? `${sortBy}:${sortOrder}` : 'publishedAt:desc';

  const handleSortChange = (value: string) => {
    if (value === 'all') {
      onFilterChange('sortBy', undefined);
      onFilterChange('sortOrder', undefined);
      return;
    }
    const [newSortBy, newSortOrder] = value.split(':');
    onFilterChange('sortBy', newSortBy);
    onFilterChange('sortOrder', newSortOrder);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Ангилал */}
      <Select
        value={categoryId || 'all'}
        onValueChange={(v) => onFilterChange('categoryId', v === 'all' ? undefined : v)}
      >
        <SelectTrigger className="rounded-full px-4 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium min-w-[150px]">
          <SelectValue placeholder={t('allCategories')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCategories')}</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
              {cat.children && cat.children.length > 0 ? ` (${cat.coursesCount ?? 0})` : ''}
            </SelectItem>
          ))}
          {/* Дэд ангиллууд */}
          {categories?.flatMap((cat) =>
            (cat.children ?? []).map((child) => (
              <SelectItem key={child.id} value={child.id} className="pl-6">
                {child.name}
              </SelectItem>
            )),
          )}
        </SelectContent>
      </Select>

      {/* Түвшин */}
      <Select
        value={difficulty || 'all'}
        onValueChange={(v) => onFilterChange('difficulty', v === 'all' ? undefined : v)}
      >
        <SelectTrigger className="rounded-full px-4 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium min-w-[140px]">
          <SelectValue placeholder={t('allDifficulty')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allDifficulty')}</SelectItem>
          <SelectItem value="beginner">{t('beginner')}</SelectItem>
          <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
          <SelectItem value="advanced">{t('advanced')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Эрэмбэ */}
      <Select value={sortValue} onValueChange={handleSortChange}>
        <SelectTrigger className="rounded-full px-4 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium min-w-[130px]">
          <SelectValue placeholder={t('sortBy')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="publishedAt:desc">{t('newest')}</SelectItem>
          <SelectItem value="publishedAt:asc">{t('popular')}</SelectItem>
          <SelectItem value="price:asc">{t('priceAsc')}</SelectItem>
          <SelectItem value="price:desc">{t('priceDesc')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
