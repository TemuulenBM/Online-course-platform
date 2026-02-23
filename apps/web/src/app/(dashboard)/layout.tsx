'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/dashboard/app-sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-[#F4F2F9]">
      <AppSidebar />
      <SidebarInset className="bg-white lg:rounded-[2.5rem] lg:m-4 lg:ml-0 lg:shadow-[0_2px_20px_-5px_rgba(0,0,0,0.06)] overflow-y-auto">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
