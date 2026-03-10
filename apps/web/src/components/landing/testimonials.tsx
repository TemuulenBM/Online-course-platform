'use client';

import { useTranslations } from 'next-intl';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useRef, useState, useCallback } from 'react';

/** Сэтгэгдлийн өнгө палитр — card тус бүрд өөр accent */
const ACCENT_COLORS = [
  'from-primary to-[#9575ED]',
  'from-emerald-500 to-emerald-400',
  'from-amber-500 to-amber-400',
  'from-blue-500 to-blue-400',
  'from-pink-500 to-pink-400',
];

/** Хэрэглэгчийн сэтгэгдэл — 5 testimonial carousel */
export function Testimonials() {
  const t = useTranslations('landing');
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = Array.from({ length: 5 }, (_, i) => ({
    quote: t(`testimonial${i + 1}Quote`),
    name: t(`testimonial${i + 1}Name`),
    title: t(`testimonial${i + 1}Title`),
    accent: ACCENT_COLORS[i],
  }));

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + testimonials.length) % testimonials.length);
    },
    [testimonials.length],
  );

  /** Intersection observer — анимэйшн trigger */
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

  /** Auto-advance — 5 секундын интервал */
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => goTo(activeIndex + 1), 5000);
    return () => clearInterval(timer);
  }, [activeIndex, isPaused, goTo]);

  return (
    <section
      ref={ref}
      className="py-16 lg:py-24 bg-background dark:bg-slate-900/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Гарчиг */}
        <div
          className="text-center mb-14"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <h2 className="text-2xl lg:text-3xl font-black text-[#1B1B1B] dark:text-white">
            {t('testimonialsTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('testimonialsSubtitle')}
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-3xl mx-auto"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.6s ease-out 0.2s',
          }}
        >
          {/* Cards container */}
          <div className="relative overflow-hidden min-h-[380px] sm:min-h-[340px]">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="absolute inset-0 flex flex-col items-center text-center px-4 sm:px-12"
                style={{
                  opacity: activeIndex === index ? 1 : 0,
                  transform:
                    activeIndex === index
                      ? 'scale(1) translateX(0)'
                      : 'scale(0.95) translateX(40px)',
                  transition: 'all 0.5s ease-out',
                  pointerEvents: activeIndex === index ? 'auto' : 'none',
                }}
              >
                {/* Quote icon */}
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.accent} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <Quote className="size-5 text-white" />
                </div>

                {/* Quote текст */}
                <blockquote className="text-lg sm:text-xl lg:text-2xl font-medium italic text-[#2E3035] dark:text-gray-200 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                {/* Од үнэлгээ */}
                <div className="flex gap-1 mt-5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Зохиогч */}
                <div className="flex items-center gap-3 mt-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback
                      className={`bg-gradient-to-br ${item.accent} text-white text-sm font-bold`}
                    >
                      {item.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-bold text-sm text-[#1B1B1B] dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => goTo(activeIndex - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-slate-700"
            aria-label="Өмнөх сэтгэгдэл"
          >
            <ChevronLeft className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => goTo(activeIndex + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform border border-gray-100 dark:border-slate-700"
            aria-label="Дараагийн сэтгэгдэл"
          >
            <ChevronRight className="size-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Dot navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === index
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400'
                }`}
                aria-label={`Сэтгэгдэл ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
