
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { LandingLayout } from '@/components/landing/landing-layout';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Docsly',
  description: 'Kebijakan Privasi Docsly menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.',
};

export default function PrivacyPolicyPage() {
  return (
    <LandingLayout>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-8 sm:p-12 md:p-16">
              <div className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-a:text-blue-600 max-w-none">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Kebijakan Privasi</h1>
                <p className="text-slate-400 text-sm mb-10 font-medium">Terakhir Diperbarui: 14 Juli 2026</p>

                <div className="space-y-10 text-[15px] leading-relaxed">
                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Pendahuluan</h2>
                    <p>
                      Selamat datang di <strong>Docsly</strong> ("kami", "milik kami", atau "Perusahaan"). Kebijakan Privasi ini mengatur kunjungan Anda ke platform Docsly, dan menjelaskan bagaimana kami mengumpulkan, menjaga, serta mengungkapkan informasi yang dihasilkan dari penggunaan Layanan kami.
                    </p>
                    <p className="mt-2">
                      Dengan menggunakan Layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Pengumpulan dan Penggunaan Data</h2>
                    <p>Kami mengumpulkan beberapa jenis informasi untuk berbagai keperluan guna menyediakan dan meningkatkan Layanan kami kepada Anda:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Data Pribadi:</strong> Saat mendaftar, kami mungkin meminta Anda memberikan informasi identitas diri tertentu, termasuk namun tidak terbatas pada Alamat Email, Nama Depan, dan Nama Belakang.</li>
                      <li><strong>Data Otentikasi (Google OAuth):</strong> Jika Anda mendaftar atau masuk menggunakan akun Google Anda, kami hanya mengumpulkan profil dasar (nama, alamat email, dan foto profil) yang diizinkan oleh Google. Kami <strong>tidak</strong> meminta akses ke Google Drive, Google Docs, atau layanan sensitif lainnya.</li>
                      <li><strong>Data Dokumen:</strong> Konten dokumen yang Anda buat, sunting, dan unggah ke Docsly disimpan secara aman. Kami menggunakannya secara eksklusif untuk memberikan fungsionalitas <em>AI Office Agent</em> sesuai permintaan Anda.</li>
                      <li><strong>Data Penggunaan:</strong> Kami juga dapat mengumpulkan informasi mengenai cara Layanan diakses dan digunakan (misal: alamat IP, jenis browser, halaman yang dikunjungi, serta diagnostik lainnya).</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Tujuan Penggunaan Data</h2>
                    <p>Docsly menggunakan data yang dikumpulkan untuk tujuan berikut:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Menyediakan dan memelihara Layanan (termasuk fitur pembuatan dokumen berbasis AI).</li>
                      <li>Memberitahu Anda tentang perubahan pada Layanan kami.</li>
                      <li>Memungkinkan Anda berpartisipasi dalam fitur interaktif Layanan kami (seperti manajemen langganan melalui Mayar.id).</li>
                      <li>Memberikan dukungan pelanggan.</li>
                      <li>Mendeteksi, mencegah, dan menangani masalah teknis.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Kebijakan Keamanan dan AI</h2>
                    <p>
                      Keamanan dokumen Anda adalah prioritas utama kami. Kami menggunakan penyedia layanan model bahasa besar (LLM) untuk memproses teks Anda. Kami memastikan bahwa model AI yang kami gunakan <strong>tidak menggunakan dokumen pribadi atau rahasia Anda untuk melatih ulang (retrain) model mereka secara publik</strong>. Data yang diproses diisolasi dan dienkripsi saat transit.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Penyedia Layanan Pihak Ketiga</h2>
                    <p>
                      Kami dapat mempekerjakan perusahaan pihak ketiga untuk memfasilitasi Layanan kami ("Penyedia Layanan"), termasuk:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Supabase:</strong> Digunakan untuk autentikasi dan penyimpanan database terenkripsi.</li>
                      <li><strong>Mayar.id:</strong> Digunakan secara aman untuk memproses pembayaran dan langganan (kami tidak menyimpan data kartu kredit Anda).</li>
                      <li><strong>Layanan Model AI:</strong> Digunakan murni untuk mengeksekusi instruksi perbaikan dan penyusunan dokumen.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Retensi dan Penghapusan Data</h2>
                    <p>
                      Kami hanya menyimpan Data Pribadi dan Data Dokumen Anda selama diperlukan untuk tujuan yang ditetapkan dalam Kebijakan Privasi ini. Anda memiliki hak untuk meminta kami menghapus data pribadi dan seluruh dokumen Anda kapan saja. Silakan hubungi tim dukungan kami melalui kontak yang disediakan di bagian akhir dokumen ini.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Perubahan Kebijakan Privasi</h2>
                    <p>
                      Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir Diperbarui".
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Hubungi Kami</h2>
                    <p>
                      Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, Anda dapat menghubungi kami melalui WhatsApp di: <a href="https://wa.me/6281243205089" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+62 812-4320-5089</a>.
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </LandingLayout>
  );
}
