'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Search, FileText, LayoutGrid, List as ListIcon, Clock, MoreHorizontal, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { deleteDocument } from '@/lib/actions/document';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { estimatePageCount } from '@/lib/page-numbers';

export function WorkspaceDocuments({ initialDocuments, workspaceId }: { initialDocuments: any[], workspaceId: string }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated_desc');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();

  // Force Next.js Router Cache to refresh on mount
  React.useEffect(() => {
    router.refresh();
  }, [router]);

  // Sync prop changes to state
  React.useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  // Real-time Supabase subscription
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-workspace-docs-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocuments((prev) => {
              if (prev.some((doc) => doc.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === payload.new.id ? { ...doc, ...payload.new } : doc
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments((prev) => prev.filter((doc) => doc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  const filteredDocuments = documents
    .filter(doc => (doc.judul || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'updated_desc') {
        return new Date(b.diperbarui_pada).getTime() - new Date(a.diperbarui_pada).getTime();
      } else if (sort === 'updated_asc') {
        return new Date(a.diperbarui_pada).getTime() - new Date(b.diperbarui_pada).getTime();
      } else if (sort === 'name_asc') {
        return (a.judul || '').localeCompare(b.judul || '');
      } else {
        return (b.judul || '').localeCompare(a.judul || '');
      }
    });

  const handleDelete = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDocument(documentToDelete.id, workspaceId);
      toast.success('Dokumen berhasil dihapus');
      setIsDeleteDialogOpen(false);
      setDocumentToDelete(null);
      router.refresh();
    } catch (err) {
      toast.error('Terjadi kesalahan saat menghapus dokumen');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Control Area */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search document..."
            className="pl-9 h-[40px] rounded-lg border-slate-200 bg-white text-[14px] text-slate-900 focus-visible:ring-1 focus-visible:ring-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={sort}
            onValueChange={(value) => {
              if (value) {
                setSort(value);
              }
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px] h-[40px] rounded-lg border-slate-200 bg-white text-[14px] text-slate-900 focus:ring-0 focus:ring-offset-0">
              <span className="flex-1 text-left">
                {sort === 'updated_desc' ? 'Terbaru' :
                  sort === 'updated_asc' ? 'Terlama' :
                    sort === 'name_asc' ? 'Nama (A - Z)' :
                      sort === 'name_desc' ? 'Nama (Z - A)' :
                        'Urutkan'}
              </span>
              <SelectValue className="hidden" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="end" sideOffset={4} className="rounded-lg border-slate-200 bg-white shadow-sm">
              <SelectItem value="updated_desc">Terbaru</SelectItem>
              <SelectItem value="updated_asc">Terlama</SelectItem>
              <SelectItem value="name_asc">Nama (A - Z)</SelectItem>
              <SelectItem value="name_desc">Nama (Z - A)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 h-[40px] items-center">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              aria-label="List View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredDocuments.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => router.push(`/w/${workspaceId}/d/${doc.id}`)}
                className="h-full relative p-5 rounded-xl bg-white border border-slate-200 transition-all duration-150 ease-in-out hover:bg-slate-50 hover:-translate-y-[1px] hover:border-slate-300 flex flex-col group cursor-pointer"
              >
                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100 data-[open]:opacity-100 focus:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    } />
                    <DropdownMenuContent align="end" className="w-[160px] bg-white rounded-lg shadow-sm border border-slate-200 p-1 z-50">
                      <DropdownMenuItem
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer text-[13px] rounded-md px-2 py-1.5 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocumentToDelete(doc);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus Dokumen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                  <div className="flex-1 overflow-hidden pr-8">
                    <h3 className="text-[16px] font-semibold text-slate-900 truncate">
                      {doc.judul}
                    </h3>
                    <p className="text-[13px] text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(doc.diperbarui_pada).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                  <span className="inline-flex items-center rounded-md bg-slate-100 border-none px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {estimatePageCount(doc.konten_json_terkini)} Halaman
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="px-6 py-4 text-[13px] font-medium text-slate-500 w-[50%]">Title</th>
                  <th className="px-6 py-4 text-[13px] font-medium text-slate-500">Jumlah Halaman</th>
                  <th className="px-6 py-4 text-[13px] font-medium text-slate-500 text-right">Updated Date</th>
                  <th className="px-4 py-4 w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc, i) => (
                  <tr key={doc.id} className={`group hover:bg-slate-50 cursor-pointer transition-colors ${i !== filteredDocuments.length - 1 ? 'border-b border-slate-100' : ''}`} onClick={() => router.push(`/w/${workspaceId}/d/${doc.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                        <span className="text-[14px] font-medium text-slate-900 truncate max-w-[300px]">{doc.judul}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 border-none px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {estimatePageCount(doc.konten_json_terkini)} Halaman
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[13px] text-slate-500">
                        {new Date(doc.diperbarui_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100 data-[open]:opacity-100 focus:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        } />
                        <DropdownMenuContent align="end" className="w-[160px] bg-white rounded-lg shadow-sm border border-slate-200 p-1 z-50">
                          <DropdownMenuItem
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer text-[13px] rounded-md px-2 py-1.5 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocumentToDelete(doc);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus Dokumen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="h-12 w-12 text-slate-200 mb-6" strokeWidth={1} />
          <h3 className="text-[18px] font-semibold text-slate-900 mb-2">Belum ada dokumen</h3>
          <p className="text-[14px] text-slate-500 max-w-[280px] mb-8 leading-relaxed">
            {search ? 'Tidak ada dokumen yang cocok dengan pencarian Anda.' : 'Mulai menyusun dokumen dengan membuat dokumen baru atau mengimpor file yang sudah ada melalui tombol di atas.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-xl border-slate-200 bg-white p-6 shadow-sm">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900">Hapus Dokumen?</DialogTitle>
            <DialogDescription className="text-[14px] text-slate-500">
              Apakah Anda yakin ingin menghapus dokumen <span className="font-semibold text-slate-700">{documentToDelete?.judul}</span>? Dokumen ini akan terhapus secara permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-[40px] px-4 rounded-lg bg-white border border-slate-200 font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-[40px] px-4 rounded-lg bg-red-600 font-medium text-white hover:bg-red-700 transition-colors border-0"
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
