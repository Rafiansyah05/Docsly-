'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Kolom Kiri: Abstract Shapes & Branding (Tersembunyi di Mobile) */}
      <div className="hidden md:flex flex-col relative bg-[#0f172a] overflow-hidden justify-between p-12">
        {/* Soft Mesh Gradient Background */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-sky-400/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ y: [-20, 20, -20], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
          />
          <motion.div 
            animate={{ y: [20, -20, 20], rotate: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          />
          <motion.div 
            animate={{ y: [-15, 15, -15], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 left-1/2 w-24 h-24 rounded-lg bg-blue-500/10 backdrop-blur-md border border-blue-500/20"
          />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image src="/images/logo-docsly.png" alt="Docsly Logo" width={160} height={45} className="object-contain" />
          </Link>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 mt-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              Create better documents,<br />
              <span className="text-blue-400">with an AI that understands.</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Docsly combines AI writing, editing, and formatting in one intelligent workspace.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Kolom Kanan: Form */}
      <div className="flex flex-col justify-center bg-white p-8 sm:p-12 lg:p-24 h-full relative">
        <div className="md:hidden absolute top-8 left-8">
          <Link href="/" className="inline-flex items-center">
            <Image src="/images/logo-docsly.png" alt="Docsly Logo" width={32} height={32} className="object-contain rounded-md" />
          </Link>
        </div>

        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-slate-400">
          <div className="flex justify-center space-x-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Syarat Layanan</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
