import React from 'react';
import { Editor } from '@tiptap/react';

interface EditorStatusbarProps {
  editor: Editor | null;
  currentPage: number;
  totalPages: number;
  words: number;
  chars: number;
  onDeletePage?: () => void;
}

export function EditorStatusbar({ editor, currentPage, totalPages, words, chars, onDeletePage }: EditorStatusbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-2">
          <span>Halaman {currentPage} dari {totalPages}</span>
          <button 
            onClick={onDeletePage}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
            title="Hapus Halaman Ini"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
        <span>{words} kata</span>
        <span>{chars} karakter</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>A4 Layout</span>
        <span>Docsly AI</span>
      </div>
    </div>
  );
}
