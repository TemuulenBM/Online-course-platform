'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

/** Бүртгүүлэх уриалга — footer-ын өмнө */
export function CtaSection() {
  const t = useTranslations('landing');

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#2E3035] dark:bg-slate-800 px-8 py-16 lg:px-16 lg:py-20 text-center">
          {/* Чимэглэлийн blob-ууд */}
          <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#8A93E5]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[350px] h-[350px] bg-[#FF6B6B]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-[30%] right-[15%] w-[200px] h-[200px] bg-[#A78BFA]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              {t('ctaTitle')}
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">{t('ctaSubtitle')}</p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#2E3035] hover:bg-gray-100 rounded-full px-10 h-12 text-base font-bold hover:scale-105 active:scale-95 transition-all"
              >
                <Link href={ROUTES.REGISTER}>
                  {t('joinNow')}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
