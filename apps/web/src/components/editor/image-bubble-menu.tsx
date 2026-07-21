import { BubbleMenu } from '@tiptap/react/menus';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Editor } from '@tiptap/core';

export function ImageBubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubbleMenu"
      tippyOptions={{ duration: 100, placement: 'top' as const, zIndex: 999999, appendTo: () => document.body }}
      shouldShow={({ editor }) => editor.isActive('image') || editor.isActive('imageResize') || editor.isActive('imagePlaceholder')}
      className="flex items-center gap-1 p-1 rounded-md border bg-white dark:bg-zinc-900 shadow-md"
    >
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
        onClick={() => {
          editor.chain().focus().setTextAlign('left').updateAttributes('image', { containerStyle: 'margin: 0 auto 0 0' }).updateAttributes('imageResize', { containerStyle: 'margin: 0 auto 0 0' }).updateAttributes('imagePlaceholder', { containerStyle: 'margin: 0 auto 0 0' }).run();
        }}
        title="Rata Kiri"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
        onClick={() => {
          editor.chain().focus().setTextAlign('center').updateAttributes('image', { containerStyle: 'margin: 0 auto' }).updateAttributes('imageResize', { containerStyle: 'margin: 0 auto' }).updateAttributes('imagePlaceholder', { containerStyle: 'margin: 0 auto' }).run();
        }}
        title="Rata Tengah"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
        onClick={() => {
          editor.chain().focus().setTextAlign('right').updateAttributes('image', { containerStyle: 'margin: 0 0 0 auto' }).updateAttributes('imageResize', { containerStyle: 'margin: 0 0 0 auto' }).updateAttributes('imagePlaceholder', { containerStyle: 'margin: 0 0 0 auto' }).run();
        }}
        title="Rata Kanan"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </BubbleMenu>
  );
}
