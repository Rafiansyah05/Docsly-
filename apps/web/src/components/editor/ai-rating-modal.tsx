'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
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

      toast.success('Terima kasih atas penilaian Anda!');
      onClose();
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
      {/* 
        Tidak menggunakan <DialogClose /> agar tidak ada tombol (X).
        Menghilangkan onInteractOutside & onEscapeKeyDown behavior di atas.
      */}
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-0 overflow-hidden gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <div className="p-6 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Bagaimana pengalaman Anda menggunakan Docsly AI?
            </h2>
            <p className="text-[14px] text-slate-500 dark:text-zinc-400">
              Beri tahu kami seberapa baik asisten AI ini membantu pekerjaan Anda sejauh ini.
            </p>
          </div>

          <div className="flex justify-center items-center gap-2">
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
                      : 'fill-transparent text-slate-300 dark:text-zinc-700'
                  }`}
                />
              </button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selectedStar === 0 || isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
