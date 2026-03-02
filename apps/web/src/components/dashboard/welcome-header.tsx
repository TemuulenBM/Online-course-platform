'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMyProfile } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function WelcomeHeader() {
  const t = useTranslations('dashboard');
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();

  /** Хэрэглэгчийн нэрийг авах — profile firstName эсвэл email-ийн @ өмнөх хэсэг */
  const displayName = profile?.firstName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar trigger */}
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          {t('welcomeBack', { name: displayName })} <span className="text-2xl">👋🏻</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Хайлтын талбар */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm w-full sm:w-[260px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Мэдэгдлийн товч — dropdown-тэй */}
        <NotificationBell />
      </div>
    </div>
  );
}
