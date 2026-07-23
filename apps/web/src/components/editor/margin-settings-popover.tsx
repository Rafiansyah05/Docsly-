'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Settings2, X } from 'lucide-react';
import { DocumentLayout } from './document-ruler';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CM_TO_PX = 37.795;
const pxToCm = (px: number) => Number((px / CM_TO_PX).toFixed(2));
const cmToPx = (cm: number) => Math.round(cm * CM_TO_PX);

interface MarginSettingsPopoverProps {
  layout: DocumentLayout;
  onLayoutChange: (layout: DocumentLayout) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MarginSettingsPopover({ layout, onLayoutChange, isOpen, onClose }: MarginSettingsPopoverProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [margins, setMargins] = useState({
    top: pxToCm(layout.top),
    bottom: pxToCm(layout.bottom),
    left: pxToCm(layout.left),
    right: pxToCm(layout.right)
  });

  // Sync internal state if layout changes externally (e.g. from manual dragging)
  useEffect(() => {
    setMargins({
      top: pxToCm(layout.top),
      bottom: pxToCm(layout.bottom),
      left: pxToCm(layout.left),
      right: pxToCm(layout.right)
    });
  }, [layout]);

  const handleChange = (key: keyof typeof margins, value: string) => {
    const num = parseFloat(value);
    setMargins(prev => ({ ...prev, [key]: isNaN(num) ? '' : num }));
  };

  const applyMargins = async () => {
    setIsLoading(true);
    // Simulate loading for better UX as requested
    await new Promise(resolve => setTimeout(resolve, 600));
    onLayoutChange({
      top: cmToPx(Number(margins.top) || 0),
      bottom: cmToPx(Number(margins.bottom) || 0),
      left: cmToPx(Number(margins.left) || 0),
      right: cmToPx(Number(margins.right) || 0)
    });
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-xl rounded-lg z-50 flex flex-col overflow-hidden max-h-[85vh]">
      <div className="bg-slate-50 dark:bg-zinc-900 p-3 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-100 font-semibold text-sm">
          <Settings2 className="h-4 w-4" />
          Atur Margin
        </div>
        <button onClick={onClose} className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans bg-white dark:bg-zinc-950">
        <div className="space-y-1">
          <h4 className="font-medium text-sm leading-none text-zinc-900 dark:text-zinc-100">Margin Halaman (cm)</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Atur batas margin kertas sesuai kebutuhan.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="top-margin" className="text-xs">Atas</Label>
            <Input id="top-margin" type="number" step="0.1" value={margins.top} onChange={(e) => handleChange('top', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bottom-margin" className="text-xs">Bawah</Label>
            <Input id="bottom-margin" type="number" step="0.1" value={margins.bottom} onChange={(e) => handleChange('bottom', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="left-margin" className="text-xs">Kiri</Label>
            <Input id="left-margin" type="number" step="0.1" value={margins.left} onChange={(e) => handleChange('left', e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="right-margin" className="text-xs">Kanan</Label>
            <Input id="right-margin" type="number" step="0.1" value={margins.right} onChange={(e) => handleChange('right', e.target.value)} className="h-8 text-sm" />
          </div>
        </div>
        <div className="pt-2">
          <Button onClick={applyMargins} disabled={isLoading} size="sm" className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white shadow-none">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? 'Menerapkan...' : 'Terapkan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
