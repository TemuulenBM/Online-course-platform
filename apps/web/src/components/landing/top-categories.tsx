'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Palette, Code, Megaphone, Briefcase, Camera, Music, Heart, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCategoryTree } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useRef, useState } from 'react';

/** Ангиллын icon mapping — slug-аар тааруулна */
const categoryConfig: Record<string, { icon: LucideIcon; bg: string; iconColor: string }> = {
  design: { icon: Palette, bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-500' },
  development: { icon: Code, bg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500' },
  marketing: {
    icon: Megaphone,
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-500',
  },
  business: {
    icon: Briefcase,
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-500',
  },
  photography: { icon: Camera, bg: 'bg-pink-50 dark:bg-pink-900/20', iconColor: 'text-pink-500' },
  music: { icon: Music, bg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500' },
  lifestyle: { icon: Heart, bg: 'bg-teal-50 dark:bg-teal-900/20', iconColor: 'text-teal-500' },
};

/** Fallback ангиллууд — API ажиллахгүй үед */
const fallbackCategories = [
  { id: '1', name: 'Design', slug: 'design', coursesCount: 120 },
  { id: '2', name: 'Development', slug: 'development', coursesCount: 245 },
  { id: '3', name: 'Marketing', slug: 'marketing', coursesCount: 85 },
  { id: '4', name: 'Business', slug: 'business', coursesCount: 150 },
  { id: '5', name: 'Photography', slug: 'photography', coursesCount: 65 },
  { id: '6', name: 'Music', slug: 'music', coursesCount: 42 },
  { id: '7', name: 'Lifestyle', slug: 'lifestyle', coursesCount: 98 },
];

/** Шилдэг ангиллуудын grid */
export function TopCategories() {
  const t = useTranslations('landing');
  const { data: apiCategories, isLoading } = useCategoryTree();
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const categories = apiCategories?.length ? apiCategories : fallbackCategories;

  return (
    <section ref={ref} className="py-16 lg:py-20 bg-[#FAFAFA] dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Гарчиг + See All */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-[#1B1B1B] dark:text-white">
              {t('topCategories')}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('topCategoriesSubtitle')}
            </p>
          </div>
          <Link
            href={ROUTES.COURSES}
            className="hidden sm:inline-flex text-sm font-semibold text-[#8A93E5] hover:text-[#9575ED] transition-colors"
          >
            {t('seeAll')} →
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.slice(0, 7).map((cat, index) => {
              const config = categoryConfig[cat.slug] || categoryConfig.design;
              const Icon = config.icon;
              return (
                <Link
                  key={cat.id || cat.slug}
                  href={ROUTES.COURSES}
                  className="group bg-white dark:bg-slate-800 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-slate-700"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.5s ease-out ${index * 0.08}s`,
                  }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`size-6 ${config.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {t('coursesCount', { count: cat.coursesCount || 0 })}
                  </p>
                </Link>
              );
            })}
            {/* More card */}
            <Link
              href={ROUTES.COURSES}
              className="group bg-white dark:bg-slate-800 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-slate-700 border-dashed"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease-out ${7 * 0.08}s`,
              }}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="size-6 text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {t('moreCategories')}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('exploreMore')}</p>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
