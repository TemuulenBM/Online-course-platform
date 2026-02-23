'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/hooks/api';
import { NotificationItem, getNotificationLink } from './notification-item';
import { NotificationsListSkeleton } from './notification-item-skeleton';
import { ROUTES } from '@/lib/constants';

/** Header-ийн bell icon + unread badge + dropdown мэдэгдлийн жагсаалт */
export function NotificationBell() {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: notificationsData, isLoading } = useNotifications({ limit: 5 });
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const notifications = notificationsData?.data ?? [];

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllRead.mutate();
    }
  };

  const handleItemClick = (notificationId: string, link: string | null) => {
    markRead.mutate(notificationId);
    setOpen(false);
    if (link) {
      router.push(link);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors relative shrink-0">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                'absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-[#FF6B6B] text-white font-bold border-2 border-white dark:border-slate-900',
                unreadCount < 10 ? 'w-5 h-5 text-[10px]' : 'min-w-[20px] h-5 px-1 text-[9px]',
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('title')}</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-[#8A93E5] hover:text-[#7B84D9] font-medium transition-colors"
            >
              {t('markAllRead')}
            </button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Мэдэгдлүүдийн жагсаалт */}
        <div className="max-h-[360px] overflow-y-auto">
          {isLoading ? (
            <NotificationsListSkeleton count={3} variant="compact" />
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="size-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('empty')}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                variant="compact"
                onMarkRead={(id) => handleItemClick(id, getNotificationLink(notification))}
                onClick={() => handleItemClick(notification.id, getNotificationLink(notification))}
              />
            ))
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Footer */}
        <div className="px-4 py-3 text-center">
          <Link
            href={ROUTES.NOTIFICATIONS}
            onClick={() => setOpen(false)}
            className="text-sm text-[#8A93E5] hover:text-[#7B84D9] font-semibold transition-colors"
          >
            {t('seeAll')}
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
