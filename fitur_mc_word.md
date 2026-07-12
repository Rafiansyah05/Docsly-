Untuk project **Docsly**, sistem login/signup menggunakan Google (Google OAuth) pada dasarnya membutuhkan 3 bagian utama yang harus terhubung:

1. **Google OAuth Provider** → Google sebagai penyedia autentikasi.
2. **Authentication Service** → misalnya Supabase Auth (karena Docsly kamu sebelumnya banyak menggunakan Supabase).
3. **Frontend Docsly** → tombol "Continue with Google", menangani redirect, session, dan user state.

Alur akhirnya seperti ini:

```
User membuka Docsly
        |
        v
Klik "Continue with Google"
        |
        v
Frontend meminta Supabase Auth login Google
        |
        v
Supabase redirect ke halaman Google OAuth
        |
        v
User memilih akun Google
        |
        v
Google mengembalikan authorization code
        |
        v
Supabase memvalidasi code
        |
        v
Supabase membuat session user
        |
        v
Frontend menerima session
        |
        v
User masuk ke Dashboard Docsly
```

---

## Prompt untuk AI Agent Docsly

Berikan prompt berikut ke AI Agent kamu:

---

```
Saya ingin mengimplementasikan sistem Authentication menggunakan Google OAuth pada project Docsly.

Tujuan:
User dapat melakukan:
1. Signup menggunakan akun Google.
2. Login menggunakan akun Google.
3. Setelah berhasil login, user diarahkan ke dashboard Docsly.
4. Session user tetap tersimpan sehingga ketika membuka ulang website user masih login.
5. User dapat logout.

Gunakan Supabase Authentication sebagai backend authentication.

Tolong implementasikan secara lengkap dan jangan hanya membuat UI.

Lakukan langkah berikut:

=================================
1. ANALISIS PROJECT
=================================

Pertama cek struktur project Docsly:

- Framework frontend yang digunakan.
- Apakah sudah ada Supabase client.
- Apakah sudah ada authentication context/provider.
- Apakah sudah ada middleware untuk protected route.
- Lokasi halaman login/signup.

Jangan membuat file baru sebelum memahami struktur yang sudah ada.

=================================
2. KONFIGURASI SUPABASE AUTH
=================================

Pastikan Supabase sudah dikonfigurasi.

Buat atau perbaiki:

- Supabase client initialization.
- Environment variable:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Pastikan tidak ada key yang ditulis langsung di source code.

=================================
3. AKTIFKAN GOOGLE PROVIDER
=================================

Konfigurasikan Supabase OAuth Google.

Implementasikan:

supabase.auth.signInWithOAuth({
 provider: 'google'
})

Gunakan flow:

redirectTo:
- development:
http://localhost:3000/auth/callback

- production:
https://domain-docsly.com/auth/callback


=================================
4. BUAT GOOGLE CLOUD OAUTH CONFIGURATION
=================================

Jelaskan dan buat checklist konfigurasi Google Cloud:

Buat OAuth Client ID:

Application type:
Web Application

Authorized JavaScript origins:

Development:
http://localhost:3000

Production:
https://domain-docsly.com


Authorized redirect URI:

https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback


Pastikan redirect URL sama dengan Supabase.


=================================
5. IMPLEMENTASI BUTTON LOGIN GOOGLE
=================================

Pada halaman login/signup Docsly:

Buat button:

"Continue with Google"


Ketika diklik:

1. Jalankan fungsi loginWithGoogle().
2. Redirect user ke Google OAuth.
3. Handle loading state.
4. Handle error.


Contoh flow:

User klik button
      |
      v
setLoading(true)
      |
      v
supabase.auth.signInWithOAuth()
      |
      v
Redirect Google


=================================
6. BUAT AUTH CALLBACK
=================================

Buat route:

/auth/callback


Fungsinya:

- menerima response dari OAuth.
- menukar authorization code menjadi session.
- menyimpan session.


Gunakan:

supabase.auth.exchangeCodeForSession()


Setelah berhasil:

redirect ke:

/dashboard


Jika gagal:

redirect kembali ke:

/login?error=oauth_failed


=================================
7. BUAT AUTH STATE MANAGEMENT
=================================

Buat authentication provider global.


Harus menyediakan:

user
session
loading
signInWithGoogle()
logout()


Gunakan:

supabase.auth.onAuthStateChange()


Ketika:

LOGIN:
update user state


LOGOUT:
hapus user state


=================================
8. PROTECTED ROUTE
=================================

Dashboard Docsly hanya boleh diakses user login.


Jika:

user ada:
boleh masuk


Jika:

user null:
redirect ke login


Implementasikan menggunakan:

Next.js middleware atau client-side guard sesuai arsitektur project.


=================================
9. USER PROFILE
=================================

Setelah login Google:

Ambil data:

email
full_name
avatar_url


Simpan ke tabel:

profiles


Jika belum ada:

buat profile baru.


Struktur:

profiles:

id
(user id dari auth.users)

email

full_name

avatar_url

created_at


Gunakan trigger atau pengecekan ketika login pertama kali.


=================================
10. HANDLE EDGE CASE
=================================

Pastikan menangani:

- User menolak login Google.
- Popup gagal.
- Redirect gagal.
- Session expired.
- User logout.
- Refresh halaman.


=================================
11. TESTING
=================================

Lakukan testing:

CASE 1:
User baru login Google.

Expected:
- akun dibuat.
- profile dibuat.
- masuk dashboard.


CASE 2:
User lama login lagi.

Expected:
- tidak membuat akun baru.
- langsung masuk dashboard.


CASE 3:
User logout.

Expected:
- session hilang.
- kembali login.


CASE 4:
Refresh halaman setelah login.

Expected:
- user tetap login.


=================================
12. JANGAN MERUSAK FITUR EXISTING
=================================

Pastikan implementasi OAuth:

- tidak merusak editor Docsly.
- tidak mengubah struktur database yang sudah ada tanpa alasan.
- tidak menghapus authentication yang sudah berjalan.
- mengikuti pattern code existing.

Sebelum melakukan perubahan besar, jelaskan file mana yang akan diubah.
```

---

## Hal yang perlu kamu siapkan sendiri sebelum AI Agent bekerja

### 1. Buat Google OAuth Client

Masuk ke:

[Google Cloud Console](https://console.cloud.google.com/?utm_source=chatgpt.com)

Lalu:

```
APIs & Services
      |
      OAuth consent screen
      |
      Create OAuth Client
      |
      Web Application
```

Ambil:

```
Client ID
Client Secret
```

---

### 2. Masukkan ke Supabase

Masuk:

[Supabase Dashboard](https://supabase.com/dashboard?utm_source=chatgpt.com)

Menu:

```
Authentication
   |
Providers
   |
Google
```

Aktifkan:

```
Enable Google Provider = ON
```

Masukkan:

```
Client ID
Client Secret
```

---

### 3. Tambahkan URL Redirect

Development:

```
http://localhost:3000/auth/callback
```

Production:

```
https://docsly-domain-kamu.com/auth/callback
```

---

## Struktur ideal Docsly setelah implementasi

```
src
|
├── app
│   |
│   ├── login
│   │     └── page.tsx
│   |
│   ├── signup
│   │     └── page.tsx
│   |
│   ├── auth
│   │     |
│   │     └── callback
│   │            └── route.ts
│   |
│   └── dashboard
│          └── page.tsx
|
├── lib
│   |
│   └── supabase
│          ├── client.ts
│          └── server.ts
|
├── context
│   |
│   └── AuthProvider.tsx
|
└── middleware.ts
```

---

Catatan penting untuk Docsly: karena Docsly adalah **AI document workspace**, jangan hanya menyimpan email user. Dari awal sebaiknya buat tabel `profiles` agar nanti mudah menambahkan fitur seperti:

* jumlah dokumen yang dibuat,
* subscription plan,
* AI usage limit,
* template favorit,
* history dokumen,
* storage quota.

Jadi Google Auth bukan hanya untuk login, tetapi menjadi fondasi identitas user di seluruh ekosistem Docsly.
