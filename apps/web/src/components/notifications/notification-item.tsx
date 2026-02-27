'use client';

import { Bell, BookOpen, Award, CreditCard, MessageSquare, Trash2, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTimeAgo } from '@/lib/utils/format-time-ago';
import type { Notification } from '@/lib/api-services/notifications.service';
import { ROUTES } from '@/lib/constants';

interface NotificationItemProps {
  notification: Notification;
  variant?: 'compact' | 'full';
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

/** Мэдэгдлийн data талбараас тохирох icon сонгох */
function getNotificationIcon(notification: Notification) {
  const data = notification.data;
  if (data?.certificateId) return <Award className="size-4 text-emerald-500" />;
  if (data?.orderId) return <CreditCard className="size-4 text-amber-500" />;
  if (data?.postId) return <MessageSquare className="size-4 text-blue-500" />;
  if (data?.liveSessionId) return <Video className="size-4 text-rose-500" />;
  if (data?.courseId) return <BookOpen className="size-4 text-primary" />;
  return <Bell className="size-4 text-slate-400" />;
}

/** Мэдэгдлийн data-аас navigate хийх URL олох */
export function getNotificationLink(notification: Notification): string | null {
  const data = notification.data;
  if (data?.courseSlug) return ROUTES.COURSE_DETAIL(data.courseSlug as string);
  if (data?.courseId) return ROUTES.COURSE_DETAIL(data.courseId as string);
  return null;
}

/** Дан мэдэгдлийн item — dropdown (compact) болон page (full) дахин ашиглана */
export function NotificationItem({
  notification,
  variant = 'compact',
  onMarkRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const isCompact = variant === 'compact';

  const handleClick = () => {
    if (!notification.read && onMarkRead) {
      onMarkRead(notification.id);
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 cursor-pointer transition-colors',
        isCompact ? 'px-4 py-3' : 'p-4 rounded-2xl border',
        notification.read
          ? isCompact
            ? 'hover:bg-slate-50'
            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-sm'
          : isCompact
            ? 'bg-primary/5'
            : 'bg-primary/5 border-primary/20 border-l-2 border-l-primary',
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        {getNotificationIcon(notification)}
      </div>

      {/* Контент */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm',
            notification.read
              ? 'font-medium text-slate-600 dark:text-slate-400'
              : 'font-semibold text-slate-900 dark:text-white',
          )}
        >
          {notification.title}
        </p>
        <p
          className={cn(
            'text-xs text-slate-500 dark:text-slate-400 mt-0.5',
            isCompact ? 'line-clamp-1' : 'line-clamp-2',
          )}
        >
          {notification.message}
        </p>
        <span className="text-xs text-slate-400 mt-1 block">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Баруун хэсэг: unread dot + delete */}
      <div className="flex items-center gap-2 shrink-0 pt-1">
        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full" />}
        {!isCompact && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
