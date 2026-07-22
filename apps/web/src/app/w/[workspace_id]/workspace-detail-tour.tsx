'use client';

import { useEffect } from 'react';
import { useTour } from '@/components/ui/tour';

export function WorkspaceDetailTour({ hasSeen, userId }: { hasSeen?: boolean; userId?: string }) {
  const { startTour } = useTour();

  useEffect(() => {
    // Delay sedikit agar render elemen selesai
    const timer = setTimeout(() => {
      startTour('workspace_detail_tour', [
        {
          targetId: 'tour-workspace-options',
          title: 'Pengaturan Workspace',
          content: 'Klik ikon titik tiga ini untuk mengganti nama (rename) atau menghapus workspace Anda jika sudah tidak diperlukan.',
          position: 'bottom',
          padding: 8
        },
        {
          targetId: 'tour-create-doc',
          title: 'Buat Dokumen Baru',
          content: 'Tekan tombol ini untuk membuat lembar dokumen kosong yang baru dan mulai menulis.',
          position: 'bottom',
          padding: 8
        },
        {
          targetId: 'tour-import-doc',
          title: 'Impor Dokumen (.docx)',
          content: 'Anda juga bisa mengimpor dokumen Microsoft Word (.docx) yang sudah ada langsung ke dalam workspace ini.',
          position: 'bottom',
          padding: 8
        }
      ], undefined, false, hasSeen, userId);
    }, 1200);

    return () => clearTimeout(timer);
  }, [startTour, hasSeen, userId]);

  return null;
}
