import { type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import React from 'react';

export function SuggestionBubbleMenu({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const getSuggestionPos = (editor: Editor): number | null => {
    let foundPos: number | null = null;
    editor.state.doc.nodesBetween(editor.state.selection.from, editor.state.selection.to, (node, pos) => {
      if (node.attrs && node.attrs.suggestion) {
        foundPos = pos;
        return false; // stop descending
      }
    });
    return foundPos;
  };

  const shouldShow = ({ editor }: { editor: Editor }) => {
    return getSuggestionPos(editor) !== null;
  };

  const handleAccept = () => {
    const pos = getSuggestionPos(editor);
    if (pos !== null) {
      (editor.commands as any).acceptSuggestion(pos);
    }
  };

  const handleReject = () => {
    const pos = getSuggestionPos(editor);
    if (pos !== null) {
      (editor.commands as any).rejectSuggestion(pos);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={shouldShow}
      // @ts-expect-error Tiptap type mismatch for tippyOptions
      tippyOptions={{ duration: 100, placement: 'top' as const }}
      className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md px-1.5 py-1 rounded-lg"
    >
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleAccept} 
        className="h-7 px-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors"
      >
        <Check className="h-3.5 w-3.5 mr-1" />
        Accept
      </Button>
      
      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleReject} 
        className="h-7 px-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-md transition-colors"
      >
        <X className="h-3.5 w-3.5 mr-1" />
        Reject
      </Button>
    </BubbleMenu>
  );
}
