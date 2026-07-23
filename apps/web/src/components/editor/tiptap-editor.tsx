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
import { LayoutAttributes } from './extensions/layout-attributes';
import { FlatListEngine } from './extensions/flat-list-engine';
import { LineHeight } from './extensions/line-height';
import { Indent } from './extensions/indent';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { useTour } from '@/components/ui/tour';
import { Pagination } from './extensions/pagination';
import { Suggestion } from './extensions/suggestion';
import { TableOfContents } from './extensions/toc';
import { Citation, Bibliography } from './extensions/citation';
import { ImagePlaceholder } from './extensions/image-placeholder';
import { CustomDocument } from './extensions/custom-document';
import { LimitReachedModal } from '@/components/limit-reached-modal';
import { PageNumberModal } from './page-number-modal';
import { formatPageNumber, PageSettings } from '@/lib/page-numbers';
import { EditorToolbar } from './editor-toolbar';
import { EditorStatusbar } from './editor-statusbar';
import { DocumentNavbar } from './document-navbar';
import { TableBubbleMenu } from './table-bubble-menu';
import { SuggestionBubbleMenu } from './suggestion-bubble-menu';
import { AiSidebar } from './ai-sidebar';
import { ImageCropModal } from './image-crop-modal';
import { ImageBubbleMenu } from './image-bubble-menu';
import { updateDocumentTitle } from '@/lib/actions/document';
import { useAutosave } from '@/hooks/use-autosave';
import { HorizontalRuler, VerticalRuler, DocumentLayout } from './document-ruler';
import { VersionHistoryPanel } from './version-history-panel';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

interface TiptapEditorProps {
  documentId: string;
  initialContent: any;
  initialTitle: string;
  workspaceId: string;
  hasSeenTour?: boolean;
  userId?: string;
}

export function TiptapEditor({ documentId, initialTitle, initialContent, workspaceId, hasSeenTour, userId }: TiptapEditorProps) {
  const router = useRouter();
  const { startTour } = useTour();
  const { saveState, triggerSave } = useAutosave(documentId);
  const [totalPages, setTotalPages] = useState(1);
  const totalPagesRef = React.useRef(1);
  const savedTotalPages = React.useRef(initialContent?._totalPages || 1);
  const [currentPage, setCurrentPage] = useState(1);
  const [words, setWords] = useState(0);
  const [chars, setChars] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteNodes, setPendingDeleteNodes] = useState<{ from: number; to: number }[]>([]);
  const [showPageNumberModal, setShowPageNumberModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; page: number } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [limitModal, setLimitModal] = useState<{
    isOpen: boolean;
    plan: string;
    maxMb: number;
  }>({ isOpen: false, plan: 'Free', maxMb: 100 });
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [layout, setLayout] = useState<DocumentLayout>(() => {
    if (initialContent?.attrs?.layout) {
      return initialContent.attrs.layout;
    }
    return {
      top: 96,
      bottom: 96,
      left: 96,
      right: 96,
    };
  });

  const handleLayoutChange = (newLayout: DocumentLayout) => {
    setLayout(newLayout);
    if (editor) {
      let tr = editor.state.tr;
      if (typeof tr.setDocAttribute === 'function') {
        tr = tr.setDocAttribute('layout', newLayout);
      } else {
        editor.commands.updateAttributes('doc', { layout: newLayout });
        return;
      }
      editor.view.dispatch(tr);
    }
  };

  // @ts-ignore - Bypass duplicate Tiptap type definitions in monorepo
  const editor = useEditor({
    extensions: [
      CustomDocument,
      StarterKit.configure({
        document: false,
        heading: false,
        orderedList: false,
        bulletList: false,
        listItem: false,
      }),
      LayoutAttributes,
      FlatListEngine,
      FoldableHeading,
      Underline,
      Suggestion,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image', 'imageResize', 'imagePlaceholder'],
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
        class: 'prose editor-prose max-w-none focus:outline-none w-full min-h-[1056px] text-justify',
        style: `font-family: "Times New Roman", Times, serif; color: #000000; font-size: ${16 * 0.75}pt;`, // Default to 12pt (16px * 0.75)
      },
    },
    onUpdate: ({ editor }) => {
      triggerSave(() => {
        const json = editor.getJSON();
        return { ...json, _totalPages: totalPagesRef.current };
      });

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

  // Force Next.js Router Cache to refresh on mount
  useEffect(() => {
    router.refresh();
  }, [router]);

  // Fetch the latest content on mount from Supabase to bypass any client Router Cache
  useEffect(() => {
    if (!editor) return;

    let isMounted = true;
    const supabase = createClient();

    const fetchLatest = async () => {
      try {
        // Cek localStorage dulu (untuk template atau import dokumen)
        const importedHtml = localStorage.getItem(`import_${documentId}`);
        if (importedHtml) {
          editor.commands.setContent(importedHtml);
          localStorage.removeItem(`import_${documentId}`);
          triggerSave(() => editor.getJSON());

          // Tetap ambil judul jika diperlukan
          const { data } = await supabase.from('documents').select('judul').eq('id', documentId).single();
          if (isMounted && data) {
            window.dispatchEvent(new CustomEvent('update-title', { detail: data.judul }));
          }
          return; // Lewati menimpa konten dengan isi database yang kosong
        }

        const { data, error } = await supabase
          .from('documents')
          .select('konten_json_terkini, judul')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        if (isMounted && data && data.konten_json_terkini) {
          editor.commands.setContent(data.konten_json_terkini);
          window.dispatchEvent(new CustomEvent('update-title', { detail: data.judul }));
        }
      } catch (err) {
        console.error('Gagal mengambil konten terbaru dari database:', err);
      }
    };

    fetchLatest();

    return () => {
      isMounted = false;
    };
  }, [editor, documentId, triggerSave]);

  useEffect(() => {
    if (editor) {
      // Pancing ProseMirror untuk menghitung ulang saat margin dari mistar berubah
      editor.view.dispatch(editor.state.tr.setMeta('layoutUpdate', layout));
    }
  }, [editor, layout.top, layout.bottom, layout.left, layout.right]);

  // Sync React layout state with Tiptap doc state (if AI changes it)
  useEffect(() => {
    if (!editor) return;
    const syncLayout = () => {
      const docLayout = editor.state.doc.attrs.layout;
      if (!docLayout) return;

      setLayout(prev => {
        if (
          prev.top === docLayout.top &&
          prev.bottom === docLayout.bottom &&
          prev.left === docLayout.left &&
          prev.right === docLayout.right
        ) {
          return prev; // Prevents re-render if values are identical
        }
        return docLayout;
      });
    };
    editor.on('transaction', syncLayout);
    return () => {
      editor.off('transaction', syncLayout);
    };
  }, [editor]); // Removed `layout` dependency to avoid re-binding loops

  useEffect(() => {
    if (!editor) return;

    const updatePagination = () => {
      const dom = editor.view.dom;
      if (dom) {
        // Unset all height constraints entirely for true natural measurement
        const wrapper = dom.closest('.document-layout-wrapper') as HTMLElement | null;
        const outer = wrapper?.parentElement;
        
        const prevDomMin = dom.style.minHeight;
        const prevWrapperH = wrapper ? wrapper.style.height : '';
        const prevOuterMin = outer ? outer.style.minHeight : '';

        dom.style.minHeight = 'auto';
        if (wrapper) wrapper.style.height = 'auto';
        if (outer) outer.style.minHeight = 'auto';

        // Find the last node that actually contains content
        let lastContentPos = -1;
        editor.state.doc.forEach((node, offset) => {
          const hasText = node.textContent.trim() !== '';
          const isMedia = node.type.name === 'image' || node.type.name === 'table' || node.type.name === 'horizontalRule' || node.type.name === 'equation' || node.type.name === 'callout' || node.type.name === 'imagePlaceholder' || node.type.name === 'codeBlock' || node.type.name === 'bulletList' || node.type.name === 'orderedList';
          if (hasText || isMedia) {
            lastContentPos = offset;
          }
        });

        let contentHeight = 0;
        if (lastContentPos >= 0) {
          const lastDomNode = editor.view.nodeDOM(lastContentPos) as HTMLElement;
          if (lastDomNode && lastDomNode.getBoundingClientRect) {
            const rect = lastDomNode.getBoundingClientRect();
            const editorRect = dom.getBoundingClientRect();
            contentHeight = Math.max(0, rect.bottom - editorRect.top);
          }
        }

        dom.style.minHeight = prevDomMin;
        if (wrapper) wrapper.style.height = prevWrapperH;
        if (outer) outer.style.minHeight = prevOuterMin;

        const FULL_STEP = 1163; // 1123px height + 40px gap
        const UNPRINTABLE_GAP = layout.bottom + 40 + layout.top;

        // total pages calculation
        const total = Math.max(1, Math.ceil((contentHeight + UNPRINTABLE_GAP) / FULL_STEP));
        totalPagesRef.current = total;
        setTotalPages(total);

        if (savedTotalPages.current !== total) {
          savedTotalPages.current = total;
          triggerSave(() => {
            const json = editor.getJSON();
            return { ...json, _totalPages: total };
          });
        }

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

    let rAF: number;
    const handleTransaction = () => {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(updatePagination);
    };

    editor.on('transaction', handleTransaction);
    editor.on('selectionUpdate', handleTransaction);
    updatePagination();
    window.addEventListener('resize', updatePagination);

    let resizeObserver: ResizeObserver | null = null;
    if (editor.view.dom) {
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(rAF);
        rAF = requestAnimationFrame(updatePagination);
      });
      resizeObserver.observe(editor.view.dom);
    }

    return () => {
      editor.off('transaction', handleTransaction);
      editor.off('selectionUpdate', handleTransaction);
      window.removeEventListener('resize', updatePagination);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      cancelAnimationFrame(rAF);
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
    while (tr.doc.childCount > 1) {
      const lastChild = tr.doc.child(tr.doc.childCount - 1);
      if (lastChild.type.name === 'paragraph' && lastChild.textContent.trim() === '') {
        const from = tr.doc.content.size - lastChild.nodeSize;
        const to = from + lastChild.nodeSize;
        tr = tr.delete(from, to);
        deleted = true;
      } else {
        break;
      }
    }

    if (deleted) {
      editor.view.dispatch(tr);
    }
    setPendingDeleteNodes([]);
    setShowDeleteModal(false);
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
      // Periksa limit storage terlebih dahulu melalui API
      const res = await fetch('/api/user/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizeBytes: croppedBlob.size }),
      });

      const checkData = await res.json();
      if (!res.ok && checkData.message === 'Storage limit reached') {
        setLimitModal({
          isOpen: true,
          plan: checkData.plan || 'Free',
          maxMb: checkData.max_mb || 100
        });
        setIsUploading(false);
        return;
      }

      if (!res.ok) throw new Error(checkData.message || 'Gagal mengecek limit storage');

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
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/export/docx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
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
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/export/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
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

  const [pageSettings, setPageSettings] = useState<PageSettings | null>(
    initialContent?.attrs?.pageSettings as PageSettings | null || null
  );

  // Sync React pageSettings state with Tiptap doc state
  useEffect(() => {
    if (!editor) return;
    const syncPageSettings = () => {
      const docSettings = editor.state.doc.attrs.pageSettings;
      setPageSettings(prev => JSON.stringify(prev) !== JSON.stringify(docSettings) ? docSettings : prev);
    };
    editor.on('update', syncPageSettings);
    editor.on('transaction', syncPageSettings);

    // Initial sync
    syncPageSettings();

    return () => {
      editor.off('update', syncPageSettings);
      editor.off('transaction', syncPageSettings);
    };
  }, [editor]);

  // Editor Tour Effect
  useEffect(() => {
    // Delay agar editor dan AI panel selesai render
    const timer = setTimeout(() => {
      startTour(
        'editor_tour',
        [
          {
            targetId: 'tour-editor-navbar',
            title: 'Toolbar Format & Ekspor',
            content: `Toolbar ini menyediakan seluruh alat yang Anda perlukan untuk menyusun dokumen secara profesional.

1. Font: Mengatur jenis huruf, ukuran huruf, dan warna teks
2. Heading & Auto Heading: Membuat struktur dokumen yang rapi atau menggunakan AI untuk menyusun heading secara otomatis.
3. Format Teks: Menebalkan, memiringkan, memberi garis bawah, mencoret teks, superscript, subscript, dan menghapus format.
4. Paragraf: Mengatur perataan teks, jarak baris, dan indentasi paragraf.
5. Daftar & Elemen: Membuat bullet list, numbered list, quote, code, dan hyperlink.
6. Fitur Dokumen: Menambahkan tabel, gambar, daftar isi otomatis, penomoran halaman yang mudah, sitasi & daftar pustaka otomatis, mengatur margin kertas, serta melihat riwayat perubahan dokumen.`,
            position: 'bottom',
            padding: 4
          },
          {
            targetId: 'tour-editor-workspace',
            title: 'Lembar Kerja Dokumen',
            content: 'Ini adalah area utama Anda mengetik. Dokumen akan otomatis tersimpan setiap ada perubahan.',
            position: 'right',
            padding: 20
          },
          {
            targetId: 'tour-ai-sidebar',
            title: 'Asisten AI Pintar',
            content: 'Gunakan panel ini untuk berdiskusi dengan AI, merangkum teks, atau memperbaiki ejaan langsung dari referensi Anda.',
            position: 'left',
            padding: 8
          }
        ],
        undefined,
        true, // showSkipAll
        hasSeenTour,
        userId
      );
    }, 1500);

    return () => clearTimeout(timer);
  }, [startTour]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-zinc-950 relative">
      <div id="tour-editor-navbar" className="shrink-0 z-40 relative">
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
          layout={layout}
          onLayoutChange={handleLayoutChange}
        />
        <EditorToolbar editor={editor} onUploadImage={triggerImageUpload} />
      </div>
      <TableBubbleMenu editor={editor} />
      <SuggestionBubbleMenu editor={editor} />
      <ImageBubbleMenu editor={editor} />

      <div className="flex-1 flex flex-row min-h-0 h-full overflow-hidden">
        <div id="tour-editor-workspace" className="flex-1 min-h-0 overflow-y-auto pb-4 md:pb-8 flex flex-col items-center bg-slate-200 dark:bg-zinc-900" onClick={() => setContextMenu(null)}>
          {/* Horizontal Ruler (Sticky Top) */}
          <div className="sticky top-0 z-30 mb-4 flex w-full justify-center bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 py-1.5 shadow-sm">
            <div style={{ marginLeft: '24px' }}>
              <HorizontalRuler layout={layout} onChange={handleLayoutChange} />
            </div>
          </div>

          <div className="flex flex-row items-start">
            {/* Vertical Ruler */}
            <div>
              <VerticalRuler layout={layout} onChange={handleLayoutChange} totalPages={totalPages} />
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
                  return (
                    <div key={i} className="relative w-full h-[1123px] bg-white shadow-sm flex-shrink-0" />
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

              {/* Foreground Page Numbers Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col gap-[40px] pointer-events-none w-full">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNumStr = formatPageNumber(i + 1, pageSettings);
                  const alignClass = {
                    left: 'text-left',
                    center: 'text-center',
                    right: 'text-right',
                  }[pageSettings?.align || 'center'];

                  return (
                    <div key={i} className="relative w-full h-[1123px] flex-shrink-0 pointer-events-none">
                      {pageSettings?.enabled && pNumStr && (
                        <div
                          className={`absolute w-full px-12 ${pageSettings.position === 'top' ? 'top-8' : 'bottom-8'} ${alignClass} font-['Times_New_Roman',Times,serif] text-sm text-black cursor-pointer hover:bg-blue-50/50 transition-colors pointer-events-auto`}
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
            </div>
          </div>
        </div>

        {/* AI Agent Sidebar Panel */}
        <div id="tour-ai-sidebar" className="h-full min-h-0 flex flex-col relative z-20">
          <AiSidebar editor={editor} documentId={documentId} />
        </div>

        {/* Version History Panel */}
        <VersionHistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} editor={editor} documentId={documentId} />
      </div>
      <EditorStatusbar editor={editor} currentPage={currentPage} totalPages={totalPages} words={words} chars={chars} onDeletePage={handleDeleteCurrentPage} />

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full mx-4 overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-2">Hapus Halaman?</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                Halaman <span className="font-medium text-slate-700 dark:text-zinc-200">{currentPage}</span> saat ini memiliki konten di dalamnya. Apakah Anda yakin ingin menghapus halaman beserta isinya?
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-zinc-900/50 px-5 py-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPendingDeleteNodes([]);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
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
        <div className="fixed z-50 min-w-[200px] bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-800 py-1" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button
            onClick={() => {
              handleDeleteCurrentPage(contextMenu.page);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-900/30 flex items-center gap-2"
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

      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        file={selectedFile}
        onConfirm={handleConfirmCrop}
      />

      <LimitReachedModal
        isOpen={limitModal.isOpen}
        onClose={() => setLimitModal(prev => ({ ...prev, isOpen: false }))}
        resetAt={null}
        plan={limitModal.plan}
        type="storage"
        maxMb={limitModal.maxMb}
      />

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
    </div>
  );
}
