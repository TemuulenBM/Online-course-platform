'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutGrid, Users, Shield, Layers } from 'lucide-react';

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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

/** Admin sidebar навигацийн зүйлс */
const navItems = [
  { href: '/admin/users', icon: Users, labelKey: 'users' },
  { href: '/admin/categories', icon: Layers, labelKey: 'categories' },
  { href: '/dashboard', icon: LayoutGrid, labelKey: 'dashboard' },
] as const;

/** Role badge-ийн өнгөний mapping */
const roleBadgeVariants: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
};

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations('admin');
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
      <SidebarHeader className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-2 pl-2">
          <Shield className="size-5 text-purple-600" />
          <span className="text-lg font-bold">{t('adminPanel')}</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
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

      {/* Хэрэглэгчийн мэдээлэл */}
      <SidebarFooter className="px-3 pb-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="size-9 shrink-0">
            <AvatarFallback className="bg-purple-100 text-purple-700 text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900">{displayName}</p>
            <Badge
              variant="secondary"
              className={cn('mt-0.5 text-[10px] px-1.5 py-0', roleBadgeVariants[user?.role || ''])}
            >
              {tRoles(user?.role || 'student')}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
