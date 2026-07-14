'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function PricingPreview() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Start using Docsly today
          </h2>
          <p className="text-lg text-slate-600">
            Experience the future of document creation with our full-featured trial.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[400px] mx-auto bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Free Trial</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">Rp 0</span>
              <span className="text-slate-400">/ 30 hari</span>
            </div>
            
            <p className="text-slate-300 mb-8 pb-8 border-b border-white/10">
              Try all Docsly features without any commitment.
            </p>
            
            <ul className="space-y-4 mb-8">
              {[
                "Full access to AI Document Agent",
                "Smart formatting & citations",
                "Unlimited documents",
                "Export to PDF & DOCX"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-slate-200 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "w-full bg-white text-slate-900 hover:bg-slate-100 rounded-lg h-12 text-base font-semibold shadow-sm")}>
              Start Free Trial
            </Link>
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}
