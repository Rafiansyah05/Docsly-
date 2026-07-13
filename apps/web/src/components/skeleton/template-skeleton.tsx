import { Skeleton } from "@/components/ui/skeleton";

export function TemplateSkeleton() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8 md:py-10 space-y-10">
      <div className="flex flex-col border-b border-slate-200 dark:border-zinc-800 pb-6 space-y-3">
        <Skeleton className="h-[32px] w-[250px]" />
        <Skeleton className="h-[14px] w-full max-w-[600px]" />
        <Skeleton className="h-[14px] w-full max-w-[400px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-[220px] p-6 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col"
          >
            <div className="flex items-start gap-4 mb-4">
              <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 mt-1">
                <Skeleton className="h-[20px] w-3/4" />
              </div>
            </div>

            <div className="space-y-2 flex-1 mt-2">
              <Skeleton className="h-[14px] w-full" />
              <Skeleton className="h-[14px] w-full" />
              <Skeleton className="h-[14px] w-4/5" />
            </div>

            <div className="pt-5 mt-auto">
              <Skeleton className="h-[14px] w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
