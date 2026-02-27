'use client';

import { Pin, Lock, Flag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ModerationToolbarProps {
  isPinned: boolean;
  isLocked: boolean;
  isFlagged: boolean;
  onPin: () => void;
  onLock: () => void;
  onFlag: () => void;
  className?: string;
}

/** Модерацийн toolbar — TEACHER/ADMIN-д: Pin, Lock, Flag */
export function ModerationToolbar({
  isPinned,
  isLocked,
  isFlagged,
  onPin,
  onLock,
  onFlag,
  className,
}: ModerationToolbarProps) {
  const t = useTranslations('discussions');

  const items = [
    {
      icon: Pin,
      label: isPinned ? t('moderationUnpin') : t('moderationPin'),
      active: isPinned,
      onClick: onPin,
      activeClass: 'text-primary bg-primary/10',
    },
    {
      icon: Lock,
      label: isLocked ? t('moderationUnlock') : t('moderationLock'),
      active: isLocked,
      onClick: onLock,
      activeClass: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Flag,
      label: isFlagged ? t('moderationUnflag') : t('moderationFlag'),
      active: isFlagged,
      onClick: onFlag,
      activeClass: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          title={item.label}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            item.active
              ? item.activeClass
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600',
          )}
        >
          <item.icon className="size-3.5" />
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
