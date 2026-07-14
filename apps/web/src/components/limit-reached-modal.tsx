import React from 'react';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  resetAt: string | null;
  plan: string;
  type: 'ai' | 'citation';
}

export function LimitReachedModal({ isOpen, onClose, resetAt, plan, type }: LimitReachedModalProps) {
  const router = useRouter();
  
  const resetText = resetAt 
    ? formatDistanceToNow(new Date(resetAt), { addSuffix: true, locale: id })
    : 'segera';

  const isFree = plan === 'Free';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <DialogHeader className="flex flex-col items-center justify-center text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-zinc-50">
            Batas Limit Tercapai
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-zinc-400 mt-2">
            Anda telah mencapai batas penggunaan {type === 'ai' ? 'AI Credit' : 'Citation'} untuk paket {plan} Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-4 my-4 flex items-start gap-3 border border-slate-100 dark:border-zinc-800">
          <Clock className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-700 dark:text-zinc-300">
            <p className="font-medium mb-1">Kapan limit akan direset?</p>
            <p>Limit Anda akan diperbarui <strong>{resetText}</strong>.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {isFree && (
            <Button
              onClick={() => {
                onClose();
                // We don't have a direct route for premium modal if it's on navbar, 
                // but usually user can upgrade from header. We can just tell them to upgrade.
                router.push('/w/settings'); // Adjust route if needed, or emit event
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade ke Pro
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
