import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { DocumentLayout } from './document-ruler';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PrintDialogProps {
  children: React.ReactNode;
  editor: Editor | null;
  layout: DocumentLayout;
}

export function PrintDialog({ children, editor, layout }: PrintDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    if (!editor || isGenerating) return;
    
    setIsGenerating(true);
    const toastId = toast.loading('Menyiapkan dokumen untuk dicetak...', { duration: 15000 });
    
    try {
      const titleInput = document.querySelector('input[placeholder="Ketik judul dokumen..."]') as HTMLInputElement;
      const title = titleInput && titleInput.value.trim() !== '' ? titleInput.value : 'Dokumen';
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      let response;
      try {
        response = await fetch('/api/export/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            title,
            html: editor.getHTML(),
            pageSettings: editor.state.doc.attrs.pageSettings,
            layout: layout,
            pageRanges: '',
          }),
        });
      } catch (err) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        response = await fetch(`${baseUrl}/api/export/pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({
            title,
            html: editor.getHTML(),
            pageSettings: editor.state.doc.attrs.pageSettings,
            layout: layout,
            pageRanges: '',
          }),
        });
      }

      if (!response.ok) throw new Error('Preview failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      toast.dismiss(toastId);
      setIsGenerating(false); // Enable the button again
      
      const printJSModule = await import('print-js');
      const printJS = printJSModule.default || printJSModule;
      
      if (typeof printJS !== 'function') {
        throw new Error('printJS could not be loaded');
      }

      printJS({
        printable: url,
        type: 'pdf',
      });
      
    } catch (err: any) {
      console.error('Print preview error:', err);
      toast.dismiss(toastId);
      toast.error('Gagal mencetak dokumen.');
      setIsGenerating(false);
    }
  };

  const child = React.Children.only(children) as React.ReactElement;
  
  return React.cloneElement(child, {
    onClick: (e: any) => {
      if (child.props.onClick) {
        child.props.onClick(e);
      }
      e.preventDefault();
      handlePrint();
    },
    disabled: isGenerating || child.props.disabled,
  });
}
