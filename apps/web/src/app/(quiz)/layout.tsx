import React from 'react';

/**
 * Quiz layout — Sidebar-гүй бүтэн дэлгэцийн layout.
 * Quiz taking болон results хуудсууд ашиглана.
 */
export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
