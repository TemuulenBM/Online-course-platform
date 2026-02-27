'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscussionSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Хайлтын input — 300ms debounce-тэй */
export function DiscussionSearchBar({
  value,
  onChange,
  placeholder = 'Хайх...',
  className,
}: DiscussionSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  /** Гаднаас value өөрчлөгдөхөд sync */
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /** 300ms debounce */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
      />
    </div>
  );
}
