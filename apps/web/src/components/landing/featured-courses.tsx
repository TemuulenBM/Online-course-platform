'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/courses/course-card';
import { CourseCardSkeleton } from '@/components/courses/course-card-skeleton';
import { useCourseList } from '@/hooks/api';
import { ROUTES } from '@/lib/constants';
import type { Course } from '@ocp/shared-types';
import { useEffect, useRef, useState } from 'react';

/** Fallback сургалтууд — API ажиллахгүй үед */
const fallbackCourses: Course[] = [
  {
    id: '1',
    title: 'Product Design Tutorial',
    slug: 'product-design-tutorial',
    description: 'Learn product design from scratch',
    instructorId: 'i1',
    categoryId: 'c1',
    price: 49000,
    difficulty: 'beginner',
    language: 'en',
    status: 'published',
    durationMinutes: 120,
    instructorName: 'Adeline Watson',
    categoryName: 'Design',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    title: 'Illustration Masterclass',
    slug: 'illustration-masterclass',
    description: 'Master digital illustration',
    instructorId: 'i2',
    categoryId: 'c1',
    price: 35000,
    difficulty: 'intermediate',
    language: 'en',
    status: 'published',
    durationMinutes: 180,
    instructorName: 'John Doe',
    categoryName: 'Design',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '3',
    title: 'UX Research: Advanced',
    slug: 'ux-research-advanced',
    description: 'Advanced UX research methods',
    instructorId: 'i3',
    categoryId: 'c1',
    price: 59000,
    difficulty: 'advanced',
    language: 'en',
    status: 'published',
    durationMinutes: 240,
    instructorName: 'Sarah Jenkins',
    categoryName: 'Design',
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '4',
    title: 'React for Professionals',
    slug: 'react-for-professionals',
    description: 'Professional React development',
    instructorId: 'i4',
    categoryId: 'c2',
    price: 79000,
    difficulty: 'advanced',
    language: 'en',
    status: 'published',
    durationMinutes: 360,
    instructorName: 'Michael Tan',
    categoryName: 'Development',
    createdAt: '',
    updatedAt: '',
  },
];

/** Онцлох сургалтуудын хэсэг */
export function FeaturedCourses() {
  const t = useTranslations('landing');
  const { data, isLoading } = useCourseList({ limit: 4 });
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const courses = data?.data?.length ? data.data : fallbackCourses;

  return (
    <section ref={ref} className="py-16 lg:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Гарчиг */}
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-black text-[#1B1B1B] dark:text-white">
            {t('featuredCourses')}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('featuredCoursesSubtitle')}
          </p>
        </div>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <div
                key={course.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease-out ${index * 0.1}s`,
                }}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}

        {/* View All товч */}
        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary/70"
          >
            <Link href={ROUTES.COURSES}>
              {t('viewAllCourses')}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
