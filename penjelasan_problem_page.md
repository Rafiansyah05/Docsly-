# Bug Critical - Halaman Kosong Tidak Terhapus Otomatis

## Permasalahan

Sistem pagination Docsly saat ini masih memiliki bug.

Ketika seluruh isi pada halaman terakhir dihapus (text, tabel, gambar, code block, equation, list, dll), halaman tersebut **tetap dipertahankan**, sehingga muncul halaman kosong yang seharusnya tidak ada.

Contoh:

* Halaman 1 penuh.
* Halaman 2 berisi beberapa paragraf.
* User menghapus seluruh isi halaman 2.
* Hasil saat ini:

  * Halaman 2 tetap muncul dalam keadaan kosong.
* Hasil yang diharapkan:

  * Halaman 2 langsung dihapus sehingga dokumen kembali hanya memiliki Halaman 1.

Bug ini masih terus terjadi walaupun sebelumnya sudah dilakukan beberapa perbaikan.

---

# Perilaku yang Diinginkan

Pagination harus sepenuhnya mengikuti jumlah konten, **bukan jumlah halaman yang pernah dibuat.**

Artinya:

* Jika tidak ada konten yang membutuhkan halaman baru, maka halaman baru **tidak boleh ada**.
* Halaman hanya boleh dibuat apabila terdapat konten yang benar-benar meluap (overflow) dari halaman sebelumnya.
* Begitu overflow tersebut hilang karena user menghapus atau mengedit konten, halaman tambahan harus langsung dihapus secara otomatis.

---

# Aturan Pagination

## Rule 1

Halaman pertama selalu ada.

Halaman pertama tidak boleh dihapus walaupun kosong.

---

## Rule 2

Semua halaman setelah halaman pertama bersifat dinamis.

Artinya:

* dibuat ketika diperlukan
* dihapus ketika tidak diperlukan

Tidak boleh ada halaman statis.

---

## Rule 3

Halaman baru hanya boleh dibuat apabila terdapat komponen yang benar-benar tidak muat pada halaman sebelumnya.

Komponen yang dimaksud meliputi:

* Text
* Heading
* Paragraph
* List
* Quote
* Table
* Image
* Code Block
* Equation
* Callout
* Horizontal Line
* Footnote
* Semua node editor lainnya

Jika seluruh komponen masih muat pada halaman saat ini, maka **jangan pernah membuat halaman baru.**

---

## Rule 4

Jika halaman terakhir tidak memiliki satu pun node yang dirender, maka halaman tersebut harus langsung dihapus.

Bukan disembunyikan.

Bukan diberi tinggi nol.

Tetapi benar-benar dihapus dari struktur pagination.

Contoh:

Halaman 1

```
Paragraf...
Paragraf...
Paragraf...
```

Halaman 2

```
(kosong)
```

Hasil yang benar

```
Halaman 1 saja
```

---

## Rule 5

Setelah setiap perubahan editor, sistem wajib melakukan evaluasi ulang seluruh pagination.

Perubahan yang memicu evaluasi antara lain:

* mengetik
* menghapus
* paste
* cut
* undo
* redo
* drag & drop
* insert image
* delete image
* resize image
* insert table
* delete table
* merge cell
* split cell
* perubahan ukuran font
* perubahan margin
* perubahan line spacing
* perubahan heading
* seluruh transaksi editor lainnya

Jangan hanya mengecek saat mengetik.

---

# Jangan Mengandalkan Jumlah Halaman Lama

Saat ini terlihat sistem masih mempertahankan page container lama.

Ini adalah penyebab utama bug.

Yang harus dilakukan adalah:

Setelah setiap transaksi editor:

1. Hitung ulang posisi seluruh node.
2. Tentukan node berada di halaman mana.
3. Bangun ulang mapping halaman berdasarkan posisi node terbaru.
4. Hapus page container yang tidak memiliki node sama sekali.
5. Render ulang pagination.

Jangan mempertahankan page container lama apabila sudah tidak memiliki isi.

Pagination harus merupakan hasil perhitungan ulang setiap kali terjadi perubahan, bukan hasil penambahan halaman yang bersifat permanen.

---

# Definisi Halaman Kosong

Halaman dianggap kosong apabila:

* tidak memiliki text
* tidak memiliki heading
* tidak memiliki paragraph
* tidak memiliki image
* tidak memiliki table
* tidak memiliki code block
* tidak memiliki equation
* tidak memiliki list
* tidak memiliki node editor apa pun

Whitespace, placeholder, node dummy, node kosong, atau elemen sementara **tidak boleh dianggap sebagai konten**.

---

# Expected Behavior

Contoh 1

Awal

```
Page 1
██████████

Page 2
████
```

User menghapus isi Page 2

Hasil

```
Page 1
██████████
```

Page 2 langsung hilang.

---

Contoh 2

Awal

```
Page 1
██████████

Page 2
██
```

User menghapus dua paragraf terakhir sehingga semuanya muat di Page 1.

Hasil

```
Page 1
████████████
```

Page 2 langsung hilang.

---

Contoh 3

User mengetik lagi hingga Page 1 penuh.

Hasil

```
Page 1
██████████

Page 2
██
```

Page 2 dibuat kembali secara otomatis.

---

# Target

Pagination harus selalu merepresentasikan kondisi dokumen saat ini.

Jumlah halaman tidak boleh ditentukan oleh riwayat editor, melainkan harus ditentukan hanya oleh jumlah konten yang benar-benar ada.

Singkatnya:

* Ada overflow → buat halaman baru.
* Tidak ada overflow → hapus halaman tambahan.
* Tidak boleh ada halaman kosong yang tersisa.
* Jangan menggunakan cache atau mempertahankan page container lama yang sudah tidak memiliki node.
