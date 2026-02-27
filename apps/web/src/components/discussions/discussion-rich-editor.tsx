'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiscussionRichEditorProps {
  content: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  minHeight?: string;
}

/** Tiptap WYSIWYG editor — Discussion нийтлэл болон хариултад ашиглагдана */
export function DiscussionRichEditor({
  content,
  onChange,
  placeholder = '',
  minHeight = '200px',
}: DiscussionRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: `prose prose-slate dark:prose-invert max-w-none p-4 focus:outline-none text-sm leading-relaxed`,
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML(), e.getText());
    },
  });

  /** Гаднаас content өөрчлөгдөхөд sync хийх */
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content]);

  /** Toolbar товчнууд */
  const toolbarGroups = [
    {
      group: 'format',
      items: [
        {
          icon: Bold,
          action: () => editor?.chain().focus().toggleBold().run(),
          active: editor?.isActive('bold'),
          label: 'Bold',
        },
        {
          icon: Italic,
          action: () => editor?.chain().focus().toggleItalic().run(),
          active: editor?.isActive('italic'),
          label: 'Italic',
        },
        {
          icon: UnderlineIcon,
          action: () => editor?.chain().focus().toggleUnderline().run(),
          active: editor?.isActive('underline'),
          label: 'Underline',
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
          label: 'Link',
        },
        {
          icon: ImageIcon,
          action: () => {
            const url = window.prompt('Image URL:');
            if (url) editor?.chain().focus().setImage({ src: url }).run();
          },
          active: false,
          label: 'Image',
        },
        {
          icon: Code,
          action: () => editor?.chain().focus().toggleCodeBlock().run(),
          active: editor?.isActive('codeBlock'),
          label: 'Code',
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
          label: 'Bullet List',
        },
        {
          icon: ListOrdered,
          action: () => editor?.chain().focus().toggleOrderedList().run(),
          active: editor?.isActive('orderedList'),
          label: 'Ordered List',
        },
        {
          icon: Quote,
          action: () => editor?.chain().focus().toggleBlockquote().run(),
          active: editor?.isActive('blockquote'),
          label: 'Quote',
        },
      ],
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
        {toolbarGroups.map((group, gi) => (
          <div key={group.group} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />}
            {group.items.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={btn.action}
                aria-label={btn.label}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  btn.active
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary',
                )}
              >
                <btn.icon className="size-4" />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={cn(
          '[&_.tiptap]:min-h-[inherit]',
          !editor?.getText() &&
            '[&_.tiptap.ProseMirror]:before:content-[attr(data-placeholder)] [&_.tiptap.ProseMirror]:before:text-slate-400 [&_.tiptap.ProseMirror]:before:float-left [&_.tiptap.ProseMirror]:before:h-0 [&_.tiptap.ProseMirror]:before:pointer-events-none',
        )}
        data-placeholder={placeholder}
      />
    </div>
  );
}
