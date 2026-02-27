'use client';

import { StickyNote } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Admin тэмдэглэл — placeholder */
export function EnrollmentAdminNotes() {
  const t = useTranslations('enrollments');

  return (
    <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-xl border border-dashed border-primary/30">
      <h3 className="text-xs font-bold text-primary mb-3 uppercase flex items-center gap-2">
        <StickyNote className="size-4" />
        {t('adminNotes')}
      </h3>
      <textarea
        disabled
        className="w-full bg-white dark:bg-slate-900 border-primary/10 border rounded-lg text-sm p-3 placeholder:text-slate-400 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
        placeholder={t('adminNotesPlaceholder')}
        rows={3}
      />
      <button
        type="button"
        disabled
        className="mt-3 text-xs font-bold text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('saveNote')} — {t('comingSoon')}
      </button>
    </div>
  );
}
