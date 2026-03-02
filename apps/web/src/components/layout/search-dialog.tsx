'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, BookOpen, ArrowRight } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourseList } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';

/** Сургалт хайх ⌘K command dialog — industry-standard хайлтын туршлага */
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  /* Бодит хайлт — 300ms debounce-г cmdk өөрөө зохицуулна */
  const { data, isLoading } = useCourseList(
    query.length >= 2 ? { search: query, limit: 8 } : undefined,
  );

  /* ⌘K / Ctrl+K keyboard shortcut */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* Dialog хаагдах үед query цэвэрлэх */
  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
    if (!value) setQuery('');
  }, []);

  /* Сургалт сонгоход navigate хийх */
  const handleSelect = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery('');
      router.push(ROUTES.COURSE_DETAIL(slug));
    },
    [router],
  );

  /* Бүх сургалтыг харах */
  const handleViewAll = useCallback(() => {
    setOpen(false);
    setQuery('');
    router.push(query ? `${ROUTES.COURSES}?search=${encodeURIComponent(query)}` : ROUTES.COURSES);
  }, [router, query]);

  const courses = data?.data ?? [];
  const showResults = query.length >= 2;

  return (
    <>
      {/* Search trigger товч */}
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-500 dark:text-gray-400"
        onClick={() => setOpen(true)}
        aria-label="Хайх"
      >
        <Search className="size-5" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Сургалт хайх"
        description="Сургалтын нэр, сэдвээр хайж олоорой"
        showCloseButton={false}
      >
        <CommandInput placeholder="Сургалт хайх... (⌘K)" value={query} onValueChange={setQuery} />
        <CommandList className="max-h-[400px]">
          {/* Хайж байх үеийн skeleton */}
          {isLoading && showResults && (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-2 py-1.5">
                  <Skeleton className="size-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Хайлтын үр дүн */}
          {!isLoading && showResults && courses.length === 0 && (
            <CommandEmpty>
              <div className="py-6 text-center">
                <BookOpen className="size-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">&ldquo;{query}&rdquo; сургалт олдсонгүй</p>
              </div>
            </CommandEmpty>
          )}

          {!isLoading && showResults && courses.length > 0 && (
            <CommandGroup heading="Сургалтууд">
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={`${course.title} ${course.slug}`}
                  onSelect={() => handleSelect(course.slug)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {/* Thumbnail эсвэл fallback icon */}
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <Image
                        src={course.thumbnailUrl}
                        alt={course.title}
                        width={36}
                        height={36}
                        className="size-full object-cover"
                      />
                    ) : (
                      <BookOpen className="size-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {course.difficulty} •{' '}
                      {course.price === 0 || course.price === null
                        ? 'Үнэгүй'
                        : `₮${Number(course.price).toLocaleString()}`}
                    </p>
                  </div>
                  <ArrowRight className="size-3.5 text-gray-300 shrink-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Default state — хайлт хийхээс өмнө */}
          {!showResults && (
            <div className="py-8 text-center">
              <Search className="size-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Сургалтын нэр эсвэл сэдвийг бичнэ үү
              </p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                Хамгийн багадаа 2 тэмдэгт оруулна уу
              </p>
            </div>
          )}
        </CommandList>

        {/* Footer — бүх сургалтыг харах */}
        <div className="border-t border-gray-100 dark:border-slate-800 p-2">
          <button
            onClick={handleViewAll}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary transition-colors"
          >
            <span>Бүх сургалтыг харах</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </CommandDialog>
    </>
  );
}
