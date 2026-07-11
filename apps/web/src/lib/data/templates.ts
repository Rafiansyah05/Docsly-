export const TEMPLATES_DATA = [
  {
    id: 'skripsi',
    title: 'Skripsi (Penelitian)',
    description: 'Format standar skripsi 5 bab sesuai pedoman perguruan tinggi di Indonesia.',
    icon: 'graduation-cap',
    html: `
      <h1 style="text-align: center;"><strong>[LOGO UNIVERSITAS]</strong></h1>
      <h1 style="text-align: center;"><strong>JUDUL SKRIPSI ANDA DI SINI</strong></h1>
      <p style="text-align: center;"><strong>SKRIPSI</strong><br>Diajukan untuk memenuhi salah satu syarat kelulusan<br>Program Studi [Nama Prodi] / Jenjang Sarjana (S1)</p>
      <p style="text-align: center;"><strong>Oleh:</strong><br>[Nama Mahasiswa]<br>NIM: [Nomor Induk Mahasiswa]</p>
      <p style="text-align: center;"><strong>PROGRAM STUDI [NAMA PRODI]</strong><br><strong>FAKULTAS [NAMA FAKULTAS]</strong><br><strong>UNIVERSITAS [NAMA UNIVERSITAS]</strong><br><strong>[TAHUN]</strong></p>
      <hr>
      <h2>BAB I<br>PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang Masalah</h3>
      <p>Jelaskan kesenjangan (gap) antara kondisi ideal (das sollen) dan kondisi nyata (das sein) yang membuat topik ini penting diteliti. Gunakan data atau fakta terkini untuk memperkuat argumen Anda.</p>
      <h3>1.2 Rumusan Masalah</h3>
      <p>Berdasarkan latar belakang di atas, rumusan masalah dalam penelitian ini adalah:</p>
      <ol>
        <li>Apa rumusan masalah pertama?</li>
        <li>Bagaimana rumusan masalah kedua?</li>
      </ol>
      <h3>1.3 Tujuan Penelitian</h3>
      <p>Sesuai dengan rumusan masalah, tujuan penelitian ini adalah:</p>
      <ol>
        <li>Mengetahui tujuan pertama.</li>
        <li>Menganalisis tujuan kedua.</li>
      </ol>
      <h3>1.4 Manfaat Penelitian</h3>
      <p>Penelitian ini diharapkan dapat memberikan manfaat secara teoritis maupun praktis...</p>
      
      <h2>BAB II<br>TINJAUAN PUSTAKA</h2>
      <h3>2.1 Landasan Teori</h3>
      <p>Uraikan teori-teori utama yang mendasari variabel atau konsep penelitian Anda.</p>
      <h3>2.2 Penelitian Terdahulu</h3>
      <p>Jelaskan penelitian-penelitian sejenis sebelumnya dan posisi kebaruan (novelty) dari penelitian Anda.</p>
      
      <h2>BAB III<br>METODE PENELITIAN</h2>
      <h3>3.1 Jenis Penelitian</h3>
      <p>Gunakan pendekatan kuantitatif, kualitatif, atau metode campuran (mixed methods) sesuai dengan jenis penelitian.</p>
      <h3>3.2 Populasi dan Sampel</h3>
      <p>Jelaskan populasi, sampel, serta teknik pengambilan sampel yang digunakan.</p>
      
      <h2>BAB IV<br>HASIL DAN PEMBAHASAN</h2>
      <h3>4.1 Gambaran Umum</h3>
      <p>Jelaskan deskripsi data atau gambaran umum objek penelitian Anda.</p>
      <h3>4.2 Pembahasan</h3>
      <p>Interpretasikan hasil penelitian, kaitkan dengan teori yang ada di Bab II.</p>
      
      <h2>BAB V<br>PENUTUP</h2>
      <h3>5.1 Kesimpulan</h3>
      <p>Jawab rumusan masalah secara ringkas dan padat.</p>
      <h3>5.2 Saran</h3>
      <p>Berikan rekomendasi untuk penelitian selanjutnya atau bagi pihak terkait.</p>
    `
  },
  {
    id: 'laporan',
    title: 'Laporan Magang / Praktikum',
    description: 'Format laporan formal untuk kegiatan magang, praktikum, atau kunjungan.',
    icon: 'briefcase',
    html: `
      <h1 style="text-align: center;"><strong>LAPORAN KEGIATAN MAGANG / PRAKTIKUM</strong></h1>
      <h2 style="text-align: center;"><strong>DI [NAMA INSTANSI / PERUSAHAAN]</strong></h2>
      <p style="text-align: center;"><strong>Disusun Oleh:</strong><br>[Nama Anda]<br>[NIM / ID]</p>
      <hr>
      <h2>BAB I PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang Kegiatan</h3>
      <p>Jelaskan mengapa kegiatan magang atau praktikum ini dilaksanakan dan urgensinya bagi pengembangan kompetensi mahasiswa/siswa.</p>
      <h3>1.2 Tujuan dan Manfaat</h3>
      <p>Tujuan utama dari kegiatan ini meliputi...</p>
      
      <h2>BAB II PROFIL INSTANSI</h2>
      <h3>2.1 Sejarah dan Visi Misi</h3>
      <p>Tuliskan sejarah singkat tempat magang serta visi dan misinya.</p>
      <h3>2.2 Struktur Organisasi</h3>
      <p>Deskripsikan susunan organisasi atau divisi tempat Anda ditempatkan.</p>
      
      <h2>BAB III PELAKSANAAN KEGIATAN</h2>
      <h3>3.1 Deskripsi Tugas / Kegiatan</h3>
      <p>Rincikan tugas harian atau proyek spesifik yang Anda kerjakan selama periode magang.</p>
      <h3>3.2 Kendala dan Pemecahan Masalah</h3>
      <p>Jelaskan tantangan yang dihadapi dan bagaimana Anda mengatasinya dengan menerapkan teori dari kampus.</p>
      
      <h2>BAB IV PENUTUP</h2>
      <h3>4.1 Kesimpulan</h3>
      <p>Simpulkan keseluruhan pengalaman dan hasil yang dicapai.</p>
      <h3>4.2 Saran</h3>
      <p>Berikan saran konstruktif untuk instansi maupun penyelenggara program magang.</p>
    `
  },
  {
    id: 'makalah',
    title: 'Makalah Akademik',
    description: 'Format standar pembuatan makalah tugas kuliah atau presentasi.',
    icon: 'book-open',
    html: `
      <h1 style="text-align: center;"><strong>MAKALAH</strong></h1>
      <h2 style="text-align: center;"><strong>[JUDUL MAKALAH ANDA]</strong></h2>
      <p style="text-align: center;">Disusun untuk memenuhi tugas mata kuliah [Nama Mata Kuliah]</p>
      <p style="text-align: center;"><strong>Dosen Pengampu:</strong><br>[Nama Dosen]</p>
      <p style="text-align: center;"><strong>Disusun Oleh:</strong><br>[Nama Anda] - [NIM]</p>
      <hr>
      <h2>KATA PENGANTAR</h2>
      <p>Puji syukur ke hadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya sehingga penyusun dapat menyelesaikan makalah ini tepat pada waktunya...</p>
      
      <h2>BAB I PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang</h3>
      <p>Berisi penjelasan singkat mengenai topik yang dibahas dan mengapa topik ini penting.</p>
      <h3>1.2 Rumusan Masalah</h3>
      <ul>
        <li>Apa pengertian dari topik A?</li>
        <li>Bagaimana dampak topik B terhadap masyarakat?</li>
      </ul>
      <h3>1.3 Tujuan Penulisan</h3>
      <p>Untuk mengetahui dan memahami lebih dalam mengenai rumusan masalah yang telah dijabarkan.</p>
      
      <h2>BAB II PEMBAHASAN</h2>
      <h3>2.1 [Sub-Topik Pembahasan 1]</h3>
      <p>Uraikan jawaban dari rumusan masalah pertama dengan referensi buku atau jurnal.</p>
      <h3>2.2 [Sub-Topik Pembahasan 2]</h3>
      <p>Uraikan jawaban dari rumusan masalah kedua secara analitis.</p>
      
      <h2>BAB III PENUTUP</h2>
      <h3>3.1 Kesimpulan</h3>
      <p>Tarik garis besar atau benang merah dari pembahasan di Bab II.</p>
      <h3>3.2 Saran</h3>
      <p>Tambahkan saran atau rekomendasi bagi pembaca atau penulis selanjutnya.</p>
      
      <h2>DAFTAR PUSTAKA</h2>
      <p>[Tuliskan referensi Anda di sini menggunakan format APA atau Harvard]</p>
    `
  },
  {
    id: 'surat-lamaran',
    title: 'Surat Lamaran Kerja',
    description: 'Template surat lamaran pekerjaan formal berbahasa Indonesia (PUEBI).',
    icon: 'file-signature',
    html: `
      <p>[Kota], [Tanggal, Bulan, Tahun]</p>
      <p><strong>Hal:</strong> Lamaran Pekerjaan<br><strong>Lampiran:</strong> [Jumlah] lembar</p>
      <p>Yth. HRD Manager<br><strong>[Nama Perusahaan]</strong><br>[Alamat Perusahaan]</p>
      <p>Dengan hormat,</p>
      <p>Berdasarkan informasi lowongan pekerjaan yang saya peroleh dari [Sumber Informasi], bahwa [Nama Perusahaan] sedang membuka lowongan untuk posisi <strong>[Posisi yang Dilamar]</strong>. Melalui surat ini, saya bermaksud melamar untuk mengisi posisi tersebut.</p>
      <p>Berikut adalah data diri singkat saya:</p>
      <ul>
        <li><strong>Nama:</strong> [Nama Lengkap]</li>
        <li><strong>Tempat, Tanggal Lahir:</strong> [TTL]</li>
        <li><strong>Pendidikan Terakhir:</strong> [Gelar / Jurusan / Universitas]</li>
        <li><strong>Alamat:</strong> [Alamat Lengkap]</li>
        <li><strong>No. Telepon / Email:</strong> [Nomor HP / Email Aktif]</li>
      </ul>
      <p>Saya memiliki pengalaman di bidang [Bidang Keahlian] selama [Durasi Pengalaman] dan memiliki kemampuan [Sebutkan 2-3 Keterampilan Utama]. Saya terbiasa bekerja dalam tim, mampu berkomunikasi dengan baik, dan bersedia belajar hal baru dengan cepat.</p>
      <p>Sebagai bahan pertimbangan Bapak/Ibu, bersama surat ini turut saya lampirkan:</p>
      <ol>
        <li>Curriculum Vitae (CV)</li>
        <li>Fotokopi Ijazah Terakhir</li>
        <li>Fotokopi Transkrip Nilai</li>
        <li>Pasfoto terbaru</li>
        <li>Dokumen pendukung lainnya</li>
      </ol>
      <p>Besar harapan saya untuk dapat diberikan kesempatan wawancara agar saya dapat menjelaskan lebih detail mengenai kualifikasi dan potensi yang saya miliki.</p>
      <p>Demikian surat lamaran ini saya buat dengan sebenar-benarnya. Atas perhatian dan waktu Bapak/Ibu, saya ucapkan terima kasih.</p>
      <p><br>Hormat saya,</p>
      <p><br><br><strong>[Nama Lengkap Anda]</strong></p>
    `
  },
  {
    id: 'proposal-bisnis',
    title: 'Proposal Bisnis',
    description: 'Kerangka lengkap pembuatan rencana bisnis (business plan) untuk investor.',
    icon: 'trending-up',
    html: `
      <h1 style="text-align: center;"><strong>PROPOSAL BISNIS</strong></h1>
      <h1 style="text-align: center;"><strong>[NAMA BISNIS / PRODUK ANDA]</strong></h1>
      <p style="text-align: center;">Disusun Oleh:<br><strong>[Nama Founder / Tim]</strong></p>
      <hr>
      <h2>1. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)</h2>
      <p>Jelaskan secara singkat apa bisnis Anda, masalah yang ingin dipecahkan, solusi yang ditawarkan, target pasar, dan kebutuhan pendanaan (maksimal 1 halaman).</p>
      
      <h2>2. DESKRIPSI BISNIS</h2>
      <h3>2.1 Latar Belakang</h3>
      <p>Apa visi dan misi bisnis Anda? Bagaimana ide ini bermula?</p>
      <h3>2.2 Produk / Layanan</h3>
      <p>Jelaskan detail fitur dan keunggulan kompetitif (USP) dari produk atau layanan yang Anda tawarkan.</p>
      
      <h2>3. ANALISIS PASAR & PESAING</h2>
      <h3>3.1 Target Pasar</h3>
      <p>Siapa pelanggan ideal Anda? (Demografi, psikografi, ukuran pasar/TAM, SAM, SOM).</p>
      <h3>3.2 Analisis Kompetitor</h3>
      <p>Siapa pesaing langsung dan tidak langsung? Apa kelebihan Anda dibandingkan mereka?</p>
      
      <h2>4. RENCANA PEMASARAN (MARKETING PLAN)</h2>
      <h3>4.1 Strategi Harga (Pricing)</h3>
      <p>Bagaimana model penetapan harga Anda?</p>
      <h3>4.2 Strategi Promosi dan Distribusi</h3>
      <p>Kanal apa yang akan digunakan untuk menjangkau pelanggan? (Sosial media, kemitraan, direct sales, dll).</p>
      
      <h2>5. RENCANA OPERASIONAL & MANAJEMEN</h2>
      <h3>5.1 Tim Manajemen</h3>
      <p>Profil pendiri dan tim inti beserta keahlian masing-masing.</p>
      <h3>5.2 Kebutuhan Operasional</h3>
      <p>Aset, teknologi, lokasi, atau perizinan yang dibutuhkan.</p>
      
      <h2>6. RENCANA KEUANGAN (FINANCIAL PLAN)</h2>
      <h3>6.1 Kebutuhan Pendanaan</h3>
      <p>Berapa dana yang dibutuhkan dan untuk alokasi apa saja?</p>
      <h3>6.2 Proyeksi Pendapatan (Financial Projection)</h3>
      <p>Estimasi keuntungan dalam 1-3 tahun ke depan, BEP (Break Even Point), dan ROI.</p>
    `
  },
  {
    id: 'proposal-lomba',
    title: 'Proposal Lomba (PKM/LKTI)',
    description: 'Format baku proposal kompetisi mahasiswa atau lomba karya tulis ilmiah.',
    icon: 'award',
    html: `
      <h1 style="text-align: center;"><strong>USULAN PROPOSAL KOMPETISI / PKM</strong></h1>
      <h2 style="text-align: center;"><strong>[JUDUL INOVASI ATAU PENELITIAN]</strong></h2>
      <p style="text-align: center;">Diajukan Oleh:<br><strong>[Nama Ketua Tim]</strong> - [NIM]<br><strong>[Nama Anggota 1]</strong> - [NIM]<br><strong>[Nama Anggota 2]</strong> - [NIM]</p>
      <hr>
      <h2>BAB 1. PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang</h3>
      <p>Jelaskan permasalahan mendesak di masyarakat atau industri yang membutuhkan solusi inovatif dari gagasan Anda. Sertakan data kuantitatif.</p>
      <h3>1.2 Perumusan Masalah</h3>
      <p>Apa pokok permasalahan yang ingin diselesaikan?</p>
      <h3>1.3 Tujuan Program</h3>
      <p>Hasil akhir atau target terukur yang ingin dicapai dari ide ini.</p>
      <h3>1.4 Luaran yang Diharapkan</h3>
      <p>Apakah berupa prototipe, artikel ilmiah, paten, atau produk siap pakai?</p>
      <h3>1.5 Kegunaan / Manfaat Program</h3>
      <p>Manfaat bagi target penerima atau perkembangan ilmu pengetahuan.</p>
      
      <h2>BAB 2. TINJAUAN PUSTAKA / GAMBARAN UMUM</h2>
      <p>Jelaskan landasan teori, kondisi eksisting (saat ini), dan konsep gagasan solusi Anda yang membedakannya dengan solusi sebelumnya.</p>
      
      <h2>BAB 3. METODE PELAKSANAAN</h2>
      <p>Jelaskan langkah-langkah sistematis bagaimana gagasan ini akan diwujudkan. Mulai dari tahap persiapan, perancangan (desain), implementasi, hingga evaluasi.</p>
      
      <h2>BAB 4. BIAYA DAN JADWAL KEGIATAN</h2>
      <h3>4.1 Anggaran Biaya</h3>
      <p>Buat ringkasan alokasi biaya (Bahan Habis Pakai, Sewa Alat, Transportasi, Lain-lain).</p>
      <h3>4.2 Jadwal Kegiatan</h3>
      <p>Buat rencana jadwal dalam bentuk Bar Chart / Gantt Chart selama 3-5 bulan pelaksanaan.</p>
      
      <h2>DAFTAR PUSTAKA</h2>
      <p>[Format baku penulisan daftar referensi yang relevan]</p>
    `
  }
];
