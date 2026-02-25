'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { useAuthStore } from '@/stores/auth-store';
import { ROUTES } from '@/lib/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    /** Admin зөвхөн — teacher-г зөвшөөрөхгүй */
    if (userRole !== 'admin') {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isHydrated, userRole, router]);

  if (!isHydrated) return null;

  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }

  return (
    <SidebarProvider className="bg-background">
      <AdminSidebar />
      <SidebarInset className="overflow-y-auto bg-white lg:m-4 lg:ml-0 lg:rounded-[2.5rem] lg:shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
