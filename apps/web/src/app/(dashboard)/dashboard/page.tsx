'use client';

import { motion } from 'framer-motion';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { HeroBanner } from '@/components/dashboard/hero-banner';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClassListTable } from '@/components/dashboard/class-list-table';
import { TaskList } from '@/components/dashboard/task-list';
import { LearningStreakCard } from '@/components/dashboard/learning-streak-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { useMyEnrollments, useCourseProgress } from '@/hooks/api';

/** Хуудасны бүх section-ийг дараалуулан гарч ирүүлэх stagger variants */
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const section = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function DashboardPage() {
  /** Сүүлийн идэвхтэй элсэлтийг HeroBanner-д дамжуулах */
  const { data: activeEnrollments } = useMyEnrollments({ page: 1, limit: 1, status: 'active' });
  const firstEnrollment = activeEnrollments?.data?.[0];

  /** Тухайн сургалтын ахицын хувийг авах */
  const { data: courseProgress } = useCourseProgress(firstEnrollment?.courseId ?? '');

  /** HeroBanner-д дамжуулах enrollment мэдээлэл */
  const heroBannerEnrollment =
    firstEnrollment?.courseTitle && firstEnrollment?.courseSlug
      ? {
          courseTitle: firstEnrollment.courseTitle,
          courseSlug: firstEnrollment.courseSlug,
          progressPercentage: courseProgress?.courseProgressPercentage ?? 0,
        }
      : null;

  return (
    <motion.div
      className="flex flex-col gap-5 p-6 lg:p-8 xl:p-10 max-w-[1400px] mx-auto w-full min-h-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Мэндчилгээ + хайлт + мэдэгдэл */}
      <motion.div variants={section}>
        <WelcomeHeader />
      </motion.div>

      {/* Үргэлжлүүлэх banner */}
      <motion.div variants={section}>
        <HeroBanner enrollment={heroBannerEnrollment} />
      </motion.div>

      {/* Статистик + Learning Streak heatmap */}
      <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <StatsCards />
        </div>
        <div className="lg:col-span-2">
          <LearningStreakCard />
        </div>
      </motion.div>

      {/* Идэвхтэй сургалтууд + Upcoming sessions + Quick actions */}
      <motion.div variants={section} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ClassListTable />
        </div>
        <div className="flex flex-col gap-5">
          <TaskList />
          <QuickActions />
        </div>
      </motion.div>
    </motion.div>
  );
}
