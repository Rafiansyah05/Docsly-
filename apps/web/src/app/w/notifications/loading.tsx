import React from 'react';

export default function NotificationsLoading() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-8 w-64 bg-slate-200 dark:bg-zinc-800 rounded-lg"></div>
        </div>
        <div className="h-4 w-96 bg-slate-200 dark:bg-zinc-800 rounded-md mt-3"></div>
      </div>

      {/* List Skeleton */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 flex gap-4">
              <div className="shrink-0 mt-1">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="h-5 w-48 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                </div>
                <div className="space-y-2 mt-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                </div>
              </div>
              <div className="shrink-0 flex items-start pt-1 ml-4">
                <div className="w-4 h-4 bg-slate-200 dark:bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
