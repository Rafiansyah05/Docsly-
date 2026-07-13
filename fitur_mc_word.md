# Sistem Pricing & Subscription Docsly

## 1. Konsep Umum Sistem Akun Docsly

Docsly menggunakan model **Freemium + Subscription**, di mana setiap pengguna memiliki tingkatan akun berdasarkan akses fitur, batas penggunaan AI, dan kapasitas penyimpanan.

Struktur akun terdiri dari:

1. **Free Trial** → masa percobaan seluruh fitur Docsly
2. **Free** → akun gratis setelah masa trial berakhir
3. **Pro** → pengguna aktif yang membutuhkan kemampuan AI lebih besar
4. **Premium** → pengguna berat dengan kebutuhan dokumen kompleks

Tujuan sistem ini:

* Memberikan kesempatan pengguna memahami value Docsly sebelum membayar.
* Mengontrol biaya operasional AI.
* Memberikan jalur upgrade yang jelas.
* Memastikan pengguna gratis tetap dapat menggunakan Docsly dengan batas tertentu.

---

# 1. Free Trial (30 Hari)

## Deskripsi

Free Trial merupakan status awal setiap pengguna baru setelah melakukan registrasi.

Pada tahap ini pengguna dapat mencoba **seluruh kemampuan Docsly tanpa pembatasan fitur**, sehingga pengguna dapat merasakan pengalaman penuh menggunakan AI Workspace Docsly.

Free Trial bukan paket berlangganan, melainkan periode evaluasi produk.

---

## Benefit Free Trial

### Document Editor

Pengguna mendapatkan akses penuh:

* Membuat dokumen baru
* Menggunakan seluruh fitur editor
* Formatting dokumen
* Template dokumen
* Export PDF
* Export DOCX
* Pengaturan halaman
* Layout dokumen

---

### AI Workspace

Pengguna dapat menggunakan seluruh kemampuan AI:

* AI Writing Assistant
* Generate konten
* Rewrite teks
* Improve writing
* Summarize dokumen
* Expand paragraf
* Generate struktur dokumen
* AI editing berdasarkan konteks dokumen

---

### Document Intelligence

Pengguna dapat:

* Upload dokumen PDF
* Membaca isi dokumen menggunakan AI
* Bertanya mengenai isi dokumen
* Mendapatkan insight dari dokumen

Contoh:

> "Jelaskan metodologi penelitian dari jurnal ini"

---

### Citation Manager

Pengguna dapat mencoba:

* Automatic citation
* Generate bibliography
* Format APA
* Format Harvard
* Reference management

---

### Template Library

Akses seluruh template:

* Skripsi
* Proposal penelitian
* Makalah
* Laporan
* Proposal bisnis
* CV
* Surat lamaran kerja

---

## Limit Free Trial

Walaupun semua fitur terbuka, penggunaan AI tetap memiliki batas agar biaya operasional dapat dikontrol.

Sistem menggunakan **AI Credit System**.

### Default:

**50 AI Credit**

Refresh:

**Setiap 7 jam setelah credit habis**

---

Contoh:

Pengguna mendapatkan:

```
AI Credit:
50
```

Kemudian menggunakan:

```
Generate 1 halaman:
10 credit
```

Sisa:

```
40 credit
```

Jika credit habis pada pukul:

```
10:00
```

Maka:

```
Reset:
17:00
```

Credit kembali:

```
50 credit
```

---

## Prinsip Refresh Credit

Sistem tidak menggunakan reset waktu global.

Bukan:

```
00:00 reset
07:00 reset
14:00 reset
```

Tetapi menggunakan:

```
Waktu penggunaan terakhir ketika credit habis
+
7 jam
```

Hal ini membuat setiap user memiliki siklus penggunaan sendiri dan mencegah penyalahgunaan limit.

---

# 2. Free Account

## Deskripsi

Setelah masa Free Trial selesai, akun otomatis berubah menjadi Free.

Pengguna tetap dapat menggunakan Docsly, tetapi dengan fitur dan penggunaan AI yang lebih terbatas.

Tujuan:

* Mempertahankan pengguna
* Memberikan pengalaman dasar
* Mendorong upgrade ke Pro/Premium

---

# Benefit Free

## Document Editor

Tetap mendapatkan:

✓ Membuat dokumen
✓ Editing dokumen
✓ Formatting dasar
✓ Export PDF

---

## AI Assistant

Limit:

```
10 AI Credit / hari
```

Refresh:

```
24 jam
```

Digunakan untuk:

* Rewrite sederhana
* Perbaikan kalimat
* Bantuan penulisan ringan

---

## Template

Akses:

* Template dokumen sederhana
* Template laporan
* Template surat

---

## Storage

```
100 MB
```

---

# Batasan Free

Tidak mendapatkan:

❌ AI Agent penuh

❌ Analisis PDF menggunakan AI

❌ Citation Manager

❌ Bibliography otomatis

❌ Template premium

❌ Pemrosesan dokumen panjang

---

# 3. Pro Plan

## Harga

Rekomendasi:

# Rp39.000 / bulan

Target pengguna:

* Mahasiswa
* Pelajar
* Pengguna aktif Docsly

Pro menjadi paket utama karena memberikan keseimbangan antara harga dan kemampuan.

---

# Benefit Pro

## Semua fitur Free +

---

## AI Workspace

Mendapatkan:

✓ AI Agent

✓ Context-aware editing

✓ Generate dokumen

✓ Rewrite kompleks

✓ Summarization

Limit:

```
500 AI Credit / bulan
```

---

## Document Intelligence

Dapat:

✓ Upload PDF

✓ AI membaca dokumen

✓ Tanya jawab dokumen

✓ Analisis isi dokumen

---

## Citation Manager

Mendapat:

✓ Automatic citation

✓ Bibliography generator

✓ APA

✓ Harvard

Limit:

```
50 citation / bulan
```

---

## Template

Akses:

✓ Semua template Docsly

---

## Storage

```
2 GB
```

---

# 4. Premium Plan

## Harga

Rekomendasi:

# Rp89.000 / bulan

Target:

* Mahasiswa tingkat akhir
* Peneliti
* Profesional
* Pengguna dengan dokumen besar

---

# Benefit Premium

Semua fitur Pro +

---

## AI Usage Besar

Limit:

```
1500 AI Credit / bulan
```

---

## Advanced AI Agent

Kemampuan:

* Memproses dokumen panjang
* Analisis kompleks
* Generate dokumen besar
* Editing multi bagian

---

## Large Document Processing

Pro:

```
50 halaman
```

Premium:

```
300 halaman
```

---

## Citation Manager Advanced

✓ Unlimited citation

✓ Reference organization

✓ Advanced bibliography

---

## Priority Processing

Ketika server ramai:

```
Premium → diproses lebih dahulu
Pro → normal queue
Free → standard queue
```

---

## Storage

```
20 GB
```

---

# Perbandingan Paket

| Fitur           | Free Trial | Free      | Pro          | Premium      |
| --------------- | ---------- | --------- | ------------ | ------------ |
| Durasi          | 30 hari    | Selamanya | Berlangganan | Berlangganan |
| Editor          | ✓          | ✓         | ✓            | ✓            |
| Export PDF      | ✓          | ✓         | ✓            | ✓            |
| Export DOCX     | ✓          | Terbatas  | ✓            | ✓            |
| Semua Template  | ✓          | ❌         | ✓            | ✓            |
| AI Agent        | ✓          | ❌         | ✓            | ✓ Advanced   |
| PDF AI Analysis | ✓          | ❌         | ✓            | ✓            |
| Citation        | ✓          | ❌         | 50/bln       | Unlimited    |
| AI Credit       | 50/7 jam   | 10/hari   | 500/bln      | 1500/bln     |
| Storage         | 2GB        | 100MB     | 2GB          | 20GB         |
| Dokumen Panjang | ✓          | ❌         | 50 halaman   | 300 halaman  |
| Priority AI     | ❌          | ❌         | ❌            | ✓            |

---

# Flow Sistem Subscription Docsly

## 1. User Registrasi

```
User Signup
      |
      ↓
Create Account
      |
      ↓
Status:
FREE_TRIAL
      |
      ↓
Trial Start Date dicatat
```

---

# 2. Penggunaan Masa Trial

```
User menggunakan Docsly
          |
          ↓
Request AI
          |
          ↓
Cek AI Credit
          |
          ↓
Credit tersedia?
          |
     YES
          |
          ↓
Proses AI
          |
          ↓
Kurangi Credit
```

---

# 3. Sistem Credit Refresh

```
Credit = 0
      |
      ↓
Catat waktu habis
      |
      ↓
Tambahkan timer 7 jam
      |
      ↓
Timer selesai
      |
      ↓
Credit kembali
```

---

# 4. Trial Berakhir

Sistem melakukan pengecekan:

```
Current Date - Trial Start Date >= 30 hari
```

Jika:

```
TRUE
```

Maka:

```
FREE_TRIAL
       ↓
FREE
```

---

# 5. Upgrade Subscription

User memilih:

```
Upgrade Pro
atau
Upgrade Premium
```

Kemudian:

```
Payment Success
        |
        ↓
Update Subscription Status
        |
        ↓
Aktifkan Benefit Paket
```

---

# 6. Downgrade / Subscription Expired

Jika pembayaran berhenti:

```
Subscription Expired
        |
        ↓
Status kembali FREE
```

Dokumen pengguna tetap aman, tetapi akses fitur premium dikurangi.

---

# Kesimpulan Sistem

Model pricing Docsly ini dirancang dengan prinsip:

* **Free Trial memberikan pengalaman penuh agar user memahami value.**
* **Free menjaga pengguna tetap menggunakan Docsly.**
* **Pro menjadi paket utama dengan harga terjangkau untuk mahasiswa.**
* **Premium menangani pengguna berat yang membutuhkan AI lebih besar.**
* **AI Credit System menjaga biaya operasional tetap terkendali.**

Dengan struktur ini, Docsly dapat melakukan validasi pasar terlebih dahulu tanpa membebani biaya AI secara tidak terkendali, sambil tetap memberikan pengalaman produk yang kuat pada pengguna baru.
