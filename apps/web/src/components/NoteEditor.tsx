'use client';

import { useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import type { MarkdownStorage } from 'tiptap-markdown';
import styles from './NoteBoard.module.css';

type NoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

function extractMarkdown(instance: Editor) {
  const storage = instance.storage as Editor['storage'] & {
    markdown?: MarkdownStorage;
  };
  return storage.markdown?.getMarkdown() ?? instance.getText();
}

export function NoteEditor({ value, onChange }: NoteEditorProps) {
  const editor = useEditor({
    content: value || '',
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Update your summary…',
      }),
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    onUpdate({ editor }) {
      onChange(extractMarkdown(editor));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const currentValue = extractMarkdown(editor);
    if ((value || '') !== currentValue) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      label: 'B',
      aria: 'Toggle bold',
      active: editor.isActive('bold'),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      aria: 'Toggle italic',
      active: editor.isActive('italic'),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: '•',
      aria: 'Toggle bullet list',
      active: editor.isActive('bulletList'),
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: '1.',
      aria: 'Toggle ordered list',
      active: editor.isActive('orderedList'),
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className={`${styles.richEditorShell} nodrag nopan`}>
      <div
        className={`${styles.richEditorToolbar} nodrag nopan`}
        role="toolbar"
        aria-label="Formatting options"
      >
        {toolbarButtons.map((button) => (
          <button
            key={button.aria}
            type="button"
            className={`${styles.richEditorButton} nodrag nopan`}
            data-active={button.active ? 'true' : undefined}
            onClick={button.onClick}
            aria-label={button.aria}
          >
            {button.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className={`${styles.richEditor} nodrag nopan`} />
    </div>
  );
}
