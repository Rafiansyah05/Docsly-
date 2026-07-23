'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import { HeaderNav } from '@/components/header-nav';
import { DocumentNavbar } from '@/components/editor/document-navbar';
import { SaveState } from '@/hooks/use-autosave';
import { DocumentLayout } from '@/components/editor/document-ruler';

interface AppHeaderProps {
  showDocumentNavbar?: boolean;
  // DocumentNavbar props
  editor?: Editor | null;
  saveState?: SaveState;
  documentId?: string;
  initialTitle?: string;
  workspaceId?: string;
  onToggleHistory?: () => void;
  onOpenPageNumbers?: () => void;
  isExportingPdf?: boolean;
  isExportingDocx?: boolean;
  onExportPdf?: () => void;
  onExportDocx?: () => void;
  onUploadImage?: () => void;
  isUploading?: boolean;
  layout?: DocumentLayout;
  onLayoutChange?: (layout: DocumentLayout) => void;
}

export function AppHeader({
  showDocumentNavbar = false,
  editor,
  saveState,
  documentId,
  initialTitle,
  workspaceId,
  onToggleHistory,
  onOpenPageNumbers,
  isExportingPdf,
  isExportingDocx,
  onExportPdf,
  onExportDocx,
  onUploadImage,
  isUploading,
  layout,
  onLayoutChange,
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-zinc-950 border-b border-[#E2E8F0] dark:border-zinc-800">
      {/* Global Navbar - 56px (h-14) */}
      <div className="h-14">
        <HeaderNav />
      </div>

      {/* Document Navbar - 48px (h-12) - shown only on editor pages */}
      {showDocumentNavbar && (
        <DocumentNavbar
          editor={editor || null}
          saveState={saveState || 'saved'}
          documentId={documentId || ''}
          initialTitle={initialTitle || ''}
          workspaceId={workspaceId || ''}
          onToggleHistory={onToggleHistory || (() => {})}
          onOpenPageNumbers={onOpenPageNumbers}
          isExportingPdf={isExportingPdf || false}
          isExportingDocx={isExportingDocx || false}
          onExportPdf={onExportPdf || (() => {})}
          onExportDocx={onExportDocx || (() => {})}
          onUploadImage={onUploadImage || (() => {})}
          isUploading={isUploading || false}
          layout={layout || { top: 96, bottom: 96, left: 96, right: 96 }}
          onLayoutChange={onLayoutChange || (() => {})}
        />
      )}
    </header>
  );
}
