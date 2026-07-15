'use client';
export const runtime = 'edge';


import React, { useEffect, useState } from 'react';
import { BookOpen, HelpCircle, FileText, ChevronRight } from 'lucide-react';

const SECTIONS = [
  { id: 'memulai', title: '1. Memulai: Daftar & Masuk' },
  { id: 'home', title: '2. Halaman Home' },
  { id: 'workspace', title: '3. Workspace' },
  { id: 'buat-dokumen', title: '4. Membuat Dokumen Baru' },
  { id: 'import-docx', title: '5. Mengimpor Dokumen (DOCX)' },
  { id: 'editor', title: '6. Mengenal Area Editor' },
  { id: 'toolbar', title: '7. Toolbar Pemformatan' },
  { id: 'navbar', title: '8. Navbar Dokumen' },
  { id: 'tabel', title: '9. Menyisipkan Tabel' },
  { id: 'gambar', title: '10. Menyisipkan Gambar' },
  { id: 'daftar-isi', title: '11. Daftar Isi Otomatis' },
  { id: 'penomoran', title: '12. Penomoran Halaman' },
  { id: 'sitasi', title: '13. Sitasi & Daftar Pustaka' },
  { id: 'riwayat', title: '14. Riwayat Versi' },
  { id: 'ai-agent', title: '15. AI Agent' },
  { id: 'export', title: '16. Export Dokumen' },
  { id: 'layout', title: '17. Pengaturan Halaman' },
  { id: 'template', title: '18. Template Dokumen' },
  { id: 'theme', title: '19. Tampilan Light/Dark Mode' },
  { id: 'faq', title: '20. Pertanyaan Umum (FAQ)' },
];

export default function PanduanPage() {
  const [activeSection, setActiveSection] = useState('memulai');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="flex w-full bg-zinc-50 dark:bg-zinc-950 font-sans">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col xl:flex-row gap-8 items-start">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-10">
          
          <div className="mb-10 pb-6 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-500 mb-4">
              <BookOpen className="w-8 h-8" />
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Panduan Lengkap Docsly</h1>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Rulesbook untuk Pengguna — Versi 1.0. Panduan ini mencakup seluruh fitur yang tersedia beserta cara penggunaannya.
            </p>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none 
                          prose-headings:font-bold prose-headings:tracking-tight 
                          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                          prose-strong:font-semibold prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100
                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-zinc-700 dark:prose-blockquote:text-zinc-300">
            
            <section id="memulai" className="scroll-mt-24 mb-12">
              <h2>1. Memulai: Daftar & Masuk</h2>
              
              <h3>Cara Daftar Akun Baru</h3>
              <ol>
                <li>Buka <strong>docsly.id</strong> di browser kamu.</li>
                <li>Klik tombol <strong>"Daftar"</strong> atau <strong>"Mulai Gratis"</strong>.</li>
                <li>Isi formulir dengan nama lengkap, alamat email aktif, dan password (minimal 8 karakter).</li>
                <li>Klik <strong>"Buat Akun"</strong> — kamu akan langsung masuk ke dashboard.</li>
              </ol>

              <h3>Cara Masuk (Login)</h3>
              <ol>
                <li>Buka <strong>docsly.id</strong> dan klik <strong>"Masuk"</strong>.</li>
                <li>Masukkan email dan password kamu, lalu klik <strong>"Masuk"</strong>.</li>
              </ol>
              <blockquote><strong>Lupa Password?</strong> Klik "Lupa Password?" di halaman login, masukkan emailmu, dan ikuti instruksi yang dikirim ke email kamu.</blockquote>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="home" className="scroll-mt-24 mb-12">
              <h2>2. Halaman Home — Dashboard Utama</h2>
              <p>Setelah login, kamu akan melihat halaman Home yang berisi navigasi utama proyekmu.</p>
              
              <table className="w-full text-left border-collapse">
                <thead className="bg-zinc-100 dark:bg-zinc-800/50">
                  <tr>
                    <th className="p-3 font-semibold !text-zinc-900 dark:!text-white dark:!bg-zinc-900 rounded-tl-lg !bg-zinc-100">Area</th>
                    <th className="p-3 font-semibold !text-zinc-900 dark:!text-white dark:!bg-zinc-900 rounded-tr-lg !bg-zinc-100">Fungsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  <tr>
                    <td className="p-3"><strong>Sidebar kiri</strong></td>
                    <td className="p-3">Navigasi utama: Home, Template, Panduan, Notifikasi, FAQ & Support</td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Daftar Workspace</strong></td>
                    <td className="p-3">Semua workspace yang kamu miliki, lengkap dengan jumlah dokumen</td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Searchbar</strong></td>
                    <td className="p-3">Cari workspace secara cepat</td>
                  </tr>
                  <tr>
                    <td className="p-3"><strong>Tombol Buat Workspace</strong></td>
                    <td className="p-3">Membuat workspace baru untuk proyek baru</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="workspace" className="scroll-mt-24 mb-12">
              <h2>3. Workspace: Organisasi Dokumenmu</h2>
              <p>Workspace adalah folder utama untuk mengelompokkan dokumen. Misalnya: "Skripsi 2025", "Laporan Kantor", atau "Proyek Klien ABC".</p>
              
              <h3>Membuat Workspace Baru</h3>
              <ol>
                <li>Di halaman Home, klik tombol <strong>"+ Buat Workspace"</strong> (pojok kanan atas).</li>
                <li>Ketik nama workspace yang diinginkan.</li>
                <li>Klik <strong>"Buat"</strong> — workspace baru langsung muncul di daftar.</li>
              </ol>

              <h3>Mengelola Workspace</h3>
              <p>Arahkan kursor ke kartu workspace, lalu klik ikon <strong>tiga titik (⋯)</strong> yang muncul di pojok kanan atas kartu untuk <strong>Mengubah Nama</strong> atau <strong>Menghapus Workspace</strong>.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="buat-dokumen" className="scroll-mt-24 mb-12">
              <h2>4. Membuat Dokumen Baru</h2>
              
              <h3>Cara 1: Dari Halaman Workspace</h3>
              <ol>
                <li>Masuk ke workspace yang diinginkan.</li>
                <li>Klik tombol <strong>"+ Buat Dokumen"</strong> di pojok kanan atas.</li>
                <li>Dokumen baru bernama "Dokumen Tanpa Judul" akan dibuat.</li>
              </ol>

              <h3>Cara 2: Menggunakan Template</h3>
              <ol>
                <li>Di sidebar, klik <strong>"Template"</strong>.</li>
                <li>Pilih kategori template dan klik template yang sesuai.</li>
                <li>Pilih workspace tujuan, lalu klik <strong>"Gunakan Template"</strong>.</li>
              </ol>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="import-docx" className="scroll-mt-24 mb-12">
              <h2>5. Mengimpor Dokumen (DOCX)</h2>
              <p>Sudah punya dokumen Word? Kamu bisa mengimpornya langsung.</p>
              <ol>
                <li>Masuk ke workspace tujuan.</li>
                <li>Klik tombol <strong>"Import DOCX"</strong> di pojok kanan atas halaman workspace.</li>
                <li>Pilih file <code>.docx</code> dari komputer kamu.</li>
                <li>Tunggu proses impor selesai, dokumen akan otomatis terbuka di editor.</li>
              </ol>
              <blockquote><strong>Catatan:</strong> Format, heading, paragraf, list, dan tabel dari file DOCX asli akan dikonversi semaksimal mungkin ke editor Docsly.</blockquote>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="editor" className="scroll-mt-24 mb-12">
              <h2>6. Mengenal Area Editor</h2>
              <p>Tampilan editor terdiri dari beberapa area utama:</p>
              <ul>
                <li><strong>Navbar Dokumen:</strong> Tombol kembali, nama dokumen, dan tombol export.</li>
                <li><strong>Toolbar Pemformatan:</strong> Semua alat format teks (font, ukuran, heading, tebal, rata teks).</li>
                <li><strong>Kertas Dokumen:</strong> Area menulis utama yang selalu berwarna putih bersih (tidak terpengaruh dark mode).</li>
                <li><strong>Panel AI Agent:</strong> Sidebar kanan untuk chat dan meminta bantuan AI.</li>
                <li><strong>Status Bar:</strong> Informasi halaman, jumlah kata, dan status autosave.</li>
              </ul>
              <blockquote><strong>Autosave:</strong> Docsly menyimpan perubahanmu secara otomatis. Statusnya bisa dilihat di navbar (Tersimpan, Menyimpan, Mengedit).</blockquote>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="toolbar" className="scroll-mt-24 mb-12">
              <h2>7. Toolbar Pemformatan</h2>
              
              <h3>Heading (Judul Bab)</h3>
              <p>Gunakan Heading (H1, H2, H3) untuk membuat struktur dokumen. Heading sangat penting karena otomatis menjadi bagian dari <strong>Daftar Isi</strong>.</p>
              <ul>
                <li><strong>H1:</strong> Judul Bab utama (misal: BAB I PENDAHULUAN)</li>
                <li><strong>H2:</strong> Sub-bab (misal: 1.1 Latar Belakang)</li>
                <li><strong>H3:</strong> Sub-sub-bab (misal: 1.1.1 Rumusan Masalah)</li>
              </ul>
              
              <h3>Perataan Teks (Alignment)</h3>
              <p>Tersedia perataan Rata Kiri, Rata Tengah, Rata Kanan, dan Rata Penuh (Justify). Ini juga berlaku untuk Heading.</p>
              
              <h3>Tautan (Hyperlink)</h3>
              <p>Pilih teks, klik ikon 🔗 Link di toolbar, masukkan URL, lalu klik Terapkan.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="navbar" className="scroll-mt-24 mb-12">
              <h2>8. Navbar Dokumen — Aksi Cepat</h2>
              <p>Di bawah bar atas, terdapat tombol aksi cepat untuk menyisipkan <strong>Tabel</strong>, <strong>Gambar</strong>, <strong>Daftar Isi</strong>, <strong>Penomoran Halaman</strong>, <strong>Sitasi</strong>, dan melihat <strong>Riwayat</strong>.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="tabel" className="scroll-mt-24 mb-12">
              <h2>9. Menyisipkan Tabel</h2>
              <ol>
                <li>Posisikan kursor, klik <strong>"Tabel"</strong> di navbar.</li>
                <li>Gunakan menu tabel yang muncul saat kursor berada di dalam tabel untuk menambah/menghapus baris, kolom, atau menggabung sel.</li>
                <li>Tekan <strong>Tab</strong> untuk berpindah sel. Tekan Tab di sel terakhir untuk membuat baris baru.</li>
              </ol>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="gambar" className="scroll-mt-24 mb-12">
              <h2>10. Menyisipkan Gambar</h2>
              <ol>
                <li>Klik tombol <strong>"Gambar"</strong>.</li>
                <li>Pilih file, gunakan Modal Crop jika perlu, lalu Terapkan.</li>
                <li>Klik gambar di dalam editor dan tarik sudutnya untuk mengubah ukuran.</li>
              </ol>
              <blockquote><strong>Gambar Placeholder AI:</strong> Jika AI menyisipkan placeholder gambar (misal <code>[Gambar 2.1 Arsitektur]</code>), klik teks tersebut untuk mengunggah gambar asli.</blockquote>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="daftar-isi" className="scroll-mt-24 mb-12">
              <h2>11. Daftar Isi Otomatis</h2>
              <p>Daftar isi dibangun otomatis dari semua <strong>Heading</strong> di dokumenmu.</p>
              <ol>
                <li>Posisikan kursor (biasanya setelah halaman judul).</li>
                <li>Klik tombol <strong>"Daftar Isi"</strong> di navbar.</li>
              </ol>
              <p>Setiap perubahan pada heading akan otomatis memperbarui daftar isi. Pada export DOCX, daftar isi menggunakan field code Word asli.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="penomoran" className="scroll-mt-24 mb-12">
              <h2>12. Penomoran Halaman</h2>
              <p>Klik tombol <strong>"Penomoran Halaman"</strong> untuk mengatur posisi (Header/Footer), format (angka, romawi), dan halaman awal.</p>
              <p>Docsly mendukung penomoran multi-seksi (misalnya romawi untuk kata pengantar, angka biasa untuk isi). Klik <strong>"+ Tambah Bagian"</strong> untuk menambah format berbeda.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="sitasi" className="scroll-mt-24 mb-12">
              <h2>13. Sitasi & Daftar Pustaka</h2>
              <p>Klik tombol <strong>"Sitasi/Daftar Pustaka"</strong> untuk membuka panel referensi (Mendukung format APA dan Harvard).</p>
              <ol>
                <li>Klik <strong>"+ Tambah Sumber"</strong> dan isi detail buku/jurnal/website.</li>
                <li>Posisikan kursor di teks, lalu klik ikon sisipkan pada sumber di panel untuk membuat sitasi in-text.</li>
                <li>Posisikan kursor di akhir dokumen, klik <strong>"Buat Daftar Pustaka"</strong> untuk menyusun daftar otomatis.</li>
              </ol>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="riwayat" className="scroll-mt-24 mb-12">
              <h2>14. Riwayat Versi</h2>
              <p>Docsly menyimpan riwayat versimu. Klik <strong>"Riwayat"</strong>, pilih versi lama, dan klik <strong>"Pulihkan ke Versi Ini"</strong> jika kamu ingin kembali ke kondisi sebelumnya.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="ai-agent" className="scroll-mt-24 mb-12">
              <h2>15. AI Agent — Asisten Cerdasmu</h2>
              <p>Buka panel AI dengan mengklik ikon robot di pojok kanan atas editor.</p>
              
              <h3>Kemampuan Utama</h3>
              <ul>
                <li><strong>Membuat dari Nol:</strong> <em>"Buatkan proposal usaha katering rumahan"</em></li>
                <li><strong>Mengedit Teks:</strong> <em>"Perbaiki ejaan paragraf ini", "Buat lebih formal"</em></li>
                <li><strong>Transformasi:</strong> <em>"Ubah poin-poin ini menjadi tabel perbandingan"</em></li>
                <li><strong>Merapikan:</strong> <em>"Tambahkan nomor bab konsisten di semua heading"</em></li>
              </ul>
              
              <blockquote><strong>Smart Question:</strong> AI mungkin akan menanyakan 1-5 pertanyaan untuk melengkapi konteks dokumen. Kamu bisa menjawab atau melewatinya.</blockquote>
              
              <blockquote><strong>Warna Teks AI:</strong> Output dari AI selalu berwarna hitam di dokumen. Dokumen formal harus selalu bersih tanpa highlight berwarna-warni yang mengganggu.</blockquote>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="export" className="scroll-mt-24 mb-12">
              <h2>16. Export Dokumen (PDF & DOCX)</h2>
              <p>Di navbar kanan atas, terdapat dua opsi export:</p>
              <ul>
                <li><strong>Export PDF (Merah):</strong> Cocok untuk dikirim final atau dicetak. Mempertahankan layout persis seperti editor.</li>
                <li><strong>Export Word (Biru):</strong> Menghasilkan <code>.docx</code> untuk dilanjutkan di Microsoft Word.</li>
              </ul>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="layout" className="scroll-mt-24 mb-12">
              <h2>17. Pengaturan Halaman (Margin)</h2>
              <p>Gunakan ikon layout atau ruler penggaris untuk menyesuaikan margin. Standar margin Indonesia:</p>
              <ul>
                <li><strong>Skripsi/Tesis:</strong> 4 cm (Kiri, Atas) - 3 cm (Kanan, Bawah)</li>
                <li><strong>Laporan/Surat:</strong> 3 cm atau 2.5 cm di semua sisi.</li>
              </ul>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="template" className="scroll-mt-24 mb-12">
              <h2>18. Template Dokumen</h2>
              <p>Akses menu <strong>"Template"</strong> di sidebar kiri untuk menggunakan format Akademik, Bisnis, Surat, dan lainnya. Sangat mempercepat kerja daripada mulai dari nol!</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="theme" className="scroll-mt-24 mb-12">
              <h2>19. Tampilan Light/Dark Mode</h2>
              <p>Ganti tema lewat ikon profil/pengaturan di kiri bawah. <strong>Ingat:</strong> Apapun temanya, kertas dokumen tetap berwarna putih bersih agar sesuai dengan hasil cetak.</p>
            </section>

            <hr className="my-10 opacity-10 dark:opacity-20" />

            <section id="faq" className="scroll-mt-24 mb-12">
              <h2>20. Pertanyaan Umum & Tips</h2>
              <ul>
                <li><strong>Dokumen tidak tersimpan?</strong> Cek koneksi internet. Jika nyangkut, copy teks manual lalu refresh halaman.</li>
                <li><strong>Heading tidak masuk daftar isi?</strong> Pastikan menggunakan format Heading asli dari toolbar, bukan sekadar membesarkan ukuran font.</li>
                <li><strong>Export DOCX berantakan di Word?</strong> Klik "Update Fields" di Word. Gunakan font Times New Roman jika Plus Jakarta Sans tidak terinstal di PC.</li>
                <li><strong>Gunakan fitur lipat (fold):</strong> Klik panah di samping heading untuk melipat bab panjang agar lebih mudah di-scroll.</li>
              </ul>
            </section>

          </div>
        </main>

        {/* Right Sidebar - Table of Contents */}
        <aside className="w-64 flex-shrink-0 hidden xl:block sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-5">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Navigasi Panduan</h4>
            <nav className="flex flex-col space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between group
                    ${
                      activeSection === section.id
                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                >
                  <span className="truncate">{section.title}</span>
                  {activeSection === section.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                  <HelpCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Butuh bantuan?</h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cek halaman FAQ atau hubungi tim support kami.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
