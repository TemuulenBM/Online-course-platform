'use client';

import { useTranslations } from 'next-intl';

/** PDF үүсэж байх үеийн animated progress bar */
export function CertificatePdfProgress() {
  const t = useTranslations('certificates');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-primary/10 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex space-x-1.5">
            <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-base font-medium">{t('pdfGenerating')}</p>
        </div>
      </div>
      {/* Indeterminate progress bar */}
      <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
        <div className="bg-primary h-full rounded-full w-1/3 animate-[indeterminate_1.5s_ease-in-out_infinite]" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs mt-3 italic">
        {t('pdfGeneratingDesc')}
      </p>

      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(200%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
