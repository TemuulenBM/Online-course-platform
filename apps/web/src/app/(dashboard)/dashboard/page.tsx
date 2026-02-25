'use client';

import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { HeroBanner } from '@/components/dashboard/hero-banner';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ClassListTable } from '@/components/dashboard/class-list-table';
import { ProfileCard } from '@/components/dashboard/profile-card';
import { TaskList } from '@/components/dashboard/task-list';

export default function DashboardPage() {
  return (
    <div className="flex flex-col xl:flex-row min-h-full">
      {/* Үндсэн контент */}
      <div className="flex-1 flex flex-col gap-8 p-6 lg:p-10">
        <WelcomeHeader />
        <HeroBanner />
        <StatsCards />
        <ClassListTable />
      </div>

      {/* Баруун sidebar — xl дээр харагдана */}
      <aside className="hidden xl:flex w-[320px] shrink-0 flex-col gap-8 p-6 pt-10 border-l border-gray-100 overflow-y-auto">
        <ProfileCard />
        <TaskList />
      </aside>
    </div>
  );
}
