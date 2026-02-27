'use client';

import { useTranslations } from 'next-intl';

/** "ЭСВЭЛ" текст бүхий хуваагч */
export function AuthDivider() {
  const t = useTranslations('common');

  return (
    <div className="flex items-center gap-4 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{t('or')}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
