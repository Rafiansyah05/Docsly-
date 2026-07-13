'use client';
import React, { useState, useEffect } from 'react';
import { updateDocumentTitle } from '@/lib/actions/document';

export function DocumentHeader({ documentId, initialTitle }: { documentId: string, initialTitle: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [hasManuallyEdited, setHasManuallyEdited] = useState(false);

  useEffect(() => {
    const handleAutoTitle = (e: CustomEvent) => {
      // Only auto-update if the title is still the default and user hasn't edited it
      if (title === 'Dokumen Tanpa Judul' && !hasManuallyEdited && e.detail) {
        setTitle(e.detail);
        updateDocumentTitle(documentId, e.detail);
      }
    };
    
    window.addEventListener('update-title', handleAutoTitle as EventListener);
    return () => window.removeEventListener('update-title', handleAutoTitle as EventListener);
  }, [documentId, title, hasManuallyEdited]);

  const handleTitleBlur = async () => {
    if (title !== initialTitle && title.trim() !== '') {
      await updateDocumentTitle(documentId, title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <input 
      type="text" 
      value={title}
      onChange={(e) => {
        setTitle(e.target.value);
        setHasManuallyEdited(true);
      }}
      onBlur={handleTitleBlur}
      onKeyDown={handleKeyDown}
      className="text-sm font-medium text-slate-700 dark:text-zinc-100 max-w-sm truncate border border-transparent focus:border-slate-300 dark:focus:border-zinc-700 focus:ring-0 focus:outline-none bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 px-2 py-1 rounded-md transition-colors"
      placeholder="Ketik judul dokumen..."
    />
  );
}
