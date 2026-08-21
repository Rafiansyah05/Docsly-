'use client';

import { motion } from 'framer-motion';
import { Wand2, BookOpen, FileText } from 'lucide-react';

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center max-w-[600px] mx-auto mb-20">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
            Everything you need for professional documents
          </h2>
        </div>

        <div className="space-y-32">
          
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-2 md:order-1"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-8 h-[300px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-50/50" />
                <div className="relative z-10 w-full max-w-[320px] bg-white border border-slate-100 rounded-xl p-4 shadow-sm text-center">
                  <div className="h-8 w-8 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Wand2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium text-slate-800 mb-1">Struktur XML Aman</div>
                  <div className="text-xs text-slate-500 mb-4">Kami tidak mengonversi ke teks</div>
                  <div className="h-2 w-full bg-slate-200 rounded-full mb-2" />
                  <div className="h-2 w-5/6 bg-slate-200 rounded-full mx-auto" />
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-1 md:order-2"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <Wand2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">100% Format Terjaga</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Tidak seperti converter online lainnya, kami menggunakan manipulasi XML murni. Artinya margin, font, cover, dan struktur dokumen Word Anda tidak akan berubah sedikit pun.
              </p>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Penomoran Fleksibel</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Tambahkan nomor halaman secara instan dengan format penomoran Arab atau Romawi, dan tentukan letaknya sesuai dengan pedoman karya tulis ilmiah Anda.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-8 h-[300px] flex items-center justify-center relative overflow-hidden">
                <div className="flex gap-4 w-full justify-center">
                   <div className="w-[180px] h-[240px] bg-white border shadow-md relative p-4 flex flex-col justify-between">
                     <div className="space-y-2">
                       <div className="h-2 w-full bg-slate-200 rounded-full" />
                       <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                     </div>
                     <div className="text-[10px] text-center font-mono font-bold">12</div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-2 md:order-1"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-8 h-[300px] flex items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-[280px] bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
                  <div className="text-sm font-bold text-center mb-2">Daftar Pustaka</div>
                  <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                    <div className="h-2 w-full bg-slate-400 rounded-full" />
                    <div className="h-2 w-4/5 bg-slate-400 rounded-full" />
                  </div>
                  <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                    <div className="h-2 w-11/12 bg-slate-400 rounded-full" />
                    <div className="h-2 w-3/4 bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="order-1 md:order-2"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Daftar Pustaka Instan</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Cukup paste teks daftar referensi Anda, dan sistem kami akan menyisipkannya di halaman baru paling belakang dengan identasi menggantung (hanging indent) sesuai standar.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
