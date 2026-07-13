'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { User, Palette, Sparkles, Sliders, LogOut, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type TabType = 'profile' | 'appearance' | 'ai-quota' | 'preferences';

export function SettingsContent({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Simulation states
  const [name, setName] = useState(user?.user_metadata?.full_name || 'Pengguna Docsly');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Pengaturan berhasil disimpan!');
      setIsSaving(false);
    }, 800);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const tabs = [
    { id: 'profile', label: 'Profil Akun', icon: User },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'ai-quota', label: 'Kuota AI', icon: Sparkles },
    { id: 'preferences', label: 'Preferensi', icon: Sliders },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0">
        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center justify-between w-full px-4 py-3 text-left rounded-xl transition-all duration-200 ease-in-out ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="text-[14px]">{tab.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-3xl">
        <div className="bg-slate-50/50 dark:bg-zinc-900/50 rounded-2xl p-8 min-h-full">
          
          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Profil Anda</h2>
                <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1">Kelola informasi pribadi yang tertaut dengan akun Anda.</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 text-2xl font-bold">
                  {getInitials(name)}
                </div>
                <div>
                  <Button variant="outline" className="h-9 px-4 rounded-lg bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-[13px] font-medium border-0 shadow-sm ring-1 ring-slate-200 dark:ring-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900">
                    Ubah Foto
                  </Button>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-2">JPG, GIF, atau PNG. Maksimal 2MB.</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-zinc-300">Nama Lengkap</label>
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 bg-white dark:bg-zinc-950 border-0 ring-1 ring-slate-200 dark:ring-zinc-800 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl px-4 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[13px] font-medium text-slate-700 dark:text-zinc-300">Alamat Email</label>
                  <Input 
                    value={user?.email || 'email@contoh.com'}
                    disabled
                    className="h-11 bg-slate-100/50 dark:bg-zinc-900 border-0 ring-1 ring-slate-200/50 dark:ring-zinc-800 text-slate-500 dark:text-zinc-400 rounded-xl px-4 cursor-not-allowed"
                  />
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400">Email ini digunakan untuk login dan tidak dapat diubah.</p>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE SETTINGS */}
          {activeTab === 'appearance' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Tampilan Antarmuka</h2>
                <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1">Sesuaikan tema aplikasi agar nyaman di mata Anda.</p>
              </div>

              {mounted && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Light Mode */}
                  <button 
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
                      theme === 'light' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500' 
                        : 'bg-white dark:bg-zinc-950 ring-1 ring-slate-200 dark:ring-zinc-800 hover:ring-slate-300 dark:hover:ring-zinc-700'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg bg-slate-100 border border-slate-200 flex flex-col gap-2 p-2">
                      <div className="h-3 w-1/2 bg-white rounded-md" />
                      <div className="h-2 w-full bg-slate-200 rounded-md" />
                      <div className="h-2 w-3/4 bg-slate-200 rounded-md" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                      Terang (Light) {theme === 'light' && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </span>
                  </button>

                  {/* Dark Mode */}
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
                      theme === 'dark' 
                        ? 'bg-blue-50 dark:bg-blue-900/40 ring-2 ring-blue-500' 
                        : 'bg-white dark:bg-zinc-950 ring-1 ring-slate-200 dark:ring-zinc-800 hover:ring-slate-300 dark:hover:ring-zinc-700'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg bg-zinc-800 border border-zinc-700 flex flex-col gap-2 p-2">
                      <div className="h-3 w-1/2 bg-zinc-900 rounded-md" />
                      <div className="h-2 w-full bg-zinc-700 rounded-md" />
                      <div className="h-2 w-3/4 bg-zinc-700 rounded-md" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                      Gelap (Dark) {theme === 'dark' && <Check className="h-3.5 w-3.5 text-blue-400" />}
                    </span>
                  </button>

                  {/* System Mode */}
                  <button 
                    onClick={() => setTheme('system')}
                    className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
                      theme === 'system' 
                        ? 'bg-blue-50 dark:bg-blue-900/40 ring-2 ring-blue-500' 
                        : 'bg-white dark:bg-zinc-950 ring-1 ring-slate-200 dark:ring-zinc-800 hover:ring-slate-300 dark:hover:ring-zinc-700'
                    }`}
                  >
                    <div className="w-full h-24 rounded-lg flex overflow-hidden border border-slate-200 dark:border-zinc-700">
                      <div className="w-1/2 h-full bg-slate-100 flex flex-col gap-2 p-2">
                        <div className="h-3 w-3/4 bg-white rounded-md" />
                      </div>
                      <div className="w-1/2 h-full bg-zinc-800 flex flex-col gap-2 p-2">
                        <div className="h-3 w-3/4 bg-zinc-900 rounded-md" />
                      </div>
                    </div>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                      Sistem (Auto) {theme === 'system' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI QUOTA SETTINGS */}
          {activeTab === 'ai-quota' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Penggunaan AI</h2>
                <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1">Pantau sisa token dan limit generasi teks AI Anda bulan ini.</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl ring-1 ring-slate-200 dark:ring-zinc-800">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-zinc-100 text-[16px]">Paket Saat Ini: <span className="text-blue-600 dark:text-blue-400">Gratis (Free Tier)</span></h3>
                    <p className="text-[13px] text-slate-500 dark:text-zinc-400 mt-1">Diperbarui setiap tanggal 1 setiap bulannya.</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9 text-[13px] border-0">
                    Upgrade ke Pro
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[13px] font-medium">
                    <span className="text-slate-700 dark:text-zinc-300">Token AI (Word Count)</span>
                    <span className="text-slate-900 dark:text-zinc-100">8.500 / 10.000 Kata</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[85%]"></div>
                  </div>
                  <p className="text-[12px] text-slate-500 dark:text-zinc-400 text-right">Anda telah menggunakan 85% dari kuota gratis Anda.</p>
                </div>
              </div>

              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100">Dapatkan Lebih Banyak Token</h4>
                    <p className="text-[13px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      Docsly Pro menawarkan kuota hingga 100.000 kata per bulan, akses ke model AI yang lebih cerdas (GPT-4o), dan kustomisasi dokumen tanpa batas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES SETTINGS */}
          {activeTab === 'preferences' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">Preferensi Aplikasi</h2>
                <p className="text-[14px] text-slate-500 dark:text-zinc-400 mt-1">Atur bahasa dan preferensi standar dokumen Anda.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-xl ring-1 ring-slate-200 dark:ring-zinc-800">
                  <div>
                    <h3 className="text-[14px] font-medium text-slate-900 dark:text-zinc-100">Bahasa Antarmuka</h3>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1">Ubah bahasa aplikasi Docsly.</p>
                  </div>
                  <select className="h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border-0 ring-1 ring-slate-200 dark:ring-zinc-800 text-[13px] text-slate-700 dark:text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Bahasa Indonesia</option>
                    <option>English (US)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-xl ring-1 ring-slate-200 dark:ring-zinc-800">
                  <div>
                    <h3 className="text-[14px] font-medium text-slate-900 dark:text-zinc-100">Auto-save (Simpan Otomatis)</h3>
                    <p className="text-[12px] text-slate-500 dark:text-zinc-400 mt-1">Dokumen otomatis tersimpan setiap ada perubahan.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Button at bottom */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all font-medium text-[14px] border-0"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
