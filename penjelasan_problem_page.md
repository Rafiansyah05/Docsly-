Masalah yang terjadi pada layout saat ini bukan hanya masalah jarak, tetapi **struktur positioning antara navbar, toolbar, dan workspace belum memiliki hierarchy yang benar**.

Dari gambar terlihat ada 2 navbar:

1. **Global Navbar**

   - Search documents
   - Button Upgrade
   - Theme toggle

2. **Document Navbar**

   - Tombol Kembali
   - Nama dokumen
   - Tools (Tabel, Gambar, Daftar Isi, Penomoran Halaman, Sitasi, Riwayat)
   - Status tersimpan
   - Export PDF/DOCX

Saat ini keduanya memang fixed, tetapi kemungkinan dibuat sebagai **dua elemen terpisah dengan posisi fixed masing-masing**, sehingga:

- jarak antar navbar terlalu besar
- area bawah navbar tidak dihitung dengan benar
- content editor masuk ke belakang navbar
- toolbar menutupi bagian atas dokumen

Yang diinginkan adalah membuat keduanya menjadi **satu header frame aplikasi**.

Berikan prompt berikut ke AI Agent:

---

```text
Saya ingin memperbaiki struktur navbar pada halaman Document Editor Docsly.

Jangan mengubah logic apapun.
Jangan mengubah editor, AI assistant, export, document rendering, atau fitur lainnya.

Fokus hanya memperbaiki:
- struktur navbar
- spacing
- fixed positioning
- layout offset


==================================================
MASALAH SAAT INI
==================================================


Saat ini terdapat dua navbar:

1. Global Navbar:
- Search documents
- Upgrade button
- Theme toggle


2. Document Navbar:
- Tombol kembali
- Nama document
- Tools document
- Export PDF
- Export DOCX


Namun implementasi sekarang menyebabkan:

- Jarak antara navbar pertama dan kedua terlalu besar.
- Navbar terlihat seperti dua bagian terpisah.
- Beberapa component editor tertutup di belakang navbar.
- Area document mulai terlalu tinggi atau masuk ke bawah navbar.
- Fixed positioning tidak menghitung tinggi navbar secara keseluruhan.


==================================================
PERUBAHAN YANG DIINGINKAN
==================================================


Gabungkan kedua navbar menjadi SATU FRAME HEADER.


Bukan berarti semua isi menjadi satu baris.


Tetapi buat satu container header:


-----------------------------------------------
| GLOBAL NAVBAR                                |
| Search                     Upgrade Theme      |
-----------------------------------------------
| DOCUMENT NAVBAR                             |
| Kembali | Document | Tools | Export          |
-----------------------------------------------


Kedua navbar berada dalam satu parent container.


Contoh:


<AppHeader>

    <GlobalNavbar />

    <DocumentNavbar />

</AppHeader>



==================================================
APP HEADER POSITION
==================================================


Parent header harus menjadi fixed.


Gunakan:


position:

fixed


top:

0


left:

0


right:

0


z-index:

100



Background:

white



Border bawah:


1px solid #E2E8F0



Jangan membuat masing-masing navbar memiliki fixed sendiri.


SALAH:


GlobalNavbar:
fixed


DocumentNavbar:
fixed



BENAR:


AppHeader:
fixed


GlobalNavbar:
relative


DocumentNavbar:
relative



==================================================
TINGGI HEADER
==================================================


Atur tinggi agar compact.


Global Navbar:


height:

52px - 56px



Document Navbar:


height:

44px - 48px



Total:


Header:

96px - 104px



Jangan memberikan jarak kosong besar.


==================================================
SPACING ANTAR NAVBAR
==================================================


Jarak antara Global Navbar dan Document Navbar:


0px



Jangan menggunakan margin besar.


Keduanya harus terlihat seperti satu toolbar aplikasi.


Contoh:


Navbar atas:

height 56px


langsung dilanjutkan:


Navbar document:

height 48px



==================================================
GLOBAL NAVBAR DESIGN
==================================================


Tetap berada paling atas.


Isi:


Kiri:

Search documents


Kanan:

Upgrade button

Theme toggle



Padding:


horizontal:

20px - 24px



==================================================
DOCUMENT NAVBAR DESIGN
==================================================


Berada tepat di bawah global navbar.


Tidak boleh floating.


Layout:


Kiri:


Back button

separator

Document name



Tengah:


Document tools


Kanan:


Save status

Export PDF

Export DOCX



Height:


48px



Padding:


20px - 24px



==================================================
CONTENT OFFSET
==================================================


PENTING:


Karena header sekarang fixed:


Workspace HARUS memiliki padding-top sesuai tinggi header.


Jangan hanya:


padding-top: 50px



Gunakan:


padding-top:

tinggi AppHeader



Contoh:


Jika:


Global Navbar:

56px


Document Navbar:

48px



Maka:


content-wrapper:

padding-top:

104px



Sehingga:


Document page mulai tepat di bawah navbar.


Tidak tertutup.


==================================================
EDITOR TOOLBAR
==================================================


Toolbar editor:


Font

Size

Heading

Bold

Italic

Alignment


Jangan berada di belakang navbar.


Ada dua opsi:


Opsi terbaik:

Masukkan toolbar editor sebagai bagian dari workspace.


Struktur:


Fixed Header

↓

Editor Toolbar

↓

Document Area



Atau jika toolbar ingin fixed:


Hitung juga tinggi toolbar.


Contoh:


Header:

104px


Toolbar:

48px



Maka:


Document area mulai:


152px



==================================================
WORKSPACE STRUCTURE
==================================================


Gunakan struktur:


<App>


    <FixedHeader>

        <GlobalNavbar/>

        <DocumentNavbar/>

    </FixedHeader>



    <Workspace>


        <EditorArea>

             <Toolbar/>

             <ScrollablePaper/>

        </EditorArea>



        <AISidebar/>


    </Workspace>



    <Footer/>


</App>



==================================================
SCROLLING BEHAVIOR
==================================================


Tetap gunakan konsep:


Body:


overflow:hidden



Yang scroll hanya:


1.
Document paper


2.
AI chat message



Header tidak pernah bergerak.


Footer tidak pernah bergerak.



==================================================
HASIL AKHIR YANG DIINGINKAN
==================================================


Ketika user membuka dokumen:


Bagian atas:


[ Search | Upgrade | Theme ]

[ Back | Document Name | Tools | Export ]

[ Editor Toolbar ]

[ Paper Document ]

[ AI Sidebar ]



Semua terlihat rapi.


Tidak ada:


- content tertutup navbar
- toolbar masuk ke belakang header
- jarak kosong besar
- navbar terpisah


Layout harus terasa seperti:

- Google Docs
- Microsoft Word Online
- Notion Editor


Bukan seperti halaman website biasa.
```

---

Tambahan saran desain dari saya: untuk editor seperti Docsly, **jangan buat 3 layer fixed terpisah** (navbar + document navbar + toolbar). Itu sering menyebabkan bug overlap.

Struktur yang paling stabil:

```
Fixed App Header
 ├── Main Navbar (56px)
 └── Document Navbar (48px)

Workspace
 ├── Editor Toolbar (48px)
 ├── Paper Scroll Area
 └── AI Sidebar

Fixed Footer
```

Jadi browser hanya mengenal:

- Header tetap
- Workspace fleksibel
- Footer tetap

Ini akan jauh lebih mudah dirawat ketika nanti Docsly berkembang dengan fitur seperti komentar, version history, collaboration, dan AI tools.
