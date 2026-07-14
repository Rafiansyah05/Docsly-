import { Skeleton } from "@/components/ui/skeleton";

export default function FAQLoading() {
  return (
    <div className="h-full bg-slate-50/50 dark:bg-[#0A0A0A] overflow-y-auto">
      {/* Header Section */}
      <div className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center mb-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-5 w-full max-w-md rounded-lg" />
          </div>

          {/* Search Input Skeleton */}
          <div className="max-w-lg mx-auto relative mt-8">
            <Skeleton className="w-full h-[52px] rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Quick Help Skeleton */}
        <section>
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Categories Skeleton */}
        <section>
          <Skeleton className="h-7 w-48 mb-8" />
          <div className="space-y-12">
            {[1, 2].map((catIdx) => (
              <div key={catIdx}>
                <Skeleton className="h-4 w-40 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((itemIdx) => (
                    <Skeleton key={itemIdx} className="w-full h-16 rounded-xl" />
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
