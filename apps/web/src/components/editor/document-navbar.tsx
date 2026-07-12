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
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-100 bg-white h-12">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-slate-600 hover:bg-slate-200 hover:text-slate-800 mr-2 h-7 px-2" render={<Link href={`/w/${workspaceId}`} />}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali
        </Button>
        <span className="text-sm font-medium text-slate-400">/</span>
        <div className="mr-2">
          <DocumentHeader documentId={documentId} initialTitle={initialTitle} />
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleTable} className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-200 hover:text-slate-800" title="Sisipkan Tabel">
            <TableIcon className="h-3.5 w-3.5 mr-1" /> Tabel
          </Button>
          <button onClick={onUploadImage} className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-200 hover:text-slate-800 flex items-center rounded-md" title="Unggah Gambar">
            {isUploading ? <Loader2 className="h-4 w-4 text-slate-400 animate-spin mr-1" /> : <ImageIcon className="h-3.5 w-3.5 mr-1" />}
            Gambar
          </button>
          <Button variant="ghost" size="sm" onClick={insertToc} className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-200 hover:text-slate-800" title="Sisipkan Daftar Isi">
            <ListOrdered className="h-3.5 w-3.5 mr-1" /> Daftar Isi
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenPageNumbers} className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-200 hover:text-slate-800" title="Penomoran Halaman">
            <span className="font-serif mr-1">#</span> Penomoran Halaman
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCitationOpen(!isCitationOpen)}
            className={`h-7 px-2 text-xs ${isCitationOpen ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-800'}`}
            title="Manajemen Sitasi"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1" /> Sitasi/Daftar Pustaka
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleHistory} className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-200 hover:text-slate-800" title="Riwayat Versi">
            <History className="h-3.5 w-3.5 mr-1" /> Riwayat
          </Button>
        </div>

        <div className="relative">
          <CitationManager editor={editor} isOpen={isCitationOpen} onClose={() => setIsCitationOpen(false)} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center text-xs text-slate-500 font-medium">
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
            className="h-7 text-xs font-medium px-2 bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200 w-[100px] justify-center transition-all rounded-lg"
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
