'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearnifyLogoProps {
  href?: string;
  className?: string;
  /** light variant — dark bg дээр цагаан текст */
  variant?: 'default' | 'light';
}

/** Learnify брэнд лого — ягаан дөрвөлжин icon + текст */
export function LearnifyLogo({ href = '/', className, variant = 'default' }: LearnifyLogoProps) {
  const logo = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          variant === 'light' ? 'bg-white/20' : 'bg-[#8A93E5]',
        )}
      >
        <GraduationCap
          className={cn('w-5 h-5', variant === 'light' ? 'text-white' : 'text-white')}
        />
      </div>
      <span
        className={cn(
          'text-xl font-extrabold tracking-wide uppercase',
          variant === 'light' ? 'text-white' : 'text-[#1B1B1B] dark:text-white',
        )}
      >
        LEARNIFY
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
