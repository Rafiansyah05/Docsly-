import React, { useState, useEffect } from 'react';
import { PageSettings, PageNumberSection, defaultPageSettings, toRoman, fromRoman } from '@/lib/page-numbers';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface PageNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PageSettings | null;
  onSave: (settings: PageSettings) => void;
}

function StartNumberInput({ section, disabled, onChange }: { section: PageNumberSection, disabled: boolean, onChange: (val: number) => void }) {
  const [localVal, setLocalVal] = useState('');

  useEffect(() => {
    if (section.format === 'roman_lower') setLocalVal(toRoman(section.startNumber).toLowerCase());
    else if (section.format === 'roman_upper') setLocalVal(toRoman(section.startNumber));
    else setLocalVal(section.startNumber.toString());
  }, [section.startNumber, section.format]);

  const parseValue = (val: string) => {
    if (section.format.startsWith('roman')) return fromRoman(val) || 1;
    const p = parseInt(val);
    return (isNaN(p) || p < 1) ? 1 : p;
  };

  const handleCommit = () => {
    onChange(parseValue(localVal));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const current = parseValue(localVal);
      onChange(current + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const current = parseValue(localVal);
      if (current > 1) {
        onChange(current - 1);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (section.format.startsWith('roman')) {
      if (/^[ivxlcdm]*$/i.test(val)) {
        setLocalVal(val);
      }
    } else {
      if (/^\d*$/.test(val)) {
        setLocalVal(val);
      }
    }
  };

  return (
    <Input
      type="text"
      disabled={disabled}
      value={localVal}
      onChange={handleChange}
      onBlur={handleCommit}
      onKeyDown={handleKeyDown}
      className="h-8 text-sm text-slate-900"
    />
  );
}

export function PageNumberModal({ isOpen, onClose, settings, onSave }: PageNumberModalProps) {
  const [currentSettings, setCurrentSettings] = useState<PageSettings>(defaultPageSettings);

  useEffect(() => {
    if (isOpen) {
      if (settings && settings.sections) {
        // Deep copy settings to avoid mutating editor state directly
        setCurrentSettings(JSON.parse(JSON.stringify(settings)));
      } else {
        setCurrentSettings(JSON.parse(JSON.stringify(defaultPageSettings)));
      }
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdateSection = (index: number, field: keyof PageNumberSection, value: any) => {
    const newSettings = { ...currentSettings };
    newSettings.sections[index] = {
      ...newSettings.sections[index],
      [field]: value
    };
    // Ensure it stays sorted
    if (field === 'startPage') {
      newSettings.sections.sort((a, b) => a.startPage - b.startPage);
    }
    setCurrentSettings(newSettings);
  };

  const handleAddSection = () => {
    const newSettings = { ...currentSettings };
    const lastPage = newSettings.sections.length > 0 
      ? newSettings.sections[newSettings.sections.length - 1].startPage 
      : 0;
    
    newSettings.sections.push({
      startPage: lastPage + 1,
      format: 'arabic',
      startNumber: 1
    });
    newSettings.sections.sort((a, b) => a.startPage - b.startPage);
    setCurrentSettings(newSettings);
  };

  const handleRemoveSection = (index: number) => {
    if (currentSettings.sections.length <= 1) return; // Prevent removing the last section
    const newSettings = { ...currentSettings };
    newSettings.sections.splice(index, 1);
    setCurrentSettings(newSettings);
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full mx-4 overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Pengaturan Nomor Halaman</h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="enable-page-numbers" className="text-sm font-medium text-slate-700">Aktifkan</Label>
            <input 
              id="enable-page-numbers"
              type="checkbox"
              className="w-4 h-4 accent-blue-600 rounded border-slate-300 cursor-pointer"
              checked={currentSettings.enabled} 
              onChange={(e) => setCurrentSettings(s => ({ ...s, enabled: e.target.checked }))} 
            />
          </div>
        </div>

        <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* General Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Posisi</Label>
              <Select 
                disabled={!currentSettings.enabled}
                value={currentSettings.position} 
                onValueChange={(v: any) => setCurrentSettings(s => ({ ...s, position: v }))}
              >
                <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200 text-slate-900">
                  <SelectValue placeholder="Pilih Posisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Header (Atas)</SelectItem>
                  <SelectItem value="bottom">Footer (Bawah)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Perataan</Label>
              <Select 
                disabled={!currentSettings.enabled}
                value={currentSettings.align} 
                onValueChange={(v: any) => setCurrentSettings(s => ({ ...s, align: v }))}
              >
                <SelectTrigger className="w-full h-9 bg-slate-50 border-slate-200 text-slate-900">
                  <SelectValue placeholder="Pilih Perataan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Kiri</SelectItem>
                  <SelectItem value="center">Tengah</SelectItem>
                  <SelectItem value="right">Kanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Format per Halaman (Sections)</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAddSection}
                disabled={!currentSettings.enabled}
                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Bagian
              </Button>
            </div>

            <div className="space-y-3">
              {currentSettings.sections.map((section, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${currentSettings.enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'} flex flex-col gap-3 relative group`}>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-400">Mulai dari Halaman</Label>
                      <Input 
                        type="number" 
                        min={1}
                        disabled={!currentSettings.enabled}
                        value={section.startPage}
                        onChange={(e) => handleUpdateSection(idx, 'startPage', parseInt(e.target.value) || 1)}
                        className="h-8 text-sm text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-400">Format Angka</Label>
                      <Select 
                        disabled={!currentSettings.enabled}
                        value={section.format} 
                        onValueChange={(v: any) => handleUpdateSection(idx, 'format', v)}
                      >
                        <SelectTrigger className="h-8 text-sm text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arabic">1, 2, 3</SelectItem>
                          <SelectItem value="roman_lower">i, ii, iii</SelectItem>
                          <SelectItem value="roman_upper">I, II, III</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-slate-400">Mulai dari Nomor</Label>
                      <StartNumberInput 
                        section={section}
                        disabled={!currentSettings.enabled}
                        onChange={(val) => handleUpdateSection(idx, 'startNumber', val)}
                      />
                    </div>
                  </div>
                  {currentSettings.sections.length > 1 && (
                    <button 
                      onClick={() => handleRemoveSection(idx)}
                      disabled={!currentSettings.enabled}
                      className="absolute -top-2 -right-2 bg-white border border-slate-200 p-1 rounded-full text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
                      title="Hapus Bagian"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Contoh: Jika Anda ingin Halaman 1-3 romawi dan Halaman 4+ angka biasa, buat 2 bagian: (Mulai dari Halaman 1, Format i,ii,iii, Mulai dari 1) dan (Mulai dari Halaman 4, Format 1,2,3, Mulai dari 1).
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-3 flex justify-end gap-3 border-t border-slate-100">
          <Button 
            onClick={onClose}
            variant="outline"
            className="text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900"
          >
            Batal
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg border-none"
          >
            Simpan Pengaturan
          </Button>
        </div>
      </div>
    </div>
  );
}
