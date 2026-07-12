Berikut penjelasan layout dan prompt yang bisa langsung diberikan ke AI Agent coding kamu. Saya buat dengan konteks **Docsly dashboard** dan instruksi agar AI **tidak mengubah logic yang sudah ada**, hanya melakukan restrukturisasi **sidebar + navbar + profile section**.

---

# Penjelasan Layout Dashboard Docsly

## Gambaran Umum

Dashboard Docsly menggunakan struktur **fixed sidebar + top navbar + main content area**.

Layout terdiri dari 3 bagian utama:

1. **Sidebar kiri**

   - Berfungsi sebagai navigasi utama aplikasi.
   - Memiliki posisi fixed di sebelah kiri layar.
   - Tinggi sidebar mengikuti tinggi viewport (`100vh`).
   - Sidebar dapat di-collapse sehingga hanya menampilkan icon tanpa text.
   - Bagian bawah sidebar berisi informasi akun pengguna.

2. **Navbar atas**

   - Berada di bagian atas area konten utama.
   - Tidak menutupi sidebar.
   - Berisi:

     - Search bar.
     - Button upgrade.
     - Toggle dark/light mode.

3. **Main Content Area**

   - Area sebelah kanan sidebar.
   - Digunakan untuk menampilkan halaman dashboard yang sudah ada.
   - Jangan mengubah isi, routing, atau logic component yang sudah tersedia.
   - Hanya sesuaikan wrapper layout agar mengikuti struktur baru.

---

# Struktur Layout

```
-----------------------------------------------------
| Sidebar              | Navbar                      |
|                      |-----------------------------|
| Logo Docsly          |                             |
|                      |                             |
| Home                 |                             |
| Template             |      Main Content           |
| Panduan              |                             |
| Notifikasi           |                             |
| FAQ & Support        |                             |
|                      |                             |
|                      |                             |
|                      |                             |
|----------------------|                             |
| Profile User         |                             |
| Email                |                             |
| Status Account       |                             |
| Upgrade Button       |                             |
-----------------------------------------------------
```

---

# 1. Sidebar Design

## Ukuran dan Style

Sidebar:

- Width normal:

```
260px - 280px
```

- Width ketika collapse:

```
80px
```

- Background:

  - Gunakan warna yang clean dan modern.
  - Sesuaikan dengan theme Docsly.
  - Bisa menggunakan:

    - white background untuk light mode.
    - dark surface untuk dark mode.

- Border:

  - Tambahkan border kanan tipis agar memisahkan sidebar dan content.

Contoh:

```
Sidebar
width: 260px

Collapsed:
width: 80px
```

---

# Logo Section

Bagian paling atas sidebar:

```
LOGO DOCSLY
```

Ketika sidebar terbuka:

```
[Logo] DOCSLY
```

Ketika sidebar collapse:

```
[Logo Icon]
```

Logo harus tetap terlihat dan tidak hilang.

---

# Menu Sidebar

Menu utama:

## 1. Home

Icon:

- Dashboard/Home icon.
- Menggunakan icon library seperti:

  - Lucide React
  - Heroicons

Contoh:

```
🏠 Home
```

Fungsi:

- Menu utama menuju dashboard.

---

## 2. Template

Icon:

```
📄 Template
```

Gunakan icon:

- File
- Layout
- Document

Fungsi:

- Menampilkan kumpulan template document Docsly.

---

## 3. Panduan

Icon:

```
📚 Panduan
```

Gunakan icon:

- Book
- Graduation cap
- Help circle

Fungsi:

- Berisi tutorial penggunaan Docsly.

---

## 4. Notifikasi

Icon:

```
🔔 Notifikasi
```

Gunakan icon:

- Bell

Tambahkan badge jika ada notifikasi baru.

Contoh:

```
🔔 Notifikasi
      3
```

Badge:

- Bentuk kecil.
- Warna berbeda.
- Hanya muncul jika ada unread notification.

---

## 5. FAQ & Support

Icon:

```
💬 FAQ & Support
```

Gunakan icon:

- Message circle
- Help circle

Fungsi:

- Bantuan pengguna.
- FAQ.
- Contact support.

---

# Sidebar Active State

Menu yang sedang aktif harus memiliki indicator.

Contoh:

Normal:

```
🏠 Home
```

Active:

```
| 🏠 Home |
```

Style:

- Background berbeda.
- Border radius 8-12px.
- Text lebih bold.

Jangan gunakan warna terlalu mencolok.

---

# Sidebar Collapse Behavior

Tambahkan button collapse pada sidebar.

Posisi:

- Di bagian atas sidebar atau dekat logo.

Contoh:

Sidebar terbuka:

```
DOCSLY              <

Home
Template
Panduan
```

Sidebar tertutup:

```
DOCSLY              >

🏠
📄
📚
🔔
💬
```

Ketika collapse:

- Text menu hilang.
- Icon tetap muncul.
- Tooltip muncul ketika hover.

Contoh:

Hover icon:

```
🏠

(Home)
```

Animasi:

- Gunakan transition smooth.

Contoh:

```
width transition 300ms ease
```

---

# 2. User Profile Section Sidebar

Bagian paling bawah sidebar:

```
------------------

[Avatar]

Nama User
email@gmail.com

Status:
Free / Pro / Premium

[Upgrade Button]

------------------
```

---

## Profile Card

Ketika sidebar terbuka:

```
--------------------------------

   👤

   Ahmad Rafiansyah

   email@gmail.com

   Free Plan


   [ Upgrade Now ]

--------------------------------
```

---

Ketika sidebar collapse:

Hanya:

```
👤
```

Avatar tetap muncul.

---

# Profile Popup

Ketika profile diklik:

Jangan membuat logic baru.

Gunakan logic profile/logout yang sudah ada.

Pindahkan component tersebut ke profile section sidebar.

Popup berisi:

```
---------------------

Avatar

Nama User

Email


Account Status

Free Plan


---------------------

Settings

Logout

---------------------
```

---

Button Logout:

- Gunakan button existing dari project.
- Jangan membuat ulang fungsi logout.
- Hanya pindahkan UI/component ke popup profile.

---

# 3. Navbar Design

Navbar berada di atas main content.

Height:

```
64px - 72px
```

Position:

```
sticky top:0
```

---

Struktur:

```
------------------------------------------------

          Search        Upgrade     Theme

------------------------------------------------
```

---

# Search Bar

Posisi:

Sebelah kiri navbar.

Design:

```
[ 🔍 Search document... ]
```

Style:

- Rounded.
- Border soft.
- Tidak terlalu besar.

Width:

```
300px - 400px
```

Fungsi:

Gunakan logic search yang sudah ada jika tersedia.

Jangan membuat search baru.

---

# Upgrade Button

Posisi:

Sebelah kanan search.

Design harus terlihat premium.

Contoh:

```
✨ Upgrade
```

Style:

- Gradient ringan.
- Rounded button.
- Icon premium.

Tujuan:

Mengajak user Free upgrade ke Pro/Premium.

Contoh:

```
[ ✨ Upgrade Plan ]
```

---

# Theme Toggle

Button dark/light mode.

Design:

```
☀️ / 🌙
```

Gunakan:

- Existing theme logic.
- Jangan membuat sistem theme baru.

Style:

Circle button.

Contoh:

```
( 🌙 )
```

---

# Responsive Behavior

Desktop:

```
Sidebar + Navbar + Content
```

Tablet:

Sidebar tetap collapse.

Mobile:

Sidebar berubah menjadi:

- Drawer.
- Bisa dibuka dengan hamburger button.

---

# Instruksi Implementasi Untuk AI Agent

Gunakan prompt berikut:

---

```
Saya ingin melakukan redesign layout dashboard Docsly.

PENTING:
Jangan mengubah logic, API, routing, state management, atau component yang sudah berjalan.

Yang perlu dilakukan hanya mengubah struktur layout:
- Sidebar
- Navbar
- Profile section


Gunakan struktur dashboard baru:

1. Fixed Sidebar kiri.
2. Navbar atas pada area content.
3. Main content tetap menggunakan component/page yang sudah ada.


Sidebar:

Buat sidebar dengan width:
- expanded: 260px
- collapsed: 80px

Sidebar harus memiliki fitur collapse.

Ketika expanded:
- tampilkan logo Docsly
- tampilkan icon + text menu

Menu:

Home
Template
Panduan
Notifikasi
FAQ & Support


Gunakan icon profesional menggunakan Lucide React atau icon library yang sudah ada.


Ketika sidebar collapse:
- hilangkan text
- hanya tampilkan icon
- tambahkan tooltip saat hover.


Tambahkan active state pada menu yang sedang aktif.


Bagian bawah sidebar:

Pindahkan profile user yang sudah ada ke sidebar.

Jangan membuat logic baru.

Gunakan component profile/logout yang sudah tersedia.

Ketika profile diklik:
tampilkan popup/dropdown berisi:

- Avatar
- Nama user
- Email
- Status akun (Free/Pro/Premium)
- Settings jika sudah ada
- Logout button


Navbar:

Buat navbar fixed/sticky.

Isi navbar:

Kiri:
Search bar document.

Kanan:
- Upgrade button
- Dark/light mode toggle


Upgrade button harus memiliki design premium:
- rounded
- icon premium
- modern SaaS style


Theme button:
gunakan logic theme yang sudah ada.


Pertahankan seluruh isi dashboard dan halaman lain.

Jangan mengubah:
- editor
- document system
- AI feature
- database
- API
- authentication


Fokus hanya membuat layout dashboard terlihat seperti aplikasi SaaS profesional seperti Notion, Linear, atau Google Workspace.

Pastikan:
- responsive
- smooth animation ketika sidebar collapse
- clean spacing
- modern typography
- consistent padding.


```

---

Menurut saya layout ini sudah cukup ideal untuk Docsly karena jumlah menu tidak terlalu banyak. Namun satu hal yang perlu diperhatikan: **jangan terlalu banyak memasukkan fitur di sidebar pada tahap awal**. Untuk produk seperti Docsly, sidebar yang sedikit justru terasa lebih premium karena user fokus ke core activity (membuat dan mengelola dokumen).
