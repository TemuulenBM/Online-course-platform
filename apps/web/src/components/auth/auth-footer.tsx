'use client';

import { Globe, HelpCircle, GraduationCap } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Auth хуудсуудын энгийн footer (reset-password, forgot-password) */
export function AuthFooter() {
  const t = useTranslations('authFooter');

  return (
    <footer className="py-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors bg-white/60">
            <Globe className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors bg-white/60">
            <HelpCircle className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors bg-white/60">
            <GraduationCap className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-400">{t('copyright')}</p>
      </div>
    </footer>
  );
}
