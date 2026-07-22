Bug: Popup Sitasi Tertimpa oleh Tutorial Overlay

Saat ini terdapat bug pada sistem onboarding/tutorial.

Masalah

Ketika tutorial sedang aktif, lalu user membuka popup Sitasi & Daftar Pustaka, popup tersebut justru berada di belakang popup tutorial (onboarding).

Akibatnya:

Popup sitasi terpotong.
Tidak dapat digunakan.
Sebagian tampilannya tertutup.
User tidak dapat melihat seluruh isi popup.
Terlihat seperti bug layering (z-index).

Dari screenshot terlihat bahwa popup Sitasi & Daftar Pustaka muncul di bawah popup tutorial, padahal popup tersebut adalah komponen yang sedang dijelaskan.

Perilaku yang diharapkan

Selama tutorial berlangsung, apabila langkah yang sedang dijelaskan adalah Sitasi & Daftar Pustaka, maka:

Popup Sitasi harus tampil paling depan.
Popup Tutorial tetap berada di atas overlay, tetapi tidak boleh menutupi popup Sitasi.
Overlay hanya menggelapkan area di luar target.
Area target (termasuk popup Sitasi) tetap terang dan tidak terkena blur.

Urutan layer yang benar adalah:

Layer 5
Tooltip / Tutorial Popup

↓

Layer 4
Popup Sitasi & Daftar Pustaka

↓

Layer 3
Komponen yang sedang di-highlight

↓

Layer 2
Overlay Blur

↓

Layer 1
Editor

Bukan seperti sekarang:

Tutorial Popup

↓

Overlay

↓

Popup Sitasi
Mekanisme yang benar

Ketika tutorial mencapai langkah Sitasi & Daftar Pustaka, sistem harus melakukan urutan berikut:

User menekan tombol Sitasi.
Popup Sitasi dibuka terlebih dahulu.
Tunggu hingga popup selesai dirender.
Hitung posisi popup Sitasi.
Jadikan popup Sitasi sebagai target highlight.
Spotlight mengikuti ukuran popup Sitasi, bukan hanya tombol Sitasi.
Popup Tutorial muncul di samping popup Sitasi.
Popup Sitasi tetap berada di atas overlay.
Popup Sitasi tetap dapat diinteraksikan jika diperlukan.
Highlight yang benar

Tutorial jangan hanya menyorot tombol:

Sitasi & Daftar Pustaka

Karena tujuan pengguna adalah memahami isi popup.

Yang harus disorot adalah:

+--------------------------------------+
| AI Generate | Manual                 |
|--------------------------------------|
|                                      |
| Upload Dokumen                       |
|                                      |
| Penjelasan                           |
|                                      |
+--------------------------------------+

Artinya seluruh popup Sitasi menjadi spotlight.

Overlay

Overlay harus membuat lubang mengikuti ukuran popup Sitasi.

Contoh

████████████████████████████

████                ████████

████   Popup        ████████

████   Sitasi       ████████

████                ████████

████████████████████████████

Area putih adalah popup.

Area hitam adalah overlay.

Popup tidak boleh blur.

Z-Index

Pastikan layering mengikuti hirarki yang konsisten.

Contoh:

Tutorial Popup

z-index: 5000

↓

Popup Sitasi

z-index: 4900

↓

Highlighted Element

z-index: 4800

↓

Overlay

z-index: 4700

↓

Editor

z-index: auto

Jangan menggunakan nilai acak pada setiap komponen karena dapat menyebabkan konflik antar popup.

Posisi Tooltip

Tooltip tutorial tidak boleh menutupi popup Sitasi.

Posisinya harus otomatis memilih ruang kosong:

kanan popup
kiri popup
bawah popup
atas popup

sesuai ruang yang tersedia.

Fokus Tutorial

Selama langkah ini berlangsung:

Popup Sitasi tetap terbuka.
User dapat melihat seluruh isi popup.
Spotlight mengikuti popup Sitasi.
Overlay tidak menutupi popup.
Tooltip menjelaskan fungsi popup.
Setelah user menekan Mengerti, popup Sitasi ditutup (atau tetap terbuka jika memang diperlukan oleh alur berikutnya).
Yang harus diperiksa

Silakan audit seluruh sistem layering pada onboarding, karena bug ini kemungkinan juga akan terjadi pada popup lain seperti:

Import Dokumen
Export
Rename Workspace
Delete Workspace
AI Agent
Riwayat
Pengaturan

Pastikan seluruh modal, dropdown, popover, context menu, dan dialog yang menjadi target tutorial selalu berada di atas overlay dan dapat disorot dengan benar tanpa tertutup atau terkena efek blur. Dengan demikian, sistem onboarding akan konsisten di semua komponen interaktif dalam Docsly.