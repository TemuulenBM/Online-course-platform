'use client';

import { useTranslations } from 'next-intl';
import { UserPlus, Search, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Step {
  number: string;
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const steps: Step[] = [
  { number: '1', icon: UserPlus, titleKey: 'step1Title', descKey: 'step1Desc' },
  { number: '2', icon: Search, titleKey: 'step2Title', descKey: 'step2Desc' },
  { number: '3', icon: BookOpen, titleKey: 'step3Title', descKey: 'step3Desc' },
];

/** Хэрхэн ажилладаг вэ — 3 алхам */
export function HowItWorks() {
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
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 lg:py-20 bg-[#F4F2F9] dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Гарчиг */}
        <div className="text-center mb-14">
          <h2 className="text-2xl lg:text-3xl font-black text-[#1B1B1B] dark:text-white">
            {t('howItWorks')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('howItWorksSubtitle')}</p>
        </div>

        {/* 3 алхам */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Холбох шугам — зөвхөн desktop */}
          <div className="hidden md:block absolute top-16 left-[25%] right-[25%] h-[2px] border-t-2 border-dashed border-[#8A93E5]/30" />

          {steps.map((step, index) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s ease-out ${index * 0.2}s`,
              }}
            >
              {/* Дугаартай тойрог */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8A93E5] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-[#8A93E5]/25">
                  <step.icon className="size-8 text-white" strokeWidth={2} />
                </div>
                {/* Дугаарын badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center">
                  <span className="text-sm font-black text-[#8A93E5]">{step.number}</span>
                </div>
              </div>

              {/* Текст */}
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-white mb-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                {t(step.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
