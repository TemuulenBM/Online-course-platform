'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Video } from 'lucide-react';

import { cn } from '@/lib/utils';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { SidebarUserFooter } from '@/components/ui/sidebar-user-footer';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

/** Teacher sidebar навигацийн зүйлс */
const navItems = [
  { href: '/teacher/courses', icon: BookOpen, labelKey: 'myCourses' },
  { href: '/teacher/analytics', icon: BarChart3, labelKey: 'analytics' },
  { href: '/teacher/live-sessions', icon: Video, labelKey: 'liveSessions' },
] as const;

/** Main sidebar-тай нийцсэн nav item стиль */
const navItemBase =
  'h-11 rounded-xl px-4 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.97]';
/** Active item — background-ийг motion indicator руу шилжүүлсэн */
const navItemActive = 'text-white font-medium relative z-10 hover:bg-transparent hover:text-white';
/** Active indicator-ийн spring transition */
const indicatorTransition = { type: 'spring' as const, bounce: 0.15, duration: 0.4 };

export function TeacherSidebar() {
  const pathname = usePathname();
  const t = useTranslations('teacher');

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
                    {/* Active indicator — layoutId-ээр item хооронд smooth slide */}
                    {isActive && (
                      <motion.div
                        layoutId="teacher-nav-indicator"
                        className="absolute inset-0 rounded-xl bg-primary"
                        transition={indicatorTransition}
                      />
                    )}
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
      </SidebarContent>

      {/* Нэгдсэн footer — буцах + гарах + хэрэглэгчийн мэдээлэл */}
      <SidebarUserFooter backLink={{ href: '/dashboard', label: t('backToDashboard') }} />
    </Sidebar>
  );
}
