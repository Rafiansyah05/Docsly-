import { redirect } from 'next/navigation';

export default function Home() {
  // Arahkan pengunjung dari root (/) langsung ke dashboard workspace (/w)
  // Sistem middleware/layout di /w akan mengurus pengecekan login secara otomatis
  redirect('/w');
}
