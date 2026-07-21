import { type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/components/ui/button';
import { Trash, ArrowRight, ArrowDown } from 'lucide-react';
import React from 'react';

export function TableBubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return editor.isActive('table');
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={shouldShow}
      // @ts-expect-error Tiptap type mismatch for tippyOptions
      tippyOptions={{ duration: 100, placement: 'top' as const, zIndex: 999999, appendTo: () => document.body }}
      className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md p-1 rounded-lg"
    >
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnBefore().run()} title="Tambah Kolom Kiri" className="h-8 w-8 p-0 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <ArrowRight className="h-4 w-4 rotate-180" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom Kanan" className="h-8 w-8 p-0 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()} title="Hapus Kolom" className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30">
        <Trash className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
      
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowBefore().run()} title="Tambah Baris Atas" className="h-8 w-8 p-0 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <ArrowDown className="h-4 w-4 rotate-180" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris Bawah" className="h-8 w-8 p-0 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteRow().run()} title="Hapus Baris" className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30">
        <Trash className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />
      
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel" className="h-8 px-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30">
        Hapus Tabel
      </Button>
    </BubbleMenu>
  );
}
