'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image src="/images/logo2.png" alt="Docsly Logo" width={120} height={40} className="object-contain h-8 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#product" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Product</Link>
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
          <Link href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">FAQ</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/auth/login" className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-base h-12 px-6 rounded-lg")}>
            Login
          </Link>
          <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-12 px-8 text-base shadow-sm")}>
            Start Free Trial
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 py-4 px-6 flex flex-col gap-4 shadow-lg">
          <Link href="#product" className="text-sm font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>Product</Link>
          <Link href="#features" className="text-sm font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
          <Link href="#faq" className="text-sm font-medium text-slate-600 py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/auth/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full justify-center text-blue-600 border-blue-200 hover:bg-blue-50 h-12 text-base rounded-lg")}>
              Login
            </Link>
            <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "w-full justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 text-base shadow-sm")}>
              Start Free Trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
