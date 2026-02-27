'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher/teacher-sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (userRole !== 'teacher' && userRole !== 'admin') {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isHydrated, userRole, router]);

  if (!isHydrated) return null;

  if (!isAuthenticated || (userRole !== 'teacher' && userRole !== 'admin')) {
    return null;
  }

  return (
    <SidebarProvider className="bg-background">
      <TeacherSidebar />
      <SidebarInset className="bg-white lg:rounded-[2.5rem] lg:m-4 lg:ml-0 lg:shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)] overflow-y-auto">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
