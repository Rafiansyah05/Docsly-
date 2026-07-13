'use client';

import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Indent as IndentIcon,
  Outdent as OutdentIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Link as LinkIcon,
  FilePlus,
  ChevronDown,
  Check,
  Type,
  Plus,
  ArrowUpDown,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageCropModal } from './image-crop-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor | null;
  onUploadImage: () => void;
}

const FONTS = [
  { name: 'Plus Jakarta Sans', value: 'var(--font-sans)' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
];

const FONT_SIZES = ['10pt', '11pt', '12pt', '14pt', '16pt', '20pt', '24pt'];

export function EditorToolbar({ editor, onUploadImage }: EditorToolbarProps) {
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [isCitationOpen, setIsCitationOpen] = React.useState(false);
  const [cropModalOpen, setCropModalOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const [isExportingDocx, setIsExportingDocx] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const [, setUpdateCount] = React.useState(0);

  React.useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => setUpdateCount((c) => c + 1);
    editor.on('transaction', handleUpdate);
    return () => {
      editor.off('transaction', handleUpdate);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const toggleTable = () => {
    editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run();
  };

  const insertToc = () => {
    editor.chain().focus().insertContent({ type: 'tableOfContents' }).run();
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Buka modal crop
    setSelectedFile(file);
    setCropModalOpen(true);

    // Reset value
    if (e.target) e.target.value = '';
  };

  const handleConfirmCrop = async (croppedBlob: Blob | null, dataUrl: string) => {
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
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkDialog(true);
  };

  const applyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      let validUrl = linkUrl.trim();
      if (validUrl && !/^https?:\/\//i.test(validUrl) && !/^mailto:/i.test(validUrl)) {
        validUrl = `https://${validUrl}`;
      }
      editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
    }
    setShowLinkDialog(false);
  };

  const insertPageLayout = () => {
    (editor.chain().focus() as any).setPageLayout().run();
  };

  const exportDocx = async () => {
    setIsExportingDocx(true);
    try {
      const titleInput = document.querySelector('input[placeholder="Ketik judul dokumen..."]') as HTMLInputElement;
      const title = titleInput && titleInput.value.trim() !== '' ? titleInput.value : 'Dokumen';

      // Clone JSON so we don't mutate the editor state
      const jsonDoc = JSON.parse(JSON.stringify(editor.getJSON()));

      // Inject pageBreakBefore based on visual pagination spacers
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
        body: JSON.stringify({
          title,
          content: jsonDoc,
        }),
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

  return (
    <div className="w-full flex flex-col border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 mt-0">
      {/* Formatting Tools */}
      <div className="flex flex-wrap items-center gap-1 px-4 py-1.5 overflow-x-auto">
        {/* Font Family */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center h-8 text-xs font-medium w-36 justify-between px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none transition-colors text-zinc-900 dark:text-zinc-200">
            <span className="truncate text-left w-full">
              {editor.getAttributes('textStyle').fontFamily ? FONTS.find((f) => editor.getAttributes('textStyle').fontFamily.includes(f.value.split(',')[0]))?.name || 'Times New Roman' : 'Times New Roman'}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50 ml-1 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl shadow-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-36">
            {FONTS.map((font) => (
              <DropdownMenuItem
                key={font.name}
                onClick={(e) => {
                  e.preventDefault();
                  (editor.chain().focus() as any).setFontFamily(font.value).run();
                }}
                className="text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-200"
              >
                <span style={{ fontFamily: font.value }}>{font.name}</span>
                {editor.isActive('textStyle', { fontFamily: font.value }) && <Check className="h-4 w-4 ml-auto text-blue-600" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Font Size */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center h-8 text-xs font-medium w-32 justify-between px-2 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none transition-colors text-zinc-900 dark:text-zinc-200">
            <span className="truncate">{editor.getAttributes('textStyle').fontSize || '11pt'}</span>
            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl shadow-lg border-zinc-200 dark:border-zinc-800 min-w-[8rem] w-32 z-50 bg-white dark:bg-zinc-900">
            {FONT_SIZES.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  (editor.chain().focus() as any).setFontSize(size).run();
                }}
                className="text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 justify-center text-zinc-900 dark:text-zinc-200"
              >
                {size}
                {editor.isActive('textStyle', { fontSize: size }) && <Check className="h-3 w-3 ml-2 text-blue-600 absolute right-2" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center ml-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg h-8 overflow-hidden">
          <input
            type="color"
            onInput={(e) => (editor.chain().focus() as any).setColor((e.target as HTMLInputElement).value).run()}
            value={editor.getAttributes('textStyle').color || '#0f172a'}
            className="w-8 h-10 -m-1 cursor-pointer"
            title="Pilih Warna Teks"
          />
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Headings */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Basic Marks */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('superscript') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).toggleSuperscript().run()}
        >
          <Superscript className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('subscript') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).toggleSubscript().run()}
        >
          <Subscript className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('highlight') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => (editor.chain().focus() as any).setTextAlign('justify').run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Spacing & Indent */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg outline-none transition-colors" title="Spasi Baris">
            <ArrowUpDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="rounded-xl shadow-lg border-zinc-200 dark:border-zinc-800 min-w-[8rem] z-50 bg-white dark:bg-zinc-900">
            {['1.0', '1.15', '1.5', '2.0'].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={(e) => {
                  e.preventDefault();
                  (editor.chain().focus() as any).setLineHeight(size).run();
                }}
                className="text-sm cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 justify-between px-3 py-1.5"
              >
                <span>Spasi {size}</span>
                {editor.isActive({ lineHeight: size }) && <Check className="h-3 w-3 text-blue-600" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200" onClick={() => (editor.chain().focus() as any).outdent().run()}>
          <OutdentIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200" onClick={() => (editor.chain().focus() as any).indent().run()}>
          <IndentIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Lists & Blocks */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${editor.isActive('codeBlock') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

        {/* Links */}
        <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'}`} onClick={openLinkDialog}>
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md p-6 bg-zinc-50 dark:bg-zinc-900">
          <form onSubmit={applyLink}>
            <DialogHeader>
              <DialogTitle className="text-zinc-900 dark:text-zinc-100">Masukkan Tautan (Link)</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 mt-4">
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="flex-1 text-zinc-900 dark:text-zinc-100" autoFocus />
            </div>
            <DialogFooter className="gap-3 sm:justify-end mt-6">
              <Button type="button" variant="secondary" onClick={() => setShowLinkDialog(false)} className="hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100">
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Terapkan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        file={selectedFile}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
