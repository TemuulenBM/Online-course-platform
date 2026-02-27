'use client';

import { useRouter } from 'next/navigation';
import { Bell, MessageSquare, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  usePlatformStats,
  usePendingItems,
  useSystemHealth,
  useRecentActivity,
  useUnreadNotificationCount,
  useMyProfile,
} from '@/hooks/api';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardStatsGrid } from '@/components/admin/dashboard/dashboard-stats-grid';
import { PendingActionsWidget } from '@/components/admin/dashboard/pending-actions-widget';
import { SystemHealthWidget } from '@/components/admin/dashboard/system-health-widget';
import { RecentActivityFeed } from '@/components/admin/dashboard/recent-activity-feed';
import { AdminDashboardSkeleton } from '@/components/admin/dashboard/admin-dashboard-skeleton';
import { ROUTES } from '@/lib/constants';

/** Admin Dashboard — Хяналтын самбар */
export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { data: profile } = useMyProfile();
  const { data: unreadCount } = useUnreadNotificationCount();

  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: pending, isLoading: pendingLoading } = usePendingItems();
  const { data: health } = useSystemHealth();
  const { data: activities } = useRecentActivity(5);

  const displayName = profile?.firstName ? `${profile.firstName}` : 'Админ';

  if (statsLoading || pendingLoading) return <AdminDashboardSkeleton />;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header — дизайны дагуу */}
      <header className="h-20 bg-white border-b border-[#9c7aff]/10 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <SidebarTrigger className="lg:hidden" />
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-[#f6f5f8] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#9c7aff] focus:outline-none placeholder:text-slate-400"
              placeholder="Хайх..."
              type="text"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  /* TODO: Global search */
                }
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="size-10 flex items-center justify-center rounded-xl bg-[#f6f5f8] text-slate-600 hover:bg-[#9c7aff] hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
          {/* Notification bell + badge */}
          <button
            onClick={() => router.push(ROUTES.NOTIFICATIONS)}
            className="relative size-10 flex items-center justify-center rounded-xl bg-[#f6f5f8] text-slate-600 hover:bg-[#9c7aff] hover:text-white transition-all"
          >
            <Bell className="size-[18px]" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount! > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {/* Chat */}
          <button className="size-10 flex items-center justify-center rounded-xl bg-[#f6f5f8] text-slate-600 hover:bg-[#9c7aff] hover:text-white transition-all">
            <MessageSquare className="size-[18px]" />
          </button>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#f6f5f8]">
        {/* Title + Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
            Хяналтын самбар
          </h1>
          <p className="text-slate-500">
            Сайн байна уу, {displayName}! Системийн ерөнхий төлөв байдал болон статистик
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <DashboardStatsGrid stats={stats} />
        </div>

        {/* Main grid: pending + health | activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            <PendingActionsWidget pending={pending} />
            <SystemHealthWidget health={health} />
          </div>

          {/* Right column — 1/3 */}
          <div className="lg:col-span-1">
            <RecentActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
