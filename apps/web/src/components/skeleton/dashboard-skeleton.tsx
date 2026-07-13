import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-8 py-8 md:py-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-[32px] w-[200px]" />
          <Skeleton className="h-[14px] w-[300px]" />
        </div>
        <Skeleton className="h-[40px] w-[140px] rounded-lg" />
      </div>

      {/* Control Area */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
        <Skeleton className="h-[40px] w-full sm:w-[320px] rounded-lg" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-[40px] w-[200px] rounded-lg" />
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg">
            <Skeleton className="h-[32px] w-[36px] rounded-md" />
            <Skeleton className="h-[32px] w-[36px] rounded-md" />
          </div>
        </div>
      </div>

      {/* Workspace Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-[40px] w-[40px] rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Skeleton className="h-5 w-5 bg-blue-200 dark:bg-blue-800" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            
            <Skeleton className="h-[18px] w-3/4 mb-1" />
            <Skeleton className="h-[14px] w-1/2 mb-6" />

            <div className="flex items-center gap-2 mt-auto">
              <Skeleton className="h-[12px] w-4 rounded-full" />
              <Skeleton className="h-[12px] w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
