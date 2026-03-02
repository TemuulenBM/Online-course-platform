'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, BookOpen, LayoutGrid } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useMyProfile } from '@/hooks/api';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

/** Teacher sidebar навигацийн зүйлс */
const navItems = [
  { href: '/teacher/courses', icon: BookOpen, labelKey: 'myCourses' },
  { href: '/dashboard', icon: LayoutGrid, labelKey: 'dashboard' },
] as const;

export function TeacherSidebar() {
  const pathname = usePathname();
  const t = useTranslations('teacher');
  const tRoles = useTranslations('roles');
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || '';

  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <Sidebar collapsible="offcanvas" className="border-none bg-background">
      <SidebarHeader className="px-5 pt-7 pb-4">
        <LearnifyLogo href="/teacher/courses" />
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        'h-11 rounded-xl px-4 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all',
                        'hover:bg-primary/10 hover:text-primary',
                        isActive &&
                          'bg-primary text-white font-medium hover:bg-primary hover:text-white',
                      )}
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
      </SidebarContent>

      {/* Хяналтын самбар руу буцах */}
      <SidebarFooter className="px-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-4" />
                <span>{t('backToDashboard')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Хэрэглэгчийн мэдээлэл — main sidebar-тай ижил */}
      <SidebarFooter className="px-3 pb-5">
        <SidebarSeparator className="my-2" />
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
            <p className="text-[11px] text-muted-foreground">{tRoles(user?.role || 'student')}</p>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
