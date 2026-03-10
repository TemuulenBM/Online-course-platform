'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

/** Бүртгүүлэх уриалга — footer-ын өмнө */
export function CtaSection() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B1B1B] via-[#2E3035] to-[#1B1B1B] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-8 py-16 lg:px-16 lg:py-20 text-center">
          {/* Чимэглэлийн blob-ууд */}
          <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[350px] h-[350px] bg-[#9575ED]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[20%] right-[10%] w-[250px] h-[250px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Sparkles className="size-4 text-amber-400" />
              <span className="text-sm font-medium text-gray-300">100% үнэгүй эхлэх боломжтой</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {t('ctaTitle')}
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto text-base lg:text-lg">
              {t('ctaSubtitle')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-[#9575ED] text-white rounded-full px-10 h-13 text-base font-bold hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30"
              >
                <Link href={ROUTES.REGISTER}>
                  {t('joinNow')}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-gray-300 hover:text-white rounded-full px-8 h-13 text-base font-medium hover:bg-white/10 transition-all"
              >
                <Link href={ROUTES.COURSES}>{t('browseCourses')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
