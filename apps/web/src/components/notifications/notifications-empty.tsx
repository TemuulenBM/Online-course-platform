'use client';

import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/ui/empty-state';

interface NotificationsEmptyProps {
  filter?: 'all' | 'unread';
}

/** Мэдэгдэл хоосон үеийн state */
export function NotificationsEmpty({ filter = 'all' }: NotificationsEmptyProps) {
  const t = useTranslations('notifications');

  return (
    <EmptyState
      icon={Bell}
      title={filter === 'unread' ? t('unreadEmpty') : t('empty')}
      description={t('emptySubtitle')}
    />
  );
}
