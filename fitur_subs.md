Menurut saya keputusan menggunakan **Midtrans** untuk Docsly cukup masuk akal, terutama kalau kamu melihat Docsly sebagai produk SaaS yang kemungkinan berkembang ke skala lebih besar. Dan pendekatan yang kamu mau (**frontend checkout buatan sendiri, backend/payment processing menggunakan Midtrans**) justru adalah pendekatan yang banyak dipakai produk profesional.

Namun ada beberapa hal yang perlu kamu pahami: kamu **tidak membuat sistem pembayaran sendiri sepenuhnya**, tetapi membuat **custom payment experience** di atas infrastruktur Midtrans.

---

# Konsep Arsitektur Docsly + Midtrans

Flow sederhananya:

```
User Docsly
    |
    |
Klik "Upgrade Pro"
    |
    ↓
Halaman Pricing / Checkout Docsly
    |
    ↓
Pilih Paket
(Pro / Premium)
    |
    ↓
Klik Bayar
    |
    ↓
Backend Docsly membuat transaksi Midtrans
    |
    ↓
Midtrans memberikan payment token
    |
    ↓
Frontend menampilkan metode pembayaran
    |
    ↓
User membayar
    |
    ↓
Midtrans kirim webhook
    |
    ↓
Backend Docsly update subscription
    |
    ↓
User menjadi Pro/Premium
```

---

# 1. Frontend Payment Page Docsly

Kamu tetap bisa membuat desain sendiri.

Contoh:

```
----------------------------------

Upgrade Your Docsly Experience


Current Plan:
Free


Choose Plan:

┌──────────────┐
│ Pro          │
│ Rp39.000/mo  │
│              │
│ ✓ AI lebih banyak
│ ✓ Template premium
│ ✓ Export
│              │
│ [Choose Pro]
└──────────────┘


┌──────────────┐
│ Premium      │
│ Rp79.000/mo  │
│              │
│ ✓ Semua fitur
│ ✓ Collaboration
│ ✓ Priority AI
│              │
│ [Choose Premium]
└──────────────┘


----------------------------------
```

Setelah klik:

```
Continue Payment
```

baru membuka payment modal Midtrans.

---

# 2. Jangan Gunakan Redirect Payment Default Midtrans

Midtrans menyediakan:

## Snap Redirect

Contoh:

```
docsly.com/payment

↓

midtrans.com/payment-page

↓

kembali ke docsly
```

Ini paling mudah.

Tapi untuk Docsly saya lebih menyarankan:

## Snap Embed

Karena:

* user tetap merasa berada di Docsly
* UX lebih premium
* brand Docsly tetap terlihat

Flow:

```
Docsly Checkout Page

        ↓

Midtrans Payment Popup

        ↓

Selesai

        ↓

Kembali Docsly
```

---

# 3. Backend Docsly yang Dibutuhkan

Kamu membutuhkan beberapa endpoint.

Contoh Next.js API:

```
app/api/payment/

create/
    route.ts

notification/
    route.ts

status/
    route.ts
```

---

## Create Transaction

Ketika user klik bayar:

Frontend:

```
POST /api/payment/create
```

Body:

```json
{
  "plan":"PRO"
}
```

Backend:

1. cek user
2. buat order ID
3. request Midtrans

Contoh:

```
DOCSLY-PRO-USER123-20260714
```

Kemudian Midtrans memberikan:

```
snap_token
```

Token ini dikirim kembali ke frontend.

---

# 4. Database Subscription Docsly

Saya sarankan jangan menyimpan status hanya di user.

Buat tabel:

## subscriptions

```sql
id

user_id

plan

status

midtrans_order_id

start_date

expired_date

created_at
```

Contoh:

```
user:
rafi@email.com


plan:
PRO


status:
ACTIVE


expired:
14 August 2026
```

---

# 5. Webhook Midtrans (Bagian Paling Penting)

Jangan percaya frontend.

Misalnya:

User manipulasi:

```
Saya sudah bayar
```

Padahal belum.

Maka:

Status pembayaran harus berasal dari Midtrans.

Flow:

```
Midtrans

↓

POST webhook

↓

Backend Docsly

↓

Verify signature

↓

Update database

```

---

Contoh:

Midtrans kirim:

```json
{
 "transaction_status":"settlement",
 "order_id":"DOCSLY-PRO-123"
}
```

Backend:

```
Jika settlement:

ubah subscription:

FREE

↓

PRO
```

---

# 6. Metode Pembayaran

Midtrans mendukung:

## Bank Transfer

* BCA
* Mandiri
* BNI
* BRI
* Permata

## E-wallet

* GoPay
* OVO
* Dana
* ShopeePay

## QRIS

Ini menurut saya wajib untuk Indonesia.

Karena user Docsly kemungkinan besar mahasiswa.

---

# 7. Subscription System Docsly

Karena Docsly punya:

* Free
* Pro
* Premium

Jangan hanya bergantung pada Midtrans.

Buat logic sendiri.

Contoh:

```
User bayar Pro:

14 July

expired:

14 August


Tanggal 14 August:

cron check


Jika expired:

PRO

↓

FREE

```

---

# 8. Free Trial 30 Hari

Ini jangan lewat payment gateway.

Flow:

User signup:

```
create account

↓

subscription table:

plan:
TRIAL

trial_end:
+30 hari

```

Contoh:

```
User daftar:

14 July

Trial selesai:

13 August

```

---

# 9. Halaman yang Perlu Kamu Buat

Untuk SaaS Docsly:

## Pricing Page

```
/pricing
```

---

## Checkout Page

```
/checkout
```

Isi:

* paket
* ringkasan
* harga
* metode pembayaran

---

## Payment Success

```
/payment/success
```

Contoh:

```
🎉 Payment Successful

Your Docsly Pro plan is active.

Start creating documents.
```

---

## Payment Failed

```
/payment/failed
```

---

## Subscription Management

```
/settings/subscription
```

Isi:

```
Current Plan

Docsly Pro

Renews:
14 August 2026


[Upgrade]

[Cancel Subscription]
```

---

# 10. Security yang Wajib

Jangan simpan:

❌ Server Key Midtrans di frontend

Hanya:

Backend:

```
MIDTRANS_SERVER_KEY
```

Frontend:

```
MIDTRANS_CLIENT_KEY
```

Environment:

```
.env

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
```

---

# Saran Saya untuk Docsly

Dengan kondisi Docsly sekarang:

✅ Buat UI pricing dan checkout sendiri
✅ Gunakan Midtrans Snap Embed
✅ Backend handle transaksi
✅ Gunakan webhook Midtrans
✅ Buat subscription system sendiri di Supabase
✅ Jangan membuat recurring payment dulu

Untuk awal, gunakan model:

```
User bayar manual setiap bulan

↓

Midtrans

↓

Aktifkan paket

↓

Reminder sebelum expired
```

Setelah user banyak, baru pertimbangkan:

* auto renewal
* subscription billing otomatis

---

Menurut saya kombinasi ini paling cocok untuk Docsly karena kamu mendapatkan:

* UX premium seperti SaaS modern
* keamanan payment dari Midtrans
* fleksibilitas mengatur paket Free Trial/Pro/Premium sendiri
* tidak terikat tampilan checkout bawaan Midtrans.
