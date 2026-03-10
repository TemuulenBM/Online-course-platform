'use client';

import { BookOpen, CheckCircle2, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useMyEnrollments, useMyProgress, useMyCertificates } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedCounter } from '@/components/ui/animated-counter';

/** Card-level stagger variants */
const cardContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35 },
  },
};

export function StatsCards() {
  const t = useTranslations('dashboard');

  const { data: enrollments, isLoading: loadingEnrollments } = useMyEnrollments({
    page: 1,
    limit: 1,
  });
  const { data: progress, isLoading: loadingProgress } = useMyProgress({ page: 1, limit: 1 });
  const { data: certificates, isLoading: loadingCertificates } = useMyCertificates({
    page: 1,
    limit: 1,
  });

  const certCount = certificates?.total ?? 0;

  /** Статистик карт бүрийн тохиргоо */
  const statsConfig = [
    {
      labelKey: 'enrolledCourse' as const,
      value: enrollments?.meta?.total ?? 0,
      loading: loadingEnrollments,
      icon: BookOpen,
    },
    {
      labelKey: 'lesson' as const,
      value: progress?.total ?? 0,
      loading: loadingProgress,
      icon: CheckCircle2,
    },
    {
      labelKey: 'certificate' as const,
      value: certCount,
      loading: loadingCertificates,
      icon: Award,
      /** Сертификат 0 бол retention micro-CTA харуулна */
      hint: certCount === 0 && !loadingCertificates ? t('earnCertificate') : undefined,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-3 lg:grid-cols-1 gap-3 h-full"
      variants={cardContainer}
      initial="hidden"
      animate="show"
    >
      {statsConfig.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.labelKey}
            variants={cardItem}
            className="bg-card rounded-2xl p-4 flex flex-col border border-border hover:border-primary/20 hover:shadow-md transition-all group flex-1"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center mb-2">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              {stat.loading ? (
                <Skeleton className="h-8 w-12 mb-1 rounded-lg" />
              ) : (
                <AnimatedCounter
                  value={stat.value}
                  className="text-[28px] font-bold text-foreground leading-none mb-1"
                />
              )}
              <span className="text-xs font-medium text-muted-foreground">{t(stat.labelKey)}</span>
              {/* Retention micro-CTA */}
              {'hint' in stat && stat.hint && (
                <span className="text-[10px] font-medium text-primary/60 mt-2 leading-tight">
                  {stat.hint}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
