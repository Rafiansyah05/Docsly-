export const runtime = 'edge';

import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { LandingLayout } from '@/components/landing/landing-layout';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Docsly',
  description: 'Syarat dan Ketentuan penggunaan layanan AI Office Agent Docsly.',
};

export default function TermsOfServicePage() {
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
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Syarat dan Ketentuan</h1>
                <p className="text-slate-400 text-sm mb-10 font-medium">Terakhir Diperbarui: 14 Juli 2026</p>

                <div className="space-y-10 text-[15px] leading-relaxed">
                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Penerimaan Syarat</h2>
                    <p>
                      Dengan mengakses atau menggunakan platform <strong>Docsly</strong> ("kami", "Situs", atau "Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari persyaratan ini, Anda tidak diperkenankan untuk mengakses Layanan kami.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Deskripsi Layanan</h2>
                    <p>
                      Docsly adalah platform perangkat lunak berbasis <em>AI Office Agent</em> yang dirancang untuk membantu pengguna menyusun, mengedit, memformat, dan mengekspor dokumen profesional. Kami tidak menjamin bahwa hasil dari <em>Artificial Intelligence</em> selalu 100% akurat tanpa perlu tinjauan ulang. Anda sepenuhnya bertanggung jawab atas verifikasi akhir isi dan format dari dokumen yang dihasilkan sebelum diserahkan untuk keperluan akademik, bisnis, atau hukum.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Akun Pengguna</h2>
                    <p>
                      Untuk menggunakan fungsionalitas utama Layanan, Anda harus membuat akun (baik menggunakan email maupun otentikasi pihak ketiga seperti Google). Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi Anda dan atas semua aktivitas yang terjadi di bawah akun Anda.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Pembayaran dan Langganan</h2>
                    <p>
                      Docsly menawarkan fitur dasar gratis dan fitur premium yang memerlukan biaya langganan. 
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Pembayaran berlangganan diproses dengan aman melalui mitra pembayaran resmi kami (<strong>Mayar.id</strong>).</li>
                      <li>Anda dapat membatalkan perpanjangan langganan otomatis kapan saja melalui halaman Pengaturan Akun.</li>
                      <li>Kecuali diwajibkan oleh hukum, semua biaya yang telah dibayarkan bersifat <em>non-refundable</em> (tidak dapat dikembalikan).</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Hak Kekayaan Intelektual</h2>
                    <p>
                      Hak cipta atas dokumen yang Anda buat dan hasilkan melalui Docsly sepenuhnya adalah milik Anda. Namun, Anda tidak diperkenankan:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Menyalin, memodifikasi, atau mendistribusikan kode sumber, desain antarmuka, atau elemen logo milik Docsly tanpa izin.</li>
                      <li>Menggunakan Layanan untuk menghasilkan konten yang melanggar hukum, mempromosikan kekerasan, atau melanggar hak kekayaan intelektual pihak lain.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Batasan Tanggung Jawab</h2>
                    <p>
                      Dalam keadaan apa pun, Docsly beserta pengembang, mitra, atau afiliasinya tidak bertanggung jawab atas segala kerugian tidak langsung, insidental, khusus, konsekuensial, atau hukuman (termasuk hilangnya keuntungan, data, atau reputasi) yang timbul dari:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Akses atau penggunaan Anda, atau ketidakmampuan Anda untuk mengakses atau menggunakan Layanan.</li>
                      <li>Kesalahan konten atau pemformatan yang dihasilkan oleh kecerdasan buatan pada dokumen akhir Anda.</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Penghentian</h2>
                    <p>
                      Kami dapat menghentikan atau menangguhkan akun Anda secara sepihak dan tanpa pemberitahuan sebelumnya jika Anda melanggar ketentuan mana pun dalam Syarat dan Ketentuan ini.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Hubungi Kami</h2>
                    <p>
                      Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui WhatsApp di: <a href="https://wa.me/6281243205089" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">+62 812-4320-5089</a>.
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
