'use client';

import { ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { EnrollmentStatus } from '@ocp/shared-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterValue = EnrollmentStatus | 'all';

interface EnrollmentStatusFilterProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

/** Элсэлтийн статус шүүлтүүрийн dropdown */
export function EnrollmentStatusFilter({ value, onChange }: EnrollmentStatusFilterProps) {
  const t = useTranslations('myCourses');

  return (
    <Select value={value} onValueChange={(v) => onChange(v as FilterValue)}>
      <SelectTrigger className="min-w-[200px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20">
        <SelectValue placeholder={t('allStatuses')} />
        <ChevronsUpDown className="size-4 text-slate-400" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="all">{t('allStatuses')}</SelectItem>
        <SelectItem value="active">{t('active')}</SelectItem>
        <SelectItem value="completed">{t('completed')}</SelectItem>
        <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
        <SelectItem value="expired">{t('expired')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
