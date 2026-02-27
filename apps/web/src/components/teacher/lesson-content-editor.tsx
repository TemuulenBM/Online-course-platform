'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Lesson } from '@ocp/shared-types';

import {
  useLessonContent,
  useSetTextContent,
  useSetVideoContent,
  useUploadFile,
} from '@/hooks/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface LessonContentEditorProps {
  lesson: Lesson;
  onClose: () => void;
}

export function LessonContentEditor({ lesson, onClose }: LessonContentEditorProps) {
  const t = useTranslations('teacher');
  const { data: content, isLoading } = useLessonContent(lesson.id);

  const setTextMutation = useSetTextContent(lesson.id);
  const setVideoMutation = useSetVideoContent(lesson.id);
  const uploadMutation = useUploadFile(lesson.id);

  /* --- TEXT states --- */
  const [html, setHtml] = useState('');

  /* --- VIDEO states --- */
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');

  useEffect(() => {
    if (content) {
      setHtml(content.textContent || '');
      setVideoUrl(content.videoUrl || '');
      setThumbnailUrl(content.thumbnailUrl || '');
      setDurationSeconds(content.duration ? String(content.duration) : '');
    }
  }, [content]);

  const handleSaveText = () => {
    setTextMutation.mutate(
      { lessonId: lesson.id, html },
      { onSuccess: () => toast.success(t('contentSaved')) },
    );
  };

  const handleSaveVideo = () => {
    setVideoMutation.mutate(
      {
        lessonId: lesson.id,
        videoUrl: videoUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
      },
      { onSuccess: () => toast.success(t('contentSaved')) },
    );
  };

  const handleUpload = (fileType: 'video' | 'thumbnail') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = fileType === 'video' ? 'video/*' : 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      uploadMutation.mutate(
        { file, fileType },
        { onSuccess: () => toast.success(t('contentSaved')) },
      );
    };
    input.click();
  };

  const isSaving =
    setTextMutation.isPending || setVideoMutation.isPending || uploadMutation.isPending;

  return (
    <div className="border rounded-xl p-4 bg-gray-50/50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {t('content')} — {lesson.title}
        </h3>
        <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">{t('savingContent')}</p>
      ) : lesson.lessonType === 'text' ? (
        /* --- TEXT EDITOR --- */
        <div className="space-y-3">
          <Tabs defaultValue="edit">
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="text-xs">
                {t('edit')}
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                {t('preview')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder={t('htmlContentPlaceholder')}
                rows={12}
                className="font-mono text-sm"
              />
            </TabsContent>
            <TabsContent value="preview">
              <div
                className="prose prose-sm max-w-none border rounded-lg p-4 min-h-[200px] bg-white"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </TabsContent>
          </Tabs>
          <Button onClick={handleSaveText} disabled={isSaving} size="sm">
            {isSaving ? t('savingContent') : t('saveContent')}
          </Button>
        </div>
      ) : lesson.lessonType === 'video' ? (
        /* --- VIDEO EDITOR --- */
        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">{t('videoUrl')}</Label>
            <div className="flex gap-2">
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={t('videoUrlPlaceholder')}
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-shrink-0"
                onClick={() => handleUpload('video')}
                disabled={uploadMutation.isPending}
              >
                <Upload className="size-3.5" />
                {t('uploadVideo')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t('thumbnailUrl')}</Label>
            <div className="flex gap-2">
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder={t('thumbnailUrlPlaceholder')}
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 flex-shrink-0"
                onClick={() => handleUpload('thumbnail')}
                disabled={uploadMutation.isPending}
              >
                <Upload className="size-3.5" />
                {t('uploadThumbnail')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t('durationSeconds')}</Label>
            <Input
              type="number"
              min={0}
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              className="text-sm max-w-[200px]"
            />
          </div>

          <Button onClick={handleSaveVideo} disabled={isSaving} size="sm">
            {isSaving ? t('savingContent') : t('saveContent')}
          </Button>
        </div>
      ) : (
        /* --- OTHER TYPES --- */
        <p className="text-sm text-gray-400 py-4">{t('noContent')}</p>
      )}
    </div>
  );
}
