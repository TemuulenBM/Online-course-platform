'use client';

import { useTranslations } from 'next-intl';
import { Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useRef, useState } from 'react';

/** Хэрэглэгчийн сэтгэгдэл */
export function Testimonials() {
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
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          {/* Quote icon */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-full bg-background dark:bg-slate-800 flex items-center justify-center">
              <Quote className="size-6 text-primary" />
            </div>
          </div>

          {/* Quote текст */}
          <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium italic text-[#2E3035] dark:text-gray-200 leading-relaxed">
            &ldquo;{t('testimonialQuote')}&rdquo;
          </blockquote>

          {/* Зохиогч */}
          <div className="flex flex-col items-center mt-8">
            <Avatar className="w-14 h-14 mb-3">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-lg font-bold">
                {t('testimonialName')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <p className="font-bold text-[#1B1B1B] dark:text-white">{t('testimonialName')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('testimonialTitle')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
