'use client';


import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, LifeBuoy, BookOpen, Download, MessageSquare, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const QUICK_HELP_DATA = [
  { icon: BookOpen, title: "Memulai dengan AI", desc: "Dasar penggunaan", detail: "Untuk memulai, Anda hanya perlu membuat dokumen baru, lalu ketik instruksi (prompt) Anda di panel AI Sidebar sebelah kanan. AI akan secara otomatis menyusun dan menulis dokumen sesuai dengan perintah Anda, tanpa perlu menulis manual dari awal." },
  { icon: MessageSquare, title: "Format Prompt", desc: "Tips instruksi optimal", detail: "Gunakan struktur instruksi yang jelas: tentukan peran (misal: 'sebagai konsultan bisnis'), konteks ('untuk pengajuan pinjaman'), poin spesifik, dan format yang diinginkan. Semakin detail instruksi Anda, semakin akurat dokumen yang dihasilkan AI." },
  { icon: Download, title: "Ekspor Dokumen", desc: "Menyimpan ke PDF/Word", detail: "Setelah dokumen Anda selesai, Anda dapat mengekspornya ke format PDF atau DOCX melalui tombol Ekspor di menu atas. Layout, daftar isi, heading, margin, dan gambar akan dipertahankan dengan sempurna pada dokumen akhir." },
  { icon: BookOpen, title: "Manajemen Sitasi", desc: "Panduan APA & Harvard", detail: "Docsly mendukung penambahan referensi dan kutipan secara manual. Saat menulis, Anda bisa menyisipkan sitasi otomatis ke dalam teks. Pada tahap akhir, AI akan merangkum seluruh kutipan tersebut ke dalam Daftar Pustaka sesuai standar (APA 7 atau Harvard)." }
];

const FAQ_DATA = [
  {
    category: "Tentang Docsly & AI Agent",
    items: [
      {
        q: "Apa bedanya Docsly dengan ChatGPT atau AI teks biasa?",
        a: "Docsly bukan sekadar generator teks, melainkan AI Office Agent. Docsly dirancang khusus untuk memproduksi dokumen formal dan profesional (Skripsi, Laporan, Proposal, Surat Dinas, dll). AI Docsly akan menyusun kerangka, mengatur format, memperbaiki gaya bahasa (PUEBI), membuat daftar isi, merapikan tabel, dan menyusun sitasi, hingga siap diekspor dalam format dokumen resmi."
      },
      {
        q: "Apakah Docsly menggunakan dokumen saya untuk melatih AI?",
        a: (
          <div className="space-y-4">
            <p>Tidak. Dokumen pengguna tidak digunakan untuk melatih atau meningkatkan model AI tanpa persetujuan pengguna.</p>
            <p>Docsly dirancang dengan prinsip bahwa dokumen yang dibuat dan disimpan oleh pengguna adalah milik pengguna sepenuhnya. Dokumen tersebut digunakan hanya untuk menyediakan fitur yang diminta oleh pengguna, seperti membantu menulis, memperbaiki isi dokumen, memberikan saran, melakukan analisis, atau membantu menyelesaikan pekerjaan di dalam workspace.</p>
            <p>Ketika pengguna menggunakan fitur AI Docsly, sistem hanya memproses informasi yang diperlukan untuk memberikan respons yang relevan terhadap permintaan pengguna, bukan untuk mengambil kepemilikan atau menggunakan isi dokumen tersebut sebagai data pelatihan model AI.</p>
            <p>Selain itu:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dokumen pengguna tidak digunakan untuk membuat model AI menjadi lebih pintar tanpa izin.</li>
              <li>Dokumen antar pengguna tidak dicampurkan atau digunakan untuk memberikan jawaban kepada pengguna lain.</li>
              <li>Workspace dan dokumen setiap pengguna tetap terisolasi sesuai dengan sistem akses yang berlaku.</li>
              <li>Pengguna tetap memiliki kendali penuh terhadap dokumen mereka, termasuk mengedit, menghapus, membagikan, atau mengatur siapa saja yang dapat mengaksesnya.</li>
            </ul>
            <p>Jika pengguna menggunakan fitur collaboration, akses terhadap dokumen hanya diberikan kepada pengguna yang memang mendapatkan izin dari pemilik dokumen. Pengguna lain tetap tidak dapat melihat dokumen atau aktivitas pribadi yang tidak dibagikan kepada mereka.</p>
          </div>
        )
      },
      {
        q: "Apakah AI Docsly akan terus bertanya sebelum membuat dokumen?",
        a: "Docsly dilengkapi dengan Smart Question Engine. AI hanya akan bertanya (maksimal 3-5 pertanyaan) jika informasi penting dari prompt Anda sangat kurang (contoh: di bawah 40% kelengkapan). Jika prompt Anda sudah cukup detail, AI akan langsung membuatkan kerangka outline tanpa bertanya."
      }
    ]
  },
  {
    category: "Panduan Fitur Editor & Format",
    items: [
      {
        q: "Apakah riwayat chat AI saya dapat dilihat pengguna lain?",
        a: (
          <div className="space-y-4">
            <p>Tidak. Seluruh riwayat percakapan AI Anda dengan Docsly bersifat 100% privat dan terenkripsi hanya untuk akun Anda sendiri.</p>
            <p>Docsly menjamin kerahasiaan interaksi Anda dengan AI. Ketentuan privasi kami mencakup:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Percakapan Anda dengan AI tidak akan pernah muncul, bocor, atau dapat diakses oleh pengguna mana pun.</li>
              <li>Riwayat instruksi (prompt), data yang Anda masukkan ke dalam chat, dan teks yang dihasilkan oleh AI dijamin hanya tersimpan di dalam akun Anda.</li>
              <li>Setiap sesi dokumen yang Anda kerjakan memiliki ruang obrolan AI-nya sendiri yang terisolasi dengan aman.</li>
              <li>Tim Docsly tidak memantau atau membaca isi percakapan Anda dengan AI untuk menjaga kerahasiaan ide, rancangan, dan dokumen Anda.</li>
            </ul>
            <p>Anda dapat berdiskusi dengan leluasa bersama AI Docsly tanpa perlu khawatir privasi dan kerahasiaan dokumen Anda terkompromi.</p>
          </div>
        )
      },
      {
        q: "Apakah AI Docsly dapat memeriksa ejaan dan tata bahasa?",
        a: "Ya. AI Docsly memiliki Language Compliance Layer yang otomatis akan menerapkan standar PUEBI/EYD terbaru. AI juga akan otomatis mencetak miring (italic) istilah asing atau spesies Latin tanpa Anda minta."
      },
      {
        q: "Saya tidak punya gambar saat membuat dokumen, apa yang terjadi?",
        a: "Jika AI merasa dokumen Anda memerlukan gambar (misalnya: Arsitektur Sistem), AI akan menyisipkan Placeholder Gambar (teks penanda) lengkap dengan keterangan caption bernomor otomatis (contoh: Gambar 2.1). Anda dapat mengklik placeholder tersebut nanti untuk mengunggah gambar aslinya."
      },
      {
        q: "Bagaimana cara membuat tabel otomatis?",
        a: "Anda bisa memberikan instruksi seperti \"Bandingkan 3 vendor katering dalam bentuk tabel\", dan AI akan mengerti kapan informasi lebih baik disajikan dalam bentuk struktur kolom baris yang rapi dan seragam. Tabel otomatis juga akan diberi caption berurutan."
      }
    ]
  },
  {
    category: "Ekspor & Impor Dokumen",
    items: [
      {
        q: "Format dokumen apa saja yang bisa diekspor?",
        a: "Docsly mendukung ekspor dokumen tingkat tinggi (high fidelity) ke format PDF dan DOCX (Microsoft Word). Seluruh layout, margin, daftar isi, heading, hingga gambar akan dipertahankan agar terlihat identik dengan di editor."
      },
      {
        q: "Bisakah saya mengunggah dokumen lama saya untuk dilanjutkan oleh AI?",
        a: "Tentu! Anda bisa mengunggah file PDF atau Word (DOCX) ke Docsly. Sistem kami akan mengekstraksi struktur dokumennya, memungkinkan Anda untuk memberikan instruksi ke AI seperti \"Tolong rapikan bab 3\" atau \"Cek ejaan pada dokumen yang baru saya unggah ini\"."
      }
    ]
  },
  {
    category: "Manajemen Sitasi & Referensi",
    items: [
      {
        q: "Apakah Docsly mendukung penulisan kutipan akademik?",
        a: "Ya, Docsly mendukung format standar Indonesia dan internasional seperti APA 7 dan Harvard. Anda dapat memasukkan data sumber referensi, dan AI akan otomatis membuat in-text citation (kutipan dalam teks) dan menyusun Daftar Pustaka secara kronologis atau alfabetis."
      }
    ]
  }
];

const AccordionItem = ({ question, answer }: { question: string, answer: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-3 bg-white dark:bg-zinc-950 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 md:p-5 text-left hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        <span className="font-medium text-slate-900 dark:text-zinc-100 text-[15px]">{question}</span>
        <div className="shrink-0 ml-4 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-900">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
          )}
        </div>
      </button>
      
      <div 
        className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-4 md:p-5 pt-0 text-[14px] text-slate-600 dark:text-zinc-400 leading-relaxed border-t border-slate-100 dark:border-zinc-800/50 mt-1">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuickHelp, setSelectedQuickHelp] = useState<typeof QUICK_HELP_DATA[0] | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState("General Feedback");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isFeedbackSuccess, setIsFeedbackSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error("Silakan isi apa yang perlu kami tingkatkan.");
      return;
    }
    if (!userId) {
      toast.error("Terjadi kesalahan, Anda perlu login ulang untuk mengirim feedback.");
      return;
    }
    
    setIsSubmittingFeedback(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('feedbacks').insert({
        user_id: userId,
        category: feedbackCategory,
        content: feedbackContent
      });

      if (error) throw error;

      setIsFeedbackSuccess(true);
      // We don't close it immediately; let the user see the success screen.
      // Auto close after 3 seconds:
      setTimeout(() => {
        setIsFeedbackModalOpen(false);
        setTimeout(() => {
          setIsFeedbackSuccess(false);
          setFeedbackContent("");
          setFeedbackCategory("General Feedback");
        }, 500);
      }, 2500);
      
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal mengirim feedback, silakan coba lagi nanti.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const filteredData = FAQ_DATA.map(category => ({
    ...category,
    items: category.items.filter(item => {
      // For ReactNode answers, we only search in the question text to avoid complex stringification
      const answerText = typeof item.a === 'string' ? item.a : '';
      return item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
             answerText.toLowerCase().includes(searchQuery.toLowerCase());
    })
  })).filter(category => category.items.length > 0);

  return (
    <div className="h-full bg-slate-50/50 dark:bg-[#0A0A0A] overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
              <LifeBuoy className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
            Pusat Bantuan & FAQ
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 max-w-xl mx-auto text-[15px]">
            Temukan panduan, tips, dan jawaban untuk mengoptimalkan penggunaan Docsly sebagai AI Office Agent Anda.
          </p>

          {/* Search Input */}
          <div className="max-w-lg mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari topik bantuan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        
        {/* Quick Help */}
        {!searchQuery && (
          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-6">Bantuan Cepat</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_HELP_DATA.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedQuickHelp(item)}
                  className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 flex items-center justify-center mb-4 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                    <item.icon className="w-5 h-5 text-slate-600 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <h3 className="font-medium text-[15px] text-slate-900 dark:text-zinc-100">{item.title}</h3>
                  <p className="text-[13px] text-slate-500 dark:text-zinc-500 mt-1.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-zinc-100">
              {searchQuery ? 'Hasil Pencarian' : 'Kategori Pertanyaan'}
            </h2>
          </div>
          
          {filteredData.length > 0 ? (
            <div className="space-y-12">
              {filteredData.map((category, idx) => (
                <div key={idx}>
                  <h3 className="text-[13px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
                    {category.category}
                  </h3>
                  <div>
                    {category.items.map((item, itemIdx) => (
                      <AccordionItem key={itemIdx} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl">
              <Search className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-zinc-400 text-[15px]">Tidak ada jawaban yang ditemukan untuk "{searchQuery}"</p>
            </div>
          )}
        </section>

        {/* Footer: Feedback & Support */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pb-16 border-t border-slate-200 dark:border-zinc-800 pt-16">
          <a 
            href="https://wa.me/6281243205089?text=Halo%20Tim%20Support%20Docsly,%20saya%20membutuhkan%20bantuan%20terkait%20aplikasi." 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-[14px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 dark:hover:border-emerald-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Hubungi Support
          </a>
          <button 
            onClick={() => setIsFeedbackModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-2xl text-[14px] font-medium hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Berikan Feedback
          </button>
        </div>

      </div>

      {/* Quick Help Dialog */}
      <Dialog open={!!selectedQuickHelp} onOpenChange={(open) => !open && setSelectedQuickHelp(null)}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center mb-4">
              {selectedQuickHelp?.icon && React.createElement(selectedQuickHelp.icon, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" })}
            </div>
            <DialogTitle className="text-xl text-slate-900 dark:text-zinc-100">
              {selectedQuickHelp?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="text-[14.5px] leading-relaxed text-slate-600 dark:text-zinc-400">
            {selectedQuickHelp?.detail}
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog 
        open={isFeedbackModalOpen} 
        onOpenChange={(open) => {
          setIsFeedbackModalOpen(open);
          if (!open) {
            setTimeout(() => {
              setIsFeedbackSuccess(false);
              setFeedbackContent("");
              setFeedbackCategory("General Feedback");
            }, 300);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 p-0 overflow-hidden gap-0">
          <div className="p-8 space-y-6">
            {isFeedbackSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 text-center">
                  Feedback Terkirim!
                </h2>
                <p className="text-[14px] text-slate-500 dark:text-zinc-400 text-center max-w-[250px] mx-auto">
                  Terima kasih atas kontribusi Anda dalam membantu kami menyempurnakan Docsly.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                    Feedback
                  </h2>
                  <p className="text-[14px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Karena Docsly masih beta, ini sangat penting.<br/>
                    Help us improve Docsly
                  </p>
                </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-slate-900 dark:text-zinc-100 block">Kategori:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {["Bug Report", "Feature Request", "General Feedback"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`py-2 px-2 text-[13px] rounded-lg border transition-colors ${
                        feedbackCategory === cat 
                        ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[14px] font-medium text-slate-900 dark:text-zinc-100 block">What should we improve?</label>
                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda..."
                  className="w-full h-32 p-3 text-[14px] rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleSubmitFeedback}
              disabled={isSubmittingFeedback || !feedbackContent.trim()}
              className="w-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 rounded-xl py-3 text-[14px] font-medium hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                'Send Feedback'
              )}
            </button>
            </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
