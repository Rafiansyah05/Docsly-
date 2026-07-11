'use client';

import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { Briefcase, ChevronsUpDown } from 'lucide-react';

export function WorkspaceSwitcher({ workspaces }: { workspaces: any[] }) {
  const router = useRouter();
  const params = useParams();
  const currentWorkspaceId = params?.workspace_id as string | undefined;

  const handleSelect = (value: string | null) => {
    if (!value) return;
    router.push(`/w/${value}`);
  };

  return (
    <>
      <Select value={currentWorkspaceId} onValueChange={handleSelect}>
        <SelectTrigger className="w-auto min-w-[200px] h-10 px-3 border-none bg-white text-slate-900 hover:bg-slate-100 shadow-none rounded-lg focus:ring-0 focus:ring-offset-0 transition-colors font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-500">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
            <SelectValue placeholder="Pilih Workspace">
              {currentWorkspaceId 
                ? workspaces.find(w => w.id === currentWorkspaceId)?.nama_workspace || 'Pilih Workspace'
                : 'Pilih Workspace'}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50">
          {workspaces.map((ws) => (
            <SelectItem key={ws.id} value={ws.id} className="p-2 cursor-pointer rounded-md focus:bg-slate-100 focus:text-slate-900 group outline-none">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-100 group-focus:bg-slate-200 flex items-center justify-center text-slate-500 group-focus:text-slate-700 transition-colors">
                  <span className="text-[10px] uppercase font-bold">{ws.nama_workspace.substring(0, 2)}</span>
                </div>
                <span className="font-medium text-slate-700 group-focus:text-slate-900 transition-colors">{ws.nama_workspace}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

    </>
  );
}
