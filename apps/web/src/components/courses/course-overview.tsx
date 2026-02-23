'use client';

interface CourseOverviewProps {
  description: string;
  tags?: string[];
}

/** Сургалтын тойм — тайлбар + түлхүүр үгс */
export function CourseOverview({ description, tags }: CourseOverviewProps) {
  return (
    <div className="flex flex-col gap-6 pt-6">
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
              className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
