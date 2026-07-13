import { Skeleton } from "@/components/ui/skeleton";

export function EditorSkeleton() {
  return (
    <div className="flex justify-center p-8 md:p-12 w-full h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
      <div 
        className="bg-white dark:bg-zinc-900 w-full max-w-[850px] min-h-[1100px] border border-slate-200 dark:border-zinc-800 p-12 md:p-16 lg:p-24 space-y-8 shadow-sm rounded-sm"
      >
        {/* Title */}
        <Skeleton className="h-[40px] w-3/4 mb-10" />

        {/* Paragraphs */}
        <div className="space-y-4">
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[16px] w-[90%]" />
        </div>

        <div className="space-y-4 pt-6">
          <Skeleton className="h-[24px] w-[40%] mb-4" />
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[16px] w-[95%]" />
          <Skeleton className="h-[16px] w-3/4" />
        </div>

        <div className="space-y-4 pt-6">
          <Skeleton className="h-[20px] w-1/3 mb-4" />
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-[16px] w-[80%]" />
          </div>
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-[16px] w-[60%]" />
          </div>
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-[16px] w-[70%]" />
          </div>
        </div>

        <div className="space-y-4 pt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-[16px] ${i % 2 === 0 ? 'w-full' : 'w-[85%]'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
