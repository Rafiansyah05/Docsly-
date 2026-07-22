Saya paham maksud Anda. Yang Anda inginkan bukan sekadar **mengubah urutan teks menjadi format APA**, tetapi **hasil akhirnya harus terlihat seperti hasil Microsoft Word atau Mendeley**, lengkap dengan formatting (italic, hanging indent, spacing, dll.).

Dari screenshot, saya melihat beberapa masalah.

### 1. Tidak ada *italic* ❌

Hasil AI Anda:

> Martin-Martin, A.; Orduna-Malea, E.; Ayllon, J. M.; Delgado López-Cózar, E., 2016. A two-sided academic landscape: portrait of highly-cited documents in Google Scholar (1950–2013). arXiv.

Seharusnya (APA 7):

> Martin-Martin, A., Orduna-Malea, E., Ayllon, J. M., & Delgado López-Cózar, E. (2016). *A two-sided academic landscape: Portrait of highly-cited documents in Google Scholar (1950–2013).* *arXiv.*

Yang harus **italic** adalah:

* Judul jurnal (*Journal Name*)
* Volume jurnal
* Judul buku (jika tipe referensinya buku)

Kalau ini preprint arXiv, banyak style tetap meng-*italic*-kan nama sumber (*arXiv*).

---

## 2. Hanging Indent tidak ada ❌

Sekarang hasilnya seperti ini

```
Martin-Martin, A.; Orduna...
academic landscape...
```

Padahal yang benar

```
Martin-Martin, A., Orduna-Malea, E., Ayllon, J. M., &
     Delgado López-Cózar, E. (2016). A two-sided...
```

atau

```
Martin-Martin, A., Orduna-Malea, E., Ayllon, J. M., &
    Delgado López-Cózar, E. (2016). ...
```

Baris kedua harus masuk sekitar **1,27 cm (0.5")**.

Ini **bukan menambahkan spasi**, tetapi menggunakan atribut paragraph:

```
paragraph {
    textIndent = -1.27 cm
    marginLeft = 1.27 cm
}
```

---

## 3. Masih menggunakan ";" ❌

AI Anda

```
Martin-Martin, A.;
Orduna-Malea, E.;
```

APA tidak memakai titik koma.

Harus

```
Martin-Martin, A.,
Orduna-Malea, E.,
```

---

## 4. Tidak ada "&" terakhir ❌

APA

```
A.,
B.,
&
C.
```

bukan

```
A.,
B.,
C.
```

---

## 5. Tahun salah layout ❌

Sekarang

```
Delgado..., 2016.
```

APA

```
Delgado López-Cózar, E. (2016).
```

Harus di dalam kurung.

---

## 6. Tidak ada sentence case ❌

Judul artikel APA harus

```
A two-sided academic landscape: Portrait of highly-cited documents in Google Scholar (1950–2013).
```

Bukan semua Title Case.

---

## 7. Nama jurnal harus italic ❌

```
*Journal of Computer Science*
```

atau

```
*Nature*
```

atau

```
*arXiv*
```

---

# Yang paling penting

Menurut saya, masalah terbesar bukan pada prompt AI, tetapi pada arsitektur implementasinya.

Saat ini AI Anda tampaknya hanya menghasilkan **plain text**, misalnya:

```text
Martin-Martin...
```

Padahal editor seperti Microsoft Word, Google Docs, atau Mendeley **tidak pernah menghasilkan daftar pustaka sebagai plain text**.

Mereka menghasilkan **Rich Text**.

Contohnya:

```
paragraph
    indentLeft = 1.27 cm
    hanging = true

run
    text = Martin-Martin, A.
    italic = false

run
    text = A two-sided academic...
    italic = true

run
    text = arXiv
    italic = true
```

Artinya, AI seharusnya tidak mengembalikan hanya sebuah string, tetapi juga informasi formatting.

Misalnya:

```json
[
  {
    "text": "Martin-Martin, A., Orduna-Malea, E., Ayllon, J. M., & Delgado López-Cózar, E. ",
    "italic": false
  },
  {
    "text": "(2016). ",
    "italic": false
  },
  {
    "text": "A two-sided academic landscape: Portrait of highly-cited documents in Google Scholar (1950–2013). ",
    "italic": false
  },
  {
    "text": "arXiv.",
    "italic": true
  }
]
```

Kemudian editor Anda yang menerapkan:

* `italic`
* `bold`
* `underline`
* `paragraph style`
* `hanging indent`
* `spacing`

---

## Saran untuk Docsly

Saya **tidak menyarankan AI yang langsung menulis daftar pustaka ke editor**. Pendekatan yang jauh lebih stabil adalah:

1. AI hanya mengubah metadata menjadi **struktur referensi**.
2. Sebuah **Citation Formatter Engine** (aturan deterministik, bukan AI) mengubah struktur tersebut menjadi format APA/Harvard.
3. Editor merender hasilnya sebagai **rich text** (bukan plain text), sehingga italic, hanging indent, dan formatting lainnya diterapkan secara otomatis.

Pendekatan ini jauh lebih konsisten, hasilnya menyerupai Microsoft Word atau Mendeley, dan menghindari variasi format yang sering muncul jika semuanya diserahkan kepada model AI.
