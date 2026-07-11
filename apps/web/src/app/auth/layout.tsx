import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Kolom Kiri: Gambar Estetik (Tersembunyi di Mobile) */}
      <div className="hidden md:block relative bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80"
          alt="Document aesthetic"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <Link href="/" className="inline-flex items-center mb-4">
            <Image src="/images/logo-docsly.png" alt="Docsly Logo" width={200} height={200} className="object-contain drop-shadow-md rounded-md" />
          </Link>
          <p className="text-slate-300 text-lg max-w-md font-medium leading-relaxed">
            Platform dokumen cerdas generasi baru.
          </p>
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
            <a href="#" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Syarat Layanan</a>
          </div>
        </div>
      </div>
    </div>
  );
}
