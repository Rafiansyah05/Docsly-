import React from 'react';

export default function FAQLoading() {
  return (
    <div className="h-full bg-slate-50/50 dark:bg-[#0A0A0A] overflow-y-auto animate-pulse">
      {/* Header Section Skeleton */}
      <div className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-slate-200 dark:bg-zinc-800 rounded-2xl"></div>
          </div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-zinc-800 rounded-lg mx-auto"></div>
          <div className="h-5 w-96 bg-slate-200 dark:bg-zinc-800 rounded-md mx-auto"></div>
          
          {/* Search Input Skeleton */}
          <div className="max-w-lg mx-auto relative mt-8">
            <div className="w-full h-12 rounded-2xl bg-slate-200 dark:bg-zinc-800"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Quick Help Skeleton */}
        <section>
          <div className="h-6 w-40 bg-slate-200 dark:bg-zinc-800 rounded-md mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 mb-4"></div>
                <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md mb-2"></div>
                <div className="h-4 w-full bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Categories Skeleton */}
        <section>
          <div className="h-7 w-48 bg-slate-200 dark:bg-zinc-800 rounded-md mb-8"></div>
          
          <div className="space-y-12">
            {[1, 2].map((categoryIdx) => (
              <div key={categoryIdx}>
                <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md mb-4 px-1"></div>
                <div>
                  {[1, 2, 3].map((itemIdx) => (
                    <div key={itemIdx} className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden mb-3 bg-white dark:bg-zinc-950 h-16">
                      <div className="w-full h-full p-4 md:p-5 flex justify-between items-center">
                         <div className="h-5 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                         <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-800"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
