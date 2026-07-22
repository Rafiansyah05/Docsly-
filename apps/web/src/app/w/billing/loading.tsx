import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="mb-10">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>

      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid gap-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
