Error yang sekarang berbeda dengan error Midtrans tadi. Yang sebelumnya masalah `order_id`, sekarang masalahnya ada di **Supabase Row Level Security (RLS)**.

Pesan utamanya:

```
new row violates row-level security policy for table "payments"
```

Artinya:

> Backend Docsly mencoba memasukkan data ke tabel `payments`, tetapi Supabase menolak karena aturan keamanan RLS tidak mengizinkan operasi INSERT tersebut.

---

## Kenapa ini terjadi?

Kemungkinan flow kamu sekarang:

```
User klik Upgrade
        |
        ↓
POST /api/payment/create
        |
        ↓
Backend membuat transaksi Midtrans
        |
        ↓
Insert ke Supabase table payments
        |
        ↓
DITOLAK RLS ❌
```

Supabase memiliki fitur **Row Level Security** yang secara default akan memblokir:

* INSERT
* SELECT
* UPDATE
* DELETE

jika belum ada policy yang mengizinkan.

---

# Solusi terbaik untuk Docsly

Karena tabel `payments` adalah tabel **server-side**, saya tidak menyarankan membuka INSERT untuk semua user.

Gunakan:

## Supabase Service Role Key di Backend

Arsitektur:

```
Frontend
   |
   |
API Route Next.js
   |
   |
Supabase Service Role Client
   |
   |
payments table
```

Jadi:

* user tidak langsung insert payment
* hanya backend yang boleh insert

Ini lebih aman.

---

# Langkah 1 — Pastikan RLS Aktif

Supabase Dashboard:

```
Database
   ↓
Tables
   ↓
payments
```

Pastikan:

```
Enable Row Level Security
ON
```

Biarkan ON.

---

# Langkah 2 — Buat Supabase Admin Client

Jangan gunakan client biasa.

Kemungkinan sekarang kamu menggunakan:

```typescript
createClient(
 supabaseUrl,
 supabaseAnonKey
)
```

Itu terkena RLS.

Buat file:

```
lib/supabase-admin.ts
```

Isi:

```typescript
import { createClient } from "@supabase/supabase-js";


export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

---

# Langkah 3 — Tambahkan Service Role Key

Supabase Dashboard:

```
Project Settings

↓

API

↓

Project API keys

↓

service_role
```

Copy.

Masukkan:

`.env.local`

```env
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx
```

Restart Next.js:

```
npm run dev
```

---

# Langkah 4 — Ubah Insert Payment

Sebelumnya mungkin:

```typescript
supabase
.from("payments")
.insert(paymentData)
```

Ganti:

```typescript
supabaseAdmin
.from("payments")
.insert(paymentData)
```

---

Contoh:

```typescript
const { data, error } = await supabaseAdmin
  .from("payments")
  .insert({
    user_id: user.id,
    order_id: orderId,
    plan: "PRO",
    amount: 39000,
    status: "pending"
  });


if(error){
 console.error(error);
}
```

---

# Kenapa jangan membuat policy INSERT untuk user?

Misalnya kamu membuat:

```sql
CREATE POLICY 
"Allow insert payments"
ON payments
FOR INSERT
WITH CHECK(true);
```

Ini berbahaya.

Karena user bisa manipulasi:

```
POST /payments

{
 plan:"PREMIUM",
 status:"paid"
}
```

Lalu mendapatkan premium gratis.

---

# Struktur yang saya sarankan untuk Docsly

Karena kamu membuat SaaS, pisahkan:

## User table

Dikelola user:

```
profiles
```

Boleh:

* select
* update profile

---

## Payment table

Dikelola server:

```
payments
```

Hanya backend:

* insert
* update
* webhook

---

## Subscription table

Juga server:

```
subscriptions
```

Flow:

```
Midtrans webhook

↓

Backend

↓

Update subscriptions

↓

User jadi PRO
```

---

# Alternatif jika kamu memang ingin pakai RLS policy

Bisa juga membuat policy:

```sql
CREATE POLICY "Users can insert own payments"
ON payments
FOR INSERT
WITH CHECK (
 auth.uid() = user_id
);
```

Tapi untuk kasus Docsly saya kurang menyarankan.

Kenapa?

Karena payment bukan data milik user yang bebas dibuat.

Payment harus berasal dari:

* Midtrans
* server
* webhook

bukan dari browser.

---

# Setelah diperbaiki, flow kamu akan menjadi:

```
User klik Pro
        |
        ↓
API /payment/create
        |
        ↓
Generate order_id
        |
        ↓
Insert payments
(using service role)
        |
        ↓
Create Midtrans transaction
        |
        ↓
Return snap_token
        |
        ↓
User bayar
        |
        ↓
Midtrans webhook
        |
        ↓
Update payments status
        |
        ↓
Update subscription
```

---

Dari error yang muncul, sebenarnya integrasi Midtrans kamu sudah melewati tahap pertama. Sekarang tinggal memperbaiki **arsitektur permission Supabase**. Untuk Docsly, saya sarankan dari sekarang pisahkan mana operasi **client-side** dan mana operasi **server-side**, terutama untuk hal sensitif seperti pembayaran, subscription, dan penggunaan AI.
