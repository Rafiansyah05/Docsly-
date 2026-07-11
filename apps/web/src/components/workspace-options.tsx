'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Trash2, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { renameWorkspace, deleteWorkspace } from '@/lib/actions/workspace';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface WorkspaceOptionsProps {
  workspaceId: string;
  initialName: string;
}

export function WorkspaceOptions({ workspaceId, initialName }: WorkspaceOptionsProps) {
  const router = useRouter();
  
  const [showRename, setShowRename] = useState(false);
  const [newName, setNewName] = useState(initialName);
  const [isRenaming, setIsRenaming] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRenaming(true);
    const res = await renameWorkspace(workspaceId, newName);
    setIsRenaming(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      setShowRename(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteWorkspace(workspaceId);
    setIsDeleting(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      setShowDelete(false);
      router.push('/w');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger 
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 outline-none transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-slate-100 rounded-md p-2 flex items-center"
            onClick={() => setShowRename(true)}
          >
            <Edit2 className="h-4 w-4 mr-2 text-slate-500" />
            <span className="text-slate-700 font-medium">Ubah Nama</span>
          </DropdownMenuItem>
          <div className="h-px bg-slate-100 my-1 mx-2" />
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-red-50 focus:bg-red-50 rounded-md p-2 flex items-center group"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-500 group-hover:text-red-600" />
            <span className="text-red-600 font-medium">Hapus Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={(open) => { if (open) setShowRename(true) }}>
        <DialogContent 
          className="bg-white sm:max-w-md border-0 shadow-none ring-1 ring-slate-100"
          showCloseButton={false}
        >
          <button 
            type="button"
            className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => setShowRename(false)}
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-slate-900">Ubah Nama Workspace</DialogTitle>
            <DialogDescription className="text-slate-500">
              Pilih nama baru untuk workspace ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRename}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Workspace</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Proyek Pribadi"
                  className="text-slate-900"
                  required
                />
              </div>
            </div>
            <DialogFooter className="gap-3 mt-4">
              <Button type="button" variant="outline" onClick={() => setShowRename(false)} className="text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900">
                Batal
              </Button>
              <Button type="submit" disabled={isRenaming || !newName || newName === initialName} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-none">
                {isRenaming ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDelete} onOpenChange={(open) => { if (open) setShowDelete(true) }}>
        <DialogContent 
          className="bg-white sm:max-w-md border-0 shadow-none ring-1 ring-slate-100"
          showCloseButton={false}
        >
          <button 
            type="button"
            className="absolute top-2 right-2 flex items-center justify-center h-7 w-7 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            onClick={() => setShowDelete(false)}
          >
            <X className="h-4 w-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-red-600">Hapus Workspace?</DialogTitle>
            <DialogDescription className="text-slate-600">
              Apakah Anda yakin ingin menghapus workspace <strong className="text-slate-900">{initialName}</strong>? Tindakan ini tidak dapat dibatalkan dan akan <strong className="text-slate-900">menghapus semua dokumen</strong> di dalamnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button type="button" variant="outline" onClick={() => setShowDelete(false)} className="text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900">
              Batal
            </Button>
            <Button type="button" onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-none">
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
