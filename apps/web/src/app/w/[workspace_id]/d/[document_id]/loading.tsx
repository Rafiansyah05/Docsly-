import { EditorSkeleton } from "@/components/skeleton/editor-skeleton";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-zinc-950">
      <div className="flex-1 overflow-auto">
        <EditorSkeleton />
      </div>
    </div>
  );
}
