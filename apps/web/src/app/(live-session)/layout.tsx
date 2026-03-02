import React from 'react';

/**
 * Live session layout — Sidebar-гүй бүтэн дэлгэцийн layout.
 * Оюутны live classroom хуудас ашиглана.
 */
export default function LiveSessionLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
