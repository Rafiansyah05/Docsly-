'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AiRatingModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function AiRatingModal({ open, onClose, userId }: AiRatingModalProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (selectedStar === 0) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      
      // Simpan rating
      const { error: ratingError } = await supabase.from('ai_ratings').insert({
        user_id: userId,
        rating: selectedStar,
      });

      if (ratingError) throw ratingError;

      // Update status di profiles
      const { error: profileError } = await supabase.from('profiles').update({
        has_rated_ai: true,
      }).eq('id', userId);

      if (profileError) throw profileError;

      setIsSuccess(true);
      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
        // Reset state for future (though component might unmount)
        setTimeout(() => setIsSuccess(false), 500);
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error('Gagal mengirimkan penilaian. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        // Mencegah modal ditutup dengan klik di luar atau tombol escape
        // Hanya onClose prop dari fungsi submit yang bisa menutupnya
        if (!isOpen) return;
      }}
    >
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-0 overflow-hidden gap-0"
      >
        <div className="p-8 text-center space-y-6">
          {isSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                Terima Kasih!
              </h2>
              <p className="text-[14px] text-slate-500 dark:text-zinc-400 max-w-[250px] mx-auto">
                Penilaian Anda telah berhasil kami terima dan sangat berarti bagi kami.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
                  Bagaimana pengalaman Anda menggunakan Docsly AI?
                </h2>
                <p className="text-[14px] text-slate-500 dark:text-zinc-400">
                  Beri tahu kami seberapa baik asisten AI ini membantu pekerjaan Anda sejauh ini.
                </p>
              </div>

              <div className="flex justify-center items-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full transition-transform hover:scale-110 active:scale-95"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setSelectedStar(star)}
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        (hoveredStar || selectedStar) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-200 dark:text-zinc-800 hover:text-slate-300 dark:hover:text-zinc-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={selectedStar === 0 || isSubmitting}
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-slate-900 text-white border-0 rounded-xl font-medium text-[14px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Penilaian'
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
