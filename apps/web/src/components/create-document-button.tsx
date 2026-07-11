'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export function CreateDocumentButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="h-[40px] px-4 gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm transition-all text-[14px] font-medium min-w-[180px]"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Menyiapkan...
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" /> 
          Buat Dokumen Baru
        </>
      )}
    </Button>
  );
}
