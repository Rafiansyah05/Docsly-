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
            Creating documents shouldn't feel complicated.
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 mb-12"
          >
            People spend hours formatting documents, fixing structure, managing references, and rewriting content. Docsly changes that.
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
                <FileWarning className="w-5 h-5 text-red-400" /> Before Docsly
              </div>
              <div className="space-y-3">
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
              style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }} // extremely subtle edge
            >
              <div className="flex items-center gap-3 text-slate-900 mb-4 font-medium">
                <FileCheck className="w-5 h-5 text-blue-600" /> With Docsly
              </div>
              <div className="space-y-3">
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
              Meet Docsly AI Workspace
            </h3>
            <p className="text-slate-600">One place to create, improve, and manage documents.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "AI Writing", desc: "AI membantu membuat isi, menyusun struktur bab, dan menulis draf awal dengan cepat." },
              { title: "Smart Editing", desc: "Perbaikan format otomatis, ejaan, grammar, dan gaya bahasa baku." },
              { title: "Collaboration", desc: "Kerja bersama dokumen Anda dengan feedback AI secara real-time." }
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
