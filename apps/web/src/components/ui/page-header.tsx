import type { LucideIcon } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Sidebar nav-тай тохирох icon */
  icon?: LucideIcon;
  /** Хуудасны гарчиг (h1) */
  title: string;
  /** Дэд тайлбар */
  subtitle?: string;
  /** Гарчигын хажууд нэмэлт element — badge гэх мэт */
  titleExtra?: React.ReactNode;
  /** Баруун талын actions — filter, button гэх мэт */
  actions?: React.ReactNode;
  className?: string;
}

/** Нэгдсэн хуудасны header — бүх dashboard хуудсуудад ижил гарчиг, icon, SidebarTrigger */
export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  titleExtra,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4', className)}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        {Icon && <Icon className="size-6 text-primary shrink-0" />}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {titleExtra}
          </div>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}
