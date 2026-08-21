'use client';
import { useState, useRef } from 'react';
import { UploadCloud, FileText, Download, Loader2, Plus, Trash2 } from 'lucide-react';

type PageNumConfig = { startNumber: number; position: string; format: string };

export function UtilityTool() {
  const [file, setFile] = useState<File | null>(null);
  const [enablePageNumbering, setEnablePageNumbering] = useState(false);
  const [enableBibliography, setEnableBibliography] = useState(false);
  
  // Page Numbering Settings
  const [pageMode, setPageMode] = useState<'all' | 'section'>('all');
  const [pageConfigs, setPageConfigs] = useState<PageNumConfig[]>([
    { startNumber: 1, position: 'center', format: '1, 2, 3' }
  ]);
  
  // Bibliography Settings
  const [bibliographyText, setBibliographyText] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.toLowerCase().endsWith('.docx')) {
        setError('Harap pilih file dengan format .docx');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const addConfig = () => {
    setPageConfigs([...pageConfigs, { startNumber: 1, position: 'center', format: '1, 2, 3' }]);
  };

  const removeConfig = (index: number) => {
    const newConfigs = [...pageConfigs];
    newConfigs.splice(index, 1);
    setPageConfigs(newConfigs);
  };

  const updateConfig = (index: number, key: keyof PageNumConfig, value: any) => {
    const newConfigs = [...pageConfigs];
    newConfigs[index] = { ...newConfigs[index], [key]: value };
    setPageConfigs(newConfigs);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Silakan unggah dokumen Word terlebih dahulu.');
      return;
    }
    
    if (!enablePageNumbering && !enableBibliography) {
      setError('Silakan pilih minimal satu fitur (Nomor Halaman atau Daftar Pustaka).');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    
    let pnPayload = null;
    if (enablePageNumbering) {
      if (pageMode === 'all') {
        const c = pageConfigs[0];
        pnPayload = {
          startNumber: c.startNumber,
          position: c.position,
          format: c.format === '1, 2, 3' ? 'arabic' : c.format,
        };
      } else {
        pnPayload = pageConfigs.map(c => ({
          startNumber: c.startNumber,
          position: c.position,
          format: c.format === '1, 2, 3' ? 'arabic' : c.format,
        }));
      }
    }

    const config = {
      pageNumbering: pnPayload,
      bibliography: enableBibliography ? {
        text: bibliographyText,
      } : null
    };
    
    formData.append('config', JSON.stringify(config));

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3005';
      const response = await fetch(`${baseUrl}/api/export/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Terjadi kesalahan saat memproses dokumen.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.docx$/i, '_processed.docx');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="tool" className="py-20 bg-slate-50 flex flex-col items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Docsly Utility</h2>
          <p className="mt-2 text-slate-600">
            Tambahkan Nomor Halaman dan Daftar Pustaka ke dokumen Word Anda dalam hitungan detik. 
            Tanpa merusak format asli.
          </p>
        </div>

        {/* Step 1: Upload */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Langkah 1: Unggah Dokumen</h3>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {file ? (
              <>
                <FileText className="h-12 w-12 text-blue-500 mb-3" />
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-500 mt-1">Klik untuk mengganti file</p>
              </>
            ) : (
              <>
                <UploadCloud className="h-12 w-12 text-slate-400 mb-3" />
                <p className="text-sm font-medium text-slate-700">Pilih dokumen Word (.docx)</p>
                <p className="text-xs text-slate-500 mt-1">Maksimal 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Step 2: Configure */}
        <div className={`space-y-6 ${!file ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Langkah 2: Sesuaikan Fitur</h3>
          
          {/* Page Numbering Option */}
          <div className="border rounded-lg p-5 bg-white">
            <label className="flex items-center space-x-3 cursor-pointer mb-4">
              <input 
                type="checkbox" 
                className="h-5 w-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                checked={enablePageNumbering}
                onChange={(e) => setEnablePageNumbering(e.target.checked)}
              />
              <span className="text-md font-medium text-slate-900">Tambahkan Nomor Halaman</span>
            </label>
            
            {enablePageNumbering && (
              <div className="mt-4 border-t pt-4">
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      className="text-blue-600 focus:ring-blue-500"
                      checked={pageMode === 'all'}
                      onChange={() => setPageMode('all')}
                    />
                    <span className="text-sm text-slate-700">Seluruh Dokumen</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      className="text-blue-600 focus:ring-blue-500"
                      checked={pageMode === 'section'}
                      onChange={() => setPageMode('section')}
                    />
                    <span className="text-sm text-slate-700">Per Bagian (Section)</span>
                  </label>
                </div>

                {pageMode === 'section' && (
                  <div className="mb-4 text-xs text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-100">
                    <strong>Catatan:</strong> Dokumen Anda harus sudah dipisahkan menggunakan fitur <em>"Section Break (Next Page)"</em> di Microsoft Word agar mode ini berfungsi maksimal.
                  </div>
                )}

                <div className="space-y-4">
                  {(pageMode === 'all' ? [pageConfigs[0]] : pageConfigs).map((config, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border rounded-lg relative">
                      {pageMode === 'section' && (
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bagian (Section) {idx + 1}</span>
                          {pageConfigs.length > 1 && (
                            <button onClick={() => removeConfig(idx)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Mulai dari</label>
                          <input 
                            type="number" 
                            min="1"
                            className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={config.startNumber}
                            onChange={(e) => updateConfig(idx, 'startNumber', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Posisi</label>
                          <select 
                            className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={config.position}
                            onChange={(e) => updateConfig(idx, 'position', e.target.value)}
                          >
                            <option value="left">Kiri Bawah</option>
                            <option value="center">Tengah Bawah</option>
                            <option value="right">Kanan Bawah</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Format</label>
                          <select 
                            className="w-full border-slate-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500 text-sm"
                            value={config.format}
                            onChange={(e) => updateConfig(idx, 'format', e.target.value)}
                          >
                            <option value="1, 2, 3">1, 2, 3</option>
                            <option value="01, 02, 03">01, 02, 03</option>
                            <option value="I, II, III">I, II, III</option>
                            <option value="i, ii, iii">i, ii, iii</option>
                            <option value="A, B, C">A, B, C</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {pageMode === 'section' && (
                  <button 
                    onClick={addConfig}
                    className="mt-3 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Tambah Bagian Baru
                  </button>
                )}

              </div>
            )}
          </div>

          {/* Bibliography Option */}
          <div className="border rounded-lg p-5 bg-white">
            <label className="flex items-center space-x-3 cursor-pointer mb-4">
              <input 
                type="checkbox" 
                className="h-5 w-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                checked={enableBibliography}
                onChange={(e) => setEnableBibliography(e.target.checked)}
              />
              <span className="text-md font-medium text-slate-900">Tambahkan Daftar Pustaka</span>
            </label>
            
            {enableBibliography && (
              <div className="pl-8">
                <label className="block text-sm font-medium text-slate-700 mb-1">Daftar Referensi (Pisahkan dengan baris baru)</label>
                <textarea 
                  rows={4}
                  className="w-full border-slate-300 rounded-md shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Doe, J. (2020). Buku Panduan...&#10;Smith, A. (2021). Jurnal Penelitian..."
                  value={bibliographyText}
                  onChange={(e) => setBibliographyText(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 3: Process & Download */}
        <div className="pt-4 border-t">
          <button
            onClick={handleProcess}
            disabled={!file || (!enablePageNumbering && !enableBibliography) || isProcessing}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Memproses Dokumen...
              </>
            ) : (
              <>
                <Download className="-ml-1 mr-2 h-5 w-5" />
                Proses & Unduh Word
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
}
