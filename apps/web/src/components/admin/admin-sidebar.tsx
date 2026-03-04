'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  LogOut,
  ArrowLeft,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout, useMyProfile } from '@/hooks/api';
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
const navItemActive = 'bg-primary text-white font-medium hover:bg-primary hover:text-white';

/** Навигацийн бүлэг рендерлэх */
function NavGroup({
  items,
  pathname,
}: {
  items: ReadonlyArray<{
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }>;
  pathname: string;
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
  const tRoles = useTranslations('roles');
  const logoutMutation = useLogout();
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || '';

  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  const roleName = tRoles(user?.role || 'student');

  return (
    <Sidebar collapsible="offcanvas" className="border-none bg-background">
      {/* Лого — LearnifyLogo + ADMIN PANEL badge */}
      <SidebarHeader className="px-5 pt-7 pb-4">
        <div>
          <LearnifyLogo href="/admin/dashboard" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold mt-1 pl-[46px]">
            Admin Panel
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Удирдлага */}
        <SidebarGroup>
          <SidebarGroupContent>
            <NavGroup items={controlItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Менежмент */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            Менежмент
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={managementItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Аналитик */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[11px] uppercase tracking-widest text-gray-400 font-semibold">
            Аналитик
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={analyticsItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Доод хэсэг — main sidebar-тай нийцсэн */}
      <SidebarFooter className="px-3 pb-5">
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Link href="/dashboard">
                <ArrowLeft className="size-[18px]" />
                <span>Хяналтын самбар руу</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-[18px]" />
              <span>Гарах</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        {/* Хэрэглэгчийн мэдээлэл — main sidebar-тай ижил */}
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
            <p className="text-[11px] text-muted-foreground">{roleName}</p>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
