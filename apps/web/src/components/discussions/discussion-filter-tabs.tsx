'use client';

import { useTranslations } from 'next-intl';
import { FilterTabs } from '@/components/ui/filter-tabs';

interface DiscussionFilterTabsProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

/** Шүүлтүүрийн tab-ууд: Бүгд | Асуулт | Хэлэлцүүлэг */
export function DiscussionFilterTabs({ value, onChange }: DiscussionFilterTabsProps) {
  const t = useTranslations('discussions');

  const tabs = [
    { label: t('filterAll'), value: undefined as string | undefined },
    { label: t('filterQuestion'), value: 'question' as string | undefined },
    { label: t('filterDiscussion'), value: 'discussion' as string | undefined },
  ];

  return <FilterTabs tabs={tabs} activeValue={value} onChange={onChange} />;
}
