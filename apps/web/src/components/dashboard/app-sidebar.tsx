'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Calendar,
  HelpCircle,
  LayoutGrid,
  ListTodo,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';

/** Үндсэн навигацийн зүйлс */
const mainNavItems = [
  { href: '/dashboard', icon: LayoutGrid, labelKey: 'dashboard' },
  { href: '/courses', icon: BookOpen, labelKey: 'courses' },
  { href: '/tasks', icon: ListTodo, labelKey: 'myTask' },
  { href: '/community', icon: Users, labelKey: 'community' },
  { href: '/report', icon: TrendingUp, labelKey: 'report' },
  { href: '/events', icon: Calendar, labelKey: 'events' },
] as const;

/** Доод навигацийн зүйлс */
const bottomNavItems = [
  { href: '/settings', icon: Settings, labelKey: 'settings' },
  { href: '/support', icon: HelpCircle, labelKey: 'support' },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  return (
    <Sidebar collapsible="offcanvas" className="border-none bg-[#F4F2F9]">
      {/* Лого */}
      <SidebarHeader className="px-6 pt-8 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 pl-2">
          <div className="flex flex-col gap-[3px]">
            <div className="w-5 h-1.5 bg-[#FF6B6B] rounded-full rotate-[-45deg] origin-right ml-1" />
            <div className="w-5 h-1.5 bg-[#2E3035] rounded-full rotate-[-45deg] origin-right" />
            <div className="w-5 h-1.5 bg-[#8A93E5] rounded-full rotate-[-45deg] origin-right" />
          </div>
          <span className="text-xl font-extrabold tracking-wide uppercase text-[#1B1B1B]">
            Learnify
          </span>
        </Link>
      </SidebarHeader>

      {/* Үндсэн навигац */}
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-12 rounded-2xl px-5 font-semibold text-gray-500 transition-all',
                        'hover:bg-white/50 hover:text-gray-900',
                        isActive &&
                          'bg-[#8A93E5] text-white shadow-[0_4px_15px_-3px_rgba(138,147,229,0.5)] hover:bg-[#7B8AD4] hover:text-white font-bold',
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-5" strokeWidth={2.5} />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Доод хэсэг: Setting, Support, Upgrade Premium */}
      <SidebarFooter className="px-3 pb-6">
        <SidebarMenu className="gap-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    'h-12 rounded-2xl px-5 font-semibold text-gray-500 transition-all',
                    'hover:bg-white/50 hover:text-gray-900',
                    isActive &&
                      'bg-[#8A93E5] text-white shadow-[0_4px_15px_-3px_rgba(138,147,229,0.5)] hover:bg-[#7B8AD4] hover:text-white font-bold',
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="size-5" strokeWidth={2.5} />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <SidebarSeparator className="my-2 bg-transparent" />

        {/* Upgrade Premium Card */}
        <div className="bg-white rounded-[2rem] p-6 text-center shadow-sm relative overflow-visible border border-gray-100/50">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 bg-[#2E3035] rounded-full flex items-center justify-center shadow-lg border-4 border-[#F4F2F9] z-10">
            <span className="text-4xl">🚀</span>
            <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-yellow-300 rounded-full" />
            <div className="absolute bottom-4 right-3 w-1.5 h-1.5 bg-yellow-300 rounded-full" />
            <div className="absolute top-5 right-2 w-1 h-1 bg-white rounded-full" />
            <div className="absolute bottom-6 left-2 w-1 h-1 bg-white rounded-full" />
          </div>
          <div className="pt-8">
            <h4 className="font-extrabold text-[#1B1B1B] text-[15px] mb-2 tracking-tight">
              {t('upgradePremium')}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium mb-5 leading-relaxed px-1">
              {t('upgradeDescription')}
            </p>
            <button className="w-full bg-[#1B1B1B] text-white font-bold text-xs py-3 rounded-2xl hover:bg-black transition-colors shadow-sm">
              {t('getPremium')}
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
