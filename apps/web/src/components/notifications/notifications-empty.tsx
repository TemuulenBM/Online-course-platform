'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface NotificationsEmptyProps {
  filter?: 'all' | 'unread';
}

/** Мэдэгдэл хоосон үеийн state */
export function NotificationsEmpty({ filter = 'all' }: NotificationsEmptyProps) {
  const t = useTranslations('notifications');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 via-primary/70/10 to-slate-100 dark:from-primary/5 dark:via-primary/70/5 dark:to-slate-800 flex items-center justify-center mb-4">
        <Bell className="size-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
        {filter === 'unread' ? t('unreadEmpty') : t('empty')}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('emptySubtitle')}</p>
    </div>
  );
}
