'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Clock,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLessonContent, useSetTextContent } from '@/hooks/api';
import { Textarea } from '@/components/ui/textarea';

interface TextContentEditorProps {
  lessonId: string;
  onBack: () => void;
}

/** Багшийн TipTap WYSIWYG текст контент editor */
export function TextContentEditor({ lessonId, onBack }: TextContentEditorProps) {
  const t = useTranslations('teacher');
  const { data: content, isLoading } = useLessonContent(lessonId);
  const setTextMutation = useSetTextContent(lessonId);

  const [activeTab, setActiveTab] = useState<'richtext' | 'markdown'>('richtext');
  const [markdown, setMarkdown] = useState('');
  const [readingTime, setReadingTime] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  /** TipTap editor тохиргоо */
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-slate dark:prose-invert max-w-none p-6 min-h-[400px] focus:outline-none text-lg leading-relaxed',
      },
    },
  });

  /** Контент ачаалагдах үед editor-д тавих */
  useEffect(() => {
    if (content && editor) {
      editor.commands.setContent(content.textContent || '');
      setMarkdown(content.textContent || '');
      const meta = content.metadata as Record<string, unknown> | undefined;
      if (meta?.readingTimeMinutes) {
        setReadingTime(String(meta.readingTimeMinutes));
      }
    }
  }, [content, editor]);

  /** Хадгалах */
  const handleSave = useCallback(() => {
    const html = activeTab === 'richtext' ? (editor?.getHTML() ?? '') : markdown;
    setTextMutation.mutate(
      {
        lessonId,
        html,
        readingTimeMinutes: readingTime ? Number(readingTime) : undefined,
      },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          toast.success(t('contentSavedSuccess'));
        },
      },
    );
  }, [activeTab, editor, markdown, lessonId, readingTime, setTextMutation, t]);

  /** Toolbar товчнууд */
  const toolbarButtons = [
    {
      group: 'format',
      items: [
        {
          icon: Bold,
          action: () => editor?.chain().focus().toggleBold().run(),
          active: editor?.isActive('bold'),
        },
        {
          icon: Italic,
          action: () => editor?.chain().focus().toggleItalic().run(),
          active: editor?.isActive('italic'),
        },
        {
          icon: UnderlineIcon,
          action: () => editor?.chain().focus().toggleUnderline().run(),
          active: editor?.isActive('underline'),
        },
      ],
    },
    {
      group: 'list',
      items: [
        {
          icon: List,
          action: () => editor?.chain().focus().toggleBulletList().run(),
          active: editor?.isActive('bulletList'),
        },
        {
          icon: ListOrdered,
          action: () => editor?.chain().focus().toggleOrderedList().run(),
          active: editor?.isActive('orderedList'),
        },
      ],
    },
    {
      group: 'insert',
      items: [
        {
          icon: LinkIcon,
          action: () => {
            const url = window.prompt('URL:');
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          },
          active: editor?.isActive('link'),
        },
        {
          icon: ImageIcon,
          action: () => {
            const url = window.prompt('Image URL:');
            if (url) editor?.chain().focus().setImage({ src: url }).run();
          },
          active: false,
        },
        {
          icon: Code,
          action: () => editor?.chain().focus().toggleCodeBlock().run(),
          active: editor?.isActive('codeBlock'),
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500">
        Ачааллаж байна...
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight">
            {t('textContentEditor')}
          </h1>
          <p className="text-slate-500 text-sm">{t('textContentEditorDesc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-xl h-10 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft className="size-4 mr-2" />
            {t('goBack')}
          </button>
          <button
            onClick={handleSave}
            disabled={setTextMutation.isPending}
            className="flex items-center justify-center rounded-xl h-10 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
          >
            <Save className="size-4 mr-2" />
            {setTextMutation.isPending ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-xl p-4 flex items-center gap-3 text-green-700 dark:text-green-400">
          <CheckCircle className="size-5" />
          <p className="text-sm font-medium">{t('contentSavedSuccess')}</p>
        </div>
      )}

      {/* Editor card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-primary/10 overflow-hidden flex flex-col">
        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
          <button
            onClick={() => setActiveTab('richtext')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
              activeTab === 'richtext'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-primary'
            }`}
          >
            {t('richTextTab')}
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
              activeTab === 'markdown'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-500 hover:text-primary'
            }`}
          >
            {t('markdownTab')}
          </button>
        </div>

        {/* TipTap toolbar — зөвхөн richtext tab-д */}
        {activeTab === 'richtext' && (
          <div className="p-1 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
            {toolbarButtons.map((group, gi) => (
              <div key={group.group} className="flex gap-0.5 p-1">
                {gi > 0 && <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 my-auto mx-1" />}
                {group.items.map((btn, bi) => (
                  <button
                    key={bi}
                    onClick={btn.action}
                    className={`p-2 rounded-lg transition-colors ${
                      btn.active
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <btn.icon className="size-5" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Editor content */}
        <div className="relative min-h-[400px] flex flex-col">
          {activeTab === 'richtext' ? (
            <EditorContent editor={editor} className="flex-1" />
          ) : (
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={t('textPlaceholder')}
              className="flex-1 w-full p-6 bg-transparent border-none focus:ring-0 font-mono text-sm leading-relaxed resize-none min-h-[400px]"
            />
          )}
        </div>
      </div>

      {/* Bottom grid — settings + tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Хичээлийн тохиргоо */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
            <Clock className="size-5 text-primary" />
            <h3>{t('lessonSettings')}</h3>
          </div>
          <div className="space-y-1.5">
            <label
              className="text-slate-600 dark:text-slate-400 text-sm font-medium"
              htmlFor="reading-time"
            >
              {t('readingTimeLabel')}
            </label>
            <div className="relative">
              <input
                id="reading-time"
                type="number"
                min={1}
                value={readingTime}
                onChange={(e) => setReadingTime(e.target.value)}
                placeholder={t('readingTimePlaceholder')}
                className="w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-primary focus:border-primary px-4 text-slate-900 dark:text-white"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                {t('readingTimeUnit')}
              </div>
            </div>
          </div>
        </div>

        {/* Зөвлөмж */}
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/20 space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Lightbulb className="size-5" />
            <h3>{t('tipsTitle')}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('readingTimeTip')}
          </p>
        </div>
      </div>
    </div>
  );
}
