'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white lg:rounded-[2.5rem] lg:m-4 lg:ml-0 lg:shadow-sm overflow-y-auto">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
