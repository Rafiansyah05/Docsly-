'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Sparkles, Star, StarHalf, ChevronRight } from 'lucide-react';

export function Hero({ avgRating }: { avgRating: string }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-[#f8fafc]">
      {/* Aesthetic Soft Mesh Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[60%] h-[60%] bg-sky-100/60 rounded-full blur-[100px] -z-10" />

      <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content */}
        <div className="flex flex-col items-start text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6"
          >
            Create better documents,<br />
            with an AI that <span className="text-blue-600">understands your work.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-8 max-w-[480px] leading-relaxed"
          >
            Docsly combines AI writing, document editing, and formatting in one intelligent workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/register" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 px-8 text-base shadow-sm")}>
                Start Free Trial
              </Link>
              <Link href="#demo" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto rounded-lg px-10 h-14 text-lg font-medium text-slate-700 hover:text-blue-700 border-slate-300 hover:border-blue-300 bg-white shadow-sm")}>
                See how it works
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 pt-6 w-full sm:w-auto"
          >
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const parsedRating = parseFloat(avgRating);
                    const ratingValue = isNaN(parsedRating) ? 0.0 : parsedRating;
                    if (ratingValue >= star) {
                      return <Star key={star} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />;
                    } else if (ratingValue >= star - 0.5) {
                      return <StarHalf key={star} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />;
                    } else {
                      return <Star key={star} className="w-5 h-5 text-slate-300" />;
                    }
                  })}
                </div>
                <span className="text-base font-bold text-slate-900 ml-1">{avgRating}</span>
              </div>
              <span className="text-sm font-medium text-slate-500">Average AI Quality Rating</span>
            </div>
          </motion.div>
        </div>

        {/* Right: Abstract 3D/Floating Object */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="relative h-[400px] md:h-[500px] w-full hidden md:flex items-center justify-center"
        >
          {/* Main Floating Document */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative bg-white border border-slate-200 rounded-xl w-[280px] h-[360px] p-6 flex flex-col z-10"
            style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }} // extremely subtle edge
          >
            <div className="w-1/2 h-3 bg-slate-100 rounded-full mb-6" />
            <div className="w-full h-2 bg-slate-50 rounded-full mb-3" />
            <div className="w-5/6 h-2 bg-slate-50 rounded-full mb-3" />
            <div className="w-full h-2 bg-slate-50 rounded-full mb-8" />

            <div className="w-2/3 h-2 bg-slate-50 rounded-full mb-3" />
            <div className="w-4/5 h-2 bg-slate-50 rounded-full mb-3" />

            {/* AI Agent Interaction Indicator */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="mt-auto flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="h-1.5 bg-blue-200/50 rounded-full flex-1" />
            </motion.div>
          </motion.div>

          {/* Decorative Floating Elements */}
          <motion.div
            animate={{ y: [5, -15, 5], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            className="absolute top-1/4 -left-12 bg-white border border-slate-200 p-4 rounded-lg flex items-center gap-3 z-20"
          >
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
          </motion.div>

          <motion.div
            animate={{ y: [-15, 10, -15], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 -right-8 bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-center z-20"
          >
            <Sparkles className="w-6 h-6 text-blue-600" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
