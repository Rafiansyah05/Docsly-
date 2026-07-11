import React, { useState, useEffect } from 'react';
import { History, X, Check, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getVersions, createVersion, restoreVersion } from '@/lib/actions/document';
import { Editor } from '@tiptap/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Version {
  id: string;
  ringkasan_perubahan: string;
  dibuat_oleh: string;
  dibuat_pada: string;
}

export function VersionHistoryPanel({
  documentId,
  editor,
  isOpen,
  onClose
}: {
  documentId: string;
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [summaryInput, setSummaryInput] = useState('');
  const [versionToRestore, setVersionToRestore] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen]);

  const loadVersions = async () => {
    setIsLoading(true);
    const { versions, error } = await getVersions(documentId);
    if (!error && versions) {
      setVersions(versions);
    }
    setIsLoading(false);
  };

  const handleCreateVersion = async () => {
    if (!editor || !summaryInput.trim()) return;
    setIsCreating(true);
    const { error } = await createVersion(documentId, JSON.parse(JSON.stringify(editor.getJSON())), summaryInput);
    if (!error) {
      setSummaryInput('');
      loadVersions();
    }
    setIsCreating(false);
  };

  const confirmRestore = async () => {
    if (!versionToRestore) return;
    const versionId = versionToRestore;
    setVersionToRestore(null);
    
    const { success, content, error } = await restoreVersion(documentId, versionId);
    if (success && content && editor) {
      editor.commands.setContent(content);
      toast.success('Dokumen berhasil dikembalikan ke versi lama.');
    } else {
      toast.error(error || 'Gagal melakukan restore');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative w-80 bg-white border-l border-slate-200 flex flex-col z-30 flex-shrink-0 h-full shadow-sm">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold flex items-center gap-2 text-slate-800">
          <History className="h-4 w-4" /> Riwayat Versi
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="text-sm font-medium mb-2 text-slate-700">Simpan Versi Saat Ini</div>
        <input 
          type="text" 
          value={summaryInput}
          onChange={(e) => setSummaryInput(e.target.value)}
          placeholder="Ringkasan (misal: Selesai Bab 1)" 
          className="w-full text-xs p-2 border border-slate-200 rounded mb-2 focus:outline-none focus:border-slate-400 bg-white text-slate-900 placeholder:text-slate-400"
        />
        <Button 
          onClick={handleCreateVersion} 
          disabled={isCreating || !summaryInput.trim()}
          size="sm" 
          className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isCreating ? 'Menyimpan...' : 'Simpan sebagai Versi'}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {isLoading ? (
          <div className="text-center text-xs text-slate-400 mt-4">Memuat riwayat...</div>
        ) : versions.length === 0 ? (
          <div className="text-center flex flex-col items-center justify-center mt-10 opacity-50">
            <AlertCircle className="h-8 w-8 mb-2 text-slate-400" />
            <p className="text-xs text-slate-500">Belum ada riwayat versi yang disimpan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {versions.map((v) => (
              <div key={v.id} className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-xs text-slate-800">{v.ringkasan_perubahan}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3">
                  <Clock className="h-3 w-3" /> 
                  {new Date(v.dibuat_pada).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  {' • '}
                  {v.dibuat_oleh}
                </div>
                <Button 
                  onClick={() => setVersionToRestore(v.id)} 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-6 text-[10px] bg-slate-50 text-slate-600 hover:bg-slate-100"
                >
                  Restore ke Versi Ini
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Restore Confirm Dialog */}
      <Dialog open={!!versionToRestore} onOpenChange={(open) => { if (!open) setVersionToRestore(null) }}>
        <DialogContent 
          className="bg-white sm:max-w-md border-0 shadow-none ring-1 ring-slate-100"
          showCloseButton={false}
        >
          <button 
            type="button"
            className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => setVersionToRestore(null)}
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-slate-800">Kembalikan ke Versi Ini?</DialogTitle>
            <DialogDescription className="text-slate-600 mt-2 leading-relaxed">
              Apakah Anda yakin ingin mengembalikan dokumen ke versi ini? Semua perubahan baru setelah versi ini yang belum Anda simpan ke dalam riwayat akan <strong>hilang secara permanen</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setVersionToRestore(null)} className="text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 shadow-none">
              Batal
            </Button>
            <Button type="button" onClick={confirmRestore} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-none">
              Ya, Kembalikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
