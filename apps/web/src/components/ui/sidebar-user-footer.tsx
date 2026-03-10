'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';

import { useLogout, useMyProfile } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';

interface SidebarUserFooterProps {
  /** "Буцах" холбоос — Teacher/Admin sidebar-д ашиглагдана */
  backLink?: { href: string; label: string };
  /** Тохиргоо холбоос харуулах эсэх (default: false) */
  showSettings?: boolean;
  /** Тохиргоо идэвхтэй эсэх (pathname === '/profile') */
  settingsActive?: boolean;
  /** Тохиргоо active indicator-ийн layoutId */
  settingsLayoutId?: string;
}

/** Sidebar footer — 3 sidebar-д нэгдсэн user card + logout + optional settings/back */
export function SidebarUserFooter({
  backLink,
  showSettings = false,
  settingsActive = false,
}: SidebarUserFooterProps) {
  const t = useTranslations('nav');
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

  /** Нийтлэг button стиль */
  const btnClass =
    'h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

  return (
    <SidebarFooter className="px-3 pb-5">
      <SidebarMenu className="gap-0.5">
        {/* Буцах холбоос (Teacher/Admin) */}
        {backLink && (
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={btnClass}>
              <Link href={backLink.href}>
                <ArrowLeft className="size-[18px]" />
                <span>{backLink.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* Тохиргоо (Dashboard sidebar) */}
        {showSettings && (
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={settingsActive}
              className={
                settingsActive
                  ? 'h-11 rounded-xl px-4 text-sm font-medium text-white relative z-10 hover:bg-transparent hover:text-white'
                  : 'h-11 rounded-xl px-4 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all hover:bg-primary/10 hover:text-primary'
              }
            >
              <Link href="/profile">
                <Settings className="size-[18px]" />
                <span>{t('settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* Гарах */}
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={btnClass}
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
  );
}
