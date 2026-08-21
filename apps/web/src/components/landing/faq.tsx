'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import React from 'react';

const FAQ_ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Apakah layanan ini benar-benar gratis?",
    a: "Ya, 100% gratis. Anda tidak perlu membuat akun, tidak ada batasan jumlah dokumen, dan tidak ada watermark pada hasil akhir dokumen Anda."
  },
  {
    q: "Apakah format dokumen asli saya akan berubah?",
    a: "Tidak. Docsly menggunakan metode manipulasi struktur XML murni (tanpa konversi ke teks/HTML). Artinya margin, font, cover, dan tata letak dokumen Word Anda akan 100% dipertahankan sama seperti aslinya."
  },
  {
    q: "Apakah dokumen yang saya unggah aman?",
    a: "Sangat aman. Dokumen Anda hanya diproses di dalam memori server selama beberapa detik dan langsung dihapus setelah proses selesai. Kami tidak pernah menyimpan dokumen Anda di database atau membagikannya kepada pihak ketiga."
  },
  {
    q: "Format penomoran halaman apa saja yang didukung?",
    a: "Kami mendukung penomoran angka Arab (1, 2, 3), angka desimal (01, 02, 03), angka Romawi besar (I, II, III), angka Romawi kecil (i, ii, iii), dan abjad (A, B, C)."
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
