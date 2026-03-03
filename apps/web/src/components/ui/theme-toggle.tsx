'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/** Гэрэл / харанхуй горим солих товч */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration mismatch-аас зайлсхийх — client mount хүлээх
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-10" />;

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2.5 rounded-xl hover:bg-primary/10 text-slate-500 dark:text-slate-400 hover:text-primary transition-all"
      aria-label="Горим солих"
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
