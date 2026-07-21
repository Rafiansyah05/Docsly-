Problem 1
Floating Toolbar Masih Tertutup oleh Code Block

Dari screenshot terlihat bahwa popup tiga tombol (Left, Center, Right) masih berada di belakang Code Block.

Secara visual sekarang seperti ini.

Layer saat ini

Code Block
████████████████████████

Floating Toolbar
    ███

Hasil:
Toolbar tertutup

Artinya toolbar masih menjadi bagian dari area editor atau masih berada pada layer yang sama dengan node dokumen.

Kemungkinan implementasinya masih seperti berikut.

Editor

├── Paragraph
├── Image
│    └── Floating Toolbar
├── Code Block

Karena toolbar adalah child dari node editor, maka ketika ada Code Block yang memiliki stacking context lebih tinggi, toolbar akan ikut tertutup.

Padahal Microsoft Word tidak bekerja seperti itu.

Cara Microsoft Word

Di Microsoft Word, toolbar kecil yang muncul ketika gambar dipilih bukan bagian dari gambar.

Toolbar berada pada UI Overlay Layer.

Secara konsep.

Window

├── Document Layer
│      Paragraph
│      Heading
│      Table
│      Image
│      Code Block
│
├── Selection Layer
│      Resize Handle
│
├── Floating Toolbar Layer
│      Align Left
│      Align Center
│      Align Right
│
└── Modal Layer

Perhatikan.

Toolbar berada di luar document tree.

Karena itu tidak pernah tertutup oleh apa pun.

Yang Harus Diubah

Jangan lagi membuat toolbar seperti ini.

<ImageNode>

   FloatingToolbar

</ImageNode>

Tetapi buat seperti ini.

<Editor>

   Document

   Overlay

      FloatingToolbar

</Editor>

Kemudian posisi toolbar dihitung berdasarkan posisi gambar.

Misalnya.

Toolbar X

=

Image Rect Center

Toolbar Y

=

Image Top

- Toolbar Height

Jadi toolbar hanya membaca koordinat gambar.

Tetapi tidak menjadi child gambar.

Rule Baru

Floating Toolbar harus memenuhi aturan berikut.

Selalu berada pada Overlay Layer.
Tidak boleh menjadi child dari Image, Table, atau Code Block.
Selalu menggunakan z-index paling tinggi di area editor.
Tidak boleh ikut terkena clipping halaman.
Tidak boleh ikut terkena overflow editor.
Selalu muncul di depan seluruh elemen dokumen.
Problem 2
PNG Transparan Berubah Menjadi Hitam

Ini sebenarnya masalah yang sangat umum pada editor.

Saya hampir yakin masalahnya bukan pada file PNG.

Melainkan pada cara Image Node dirender.

Kemungkinan sekarang Image Container mempunyai CSS seperti ini.

background: black;

atau

background-color: #000;

Ketika PNG transparan masuk.

Yang terlihat adalah warna background container.

Bukan transparansi PNG.

Yang Benar

Container gambar tidak boleh mempunyai background.

background: transparent;

Kemudian renderer mempertahankan alpha channel PNG.

Flow yang benar.

PNG

↓

Decode RGBA

↓

Keep Alpha

↓

Render

Jangan melakukan.

PNG

↓

Convert RGB

↓

Fill Black

↓

Render

Karena itu yang menyebabkan area transparan berubah menjadi hitam.

Jika Ingin Mirip Microsoft Word

Microsoft Word sebenarnya tidak menampilkan kotak hitam.

Yang dilakukan Word adalah.

Canvas Putih

↓

PNG Transparan

↓

Render

Akibatnya.

Area transparan terlihat putih.

Bukan karena diberi warna putih.

Tetapi karena background halaman memang putih.

Jadi sebenarnya.

PNG

↓

Transparent

↓

Page White

Bukan.

PNG

↓

Black Background
Rule Rendering PNG

Image Node harus mengikuti aturan berikut.

Jangan pernah memberi background default pada Image Container.
Background container harus transparent.
Pertahankan seluruh alpha channel PNG.
Jangan melakukan flatten image.
Jangan mengubah PNG menjadi JPEG.
Jangan mengisi area transparan dengan warna hitam.
Area transparan harus memperlihatkan warna halaman dokumen (putih).
Instruksi Lengkap untuk AI Agent

Perbaiki dua sistem editor yang masih bermasalah. Pertama, Floating Toolbar yang muncul saat gambar dipilih harus dipindahkan ke Overlay Layer editor dan tidak boleh lagi menjadi child dari Image Node maupun node dokumen lainnya. Toolbar hanya menggunakan koordinat gambar sebagai acuan posisi, tetapi secara struktur berada di luar Document Layer sehingga selalu dirender di atas seluruh elemen editor, termasuk Code Block, Table, dan Image. Floating Toolbar wajib memiliki z-index tertinggi pada area editor, tidak boleh terkena clipping, overflow, ataupun stacking context dari node dokumen. Kedua, perbaiki Image Rendering Engine agar mendukung PNG transparan dengan benar. Image Container tidak boleh memiliki background hitam ataupun warna default lainnya. Background container harus transparan sehingga area alpha pada PNG memperlihatkan warna halaman dokumen yang berwarna putih. Jangan melakukan flatten image, jangan mengubah PNG menjadi JPEG, dan jangan mengisi area transparan dengan warna hitam. Seluruh alpha channel PNG harus dipertahankan hingga proses rendering selesai sehingga hasil tampilannya identik dengan Microsoft Word dan Google Docs ketika menyisipkan gambar PNG transparan.