'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import { HeaderNav } from '@/components/header-nav';
import { DocumentNavbar } from '@/components/editor/document-navbar';
import { SaveState } from '@/hooks/use-autosave';

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
}: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-[#E2E8F0]">
      {/* Global Navbar - 56px (h-14) */}
      <div className="h-14">
        <HeaderNav />
      </div>

      {/* Document Navbar - 48px (h-12) - shown only on editor pages */}
      {showDocumentNavbar && (
        <DocumentNavbar
          editor={editor}
          saveState={saveState}
          documentId={documentId}
          initialTitle={initialTitle}
          workspaceId={workspaceId}
          onToggleHistory={onToggleHistory}
          onOpenPageNumbers={onOpenPageNumbers}
          isExportingPdf={isExportingPdf}
          isExportingDocx={isExportingDocx}
          onExportPdf={onExportPdf}
          onExportDocx={onExportDocx}
          onUploadImage={onUploadImage}
          isUploading={isUploading}
        />
      )}
    </header>
  );
}
