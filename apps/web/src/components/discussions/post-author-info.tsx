'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getFileUrl } from '@/lib/utils';

interface PostAuthorInfoProps {
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  badge?: string;
  size?: 'sm' | 'md';
}

/** Зохиогчийн мэдээлэл — Avatar + нэр + цаг + badge */
export function PostAuthorInfo({
  authorName,
  authorAvatar,
  createdAt,
  badge,
  size = 'sm',
}: PostAuthorInfoProps) {
  const avatarSize = size === 'sm' ? 'size-6' : 'size-8';
  const initial = authorName?.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex items-center gap-2">
      <Avatar className={avatarSize}>
        <AvatarImage src={getFileUrl(authorAvatar)} alt={authorName || ''} />
        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-xs font-bold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
        {authorName || 'User'}
      </span>
      {badge && (
        <Badge
          variant="secondary"
          className="bg-primary/15 text-primary border-0 text-[10px] font-bold px-1.5 py-0"
        >
          {badge}
        </Badge>
      )}
      <span className="text-xs text-slate-400">{formatTimeAgo(createdAt)}</span>
    </div>
  );
}

/** Хугацааг харьцангуй текст болгох */
export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Дөнгөж сая';
  if (mins < 60) return `${mins} минутын өмнө`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} цагийн өмнө`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} өдрийн өмнө`;
  if (days < 30) return `${Math.floor(days / 7)} долоо хоногийн өмнө`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} сарын өмнө`;
  return `${Math.floor(months / 12)} жилийн өмнө`;
}
