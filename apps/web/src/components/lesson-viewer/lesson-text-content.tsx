'use client';

interface LessonTextContentProps {
  textContent: string;
}

/** Текст контент — prose formatting */
export function LessonTextContent({ textContent }: LessonTextContentProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
      <div
        className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300"
        dangerouslySetInnerHTML={{ __html: textContent }}
      />
    </div>
  );
}
