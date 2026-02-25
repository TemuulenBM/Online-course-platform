'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BookMarked,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  LogOut,
  Settings,
  Shield,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useLogout, useMyProfile } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
  { href: '/my-courses', icon: BookMarked, labelKey: 'myCourses' },
] as const;

/** Навигац item-ийн нийтлэг style */
const navItemBase =
  'h-11 rounded-xl px-4 text-sm font-medium text-gray-500 transition-colors hover:bg-white/60 hover:text-gray-900';
const navItemActive =
  'bg-white text-gray-900 font-semibold shadow-sm hover:bg-white hover:text-gray-900';

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const tRoles = useTranslations('roles');
  const logoutMutation = useLogout();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();
  const userRole = user?.role?.toLowerCase();
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || '';

  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  const roleName = tRoles(user?.role || 'student');

  return (
    <Sidebar collapsible="offcanvas" className="border-none bg-background">
      {/* Лого */}
      <SidebarHeader className="px-5 pt-7 pb-4">
        <LearnifyLogo href="/dashboard" />
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Үндсэн навигац */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(navItemBase, isActive && navItemActive)}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-[18px]" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Багшийн хэсэг */}
        {isTeacherOrAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              {t('teacherSection')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/teacher')}
                    className={cn(navItemBase, pathname.startsWith('/teacher') && navItemActive)}
                  >
                    <Link href="/teacher/courses">
                      <GraduationCap className="size-[18px]" />
                      <span>{t('teacherCourses')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Админ хэсэг */}
        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
              {t('adminSection')}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    className={cn(navItemBase, pathname.startsWith('/admin') && navItemActive)}
                  >
                    <Link href="/admin/users">
                      <Shield className="size-[18px]" />
                      <span>{t('adminPanel')}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Доод хэсэг — Тохиргоо + Гарах + Хэрэглэгч */}
      <SidebarFooter className="px-3 pb-5">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/profile'}
              className={cn(navItemBase, pathname === '/profile' && navItemActive)}
            >
              <Link href="/profile">
                <Settings className="size-[18px]" />
                <span>{t('settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="h-11 rounded-xl px-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-[18px]" />
              <span>{t('logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        {/* Хэрэглэгчийн мэдээлэл */}
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/60"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
            <p className="text-[11px] text-gray-400">{roleName}</p>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
