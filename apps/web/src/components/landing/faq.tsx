'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import React from 'react';

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
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
  },
  {
    q: "Apakah dokumen saya aman di dalam server Docsly?",
    a: (
      <div className="space-y-4">
        <p>Sangat aman. Infrastruktur Docsly dibangun dengan standar keamanan tingkat tinggi untuk memastikan data Anda terlindungi dengan maksimal.</p>
        <p>Praktik keamanan kami mencakup:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Setiap akun memiliki isolasi ruang kerja (workspace) yang ketat sehingga dokumen tidak mungkin bercampur dengan pengguna lain.</li>
          <li>Seluruh koneksi antara perangkat Anda dan server kami dilindungi menggunakan protokol SSL/TLS yang kokoh.</li>
          <li>Akses terhadap basis data dibatasi oleh lapisan autentikasi ganda dan kebijakan firewall modern.</li>
          <li>Tim internal kami tidak memiliki akses langsung untuk membaca isi dokumen Anda demi menjaga kerahasiaan penuh ide dan riset Anda.</li>
        </ul>
        <p>Anda dapat berfokus menyusun dokumen berkualitas tanpa perlu khawatir mengenai integritas maupun keamanan data Anda di ekosistem kami.</p>
      </div>
    )
  },
  {
    q: "Format dokumen apa saja yang bisa diekspor?",
    a: "Docsly mendukung ekspor dokumen tingkat tinggi (high fidelity) ke format PDF dan DOCX (Microsoft Word). Seluruh layout, margin, daftar isi, heading, hingga gambar akan dipertahankan agar terlihat identik dengan di editor."
  }
];

const AccordionItem = ({ question, answer, isOpen, onClick }: { question: string, answer: React.ReactNode, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4 transition-all hover:border-blue-200">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center p-5 md:p-6 text-left outline-none"
      >
        <span className="font-semibold text-slate-900 text-base md:text-lg pr-8">{question}</span>
        <div className={cn(
          "shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors",
          isOpen ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
        )}>
          <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-180")} />
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-5 md:px-6 pb-6 text-slate-600 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-[#f8fafc]">
      <div className="max-w-[800px] mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Jawaban untuk pertanyaan yang sering diajukan mengenai Docsly.
          </motion.p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + idx * 0.1 }}
            >
              <AccordionItem 
                question={item.q} 
                answer={item.a} 
                isOpen={openIndex === idx} 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
