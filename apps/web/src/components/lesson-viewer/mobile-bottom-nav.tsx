'use client';

import { BookOpen, Search, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Мобайл доод навигаци — зөвхөн lg-ээс доош дэлгэцэнд харагдана */
export function MobileBottomNav() {
  const t = useTranslations('lessonViewer');

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-2 flex justify-around z-40">
      <button className="flex flex-col items-center gap-1 p-2 text-primary">
        <BookOpen className="size-5" />
        <span className="text-[10px] font-bold">{t('mobileLesson')}</span>
      </button>
      <button className="flex flex-col items-center gap-1 p-2 text-slate-400">
        <Search className="size-5" />
        <span className="text-[10px] font-bold">{t('mobileSearch')}</span>
      </button>
      <button className="flex flex-col items-center gap-1 p-2 text-slate-400">
        <User className="size-5" />
        <span className="text-[10px] font-bold">{t('mobileProfile')}</span>
      </button>
    </nav>
  );
}
