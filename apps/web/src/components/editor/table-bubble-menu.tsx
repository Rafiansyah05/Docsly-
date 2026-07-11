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
      shouldShow={shouldShow}
      // @ts-expect-error Tiptap type mismatch for tippyOptions
      tippyOptions={{ duration: 100, placement: 'top' as const }}
      className="flex items-center gap-1 bg-white border border-slate-200 shadow-md p-1 rounded-lg"
    >
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnBefore().run()} title="Tambah Kolom Kiri" className="h-8 w-8 p-0 text-slate-700 hover:text-slate-800 hover:bg-slate-100">
        <ArrowRight className="h-4 w-4 rotate-180" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Tambah Kolom Kanan" className="h-8 w-8 p-0 text-slate-700 hover:text-slate-800 hover:bg-slate-100">
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()} title="Hapus Kolom" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash className="h-4 w-4" />
      </Button>
      
      <div className="w-px h-5 bg-slate-200 mx-1" />
      
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowBefore().run()} title="Tambah Baris Atas" className="h-8 w-8 p-0 text-slate-700 hover:text-slate-800 hover:bg-slate-100">
        <ArrowDown className="h-4 w-4 rotate-180" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()} title="Tambah Baris Bawah" className="h-8 w-8 p-0 text-slate-700 hover:text-slate-800 hover:bg-slate-100">
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteRow().run()} title="Hapus Baris" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
        <Trash className="h-4 w-4" />
      </Button>

      <div className="w-px h-5 bg-slate-200 mx-1" />
      
      <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteTable().run()} title="Hapus Tabel" className="h-8 px-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50">
        Hapus Tabel
      </Button>
    </BubbleMenu>
  );
}
