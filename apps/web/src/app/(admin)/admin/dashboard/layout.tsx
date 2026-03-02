import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Админ хяналт' };

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
