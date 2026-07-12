'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import ImageResize from 'tiptap-extension-resize-image';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { PageLayout } from './extensions/page-layout';
import { FontSize } from './extensions/font-size';
import { FoldableHeading } from './extensions/foldable-heading';
import { CustomOrderedList } from './extensions/custom-ordered-list';
import { LineHeight } from './extensions/line-height';
import { Indent } from './extensions/indent';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { Pagination } from './extensions/pagination';
import { Suggestion } from './extensions/suggestion';
import { TableOfContents } from './extensions/toc';
import { Citation, Bibliography } from './extensions/citation';
import { ImagePlaceholder } from './extensions/image-placeholder';
import { CustomDocument } from './extensions/custom-document';
import { PageNumberModal } from './page-number-modal';
import { formatPageNumber, PageSettings } from '@/lib/page-numbers';
import { EditorToolbar } from './editor-toolbar';
import { EditorStatusbar } from './editor-statusbar';
import { DocumentNavbar } from './document-navbar';
import { TableBubbleMenu } from './table-bubble-menu';
import { SuggestionBubbleMenu } from './suggestion-bubble-menu';
import { AiSidebar } from './ai-sidebar';
import { ImageCropModal } from './image-crop-modal';
import { updateDocumentTitle } from '@/lib/actions/document';
import { useAutosave } from '@/hooks/use-autosave';
import { HorizontalRuler, VerticalRuler, DocumentLayout } from './document-ruler';
import { VersionHistoryPanel } from './version-history-panel';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface TiptapEditorProps {
  documentId: string;
  initialContent: any;
  initialTitle: string;
  workspaceId: string;
}

export function TiptapEditor({ documentId, initialContent, initialTitle, workspaceId }: TiptapEditorProps) {
  const { saveState, triggerSave } = useAutosave(documentId);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [words, setWords] = useState(0);
  const [chars, setChars] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteNodes, setPendingDeleteNodes] = useState<{ from: number; to: number }[]>([]);
  const [showPageNumberModal, setShowPageNumberModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; page: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [layout, setLayout] = useState<DocumentLayout>({
    top: 96,
    bottom: 96,
    left: 96,
    right: 96,
  });

  // @ts-ignore - Bypass duplicate Tiptap type definitions in monorepo
  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
        heading: false,
        orderedList: false,
      }),
      FoldableHeading,
      CustomOrderedList,
      Underline,
      Suggestion,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
      ImageResize,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      PageLayout,
      FontSize,
      Superscript,
      Subscript,
      Highlight.configure({ multicolor: true }),
      Typography,
      LineHeight,
      Indent,
      CharacterCount,
      Pagination,
      TableOfContents,
      Citation,
      Bibliography,
      ImagePlaceholder,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none w-full min-h-[1056px] text-justify',
        style: `font-family: "Times New Roman", Times, serif; color: #000000; font-size: ${16 * 0.75}pt;`, // Default to 12pt (16px * 0.75)
      },
    },
    onUpdate: ({ editor }) => {
      triggerSave(() => editor.getJSON());

      const wordsCount = editor.storage.characterCount.words();
      const charsCount = editor.storage.characterCount.characters();
      setWords(wordsCount);
      setChars(charsCount);

      const text = editor.getText();
      const headerWords = text.trim().split(/\s+/).filter(Boolean);
      if (headerWords.length > 0) {
        const newTitle = headerWords.slice(0, 4).join(' ');
        window.dispatchEvent(new CustomEvent('update-title', { detail: newTitle }));
      }
    },
    onSelectionUpdate: ({ editor }) => {
      // Handled in a combined effect to track cursor position
    },
  });

  useEffect(() => {
    if (editor && typeof window !== 'undefined') {
      const importedHtml = localStorage.getItem(`import_${documentId}`);
      if (importedHtml) {
        editor.commands.setContent(importedHtml);
        localStorage.removeItem(`import_${documentId}`);
        triggerSave(() => editor.getJSON());
      }
    }
  }, [editor, documentId, triggerSave]);

  useEffect(() => {
    if (editor) {
      // Pancing ProseMirror untuk menghitung ulang saat margin dari mistar berubah
      editor.view.dispatch(editor.state.tr.setMeta('layoutUpdate', layout));
    }
  }, [editor, layout.top, layout.bottom, layout.left, layout.right]);

  useEffect(() => {
    if (!editor) return;

    const updatePagination = () => {
      const dom = editor.view.dom;
      if (dom) {
        let contentHeight = 0;

        // Find the last actual block node that is not a spacer
        let lastRealNode: HTMLElement | null = null;
        for (let i = dom.children.length - 1; i >= 0; i--) {
          const child = dom.children[i] as HTMLElement;
          if (child && !child.classList.contains('page-break-spacer') && !child.classList.contains('ProseMirror-widget')) {
            lastRealNode = child;
            break;
          }
        }

        if (lastRealNode) {
          const parentRect = dom.getBoundingClientRect();
          const childRect = lastRealNode.getBoundingClientRect();
          contentHeight = childRect.bottom - parentRect.top;
        }

        const FULL_STEP = 1163; // 1123px height + 40px gap
        const UNPRINTABLE_GAP = layout.bottom + 40 + layout.top;
        // total pages calculation
        const total = Math.max(1, Math.ceil((contentHeight + UNPRINTABLE_GAP) / FULL_STEP));
        setTotalPages(total);
        dom.style.minHeight = 'auto';

        try {
          const { from } = editor.state.selection;
          const coords = editor.view.coordsAtPos(from);
          const editorRect = dom.getBoundingClientRect();
          const relativeY = Math.max(0, coords.top - editorRect.top);
          // Current page based on Y coordinate relative to ProseMirror
          const current = Math.max(1, Math.ceil((relativeY + UNPRINTABLE_GAP) / FULL_STEP));
          setCurrentPage(current);
        } catch (e) {
          // Fallback
        }
      }
    };

    const handleTransaction = () => {
      // Delay to allow ProseMirror DOM to render before measuring
      setTimeout(updatePagination, 0);
    };

    editor.on('transaction', handleTransaction);
    editor.on('selectionUpdate', updatePagination);
    updatePagination();
    window.addEventListener('resize', updatePagination);

    return () => {
      editor.off('transaction', handleTransaction);
      editor.off('selectionUpdate', updatePagination);
      window.removeEventListener('resize', updatePagination);
    };
  }, [editor, layout.top, layout.bottom]);

  const handleDeleteCurrentPage = (targetPage?: number) => {
    if (!editor) return;
    const dom = editor.view.dom;
    if (!dom) return;

    const pageToDelete = typeof targetPage === 'number' ? targetPage : currentPage;
    const FULL_STEP = 1163;
    const UNPRINTABLE_GAP = layout.bottom + 40 + layout.top;
    const nodesToDelete: { from: number; to: number }[] = [];
    let hasTextContent = false;

    let pos = 0;
    editor.state.doc.forEach((node, offset, index) => {
      const domNode = editor.view.nodeDOM(pos) as HTMLElement;
      if (domNode && domNode.nodeType === 1) {
        const rect = domNode.getBoundingClientRect();
        const editorRect = dom.getBoundingClientRect();
        const relativeY = Math.max(0, rect.top - editorRect.top);

        const nodePage = Math.max(1, Math.ceil((relativeY + UNPRINTABLE_GAP) / FULL_STEP));

        if (nodePage === pageToDelete) {
          nodesToDelete.push({ from: pos, to: pos + node.nodeSize });
          if (node.textContent.trim().length > 0) {
            hasTextContent = true;
          }
        }
      }
      pos += node.nodeSize;
    });

    if (nodesToDelete.length === 0) {
      // If there are no nodes explicitly on this page, it's likely a trailing empty page
      // Execute a delete with empty nodes to trigger aggressive trailing trim
      executePageDelete([]);
      return;
    }

    if (hasTextContent) {
      setPendingDeleteNodes(nodesToDelete);
      setShowDeleteModal(true);
      return;
    }

    executePageDelete(nodesToDelete);
  };

  const executePageDelete = (nodes: { from: number; to: number }[]) => {
    if (!editor) return;
    let tr = editor.state.tr;
    let deleted = false;

    // 1. Delete the specific nodes on the page
    nodes
      .sort((a, b) => b.from - a.from)
      .forEach(({ from, to }) => {
        tr = tr.delete(from, to);
        deleted = true;
      });

    // 2. Aggressively trim any trailing empty paragraphs in the entire document
    // This guarantees that ghost pages caused by trailing spaces are destroyed
    const currentDoc = tr.doc;
    for (let i = currentDoc.childCount - 1; i >= 0; i--) {
      const node = currentDoc.child(i);
      if (node.type.name === 'paragraph' && node.textContent.trim() === '') {
        const from = tr.mapping.map(currentDoc.resolve(0).posAtIndex(i));
        const to = from + node.nodeSize;
        tr = tr.delete(from, to);
        deleted = true;
      } else {
        break; // Stop at the first real content
      }
    }

    if (deleted) {
      editor.view.dispatch(tr);
    }

    setShowDeleteModal(false);
    setPendingDeleteNodes([]);
  };

  const supabase = createClient();

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setCropModalOpen(true);
    if (e.target) e.target.value = '';
  };

  const handleConfirmCrop = async (croppedBlob: Blob | null, _dataUrl: string) => {
    setCropModalOpen(false);
    if (!croppedBlob || !selectedFile) return;
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '-')}`;
      const { data, error } = await supabase.storage.from('documents').upload(fileName, croppedBlob);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(data.path);
      (editor.chain().focus() as any).setImage({ src: publicUrl }).run();
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunggah gambar. Pastikan ukuran file sesuai batas.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const exportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const titleInput = document.querySelector('input[placeholder="Ketik judul dokumen..."]') as HTMLInputElement;
      const title = titleInput && titleInput.value.trim() !== '' ? titleInput.value : 'Dokumen';
      const jsonDoc = JSON.parse(JSON.stringify(editor.getJSON()));
      try {
        const { PaginationPluginKey } = require('@/components/editor/extensions/pagination');
        const paginationState = PaginationPluginKey.getState(editor.state);
        const spacers = paginationState?.spacers || {};
        Object.keys(spacers).forEach((posStr) => {
          const pos = parseInt(posStr, 10);
          const resolved = editor.state.doc.resolve(pos);
          let currentJson = jsonDoc;
          for (let d = 0; d < resolved.depth; d++) {
            const idx = resolved.index(d);
            if (currentJson.content && currentJson.content[idx]) {
              currentJson = currentJson.content[idx];
            }
          }
          const childIdx = resolved.index(resolved.depth);
          if (currentJson.content && currentJson.content[childIdx]) {
            const targetNode = currentJson.content[childIdx];
            targetNode.attrs = { ...(targetNode.attrs || {}), pageBreakBefore: true };
          }
        });
      } catch (e) {
        console.warn('Failed to inject page breaks for DOCX', e);
      }
      const response = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: jsonDoc }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor dokumen.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const exportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const titleInput = document.querySelector('input[placeholder="Ketik judul dokumen..."]') as HTMLInputElement;
      const title = titleInput && titleInput.value.trim() !== '' ? titleInput.value : 'Dokumen';
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          html: editor.getHTML(),
          pageSettings: editor.state.doc.attrs.pageSettings,
        }),
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengekspor dokumen PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const pageSettings = editor?.state?.doc?.attrs?.pageSettings as PageSettings | null;

  return (
    <div className="flex flex-col w-full h-full bg-slate-50">
      <DocumentNavbar
        editor={editor}
        saveState={saveState}
        documentId={documentId}
        initialTitle={initialTitle}
        workspaceId={workspaceId}
        onToggleHistory={() => setShowHistory(!showHistory)}
        onOpenPageNumbers={() => setShowPageNumberModal(true)}
        isExportingPdf={isExportingPdf}
        isExportingDocx={isExportingDocx}
        onExportPdf={exportPdf}
        onExportDocx={exportDocx}
        onUploadImage={triggerImageUpload}
        isUploading={isUploading}
      />
      <EditorToolbar editor={editor} onUploadImage={triggerImageUpload} />
      <TableBubbleMenu editor={editor} />
      <SuggestionBubbleMenu editor={editor} />

      <div className="flex-1 flex flex-row min-h-0 h-full overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pb-4 md:pb-8 flex flex-col items-center bg-slate-200" onClick={() => setContextMenu(null)}>
          {/* Horizontal Ruler (Sticky Top) */}
          <div className="sticky top-0 z-30 mb-4 flex w-full justify-center bg-white border-b border-slate-200 py-1.5 shadow-sm">
            <div style={{ marginLeft: '24px' }}>
              <HorizontalRuler layout={layout} onChange={setLayout} />
            </div>
          </div>

          <div className="flex flex-row items-start">
            {/* Vertical Ruler */}
            <div>
              <VerticalRuler layout={layout} onChange={setLayout} totalPages={totalPages} />
            </div>

            <div
              className="relative w-[794px]"
              onContextMenu={(e) => {
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;
                const page = Math.floor(relativeY / 1163) + 1;

                if (page <= totalPages) {
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    page,
                  });
                }
              }}
            >
              {/* Background DOM Pages */}
              <div className="absolute inset-0 z-0 flex flex-col gap-[40px] pointer-events-none w-full">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNumStr = formatPageNumber(i + 1, pageSettings);
                  const alignClass = {
                    left: 'text-left',
                    center: 'text-center',
                    right: 'text-right',
                  }[pageSettings?.align || 'center'];

                  return (
                    <div key={i} className="relative w-full h-[1123px] bg-white shadow-sm flex-shrink-0 pointer-events-auto group">
                      {pageSettings?.enabled && pNumStr && (
                        <div
                          className={`absolute w-full px-12 ${pageSettings.position === 'top' ? 'top-8' : 'bottom-8'} ${alignClass} font-['Times_New_Roman',Times,serif] text-sm text-black cursor-pointer hover:bg-blue-50/50 transition-colors`}
                          onDoubleClick={() => setShowPageNumberModal(true)}
                          title="Klik Ganda untuk mengedit penomoran halaman"
                        >
                          {pNumStr}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Editor Foreground */}
              <div className="relative z-10 w-full text-black" style={{ minHeight: `${totalPages * 1163 - 40}px` }}>
                <div
                  className="w-full h-full document-layout-wrapper"
                  style={{
                    paddingTop: layout.top,
                    paddingBottom: layout.bottom,
                    paddingLeft: layout.left,
                    paddingRight: layout.right,
                  }}
                >
                  <EditorContent editor={editor} className="min-h-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Agent Sidebar Panel */}
        <div className="h-full min-h-0 flex flex-col">
          <AiSidebar editor={editor} documentId={documentId} />
        </div>

        {/* Version History Panel */}
        <VersionHistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} editor={editor} documentId={documentId} />
      </div>
      <EditorStatusbar editor={editor} currentPage={currentPage} totalPages={totalPages} words={words} chars={chars} onDeletePage={handleDeleteCurrentPage} />

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-sm w-full mx-4 overflow-hidden border border-zinc-200">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Hapus Halaman?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Halaman <span className="font-medium text-slate-700">{currentPage}</span> saat ini memiliki konten di dalamnya. Apakah Anda yakin ingin menghapus halaman beserta isinya?
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPendingDeleteNodes([]);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button onClick={() => executePageDelete(pendingDeleteNodes)} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                Hapus Halaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right-Click Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div className="fixed z-50 min-w-[200px] bg-white rounded-lg shadow-xl border border-slate-200 py-1" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button
            onClick={() => {
              handleDeleteCurrentPage(contextMenu.page);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
            Hapus Halaman {contextMenu.page}
          </button>
        </div>
      )}

      {/* Page Number Modal */}
      <PageNumberModal
        isOpen={showPageNumberModal}
        onClose={() => setShowPageNumberModal(false)}
        settings={pageSettings}
        onSave={(newSettings) => {
          if (editor) {
            // Document is the root node, it has no position, we must use setDocAttribute or replace it
            let tr = editor.state.tr;
            if (typeof tr.setDocAttribute === 'function') {
              tr = tr.setDocAttribute('pageSettings', newSettings);
            } else {
              // Fallback for older ProseMirror: create a new doc node with updated attributes
              tr = tr.replaceWith(0, editor.state.doc.content.size, editor.state.doc.content);
              // Wait, replaceWith doesn't change attributes. We must replace the step?
              // Actually Tiptap's updateAttributes('doc', ...) should work if 'doc' is active
              editor.commands.updateAttributes('doc', { pageSettings: newSettings });
              return;
            }
            editor.view.dispatch(tr);
          }
        }}
      />

      <ImageCropModal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} file={selectedFile} onConfirm={handleConfirmCrop} />

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
    </div>
  );
}
