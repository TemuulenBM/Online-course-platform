'use client';

import { useTranslations } from 'next-intl';
import { Award, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Feature {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
  /** Icon-ийн gradient өнгө */
  gradient: string;
  /** Icon-ийн сүүдэр өнгө */
  shadow: string;
}

const features: Feature[] = [
  {
    icon: Award,
    titleKey: 'whyFeature1Title',
    descKey: 'whyFeature1Desc',
    gradient: 'from-primary to-[#9575ED]',
    shadow: 'shadow-primary/25',
  },
  {
    icon: Globe,
    titleKey: 'whyFeature2Title',
    descKey: 'whyFeature2Desc',
    gradient: 'from-emerald-500 to-emerald-400',
    shadow: 'shadow-emerald-500/25',
  },
  {
    icon: ShieldCheck,
    titleKey: 'whyFeature3Title',
    descKey: 'whyFeature3Desc',
    gradient: 'from-amber-500 to-amber-400',
    shadow: 'shadow-amber-500/25',
  },
  {
    icon: Sparkles,
    titleKey: 'whyFeature4Title',
    descKey: 'whyFeature4Desc',
    gradient: 'from-blue-500 to-blue-400',
    shadow: 'shadow-blue-500/25',
  },
];

/** Яагаад Learnify? — 4 давуу тал */
export function WhyLearnify() {
  const t = useTranslations('landing');
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
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Гарчиг */}
        <div className="text-center mb-14">
          <h2 className="text-2xl lg:text-3xl font-black text-[#1B1B1B] dark:text-white">
            {t('whyLearnify')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('whyLearnifySubtitle')}
          </p>
        </div>

        {/* 4 feature card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-100 dark:border-slate-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.5s ease-out ${index * 0.1}s`,
              }}
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg ${feature.shadow} mb-5`}
              >
                <feature.icon className="size-6 text-white" strokeWidth={2} />
              </div>

              {/* Текст */}
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-white mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {t(feature.descKey)}
              </p>

              {/* Hover чимэглэл — нарийн gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
