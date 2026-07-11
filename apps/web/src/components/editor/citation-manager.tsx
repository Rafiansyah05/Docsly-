import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, X, Upload, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';
import { addReference, getReferences } from './extensions/citation';

export const CitationManager = ({ editor, isOpen, onClose }: any) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [citationStyle, setCitationStyle] = useState<'APA' | 'Harvard'>('APA');

  const [formData, setFormData] = useState({
    id: '',
    judul: '',
    penulis: '',
    tahun: '',
    penerbit: '',
    jenis: 'Buku',
  });

  const refs = getReferences();

  const handleSaveManual = () => {
    if (!formData.judul || !formData.penulis) return;
    
    const newId = formData.id || `ref-${Math.random().toString(36).substr(2, 9)}`;
    addReference(newId, { ...formData, id: newId });
    
    setIsAdding(false);
    setFormData({ id: '', judul: '', penulis: '', tahun: '', penerbit: '', jenis: 'Buku' });
  };

  const handleInsertCitation = (id: string) => {
    const r = refs.find((ref: any) => ref.id === id);
    if (!r) return;
    
    const author = r.penulis || 'Unknown';
    const year = r.tahun ? `(${r.tahun}).` : '(n.d.).';
    const title = r.judul ? `${r.judul}.` : '';
    const publisher = r.penerbit ? ` ${r.penerbit}.` : '';
    
    let fullText = `${author} ${year} ${title}${publisher}`;
    if (citationStyle === 'Harvard') {
      fullText = `${author}, ${r.tahun || 'n.d.'}. ${title}${publisher}`;
    }

    editor.chain().focus().insertContent(fullText).run();
  };

  const processExtractedData = (result: any) => {
    setIsLoading(false);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }
    
    // Auto populate form and switch to manual to confirm
    const data = result.data;
    setFormData({
      id: '',
      judul: data.title || '',
      penulis: data.authors ? data.authors.join(', ') : '',
      tahun: data.year || '',
      penerbit: data.publisher || data.journal || '',
      jenis: data.type === 'journal' ? 'Jurnal' : data.type === 'book' ? 'Buku' : 'Situs Web',
    });
    setErrorMsg(null);
    setActiveTab('manual');
    setIsAdding(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:3001/api/citation/extract-file', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      processExtractedData(data);
    } catch (err) {
      setIsLoading(false);
      setErrorMsg('Gagal terhubung ke server untuk ekstraksi file.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 shadow-xl rounded-lg z-50 flex flex-col overflow-hidden max-h-[85vh]">
      <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <BookOpen className="h-4 w-4" />
          Sitasi & Pustaka
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex border-b text-xs font-medium">
        <button 
          onClick={() => { setActiveTab('auto'); setIsAdding(false); setErrorMsg(null); }}
          className={`flex-1 py-2 text-center ${activeTab === 'auto' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
        >
          AI Generate
        </button>
        <button 
          onClick={() => { setActiveTab('manual'); setErrorMsg(null); }}
          className={`flex-1 py-2 text-center ${activeTab === 'manual' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
        >
          Manual
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-white">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded text-xs whitespace-pre-wrap">
            <div className="flex items-center gap-1 font-semibold mb-1"><AlertCircle className="w-3 h-3"/> Error</div>
            {errorMsg}
          </div>
        )}

        {activeTab === 'auto' && !isAdding && (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" className="hidden" ref={fileInputRef} accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
              {isLoading ? (
                <Loader2 className="h-6 w-6 text-blue-500 animate-spin mb-2" />
              ) : (
                <Upload className="h-6 w-6 text-slate-400 mb-2" />
              )}
              <div className="text-sm font-medium text-slate-700">Upload Dokumen</div>
              <div className="text-xs text-slate-400 mt-1">Ekstrak otomatis dari PDF/DOCX</div>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              AI akan mengekstrak Judul, Penulis, Tahun, dll dari sumber Anda untuk dijadikan sitasi akademik yang valid.
            </div>
          </div>
        )}

        {(activeTab === 'manual' || isAdding) && (
          <>
            {isAdding ? (
              <div className="space-y-3 bg-slate-50/50 p-3 rounded border">
                <div className="text-xs font-semibold text-slate-700">Konfirmasi / Edit Referensi</div>
                <select
                  value={formData.jenis}
                  onChange={e => setFormData({ ...formData, jenis: e.target.value })}
                  className="w-full text-sm border-b p-1 outline-none bg-transparent text-slate-900"
                >
                  <option>Buku</option>
                  <option>Jurnal</option>
                  <option>Situs Web</option>
                  <option>Tesis</option>
                  <option>Prosiding</option>
                </select>
                <input
                  type="text" placeholder="Penulis (ex: Smith, J.)"
                  value={formData.penulis} onChange={e => setFormData({ ...formData, penulis: e.target.value })}
                  className="w-full text-sm border-b p-1 outline-none bg-transparent text-slate-900"
                />
                <input
                  type="text" placeholder="Tahun (ex: 2026)"
                  value={formData.tahun} onChange={e => setFormData({ ...formData, tahun: e.target.value })}
                  className="w-full text-sm border-b p-1 outline-none bg-transparent text-slate-900"
                />
                <input
                  type="text" placeholder="Judul Buku/Artikel"
                  value={formData.judul} onChange={e => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full text-sm border-b p-1 outline-none bg-transparent text-slate-900"
                />
                <input
                  type="text" placeholder="Penerbit / Jurnal"
                  value={formData.penerbit} onChange={e => setFormData({ ...formData, penerbit: e.target.value })}
                  className="w-full text-sm border-b p-1 outline-none bg-transparent text-slate-900"
                />
                <div className="flex gap-3 pt-2">
                  <Button size="sm" onClick={handleSaveManual} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">Simpan</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)} className="flex-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100">Batal</Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => { setFormData({ id: '', judul: '', penulis: '', tahun: '', penerbit: '', jenis: 'Buku' }); setIsAdding(true); }} 
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Input Manual Baru
              </Button>
            )}
          </>
        )}

        {/* List Referensi */}
        {!isAdding && refs.length > 0 && (
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs font-semibold text-slate-500 uppercase">Koleksi Referensi ({refs.length})</div>
              <select 
                value={citationStyle} 
                onChange={(e) => setCitationStyle(e.target.value as 'APA' | 'Harvard')}
                className="text-xs border rounded p-1 text-slate-600 outline-none"
              >
                <option value="APA">Format APA</option>
                <option value="Harvard">Format Harvard</option>
              </select>
            </div>
            
            {refs.map((r) => (
              <div key={r.id} className="p-2 border rounded hover:bg-slate-50 group flex flex-col gap-2 transition-colors">
                <div className="text-sm text-slate-800 leading-tight">
                  <span className="font-semibold">{r.penulis}</span> ({r.tahun}). <i>{r.judul}</i>.
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="h-7 text-xs flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={() => handleInsertCitation(r.id)}>
                    <Plus className="h-3 w-3 mr-1"/> Sisipkan
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs flex-1 text-slate-500" onClick={() => {
                    setFormData(r);
                    setIsAdding(true);
                    setActiveTab('manual');
                  }}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
