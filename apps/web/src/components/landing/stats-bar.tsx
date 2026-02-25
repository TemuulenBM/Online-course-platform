'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookOpen, Users, GraduationCap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
  value: number;
  suffix: string;
  labelKey: string;
  icon: LucideIcon;
  color: string;
}

const stats: StatItem[] = [
  { value: 500, suffix: '+', labelKey: 'statCourses', icon: BookOpen, color: '#8A93E5' },
  { value: 10000, suffix: '+', labelKey: 'statStudents', icon: Users, color: '#FF6B6B' },
  { value: 200, suffix: '+', labelKey: 'statInstructors', icon: GraduationCap, color: '#FFD166' },
];

/** Тоо тоолох animation hook */
function useAnimatedCounter(target: number, duration: number, isActive: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      /* easeOutQuart */
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, isActive]);

  return count;
}

/** Тоон үзүүлэлтүүдийн хэсэг — animated counter */
export function StatsBar() {
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
    <section ref={ref} className="py-16 lg:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <StatCard key={stat.labelKey} stat={stat} isActive={isVisible} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  stat,
  isActive,
  t,
}: {
  stat: StatItem;
  isActive: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const count = useAnimatedCounter(stat.value, 2000, isActive);

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${stat.color}15` }}
      >
        <stat.icon className="size-7" style={{ color: stat.color }} />
      </div>
      <p className="text-4xl lg:text-5xl font-black text-primary">
        {count.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        {t(stat.labelKey)}
      </p>
    </div>
  );
}
