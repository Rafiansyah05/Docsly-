
DOKUMEN SPESIFIKASI PRODUK
 
AI Office Agent — Spesifikasi Produk Tahap MVP

Product Requirement Document (PRD)
Versi 1.0
5 Juli 2026
Disusun sebagai acuan utama pengembangan produk bagi tim UI/UX, Frontend, Backend, AI Engineer, QA, dan Project Manager
 
 
DAFTAR ISI
DAFTAR ISI	1
1. RINGKASAN EKSEKUTIF	1
1.1 Visi Produk	1
1.2 Target Pengguna	1
1.3 Permasalahan yang Dipecahkan	1
1.4 Tujuan MVP	1
2. RUANG LINGKUP FITUR MVP	1
2.1 Document Editor	1
Requirement Fungsional	1
Rekomendasi Editor Open-Source	1
Alur Kerja Editor	1
Acceptance Criteria	1
2.2 AI Agent (Fitur Utama)	1
Cakupan Kemampuan	1
Prinsip Kerja: AI sebagai Editor, Bukan Generator Sekali Jadi	1
Arsitektur Fungsional (Ringkas)	1
Aturan Warna Konten Dokumen (Wajib)	1
Alur Kerja (Contoh: Membuat Dokumen dari Nol)	1
Acceptance Criteria	1
2.3 Smart Question Engine	1
Algoritma Kapan AI Harus Bertanya	1
Strategi Prompting agar AI Tidak Over-Asking	1
Acceptance Criteria	1
2.4 Standar Bahasa dan Konsistensi	1
Requirement Fungsional	1
Alur Kerja	1
Acceptance Criteria	1
2.5 Manajemen Sitasi	1
Requirement Fungsional	1
Alur Kerja	1
Rencana Integrasi Zotero (Pasca-MVP)	1
Acceptance Criteria	1
2.6 Daftar Isi Otomatis	1
Requirement Teknis	1
Acceptance Criteria	1
2.7 Tabel Otomatis	1
Kriteria Keputusan Penggunaan Tabel	1
Requirement Fungsional	1
Acceptance Criteria	1
2.8 Placeholder Gambar dan Caption	1
Requirement Fungsional	1
Alur Kerja	1
Acceptance Criteria	1
2.9 Lampiran Otomatis	1
Requirement Fungsional	1
Alur Kerja	1
Acceptance Criteria	1
2.10 Export Dokumen	1
Requirement Fungsional	1
Pertimbangan Teknis	1
Acceptance Criteria	1
2.11 Upload File PDF atau Word	1
Requirement Fungsional	1
Alur Kerja	1
Pertimbangan Teknis	1
Acceptance Criteria	1
2.12 Standar Output AI Agent — Teks Profesional Hitam	1
Prinsip Output AI	1
Contoh Kontras: UI vs Document Content	1
Acceptance Criteria untuk Output AI	1
3. NON-FUNCTIONAL REQUIREMENT	1
3.1 Performance	1
3.2 Security	1
3.3 Authentication	1
3.4 Scalability	1
3.5 Availability	1
3.6 Logging	1
3.7 Backup	1
3.8 Versioning dan Document History	1
3.9 Autosave	1
3.10 Error Handling	1
4. ARSITEKTUR AI	1
4.1 Perbandingan Model	1
4.2 Rekomendasi dan Alasan	1
4.3 Strategi Efisiensi Biaya AI	1
5. REKOMENDASI TECH STACK	1
6. RANCANGAN DATABASE (KONSEPTUAL)	1
6.1 Entitas Utama	1
6.2 Relasi Antar Tabel	1
6.3 Pertimbangan Desain	1
7. DESIGN SYSTEM	1
7.1 Typography	1
7.2 Spacing dan Grid	1
7.3 Radius, Shadow, dan Warna	1
7.4 Komponen	1
7.5 Fitur Tema Tampilan (Light/Dark Mode)	1
7.6 Aturan Warna Konten Dokumen (AI Output)	1
7.7 Spesifikasi Konten Wajib per Halaman	1
1. Halaman Login & Register	1
2. Halaman Home / Dashboard	1
3. Editor Workspace (Document Editor)	1
4. AI Agent (Sidebar Saja)	1
5. Template/Dokumen dari Docsly	1
6. Halaman Settings	1
7.8 Aksesibilitas	1
7.6 Dark Mode dan Light Mode — Theme System	1
Light Mode (Default)	1
Dark Mode	1
Transisi dan Konsistensi	1
Pengecualian: Area Editor Dokumen	1
8. MODEL BISNIS	1
8.1 Struktur Free dan Premium	1
8.2 Estimasi Biaya AI per Pengguna	1
8.3 Estimasi Titik Impas (BEP) Sederhana	1
9. ROADMAP PENGEMBANGAN	1
10. EVALUASI KRITIS DAN PENUTUP	1
10.1 Kelebihan	1
10.2 Kelemahan	1
10.3 Risiko	1
10.4 Kompetitor	1
10.5 Peluang	1
10.6 Rekomendasi Pengembangan Setelah MVP	1
11. SPESIFIKASI KONTEN PER HALAMAN	1
11.1 Halaman Login & Register	1
11.2 Halaman Home / Dashboard	1
11.3 Halaman Editor / Workspace	1
11.4 Panel AI Agent (Sidebar Kanan di Editor)	1
11.5 Dokumen Hasil dari Docsly (Saat Diekspor atau View)	1
11.6 Halaman Pengaturan (Settings)	1
11.7 Prinsip Konsistensi Antar Halaman	1

 
 
1. RINGKASAN EKSEKUTIF
1.1 Visi Produk
Docsly diposisikan sebagai AI Office Agent, bukan sekadar AI Writer atau AI Document Generator. Perbedaan mendasar ini menentukan seluruh arah desain produk: AI Writer menghasilkan teks, AI Document Generator menghasilkan file, sedangkan AI Office Agent menyelesaikan pekerjaan administratif dan penulisan dokumen dari awal hingga akhir — memahami tujuan pengguna, menggali informasi yang kurang melalui pertanyaan yang relevan, lalu menghasilkan dokumen profesional yang siap pakai sesuai standar Indonesia maupun internasional.
Target jangka panjang Docsly adalah menjadi AI Office Agent terbaik di Indonesia, dengan cakupan dokumen administratif, akademik, dan bisnis. Namun dokumen ini secara khusus membatasi ruang lingkup pada tahap Minimum Viable Product (MVP), yaitu fondasi produk yang harus terbukti bernilai bagi pengguna sebelum ekspansi fitur dilakukan.
1.2 Target Pengguna
Docsly menyasar delapan segmen pengguna yang memiliki kebutuhan serupa: membuat dokumen tertulis yang rapi, formal, dan sesuai kaidah bahasa, namun sering terkendala waktu, keterampilan teknis penulisan, atau pemahaman format baku.
Segmen	Kebutuhan Utama	Jenis Dokumen Dominan
Mahasiswa	Skripsi, tugas akhir, laporan praktikum	Proposal, laporan ilmiah, makalah
Dosen	Modul ajar, silabus, laporan penelitian	RPS, jurnal, laporan hibah
Guru	Materi ajar, laporan kegiatan sekolah	RPP, laporan, surat dinas
Peneliti	Penulisan ilmiah dengan sitasi akurat	Jurnal, paper, proposal riset
Pegawai Kantoran	Dokumen kerja cepat dan rapi	Memo, laporan, proposal internal
Freelancer	Dokumen klien yang profesional	Proposal, kontrak, laporan proyek
UMKM	Dokumen bisnis tanpa staf administrasi	Proposal usaha, laporan keuangan sederhana
ASN	Dokumen dinas sesuai format resmi	Surat dinas, laporan kinerja
1.3 Permasalahan yang Dipecahkan
Riset kualitatif terhadap kebiasaan menulis dokumen di kalangan target pengguna menunjukkan pola masalah yang konsisten, mulai dari tahap memulai dokumen hingga tahap finalisasi format. Docsly dirancang untuk menjawab seluruh titik masalah berikut secara end-to-end:
●	Kebingungan memulai — pengguna tidak tahu struktur atau kerangka dokumen yang tepat untuk kebutuhannya.
●	Format berantakan — heading, spasi, dan margin tidak konsisten sepanjang dokumen.
●	Bahasa tidak sesuai PUEBI — kesalahan ejaan, tanda baca, dan penggunaan kata baku/tidak baku.
●	Kesalahan italic — istilah asing, judul karya, atau frasa Latin yang seharusnya dicetak miring.
●	Sitasi tidak konsisten — gaya kutipan campur aduk atau tidak sesuai standar (APA/Harvard).
●	Daftar pustaka disusun manual — rawan salah urutan, format, dan data yang tidak lengkap.
●	Daftar isi manual — nomor halaman tidak sinkron setelah dokumen direvisi.
●	Penomoran halaman berantakan — terutama saat mengombinasikan halaman romawi dan angka.
●	Tabel tidak rapi — lebar kolom dan format tidak konsisten.
●	Gambar tanpa caption — melanggar kaidah penulisan ilmiah maupun dokumen formal.
●	Lampiran dibuat manual — memakan waktu dan rawan tidak lengkap.
●	Revisi memakan waktu lama — setiap perbaikan kecil memerlukan pengecekan ulang seluruh dokumen.
1.4 Tujuan MVP
MVP Docsly difokuskan secara ketat pada satu proposisi nilai: menjadi AI Office Agent yang membantu membuat dan mengedit dokumen profesional secara end-to-end. Prinsip pengembangan MVP yang dipegang dalam dokumen ini adalah sebagai berikut:
●	Setiap fitur yang diusulkan harus berhubungan langsung dengan alur pembuatan atau penyuntingan dokumen.
●	Fitur yang tidak berkontribusi langsung pada kualitas atau kecepatan penyelesaian dokumen ditunda ke tahap pasca-MVP (misalnya kolaborasi real-time multi-user, marketplace template, atau integrasi pihak ketiga yang kompleks).
●	Prioritas MVP adalah kualitas hasil dan kecepatan penyelesaian, bukan jumlah fitur.
●	Tim pengembang yang disasar berjumlah kecil (3–6 orang), sehingga arsitektur dan cakupan fitur harus realistis untuk dieksekusi dalam waktu terbatas.
 
2. RUANG LINGKUP FITUR MVP
Bagian ini menjabarkan dua belas fitur dan standar output inti MVP Docsly. Setiap fitur diuraikan dengan requirement fungsional, alur kerja, acceptance criteria, dan prioritas pengembangan menggunakan metode MoSCoW (Must have, Should have, Could have, Won't have — untuk tahap ini). Urutan penyajian mengikuti urutan ketergantungan teknis: Document Editor sebagai fondasi, diikuti AI Agent sebagai inti kecerdasan, kemudian fitur-fitur pendukung yang dijalankan di atas keduanya, dan diakhiri dengan jalur masuk dokumen dari luar (upload) serta ekspor keluar platform dan standar output AI yang profesional.
2.1 Document Editor
Document Editor adalah kanvas utama tempat pengguna dan AI bekerja bersama. Editor harus terasa senatural Google Docs, namun cukup ringan untuk disematkan berbagai kontrol AI (highlight saran, komentar AI, mode "AI sedang menulis") tanpa mengganggu pengalaman menulis manual.
Requirement Fungsional
Editor minimal harus mendukung elemen pemformatan berikut:
●	Heading (H1–H4) dengan penomoran otomatis opsional
●	Paragraph dengan pengaturan line-spacing dan indentasi
●	Bold, Italic, Underline, Strikethrough
●	Font Size dan Font Family (dibatasi pada font yang aman untuk ekspor DOCX/PDF, misalnya Times New Roman, Arial, Calibri)
●	Text Alignment (kiri, tengah, kanan, justify)
●	Bullet List dan Numbered List (multi-level)
●	Blockquote / Quote
●	Code Block dengan syntax highlighting dasar
●	Table dengan merge cell, resize kolom, dan style header
●	Image embed dengan resize dan alignment
●	Hyperlink dengan preview
●	Page Break manual
●	Header dan Footer per section
●	Margin custom (Normal, Narrow, Moderate, Wide, atau custom dalam cm)
●	Page Orientation (Portrait/Landscape) per section
Rekomendasi Editor Open-Source
Pemilihan engine editor sangat menentukan kecepatan pengembangan MVP karena fitur seperti table, page layout, dan export DOCX sangat kompleks bila dibangun dari nol. Tiga kandidat dibandingkan sebagai berikut:
Editor	Kelebihan	Kekurangan	Rekomendasi
Tiptap (berbasis ProseMirror)	Arsitektur node/extension sangat modular, dokumentasi baik, komunitas besar, mudah dikustomisasi untuk kebutuhan AI inline suggestion	Fitur page-layout (header/footer/margin/page-break) tidak bawaan, perlu extension kustom	Direkomendasikan
Lexical (Meta)	Performa tinggi, arsitektur plugin fleksibel, dirancang untuk skala besar	Ekosistem masih lebih muda dibanding Tiptap, dokumentasi table masih terbatas	Alternatif kuat
Quill.js	Ringan dan cepat diimplementasikan	Model dokumen (Delta) kurang fleksibel untuk struktur dokumen kompleks seperti page-layout dan komentar AI	Tidak direkomendasikan untuk MVP
Rekomendasi akhir: Tiptap. Alasannya, Tiptap dibangun di atas ProseMirror yang memiliki model dokumen terstruktur (mirip DOM tree), sehingga transformasi AI (replace, insert, restructure) dapat dilakukan secara terprogram dan presisi — kebutuhan inti Docsly. Untuk kebutuhan page-layout (header, footer, margin, orientasi), tim dapat membangun extension kustom di atas Tiptap yang hanya aktif pada mode "Document View", sementara logika konversi ke DOCX/PDF ditangani terpisah di backend (lihat Bab 10 - Export).
Alur Kerja Editor
Pengguna membuka workspace, memilih "Buat Dokumen Baru" atau membuka dokumen yang tersimpan. Editor memuat konten dalam format JSON terstruktur (bukan HTML mentah) agar mudah dipetakan ke elemen DOCX saat export. Setiap perubahan disimpan otomatis (lihat Bab 3 - Autosave) dan dicatat sebagai versi baru bila terdapat jeda pengeditan lebih dari lima menit atau saat pengguna memicu AI Agent.
Acceptance Criteria
●	Pengguna dapat menerapkan seluruh 20 elemen pemformatan pada daftar requirement tanpa error rendering.
●	Dokumen dengan lebih dari 50 halaman tetap responsif (tidak ada lag ketik di atas 100ms).
●	Format yang diterapkan konsisten setelah proses export ke DOCX dan PDF (tidak ada elemen yang hilang atau berubah posisi).
●	Header, footer, margin, dan orientasi dapat diatur berbeda per section dalam satu dokumen.
●	Kanvas dokumen selalu berlatar putih dengan teks hitam standar, tidak berubah mengikuti tema aplikasi Terang/Gelap yang dipilih pengguna (lihat Bab 7.5 dan 7.6), agar tampilan di editor selalu identik dengan hasil cetak/ekspor.
Prioritas	Justifikasi
Must Have	Tanpa editor yang stabil, seluruh fitur AI tidak memiliki kanvas untuk dieksekusi. Ini adalah fondasi mutlak MVP.
 
2.2 AI Agent (Fitur Utama)
AI Agent adalah jantung Docsly. Berbeda dari asisten AI generik yang hanya merespons prompt bebas, AI Agent Docsly bekerja dalam kerangka tugas dokumen yang terstruktur — ia memahami konteks dokumen yang sedang dikerjakan, riwayat percakapan, dan tujuan akhir pengguna, lalu bertindak seperti editor profesional yang bisa membuat, memperbaiki, dan merapikan tulisan.
Cakupan Kemampuan
AI Agent harus mampu menjalankan seluruh kapabilitas berikut, dikelompokkan menjadi empat kategori kerja:
Kategori	Kemampuan
Pembuatan Konten	Membuat dokumen dari nol, menyusun kata pengantar, abstrak, kesimpulan, lampiran, serta menyarankan struktur bab sesuai jenis dokumen
Penyuntingan Bahasa	Memperbaiki grammar, ejaan PUEBI, pemilihan kata, struktur kalimat, dan gaya bahasa formal
Transformasi Teks	Merangkum, memperpanjang, memperpendek, menulis ulang paragraf, dan menyusun ulang urutan isi
Perapian Dokumen	Membuat daftar isi, daftar pustaka, penomoran halaman, caption gambar/tabel, tabel data, dan menyeragamkan format heading di seluruh dokumen
Prinsip Kerja: AI sebagai Editor, Bukan Generator Sekali Jadi
Untuk menghindari hasil AI yang generik dan tidak akurat, AI Agent bekerja dalam siklus iteratif tiga tahap: (1) Pemahaman Konteks — membaca dokumen aktif, riwayat percakapan, dan metadata dokumen (jenis, jenjang formalitas, target pembaca); (2) Klarifikasi — mengajukan pertanyaan bila informasi kunci belum tersedia (lihat 2.3 Smart Question); (3) Eksekusi Bertahap — melakukan perubahan dalam potongan yang dapat ditinjau (bukan menimpa seluruh dokumen sekaligus), sehingga pengguna selalu dapat menerima, menolak, atau mengedit hasil AI per bagian, mirip mekanisme "suggestion mode" pada Google Docs.
Arsitektur Fungsional (Ringkas)
●	Context Builder — merangkum isi dokumen aktif (dengan context compression untuk dokumen panjang, lihat Bab 4) sebelum dikirim ke model AI.
●	Intent Classifier — mengklasifikasikan permintaan pengguna ke salah satu dari kategori pada tabel di atas untuk memilih prompt template yang sesuai.
●	Task Executor — memanggil model AI dengan prompt template dan menghasilkan output terstruktur (JSON patch terhadap struktur dokumen Tiptap, bukan teks bebas).
●	Diff Renderer — menampilkan hasil AI sebagai highlight tambah/hapus di editor sehingga pengguna dapat meninjau sebelum menerima perubahan.
●	Feedback Loop — tindakan terima/tolak pengguna dicatat sebagai sinyal untuk perbaikan prompt template ke depan.
Aturan Warna Konten Dokumen (Wajib)
Seluruh teks dan elemen yang dihasilkan AI Agent ke dalam badan dokumen (paragraf, heading, tabel, daftar isi, daftar pustaka) WAJIB berwarna hitam standar di atas latar putih, tanpa variasi warna dekoratif, gradient, atau tema warna-warni apa pun. Ketentuan ini berlaku mutlak dan terpisah dari palet warna aplikasi (navy/accent) yang dijelaskan pada Bab 7 — palet warna aplikasi hanya berlaku untuk chrome/antarmuka (sidebar, tombol, panel AI), bukan untuk konten dokumen itu sendiri.
●	Alasan utama: dokumen yang dihasilkan Docsly adalah dokumen profesional/formal (skripsi, laporan, surat dinas, proposal) yang lazimnya dicetak hitam-putih dan harus terlihat resmi, konsisten dengan standar institusi, tanpa unsur visual yang mengesankan tidak serius.
●	Highlight sementara (misalnya warna latar kuning transparan untuk menandai saran AI yang belum diterima/ditolak, atau warna aksen untuk teks yang berasal dari asumsi Smart Question pada Bab 2.3) diperbolehkan HANYA sebagai indikator kerja di dalam tampilan editor, dan wajib otomatis kembali menjadi teks hitam polos begitu pengguna menerima perubahan atau saat dokumen diekspor ke DOCX/PDF.
●	AI tidak diperkenankan menambahkan elemen dekoratif berwarna (garis pembatas berwarna, tabel dengan shading warna-warni, WordArt, atau tema warna pada heading) ke dalam dokumen, kecuali pengguna secara eksplisit memintanya untuk kebutuhan non-formal tertentu.
●	Ketentuan ini turut menjadi bagian dari Language Compliance Layer (Bab 2.4) — sebelum ditampilkan ke pengguna, output AI diverifikasi bebas dari styling warna yang tidak sesuai ketentuan ini.
Alur Kerja (Contoh: Membuat Dokumen dari Nol)
●	Pengguna memilih "Buat Dokumen dengan AI" dan menuliskan tujuan singkat, misalnya "Buatkan proposal usaha katering rumahan untuk pengajuan pinjaman UMKM".
●	AI Agent menjalankan Smart Question untuk melengkapi informasi penting yang belum disebutkan (maksimal 3–5 pertanyaan).
●	AI menyusun kerangka dokumen (outline bab) dan menampilkannya untuk konfirmasi pengguna sebelum menulis isi penuh.
●	Setelah outline disetujui, AI menulis isi per bagian secara bertahap, memberi kesempatan pengguna menghentikan atau mengarahkan ulang di tengah proses.
●	AI menyusun elemen pendukung otomatis: daftar isi, penomoran halaman, caption, dan lampiran bila relevan.
●	Dokumen final ditampilkan di editor untuk penyuntingan manual atau ekspor langsung.
Acceptance Criteria
●	AI dapat menghasilkan draf dokumen lengkap (minimal 3 bab) dari satu deskripsi tujuan pengguna dalam waktu kurang dari 60 detik untuk dokumen hingga 2.000 kata.
●	Setiap saran AI ditampilkan sebagai perubahan yang dapat diterima/ditolak per bagian, bukan langsung menimpa dokumen.
●	Hasil perbaikan bahasa (grammar/PUEBI) tidak mengubah makna asli kalimat pengguna kecuali diminta secara eksplisit.
●	AI mampu mempertahankan konsistensi istilah dan gaya bahasa sepanjang dokumen di atas 5.000 kata (diuji dengan sampling section awal dan akhir).
●	Seluruh dokumen hasil generate AI, saat diekspor ke DOCX/PDF, menampilkan teks 100% berwarna hitam standar tanpa sisa highlight, shading warna, atau elemen dekoratif berwarna apa pun.
Prioritas	Justifikasi
Must Have	Ini adalah proposisi nilai inti produk. Tanpa AI Agent yang mumpuni, Docsly hanya menjadi editor teks biasa tanpa diferensiasi.
 
2.3 Smart Question Engine
Salah satu kegagalan umum produk AI generatif adalah over-asking — AI terlalu banyak bertanya sehingga pengguna frustrasi, atau sebaliknya under-asking — AI langsung menebak dan menghasilkan dokumen yang tidak relevan. Smart Question Engine dirancang untuk menyeimbangkan keduanya dengan algoritma penilaian kelengkapan informasi.
Algoritma Kapan AI Harus Bertanya
Setiap permintaan pengguna dipetakan ke sejumlah "slot informasi wajib" berdasarkan jenis dokumen (misalnya proposal usaha membutuhkan slot: nama usaha, tujuan pengajuan, target pembaca, estimasi anggaran). AI menghitung skor kelengkapan berdasarkan slot yang sudah terisi dari input awal pengguna:
●	Skor kelengkapan di atas 80% — AI langsung menyusun outline tanpa bertanya, mengasumsikan sisa slot dengan nilai default yang wajar dan menandainya sebagai asumsi yang dapat diubah pengguna.
●	Skor kelengkapan 40%–80% — AI mengajukan pertanyaan hanya untuk slot dengan bobot kepentingan tertinggi (maksimal 3–5 pertanyaan), digabung dalam satu giliran tanya (bukan satu per satu bergantian).
●	Skor kelengkapan di bawah 40% — AI mengajukan pertanyaan pembuka yang lebih umum untuk memahami tujuan dokumen sebelum masuk ke slot detail.
●	Slot yang bersifat kosmetik (misalnya preferensi warna tema, panjang kalimat) tidak pernah ditanyakan di awal — cukup ditawarkan sebagai opsi ubah setelah draf pertama selesai.
Strategi Prompting agar AI Tidak Over-Asking
●	Batasi instruksi sistem dengan aturan eksplisit: "Ajukan pertanyaan hanya untuk informasi yang benar-benar mengubah struktur atau isi dokumen, bukan detail kosmetik."
●	Gabungkan seluruh pertanyaan yang diperlukan dalam satu balasan (batch questioning), bukan berurutan turn-by-turn, untuk menghormati batas maksimal 3–5 pertanyaan.
●	Sediakan opsi jawaban cepat (pilihan ganda atau saran default) pada tiap pertanyaan agar pengguna tidak perlu mengetik panjang.
●	Terapkan fallback: jika pengguna melewati (skip) pertanyaan, AI wajib melanjutkan dengan asumsi masuk akal dan menandai bagian yang diasumsikan dengan penanda visual di editor untuk ditinjau ulang.
Acceptance Criteria
●	Jumlah pertanyaan yang diajukan AI dalam satu sesi pembuatan dokumen tidak pernah melebihi 5 pertanyaan.
●	Pengguna dapat melewati seluruh pertanyaan dan tetap menerima draf dokumen yang koheren.
●	Bagian dokumen yang dihasilkan dari asumsi (bukan input eksplisit pengguna) ditandai secara visual di editor.
Prioritas	Justifikasi
Must Have	Tanpa mekanisme ini AI berisiko menghasilkan dokumen yang tidak relevan (under-asking) atau pengalaman yang melelahkan (over-asking), keduanya merusak retensi pengguna di awal.
2.4 Standar Bahasa dan Konsistensi
Fitur ini menjadikan Docsly relevan khusus untuk konteks Indonesia. AI wajib menerapkan kaidah Pedoman Umum Ejaan Bahasa Indonesia (PUEBI) dan Ejaan yang Disempurnakan (EYD) edisi terbaru pada seluruh output, tanpa perlu diminta eksplisit oleh pengguna.
Requirement Fungsional
●	Penerapan PUEBI dan EYD terbaru pada ejaan, tanda baca, dan penulisan kata baku/tidak baku.
●	Penentuan otomatis kapan istilah asing atau ilmiah harus dicetak miring (italic), termasuk nama spesies Latin, judul karya asing, dan kata serapan yang belum dibakukan KBBI.
●	Konsistensi istilah — jika suatu istilah teknis pertama kali didefinisikan dengan cara tertentu, AI mempertahankan penulisan yang sama di seluruh dokumen (dicek melalui glossary internal per sesi dokumen).
●	Konsistensi heading — level dan gaya penomoran heading (1, 1.1, 1.1.1) diperiksa ulang setiap kali AI menambah atau menghapus bagian.
●	Konsistensi numbering pada daftar — penomoran tidak boleh terpotong atau berulang setelah AI menyisipkan konten baru di tengah dokumen.
●	Deteksi register bahasa — AI menyesuaikan tingkat formalitas sesuai jenis dokumen (skripsi vs surat dinas vs proposal bisnis) berdasarkan metadata dokumen yang dipilih pengguna di awal.
Alur Kerja
Setiap kali AI Agent menghasilkan atau menyunting teks, output melewati lapisan pemeriksaan bahasa (Language Compliance Layer) sebelum ditampilkan ke pengguna. Lapisan ini memverifikasi ejaan, konsistensi istilah dengan glossary dokumen, dan kesesuaian format italic sebelum diff ditampilkan di editor.
Acceptance Criteria
●	Uji sampel 20 dokumen lintas jenis menunjukkan tingkat kepatuhan PUEBI di atas 95% (diverifikasi dengan pemeriksa ejaan referensi).
●	Istilah asing yang sama tidak pernah ditulis dengan format italic yang tidak konsisten (semua italic atau semua tidak) dalam satu dokumen.
●	Penomoran heading tetap berurutan dan benar setelah minimal 10 kali operasi tambah/hapus bagian oleh AI.
Prioritas	Justifikasi
Must Have	Kepatuhan bahasa adalah alasan utama pengguna Indonesia (khususnya akademik dan dinas) memilih Docsly dibanding AI generik berbahasa Inggris.
 
2.5 Manajemen Sitasi
Fitur sitasi menyasar segmen akademik (mahasiswa, dosen, peneliti) yang paling sering terkendala format kutipan. MVP mendukung dua gaya sitasi yang paling umum digunakan di Indonesia: APA (edisi ke-7) dan Harvard.
Requirement Fungsional
●	Pengguna dapat menambahkan sumber referensi secara manual (judul, penulis, tahun, penerbit, jenis sumber) melalui form terstruktur.
●	AI dapat menyisipkan sitasi dalam teks (in-text citation) sesuai gaya yang dipilih, ditempatkan otomatis pada posisi kursor atau pada kalimat yang relevan bila diminta "tambahkan sitasi untuk klaim ini".
●	AI menyusun daftar pustaka otomatis dari seluruh sumber yang telah disisipkan, terurut sesuai gaya (alfabetis untuk APA, kronologis-alfabetis untuk Harvard).
●	Perubahan pada daftar sumber (edit/hapus) secara otomatis memperbarui seluruh in-text citation dan daftar pustaka terkait.
Alur Kerja
●	Pengguna membuka panel "Sumber Referensi" dan menambahkan data sumber, atau menempelkan tautan/DOI yang akan diekstrak metadatanya oleh AI.
●	Saat menulis, pengguna memilih teks atau memberi instruksi "kutip sumber X di sini"; AI menyisipkan format in-text yang sesuai.
●	Saat dokumen mencapai tahap akhir, AI menghasilkan bagian "Daftar Pustaka" secara otomatis berdasarkan seluruh sumber yang tercatat di panel referensi.
Rencana Integrasi Zotero (Pasca-MVP)
Zotero API bersifat terbuka dan mendukung ekspor data referensi dalam format CSL-JSON, yang sudah menjadi standar de-facto pengelolaan sitasi lintas aplikasi. Integrasi pada tahap lanjutan dapat memungkinkan pengguna mengimpor seluruh library Zotero mereka langsung ke panel Sumber Referensi Docsly, serta melakukan sinkronisasi dua arah. Pada tahap MVP, kemampuan ini belum diprioritaskan karena kompleksitas OAuth dan sinkronisasi tidak sebanding dengan nilai yang didapat dibanding fokus pada input manual dan ekstraksi dari tautan/DOI.
Acceptance Criteria
●	AI dapat menghasilkan in-text citation dan entri daftar pustaka yang sesuai format APA 7 dan Harvard untuk minimal lima jenis sumber (buku, jurnal, situs web, tesis, prosiding).
●	Perubahan satu sumber referensi tercermin di seluruh dokumen dalam satu operasi, tanpa perlu pengguna mengedit manual satu per satu.
Prioritas	Justifikasi
Should Have	Bernilai tinggi untuk segmen akademik namun tidak menghambat penggunaan MVP oleh segmen non-akademik (UMKM, ASN, pegawai kantoran) apabila dirilis sedikit setelah fitur inti.
2.6 Daftar Isi Otomatis
Daftar isi (Table of Contents) dibuat otomatis dari struktur heading dokumen, meniru mekanisme TOC pada Microsoft Word namun diperbarui secara real-time seiring AI atau pengguna menyunting struktur dokumen.
Requirement Teknis
●	Setiap elemen Heading (H1–H4) di editor Tiptap memiliki ID unik yang dipetakan sebagai anchor pada saat rendering maupun ekspor.
●	TOC dibangun dengan membaca seluruh node heading dalam dokumen secara berurutan (document tree traversal), bukan dengan parsing teks biasa, agar akurat meski heading dipindah atau disisipkan di tengah.
●	Nomor halaman pada TOC untuk hasil ekspor DOCX menggunakan field code TOC bawaan Word (agar dapat di-refresh otomatis oleh pengguna di Microsoft Word), sedangkan untuk ekspor PDF nomor halaman dihitung saat proses rendering final berdasarkan estimasi pagination.
●	Perubahan struktur heading men-trigger regenerasi TOC secara otomatis di editor tanpa aksi manual pengguna.
Acceptance Criteria
●	TOC yang dihasilkan mencerminkan seluruh heading dokumen dengan indentasi sesuai level heading.
●	Setelah pengguna menambah, menghapus, atau memindah heading, TOC diperbarui dalam waktu kurang dari 2 detik tanpa perlu refresh manual.
●	TOC hasil ekspor DOCX dapat di-update melalui fitur "Update Field" bawaan Microsoft Word tanpa merusak format.
Prioritas	Justifikasi
Must Have	Salah satu keluhan paling sering disebutkan pengguna target ("daftar isi manual"); implementasinya juga relatif ringan karena data heading sudah tersedia di struktur editor.
 
2.7 Tabel Otomatis
AI dapat menghasilkan tabel secara otomatis ketika konten yang diminta pengguna lebih tepat disajikan secara terstruktur, bukan sebagai paragraf naratif panjang.
Kriteria Keputusan Penggunaan Tabel
AI menggunakan heuristik berikut untuk memutuskan apakah suatu konten sebaiknya disajikan sebagai tabel:
●	Data mengandung tiga atau lebih atribut yang dibandingkan pada beberapa entitas (misalnya perbandingan produk, jadwal kegiatan, rincian anggaran).
●	Pengguna secara eksplisit meminta perbandingan, rincian, atau daftar terstruktur ("buatkan rincian anggaran", "bandingkan tiga vendor").
●	Konten numerik berulang dengan pola kolom yang konsisten (misalnya data bulanan, hasil pengukuran).
●	Jika kriteria di atas tidak terpenuhi, AI tetap menyajikan dalam bentuk paragraf atau bullet list agar tidak memecah dokumen dengan tabel yang tidak perlu.
Requirement Fungsional
●	AI menghasilkan tabel dengan header yang jelas dan tipe data yang konsisten per kolom.
●	Tabel otomatis diberi caption dan penomoran (contoh: "Tabel 3.1 Rincian Anggaran Produksi") mengikuti urutan kemunculan dalam dokumen.
●	Pengguna dapat meminta AI mengubah paragraf yang sudah ada menjadi tabel, dan sebaliknya.
Acceptance Criteria
●	Tabel yang dihasilkan AI tidak memiliki sel kosong yang tidak disengaja atau ketidaksesuaian jumlah kolom antar baris.
●	Penomoran caption tabel tetap berurutan meski AI menyisipkan tabel baru di tengah dokumen.
Prioritas	Justifikasi
Should Have	Meningkatkan kualitas dokumen signifikan namun dapat menyusul sedikit setelah kapabilitas inti AI Agent stabil, karena secara teknis merupakan turunan dari kemampuan penulisan terstruktur AI.
2.8 Placeholder Gambar dan Caption
Docsly secara sengaja tidak membuat gambar. Keputusan produk ini penting untuk digarisbawahi: menghasilkan gambar (misalnya melalui model image generation) berada di luar cakupan MVP karena menambah kompleksitas biaya dan tidak selalu relevan untuk dokumen formal/akademik yang membutuhkan gambar dokumentatif (foto asli, diagram sistem, hasil scan) yang tidak bisa digantikan gambar buatan AI.
Requirement Fungsional
●	Ketika AI menilai suatu bagian dokumen memerlukan elemen visual, AI menyisipkan placeholder teks dengan format baku, misalnya: "[Gambar Arsitektur Sistem]".
●	AI menyusun caption otomatis mengikuti placeholder, dengan format "Gambar [Bab].[Urutan] [Deskripsi Singkat]", contoh: "Gambar 2.1 Arsitektur Sistem Informasi".
●	Pengguna dapat mengklik placeholder untuk mengunggah gambar asli miliknya, yang kemudian menggantikan placeholder namun mempertahankan caption yang sudah dibuat (dapat diedit).
●	Jika pengguna tidak mengunggah gambar hingga tahap ekspor, placeholder tetap ditampilkan sebagai teks penanda pada dokumen final (bukan dihapus otomatis), agar pengguna sadar ada elemen yang belum lengkap.
●	Dan juga Ketika pengguna ingin mengekspor filenya, jika masi ada placeholder yang belum diisi dia akan mendapatkan allert, sebagai peringatan bahwa ada yang masi belum diganti
Alur Kerja
●	AI menulis bagian dokumen dan mendeteksi kebutuhan visual (misalnya sedang menjelaskan arsitektur sistem, diagram alur, atau struktur organisasi).
●	AI menyisipkan placeholder dan caption pada posisi yang sesuai.
●	Pengguna diberi notifikasi ringan di sidebar "Ada 3 placeholder gambar yang belum diisi" agar tidak terlewat sebelum ekspor final.
●	Pengguna mengunggah gambar langsung dari editor (drag-and-drop atau klik untuk pilih file), gambar otomatis disesuaikan ukurannya dengan lebar konten.
Acceptance Criteria
●	Setiap placeholder yang dibuat AI disertai caption dengan penomoran berurutan sesuai bab.
●	Mengganti placeholder dengan gambar asli tidak mengubah nomor atau teks caption yang sudah ada kecuali diedit manual.
●	Dokumen final menampilkan daftar placeholder yang belum diisi secara jelas kepada pengguna sebelum proses ekspor selesai.
Prioritas	Justifikasi
Must Have	Kebutuhan gambar dan caption sangat umum pada dokumen akademik dan laporan formal; implementasinya ringan (teks placeholder) namun dampaknya besar pada persepsi kelengkapan dokumen.
 
2.9 Lampiran Otomatis
Banyak jenis dokumen formal (proposal, laporan, skripsi) mewajibkan bagian lampiran berisi dokumen pendukung seperti surat izin, data mentah, atau dokumentasi tambahan. AI dapat menyusun bagian lampiran secara otomatis apabila informasi yang relevan sudah tersedia dalam percakapan atau dokumen.
Requirement Fungsional
●	AI mengidentifikasi konten yang layak dipindahkan ke lampiran (misalnya tabel data mentah yang terlalu panjang untuk badan dokumen utama, listing kode program, atau formulir).
●	AI menyusun halaman lampiran dengan penomoran terpisah (Lampiran 1, Lampiran 2, dst.) dan menambahkan rujukan silang otomatis di badan dokumen ("lihat Lampiran 2").
●	Lampiran otomatis hanya dibuat ketika informasi sumber sudah cukup; jika belum, AI menandai kebutuhan lampiran sebagai catatan follow-up, bukan memaksakan pembuatan dengan data kosong.
Alur Kerja
●	Selama proses penulisan, AI mendeteksi konten yang lebih sesuai sebagai lampiran berdasarkan panjang dan jenis konten.
●	AI mengonfirmasi ke pengguna sebelum memindahkan konten ke bagian lampiran ("Bagian data mentah ini sebaiknya dipindah ke Lampiran, lanjutkan?").
●	Setelah disetujui, AI menyusun halaman lampiran dengan format konsisten dan memperbarui rujukan silang di badan dokumen.
Acceptance Criteria
●	Rujukan silang ke lampiran di badan dokumen selalu sesuai dengan nomor lampiran aktual, termasuk setelah penyisipan atau penghapusan lampiran lain.
●	AI tidak pernah membuat lampiran dengan konten rekaan; hanya menyusun ulang konten yang sudah ada atau diberikan pengguna.
Prioritas	Justifikasi
Could Have	Bernilai tambah namun dapat menyusul setelah kapabilitas inti (editor, AI Agent, TOC, ekspor) stabil, karena secara teknis merupakan kombinasi dari kapabilitas restrukturisasi AI Agent yang sudah ada.
2.10 Export Dokumen
Tahap akhir setiap alur kerja adalah menghasilkan file yang dapat digunakan di luar Docsly. MVP mendukung dua format ekspor yang paling dibutuhkan target pengguna.
Requirement Fungsional
●	Export ke DOCX — mempertahankan seluruh pemformatan editor (heading, tabel, gambar, header/footer, margin, orientasi, TOC dengan field code yang dapat di-refresh).
●	Export ke PDF — dihasilkan melalui rendering akhir tata letak (bukan konversi HTML-to-PDF sederhana) agar page break dan pagination akurat sesuai tampilan editor.
●	Kedua format ekspor menghasilkan file yang identik secara visual dengan yang ditampilkan di editor (fidelity tinggi), termasuk font yang digunakan (dibatasi pada font yang aman lintas platform).
Pertimbangan Teknis
Pendekatan yang direkomendasikan adalah membangun representasi dokumen terstruktur (JSON dari Tiptap) yang dipetakan langsung ke elemen library docx (Node.js) untuk ekspor DOCX, dan menggunakan mesin rendering headless browser (misalnya Puppeteer dengan print-to-PDF) atau LibreOffice headless untuk menghasilkan PDF dari DOCX yang sudah jadi — memastikan konsistensi antara kedua format karena PDF diturunkan dari hasil DOCX, bukan dihasilkan secara terpisah.
Acceptance Criteria
●	Dokumen dengan seluruh 20 elemen pemformatan (lihat 2.1) diekspor tanpa kehilangan elemen pada DOCX maupun PDF.
●	Waktu proses ekspor untuk dokumen hingga 50 halaman tidak lebih dari 15 detik.
●	File DOCX hasil ekspor dapat dibuka dan diedit normal di Microsoft Word tanpa peringatan kerusakan file.
Prioritas	Justifikasi
Must Have	Tanpa kemampuan ekspor yang andal, seluruh nilai yang dihasilkan di dalam editor tidak dapat digunakan pengguna di luar platform — ini adalah titik konversi nilai produk yang kritikal.
2.11 Upload File PDF atau Word
Tidak semua pengguna memulai dari halaman kosong. Banyak pengguna sudah memiliki dokumen yang sedang dikerjakan — skripsi yang tinggal dirapikan, laporan yang formatnya berantakan, atau proposal lama yang ingin dilanjutkan — dan datang ke Docsly justru untuk melanjutkan atau memperbaiki dokumen tersebut, bukan menulis dari nol. Fitur ini adalah pintu masuk kedua yang sejajar pentingnya dengan "Buat dengan AI" pada AI Prompt Box di Home (lihat deskripsi layout Home), sehingga wajib tersedia sejak MVP.
Requirement Fungsional
●	Pengguna dapat mengunggah dokumen dalam format DOCX dan PDF melalui tombol "Unggah Dokumen" pada AI Prompt Box di Home maupun dari dalam Document Editor.
●	Untuk file DOCX, sistem mengekstraksi struktur dokumen (heading, paragraf, list, tabel, gambar) dan memetakannya ke model dokumen Tiptap semaksimal mungkin, sehingga hasil unggahan langsung dapat diedit dan diproses AI seperti dokumen native Docsly.
●	Untuk file PDF, sistem membedakan dua jenis: PDF berbasis teks (born-digital) yang dapat diekstraksi langsung strukturnya, dan PDF hasil pindai/gambar (scanned) yang memerlukan proses OCR (Optical Character Recognition) terlebih dahulu sebelum dikonversi ke struktur editor.
●	Sistem membatasi ukuran file yang dapat diunggah (misalnya maksimal 20MB) dan jumlah halaman wajar untuk tahap MVP (misalnya hingga 100 halaman), dengan pesan yang jelas apabila batas terlampaui.
●	Setiap file yang diunggah melewati pemindaian dasar (validasi tipe file dan pemindaian malware) sebelum diproses lebih lanjut, sejalan dengan prinsip keamanan pada Bab 3.2.
●	Setelah konversi selesai, sistem menampilkan ringkasan hasil unggahan kepada pengguna — termasuk peringatan bila ada elemen yang tidak dapat dikonversi sempurna (misalnya tabel bersarang, kolom ganda, atau footnote), agar pengguna tidak kaget menemukan hasil yang berbeda dari file asli.
●	Setelah dokumen berhasil diunggah dan dikonversi, pengguna dapat langsung memberi instruksi ke AI Agent terhadap dokumen tersebut, misalnya "Rapihkan skripsi saya" atau "Perbaiki format Bab 3", tanpa perlu langkah tambahan.
Alur Kerja
●	Pengguna mengklik "Unggah Dokumen" dari Home atau Document Editor, lalu memilih file DOCX/PDF dari perangkatnya atau menyeretnya (drag-and-drop) ke area unggah.
●	Sistem memvalidasi tipe dan ukuran file, kemudian menampilkan indikator progres saat proses ekstraksi dan konversi berjalan ("Membaca dokumenmu...").
●	Untuk PDF hasil pindai, sistem menjalankan OCR terlebih dahulu; proses ini ditampilkan dengan estimasi waktu karena umumnya lebih lama dibanding DOCX atau PDF berbasis teks.
●	Hasil konversi ditampilkan di Document Editor sebagaimana dokumen biasa, disertai catatan ringkas di sidebar bila ada bagian yang perlu ditinjau ulang pengguna (misalnya "3 tabel berhasil dikonversi, 1 tabel kompleks perlu ditinjau manual").
●	Pengguna dapat langsung melanjutkan menulis secara manual atau meminta AI Agent bertindak terhadap dokumen yang baru diunggah, mengikuti alur kerja AI Agent pada Bab 2.2.
Pertimbangan Teknis
Untuk DOCX, konversi dilakukan menggunakan pustaka pemroses dokumen seperti Mammoth.js atau pandoc untuk mengekstraksi struktur XML dokumen menjadi model JSON yang kompatibel dengan Tiptap (selaras rekomendasi Bab 5). Untuk PDF berbasis teks, ekstraksi struktur (bukan sekadar teks mentah) tetap diupayakan agar heading dan paragraf tidak melebur menjadi satu blok teks panjang, meski akurasinya secara umum lebih rendah dibanding DOCX karena PDF tidak menyimpan struktur dokumen secara eksplisit. Untuk PDF hasil pindai, diperlukan layanan OCR (baik open-source seperti Tesseract maupun layanan API pihak ketiga) sebagai tahap tambahan sebelum konten dapat dipetakan ke struktur editor; tim perlu mempertimbangkan trade-off akurasi versus biaya saat memilih mesin OCR pada tahap implementasi.
Acceptance Criteria
●	Sistem berhasil menerima dan memproses file berformat DOCX dan PDF sesuai batas ukuran dan jumlah halaman yang ditetapkan, dengan pesan error yang jelas bila file di luar ketentuan (format tidak didukung, ukuran terlalu besar, file rusak).
●	Dokumen DOCX dengan elemen umum (heading, paragraf, list, tabel sederhana) berhasil dikonversi ke editor dengan struktur heading dan urutan konten yang sesuai dengan file asli.
●	Dokumen PDF berbasis teks berhasil diekstraksi menjadi konten yang dapat diedit, dengan pemisahan paragraf yang wajar (tidak seluruh isi melebur menjadi satu blok).
●	Dokumen PDF hasil pindai melalui proses OCR menghasilkan teks yang dapat dibaca dan diedit, dengan tingkat akurasi yang cukup untuk dokumen cetak standar (bukan tulisan tangan).
●	Pengguna menerima notifikasi yang jelas mengenai elemen yang tidak berhasil dikonversi sempurna, alih-alih elemen tersebut hilang tanpa keterangan.
●	Setelah unggahan berhasil, pengguna dapat langsung memberi instruksi ke AI Agent terhadap dokumen tersebut tanpa langkah konfigurasi tambahan.
Prioritas	Justifikasi
Must Have	Skenario "melanjutkan atau merapikan dokumen yang sudah ada" adalah salah satu dari dua jalur masuk utama pengguna sejak halaman Home (setara dengan "Buat dengan AI" dari nol), sehingga tanpa fitur ini separuh proposisi nilai Docsly sebagai AI Office Agent tidak dapat diakses pengguna yang sudah memiliki draf dokumen sebelumnya.
 
2.12 Standar Output AI Agent — Teks Profesional Hitam
Meskipun Docsly adalah aplikasi web berwarna dan modern, hasil yang dihasilkan oleh AI Agent (konten dokumen yang ditulis atau disunting) harus selalu ditampilkan dan diekspor dalam bentuk teks HITAM pada latar putih, tanpa dekorasi warna, highlight berwarna-warni, atau elemen visual yang mengganggu. Keputusan desain ini sejalan dengan positioning Docsly sebagai AI Office Agent untuk dokumen formal (skripsi, laporan, proposal, surat dinas) yang akan dibaca, dicetak, atau dikirim ke institusi/klien — tidak ada tempat untuk konten "penuh warna" dalam konteks profesional Indonesia.
Prinsip Output AI
●	Teks hasil generate AI Agent selalu berwarna hitam (#000000 atau #1A1A1A untuk aksesibilitas), tidak pernah menggunakan warna aksen (#2E75B6 blue, #7C3AED purple, atau warna lain dari palet brand Docsly).
●	Tidak ada highlight background berwarna pada konten hasil AI — jika perlu ditandai sebagai saran, gunakan mechanism "diff/track changes" standar (seperti Google Docs atau Microsoft Word) dengan margin bar tipis di sisi kiri, bukan highlight mencurigakan di belakang teks.
●	Tidak ada ikon emoji, badge berwarna, atau elemen dekoratif visual di dalam badan dokumen — semua tetap plain professional text yang cocok untuk dicetak di kertas putih.
●	Untuk fitur "saran perbaikan" (grammar, PUEBI, gaya bahasa), tampilkan dalam panel sidebar terpisah atau sebagai tooltip hover, bukan langsung di badan dokumen dengan warna mencolok.
●	Format dokumen mengikuti standar industri Indonesia: Times New Roman 12pt, spasi 1.5, margin 4-3-3-4 cm untuk dokumen formal, bukan font sans-serif bergaya atau ukuran variatif yang berlebihan.
Contoh Kontras: UI vs Document Content
UI aplikasi Docsly boleh menggunakan palet warna brand (navy, blue, success green, warning orange, error red) agar aplikasi terasa modern dan user-friendly — ini untuk toolbar, tombol, notifikasi, sidebar, dan interface control.
Namun area utama yang berisi konten dokumen (document editor canvas) harus tetap putih bersih, teks hitam, dan minimal dekorasi — seolah-olah pengguna sedang menulis di kertas kosong yang siap dicetak, bukan di canvas desain.
Area	Warna Diperbolehkan
Toolbar editor (ikon, tombol format)	Navy #1F3B57, blue accent #2E75B6, hijau success
Panel AI Agent sidebar	Latar sedikit gelap untuk diferensiasi, tapi text input tetap hitam
Notifikasi, modal, toast	Warna brand, white text untuk kontras
Konten dokumen hasil AI (WAJIB)	Teks hitam #000000/#1A1A1A, latar putih, minimal dekorasi
Export DOCX/PDF	Exactly like printed document — hitam di putih, tidak ada warna AI brand
Acceptance Criteria untuk Output AI
●	Setiap konten yang digenerate AI Agent di dalam Document Editor ditampilkan dengan warna teks hitam, tidak pernah berwarna sesuai brand.
●	Saat dokumen diekspor ke DOCX atau PDF, hasil cetakan identik dengan tampilan editor — teks tetap hitam, latar tetap putih, tidak ada warna hidden di metadata atau conditional formatting.
●	Fitur "saran" atau "track changes" menggunakan margin bar subtil atau gaya markup standar Word/Docs, bukan highlight berwarna belakang teks yang membuat konten terlihat seperti draft anak TK.
●	Dokumen Docsly yang sudah selesai terlihat identik dengan dokumen yang dibuat di Microsoft Word atau Google Docs untuk pengguna akhir — profesional, tidak mencolok, siap kirim ke institusi atau klien tanpa perlu pengecekan ulang karena khawatir warna aneh.
 
3. NON-FUNCTIONAL REQUIREMENT
Bagian ini menetapkan standar kualitas teknis di luar fitur fungsional, yang menentukan apakah Docsly layak dipercaya untuk menyimpan dokumen penting pengguna (skripsi, laporan dinas, proposal bisnis).
3.1 Performance
●	Waktu muat awal editor (Time to Interactive) di bawah 2,5 detik pada koneksi 4G standar.
●	Respons AI untuk instruksi ringan (perbaikan grammar satu paragraf) di bawah 3 detik; untuk pembuatan dokumen penuh, ditampilkan progress bertahap agar pengguna tidak menunggu tanpa umpan balik.
●	Pengetikan manual di editor tidak boleh mengalami lag di atas 100ms meski dokumen mencapai 50+ halaman.
3.2 Security
●	Seluruh data dokumen dienkripsi saat transit (TLS 1.2+) dan saat disimpan (encryption at rest) di storage maupun database.
●	Isolasi data antar pengguna (row-level security) di level database untuk mencegah kebocoran dokumen lintas akun.
●	Dokumen pengguna tidak digunakan untuk melatih ulang model AI pihak ketiga tanpa persetujuan eksplisit — kebijakan ini penting untuk kepercayaan pengguna akademik dan dinas yang menangani data sensitif.
●	Audit log untuk aktivitas sensitif (ekspor, hapus dokumen, perubahan kepemilikan workspace).
3.3 Authentication
●	Autentikasi berbasis email/password dengan verifikasi email, ditambah opsi Single Sign-On (Google) untuk mempercepat onboarding mahasiswa dan pegawai kantoran yang mayoritas sudah memiliki akun Google.
●	Session token menggunakan JWT dengan refresh token yang disimpan secara aman (httpOnly cookie), bukan localStorage, untuk mengurangi risiko XSS.
●	Dukungan reset password dan pengelolaan sesi aktif (logout dari perangkat lain) tersedia sejak MVP mengingat sensitivitas dokumen yang dikelola.
3.4 Scalability
●	Arsitektur backend bersifat stateless agar dapat di-scale horizontal seiring pertumbuhan pengguna, dengan pemrosesan AI yang berat (pembuatan dokumen penuh) dijalankan sebagai job asinkron, bukan blocking request.
●	Penggunaan message queue (misalnya BullMQ di atas Redis) untuk antrean permintaan AI agar lonjakan pengguna tidak membuat request timeout.
3.5 Availability
●	Target awal Service Level Objective (SLO) 99% uptime bulanan pada tahap Beta — cukup realistis untuk tim kecil tanpa infrastruktur multi-region, namun tetap dikomunikasikan transparan ke pengguna.
●	Status halaman publik (status page) sederhana untuk transparansi insiden, membangun kepercayaan pengguna sejak awal.
3.6 Logging
●	Logging terstruktur (JSON) untuk seluruh permintaan AI, mencatat jenis instruksi, waktu respons, dan status keberhasilan — data ini juga menjadi dasar analisis biaya token pada Bab 4 dan Bab 8.
●	Pemisahan log aplikasi (error, performance) dari log aktivitas pengguna (privasi) untuk mempermudah audit tanpa mengekspos isi dokumen dalam log.
3.7 Backup
●	Backup basis data otomatis harian dengan retensi minimal 30 hari, disimpan di region terpisah dari database utama.
●	Uji pemulihan (restore drill) dilakukan berkala (disarankan setiap kuartal) untuk memastikan backup benar-benar dapat dipulihkan, bukan sekadar tersimpan.
3.8 Versioning dan Document History
●	Setiap dokumen menyimpan riwayat versi berdasarkan checkpoint (jeda pengeditan, sebelum/sesudah operasi besar AI) alih-alih menyimpan setiap keystroke, untuk menjaga efisiensi storage.
●	Pengguna dapat melihat daftar versi dengan label waktu dan ringkasan singkat perubahan (dihasilkan otomatis oleh AI, misalnya "AI merapikan Bab 2 dan menambahkan daftar pustaka"), serta mengembalikan (restore) ke versi sebelumnya.
3.9 Autosave
●	Autosave berjalan setiap beberapa detik saat pengguna aktif mengetik, dengan indikator status simpan yang jelas ("Tersimpan" / "Menyimpan...") mengikuti pola UX Google Docs yang sudah familiar bagi target pengguna.
●	Autosave tetap berfungsi pada koneksi tidak stabil dengan mekanisme retry dan penyimpanan sementara di local state sebelum berhasil tersinkron ke server.
3.10 Error Handling
●	Kegagalan permintaan AI (timeout, rate limit provider, konten diblokir filter) ditampilkan dengan pesan yang jelas dan actionable, bukan pesan teknis mentah, disertai opsi coba lagi.
●	Kegagalan sebagian (misalnya AI berhasil membuat outline tapi gagal menulis satu bagian) tidak menghapus hasil yang sudah berhasil dibuat — pendekatan graceful degradation, bukan all-or-nothing.
●	Kegagalan ekspor dokumen menyediakan opsi unduh format alternatif (misalnya jika PDF gagal dirender, tawarkan DOCX terlebih dahulu) agar pengguna tidak kehilangan hasil kerja.
 
4. ARSITEKTUR AI
Pemilihan model AI adalah keputusan arsitektur dengan dampak langsung pada kualitas produk dan struktur biaya startup. Bagian ini membandingkan kandidat model berdasarkan kebutuhan spesifik Docsly: kemampuan mengikuti instruksi format yang ketat (PUEBI, struktur dokumen), konteks panjang (dokumen puluhan halaman), dan biaya yang wajar untuk startup tahap awal dengan basis pengguna mahasiswa dan UMKM yang sensitif harga.
4.1 Perbandingan Model
Aspek	GPT (OpenAI)	Gemini (Google)	Claude (Anthropic)	Open Source (Llama/Qwen, self-host)
Kualitas mengikuti instruksi format panjang	Sangat baik	Baik	Sangat baik, khususnya konsisten pada instruksi terstruktur/panjang	Bervariasi, umumnya di bawah model tertutup untuk tugas nuansa bahasa
Kemampuan Bahasa Indonesia formal/akademik	Baik	Baik, terintegrasi kuat dengan ekosistem Google	Sangat baik untuk gaya formal dan konsistensi panjang	Tergantung data latih, umumnya lebih lemah untuk register formal Indonesia
Panjang konteks	Besar, cukup untuk dokumen puluhan halaman	Sangat besar, unggul untuk dokumen sangat panjang	Besar, cukup untuk dokumen puluhan halaman dengan riwayat percakapan	Bervariasi, model kecil biasanya lebih terbatas
Harga per token (tier ekonomis)	Sedang	Kompetitif, tier ekonomis tersedia	Kompetitif pada tier ekonomis (setara Haiku)	Tanpa biaya per token, namun ada biaya infrastruktur GPU
Latency	Cepat pada tier ekonomis	Cepat, terutama tier ringan	Cepat pada tier ekonomis	Bergantung kapasitas server sendiri, berisiko tidak stabil untuk startup kecil
Kompleksitas operasional untuk tim kecil	Rendah (API terkelola)	Rendah (API terkelola)	Rendah (API terkelola)	Tinggi — startup harus mengelola hosting, scaling, dan uptime GPU sendiri
4.2 Rekomendasi dan Alasan
Rekomendasi utama: pendekatan multi-model dengan model routing, bukan satu model tunggal untuk seluruh tugas. Model tier ekonomis (setara Gemini Flash atau Claude Haiku) digunakan sebagai default untuk tugas-tugas bervolume tinggi dan berisiko rendah (grammar, formatting, numbering, heading, daftar isi, daftar pustaka), sementara model keluarga Claude tier menengah (setara Sonnet) dipakai khusus untuk tugas yang membutuhkan penalaran lebih dalam dan konsistensi instruksi jangka panjang, seperti penyusunan outline dokumen kompleks, perbaikan struktur argumen ilmiah, dan penulisan proposal/riset.
Alasan pemilihan ini didasarkan pada empat faktor utama yang paling relevan untuk kasus penggunaan Docsly:
•	Konsistensi pada instruksi panjang dan terstruktur — tugas inti Docsly (menjaga heading, numbering, dan istilah konsisten sepanjang dokumen puluhan halaman) sangat bergantung pada kemampuan model mengikuti instruksi sistem yang detail tanpa "lupa" di tengah proses. Untuk tugas berat seperti ini, model Claude tier menengah menjadi pilihan yang konsisten teruji.
•	Efisiensi biaya melalui segmentasi tugas — karena mayoritas aksi pengguna (grammar check, formatting kecil, ringkasan pendek) bersifat repetitif dan tidak membutuhkan penalaran kompleks, tugas-tugas ini diarahkan ke model tier ekonomis agar biaya rata-rata per pengguna tetap rendah tanpa mengorbankan kualitas pada tugas yang benar-benar membutuhkan model yang lebih kuat.
•	Struktur output yang dapat diprediksi — kebutuhan Docsly menghasilkan JSON patch terhadap struktur dokumen (bukan teks bebas) membutuhkan model yang patuh terhadap format output yang diminta secara ketat, terlepas dari model mana yang dipanggil pada suatu tugas.
•	Independensi terhadap satu vendor — dengan arsitektur routing, Docsly tidak bergantung sepenuhnya pada satu penyedia model. Jika suatu model mengalami kenaikan harga, penurunan kualitas, atau gangguan layanan, sistem dapat mengalihkan tugas ke model lain tanpa mengubah logika aplikasi secara keseluruhan.
Model open-source self-hosted tidak direkomendasikan untuk tahap MVP. Meski bebas biaya per token, beban operasional mengelola infrastruktur GPU (uptime, scaling, monitoring) tidak sepadan untuk tim kecil (3–6 orang) yang seharusnya fokus pada kualitas produk, bukan infrastruktur AI. Opsi ini dapat dipertimbangkan kembali pasca-MVP apabila volume pengguna sudah cukup besar untuk membuat self-hosting lebih ekonomis dibanding API terkelola.
Yang Akan Saya Bangun
Saya akan membuat AI Router.
Misalnya.
Grammar

↓

Gemini Flash

----------------

Rewrite

↓

Gemini Flash

----------------

PUEBI

↓

Gemini Flash

----------------

Summary

↓

Gemini Flash

----------------

Proposal

↓

Claude Sonnet

----------------

Research

↓

Claude Sonnet

 

4.3 Strategi Efisiensi Biaya AI
Karena biaya AI adalah komponen biaya operasional terbesar pada produk seperti Docsly, strategi efisiensi berikut wajib diterapkan sejak MVP, bukan ditunda ke tahap scaling:
Strategi	Penjelasan Penerapan
Caching	Simpan hasil untuk instruksi yang identik atau sangat mirip (misalnya perbaikan PUEBI untuk kalimat yang sama persis pernah diminta sebelumnya) menggunakan hash konten sebagai key cache, mengurangi panggilan API berulang.
Prompt Builder (Modular)	Susun prompt dari komponen terpisah — base prompt, task prompt, metadata, dan context — yang digabung secara dinamis per request, alih-alih satu system prompt panjang yang diasumsikan tersimpan otomatis di sisi provider. Pendekatan ini lebih aman karena tidak semua API mempertahankan session antar-request.
Context Compression (berbasis posisi)	Untuk dokumen panjang, kirim konteks berbasis posisi (heading terkait, bab yang sedang diedit, bab yang direferensikan, metadata dokumen) alih-alih ringkasan umum seluruh dokumen, karena model lebih membutuhkan posisi paragraf dan hubungan antar-bagian dibanding isi lengkap yang tidak relevan dengan edit yang sedang dilakukan.
Conversation Memory	Simpan status kunci percakapan (jenis dokumen, jawaban Smart Question, keputusan gaya bahasa) sebagai metadata terstruktur, bukan menyertakan seluruh riwayat percakapan mentah pada setiap panggilan berikutnya.
Chunking	Pecah dokumen panjang menjadi bagian per bab/bagian saat diproses AI, memproses satu bagian relevan saja alih-alih seluruh dokumen pada tugas yang bersifat lokal (misalnya perbaikan satu paragraf).
Model Routing	Arahkan tugas ringan (grammar check, formatting, ringkasan pendek) ke model tier ekonomis, dan hanya tugas kompleks (penyusunan outline, argumentasi ilmiah, proposal) ke model tier menengah, melalui AI Orchestration Layer pada 4.3.
Streaming Output	Untuk dokumen panjang (di atas ~10 halaman), hasil ditampilkan secara bertahap seiring diproses, bukan menunggu keseluruhan respons selesai, untuk menjaga pengalaman pengguna tetap responsif.
Request Queue	Saat volume pengguna tinggi dan banyak permintaan diajukan bersamaan, permintaan diatur dalam antrean dengan prioritas, alih-alih seluruh permintaan dikirim langsung dan serentak ke API model, guna menjaga stabilitas dan mengendalikan lonjakan biaya.
 
4.4 Strategi Efisiensi Biaya AI
Agar strategi multi-model pada 4.2 dapat berjalan secara konsisten, Docsly membutuhkan satu komponen sentral yang menjadi "otak" pengambilan keputusan setiap kali ada permintaan AI, alih-alih membiarkan frontend memanggil model tertentu secara langsung. Komponen ini disebut AI Orchestration Layer, dan bertanggung jawab atas enam keputusan berikut untuk setiap request:
Fungsi	Peran dalam Sistem
Task Classifier	Mengklasifikasikan jenis permintaan (grammar, formatting, ringkasan, outline, proposal, riset) sebelum menentukan model tujuan.
Model Routing	Mengarahkan tugas ringan ke model tier ekonomis dan tugas kompleks ke model tier menengah, berdasarkan hasil klasifikasi.
Cache Lookup	Mengecek apakah permintaan serupa sudah pernah diproses sebelumnya menggunakan hash konten, sebelum memanggil API.
Structured Output Layer	Memastikan model mengembalikan hasil dalam format terstruktur (JSON patch/ProseMirror node), bukan markdown atau plain text bebas, agar integrasi ke editor dokumen tidak merusak formatting.
Retry & Fallback	Menangani kegagalan atau timeout dari satu model dengan mencoba ulang atau mengalihkan ke model cadangan, sebelum akhirnya melaporkan kegagalan ke pengguna.
Cost Budget Control	Memantau kuota token per pengguna per hari; jika mendekati batas, sistem otomatis menurunkan tier model atau menampilkan notifikasi kepada pengguna.

Dengan arsitektur ini, alur permintaan tidak lagi berbentuk pemanggilan langsung ke satu model, melainkan:
Frontend
  ↓
AI Orchestration Layer
  ↓
Task Classifier → Model Routing → Cache Lookup
  ↓
Structured Output Layer
  ↓
Retry & Fallback (bila diperlukan)
  ↓
Cost Budget Control
  ↓
Response ke Editor Dokumen

Investasi pada layer ini penting sejak MVP karena dua alasan. Pertama, ia menjaga fleksibilitas vendor — perubahan harga atau kualitas pada satu model tidak memaksa perombakan logika aplikasi, cukup penyesuaian aturan routing. Kedua, ia menjadi fondasi untuk fitur yang membutuhkan pengalaman pengguna yang mulus pada dokumen panjang, seperti pemrosesan bertahap (streaming) dan antrean permintaan (queue) saat volume pengguna meningkat, yang dibahas lebih lanjut pada strategi efisiensi biaya berikut.
5. REKOMENDASI TECH STACK
Rekomendasi stack berikut mengutamakan kematangan ekosistem, komunitas besar (kemudahan mencari referensi/solusi masalah), biaya operasional rendah di tahap awal (banyak komponen memiliki tier gratis yang layak produksi kecil), dan kesesuaian dengan tim kecil yang perlu bergerak cepat tanpa overhead DevOps besar.
Komponen	Rekomendasi	Alasan Pemilihan
Frontend	Next.js 14 (App Router) + TypeScript	Mendukung rendering hybrid (SSR/CSR) yang cocok untuk landing page cepat dan editor interaktif, ekosistem terbesar di kalangan developer Indonesia sehingga mudah rekrutmen/kolaborasi tim kecil.
Editor Engine	Tiptap (ProseMirror)	Model dokumen terstruktur yang presisi untuk manipulasi AI, lihat pembahasan detail pada Bab 2.1.
Backend	Node.js (NestJS) atau Next.js API Routes untuk MVP awal	NestJS memberi struktur modular yang memudahkan pemisahan domain (Document, AI, Auth) saat tim bertambah; API Routes cukup untuk MVP tahap paling awal bila tim ingin bergerak lebih cepat sebelum migrasi ke NestJS.
Database	PostgreSQL melalui Supabase	Mendukung relational integrity yang dibutuhkan struktur dokumen kompleks (Bab 6), dilengkapi Row Level Security bawaan untuk isolasi data antar pengguna (Bab 3.2), dan tier gratis cukup untuk tahap Beta awal.
Storage	Supabase Storage / Cloudflare R2	Cocok untuk penyimpanan gambar dan file ekspor dengan biaya egress rendah (R2 tanpa biaya keluar), penting mengingat dokumen dan gambar pengguna akan terus bertambah.
Authentication	Supabase Auth	Terintegrasi langsung dengan database, mendukung email/password dan Google SSO tanpa perlu membangun sistem auth terpisah.
AI SDK	Vercel AI SDK atau SDK resmi provider model terpilih	Vercel AI SDK menyediakan abstraksi streaming response dan tool-calling yang seragam lintas provider, memudahkan strategi model routing pada Bab 4.2 tanpa menulis ulang integrasi tiap provider.
Deployment	Vercel (frontend) + Railway/Fly.io (backend & worker AI)	Vercel memberi deployment frontend tanpa konfigurasi rumit; Railway/Fly.io cocok untuk proses backend yang membutuhkan job asinkron (antrean AI) dengan biaya awal rendah.
CI/CD	GitHub Actions	Gratis untuk repository publik/kecil, terintegrasi langsung dengan workflow GitHub yang umum dipakai tim kecil.
Monitoring	Better Stack atau UptimeRobot (tier gratis)	Cukup untuk memantau status page sederhana (Bab 3.5) tanpa biaya signifikan di tahap Beta.
Analytics	PostHog (self-host opsional / cloud tier gratis)	Mendukung product analytics dan feature flag dalam satu tool, penting untuk memahami fitur mana yang benar-benar dipakai sebelum menambah fitur baru.
Error Tracking	Sentry	Standar industri untuk error tracking frontend dan backend, tier gratis mencukupi volume error pada tahap Beta.
Email Service	Resend	API modern dengan deliverability baik, sudah menjadi pilihan pada proyek-proyek sejenis, cocok untuk email verifikasi dan notifikasi transaksional.
Push Notification	Ditunda pasca-MVP (Web Push sederhana bila diperlukan)	Notifikasi bukan kebutuhan inti alur dokumen; sumber daya tim lebih baik difokuskan pada kualitas AI Agent dan editor terlebih dahulu.
Document Processing (JSON → DOCX)	Library docx (Node.js)	Library open-source matang untuk membangun file DOCX terprogram dari struktur data, mendukung seluruh elemen pemformatan yang dibutuhkan Bab 2.1 dan 2.10.
PDF Generation	LibreOffice headless (soffice --convert-to pdf) atau Puppeteer print-to-PDF	Konversi dari DOCX yang sudah jadi menjamin konsistensi visual PDF-DOCX (lihat Bab 2.10), menghindari duplikasi logic rendering.
DOCX Processing (baca dokumen upload)	Mammoth.js / pandoc	Digunakan bila pengguna mengimpor dokumen DOCX yang sudah ada untuk diedit di Docsly (kebutuhan umum: melanjutkan dokumen lama), mengekstrak struktur secara cukup akurat untuk dipetakan kembali ke model dokumen Tiptap.
 
6. RANCANGAN DATABASE (KONSEPTUAL)
Rancangan berikut bersifat konseptual tingkat tinggi, cukup untuk memandu tim backend menyusun skema detail tanpa mengunci keputusan implementasi teknis yang lebih baik ditentukan saat development dimulai.
6.1 Entitas Utama
Entitas	Deskripsi	Atribut Kunci
User	Akun pengguna Docsly	id, email, nama, role_segmen (mahasiswa/dosen/dll), auth_provider, dibuat_pada
Workspace	Ruang kerja yang dapat berisi banyak dokumen, memungkinkan pengelompokan per proyek/mata kuliah/klien	id, user_id (owner), nama_workspace, dibuat_pada
Document	Dokumen individual yang sedang/telah dibuat	id, workspace_id, judul, jenis_dokumen, status (draft/final), konten_json_terkini, dibuat_pada, diperbarui_pada
Document Version	Snapshot riwayat dokumen pada titik waktu tertentu	id, document_id, konten_json_snapshot, ringkasan_perubahan, dibuat_oleh (user/ai), dibuat_pada
AI Conversation	Sesi percakapan AI yang terasosiasi dengan satu dokumen	id, document_id, judul_sesi, dibuat_pada
Prompt History	Catatan setiap instruksi yang dikirim ke model AI beserta metadatanya	id, conversation_id, instruksi_pengguna, jenis_tugas, model_digunakan, token_input, token_output, status, dibuat_pada
Subscription	Status langganan pengguna (Free/Premium)	id, user_id, tier, tanggal_mulai, tanggal_berakhir, status_pembayaran
Usage	Pencatatan pemakaian kuota AI per pengguna per periode	id, user_id, periode, jumlah_kata_dihasilkan, jumlah_permintaan_ai, estimasi_biaya
Settings	Preferensi pengguna terhadap perilaku editor dan AI	id, user_id, gaya_bahasa_default, format_sitasi_default, tema_tampilan
Attachment	Berkas yang diunggah pengguna (gambar, dokumen impor)	id, document_id, tipe_file, url_storage, dibuat_pada
Image Placeholder	Placeholder gambar yang dibuat AI dan status pengisiannya	id, document_id, posisi_node, teks_caption, status (kosong/terisi), attachment_id (nullable)
Reference	Sumber referensi yang ditambahkan pengguna untuk sitasi	id, document_id, jenis_sumber, penulis, tahun, judul, penerbit, url_doi
Bibliography Entry	Entri daftar pustaka yang dihasilkan dari Reference sesuai gaya sitasi aktif	id, document_id, reference_id, gaya_sitasi, teks_terformat, urutan
6.2 Relasi Antar Tabel
●	Satu User dapat memiliki banyak Workspace (relasi satu-ke-banyak), memungkinkan pemisahan konteks pekerjaan (misalnya "Kuliah" vs "Freelance").
●	Satu Workspace dapat memiliki banyak Document (satu-ke-banyak).
●	Satu Document dapat memiliki banyak Document Version sebagai riwayat (satu-ke-banyak), digunakan untuk fitur Document History (Bab 3.8).
●	Satu Document dapat memiliki satu atau lebih AI Conversation (satu-ke-banyak) — memungkinkan pengguna memulai sesi percakapan baru untuk topik berbeda dalam dokumen yang sama.
●	Satu AI Conversation memiliki banyak Prompt History (satu-ke-banyak), mencatat seluruh interaksi yang menjadi dasar analisis biaya AI (Bab 4.3 dan Bab 8.2).
●	Satu User memiliki satu Subscription aktif pada satu waktu (satu-ke-satu logis, meski secara historis bisa satu-ke-banyak untuk riwayat langganan).
●	Satu User memiliki catatan Usage per periode (satu-ke-banyak, satu baris per periode penagihan) untuk mendukung batas kuota tier Free (Bab 8.1).
●	Satu Document dapat memiliki banyak Attachment dan banyak Image Placeholder (satu-ke-banyak masing-masing); satu Image Placeholder dapat terhubung ke satu Attachment setelah pengguna mengunggah gambar (relasi opsional satu-ke-satu).
●	Satu Document dapat memiliki banyak Reference (satu-ke-banyak); setiap Reference dapat menghasilkan satu Bibliography Entry per gaya sitasi yang pernah digunakan pada dokumen tersebut (satu-ke-banyak, jarang lebih dari satu gaya aktif dalam praktiknya).
6.3 Pertimbangan Desain
●	Konten dokumen disimpan sebagai JSON terstruktur (bukan HTML mentah) pada kolom konten_json_terkini, selaras dengan model dokumen Tiptap, mempermudah query maupun transformasi terprogram oleh AI Agent.
●	Document Version disimpan sebagai snapshot penuh, bukan diff bertahap, untuk kesederhanaan implementasi MVP — optimisasi menjadi diff-based storage dapat dilakukan pasca-MVP bila volume penyimpanan menjadi masalah nyata.
●	Prompt History menjadi sumber data utama untuk menghitung estimasi biaya AI per pengguna (Bab 8.2) dan sebagai bahan evaluasi kualitas prompt template dari waktu ke waktu.
 
7. DESIGN SYSTEM
Design system Docsly mengambil inspirasi dari kejernihan visual Notion, kenyamanan menulis Google Docs, dan konsistensi komponen Microsoft 365 — namun tetap membawa identitas visual sendiri agar tidak terasa sebagai tiruan. Identitas ini dibangun melalui palet warna hangat-profesional dan tipografi yang nyaman dibaca dalam sesi menulis panjang.
7.1 Typography
●	Font UI (antarmuka aplikasi): Inter atau Plus Jakarta Sans — kejelasan tinggi pada ukuran kecil, mendukung karakter Bahasa Indonesia dengan baik.
●	Font Editor Dokumen (isi tulisan): Times New Roman, Arial, Calibri, dan Georgia sebagai pilihan utama — dibatasi pada font yang aman untuk ekspor DOCX/PDF lintas perangkat, karena banyak target pengguna (akademik, dinas) terikat standar font institusi.
●	Skala ukuran UI: 12/14/16/20/24/32px untuk hierarki caption, body, subheading, heading, dan judul halaman.
7.2 Spacing dan Grid
●	Sistem spacing berbasis kelipatan 4px (4, 8, 12, 16, 24, 32, 48) untuk konsistensi jarak antar elemen di seluruh aplikasi.
●	Grid antarmuka utama: layout tiga panel (sidebar navigasi kiri, area editor tengah, panel AI/referensi kanan yang dapat disembunyikan) — pola yang sudah familiar dari Notion dan Google Docs sehingga tidak membutuhkan kurva belajar baru.
7.3 Radius, Shadow, dan Warna
●	Border radius: 6px untuk komponen kecil (button, input), 12px untuk card dan modal — memberi kesan modern namun tetap formal, tidak terlalu playful untuk konteks dokumen serius.
●	Shadow: elevation halus (soft shadow) hanya digunakan pada elemen mengambang (dropdown, modal, tooltip AI); permukaan utama editor sengaja flat agar fokus pengguna tetap pada tulisan, bukan dekorasi antarmuka.
Token Warna	Kegunaan	Contoh Hex
Primary (Navy)	Warna identitas utama, heading, tombol utama	#006EFF
Accent (Blue)	Elemen interaktif, tautan, highlight saran AI	#01E3FB
Third color	Elemen tambahan	#264791
Success	Notifikasi berhasil, indikator tersimpan	#00FF88
Warning	Placeholder belum terisi, peringatan ringan	# DBFF38
Danger	Error, konfirmasi hapus	# F93D3D
Neutral/Grey	Teks sekunder, border, background panel	# 000000/ # FFFFFF
7.4 Komponen
●	Icon: pustaka ikon garis tipis (line icon) konsisten seperti Lucide, selaras dengan estetika bersih Notion/Google Docs.
●	Button: tiga varian (primary, secondary/outline, ghost/text) dengan status hover, active, disabled yang jelas.
●	Input: field dengan label mengambang (floating label) atau label statis di atas field, disertai pesan validasi inline.
●	Modal dan Dialog: digunakan untuk aksi yang membutuhkan fokus penuh (konfirmasi hapus dokumen, pengaturan ekspor); dibedakan dari Toast yang digunakan untuk notifikasi sekilas non-blocking ("Dokumen tersimpan").
●	Loading dan Skeleton: skeleton screen digunakan saat memuat dokumen/daftar workspace; loading indicator bertahap (progress AI menulis per bagian) digunakan khusus saat AI Agent bekerja, agar pengguna memahami proses yang sedang berjalan, bukan aplikasi yang macet.
7.5 Fitur Tema Tampilan (Light/Dark Mode)
Docsly menyediakan pilihan tema tampilan agar pengguna dapat menyesuaikan kenyamanan visual sesuai preferensi dan kondisi pencahayaan tempat mereka bekerja, tanpa mengorbankan keandalan tampilan dokumen final.
●	Pengguna dapat memilih tema Terang (Light, default) atau Gelap (Dark) melalui toggle switch sederhana di halaman Pengaturan maupun ikon pintasan pada Top Navigation, dan pilihan ini tersimpan sebagai preferensi akun (Bab 6.1 — Settings).
●	Tema Gelap hanya memengaruhi chrome/antarmuka aplikasi — sidebar, top navigation, panel AI, modal, dan halaman non-editor (Home, Settings, halaman harga) — menggunakan palet warna gelap yang tetap memenuhi kontras WCAG AA.
●	Area kanvas Document Editor (tempat isi dokumen ditulis) WAJIB tetap berlatar putih terang secara default pada kedua mode tema, agar pengguna selalu melihat tampilan yang identik dengan hasil cetak/ekspor dokumennya (selaras aturan warna konten pada 7.6). Pengecualian ini dijelaskan dengan jelas kepada pengguna melalui teks bantuan singkat saat pertama kali mengaktifkan Dark Mode.
●	Transisi antar tema berlangsung halus (tanpa kedipan/flash) dan tidak memerlukan reload halaman.
●	Acceptance Criteria: seluruh komponen UI (Bab 7.4) memiliki varian warna yang sesuai pada kedua tema tanpa elemen yang sulit terbaca; preferensi tema tersimpan dan otomatis diterapkan kembali saat pengguna login dari perangkat mana pun.
7.6 Aturan Warna Konten Dokumen (AI Output)
Ketentuan ini melengkapi Bab 2.2 dan berlaku sebagai prinsip desain lintas seluruh produk: warna palet aplikasi (Primary Navy, Accent Blue, dan warna tema pada 7.5) HANYA berlaku untuk elemen antarmuka, dan TIDAK PERNAH diterapkan ke dalam konten dokumen yang dihasilkan atau disunting AI.
●	Seluruh teks, heading, tabel, dan elemen lain di dalam badan dokumen selalu berwarna hitam standar di atas latar putih, baik pada mode tema Terang maupun Gelap — kanvas editor tidak ikut berubah gelap seperti dijelaskan pada 7.5.
●	Warna hanya boleh muncul sebagai indikator sementara di dalam pengalaman mengedit (misalnya highlight kuning transparan untuk saran AI yang menunggu diterima/ditolak), dan wajib hilang otomatis (kembali hitam polos) begitu perubahan diterima atau dokumen diekspor.
●	Aturan ini memastikan dokumen yang dihasilkan Docsly selalu terlihat resmi dan profesional — sesuai kebutuhan dokumen formal seperti skripsi, laporan, dan surat dinas — terlepas dari preferensi tema tampilan aplikasi yang dipilih pengguna.
7.7 Spesifikasi Konten Wajib per Halaman
Bagian ini merangkum elemen minimum yang wajib tersedia pada enam halaman inti Docsly, sebagai acuan cepat bagi tim UI/UX dan Frontend Engineer saat membangun wireframe maupun komponen, melengkapi detail fitur pada Bab 2 dan alur Home yang telah dibahas sebelumnya.
1. Halaman Login & Register
●	Logo Docsly, judul sambutan yang ramah, dan sub-teks singkat.
●	Form Login: input Email, input Password (dengan show/hide), link "Lupa Password?", tombol primary "Masuk", tombol "Masuk dengan Google", link ke halaman Register.
●	Form Register: input Nama Lengkap, Email, Password (dengan indikator kekuatan), dropdown peran pengguna (Mahasiswa/Dosen/Pegawai/UMKM/ASN/Lainnya), checkbox persetujuan Syarat & Ketentuan, tombol primary "Buat Akun Gratis", tombol "Daftar dengan Google", link ke halaman Login.
●	Pesan validasi error yang jelas dan berbahasa manusia (bukan kode error teknis) untuk setiap field.
●	State loading pada tombol submit saat proses autentikasi berjalan.
2. Halaman Home / Dashboard
●	Top Navigation: sidebar toggle, logo, Global Search, ikon Notifikasi, ikon Settings, Avatar pengguna dengan dropdown (Profil, Workspace, Langganan, Keluar).
●	Sidebar collapsible: menu Home, Dokumen Saya, Terbaru, Template, Sampah, Pengaturan.
●	AI Prompt Box sebagai elemen hero utama: textarea instruksi, tombol Unggah Dokumen, tombol Tambah Referensi, tombol primary "Buat dengan AI", dan chip pintasan jenis dokumen (Skripsi/Laporan/Proposal/Surat Dinas/Mulai dari Kosong).
●	Quick Actions: ikon pintasan untuk Lanjutkan Menulis, Perbaiki Grammar, Ringkas, Buat Tabel, Tambah Sitasi, Rapikan Format.
●	Template Section (scroll horizontal) yang memuat template resmi dari Docsly (lihat halaman 5).
●	Continue with AI: daftar dokumen belum selesai dengan progress bar dan tombol "Lanjutkan".
●	Dokumen Terbaru: grid card dengan thumbnail, judul, waktu edit, badge status, dan menu aksi (Buka/Rename/Duplikat/Hapus/Bagikan).
●	Riwayat Percakapan AI Terbaru: daftar ringkas sesi chat yang dapat diklik untuk membuka kembali.
●	Bagian bawah: indikator kuota permintaan AI bulan berjalan dan link Upgrade untuk pengguna Free.
●	Empty state ramah (ilustrasi sederhana + tombol "Buat Dokumen Pertamamu") untuk akun baru yang belum memiliki dokumen.
3. Editor Workspace (Document Editor)
●	Panel kiri (collapsible): outline/daftar isi otomatis berdasarkan heading dokumen, item aktif ter-highlight.
●	Panel tengah: toolbar formatting lengkap (Heading, Bold, Italic, Underline, List, Table, Image, Link, Quote, Alignment, Page Break) dan kanvas dokumen berlatar putih dengan teks hitam standar (selaras Bab 7.6), indikator status simpan ("Tersimpan"/"Menyimpan...").
●	Placeholder gambar dengan caption otomatis, ditampilkan dalam kotak putus-putus sebelum gambar diunggah.
●	Tombol/ikon akses cepat ke: Ekspor, Riwayat Versi, Tambah Sitasi, dan buka/tutup Panel AI (lihat halaman 4).
●	Panel kanan berisi AI Agent (dijelaskan tersendiri pada poin berikutnya) yang dapat disembunyikan/ditampilkan tanpa mengganggu fokus menulis.
4. AI Agent (Sidebar Saja)
●	Header panel: judul "Tanya Docsly" dengan ikon AI dan tombol collapse/tutup panel.
●	Riwayat percakapan dalam bentuk chat bubble: instruksi pengguna (warna accent lembut) di kanan, jawaban/aksi AI (warna netral terang) di kiri.
●	Card saran perubahan AI yang menunjukkan ringkasan perubahan (misalnya "AI menyarankan perubahan pada paragraf 2") dengan tombol "Terima" dan "Tolak" per saran, bukan tombol terima-semua yang berisiko menimpa dokumen tanpa kontrol.
●	Indikator status kerja AI: progress bertahap dengan label tahap yang sedang dikerjakan (bukan spinner polos) dan estimasi waktu, disertai tombol "Hentikan".
●	Notifikasi Smart Question (Bab 2.3) muncul sebagai kartu pertanyaan di dalam alur chat panel ini, bukan sebagai modal terpisah, agar konteks tetap menyatu dengan sesi kerja AI.
●	Input teks di bagian bawah panel dengan placeholder mengundang ("Minta AI membantu apa saja...") dan tombol kirim.
●	Indikator kuota permintaan AI (untuk pengguna Free) ditampilkan ringkas di bagian bawah panel.
5. Template/Dokumen dari Docsly
●	Header halaman: judul "Template dari Docsly" dengan search bar dan filter kategori (Akademik, Bisnis/UMKM, Dinas/Pemerintahan, Umum).
●	Grid galeri template resmi tahap MVP: Skripsi, Laporan, dan Proposal (Bab pembahasan Home sebelumnya), masing-masing ditampilkan sebagai card dengan thumbnail struktur dokumen, nama template, deskripsi singkat format yang diikuti (misalnya "Format skripsi umum kampus Indonesia"), dan tombol "Gunakan Template".
●	Klik "Gunakan Template" membuka alur Smart Question singkat (Bab 2.3) untuk menyesuaikan sub-struktur template sebelum AI menyusun outline, selaras alur yang dijelaskan pada bagian Home.
●	Preview template (modal atau panel) yang menampilkan struktur bab/heading template sebelum digunakan, agar pengguna tahu apa yang akan didapat sebelum berkomitmen.
●	Label kecil pada tiap template yang menunjukkan sumber format (misalnya "Mengikuti format umum PUEBI & kampus Indonesia") untuk membangun kepercayaan pengguna akan relevansi lokal.
6. Halaman Settings
●	Navigasi tab: Profil, Preferensi Menulis, Langganan, Notifikasi.
●	Tab Profil: foto profil, nama, email, tombol ubah password.
●	Tab Preferensi Menulis: gaya bahasa default (Santai/Standar/Sangat Formal), format sitasi default (APA/Harvard).
●	Tab Preferensi Menulis juga memuat kontrol Tema Tampilan (Terang/Gelap) sesuai Bab 7.5, lengkap dengan catatan bahwa area editor dokumen tetap terang.
●	Tab Langganan: status paket aktif (Free/Premium), sisa kuota AI bulan berjalan, tombol Upgrade/Downgrade, riwayat pembayaran singkat.
●	Tab Notifikasi: pengaturan on/off untuk notifikasi AI selesai bekerja, komentar, dan pengingat dokumen belum selesai.
●	Tombol "Simpan Perubahan" yang konsisten di setiap tab, dengan toast konfirmasi setelah berhasil disimpan.
7.8 Aksesibilitas
●	Kontras warna teks-latar mengikuti standar WCAG AA minimum untuk keterbacaan, termasuk pada mode gelap (Bab 7.5).
●	Seluruh elemen interaktif dapat diakses melalui keyboard (tab order logis) dan dilengkapi label ARIA dasar, khususnya pada toolbar editor yang padat ikon.

7.6 Dark Mode dan Light Mode — Theme System
Docsly menyediakan opsi Dark Mode dan Light Mode yang dapat dipilih pengguna di halaman Settings → Tema. Kedua mode berlaku untuk seluruh UI aplikasi (navigation, toolbar, panel, card, modal) namun BUKAN untuk konten dokumen area editor yang tetap putih seperti kertas, selaras prinsip Bab 2.12.
Light Mode (Default)
●	Background utama: putih #FFFFFF atau off-white #F8FAFC (sesuai draft desain Bab 7).
●	Panel/sidebar: off-white #F4F5F7 atau putih, untuk diferensiasi subtle.
●	Teks utama: navy #1F3B57 atau hitam #1A1A1A untuk kontras tinggi.
●	Aksen warna: blue #2E75B6 untuk link dan elemen interaktif, success hijau, warning orange, error merah.
●	Warna netral: teks sekunder #595959, border tipis #D1D5DB.
●	Shadow: soft shadow lembut mirip Notion, hanya pada elemen mengambang (dropdown, modal, tooltip).
●	Tombol: primary navy background #1F3B57, secondary outline, ghost text-only.
Dark Mode
Ketika pengguna toggle ke Dark Mode, seluruh UI mengalami transformasi warna, kecuali area editor dokumen yang tetap putih. Ini penting agar pengguna yang bekerja sore/malam tidak terganggu cahaya layar, namun dokumen yang mereka tulis tetap terlihat profesional seperti akan dicetak di kertas putih.
●	Background utama: charcoal #1A1A1A atau navy gelap #0F172A.
●	Panel/sidebar: charcoal sedikit lebih terang #2D2D2D atau #1E293B, untuk diferensiasi subtle dalam gelap.
●	Teks utama: putih #FFFFFF atau off-white #F1F5F9 untuk kontras tinggi di latar gelap.
●	Aksen warna: tetap blue #2E75B6 (atau adjust menjadi #60A5FA untuk terlihat cukup cerah di gelap), success hijau #22C55E, warning orange #F59E0B, error merah #EF4444.
●	Border: garis tipis #404040 atau #475569 agar terlihat di latar gelap.
●	Shadow: lebih subtle atau hilang di dark mode (gelap sudah punya depth natural).
●	Tombol: primary background biru #2E75B6 atau #4F46E5 (dari draft Anda), secondary tetap outline dengan border #404040.
●	Area editor dokumen: tetap putih #FFFFFF dengan teks hitam, seperti seolah-olah kertas putih "memancar" di tengah UI gelap — efek ini menciptakan zona fokus visual yang alami.
Transisi dan Konsistensi
●	Perubahan mode dark ↔ light harus instant atau dengan smooth transition 200-300ms, bukan geser-gesaran yang mengganggu.
●	Pilihan mode disimpan di local storage / user account settings dan otomatis diterapkan setiap kali pengguna login.
●	Untuk dokumentasi design token dark mode, tim bisa refer ke standard darkening convention: setiap warna di light mode diturunkan brightness-nya ~40-50% untuk dark mode, dengan menyesuaikan contrast ratio agar tetap readable (WCAG AA minimum).
●	Semua komponen (button, input, card, modal, toast) harus ditesting di kedua mode untuk memastikan kontras teks-background cukup dan warna tidak menjadi invisible di dark mode.
Pengecualian: Area Editor Dokumen
Penting untuk diulang: meskipun pengguna memilih Dark Mode untuk UI aplikasi, area penulisan dokumen (Document Editor canvas) selalu tetap putih dengan teks hitam. Ini karena:
●	Konsistensi dengan hasil akhir (dokumen akan dicetak di kertas putih, bukan kertas gelap).
●	Kenyamanan menulis — pengguna lebih terbiasa menulis di putih, tidak di gelap (gelap membuat mata lebih lelah untuk tugas penulisan fokus panjang).
●	Profesi dokumen — tidak ada institusi atau klien yang minta dokumen ditulis dengan tema gelap. Dokumen formal harus standard.
Jika pengguna memilih Dark Mode, area editor Docsly terlihat seperti: sidebar gelap, toolbar gelap, panel AI agent gelap, namun tengah-tengah canvas putih bersih — kontras yang tajam ini sebenarnya membantu fokus pengguna pada area menulis.
 
8. MODEL BISNIS
Karena produk masih tahap Beta, fokus utama model bisnis adalah akuisisi dan retensi pengguna, bukan monetisasi agresif. Pembatasan tier Free dirancang seminimal mungkin agar tidak menghambat pengguna baru merasakan nilai inti Docsly (AI Agent yang benar-benar membantu menyelesaikan dokumen), sambil tetap menjaga biaya AI tidak membengkak tanpa kendali.
8.1 Struktur Free dan Premium
Aspek	Free	Premium
Jumlah dokumen aktif	Hingga 5 dokumen berjalan	Tidak dibatasi
Kuota permintaan AI per bulan	Dibatasi (misalnya 60 permintaan/bulan, mencakup mayoritas kebutuhan satu dokumen sedang)	Kuota jauh lebih besar atau tanpa batas wajar (fair-use)
Model AI yang digunakan	Tier ekonomis (default routing, lihat Bab 4.2)	Akses ke tier menengah untuk tugas kompleks (outline dokumen panjang, argumentasi ilmiah)
Riwayat versi dokumen	7 hari terakhir	Riwayat penuh selama dokumen aktif
Export DOCX/PDF	Tidak dibatasi	Tidak dibatasi
Dukungan sitasi (APA/Harvard)	Tersedia penuh	Tersedia penuh
Prioritas antrean AI saat trafik tinggi	Standar	Diprioritaskan (mengurangi waktu tunggu saat lonjakan pengguna)
Alasan setiap pembatasan dirancang agar terasa wajar, bukan memaksa (tidak ada fitur inti yang dikunci total di balik Premium):
●	Kuota permintaan AI dibatasi (bukan dihilangkan) karena ini adalah komponen biaya variabel terbesar; namun batas ditetapkan cukup longgar untuk menyelesaikan satu dokumen penuh, sehingga pengguna kasual (misalnya mahasiswa mengerjakan satu tugas) tidak perlu upgrade.
●	Riwayat versi dibatasi 7 hari pada tier Free karena penyimpanan versi penuh menambah beban storage jangka panjang, sementara kebutuhan mayoritas pengguna kasual adalah pemulihan jangka pendek ("kembalikan perubahan kemarin"), bukan arsip jangka panjang.
●	Export tidak dibatasi pada kedua tier karena ini adalah titik konversi nilai produk yang kritikal (Bab 2.10) — membatasi ekspor akan langsung merusak kepercayaan pengguna terhadap kegunaan produk.
●	Akses model tier menengah dijadikan pembeda Premium karena selaras dengan strategi model routing (Bab 4.2): pengguna dengan kebutuhan dokumen kompleks (skripsi, laporan riset panjang) mendapat nilai nyata dari kualitas penalaran lebih tinggi, sehingga pembayaran terasa sepadan.
8.2 Estimasi Biaya AI per Pengguna
Estimasi berikut bersifat indikatif untuk perencanaan anggaran awal, dihitung berdasarkan asumsi pemakaian tier Free (60 permintaan/bulan) dengan model tier ekonomis, dan perlu dikalibrasi ulang setelah data pemakaian riil tersedia dari Prompt History (Bab 6.1).
Komponen Estimasi	Asumsi
Rata-rata token input per permintaan	±1.500 token (termasuk context compression dari dokumen aktif)
Rata-rata token output per permintaan	±800 token
Jumlah permintaan per pengguna aktif per bulan (tier Free)	±40 permintaan realistis (di bawah kuota 60 sebagai buffer)
Estimasi total token per pengguna per bulan	±92.000 token (input + output gabungan)
Estimasi biaya per pengguna aktif per bulan (tier ekonomis)	Berkisar Rp1.500–Rp4.000 tergantung nilai tukar dan harga API berlaku saat implementasi
Catatan penting: angka harga API berubah dari waktu ke waktu dan berbeda antar provider, sehingga estimasi di atas harus dihitung ulang menggunakan harga resmi terbaru saat tim mulai membangun anggaran operasional riil, bukan dijadikan angka final yang kaku.
8.3 Estimasi Titik Impas (BEP) Sederhana
Perhitungan BEP sederhana berikut mengasumsikan biaya operasional non-AI (hosting, storage, monitoring) relatif kecil pada tahap Beta karena memanfaatkan tier gratis/murah dari stack yang direkomendasikan (Bab 5), sehingga biaya AI menjadi komponen dominan yang dibandingkan dengan pendapatan langganan Premium.
●	Asumsi biaya AI rata-rata per pengguna aktif (campuran Free dan Premium): sekitar Rp3.000–Rp6.000 per bulan.
●	Asumsi harga langganan Premium: kisaran Rp25.000–Rp39.000 per bulan, sejalan dengan daya beli mahasiswa dan UMKM di Indonesia.
●	Dengan margin tersebut, setiap satu pengguna Premium secara kasar dapat menutup biaya AI untuk sekitar 5–8 pengguna Free tier, tergantung intensitas pemakaian aktual.
●	Target awal yang realistis untuk mencapai BEP operasional (di luar biaya tim/gaji) adalah rasio konversi Free-to-Premium sekitar 3–5%, angka yang konsisten dengan benchmark umum produk SaaS produktivitas pada tahap awal.
Perhitungan ini sengaja disederhanakan dan tidak memasukkan biaya gaji tim, biaya akuisisi pengguna (marketing), atau biaya infrastruktur non-AI secara rinci, karena tujuannya adalah memberi kerangka berpikir awal, bukan proyeksi keuangan definitif yang membutuhkan data pemakaian riil.
 
9. ROADMAP PENGEMBANGAN
Roadmap disusun dalam enam sprint (masing-masing diasumsikan berdurasi dua minggu, dapat disesuaikan dengan kapasitas tim), dengan urutan yang mengikuti ketergantungan teknis: fondasi editor dan autentikasi terlebih dahulu, kemudian AI Agent inti, disusul fitur pendukung, dan diakhiri pengerasan (hardening) sebelum rilis Beta publik.
Sprint	Fokus Utama	Target Terukur
Sprint 1	Fondasi: Autentikasi, Workspace, dan Document Editor dasar	Pengguna dapat mendaftar/login, membuat workspace, dan menulis dokumen dengan elemen pemformatan dasar (heading, bold/italic, list, tabel sederhana) tersimpan otomatis (autosave).
Sprint 2	Document Editor lengkap + infrastruktur ekspor awal	Seluruh 20 elemen pemformatan pada Bab 2.1 berfungsi; ekspor DOCX dasar (tanpa AI) menghasilkan file yang identik secara visual dengan editor.
Sprint 3	AI Agent inti: pembuatan dan penyuntingan dokumen	AI dapat membuat draf dokumen dari deskripsi tujuan, memperbaiki grammar/PUEBI, merangkum, dan memperpanjang/memperpendek teks dengan mekanisme terima/tolak per bagian berfungsi.
Sprint 4	Smart Question Engine + Standar Bahasa (Language Compliance Layer)	AI mengajukan maksimal 3–5 pertanyaan sesuai algoritma skor kelengkapan (Bab 2.3); konsistensi istilah dan heading terverifikasi otomatis pada dokumen uji coba internal.
Sprint 5	Fitur pendukung: Daftar Isi otomatis, Sitasi (APA/Harvard), Placeholder Gambar, Tabel otomatis	TOC ter-generate otomatis dari heading; sitasi in-text dan daftar pustaka berfungsi untuk lima jenis sumber; placeholder gambar dengan caption otomatis berjalan sesuai alur Bab 2.8.
Sprint 6	Export PDF fidelity tinggi, Lampiran otomatis, hardening NFR, dan persiapan rilis Beta	Ekspor PDF konsisten visual dengan DOCX; backup dan versioning berjalan sesuai Bab 3.7–3.8; pengujian keamanan dasar (isolasi data antar pengguna) selesai; produk siap dirilis ke kelompok Beta terbatas.
 
10. EVALUASI KRITIS DAN PENUTUP
Bagian ini menyajikan evaluasi objektif terhadap konsep Docsly, disusun dari perspektif investor, CTO, dan CPO yang melakukan product review — bukan sekadar validasi ide, melainkan penilaian jujur terhadap kekuatan, kelemahan, dan risiko yang harus disadari tim sebelum eksekusi.
10.1 Kelebihan
●	Positioning yang jelas dan dapat dipertahankan (defensible) — framing "AI Office Agent" alih-alih "AI Writer" membedakan Docsly dari kompetitor generik dan menciptakan ekspektasi produk yang lebih spesifik: menyelesaikan pekerjaan, bukan sekadar menghasilkan teks.
●	Fokus pasar lokal yang jarang dilayani serius — kepatuhan PUEBI/EYD, format sitasi yang lazim dipakai institusi Indonesia, dan pemahaman format dokumen dinas/akademik lokal adalah celah nyata yang tidak dilayani optimal oleh produk AI berbahasa Inggris.
●	Cakupan fitur MVP yang disiplin — dokumen ini secara konsisten menolak fitur di luar alur dokumen (kolaborasi real-time, marketplace, integrasi kompleks), mengurangi risiko over-engineering pada tim kecil.
●	Model bisnis Freemium yang tidak predatori — pembatasan tier Free dirancang wajar, cocok untuk strategi akuisisi pengguna berbasis kepercayaan, khususnya penting di segmen mahasiswa yang sensitif terhadap produk yang terasa "mengunci" fitur secara agresif.
10.2 Kelemahan
●	Ketergantungan penuh pada kualitas model AI pihak ketiga — kualitas keluaran bahasa Indonesia formal sepenuhnya bergantung pada provider eksternal; perubahan kebijakan harga, ketersediaan, atau penurunan kualitas model di luar kendali tim dapat langsung berdampak pada pengalaman produk.
●	Kompleksitas teknis ekspor DOCX/PDF sering diremehkan — mencapai fidelity visual tinggi antara editor, DOCX, dan PDF (Bab 2.10) secara historis menjadi salah satu area yang paling memakan waktu pada produk sejenis; estimasi sprint pada Bab 9 berisiko meleset bila tim belum pernah menangani kompleksitas ini sebelumnya.
●	Belum ada mekanisme validasi kesediaan membayar — proyeksi BEP pada Bab 8.3 masih berbasis asumsi, bukan data pengguna riil; konversi Free-to-Premium 3–5% adalah benchmark umum, bukan jaminan untuk produk yang belum diuji ke pasar.
●	Risiko "kepatuhan bahasa" sulit diukur objektif secara otomatis — klaim tingkat kepatuhan PUEBI di atas 95% pada Bab 2.4 membutuhkan alat ukur/benchmark yang valid; tanpa itu, klaim kualitas bahasa berisiko bersifat subjektif dan sulit dipertanggungjawabkan ke pengguna maupun investor.
10.3 Risiko
Risiko	Dampak	Mitigasi Awal
Perubahan harga/kebijakan API model AI pihak ketiga	Biaya operasional melonjak tiba-tiba, mengganggu proyeksi BEP	Arsitektur model routing (Bab 4.2) dirancang agar tidak terkunci ke satu provider; abstraksi melalui AI SDK memudahkan migrasi provider bila diperlukan
Fidelity ekspor DOCX/PDF tidak tercapai sesuai target	Nilai inti produk (dokumen siap pakai) tidak terpenuhi, merusak kepercayaan pengguna sejak interaksi pertama	Alokasikan waktu uji fidelity lebih awal (mulai Sprint 2), bukan ditumpuk di akhir roadmap
Kompetitor besar (Microsoft, Google) menambah fitur serupa untuk konteks Indonesia	Keunggulan diferensiasi lokal Docsly tereduksi	Bergerak cepat membangun kedalaman fitur lokal (sitasi, format dinas) yang secara historis bukan prioritas produk global besar
Retensi pengguna rendah pasca mencoba sekali (dokumen selesai, tidak kembali)	Model bisnis langganan sulit tumbuh bila pemakaian bersifat sekali pakai per semester/proyek	Perluas kasus penggunaan berkelanjutan pasca-MVP (dokumen berulang: laporan bulanan, template institusi) agar retensi tidak bergantung pada satu momen tugas
10.4 Kompetitor
Peta kompetitif Docsly mencakup dua lapisan: kompetitor tidak langsung (AI generik serba guna) dan kompetitor langsung (AI terintegrasi dalam office suite).
●	ChatGPT dan asisten AI generik sejenis — unggul dalam fleksibilitas dan kekuatan model, namun tidak dirancang khusus untuk alur kerja dokumen terstruktur (tidak ada TOC otomatis, sitasi terkelola, atau kepatuhan PUEBI bawaan); pengguna harus menyalin-tempel manual ke editor lain.
●	Microsoft Word Copilot — terintegrasi kuat dengan ekosistem Office yang sudah mapan di institusi Indonesia, menjadi ancaman kompetitif serius jangka panjang, namun berbayar mahal per lisensi dan kurang fokus pada kepatuhan bahasa/format akademik-dinas lokal.
●	Notion AI — kuat dalam kolaborasi ruang kerja dan basis pengguna produktivitas, namun editor dokumennya tidak dirancang untuk kebutuhan format akademik/dinas ketat (page layout, header/footer, margin presisi) yang menjadi fokus Docsly.
●	Grammarly — sangat kuat di penyuntingan bahasa namun berbasis Bahasa Inggris dan tidak menyediakan pembuatan dokumen end-to-end; posisinya lebih sebagai pelengkap, bukan pengganti alur kerja penuh.
●	Google Docs (tanpa AI mendalam) — unggul kolaborasi dan familiaritas luas, namun kemampuan AI bawaannya belum sekuat asisten khusus dokumen berbahasa Indonesia.
10.5 Peluang
●	Ekspansi ke institusi (kampus, sekolah, instansi pemerintah) melalui lisensi B2B setelah validasi B2C, membuka jalur pendapatan yang lebih stabil dibanding langganan individual saja.
●	Template dokumen spesifik institusi (format skripsi kampus tertentu, format surat dinas instansi tertentu) sebagai diferensiasi lanjutan yang sulit ditiru kompetitor global.
●	Potensi kemitraan dengan platform akademik lokal (repositori kampus, jurnal nasional) untuk memperkuat kredibilitas di segmen peneliti dan dosen.
10.6 Rekomendasi Pengembangan Setelah MVP
●	Validasi kesediaan membayar secara nyata (bukan survei) sebelum menambah fitur Premium lanjutan — uji harga dengan kelompok pengguna nyata di awal Beta.
●	Bangun instrumen pengukuran kualitas bahasa yang lebih objektif (benchmark internal berbasis sampel dokumen nyata) untuk mendukung klaim kualitas dengan data, bukan asumsi.
●	Pertimbangkan integrasi Zotero (Bab 2.5) dan kolaborasi multi-pengguna secara real-time setelah fondasi AI Agent dan editor benar-benar stabil, karena keduanya menambah kompleksitas teknis signifikan yang tidak sepadan dieksekusi bersamaan dengan pembangunan fondasi MVP.
●	Kembangkan template khusus institusi sebagai lapisan monetisasi B2B setelah basis pengguna individual (B2C) cukup besar untuk menjadi bukti sosial (social proof) saat mendekati institusi.
●	Evaluasi ulang strategi model AI (Bab 4) setiap kuartal, mengingat lanskap harga dan kemampuan model AI berubah cepat — keputusan yang tepat hari ini berisiko usang dalam 6–12 bulan tanpa peninjauan berkala.
Secara keseluruhan, konsep Docsly memiliki fondasi ide yang kuat dan celah pasar yang nyata, namun keberhasilannya sangat bergantung pada eksekusi disiplin pada dua area tersulit: kualitas AI Agent yang benar-benar terasa seperti editor profesional (bukan sekadar generator teks), dan fidelity ekspor dokumen yang tidak mengecewakan pengguna pada momen paling kritis — saat dokumen mereka akan dikumpulkan, dikirim, atau dicetak. Dokumen spesifikasi ini memberikan kerangka kerja yang realistis untuk tim kecil, namun validasi pasar yang berkelanjutan tetap menjadi kunci utama, bukan hanya kepatuhan terhadap rencana di atas kertas.
11. SPESIFIKASI KONTEN PER HALAMAN
Bagian ini menjabarkan elemen-elemen yang wajib hadir pada setiap halaman utama Docsly, memastikan konsistensi UX dan tidak ada informasi kritikal yang terlewat. Setiap halaman dirancang dengan prinsip: minimal, fokus, dan jelas.
11.1 Halaman Login & Register
Halaman paling pertama yang dilihat pengguna baru atau yang sudah punya akun.
●	Logo Docsly di atas (bisa di-klik untuk kembali ke landing page).
●	Judul halaman yang ramah ("Selamat datang kembali" untuk login, "Yuk, mulai" untuk register).
●	Form dengan input field jelas: Email, Password, dan untuk register juga Nama + Dropdown Peran (Mahasiswa/Dosen/Pegawai Kantoran/Freelancer/UMKM/ASN).
●	Tombol primary "Masuk" atau "Buat Akun" yang full-width dan mudah diklik.
●	Opsi SSO (Single Sign-On) dengan Google — tombol secondary "Masuk/Daftar dengan Google".
●	Link "Lupa Password?" (login) atau "Sudah punya akun? Masuk di sini" (register) di bawah form.
●	Badge/stiker kecil opsional menunjukkan status ("Free", "Beta") atau jumlah pengguna aktif untuk social proof.
●	Footer minimalis: link Kebijakan Privasi, Syarat Layanan.
●	Tidak perlu sidebar, navigasi kompleks, atau konten marketing — fokus pada form masuk saja, bukan mengalihkan pengguna.
11.2 Halaman Home / Dashboard
Pintu utama setelah login, sesuai deskripsi layout Home yang sudah dibahas (Priority: AI Prompt Box → Quick Actions → Template → Continue Working → Recent Docs → Recent Conversations).
●	Top navigation: Logo Docsly (klik = kembali ke Home), Global Search, Notifikasi, Settings, Avatar User (dropdown profil).
●	Sidebar collapsible: Home, Dokumen Saya, Terbaru, Template, Sampah, Pengaturan.
●	Hero / AI Prompt Box besar — ELEMEN UTAMA — textarea luas dengan placeholder "Contoh: Buatkan proposal...", chip pintasan jenis dokumen (Skripsi, Laporan, Proposal), tombol Unggah Dokumen, tombol "Buat dengan AI ✨".
●	Quick Actions: grid ikon untuk Lanjutkan Menulis, Perbaiki Grammar, Ringkas, Buat Tabel, Tambah Sitasi, Rapikan Format, Buat Daftar Isi.
●	Template Section: scroll horizontal dengan card template Skripsi, Laporan, Proposal — bukan hero, melainkan "inspirasi" setelah AI Prompt Box.
●	Continue with AI: card dengan dokumen yang belum selesai, progress bar, tombol "Lanjutkan →".
●	Recent Documents: grid card dengan thumbnail, judul, tanggal edit, badge status, aksi hover.
●	Recent AI Conversations: list percakapan AI terbaru ("Rapihkan Bab 3", "Tambahkan Lampiran"), klik membuka sesi terkait.
●	Footer: indikator kuota AI "32 dari 60 permintaan bulan ini", link "Upgrade".
●	Tidak ada data table yang padat — semuanya card-based atau list ramah untuk kemudahan pemindaian visual.
11.3 Halaman Editor / Workspace
Halaman inti tempat pengguna menulis dokumen dan AI membantu (saat pengguna klik "Buat dengan AI" atau buka dokumen existing).
●	Top bar: Logo Docsly, nama dokumen (editable), indikator status simpan ("Tersimpan" dengan ikon centang), notifikasi, settings, user menu.
●	Sidebar kiri (collapsible): Outline otomatis — daftar heading dokumen bertingkat, item aktif di-highlight, klik langsung scroll ke bagian terkait.
●	Panel tengah (paling lebar, background putih): Document Editor dengan toolbar formatting (Heading, Bold/Italic, Bullet/Numbered, Table, Image, Link, Quote, Alignment) di atas, area penulisan di bawah — ini adalah canvas utama mirip Google Docs.
●	Panel kanan (collapsible, lebar ~320px): AI Agent panel — header "Tanya Docsly ✨", riwayat percakapan (chat bubble), saran AI (card dengan "Terima/Tolak"), input teks bawah dengan tombol kirim.
●	Status otomatis: autosave berjalan, tidak ada tombol "Simpan" yang memaksa — semuanya otomatis seperti Google Docs.
●	Toolbar tambahan: tombol Ekspor (DOCX/PDF), Riwayat Versi, Unggah File Baru, Settings dokumen (margin, page break, header/footer).
●	Tidak ada notifikasi yang mengganggu — semua notifikasi (autosave, AI selesai) ditampilkan as toast kecil di pojok bawah, bukan modal yang blocking.
11.4 Panel AI Agent (Sidebar Kanan di Editor)
Elemen penting untuk interaksi AI, harus accessible namun tidak overwhelming bagi pengguna baru.
●	Header: "Tanya Docsly ✨" dengan tombol minimize/close kecil di kanan atas.
●	Riwayat percakapan AI: chat bubble design — bubble pengguna di kanan (latar accent blue lembut), bubble AI di kiri (latar abu muda), timestamp kecil di atas setiap bubble.
●	Saran perbaikan dari AI: ditampilkan sebagai card dengan label "AI menyarankan:", teks saran singkat (max 2-3 baris), dua tombol kecil "Terima" (hijau) dan "Tolak" (abu), dan ikon X untuk menutup card.
●	Input teks area di bawah: placeholder "Minta AI membantu apa saja...", tombol kirim ikon di kanan, dan ikon paperclip untuk attach file/referensi.
●	Loading state: saat AI sedang menulis, tampilkan progress bertahap ("Menyusun Bab 2..."), progress bar tipis, tombol "Hentikan" untuk menghentikan proses.
●	Tidak ada animasi berlebihan atau ikon yang kacau — tetap minimal dan fokus pada teks percakapan.
11.5 Dokumen Hasil dari Docsly 
DOKUMENTASI DOCSLY — Panduan Lengkap & Tutorial
________________________________________
🎯 PENGENALAN DOCSLY
Apa itu Docsly?
Docsly adalah AI Office Agent berbasis web yang membantu Anda membuat, menyunting, dan merapikan dokumen profesional dengan mudah. Tidak peduli apakah Anda mahasiswa, guru, pegawai kantoran, atau pengusaha — Docsly siap membantu menyelesaikan pekerjaan dokumentasi Anda dengan AI yang pintar dan terpercaya.
Berbeda dari sekadar AI Writer atau AI Editor, Docsly memahami struktur dokumen lengkap (dari judul sampai lampiran), mengikuti standar penulisan Indonesia (PUEBI, EYD), dan menghasilkan dokumen yang siap dicetak atau dikirim ke institusi tanpa perbaikan ribet.
Tiga Cara Menggunakan Docsly
1.	Buat dari Nol — Ceritakan ide Anda, Docsly akan menyusun dokumen lengkap dengan struktur dan isi
2.	Lanjutkan Dokumen Lama — Unggah DOCX atau PDF yang sudah ada, Docsly bantu rapiin atau lanjutin penulisannya
3.	Perbaiki & Rapikan — Upload dokumen berantakan, Docsly perbaiki grammar, format, dan struktur dengan cepat
________________________________________
🚀 PANDUAN MEMULAI (GETTING STARTED)
Langkah 1: Login atau Daftar
1.	Kunjungi situs Docsly
2.	Klik "Masuk" jika sudah punya akun, atau "Daftar" jika baru
3.	Untuk daftar: isi email, password, nama, dan pilih peran Anda (Mahasiswa/Dosen/Pegawai Kantoran/Freelancer/UMKM/ASN)
4.	Lakukan verifikasi email
5.	Selesai! Anda siap membuat dokumen pertama
Tips: Anda bisa juga login pakai Google (lebih cepat)
________________________________________
Langkah 2: Pilih Cara Memulai di Home Dashboard
Saat login pertama kali, Anda akan masuk ke halaman Home/Dashboard. Di sini ada beberapa pilihan:
A. Buat Dokumen dari Nol
•	Klik kotak besar "Tanya Docsly ✨" di bagian atas
•	Ketik deskripsi dokumen yang ingin dibuat, contoh: "Buatkan proposal usaha katering untuk pengajuan pinjaman UMKM, sekitar 8 halaman"
•	Pilih jenis dokumen dari chip pintasan (Skripsi, Laporan, Proposal, Surat Dinas) jika cocok
•	Klik "Buat dengan AI ✨"
B. Unggah Dokumen Existing
•	Klik tombol "Unggah Dokumen" (biasanya ada di samping atau dalam AI Prompt Box)
•	Pilih file DOCX atau PDF dari komputer Anda (drag-and-drop juga bisa)
•	Docsly akan membaca dan mengonversi struktur dokumen Anda ke editor
•	Setelah selesai, Anda bisa langsung edit atau minta AI merapikannya
C. Mulai dari Template
•	Scroll ke bagian "Template" dan pilih Skripsi, Laporan, atau Proposal
•	Docsly akan tanya beberapa pertanyaan singkat (max 3-5 pertanyaan untuk konteks dokumen Anda)
•	Jawab pertanyaan, lalu Docsly akan generate outline/kerangka dokumen siap isi
________________________________________
Langkah 3: Jalankan Smart Question (Pertanyaan Cerdas)
Setelah Anda memberikan deskripsi atau upload dokumen, Docsly mungkin akan menanyakan beberapa hal penting yang kurang jelas. Ini adalah fitur Smart Question — AI tahu informasi apa saja yang diperlukan agar dokumen yang dihasilkan akurat dan sesuai kebutuhan Anda.
Contoh pertanyaan yang mungkin muncul:
•	"Dokumen ini untuk siapa? (investor/dosen/institusi internal)" → Untuk menyesuaikan tone formal
•	"Berapa estimasi panjang dokumen?" → Untuk mengatur kedalaman isi
•	"Ada deadline khusus?" → Opsional, hanya untuk konteks
Tip: Jawab sejujurnya dan selengkap mungkin. Anda juga bisa pilih "Lewati" jika ingin AI tebak sendiri.
________________________________________
📝 FITUR-FITUR UTAMA & CARA MENGGUNAKAN
1. DOCUMENT EDITOR — Area Menulis Utama
Saat dokumen terbuka, Anda akan melihat area putih besar di tengah — ini adalah Document Editor, tempat Anda menulis dan AI membantu.
Toolbar Formatting (di bagian atas)
Gunakan untuk memformat teks:
•	Heading — Buat judul bab (H1, H2, H3, H4) — Docsly akan otomatis membuat daftar isi dari heading ini
•	Bold/Italic/Underline — Format teks standar
•	Bullet/Numbered List — Buat list dengan atau tanpa nomor
•	Table — Sisipkan tabel (Docsly bisa bikin tabel otomatis juga)
•	Image — Unggah gambar (Docsly akan bikin caption otomatis)
•	Link — Tambah hyperlink
•	Quote/Blockquote — Buat kutipan atau penekanan teks
•	Alignment — Atur posisi teks (kiri, tengah, kanan, justify)
Tips Format:
•	Jangan takut menggunakan Heading — Docsly butuh itu untuk buat Daftar Isi otomatis
•	Untuk dokumen formal Indonesia, gunakan Justify bukan Left Align
•	Gambar harus punya caption — Docsly bisa bantu bikin caption otomatis
________________________________________
2. AI AGENT PANEL — Panel Kanan (Tanya Docsly)
Di sebelah kanan editor ada panel "Tanya Docsly ✨" — ini adalah jantung AI Anda. Gunakan untuk:
Membuat Konten Baru
•	Ketik: "Bikin pengenalan tentang Supply Chain Management" → Docsly menulis paragraf/section otomatis
•	Hasil akan tampil di editor dengan highlight kecil (bisa Anda terima atau ubah)
Menyunting Teks yang Sudah Ada
•	Highlight teks di editor, lalu di panel AI ketik: "Perbaiki grammar dan PUEBI" → Docsly perbaiki dan tampilkan saran
•	Klik "Terima" untuk pakai perubahan, atau "Tolak" untuk tidak pakai
Transformasi Teks
•	Ketik: "Ringkas paragraf ini menjadi 3 baris saja"
•	Atau: "Perpanjang penjelasan tentang metodologi dengan contoh"
•	Atau: "Ubah tone menjadi lebih formal"
Saran Otomatis dari AI
Docsly kadang akan memberikan saran perbaikan yang muncul sebagai card di panel AI:
•	"AI menyarankan perubahan pada paragraf 2" → Klik untuk lihat saran
•	Terima untuk pakai, Tolak untuk skip
Riwayat Percakapan
Semua instruksi dan respons AI tersimpan di panel ini — Anda bisa lihat apa yang sudah dikerjakan AI dan melanjutkan perintah baru.
________________________________________
3. OUTLINE / DAFTAR ISI PANEL — Panel Kiri
Panel kiri menampilkan struktur dokumen Anda secara otomatis — semua heading yang sudah Anda buat atau yang AI buat akan terdaftar di sini.
Cara Menggunakan:
•	Klik item di Outline untuk langsung melompat ke bagian itu di editor
•	Ini sangat membantu untuk dokumen panjang — tidak perlu scroll manual
•	Daftar Isi otomatis akan dibuat dari struktur ini (saat Anda export)
________________________________________
4. FITUR UTAMA — Quick Actions di Home Dashboard
Setelah membuat dokumen, di Home ada beberapa tombol pintasan (Quick Actions) untuk tugas umum:
•	Lanjutkan Menulis — Tanya AI melanjutkan penulisan dari bagian terakhir
•	Perbaiki Grammar & PUEBI — Scan seluruh dokumen, auto-fix kesalahan ejaan/tanda baca
•	Ringkas — Shorten dokumen menjadi lebih singkat
•	Buat Tabel — AI buatkan tabel dari data/uraian yang Anda ada
•	Tambah Sitasi — Kelola referensi dan auto-generate daftar pustaka
•	Rapikan Format — Standardisasi heading, spacing, dan numbering
•	Buat Daftar Isi — Generate TOC otomatis
Semua ini juga bisa dilakukan dengan mengetik perintah di panel AI Agent.
________________________________________
5. SITASI & DAFTAR PUSTAKA (APA/Harvard)
Untuk dokumen akademik, Docsly bantu manage referensi:
Cara Menambah Sumber:
1.	Di panel AI atau toolbar, klik "Tambah Sumber Referensi"
2.	Isi data: Judul, Penulis, Tahun, Penerbit (sesuai tipe: Buku/Jurnal/Website/Tesis)
3.	Pilih gaya sitasi: APA atau Harvard
4.	Docsly auto-generate preview format in-text citation
Cara Menggunakan Citasi dalam Dokumen:
•	Highlight kalimat di editor, klik "Tambah Sitasi" di panel AI
•	Docsly akan insert format kutipan otomatis (contoh: "Menurut Sutanto (2023)..." atau "(Sutanto, 2023)")
•	Semua sitasi otomatis terkumpul di "Daftar Pustaka" saat Anda export
Tips:
•	Gunakan copy-paste link/DOI jika Anda punya — Docsly bisa ekstrak metadata otomatis
•	Jangan mix APA dan Harvard dalam satu dokumen — pilih salah satu
•	Cek daftar pustaka sebelum export (Docsly rapi, tapi double-check tidak ada salah ketik)
________________________________________
6. UNGGAH GAMBAR & PLACEHOLDER
Docsly tidak membuat gambar sendiri — tapi membantu kelola placeholder dan caption.
Cara Kerja:
1.	Saat AI menulis, kalau perlu gambar (misal saat menjelaskan arsitektur), AI akan insert placeholder: [Gambar Arsitektur Sistem]
2.	Docsly otomatis buat caption: Gambar 2.1 Arsitektur Sistem Informasi
3.	Anda bisa klik placeholder → upload gambar asli dari file Anda
4.	Caption tetap, hanya gambar yang berganti
Tips:
•	Jangan hapus placeholder dulu sebelum siap upload gambar
•	Gambar harus JPG/PNG, max 5MB
•	Docsly otomatis resize gambar agar fit dengan lebar dokumen
________________________________________
7. EXPORT DOKUMEN — Download Hasil Akhir
Saat dokumen sudah siap, klik tombol "Ekspor" di toolbar:
Pilihan Format:
•	DOCX — File Word yang bisa dibuka & edit lagi di Microsoft Word/Google Docs
•	PDF — File final untuk dicetak atau dikirim (tidak bisa edit lagi)
Apa yang Sudah Siap:
•	Daftar Isi otomatis (jika ada heading)
•	Daftar Pustaka (jika ada sitasi)
•	Penomoran halaman
•	Header/Footer
•	Semua format (heading, spacing, margin) sesuai standar Indonesia
Kualitas Export:
•	Semua teks berwarna HITAM #000000, latar putih — cocok dicetak langsung
•	Format identik dengan tampilan di editor
•	Tidak ada watermark atau mark "dibuat Docsly" — dokumen 100% milik Anda
________________________________________
8. UPLOAD DOKUMEN LAMA
Punya dokumen lama (DOCX/PDF) yang ingin dilanjutkan atau dirapikan?
Cara Upload:
1.	Di Home, klik "Unggah Dokumen" atau saat di Editor pilih "File Baru"
2.	Pilih file DOCX atau PDF dari komputer (max 20MB, max 100 halaman untuk MVP)
3.	Docsly membaca struktur dokumen: 
o	DOCX: ekstrak heading, paragraf, tabel, gambar
o	PDF text: ekstrak teks (agak ribet, tapi coba dulu)
o	PDF scanned: jalankan OCR untuk baca gambar scan
Hasil Upload:
•	Struktur dokumen ditampilkan di editor
•	Anda bisa langsung edit manual atau minta AI merapikan
•	Contoh perintah: "Rapihkan skripsi saya, perbaiki format Bab 2-3" atau "Ganti tone menjadi lebih formal"
Tips Upload:
•	DOCX hasil Word langsung bisa di-convert, jarang error
•	PDF dari Word/LibreOffice bisa diekstrak, tapi hasil agak berantakan
•	PDF hasil scan butuh OCR — perlu waktu lebih lama (mungkin 1-2 menit)
•	Kalau ada bagian yang tidak terbaca, Docsly akan beri notifikasi "3 tabel kompleks perlu ditinjau manual"
________________________________________
9. RIWAYAT VERSI DOKUMEN
Tidak takut dokumen rusak — Docsly otomatis simpan versi lama Anda.
Cara Akses:
1.	Klik ikon "jam/history" di toolbar editor
2.	Lihat daftar versi dengan timestamp (kapan dibuat) dan deskripsi (apa yang berubah)
3.	Klik "Lihat" untuk preview versi lama, atau "Kembalikan ke Versi Ini" untuk restore
Pengguna Free: Riwayat disimpan 7 hari terakhir
Pengguna Premium: Riwayat lengkap selamanya
________________________________________
💡 TIPS & TRIK MENGGUNAKAN DOCSLY
1. Gunakan Heading Dengan Benar
Jangan takut pakai Heading H1, H2, H3 — Docsly butuh ini untuk:
•	Auto-generate Daftar Isi
•	Navigasi outline di panel kiri
•	Struktur dokumen yang rapi
Contoh struktur yang baik:
H1: BAB I PENDAHULUAN
  H2: 1.1 Latar Belakang
  H2: 1.2 Rumusan Masalah
  H2: 1.3 Tujuan Penelitian

H1: BAB II TINJAUAN PUSTAKA
  H2: 2.1 Definisi
  H2: 2.2 Penelitian Terdahulu
2. Kasih Konteks yang Jelas ke Docsly
Makin detail instruksi Anda, makin bagus hasil AI.
❌ Tidak bagus: "Tulis tentang AI"
✅ Bagus: "Tulis pengenalan tentang AI untuk skripsi teknik informatika, target pembaca adalah mahasiswa tahun 1, tone formal akademik, panjang 3 paragraf"
3. Manfaatkan Smart Question
Saat AI tanya, jawab dengan jujur. Ini membantu AI memahami dokumen Anda lebih baik.
Pertanyaan seperti:
•	"Apa target pembaca?" → Atur formalitas tone
•	"Jenis dokumen apa?" → Tentukan struktur yang cocok
•	"Ada deadline?" → Atur prioritas penulisan
4. Jangan Takut Tolak Saran AI
AI kadang bisa salah atau suggest yang tidak sesuai preferensi Anda. Klik "Tolak" dengan tenang, lalu:
•	Ketik ulang instruksi yang lebih detail
•	Atau edit manual di editor
•	Atau minta AI coba lagi dengan prompt berbeda
5. Gabung Grammar Check + PUEBI Check
Sebelum export, selalu minta Docsly:
1.	"Perbaiki seluruh grammar dokumen"
2.	"Check PUEBI dan EYD — perbaiki tanda baca, ejaan, dan istilah asing yang perlu italic"
Ini pastikan dokumen Anda lolos dari reviewer pedantic.
6. Organize dengan Workspace
Kalau punya banyak dokumen:
•	Buat Workspace untuk tiap project (Kuliah, Freelance, Kerja)
•	Organize dokumen per workspace — mudah cari nanti
•	Setiap workspace bisa punya preferensi berbeda (gaya bahasa, format sitasi)
7. Backup Penting — Export Berkala
Jangan hanya rely di server Docsly:
•	Export ke DOCX sesering mungkin (auto-save, tapi eksport jadi amanah)
•	Keep DOCX copy di hard drive atau cloud personal (Google Drive, OneDrive)
•	Kalau ada error, Anda punya backup yang aman
8. Gunakan Dark Mode Untuk Sesi Panjang
Saat menulis malam atau di ruangan gelap:
•	Settings → Tema → Dark Mode
•	UI jadi gelap, lebih enak mata
•	Dokumen tetap putih (sesuai standar cetak)
________________________________________
❓ FAQ — PERTANYAAN YANG SERING DIAJUKAN
Q: Apakah Docsly akan menambah watermark "Dibuat oleh Docsly" di dokumen?
A: Tidak! Dokumen 100% milik Anda. Tidak ada tanda/watermark Docsly. Siapa pun yang menerima dokumen Anda tidak akan tahu kalau dibuat pakai Docsly.
Q: Berapa lama AI Docsly menulis satu dokumen?
A: Tergantung panjang. Dokumen 2000 kata biasanya selesai 30-60 detik. Dokumen lebih panjang (5000+ kata) bisa 2-3 menit. Docsly akan kasih estimasi waktu saat proses dimulai.
Q: Bisakah saya edit dokumen sambil AI sedang menulis?
A: Sebaiknya tunggu AI selesai dulu (atau klik "Hentikan"). Kalau Anda edit bersamaan, ada risiko konflik. Setelah AI selesai, baru Anda edit atau refine hasil.
Q: Apakah Docsly support bahasa lain selain Indonesia?
A: Docsly di-optimize untuk Bahasa Indonesia (PUEBI, EYD, format institusi lokal). Support bahasa lain masih terbatas di MVP. Fokus kami ke bahasa Indonesia dulu.
Q: Kalau saya tidak setuju dengan hasil AI, bagaimana?
A:
1.	Klik "Tolak" — tidak menerima saran itu
2.	Edit manual di editor — tulis sendiri kalimat yang Anda suka
3.	Atau minta AI coba lagi dengan prompt berbeda: "Coba lagi dengan tone lebih santai" atau "Paraphrase dengan cara berbeda"
AI tidak main ambil-alih. Anda tetap kontrol 100%.
Q: Apa bedanya Docsly dengan Google Docs?
A:
•	Google Docs = Platform untuk menulis & collaborate, plus AI writing helper basic
•	Docsly = AI-first — AI bukan side feature, tapi core tool untuk menghasilkan dokumen lengkap dari awal hingga akhir (dengan struktur, format, sitasi otomatis)
Singkatnya: Google Docs untuk menulis fleksibel, Docsly untuk bikin dokumen formal cepat dengan bantuan AI.
Q: Gratis berapa lama?
A: Docsly Free selamanya gratis, tapi dengan batas 60 permintaan AI per bulan dan riwayat versi 7 hari. Untuk unlimited permintaan dan fitur lanjutan, upgrade ke Premium.
Q: Saya sudah Premium, apakah lebih cepat?
A: Premium tidak membuat AI lebih cepat (kecepatan dari server Docsly sama untuk semua). Tapi Premium mendapat prioritas antrean saat traffic tinggi, akses model AI lebih powerful, dan riwayat versi unlimited.
Q: Saya lupa password, bagaimana?
A: Klik "Lupa Password?" di halaman login, masukkan email Anda, cek email, dan ikuti link reset password.
________________________________________
📋 STANDAR FORMAT DOKUMEN INDONESIA DI DOCSLY
Docsly otomatis apply format sesuai standar universitas/institusi Indonesia. Berikut detail teknis:
Font & Ukuran
•	Font standar: Times New Roman 12pt (untuk isi), Arial 10-11pt (untuk header/footer)
•	Heading: Boleh lebih besar (14-16pt), tapi jangan sangat besar kecuali judul
•	Catatan kaki/footnote: 10pt
Spasi
•	Line spacing: 1.5 (bukan 2.0 atau single) — ini standar di kampus Indonesia
•	Spasi sebelum/sesudah paragraph: Kecil (6-12pt)
•	Spasi antar bab/heading: Agak lebih besar
Margin
•	Margin standar: Atas 4cm, Bawah 3cm, Kiri 4cm, Kanan 3cm (paling umum di universitas Indonesia)
•	Alternatif: 4-4-3-3 (sama semua sisi kiri kanan — tergantung kebijakan institusi Anda)
•	Atur di Settings Dokumen → Margin
Penomoran Halaman
•	Halaman awal (judul, abstrak, daftar isi): Nomor romawi kecil (i, ii, iii, iv...)
•	Halaman isi (bab pertama dst): Nomor angka biasa (1, 2, 3...) — biasanya dimulai dari BAB I
•	Docsly otomatis atur ini
Heading & Numbering
•	H1 (Bab): BAB I, BAB II, ... (atau bisa hanya "I Pendahuluan")
•	H2 (Sub-bab): 1.1, 1.2, ... (atau "I.1", tergantuk preferensi institusi)
•	H3 (Bagian dalam): 1.1.1, 1.1.2, ... (opsional untuk dokumen pendek)
•	Docsly otomatis numbering ini
Daftar Isi (TOC)
•	Posisi: Setelah Abstrak/Kata Pengantar
•	Format: Judul bab + nomor halaman
•	Docsly auto-generate dari heading struktur
Daftar Pustaka
•	Posisi: Setelah bab terakhir, sebelum lampiran
•	Format: Alfabetis (A-Z), sesuai gaya yang dipilih (APA atau Harvard)
•	Contoh APA: Sutanto, B. (2023). Judul buku. Nama Penerbit.
•	Contoh Harvard: Sutanto, B., 2023. Judul buku. Nama Penerbit.
Lampiran (jika ada)
•	Posisi: Paling akhir dokumen
•	Format: LAMPIRAN 1, LAMPIRAN 2, ... dengan numbering terpisah
•	Isi: Dokumen pendukung, data mentah, kode program, dst.
Tabel & Gambar
•	Caption gambar: Berada di BAWAH gambar, format "Gambar 2.1 Deskripsi..."
•	Caption tabel: Berada di ATAS tabel, format "Tabel 3.2 Deskripsi..."
•	Numbering: Per bab (Gambar 2.1 = Bab 2, gambar ke-1)
•	Ukuran: Tabel dan gambar harus pas dengan margin, jangan terlalu besar
Warna & Highlight
•	Teks dokumen: HITAM (#000000) saja — tidak ada teks berwarna
•	Highlight: Tidak boleh ada highlight/kotak-kotak berwarna pada isi dokumen
•	Jika ada saran AI: Gunakan track changes / margin bar (seperti Google Docs), bukan highlight warna
Bahasa & Gaya
•	PUEBI: Pedoman Umum Ejaan Bahasa Indonesia yang benar (termasuk tanda baca, ejaan baku)
•	EYD: Ejaan yang Disempurnakan (versi terbaru)
•	Istilah Asing: Memakai italic (contoh: supply chain, machine learning)
•	Istilah Baku Indonesia: Gunakan KBBI (jangan campur dengan istilah asal-asalan)
•	Tone: Formal, tidak familiar (tidak "lu-gua"), tidak terlalu panjang-lebar
________________________________________
🔧 TROUBLESHOOTING — Kalau Ada Masalah
Masalah: Dokumen tidak tersimpan
Solusi:
•	Cek koneksi internet (autosave butuh koneksi)
•	Tunggu indikator "Tersimpan" muncul (biasanya 3-5 detik)
•	Refresh halaman, dokumen tetap aman (disimpan di server)
•	Kalau masih hilang, hubungi support atau akses Riwayat Versi
Masalah: Upload DOCX tapi hasilnya berantakan
Solusi:
•	Pastikan file DOCX tidak corrupt (coba buka di Word dulu)
•	Kalau file terlalu kompleks (kolom ganda, table of contents bersarang, style aneh), Docsly hanya bisa extract sebagian
•	Alternatif: edit manual di Docsly, atau minta AI "rapikan struktur dokumen ini"
Masalah: AI hasilnya tidak sesuai yang diminta
Solusi:
•	Klik "Tolak" saran itu
•	Coba instruksi lebih detail: "Tulis pengenalan tentang AI, tone formal akademik untuk mahasiswa S1 teknik, panjang 2 paragraf"
•	Atau edit manual di editor sendiri
Masalah: Export PDF hasilnya blur atau salah format
Solusi:
•	Coba export ke DOCX dulu, buka di Word, verifikasi formatnya benar
•	Kalau DOCX oke tapi PDF blur, mungkin masalah render — coba export lagi
•	Kalau margin/spacing salah di PDF, atur di Settings Dokumen sebelum export
Masalah: Daftar Isi tidak otomatis generate
Solusi:
•	Pastikan Anda pakai Heading di toolbar, bukan hanya buat teks besar
•	Docsly hanya recognize Heading (H1, H2, H3), bukan teks biasa yang dibuat besar dengan font size
•	Setelah buat heading, tunggu beberapa detik, Outline di panel kiri akan update
•	Lalu saat export, Daftar Isi otomatis generate dari Outline itu
Masalah: Sitasi tidak muncul di daftar pustaka
Solusi:
•	Pastikan Anda sudah "Tambah Sumber Referensi" terlebih dulu (tidak hanya type nama penulis di dokumen)
•	Saat sisiipkan sitasi di dokumen, gunakan tombol "Tambah Sitasi" atau minta AI "sitasi sumber ini"
•	Export ke DOCX, daftar pustaka auto-generate dari sumber yang sudah ditambahkan
________________________________________
📞 HUBUNGI KAMI
Punya pertanyaan lain atau menemukan bug?
•	Email Support: support@docsly.space
•	Chat Support: Klik tombol chat di pojok kanan aplikasi (saat login)
•	FAQ Extended: Lihat halaman Help di aplikasi (biasanya di Settings → Bantuan)

11.6 Halaman Pengaturan (Settings)
Tempat pengguna mengontrol preferensi dan langganan.
●	Sidebar tab dalam konten: Profil, Preferensi Menulis, Langganan, Notifikasi, Privasi & Keamanan, Tema (Dark/Light).
●	Tab Profil: nama, email, foto profil, tombol "Ubah Password", tombol "Logout", tombol "Hapus Akun" (warna red/warning).
●	Tab Preferensi Menulis: pilihan Gaya Bahasa Default (Santai/Standar/Formal), Format Sitasi Default (APA/Harvard), Margin Standar, Font Default untuk dokumen baru.
●	Tab Langganan: menampilkan paket saat ini (Free/Premium), daftar fitur aktif, tanggal renewal (jika Premium), tombol "Upgrade" atau "Kelola Langganan" (ke payment gateway).
●	Tab Notifikasi: toggle untuk Email Notification (AI selesai bekerja, dokumen dibagikan), Push Notification (jika tersedia).
●	Tab Privasi & Keamanan: active sessions list (perangkat apa saja login), tombol "Logout dari semua perangkat", toggle "Backup otomatis", riwayat aktivitas singkat.
●	Tab Tema: pilihan toggle atau radio button untuk Dark Mode / Light Mode — untuk seluruh UI aplikasi (bukan konten dokumen yang tetap putih).
●	Tombol simpan di bawah setiap tab (atau auto-save seperti Google Settings).
11.7 Prinsip Konsistensi Antar Halaman
●	Semua halaman memakai top navigation yang sama (logo, search, notifikasi, user menu).
●	Sidebar navigasi utama konsisten di semua halaman (Home, Dokumen Saya, Terbaru, Template, Sampah, Pengaturan).
●	Warna brand (navy #1F3B57, blue accent #2E75B6) hanya di UI control — bukan di konten dokumen.
●	Font untuk UI (Inter/Plus Jakarta Sans) konsisten, untuk dokumen (Times New Roman/Arial sesuai pilihan pengguna) terpisah.
●	Spacing, radius, shadow mengikuti design system Bab 7 — tidak ada variasi seenaknya per halaman.
●	Loading state, error state, empty state punya visual konsisten di seluruh aplikasi.
●	Copywriting ramah, manusiawi, Bahasa Indonesia baku — tidak ada jargon teknis yang membingungkan pengguna awam.
 

