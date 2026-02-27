'use client';

import { Paperclip, FileText, FolderArchive, Sheet, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface ContentAttachment {
  name: string;
  url: string;
  size: number;
  fileType: string;
}

interface LessonAttachmentsProps {
  attachments: ContentAttachment[];
}

/** Файлын төрлөөр icon + өнгө буцаах */
function getFileIcon(fileType: string) {
  const lower = fileType.toLowerCase();
  if (lower.includes('pdf')) return { icon: FileText, bg: 'bg-red-100', text: 'text-red-600' };
  if (lower.includes('doc') || lower.includes('docx'))
    return { icon: FileText, bg: 'bg-blue-100', text: 'text-blue-600' };
  if (lower.includes('zip') || lower.includes('rar'))
    return { icon: FolderArchive, bg: 'bg-orange-100', text: 'text-orange-600' };
  if (lower.includes('xls') || lower.includes('xlsx') || lower.includes('csv'))
    return { icon: Sheet, bg: 'bg-green-100', text: 'text-green-600' };
  return { icon: FileText, bg: 'bg-slate-100', text: 'text-slate-600' };
}

/** Файлын хэмжээг форматлах */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Видео хичээлийн sidebar-д хавсралт файлууд */
export function LessonAttachments({ attachments }: LessonAttachmentsProps) {
  const t = useTranslations('lessonViewer');

  if (!attachments.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-primary/5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="size-5 text-primary" />
        <h3 className="font-bold text-lg">{t('attachmentsTitle')}</h3>
      </div>
      <div className="space-y-3">
        {attachments.map((file, idx) => {
          const { icon: Icon, bg, text } = getFileIcon(file.fileType);
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-primary/5 hover:border-primary/20 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-lg ${bg} ${text} flex items-center justify-center`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold truncate max-w-[140px]">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <a
                href={file.url}
                download
                className="size-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="size-4" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
