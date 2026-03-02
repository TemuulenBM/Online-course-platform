import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Хяналтын самбар' };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
