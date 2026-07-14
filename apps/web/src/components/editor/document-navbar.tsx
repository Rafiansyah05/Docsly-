'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import { ChevronLeft, Table as TableIcon, Image as ImageIcon, ListOrdered, BookOpen, History, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SaveState } from '@/hooks/use-autosave';
import { DocumentHeader } from '@/components/editor/document-header';
import { CitationManager } from './citation-manager';

interface DocumentNavbarProps {
  editor: Editor | null;
  saveState: SaveState;
  documentId: string;
  initialTitle: string;
  workspaceId: string;
  onToggleHistory: () => void;
  onOpenPageNumbers?: () => void;
  isExportingPdf: boolean;
  isExportingDocx: boolean;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onUploadImage: () => void;
  isUploading: boolean;
}

export function DocumentNavbar({ editor, saveState, documentId, initialTitle, workspaceId, onToggleHistory, onOpenPageNumbers, isExportingPdf, isExportingDocx, onExportPdf, onExportDocx, onUploadImage, isUploading }: DocumentNavbarProps) {
  const [isCitationOpen, setIsCitationOpen] = React.useState(false);

  if (!editor) return null;

  const toggleTable = () => {
    editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
  };

  const insertToc = () => {
    editor.chain().focus().insertContent({ type: 'tableOfContents' }).run();
  };

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 mr-2 h-7 px-0">
          <Link href={`/w/${workspaceId}`} className="px-2 py-1 flex items-center w-full h-full">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali
          </Link>
        </Button>
        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">/</span>
        <div className="mr-2">
          <DocumentHeader documentId={documentId} initialTitle={initialTitle} />
        </div>

        <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleTable} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200" title="Sisipkan Tabel">
            <TableIcon className="h-3.5 w-3.5 mr-1" /> Tabel
          </Button>
          <button onClick={onUploadImage} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center rounded-md" title="Unggah Gambar">
            {isUploading ? <Loader2 className="h-4 w-4 text-zinc-400 dark:text-zinc-500 animate-spin mr-1" /> : <ImageIcon className="h-3.5 w-3.5 mr-1" />}
            Gambar
          </button>
          <Button variant="ghost" size="sm" onClick={insertToc} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200" title="Sisipkan Daftar Isi">
            <ListOrdered className="h-3.5 w-3.5 mr-1" /> Daftar Isi
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenPageNumbers} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200" title="Penomoran Halaman">
            <span className="font-serif mr-1">#</span> Penomoran Halaman
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCitationOpen(!isCitationOpen)}
            className={`h-7 px-2 text-xs ${isCitationOpen ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
            title="Manajemen Sitasi"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" /> Sitasi/Daftar Pustaka
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleHistory} className="h-7 px-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200" title="Riwayat Versi">
            <History className="h-3.5 w-3.5 mr-1" /> Riwayat
          </Button>
        </div>

        <div className="relative">
          <CitationManager editor={editor} isOpen={isCitationOpen} onClose={() => setIsCitationOpen(false)} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          {saveState === 'saved' && <span className="flex items-center gap-1 text-green-600">Tersimpan</span>}
          {saveState === 'saving' && <span className="flex items-center gap-1 animate-pulse">Menyimpan...</span>}
          {saveState === 'unsaved' && <span className="flex items-center gap-1">Mengedit...</span>}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            variant="outline"
            size="sm"
            className="h-7 text-xs font-medium px-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 border-red-200 dark:border-red-900/50 w-[100px] justify-center transition-all rounded-lg"
          >
            {isExportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" /> Export PDF
              </>
            )}
          </Button>
          <Button
            onClick={onExportDocx}
            disabled={isExportingDocx}
            variant="outline"
            size="sm"
            className="h-7 text-xs font-medium px-2 bg-[#2E75B6] text-white hover:bg-[#245f96] hover:text-white border-[#2E75B6] w-[110px] justify-center transition-all rounded-lg"
          >
            {isExportingDocx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Download className="h-3 w-3 mr-1" /> Export DOCX
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
