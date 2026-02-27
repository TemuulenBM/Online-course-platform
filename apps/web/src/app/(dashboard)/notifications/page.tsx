'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useDeleteNotification,
} from '@/hooks/api';
import {
  NotificationItem,
  getNotificationLink,
} from '@/components/notifications/notification-item';
import {
  NotificationsFilterTabs,
  type NotificationsTab,
} from '@/components/notifications/notifications-filter-tabs';
import { NotificationsEmpty } from '@/components/notifications/notifications-empty';
import { NotificationsListSkeleton } from '@/components/notifications/notification-item-skeleton';
import { CoursesPagination } from '@/components/courses/courses-pagination';
import { ROUTES } from '@/lib/constants';

const PAGE_LIMIT = 10;

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<NotificationsTab>('all');
  const [page, setPage] = useState(1);

  const readFilter = activeTab === 'unread' ? false : undefined;

  const { data, isLoading } = useNotifications({
    page,
    limit: PAGE_LIMIT,
    read: readFilter,
  });

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();

  const notifications = data?.data ?? [];
  const totalCount = data?.total ?? 0;

  /** Tab солих */
  const handleTabChange = (tab: NotificationsTab) => {
    setActiveTab(tab);
    setPage(1);
  };

  /** Бүгдийг уншсан болгох */
  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => toast.success(t('allMarkedRead')),
    });
  };

  /** Нэг мэдэгдлийг уншсан болгох + navigate */
  const handleItemClick = (id: string) => {
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.read) {
      markRead.mutate(id);
    }
    if (notification) {
      const link = getNotificationLink(notification);
      if (link) router.push(link);
    }
  };

  /** Мэдэгдэл устгах */
  const handleDelete = (id: string) => {
    deleteNotification.mutate(id, {
      onSuccess: () => toast.success(t('deleted')),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('title')}</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF6B6B] text-white">
                {t('unreadCount', { count: unreadCount })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
                className="text-sm text-primary hover:text-[#7B84D9] font-semibold transition-colors disabled:opacity-50"
              >
                {t('markAllRead')}
              </button>
            )}
            <Link
              href={ROUTES.NOTIFICATION_PREFERENCES}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary font-medium transition-colors"
            >
              <Settings className="size-4" />
              {t('preferencesLink')}
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <NotificationsFilterTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Контент */}
        {isLoading ? (
          <NotificationsListSkeleton count={5} variant="full" />
        ) : notifications.length === 0 ? (
          <NotificationsEmpty filter={activeTab} />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                variant="full"
                onMarkRead={handleItemClick}
                onDelete={handleDelete}
                onClick={() => handleItemClick(notification.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination footer */}
        {!isLoading && totalCount > 0 && notifications.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-primary font-medium">
              {t('showingOf', {
                shown: notifications.length,
                total: totalCount,
              })}
            </p>
            {totalCount > PAGE_LIMIT && (
              <CoursesPagination
                page={page}
                total={totalCount}
                limit={PAGE_LIMIT}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
