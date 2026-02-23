'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LearnifyLogoProps {
  href?: string;
  className?: string;
  /** light variant — dark bg дээр цагаан текст */
  variant?: 'default' | 'light';
}

/** Learnify брэнд лого — 3 өнгийн баар + текст */
export function LearnifyLogo({ href = '/', className, variant = 'default' }: LearnifyLogoProps) {
  const logo = (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex flex-col gap-[3px]">
        <div className="w-5 h-1.5 bg-[#FF6B6B] rounded-full rotate-[-45deg] origin-right ml-1" />
        <div className="w-5 h-1.5 bg-[#2E3035] rounded-full rotate-[-45deg] origin-right" />
        <div className="w-5 h-1.5 bg-[#8A93E5] rounded-full rotate-[-45deg] origin-right" />
      </div>
      <span
        className={cn(
          'text-xl font-extrabold tracking-wide uppercase',
          variant === 'light' ? 'text-white' : 'text-[#1B1B1B] dark:text-white',
        )}
      >
        Learnify
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  return logo;
}
