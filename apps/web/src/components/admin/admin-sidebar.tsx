'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  ScrollText,
  ShieldAlert,
  Users,
  Layers,
  GraduationCap,
  ShoppingCart,
  BarChart3,
  DollarSign,
  TrendingUp,
  Trophy,
  Activity,
  Video,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { LearnifyLogo } from '@/components/layout/learnify-logo';
import { SidebarUserFooter } from '@/components/ui/sidebar-user-footer';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

/** Удирдлагын навигац */
const controlItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Хяналтын самбар' },
  { href: '/admin/settings', icon: Settings, label: 'Тохиргоо' },
  { href: '/admin/audit-logs', icon: ScrollText, label: 'Аудит лог' },
  { href: '/admin/moderation', icon: ShieldAlert, label: 'Модерац' },
] as const;

/** Менежмент навигац */
const managementItems = [
  { href: '/admin/users', icon: Users, label: 'Хэрэглэгчид' },
  { href: '/admin/categories', icon: Layers, label: 'Ангилал' },
  { href: '/admin/enrollments', icon: GraduationCap, label: 'Элсэлт' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Захиалга' },
  { href: '/admin/live-sessions', icon: Video, label: 'Шууд хичээлүүд' },
] as const;

/** Аналитик навигац */
const analyticsItems = [
  { href: '/admin/analytics', icon: BarChart3, label: 'Хянах самбар' },
  { href: '/admin/analytics/revenue', icon: DollarSign, label: 'Орлого' },
  { href: '/admin/analytics/enrollment-trends', icon: TrendingUp, label: 'Элсэлт' },
  { href: '/admin/analytics/popular-courses', icon: Trophy, label: 'Топ сургалтууд' },
  { href: '/admin/analytics/events', icon: Activity, label: 'Event-ууд' },
] as const;

/** Main sidebar-тай нийцсэн nav item стиль */
const navItemBase =
  'h-11 rounded-xl px-4 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all hover:bg-primary/10 hover:text-primary';
/** Active item: background-ийг motion indicator руу шилжүүлсэн */
const navItemActive = 'text-white font-medium relative z-10 hover:bg-transparent hover:text-white';
/** Active indicator-ийн spring transition */
const indicatorTransition = { type: 'spring' as const, bounce: 0.15, duration: 0.4 };

/** Навигацийн бүлэг рендерлэх — groupId-ээр group дотор slide хийнэ */
function NavGroup({
  items,
  pathname,
  groupId,
}: {
  items: ReadonlyArray<{
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }>;
  pathname: string;
  groupId: string;
}) {
  return (
    <SidebarMenu className="gap-0.5">
      {items.map((item) => {
        const isActive =
          item.href === '/admin/analytics'
            ? pathname === '/admin/analytics'
            : pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <SidebarMenuItem key={item.href}>
            {isActive && (
              <motion.div
                layoutId={`admin-nav-${groupId}`}
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
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" className="border-none bg-background">
      {/* Лого — бусад sidebar-тай ижил */}
      <SidebarHeader className="px-5 pt-7 pb-4">
        <LearnifyLogo href="/admin/dashboard" />
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Удирдлага */}
        <SidebarGroup>
          <SidebarGroupContent>
            <NavGroup items={controlItems} pathname={pathname} groupId="control" />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Менежмент */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            Менежмент
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={managementItems} pathname={pathname} groupId="management" />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Аналитик */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            Аналитик
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={analyticsItems} pathname={pathname} groupId="analytics" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Нэгдсэн footer — буцах + гарах + хэрэглэгчийн мэдээлэл */}
      <SidebarUserFooter backLink={{ href: '/dashboard', label: 'Хяналтын самбар руу' }} />
    </Sidebar>
  );
}
