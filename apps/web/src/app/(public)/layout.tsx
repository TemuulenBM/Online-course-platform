import type { ReactNode } from 'react';

/** Public layout — sidebar-гүй, нэвтрэлт шаардахгүй хуудсуудад */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex flex-col">{children}</div>;
}
