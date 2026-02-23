'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type NotificationsTab = 'all' | 'unread';

interface NotificationsFilterTabsProps {
  activeTab: NotificationsTab;
  onTabChange: (tab: NotificationsTab) => void;
}

const tabs: { value: NotificationsTab; labelKey: string }[] = [
  { value: 'all', labelKey: 'all' },
  { value: 'unread', labelKey: 'unread' },
];

/** All / Unread — underline стилийн tab шүүлтүүр */
export function NotificationsFilterTabs({ activeTab, onTabChange }: NotificationsFilterTabsProps) {
  const t = useTranslations('notifications');

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
