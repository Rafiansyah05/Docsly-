'use client';

import { motion } from 'framer-motion';
import { FileWarning, FileCheck, ArrowRight } from 'lucide-react';

export function ProblemSolution() {
  return (
    <section id="product" className="py-24 bg-slate-50/50">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Problem Section */}
        <div className="text-center max-w-[800px] mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-6"
          >
            Mengatur Format Dokumen Seringkali Memusingkan.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 mb-12"
          >
            Kebanyakan converter online merusak struktur dokumen Word. Margin berubah, font hilang, atau format berantakan. Docsly hadir dengan pendekatan baru.
          </motion.p>
          
          <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center max-w-[800px] mx-auto">
            {/* Before */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-left"
            >
              <div className="flex items-center gap-3 text-slate-500 mb-4 font-medium">
                <FileWarning className="w-5 h-5 text-red-400" /> Web Converter Biasa
              </div>
              <div className="space-y-3">
                <div className="text-xs text-red-500 mb-1">Format rusak & margin berubah</div>
                <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                <div className="h-2 w-full bg-slate-200 rounded-full" />
                <div className="h-2 w-5/6 bg-slate-200 rounded-full" />
                <div className="h-2 w-1/2 bg-slate-200 rounded-full" />
              </div>
            </motion.div>

            {/* Arrow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="hidden md:flex justify-center"
            >
              <ArrowRight className="w-6 h-6 text-slate-300" />
            </motion.div>

            {/* After */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-left"
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-3 text-slate-900 mb-4 font-medium">
                <FileCheck className="w-5 h-5 text-blue-600" /> Docsly
              </div>
              <div className="space-y-3">
                <div className="text-xs text-blue-600 mb-1">Struktur XML aman terjaga 100%</div>
                <div className="h-2 w-3/4 bg-slate-800 rounded-full" />
                <div className="h-2 w-full bg-slate-400 rounded-full" />
                <div className="h-2 w-5/6 bg-slate-400 rounded-full" />
                <div className="h-2 w-1/2 bg-slate-400 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Solution Grid */}
        <div className="mt-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Kenapa Memilih Docsly?
            </h3>
            <p className="text-slate-600">Alat andalan untuk memfinalisasi dokumen penting Anda.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Tanpa Login", desc: "Langsung unggah dan proses dokumen Anda. Tanpa perlu mendaftar akun atau mengingat kata sandi." },
              { title: "Gratis 100%", desc: "Nikmati seluruh fitur premium kami secara gratis. Tanpa trial, tanpa langganan, dan tanpa iklan yang mengganggu." },
              { title: "Privasi Terjamin", desc: "File Anda diproses di memori (RAM) lalu otomatis dihapus. Kami tidak menyimpan dokumen pengguna di database." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-slate-100 rounded-2xl p-8 hover:border-slate-200 transition-colors"
              >
                <h4 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h4>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
