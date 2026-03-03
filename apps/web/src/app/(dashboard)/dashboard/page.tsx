'use client';

import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { HeroBanner } from '@/components/dashboard/hero-banner';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClassListTable } from '@/components/dashboard/class-list-table';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { TaskList } from '@/components/dashboard/task-list';
import { useMyEnrollments, useCourseProgress } from '@/hooks/api';

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
    <div className="flex flex-col xl:flex-row min-h-full">
      {/* Үндсэн контент */}
      <div className="flex-1 flex flex-col gap-8 p-6 lg:p-10">
        <WelcomeHeader />
        <HeroBanner enrollment={heroBannerEnrollment} />
        <StatsCards />
        <ClassListTable />

        {/* Mobile/Tablet — xl доогуур ProfileCard, TaskList доор харагдана */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 xl:hidden">
          <ProfileCard />
          <TaskList />
        </div>
      </div>

      {/* Баруун sidebar — xl дээр харагдана */}
      <aside className="hidden xl:flex w-[320px] shrink-0 flex-col gap-8 p-6 pt-10 border-l border-border overflow-y-auto">
        <ProfileCard />
        <TaskList />
      </aside>
    </div>
  );
}
