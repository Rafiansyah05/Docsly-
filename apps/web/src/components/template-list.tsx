'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { GraduationCap, Briefcase, BookOpen, FileSignature, TrendingUp, Award, Loader2, Plus } from 'lucide-react';
import { createDocumentClient } from '@/lib/actions/document';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TEMPLATES_DATA } from '@/lib/data/templates';

const IconMap: Record<string, React.ReactNode> = {
  'graduation-cap': <GraduationCap className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />,
  'briefcase': <Briefcase className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />,
  'book-open': <BookOpen className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />,
  'file-signature': <FileSignature className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />,
  'trending-up': <TrendingUp className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />,
  'award': <Award className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
};

export function TemplateList({ workspaces }: { workspaces: any[] }) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleUseTemplate = async () => {
    if (!selectedWorkspace || !selectedTemplate) {
      toast.error('Silakan pilih workspace terlebih dahulu');
      return;
    }

    setIsCreating(true);
    try {
      // Create new document
      const newDoc = await createDocumentClient(selectedWorkspace, selectedTemplate.title);

      if (newDoc.error || !newDoc.id) {
        throw new Error(newDoc.error || 'Failed to create document');
      }

      // Inject Template HTML
      localStorage.setItem(`import_${newDoc.id}`, selectedTemplate.html);

      toast.success('Template berhasil diterapkan!');
      // Redirect to the new document
      router.push(`/w/${selectedWorkspace}/d/${newDoc.id}`);

    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan saat menerapkan template.');
      setIsCreating(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES_DATA.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className="h-full relative p-6 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 transition-all duration-200 ease-in-out hover:bg-slate-50 dark:hover:bg-zinc-900 hover:-translate-y-[2px] hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-sm flex flex-col group cursor-pointer"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                {IconMap[template.icon]}
              </div>
              <div className="flex-1 overflow-hidden mt-1">
                <h3 className="text-[18px] font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {template.title}
                </h3>
              </div>
            </div>

            <p className="text-[14px] text-slate-500 dark:text-zinc-400 flex-1 leading-relaxed mt-2">
              {template.description}
            </p>

            <div className="pt-5 mt-auto flex items-center">
              <span className="text-[13px] font-medium text-blue-600 dark:text-blue-500 flex items-center gap-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Gunakan Template
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Gunakan Template</DialogTitle>
            <DialogDescription className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1.5">
              Anda memilih template <strong className="text-slate-700 dark:text-zinc-300">{selectedTemplate?.title}</strong>. Silakan pilih Workspace tujuan untuk menyimpan dokumen ini.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {workspaces.length > 0 ? (
              <Select
                value={selectedWorkspace}
                onValueChange={(value) => {
                  if (value) {
                    setSelectedWorkspace(value);
                  }
                }}
              >
                <SelectTrigger className="w-full h-[40px] rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[14px] text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-slate-400 dark:focus:ring-zinc-600">
                  <span className="flex-1 text-left truncate">
                    {selectedWorkspace ? workspaces.find(w => w.id === selectedWorkspace)?.nama_workspace : 'Pilih Workspace...'}
                  </span>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} className="w-[var(--anchor-width)] rounded-lg border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm z-50 text-slate-900 dark:text-zinc-100">
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id} className="focus:bg-slate-100 dark:focus:bg-zinc-800">
                      {workspace.nama_workspace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
                Anda belum memiliki Workspace. Silakan buat Workspace terlebih dahulu di halaman Home.
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTemplate(null)}
              className="h-[40px] px-4 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleUseTemplate}
              disabled={isCreating || !selectedWorkspace}
              className="h-[40px] px-4 rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700 transition-colors border-0"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menerapkan...
                </>
              ) : 'Gunakan Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
