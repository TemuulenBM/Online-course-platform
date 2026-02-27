'use client';

import { HelpCircle, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Баталгаажуулалт хуудасны footer */
export function VerifyFooter() {
  const t = useTranslations('certificates');

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-slate-500 text-sm">{t('copyright', { year: new Date().getFullYear() })}</p>
      <div className="flex gap-6">
        <a
          href="#"
          className="text-slate-400 hover:text-primary transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="size-5" />
        </a>
        <a
          href="#"
          className="text-slate-400 hover:text-primary transition-colors"
          aria-label="Contact"
        >
          <Mail className="size-5" />
        </a>
      </div>
    </div>
  );
}
