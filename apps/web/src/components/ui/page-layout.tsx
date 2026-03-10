import { cn } from '@/lib/utils';

interface PageLayoutProps {
  /** Агуулгын max-width. Default: '7xl' */
  maxWidth?: '4xl' | '5xl' | '7xl';
  /** Section хоорондын зай. Default: 8 (gap-8) */
  gap?: 6 | 8;
  children: React.ReactNode;
  className?: string;
}

/** Tailwind JIT-д dynamic class ажиллахгүй тул explicit mapping */
const maxWidthMap = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
} as const;

const gapMap = {
  6: 'gap-6',
  8: 'gap-8',
} as const;

/** Нэгдсэн хуудасны layout — бүх dashboard хуудсуудад ижил padding, max-width, gap */
export function PageLayout({ maxWidth = '7xl', gap = 8, children, className }: PageLayoutProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div
        className={cn(`${maxWidthMap[maxWidth]} mx-auto flex flex-col ${gapMap[gap]}`, className)}
      >
        {children}
      </div>
    </div>
  );
}
