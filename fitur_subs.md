Ya, sangat bisa. Bahkan menurut saya **untuk Docsly, pendekatan rule-based lebih tepat dibanding AI** untuk fitur heading otomatis.

Alasannya sederhana:

* **Lebih cepat** (real-time, tanpa API).
* **Konsisten** (hasilnya sama setiap saat).
* **Gratis** (tidak ada biaya inference AI).
* **Mudah di-override** jika sistem salah.

Namun, saya tidak menyarankan hanya menggunakan satu rule sederhana seperti "baris pendek = heading". Itu akan menghasilkan banyak false positive.

Yang lebih baik adalah membuat **Hierarchical Heading Detection Engine**, yaitu sekumpulan aturan yang bekerja bersama untuk menghitung skor apakah suatu paragraf merupakan heading.

---

# Konsep Sistem

Alih-alih user memilih

```
Normal
Heading 1
Heading 2
Heading 3
```

User cukup mengetik

```
BAB I
PENDAHULUAN

Latar Belakang

Perkembangan AI...

Rumusan Masalah

...

1. Tujuan Penelitian

1.1 Tujuan Umum

1.1.1 Tujuan Khusus
```

Maka editor otomatis mengubah menjadi

```
Heading 1
Heading 2
Normal

Heading 2
Normal

Heading 2

Heading 3

Heading 4
```

Tanpa klik apa pun.

---

# Sistem membaca setiap paragraf

Misalnya setiap Enter menghasilkan ParagraphNode.

```
Paragraph {
   text
   bold
   italic
   alignment
   fontSize
   previousParagraph
   nextParagraph
}
```

Setiap paragraph langsung diproses.

```
detectHeading(paragraph)
```

---

# Rule 1 — Jumlah Kata

Heading hampir selalu pendek.

Misalnya

```
Latar Belakang
```

2 kata.

Sedangkan

```
Perkembangan teknologi AI telah membawa perubahan...
```

18 kata.

Rule:

```
if wordCount <= 8

score += 25
```

---

# Rule 2 — Tidak Diakhiri Titik

Heading biasanya tidak memakai titik.

```
Latar Belakang
```

✔

```
Latar Belakang.
```

✖

```
if !text.endsWith(".")
score +=10
```

---

# Rule 3 — Semua Huruf Kapital

Misalnya

```
BAB I

PENDAHULUAN

KESIMPULAN
```

Ini hampir pasti Heading.

```
isUpperCase(text)

score +=30
```

---

# Rule 4 — Mengandung Kata Kunci

Misalnya

```
BAB

BAB I

BAB II

DAFTAR ISI

KESIMPULAN

SARAN

ABSTRAK

PENDAHULUAN

LAMPIRAN

REFERENSI
```

Semuanya hampir pasti heading.

```
Heading Dictionary
```

```
BAB
BAB I
BAB II
PENDAHULUAN
ABSTRAK
LAMPIRAN
```

Kalau cocok

```
score +=50
```

---

# Rule 5 — Pola Nomor

Misalnya

```
1

1.1

1.1.1

2

2.3

3.4.5
```

Regex

```
^\d+(\.\d+)*$
```

atau

```
^\d+(\.\d+)*\s
```

Misalnya

```
1.1 Latar Belakang
```

langsung dianggap heading.

---

# Rule 6 — Tidak Terlalu Panjang

Misalnya

```
if character < 70

score +=20
```

Karena heading jarang lebih dari 70 karakter.

---

# Rule 7 — Tidak Diakhiri Koma

```
...
,
;
:
```

Jarang dipakai pada heading.

---

# Rule 8 — Ada Baris Kosong Sebelum

Misalnya

```
(paragraph kosong)

Rumusan Masalah
```

Kemungkinan heading naik.

```
score +=15
```

---

# Rule 9 — Setelah Heading Biasanya Ada Paragraf

Misalnya

```
Rumusan Masalah

Penelitian ini...
```

Kalau sesudahnya langsung paragraph panjang

```
score +=20
```

---

# Rule 10 — Bold

Kalau user menekan Ctrl+B

```
Latar Belakang
```

Kemungkinan heading semakin besar.

```
score +=15
```

---

# Rule 11 — Font Lebih Besar

Kalau user memperbesar font.

```
16pt
```

dibanding

```
12pt
```

Maka

```
score +=15
```

---

# Rule 12 — Tengah (Center)

```
BAB I
```

Biasanya Center.

```
score +=20
```

---

# Rule 13 — Tidak Ada Bullet

Kalau paragraph berupa

```
•
-
*
```

langsung jangan heading.

```
score -=40
```

---

# Rule 14 — Tidak Berakhir Dengan "dan"

Misalnya

```
Penggunaan AI dan
```

Jelas bukan heading.

---

# Rule 15 — Kalimat Terlalu Panjang

Kalau

```
word >12

score -=50
```

---

# Sistem Scoring

Misalnya

```
BAB I
```

Word count = 2

+25

Uppercase

+30

Dictionary

+50

Centered

+20

Total

125

Karena

```
>70
```

langsung

```
Heading 1
```

---

Misalnya

```
Latar Belakang
```

Word pendek

+25

Tidak titik

+10

Tidak panjang

+20

Total

55

Heading 2

---

Misalnya

```
Perkembangan AI telah berkembang sangat pesat...
```

Word banyak

0

Tidak uppercase

0

Karakter panjang

0

Total

10

Normal Paragraph

---

# Menentukan H1/H2/H3

Bukan hanya mendeteksi heading, tetapi juga levelnya.

Contoh aturan:

```
BAB I
BAB II
BAB III
```

↓

Heading 1

---

```
1 Pendahuluan

2 Metode

3 Hasil
```

↓

Heading 2

---

```
1.1

1.2

2.1
```

↓

Heading 3

---

```
1.1.1
```

↓

Heading 4

---

Atau gunakan struktur numerik:

| Pola           | Heading |
| -------------- | ------- |
| BAB I / BAB II | H1      |
| 1 Judul        | H2      |
| 1.1 Judul      | H3      |
| 1.1.1 Judul    | H4      |
| 1.1.1.1 Judul  | H5      |

---

# Auto Update TOC

Karena semua heading sudah diketahui,

Table of Contents tinggal membaca

```
editor.document
```

dan mencari

```
HeadingNode
```

Tidak perlu AI sama sekali.

---

# Jangan Langsung Mengubah Node

Satu hal yang saya sarankan untuk menghindari pengalaman pengguna yang membingungkan adalah **jangan langsung mengubah paragraf menjadi heading saat pengguna masih mengetik**. Misalnya, ketika pengguna baru mengetik "Latar Belakang", sistem belum tentu tahu apakah itu benar-benar heading atau hanya bagian dari kalimat yang akan dilanjutkan.

Pendekatan yang lebih stabil adalah:

* Selama pengguna masih mengetik pada baris tersebut, simpan status sebagai **"candidate heading"**.
* Jalankan deteksi ulang saat pengguna menekan **Enter**, berpindah ke baris lain (blur), atau berhenti mengetik selama sekitar 300–500 ms.
* Jika skor melewati ambang batas (misalnya ≥70), ubah paragraf menjadi Heading secara otomatis.
* Jika di kemudian hari pengguna mengedit baris tersebut hingga tidak lagi memenuhi aturan, turunkan kembali menjadi paragraf biasa.

Dengan cara ini, editor terasa lebih mulus dan menghindari perubahan format yang tiba-tiba di tengah proses mengetik.

## Rekomendasi untuk Docsly

Saya akan membangun sistem ini dalam tiga lapisan:

1. **Rule Engine (95% kasus)**: Menggunakan kombinasi aturan seperti panjang teks, pola penomoran, huruf kapital, kata kunci, posisi, dan konteks untuk mendeteksi heading secara cepat dan konsisten.
2. **Context Engine**: Melihat paragraf sebelum dan sesudah agar keputusan lebih akurat, misalnya memastikan heading diikuti oleh paragraf isi atau subheading lain.
3. **Manual Override**: Tetap sediakan pilihan H1–H6 di toolbar atau melalui shortcut. Rule engine tidak akan selalu benar untuk semua jenis dokumen (misalnya artikel kreatif, dokumen hukum, atau gaya penulisan yang tidak mengikuti pola umum), sehingga pengguna harus tetap bisa mengubah hasil deteksi jika diperlukan.

Dengan pendekatan ini, pengguna dapat menulis secara natural tanpa terus-menerus memilih level heading, tetapi tetap memiliki kontrol penuh saat sistem salah mendeteksi. Ini memberikan pengalaman yang jauh lebih mendekati aplikasi modern seperti Notion atau Google Docs, namun dengan otomatisasi yang lebih cerdas berbasis aturan tanpa ketergantungan pada AI.
