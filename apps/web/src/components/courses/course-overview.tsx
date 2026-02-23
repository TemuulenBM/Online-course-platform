'use client';

import { useTranslations } from 'next-intl';

interface CourseOverviewProps {
  description: string;
  tags?: string[];
}

/** Сургалтын тойм — heading + тайлбар + түлхүүр үгс */
export function CourseOverview({ description, tags }: CourseOverviewProps) {
  const t = useTranslations('courses');

  return (
    <div className="flex flex-col gap-6 pt-6">
      {/* Heading */}
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('aboutCourse')}</h2>

      {/* Тайлбар */}
      <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
        {description.split('\n').map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Түлхүүр үгс */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-[#8A93E5]/10 text-[#8A93E5] text-xs font-medium px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
