'use client';

import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

const FAQ_COUNT = 6;

/** Түгээмэл асуултууд — 6 асуулт, 2 багана */
export function FaqSection() {
  const t = useTranslations('landing');
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

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

  const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    question: t(`faq${i + 1}Question`),
    answer: t(`faq${i + 1}Answer`),
  }));

  /** 2 баганад хуваах — зүүн 1-3, баруун 4-6 */
  const leftColumn = faqs.slice(0, 3);
  const rightColumn = faqs.slice(3);

  return (
    <section ref={ref} className="py-16 lg:py-24 bg-background dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Гарчиг */}
        <div className="text-center mb-14">
          <h2 className="text-2xl lg:text-3xl font-black text-[#1B1B1B] dark:text-white">
            {t('faqTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('faqSubtitle')}</p>
        </div>

        {/* 2 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
          {[leftColumn, rightColumn].map((column, colIdx) => (
            <div key={colIdx} className="space-y-4">
              {column.map((faq, idx) => {
                const globalIndex = colIdx * 3 + idx;
                const isOpen = openIndex === globalIndex;

                return (
                  <div
                    key={globalIndex}
                    className="rounded-2xl border border-gray-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 overflow-hidden transition-shadow hover:shadow-md"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.5s ease-out ${globalIndex * 0.08}s`,
                    }}
                  >
                    {/* Асуулт */}
                    <button
                      onClick={() => toggle(globalIndex)}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    >
                      <span className="text-sm font-semibold text-[#1B1B1B] dark:text-white leading-snug">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`size-5 text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Хариулт — collapsible */}
                    <div
                      className="overflow-hidden transition-all duration-300 ease-out"
                      style={{
                        maxHeight: isOpen ? '200px' : '0',
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="px-5 pb-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
