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
 * QuickActions — 3 shortcut товч.
 * Сургалт хайх, ахиц харах, сертификат хуудас руу шууд очих.
 */
export function QuickActions() {
  const t = useTranslations('dashboard');

  const actions = [
    { label: t('searchCourses'), href: ROUTES.COURSES, icon: Search },
    { label: t('myProgress'), href: ROUTES.PROGRESS, icon: BarChart3 },
    { label: t('myCertificates'), href: ROUTES.CERTIFICATES, icon: Award },
  ];

  return (
    <motion.div
      className="grid grid-cols-3 gap-2"
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
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
