Berikut prompt/instruksi yang bisa langsung kamu berikan ke AI Agent Docsly. Saya buat agar AI Agent memahami bahwa **fungsi halaman workspace tidak boleh berubah**, hanya dilakukan **visual redesign agar konsisten dengan halaman Home/dashboard yang sudah lebih profesional**.

---

# Redesign Workspace Detail Page Docsly (UI/UX Improvement Only)

## Context

Halaman Workspace Docsly saat ini sudah memiliki fungsi yang benar, tetapi tampilan visualnya belum konsisten dengan halaman Home Dashboard.

Tujuan perubahan:

> Jangan mengubah logic, data, routing, atau fungsi yang sudah berjalan. Fokus hanya memperbaiki tampilan agar halaman Workspace memiliki design system yang sama dengan Home Dashboard Docsly: clean, profesional, elegan, minimal, dan terasa seperti aplikasi SaaS modern.

---

# Prinsip Utama Design

Gunakan halaman Home Dashboard sebagai **referensi utama design system**.

Workspace page harus memiliki:

* Konsistensi warna
* Konsistensi typography
* Konsistensi spacing
* Konsistensi button style
* Konsistensi card style
* Konsistensi sidebar
* Konsistensi header

Jangan membuat halaman Workspace memiliki style berbeda.

Saat ini terdapat perbedaan:

Home:

* lebih clean
* spacing lebih baik
* header lebih profesional
* button lebih rapi

Workspace:

* card terlalu polos
* border terlalu dominan
* terlalu banyak outline biru
* terlihat seperti prototype
* kurang memiliki hierarchy visual

---

# Target Visual

Buat Workspace Page terlihat seperti:

* Notion workspace
* Google Drive
* Linear Dashboard
* Vercel Dashboard

Dengan karakter:

* Minimal
* Modern
* Banyak whitespace yang terkontrol
* Tidak menggunakan dekorasi berlebihan
* Tidak terlihat seperti template AI

---

# 1. Pertahankan Struktur Halaman

Jangan ubah:

* sidebar
* workspace selector
* document data
* import DOCX
* create document
* document list
* delete action

Struktur tetap:

```
Sidebar

Top Header

Workspace Information

Action Button

Document Section

Document Cards
```

---

# 2. Perbaiki Header Workspace

Saat ini:

```
Tugas Kuliah Rafi ...
Kelola dan buat dokumen pintar Anda di sini.

                 Import DOCX
                 Buat Dokumen Baru
```

Masalah:

* hierarchy kurang kuat
* terlalu banyak ruang kosong
* button terlihat terpisah

Buat seperti dashboard profesional:

```
Tugas Kuliah Rafi                         [Import DOCX] [ + Buat Dokumen Baru ]

Kelola dan buat dokumen pintar Anda di sini.
```

---

## Workspace Title

Gunakan style seperti Home:

```
font-size:
32px

font-weight:
600 / 700

color:
primary text
```

Tambahkan menu:

```
Tugas Kuliah Rafi  ⋮
```

Untuk:

* Rename workspace
* Delete workspace
* Workspace settings

---

# 3. Button Style Harus Sama Dengan Home

Jangan menggunakan button default browser.

Gunakan design system Docsly:

## Primary Button

Untuk:

```
+ Buat Dokumen Baru
```

Style:

```
height:
40px

padding:
16px horizontal

border-radius:
8px

font-weight:
500

background:
primary dark

color:
white
```

---

## Secondary Button

Untuk:

```
Import DOCX
```

Style:

```
background:
white

border:
1px solid neutral

color:
dark text
```

Tidak menggunakan:

* shadow
* gradient
* outline biru

---

# 4. Document Section Redesign

Saat ini:

```
Dokumen Terbaru

[Card] [Card] [Card]
```

Masalah:

* card terlalu kosong
* border biru terlalu kuat
* preview area terlalu besar
* kurang informasi

---

Buat document card seperti SaaS file manager.

## Card Structure

```
+--------------------------------+

Document Icon


RMR


Last edited:
10 Jul 2026


Status:
Draft


                         ⋮


+--------------------------------+
```

---

Informasi card:

Tampilkan:

* Document name
* Last updated
* Status
* Document type
* Action menu

---

# 5. Hilangkan Border Biru Pada Card

Saat ini:

```
border: blue
```

Masalah:

Terlihat seperti:

* selected state
* focus state
* error state

Gunakan:

Option 1:

```
background:
white

border:
1px solid #E5E7EB
```

Option 2:

```
background:
white

border:none
```

dengan separator.

---

# 6. Jangan Gunakan Shadow Berat

Hindari:

```
box-shadow:
0 10px 20px
```

Jika membutuhkan:

Gunakan:

```
shadow-sm
```

atau gunakan border.

---

# 7. Document Preview Area

Saat ini:

```
[ area kosong besar ]
       icon
```

Terlihat seperti placeholder.

Perbaiki:

```
+----------------+

     📄


 Document Preview

+----------------+
```

Gunakan:

* background neutral
* icon lebih kecil
* tidak terlalu tinggi

Contoh:

```
height:
120px
```

bukan terlalu besar.

---

# 8. Card Hover Interaction

Tambahkan interaksi profesional:

Normal:

```
white card
```

Hover:

```
background sedikit berubah

cursor pointer

transition smooth
```

Jangan:

* border berubah menjadi biru terang
* animasi berlebihan
* scale besar

---

# 9. Layout Grid

Gunakan responsive grid.

Desktop:

```
4 column
```

Tablet:

```
2 column
```

Mobile:

```
1 column
```

Gunakan:

```
gap:
20px - 24px
```

---

# 10. Empty Space Management

Saat ini halaman terlalu kosong.

Jangan memenuhi dengan dekorasi.

Gunakan:

* container width
* section spacing

Contoh:

```
Main Content:

max-width:
1200px

padding:
32px
```

---

# 11. Typography Consistency

Gunakan typography Home.

## Section Title

```
Dokumen Terbaru

font-size:
20px

font-weight:
600
```

## Document Name

```
16px

font-weight:
600
```

## Metadata

```
13px

color:
gray
```

---

# 12. Document Menu

Tambahkan menu action menggunakan:

```
⋮
```

bukan icon delete langsung.

Menu:

```
Open

Rename

Duplicate

Delete
```

Karena aplikasi profesional biasanya tidak menaruh destructive action langsung.

---

# 13. Design System Rules

AI Agent wajib mengikuti:

## Color

Gunakan:

```
Primary:
Docsly brand color

Neutral:
gray scale

Background:
soft gray/white
```

Jangan:

* warna random
* border biru
* terlalu banyak accent color

---

## Radius

Gunakan konsisten:

```
8px
```

Jangan:

```
20px
30px
```

karena terlihat seperti template AI.

---

## Spacing

Gunakan:

```
8
12
16
24
32
40
```

Jangan nilai random.

---

# 14. Component Structure

Pisahkan component:

```
WorkspaceHeader

WorkspaceActions

DocumentSection

DocumentCard

DocumentGrid

DocumentMenu
```

Agar mudah dikembangkan.

---

# Final Instruction Untuk AI Agent

Redesign halaman Workspace Docsly agar:

1. Memiliki design language yang sama dengan Home Dashboard.
2. Jangan mengubah fungsi apapun.
3. Jangan mengubah data flow.
4. Hanya melakukan UI/UX improvement.
5. Hilangkan border biru yang terlihat seperti default/focus.
6. Jangan menggunakan shadow berlebihan.
7. Buat document card terlihat seperti aplikasi SaaS profesional.
8. Perbaiki typography, spacing, alignment, dan hierarchy.
9. Tambahkan grid/list structure yang rapi jika diperlukan.
10. Gunakan prinsip desain dari aplikasi profesional seperti Notion, Linear, Vercel, dan Google Drive.
11. Hasil akhir harus terlihat seperti produk yang sudah matang, bukan prototype atau desain hasil generate AI.

Target akhir:

> Ketika user masuk ke sebuah workspace, pengalaman visualnya harus terasa seperti membuka aplikasi produktivitas profesional: rapi, elegan, mudah dipahami, dan konsisten dengan seluruh ekosistem Docsly.
