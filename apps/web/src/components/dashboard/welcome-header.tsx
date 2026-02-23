'use client';

import { Bell, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';

export function WelcomeHeader() {
  const t = useTranslations('dashboard');
  const user = useAuthStore((s) => s.user);

  /** Хэрэглэгчийн нэрийг авах — profile firstName эсвэл email-ийн @ өмнөх хэсэг */
  const displayName = user?.email?.split('@')[0] ?? 'User';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Mobile sidebar trigger */}
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
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
            className="pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm w-full sm:w-[260px] focus:outline-none focus:ring-2 focus:ring-[#8A93E5]/20 focus:border-[#8A93E5] transition-all"
          />
        </div>

        {/* Мэдэгдлийн товч */}
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative shrink-0">
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF6B6B] rounded-full border-2 border-white" />
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
