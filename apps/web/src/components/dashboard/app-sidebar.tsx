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
import { LearnifyLogo } from '@/components/layout/learnify-logo';
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
        <LearnifyLogo href="/dashboard" className="pl-2" />
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
                          'shadow-[0_4px_15px_-3px_rgba(167,139,250,0.5)] hover:bg-[#9575ED] hover:text-white font-bold',
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
                      'shadow-[0_4px_15px_-3px_rgba(167,139,250,0.5)] hover:bg-[#9575ED] hover:text-white font-bold',
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
            {/* Rocket SVG illustration */}
            <svg
              width="44"
              height="44"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Дөл */}
              <ellipse cx="24" cy="42" rx="5" ry="4.5" fill="#FF9E67" />
              <ellipse cx="24" cy="41" rx="3" ry="3.5" fill="#FFD166" />
              <ellipse cx="24" cy="40.5" rx="1.5" ry="2" fill="#FFF3C4" />
              {/* Rocket бие — гадна */}
              <path d="M17 32 C17 32 15.5 22 24 12 C32.5 22 31 32 31 32 Z" fill="#A78BFA" />
              {/* Rocket бие — дотно highlight */}
              <path d="M19 31 C19 31 18 23 24 14 C30 23 29 31 29 31 Z" fill="#C4B5FD" />
              {/* Rocket толгой */}
              <path
                d="M21.5 17 C21.5 14.5 24 10.5 24 10.5 C24 10.5 26.5 14.5 26.5 17 Z"
                fill="#FF6B6B"
              />
              {/* Цонх — гадна */}
              <circle cx="24" cy="24" r="4" fill="#1E1E2E" />
              {/* Цонх — дотно */}
              <circle cx="24" cy="24" r="2.8" fill="#C7D2FE" />
              {/* Цонх — гялалз */}
              <circle cx="22.8" cy="22.8" r="1" fill="white" />
              {/* Зүүн жигүүр */}
              <path d="M17 32 C14 29 12 33 12 35 L17 32 Z" fill="#FF6B6B" />
              {/* Баруун жигүүр */}
              <path d="M31 32 C34 29 36 33 36 35 L31 32 Z" fill="#FF6B6B" />
            </svg>
            {/* Гялалзсан одууд */}
            <div className="absolute top-1 left-2 text-yellow-300 text-xs animate-pulse">
              &#10022;
            </div>
            <div
              className="absolute bottom-2 right-2 text-yellow-300 text-sm animate-pulse"
              style={{ animationDelay: '0.5s' }}
            >
              &#10022;
            </div>
            <div
              className="absolute top-3.5 right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute bottom-4 left-2.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse"
              style={{ animationDelay: '0.3s' }}
            />
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
