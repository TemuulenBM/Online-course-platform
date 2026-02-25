'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Save,
  Upload,
  Film,
  Image as ImageIcon,
  Subtitles,
  Trash2,
  Plus,
  PlusCircle,
  X,
  Paperclip,
  FileText,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLessonContent, useSetVideoContent, useUploadFile } from '@/hooks/api';
import type { ContentAttachment } from '@/components/lesson-viewer/lesson-attachments';

interface VideoContentEditorProps {
  lessonId: string;
  onBack: () => void;
}

interface SubtitleFile {
  name: string;
  url: string;
}

/** Багшийн видео контент editor — upload + settings */
export function VideoContentEditor({ lessonId, onBack }: VideoContentEditorProps) {
  const t = useTranslations('teacher');
  const { data: content, isLoading } = useLessonContent(lessonId);
  const setVideoMutation = useSetVideoContent(lessonId);
  const uploadMutation = useUploadFile(lessonId);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  /* --- States --- */
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [subtitles, setSubtitles] = useState<SubtitleFile[]>([]);
  const [attachments, setAttachments] = useState<ContentAttachment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  /** Контент ачаалагдах үед state-уудыг тавих */
  useEffect(() => {
    if (content) {
      setVideoUrl(content.videoUrl || '');
      setThumbnailUrl(content.thumbnailUrl || '');
      setDurationSeconds(content.duration ? String(content.duration) : '');
      const meta = content.metadata as Record<string, unknown> | undefined;
      if (meta?.subtitles) setSubtitles(meta.subtitles as SubtitleFile[]);
      if (meta?.attachments) setAttachments(meta.attachments as ContentAttachment[]);
    }
  }, [content]);

  /** Хадгалах */
  const handleSave = useCallback(() => {
    setVideoMutation.mutate(
      {
        lessonId,
        videoUrl: videoUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
      },
      {
        onSuccess: () => toast.success(t('contentSavedSuccess')),
      },
    );
  }, [lessonId, videoUrl, thumbnailUrl, durationSeconds, setVideoMutation, t]);

  /** Файл upload хийх */
  const handleUpload = (fileType: 'video' | 'thumbnail' | 'attachment' | 'subtitle') => {
    const ref =
      fileType === 'video'
        ? videoInputRef
        : fileType === 'thumbnail'
          ? thumbnailInputRef
          : fileType === 'subtitle'
            ? subtitleInputRef
            : attachmentInputRef;
    ref.current?.click();
  };

  const onFileSelected = (
    fileType: 'video' | 'thumbnail' | 'attachment' | 'subtitle',
    file: File,
  ) => {
    setUploadProgress(0);
    uploadMutation.mutate(
      { file, fileType },
      {
        onSuccess: () => {
          setUploadProgress(null);
          toast.success(t('contentSavedSuccess'));
        },
        onError: () => setUploadProgress(null),
      },
    );
    /* Simulate progress (actual progress: axios onUploadProgress) */
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
  };

  /** Subtitle устгах */
  const removeSubtitle = (index: number) => {
    setSubtitles((prev) => prev.filter((_, i) => i !== index));
  };

  /** Attachment устгах */
  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /** Файлын хэмжээг форматлах */
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        Ачааллаж байна...
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto space-y-6">
      {/* Hidden file inputs */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected('video', file);
        }}
      />
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected('thumbnail', file);
        }}
      />
      <input
        ref={attachmentInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected('attachment', file);
        }}
      />
      <input
        ref={subtitleInputRef}
        type="file"
        accept=".vtt,.srt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected('subtitle', file);
        }}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            {t('videoContentEditor')}
          </h1>
          <p className="text-primary/70 text-sm font-medium">{t('videoContentEditorDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-xl h-12 px-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="size-4 mr-2" />
            {t('goBack')}
          </button>
          <button
            onClick={handleSave}
            disabled={setVideoMutation.isPending}
            className="flex items-center justify-center rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-70"
          >
            <Save className="size-4 mr-2" />
            {setVideoMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Media upload section */}
        <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-primary/10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Upload className="size-5 text-primary" />
            {t('mediaUpload')}
          </h3>

          {/* Video drop zone */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleUpload('video')}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer p-4"
            >
              <Film className="size-10 text-primary mb-2" />
              <p className="text-slate-900 dark:text-slate-100 text-base font-medium">
                {t('videoFileLabel')}
              </p>
              <p className="text-slate-500 text-xs">{t('videoFileDragHint')}</p>
            </button>

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-slate-500">
                    {t('uploadProgressLabel')}
                  </span>
                  <span className="text-xs font-bold text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail drop zone */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleUpload('thumbnail')}
              className="w-full aspect-video rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer p-4"
            >
              <ImageIcon className="size-10 text-primary mb-2" />
              <p className="text-slate-900 dark:text-slate-100 text-base font-medium">
                {t('thumbnailLabel')}
              </p>
              <p className="text-slate-500 text-xs">{t('thumbnailHint')}</p>
            </button>
          </div>
        </div>

        {/* 2. Settings section */}
        <div className="flex flex-col gap-6 p-6 bg-white dark:bg-slate-900 rounded-xl border border-primary/10">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Info className="size-5 text-primary" />
            {t('generalInfo')}
          </h3>

          <div className="flex flex-col gap-4">
            {/* Video URL */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('videoUrlLabel')}
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={t('videoUrlPlaceholderNew')}
                className="w-full rounded-lg border border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 px-4 py-2.5"
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('durationSecondsLabel')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-primary/20 bg-primary/5 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 px-4 py-2.5 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                  {t('durationSecondsUnit')}
                </span>
              </div>
            </div>
          </div>

          {/* Subtitles section */}
          <div className="flex flex-col gap-3 pt-4 border-t border-primary/10">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold">{t('subtitlesLabel')}</h4>
              <button
                onClick={() => handleUpload('subtitle')}
                className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="size-3.5" /> {t('addSubtitle')}
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {subtitles.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <Subtitles className="size-4 text-primary" />
                    <span className="text-xs font-medium">{sub.name}</span>
                  </div>
                  <button
                    onClick={() => removeSubtitle(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              {subtitles.length === 0 && (
                <p className="text-xs text-slate-400 py-2">Хадмал орчуулга нэмэгдээгүй байна</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Attachments section */}
      <div className="flex flex-col gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl border border-primary/10">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Paperclip className="size-5 text-primary" />
            {t('attachmentsSection')}
          </h3>
          <span className="text-xs text-slate-400">{t('attachmentsMaxSize')}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Add attachment button */}
          <button
            onClick={() => handleUpload('attachment')}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <PlusCircle className="size-8 text-primary mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {t('addFileLabel')}
            </span>
          </button>

          {/* Attachment items */}
          {attachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-primary/5"
            >
              <div className="size-10 bg-primary/20 flex items-center justify-center rounded-lg shrink-0">
                <FileText className="size-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{att.name}</p>
                <p className="text-[10px] text-slate-500">{formatSize(att.size)}</p>
              </div>
              <button
                onClick={() => removeAttachment(i)}
                className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer save bar */}
      <div className="flex items-center justify-between p-6 bg-primary/5 rounded-xl border border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Info className="size-5" />
          <p className="text-xs font-medium">{t('saveInfoBar')}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="text-slate-500 text-sm font-bold px-4 py-2 hover:text-slate-700 transition-colors"
          >
            Цуцлах
          </button>
          <button
            onClick={handleSave}
            disabled={setVideoMutation.isPending}
            className="bg-primary text-white text-sm font-bold px-10 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-70"
          >
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  );
}
