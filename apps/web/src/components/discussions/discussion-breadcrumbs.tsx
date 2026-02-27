'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DiscussionBreadcrumbsProps {
  items: BreadcrumbItem[];
}

/** Breadcrumb navigation */
export function DiscussionBreadcrumbs({ items }: DiscussionBreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-6" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="size-3.5 text-slate-400" />}
          {item.href ? (
            <Link
              href={item.href}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
