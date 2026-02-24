'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface RoleFilterTabsProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const tabs = [
  { value: undefined, labelKey: 'allUsers' },
  { value: 'STUDENT', labelKey: 'students' },
  { value: 'TEACHER', labelKey: 'teachers' },
  { value: 'ADMIN', labelKey: 'admins' },
] as const;

export function RoleFilterTabs({ value, onChange }: RoleFilterTabsProps) {
  const t = useTranslations('admin');

  return (
    <div className="mb-6 flex gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.labelKey}
          variant={value === tab.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(tab.value as string | undefined)}
        >
          {t(tab.labelKey)}
        </Button>
      ))}
    </div>
  );
}
