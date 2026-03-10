'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { useEffect, useRef, useState } from 'react';

interface PricingTier {
  titleKey: string;
  priceKey: string;
  periodKey: string;
  features: string[];
  ctaKey: string;
  /** Онцолсон tier эсэх */
  highlighted?: boolean;
  badgeKey?: string;
}

const tiers: PricingTier[] = [
  {
    titleKey: 'pricingFreeTitle',
    priceKey: 'pricingFreePrice',
    periodKey: 'pricingFreePeriod',
    features: ['pricingFreeFeature1', 'pricingFreeFeature2', 'pricingFreeFeature3'],
    ctaKey: 'pricingFreeCta',
  },
  {
    titleKey: 'pricingStandardTitle',
    priceKey: 'pricingStandardPrice',
    periodKey: 'pricingStandardPeriod',
    features: [
      'pricingStandardFeature1',
      'pricingStandardFeature2',
      'pricingStandardFeature3',
      'pricingStandardFeature4',
    ],
    ctaKey: 'pricingStandardCta',
    highlighted: true,
    badgeKey: 'pricingStandardBadge',
  },
  {
    titleKey: 'pricingPremiumTitle',
    priceKey: 'pricingPremiumPrice',
    periodKey: 'pricingPremiumPeriod',
    features: [
      'pricingPremiumFeature1',
      'pricingPremiumFeature2',
      'pricingPremiumFeature3',
      'pricingPremiumFeature4',
    ],
    ctaKey: 'pricingPremiumCta',
  },
];

/** Үнийн хураангуй — 3 tier card */
export function PricingPreview() {
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
            {t('pricingTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('pricingSubtitle')}</p>
        </div>

        {/* 3 tier cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((tier, index) => (
            <div
              key={tier.titleKey}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? 'bg-white dark:bg-slate-800 ring-2 ring-primary shadow-xl shadow-primary/10 scale-[1.02] md:scale-105'
                  : 'bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 hover:shadow-lg'
              }`}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible
                  ? tier.highlighted
                    ? 'translateY(0) scale(1.02)'
                    : 'translateY(0)'
                  : 'translateY(30px)',
                transition: `all 0.5s ease-out ${index * 0.12}s`,
              }}
            >
              {/* "Хамгийн алдартай" badge */}
              {tier.highlighted && tier.badgeKey && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-primary to-[#9575ED] text-white text-xs font-bold shadow-lg shadow-primary/25">
                    {t(tier.badgeKey)}
                  </span>
                </div>
              )}

              {/* Tier нэр */}
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-white">
                {t(tier.titleKey)}
              </h3>

              {/* Үнэ */}
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black text-[#1B1B1B] dark:text-white">
                  {t(tier.priceKey)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t(tier.periodKey)}
                </span>
              </div>

              {/* Feature жагсаалт */}
              <ul className="mt-6 space-y-3">
                {tier.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t(featureKey)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA товч */}
              <div className="mt-8">
                <Button
                  asChild
                  className={`w-full rounded-full h-11 font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-primary to-[#9575ED] text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/25'
                      : 'bg-transparent border border-gray-200 dark:border-slate-600 text-[#1B1B1B] dark:text-white hover:border-primary dark:hover:border-primary/70 hover:text-primary'
                  }`}
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  <Link href={ROUTES.REGISTER}>{t(tier.ctaKey)}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Бүх үнийг үзэх линк */}
        <div className="text-center mt-10">
          <Link
            href={ROUTES.PRICING}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            {t('viewAllPricing')}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
