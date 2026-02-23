'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ArrowRight, CirclePlay, BookOpen, Users, Award } from 'lucide-react';

/** Landing page hero section — гарчиг, CTA, illustration */
export function HeroSection() {
  const t = useTranslations('landing');

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950">
      {/* Чимэглэлийн blur тойргууд */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#8A93E5]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#FFD166]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Зүүн тал — текст */}
          <div className="animation-fade-in">
            {/* Trusted badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4F2F9] dark:bg-slate-800 mb-6">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {t('trustedBadge')}
              </span>
            </div>

            {/* Гарчиг */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1B1B1B] dark:text-white leading-tight tracking-tight">
              {t('heroTitle')}
              <br />
              <span className="italic bg-gradient-to-r from-[#8A93E5] to-[#A78BFA] bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>
            </h1>

            {/* Дэд текст */}
            <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
              {t('heroSubtitle')}
            </p>

            {/* CTA товчлуурууд */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#8A93E5] to-[#9575ED] text-white rounded-full px-8 h-12 text-base font-semibold hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#8A93E5]/25"
              >
                <Link href={ROUTES.REGISTER}>
                  {t('getStarted')}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base font-semibold border-gray-200 dark:border-slate-700 hover:border-[#8A93E5] dark:hover:border-[#A78BFA] transition-colors"
              >
                <Link href={ROUTES.COURSES}>
                  <CirclePlay className="mr-2 size-4" />
                  {t('browseCourses')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Баруун тал — SVG/CSS illustration */}
          <div className="relative hidden lg:block animation-fade-in">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Гол gradient тойрог */}
              <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-[#EDE7F9] via-[#E0D6F5] to-[#D5CCF0] dark:from-[#2E3035] dark:via-slate-800 dark:to-slate-900" />

              {/* Хөвөгч картууд */}
              <div
                className="absolute top-[8%] right-[5%] bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-black/30 animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8A93E5]/10 flex items-center justify-center">
                    <BookOpen className="size-5 text-[#8A93E5]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">500+</p>
                    <p className="text-[10px] text-gray-400">Courses</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-[15%] left-[0%] bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-black/30 animate-bounce"
                style={{ animationDuration: '4s', animationDelay: '1s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Users className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">10K+</p>
                    <p className="text-[10px] text-gray-400">Students</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute top-[35%] right-[-5%] bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-black/30 animate-bounce"
                style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B6B]/10 flex items-center justify-center">
                    <Award className="size-5 text-[#FF6B6B]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">200+</p>
                    <p className="text-[10px] text-gray-400">Instructors</p>
                  </div>
                </div>
              </div>

              {/* Төв SVG illustration */}
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 w-full h-full"
              >
                {/* Ном */}
                <rect x="140" y="180" width="120" height="90" rx="8" fill="#8A93E5" opacity="0.9" />
                <rect x="145" y="185" width="110" height="80" rx="6" fill="#C4B5FD" opacity="0.6" />
                <path d="M200 185 L200 265" stroke="white" strokeWidth="2" opacity="0.5" />
                <rect x="155" y="200" width="35" height="3" rx="1.5" fill="white" opacity="0.7" />
                <rect x="155" y="210" width="25" height="3" rx="1.5" fill="white" opacity="0.5" />
                <rect x="155" y="220" width="30" height="3" rx="1.5" fill="white" opacity="0.5" />
                <rect x="210" y="200" width="35" height="3" rx="1.5" fill="white" opacity="0.7" />
                <rect x="210" y="210" width="25" height="3" rx="1.5" fill="white" opacity="0.5" />

                {/* Graduation cap */}
                <path d="M200 140 L240 160 L200 180 L160 160 Z" fill="#2E3035" />
                <path d="M200 180 L200 155 L240 160 L200 180Z" fill="#1B1B1B" />
                <rect x="197" y="130" width="6" height="15" rx="3" fill="#FF6B6B" />
                <circle cx="200" cy="128" r="5" fill="#FF6B6B" />

                {/* Тасалбар шугамууд */}
                <circle cx="300" cy="150" r="4" fill="#8A93E5" opacity="0.4" />
                <circle cx="100" cy="250" r="6" fill="#FF6B6B" opacity="0.3" />
                <circle cx="320" cy="280" r="3" fill="#FFD166" opacity="0.5" />
                <rect
                  x="90"
                  y="170"
                  width="20"
                  height="20"
                  rx="4"
                  fill="#8A93E5"
                  opacity="0.15"
                  transform="rotate(15 100 180)"
                />
                <rect
                  x="290"
                  y="220"
                  width="15"
                  height="15"
                  rx="3"
                  fill="#FF6B6B"
                  opacity="0.15"
                  transform="rotate(-20 297 227)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
