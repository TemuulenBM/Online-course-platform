'use client';

import { useRouter } from 'next/navigation';
import { Bell, Moon, Sun } from 'lucide-react';
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
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      {/* Title + Utility buttons */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Хяналтын самбар</h1>
            <p className="text-muted-foreground mt-1">
              Сайн байна уу, {displayName}! Системийн ерөнхий төлөв байдал болон статистик
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="size-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </button>
          <button
            onClick={() => router.push(ROUTES.NOTIFICATIONS)}
            className="relative size-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all"
          >
            <Bell className="size-[18px]" />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount! > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
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
  );
}
