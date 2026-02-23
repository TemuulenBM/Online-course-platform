'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type MyCoursesTab = 'all' | 'active' | 'completed';

interface MyCoursesFilterTabsProps {
  activeTab: MyCoursesTab;
  onTabChange: (tab: MyCoursesTab) => void;
}

const tabs: { value: MyCoursesTab; labelKey: string }[] = [
  { value: 'active', labelKey: 'active' },
  { value: 'completed', labelKey: 'completed' },
  { value: 'all', labelKey: 'allCourses' },
];

/** Active / Completed / All Courses — underline стилийн tab шүүлтүүр */
export function MyCoursesFilterTabs({ activeTab, onTabChange }: MyCoursesFilterTabsProps) {
  const t = useTranslations('myCourses');

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <nav className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'pb-3 text-sm font-medium transition-all relative',
              activeTab === tab.value
                ? 'text-slate-900 dark:text-white font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            {t(tab.labelKey)}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8A93E5] rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
