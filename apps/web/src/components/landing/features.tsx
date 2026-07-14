'use client';

import { motion } from 'framer-motion';
import { Bot, Wand2, BookOpen } from 'lucide-react';

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
                <div className="relative z-10 w-full max-w-[320px] bg-white border border-slate-100 rounded-xl p-4" style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}>
                  <div className="flex gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                      Buatkan proposal usaha katering rumahan untuk pengajuan pinjaman UMKM.
                    </div>
                  </div>
                  <div className="h-[1px] w-full bg-slate-100 my-4" />
                  <div className="space-y-2">
                    <div className="h-2 w-1/3 bg-slate-800 rounded-full mb-4" />
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                    <div className="h-2 w-4/5 bg-slate-200 rounded-full" />
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
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">AI Document Agent</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Asisten AI interaktif yang bekerja di dalam dokumen Anda. Dari menyusun kerangka, menulis isi, hingga merevisi bagian tertentu dengan panduan instruksi sederhana.
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
                <Wand2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Smart Formatting</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Tidak perlu lagi mengatur spasi, margin, atau font secara manual. Docsly otomatis merapikan dokumen berantakan menjadi format profesional standar Indonesia.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-8 h-[300px] flex items-center justify-center relative overflow-hidden">
                <div className="flex gap-4 w-full">
                  <div className="flex-1 opacity-50 space-y-3">
                    <div className="text-xs text-slate-400 mb-2 font-mono">text berantakan</div>
                    <div className="h-2 w-full bg-slate-200 rounded-full" />
                    <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                    <div className="h-2 w-5/6 bg-slate-200 rounded-full" />
                  </div>
                  <div className="w-[1px] bg-slate-100" />
                  <div className="flex-1 space-y-4">
                    <div className="text-xs text-blue-600 mb-2 font-mono">document profesional</div>
                    <div className="h-3 w-1/2 bg-slate-800 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-400 rounded-full" />
                      <div className="h-2 w-full bg-slate-400 rounded-full" />
                      <div className="h-2 w-4/5 bg-slate-400 rounded-full" />
                    </div>
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
                  <div className="h-2 w-1/3 bg-slate-300 rounded-full" />
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
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Citation Assistant</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                Kelola referensi dengan mudah. AI akan menyusun in-text citation dan daftar pustaka secara otomatis sesuai format APA 7 atau Harvard.
              </p>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
