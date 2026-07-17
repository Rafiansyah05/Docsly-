Saya sudah analisis seluruh log build Vercel yang Anda kirim. Error ini **bukan berasal dari Vercel**, melainkan berasal dari kode Next.js di project Docsly. Vercel hanya menjadi tempat pertama yang menjalankan production build sehingga error tersebut muncul.

Berikut analisisnya berdasarkan prioritas.

---

# Ringkasan Hasil Analisis

Status build:

```
✅ Install dependency berhasil
✅ Compile berhasil
✅ Type check berhasil
❌ Gagal saat prerendering static pages
```

Artinya:

* dependency bukan masalah
* package.json bukan masalah
* TypeScript bukan masalah
* build webpack bukan masalah

Masalah muncul ketika Next.js mencoba melakukan:

```
Collecting page data
↓
Generating static pages
↓
Prerender 404
Prerender 500
Prerender _not-found
↓
FAIL
```

Jadi error terjadi ketika rendering halaman.

---

# PRIORITAS 1 (Penyebab paling besar)

## Error

```
Error:

<Html> should not be imported outside of pages/_document
```

ini adalah penyebab utama.

Log:

```
Error occurred prerendering page "/404"

Error occurred prerendering page "/500"

Error occurred prerendering page "/_not-found"
```

Artinya ada file yang mengimpor

```tsx
import {
Html,
Head,
Main,
NextScript
} from "next/document"
```

padahal file tersebut **BUKAN**

```
pages/_document.tsx
```

---

## Yang harus dicek AI

Cari seluruh project:

```
import { Html
```

atau

```
from "next/document"
```

Kemungkinan ditemukan di:

```
app/layout.tsx
```

atau

```
app/not-found.tsx
```

atau

```
app/error.tsx
```

atau

```
components/*
```

atau

```
404.tsx
```

Semua harus dihapus.

---

Yang BENAR

Untuk App Router

gunakan

```tsx
<html lang="en">
<body>
```

bukan

```tsx
<Html>
<Head>
```

---

# PRIORITAS 2

## Error

```
Cannot read properties of null
(reading 'useContext')
```

ini error kedua.

Biasanya berasal dari:

```
React Context
```

yang dipanggil saat prerender.

Misalnya

```tsx
const auth = useContext(AuthContext)
```

tetapi

```
<AuthProvider>
```

belum membungkus halaman tersebut.

---

Kemungkinan:

```
ThemeProvider

SupabaseProvider

EditorProvider

SidebarProvider

TooltipProvider

QueryClientProvider

SessionProvider
```

salah satu tidak tersedia ketika

```
404
500
not-found
```

dirender.

---

AI harus mencari

```
useContext(
```

dan memastikan seluruh provider sudah membungkus

```
app/layout.tsx
```

---

# PRIORITAS 3

## Error

```
404
500
_not-found
```

seluruh halaman gagal dirender.

Artinya kemungkinan besar

```
app/not-found.tsx
```

atau

```
app/error.tsx
```

menggunakan

```
EditorContext

ThemeContext

SupabaseContext

AuthContext
```

padahal provider belum ada.

---

# PRIORITAS 4

Ada warning

```
A Node.js API is used

process.version

not supported in Edge Runtime
```

berasal dari

```
@supabase/supabase-js
```

Import trace

```
@supabase/supabase-js

↓

@supabase/ssr

↓

createBrowserClient
```

Kalau middleware memakai

```
runtime = edge
```

sementara ada library Node

maka nanti deployment bisa gagal.

AI perlu mengecek

```
middleware.ts
```

dan

```
export const runtime = 'edge'
```

atau

```
export const runtime = 'experimental-edge'
```

---

# PRIORITAS 5

Ada warning

```
NODE_ENV non-standard
```

Artinya di Environment Variable mungkin ada

```
NODE_ENV=development
```

atau

```
NODE_ENV=local
```

di Vercel.

Seharusnya

```
production
```

atau

tidak perlu di-set sama sekali.

Ini bukan penyebab build gagal tetapi perlu dibersihkan.

---

# PRIORITAS 6

Ada banyak dependency deprecated

Contohnya

```
glob

eslint

rimraf

whatwg

next-on-pages
```

Tidak menyebabkan build gagal.

Bisa diabaikan sementara.

---

# PRIORITAS 7

Compile berhasil

Log:

```
Compiled successfully
```

Berarti

Semua

```
syntax

typescript

jsx

tailwind

webpack
```

sudah benar.

Jadi AI tidak perlu mencari syntax error.

---

# PRIORITAS 8

Type Checking berhasil

```
Checking validity of types
```

selesai tanpa error.

Berarti

```
TypeScript

Props

Interfaces

Generics
```

semuanya lolos.

---

# PRIORITAS 9

Install dependency berhasil

```
added 1381 packages
```

Artinya

```
package.json

package-lock.json

workspace

npm install
```

semuanya normal.

---

# Kemungkinan Lokasi Error

Saya urutkan berdasarkan probabilitas.

| Prioritas | Lokasi                   | Kemungkinan          |
| --------- | ------------------------ | -------------------- |
| ⭐⭐⭐⭐⭐     | app/layout.tsx           | Sangat tinggi        |
| ⭐⭐⭐⭐⭐     | app/not-found.tsx        | Sangat tinggi        |
| ⭐⭐⭐⭐⭐     | app/error.tsx            | Sangat tinggi        |
| ⭐⭐⭐⭐⭐     | components/Layout.tsx    | Sangat tinggi        |
| ⭐⭐⭐⭐      | components/Providers.tsx | Tinggi               |
| ⭐⭐⭐⭐      | middleware.ts            | Tinggi               |
| ⭐⭐⭐       | AuthProvider             | Sedang               |
| ⭐⭐⭐       | ThemeProvider            | Sedang               |
| ⭐⭐        | SupabaseProvider         | Rendah               |
| ⭐         | package.json             | Hampir tidak mungkin |

---

# Perintah yang bisa diberikan ke AI Agent

Berikut prompt yang dapat langsung Anda berikan ke AI Agent:

> Analisis seluruh project Next.js (App Router) untuk menemukan penyebab kegagalan build di Vercel. Fokus utama pada error `<Html> should not be imported outside of pages/_document`. Cari seluruh import dari `next/document` di semua file selain `pages/_document.tsx`, lalu ganti dengan struktur App Router (`<html>` dan `<body>`) atau hapus jika tidak diperlukan. Setelah itu analisis seluruh penggunaan `useContext()` yang menyebabkan `Cannot read properties of null (reading 'useContext')`, terutama pada `app/layout.tsx`, `app/error.tsx`, `app/not-found.tsx`, `Providers`, `AuthProvider`, `ThemeProvider`, `EditorProvider`, dan provider global lainnya. Pastikan semua context dibungkus oleh provider sebelum dipakai, termasuk saat prerender halaman `/404`, `/500`, dan `/_not-found`. Selanjutnya periksa `middleware.ts` serta penggunaan `@supabase/ssr` agar tidak menjalankan API Node.js (`process.version`) pada Edge Runtime. Verifikasi juga bahwa tidak ada `NODE_ENV` non-standar di konfigurasi Vercel. Setelah seluruh perbaikan selesai, jalankan `npm run build` secara lokal hingga build berhasil tanpa warning kritis maupun error prerender, sehingga deployment ke Vercel dapat berjalan sukses.

## Satu hal yang paling penting

Dari seluruh log, **90% kemungkinan penyebab build gagal adalah adanya import `Html` dari `next/document` di lokasi yang tidak semestinya**. Error ini muncul lebih dulu, lalu memicu kegagalan prerender halaman `404`, `500`, dan `_not-found`. Setelah masalah tersebut diperbaiki, barulah jika masih ada error, fokus berikutnya adalah `useContext()` yang dijalankan tanpa provider saat proses prerender. 
