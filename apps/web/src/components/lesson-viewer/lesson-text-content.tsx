'use client';

interface LessonTextContentProps {
  textContent: string;
}

/** Текст контент — дизайны prose formatting, blockquote + image стиль */
export function LessonTextContent({ textContent }: LessonTextContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 [&_blockquote]:bg-primary/5 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:p-4 [&_blockquote]:my-6 [&_blockquote]:rounded-r-lg [&_blockquote]:not-italic [&_blockquote_p]:italic [&_blockquote_p]:text-slate-700 dark:[&_blockquote_p]:text-slate-300 [&_img]:rounded-xl [&_img]:overflow-hidden [&_img]:max-h-[300px] [&_img]:w-full [&_img]:object-cover">
      <div dangerouslySetInnerHTML={{ __html: textContent }} />
    </div>
  );
}
