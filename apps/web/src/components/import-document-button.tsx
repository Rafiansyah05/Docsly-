'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { createDocumentClient } from '@/lib/actions/document';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function ImportDocumentButton({ workspaceId }: { workspaceId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Hanya format DOCX yang didukung.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsImporting(true);
    try {
      // 1. Upload and parse
      const formData = new FormData();
      formData.append('file', file);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/api/export/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Gagal memproses file dokumen.');
      const data = await res.json();
      const htmlContent = data.html;

      // 2. Create the document on server
      const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const newDoc = await createDocumentClient(workspaceId, title);
      
      if (newDoc.error || !newDoc.id) {
        throw new Error(newDoc.error || 'Failed to create document');
      }
      
      // 3. Inject HTML
      localStorage.setItem(`import_${newDoc.id}`, htmlContent);
      
      // Redirect to the new document
      router.push(`/w/${workspaceId}/d/${newDoc.id}`);
      
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat mengimpor dokumen.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        accept=".docx" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isImporting}
        className="h-[40px] px-4 gap-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 transition-all text-[14px] font-medium"
      >
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {isImporting ? 'Mengimpor...' : 'Import DOCX'}
      </Button>
    </>
  );
}
