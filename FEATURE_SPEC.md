# FEATURE_SPEC.md

## 1. Overview

Platform menyediakan utility untuk membantu pengguna mengolah dokumen Microsoft Word tanpa menyimpan dokumen pengguna secara permanen.

Fokus utama:

1. Daftar pustaka.
2. Pengaturan nomor halaman.
3. Kombinasi daftar pustaka + nomor halaman.

Output akhir harus tetap berupa:

`.docx`

dan dapat diedit kembali menggunakan Microsoft Word.

---

# 2. Core Principle

## Preserve First

Sistem harus memprioritaskan preservasi dokumen existing.

Jangan melakukan:

```text
DOCX
↓
Plain Text
↓
Generate DOCX baru
```

jika pendekatan tersebut menyebabkan formatting existing hilang.

Prefer:

```text
DOCX
↓
Parse existing structure
↓
Modify only required parts
↓
Generate DOCX
```

---

# 3. Data Policy

Platform tidak menyimpan:

* document file
* document content
* bibliography content
* generated document
* page numbering configuration sebagai data dokumen
* temporary document permanently

Database hanya digunakan untuk mengetahui penggunaan platform.

Contoh:

```text
feature_usage
```

Conceptual data:

```text
feature
usage_count
```

Jika project existing telah mempunyai mekanisme statistics, gunakan mekanisme tersebut.

Tidak perlu membuat database analytics kompleks.

---

# 4. Usage Metrics

Minimum metrics:

```text
bibliography
page_numbering
bibliography_page_numbering
```

Definisi:

### bibliography

Satu successful processing yang menggunakan fitur daftar pustaka.

### page_numbering

Satu successful processing yang menggunakan fitur nomor halaman.

### bibliography_page_numbering

Satu successful processing yang menggunakan kedua fitur dalam satu processing.

Jika definisi "usage" berbeda dari ini, harus dikonfirmasi sebelum implementation.

---

# 5. Processing Pipeline

## Single Feature

```text
Upload DOCX
    ↓
Validate
    ↓
Parse
    ↓
Transform
    ↓
Validate output
    ↓
Generate DOCX
    ↓
Return file
    ↓
Record usage
```

## Combined Feature

```text
Upload DOCX
    ↓
Validate
    ↓
Parse once
    ↓
Apply bibliography transformation
    ↓
Apply page numbering transformation
    ↓
Validate
    ↓
Generate DOCX
    ↓
Return file
    ↓
Record usage
```

Dokumen tidak boleh diparse ulang untuk setiap fitur jika dapat dihindari.

---

# 6. Bibliography

Bibliography harus dapat ditambahkan tanpa merusak halaman existing.

Jika ruang tidak cukup:

```text
Existing document
        ↓
Existing final content
        ↓
Page Break
        ↓
Bibliography
```

Sistem tidak boleh menghapus atau mengganti halaman existing hanya untuk membuat bibliography.

---

# 7. Page Numbering

Configuration:

```typescript
{
  startNumber: number,
  position: "left" | "center" | "right",
  format: ...
}
```

Minimum supported formats:

```text
1, 2, 3
01, 02, 03
I, II, III
i, ii, iii
A, B, C
```

Default:

```text
format = numeric
position = existing/default agreed position
startNumber = agreed default
```

Default visual:

```text
1
2
3
```

Bukan:

```text
Page 1
Page 2
Page 3
```

Tidak boleh ada prefix text secara default.

---

# 8. Page Number Position

User dapat memilih:

```text
Left
Center
Right
```

UI harus memperlihatkan pilihan secara jelas.

Jangan menggunakan emoji sebagai representasi posisi.

Gunakan typography/layout atau icon yang sudah tersedia di project.

---

# 9. Numbering Semantics

Ada perbedaan antara:

### Physical page

Halaman fisik pertama pada file DOCX.

### Logical page

Nomor yang ditampilkan kepada user.

Implementer tidak boleh menentukan behavior secara asumsi jika dokumen memiliki:

* cover
* section break
* different first page
* multiple sections
* existing page numbering

Jika behavior untuk kondisi tersebut belum didefinisikan oleh existing system, minta konfirmasi.

---

# 10. Typography

Generated content:

```text
Font: Times New Roman
Size: 12pt
```

Namun sistem tidak boleh melakukan global formatting terhadap seluruh dokumen.

Contoh yang dilarang:

```text
document.selectAll()
document.font = Times New Roman
document.size = 12
```

karena dapat merusak formatting existing.

Formatting baru hanya diterapkan pada content yang dibuat/diubah oleh feature.

---

# 11. Document Preservation

Prioritaskan preservasi:

* paragraphs
* headings
* tables
* images
* existing fonts
* bold
* italic
* underline
* alignment
* spacing
* headers
* footers
* page breaks
* section breaks

Jika library yang digunakan tidak mampu mempertahankan salah satu elemen penting, jangan diam-diam melanjutkan.

Laporkan limitation terlebih dahulu.

---

# 12. User Flow

## Main flow

```text
Menu
 ↓
Choose Word Document
 ↓
Preview
 ↓
Choose Feature
 ↓
Configure
 ↓
Preview Result
 ↓
Download Word
```

---

# 13. Feature Selection

User dapat memilih:

```text
Daftar Pustaka
Nomor Halaman
Daftar Pustaka + Nomor Halaman
```

Combined option adalah first-class feature, bukan dua workflow yang dipaksa berjalan terpisah.

---

# 14. UI Principles

UI harus:

* clean
* professional
* calm
* readable
* document-oriented
* minimal
* predictable

Hindari:

* excessive shadows
* gradient
* glassmorphism
* glowing borders
* excessive rounded containers
* decorative blobs
* emoji
* generic AI sparkle decoration
* excessive cards
* excessive badges

Hierarchy menggunakan:

```text
Typography
Spacing
Borders
Alignment
Contrast
```

bukan shadow.

---

# 15. Preview

Preview harus menunjukkan:

* dokumen
* perubahan
* nomor halaman
* bibliography jika ditambahkan

Jika preview engine tidak mampu merepresentasikan DOCX 100% akurat, jangan mengklaim preview identik dengan Microsoft Word.

DOCX hasil export merupakan output final.

---

# 16. Security

## Authentication

Semua operation harus mengikuti authentication system existing.

## RBAC

Authorization harus dilakukan server-side.

Frontend visibility bukan security.

## RLS

RLS existing harus diperiksa.

Jika statistics table baru diperlukan, policy harus memastikan user tidak dapat memanipulasi statistics secara bebas.

## Validation

Validasi:

* authentication
* role
* file type
* file size
* document validity
* feature configuration

## Privacy

Jangan log:

* document text
* bibliography content
* uploaded file
* generated file content

---

# 17. Performance

Target architecture:

```text
Parse once
Transform once
Export once
```

Hindari:

```text
parse
export
parse again
export again
```

untuk combined feature.

Database statistics menggunakan atomic update/upsert jika tersedia.

---

# 18. Failure Handling

Jika processing gagal:

```text
No successful usage increment
```

kecuali project telah menetapkan bahwa metric adalah attempt count.

User mendapatkan error yang human-readable.

Server log boleh menyimpan technical error tetapi tidak document content.

---

# 19. Compatibility

Output:

```text
.docx
```

Harus:

* valid DOCX
* editable
* openable in Microsoft Word
* not flattened
* not image-based
* not PDF

---

# 20. Security Checklist

* [ ] Authentication verified server-side.
* [ ] RBAC verified server-side.
* [ ] RLS reviewed.
* [ ] Unauthorized API access blocked.
* [ ] User cannot manipulate usage statistics directly.
* [ ] File size validation.
* [ ] File type validation.
* [ ] Malformed DOCX handled.
* [ ] Document content not logged.
* [ ] Temporary files not permanently stored.
* [ ] Error messages do not expose internals.

---

# 21. Regression Checklist

* [ ] Existing authentication works.
* [ ] Existing roles work.
* [ ] Existing routes work.
* [ ] Existing database works.
* [ ] Existing document features work.
* [ ] Existing upload/download works.
* [ ] New features do not alter unrelated document behavior.

---

# 22. Definition of Done

The feature is complete only when:

* DOCX can be uploaded.
* DOCX can be previewed.
* Bibliography can be added.
* Bibliography can add a new page when required.
* Existing pages are preserved.
* Page numbering can be configured.
* Starting number can be configured.
* Position can be configured.
* Multiple numbering formats exist.
* Default numbering is numeric only.
* Combined bibliography + numbering exists.
* Generated content uses Times New Roman 12pt.
* Existing formatting is not globally overwritten.
* DOCX remains editable.
* Usage statistics are recorded.
* Document content is not persisted.
* Authentication works.
* RBAC works.
* RLS is verified.
* UI is professional and not visually AI-generated.
* No unnecessary shadow/emoji/decorative UI.
* Processing is efficient.
* Existing functionality passes regression testing.
* No ambiguous behavior was implemented without confirmation.
