import { Loader2 } from "lucide-react";

export function AIChatSkeleton() {
  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 dark:bg-zinc-950/50 p-6">
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-sm mx-auto w-full text-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center animate-pulse">
          <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-500 animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-900 dark:text-zinc-100">
            Docsly AI sedang memuat...
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Menyiapkan asisten untuk membantu penulisan dokumen Anda.
          </p>
        </div>

        <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-4 text-left space-y-3 mt-4">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-300">
            <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            Memeriksa konfigurasi...
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-300">
            <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            Menyiapkan konteks...
          </div>
          <div className="flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            Menghubungkan ke model AI...
          </div>
        </div>
      </div>
    </div>
  );
}
