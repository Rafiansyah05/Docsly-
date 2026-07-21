'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Search, Folder, Plus, LayoutGrid, List as ListIcon, Clock, ArrowUpDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createWorkspace, deleteWorkspace } from '@/lib/actions/workspace';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useFormStatus } from 'react-dom';

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-[40px] px-4 rounded-lg bg-slate-900 dark:bg-zinc-100 font-medium text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors"
    >
      {pending ? 'Membuat...' : 'Buat Workspace'}
    </Button>
  );
}

export function DashboardWorkspaces({ initialWorkspaces, userId }: { initialWorkspaces: any[], userId: string }) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('updated_desc');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Sync prop changes to state
  React.useEffect(() => {
    setWorkspaces(initialWorkspaces);
  }, [initialWorkspaces]);

  const filteredWorkspaces = workspaces
    .filter(ws => (ws.nama_workspace || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'updated_desc') {
        return new Date(b.dibuat_pada).getTime() - new Date(a.dibuat_pada).getTime();
      } else if (sort === 'updated_asc') {
        return new Date(a.dibuat_pada).getTime() - new Date(b.dibuat_pada).getTime();
      } else if (sort === 'name_asc') {
        return (a.nama_workspace || '').localeCompare(b.nama_workspace || '');
      } else {
        return (b.nama_workspace || '').localeCompare(a.nama_workspace || '');
      }
    });

  const handleCreate = async (formData: FormData) => {
    try {
      const nama = formData.get('nama') as string;
      const result = await createWorkspace(nama);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setIsDialogOpen(false);
      toast.success('Workspace berhasil dibuat!');
      router.refresh();
    } catch (err) {
      toast.error('Terjadi kesalahan yang tidak terduga.');
    }
  };

  const handleDelete = async () => {
    if (!workspaceToDelete) return;
    setIsDeleting(true);
    
    try {
      const result = await deleteWorkspace(workspaceToDelete.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Workspace berhasil dihapus');
        setIsDeleteDialogOpen(false);
        setWorkspaceToDelete(null);
        // Do NOT call router.refresh() here. Server action with revalidatePath handles UI updates automatically.
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menghapus workspace');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8 md:py-10">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-semibold tracking-tight text-slate-900 dark:text-zinc-100 leading-none">Workspaces</h1>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400">Choose or create workspace to start working.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="h-[40px] px-4 rounded-lg bg-slate-900 dark:bg-zinc-100 font-medium text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" /> Buat Workspace
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Buat Workspace Baru</DialogTitle>
              <DialogDescription className="text-[14px] text-slate-500 dark:text-zinc-400">
                Berikan nama yang deskriptif untuk workspace baru Anda.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate}>
              <div className="flex flex-col gap-4 mb-6">
                <Input
                  id="nama"
                  name="nama"
                  placeholder="Contoh: Skripsi Bab 1-3"
                  className="h-[40px] rounded-lg border-slate-200 dark:border-zinc-800 px-3 text-[14px] text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-zinc-600"
                  required
                />
              </div>
              <DialogFooter>
                <CreateButton />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Control Area: Search, Sort, View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <Input
            placeholder="Search workspace..."
            className="pl-9 h-[40px] rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[14px] text-slate-900 dark:text-zinc-100 focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-zinc-600"
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
            <SelectTrigger className="w-full sm:w-[200px] h-[40px] rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[14px] text-slate-900 dark:text-zinc-100 focus:ring-0 focus:ring-offset-0">
              <span className="flex-1 text-left">
                {sort === 'updated_desc' ? 'Terbaru' :
                  sort === 'updated_asc' ? 'Terlama' :
                    sort === 'name_asc' ? 'Nama (A - Z)' :
                      sort === 'name_desc' ? 'Nama (Z - A)' :
                        'Urutkan'}
              </span>
            </SelectTrigger>
            <SelectContent align="end" sideOffset={4} className="rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm text-slate-900 dark:text-zinc-100">
              <SelectItem value="updated_desc" className="focus:bg-slate-100 dark:focus:bg-zinc-800">Terbaru</SelectItem>
              <SelectItem value="updated_asc" className="focus:bg-slate-100 dark:focus:bg-zinc-800">Terlama</SelectItem>
              <SelectItem value="name_asc" className="focus:bg-slate-100 dark:focus:bg-zinc-800">Nama (A - Z)</SelectItem>
              <SelectItem value="name_desc" className="focus:bg-slate-100 dark:focus:bg-zinc-800">Nama (Z - A)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-slate-100 dark:bg-zinc-900/50 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 h-[40px] items-center">
            <button
              onClick={() => setView('grid')}
              className={`h-full px-2.5 rounded-md transition-colors flex items-center justify-center ${view === 'grid' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-zinc-100' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`h-full px-2.5 rounded-md transition-colors flex items-center justify-center ${view === 'list' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-zinc-100' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}
              aria-label="List View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filteredWorkspaces.length > 0 ? (
        view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkspaces.map(ws => (
              <Link
                key={ws.id}
                href={`/w/${ws.id}`}
                className="h-full relative p-5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 transition-all duration-150 ease-in-out hover:bg-slate-50 dark:hover:bg-zinc-900 hover:-translate-y-[1px] hover:border-slate-300 dark:hover:border-zinc-700 flex flex-col group cursor-pointer block"
              >
                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.preventDefault()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 data-[open]:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-800 p-1 z-50">
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300 cursor-pointer text-[13px] rounded-md px-2 py-1.5 flex items-center gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          setWorkspaceToDelete(ws);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus Workspace
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <Folder className="h-5 w-5 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </div>
                  <div className="flex-1 overflow-hidden pr-6">
                    <h3 className="text-[16px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {ws.nama_workspace}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      Created {new Date(ws.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 mt-auto">
                  <p className="text-[13px] text-slate-500 dark:text-zinc-400 font-medium">
                    {ws.documents?.[0]?.count || 0} Documents
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <th className="px-6 py-4 text-[13px] font-medium text-slate-500 dark:text-zinc-400 w-[50%]">Name</th>
                  <th className="px-6 py-4 text-[13px] font-medium text-slate-500 dark:text-zinc-400">Documents</th>
                  <th className="px-6 py-4 text-[13px] font-medium text-slate-500 dark:text-zinc-400 text-right">Created Date</th>
                  <th className="px-4 py-4 w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkspaces.map((ws, i) => (
                  <tr key={ws.id} className={`group hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors ${i !== filteredWorkspaces.length - 1 ? 'border-b border-slate-100 dark:border-zinc-800' : ''}`} onClick={() => router.push(`/w/${ws.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Folder className="h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300" />
                        <span className="text-[14px] font-medium text-slate-900 dark:text-zinc-100">{ws.nama_workspace}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-slate-500 dark:text-zinc-400">{ws.documents?.[0]?.count || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[13px] text-slate-500 dark:text-zinc-400">
                        {new Date(ws.dibuat_pada).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100 data-[open]:opacity-100 focus:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-800 p-1 z-50">
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300 cursor-pointer text-[13px] rounded-md px-2 py-1.5 flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWorkspaceToDelete(ws);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus Workspace
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
          <Folder className="h-12 w-12 text-slate-200 dark:text-zinc-700 mb-6" strokeWidth={1} />
          <h3 className="text-[18px] font-semibold text-slate-900 dark:text-zinc-100 mb-2">No Workspace Yet</h3>
          <p className="text-[14px] text-slate-500 dark:text-zinc-400 max-w-[280px] mb-8 leading-relaxed">
            {search ? 'Tidak ada hasil yang cocok dengan pencarian Anda.' : 'Create your first workspace to start organizing documents.'}
          </p>

          {!search && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="h-[40px] px-6 rounded-lg bg-slate-900 dark:bg-zinc-100 font-medium text-white dark:text-zinc-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create Workspace
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Hapus Workspace?</DialogTitle>
            <DialogDescription className="text-[14px] text-slate-500 dark:text-zinc-400">
              Apakah Anda yakin ingin menghapus workspace <span className="font-semibold text-slate-700 dark:text-zinc-300">{workspaceToDelete?.nama_workspace}</span>? Seluruh dokumen di dalamnya akan terhapus secara permanen dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-[40px] px-4 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
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
