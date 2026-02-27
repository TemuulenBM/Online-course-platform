'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { useMyProfile } from '@/hooks/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/sidebar';

/** Удирдлагын навигац — дизайнаас */
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
] as const;

/** Аналитик навигац */
const analyticsItems = [
  { href: '/admin/analytics', icon: BarChart3, label: 'Хянах самбар' },
  { href: '/admin/analytics/revenue', icon: DollarSign, label: 'Орлого' },
  { href: '/admin/analytics/enrollment-trends', icon: TrendingUp, label: 'Элсэлт' },
  { href: '/admin/analytics/popular-courses', icon: Trophy, label: 'Топ сургалтууд' },
  { href: '/admin/analytics/events', icon: Activity, label: 'Event-ууд' },
] as const;

/** Role badge-ийн өнгөний mapping */
const roleBadgeVariants: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
};

/** Навигацийн бүлэг рендерлэх */
function NavGroup({
  items,
  pathname,
}: {
  items: ReadonlyArray<{
    href: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    label: string;
  }>;
  pathname: string;
}) {
  return (
    <SidebarMenu className="gap-1">
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
              className={cn(
                'h-11 rounded-xl px-4 font-medium text-slate-600 transition-all',
                'hover:bg-[#9c7aff]/10 hover:text-[#9c7aff]',
                isActive &&
                  'bg-[#9c7aff] text-white font-semibold shadow-[0_4px_15px_-3px_rgba(156,122,255,0.4)] hover:bg-[#8b6ae8] hover:text-white',
              )}
            >
              <Link href={item.href}>
                <item.icon className="size-[18px]" strokeWidth={2} />
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
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyProfile();

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : user?.email?.split('@')[0] || '';

  const initials = profile?.firstName
    ? `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <Sidebar collapsible="offcanvas" className="border-none bg-white">
      {/* Learnify лого — дизайны дагуу */}
      <SidebarHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#9c7aff] rounded-lg flex items-center justify-center">
            <GraduationCap className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Learnify</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold">
              Admin Panel
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Удирдлага — дизайны 4 зүйл */}
        <SidebarGroup>
          <SidebarGroupContent>
            <NavGroup items={controlItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Менежмент */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            Менежмент
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={managementItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Аналитик */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            Аналитик
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavGroup items={analyticsItems} pathname={pathname} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Хэрэглэгчийн мэдээлэл — дизайны footer */}
      <SidebarFooter className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 bg-[#9c7aff]/5 rounded-xl">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-[#9c7aff]/20 text-[#9c7aff] text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <Badge
            variant="secondary"
            className={cn('text-[10px] px-1.5 py-0 shrink-0', roleBadgeVariants[user?.role || ''])}
          >
            {user?.role === 'admin' ? 'Admin' : user?.role === 'teacher' ? 'Багш' : 'Суралцагч'}
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
