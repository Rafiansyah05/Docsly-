import React from 'react';

export default function PanduanLoading() {
  return (
    <div className="flex w-full bg-zinc-50 dark:bg-zinc-950 font-sans animate-pulse">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Content Area Skeleton */}
        <main className="flex-1 min-w-0 w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-10">
          <div className="mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800"></div>
              <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
            <div className="h-5 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md mb-2"></div>
            <div className="h-5 w-1/2 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
          </div>

          <div className="space-y-12">
            {[1, 2, 3].map((section) => (
              <div key={section} className="mb-12">
                <div className="h-7 w-48 bg-slate-200 dark:bg-zinc-800 rounded-lg mb-6"></div>
                <div className="space-y-4 mb-6">
                  <div className="h-4 w-full bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-4 w-[95%] bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-4 w-[90%] bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                </div>
                <div className="h-6 w-40 bg-slate-200 dark:bg-zinc-800 rounded-md mb-4"></div>
                <div className="space-y-3 pl-5">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-4 w-4/5 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                </div>
                {section !== 3 && <hr className="my-10 opacity-10 dark:opacity-20 border-slate-200 dark:border-zinc-800" />}
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="w-64 flex-shrink-0 hidden xl:block sticky top-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5">
            <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md mb-6"></div>
            <div className="flex flex-col space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
                <div key={item} className="h-4 w-full bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 shrink-0"></div>
                <div className="w-full">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-zinc-800 rounded-md mb-1"></div>
                  <div className="h-3 w-4/5 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
