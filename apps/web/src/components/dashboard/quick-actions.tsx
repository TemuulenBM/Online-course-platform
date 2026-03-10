'use client';

import Link from 'next/link';
import { Search, BarChart3, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/lib/constants';

/** Stagger variants */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
};

/**
 * QuickActions — 3 shortcut CTA card.
 * Сургалт хайх, ахиц харах, сертификат хуудас руу шууд очих.
 * Өнгөт icon background + тайлбар текст + decorative арын icon-тэй.
 */
export function QuickActions() {
  const t = useTranslations('dashboard');

  const actions = [
    {
      label: t('searchCourses'),
      description: t('searchCoursesDesc'),
      href: ROUTES.COURSES,
      icon: Search,
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/15',
      iconColor: 'text-blue-500',
    },
    {
      label: t('myProgress'),
      description: t('myProgressDesc'),
      href: ROUTES.PROGRESS,
      icon: BarChart3,
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      iconColor: 'text-emerald-500',
    },
    {
      label: t('myCertificates'),
      description: t('myCertificatesDesc'),
      href: ROUTES.CERTIFICATES,
      icon: Award,
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/15',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-3 gap-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.href} variants={item}>
            <Link
              href={action.href}
              className="flex flex-col gap-2.5 p-4 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Decorative арын том icon */}
              <Icon className="absolute -bottom-2 -right-2 w-16 h-16 text-primary/[0.04] rotate-12 pointer-events-none" />

              {/* Icon badge */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bgColor} transition-colors`}
              >
                <Icon className={`w-5 h-5 ${action.iconColor}`} />
              </div>

              {/* Label + description */}
              <div>
                <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                  {action.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {action.description}
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
