Kalau targetmu masih MVP/Beta, saya justru lebih menyarankan Mayar dibanding langsung menggunakan Midtrans atau Xendit, karena implementasinya lebih sederhana.

Arsitektur Payment Docsly
User
   │
   ▼
Pilih Paket
   │
   ▼
Docsly Backend (Next.js API)
   │
   ▼
Mayar API
   │
   ▼
Checkout Mayar
   │
   ▼
User Melakukan Pembayaran
   │
   ▼
Mayar Webhook
   │
   ▼
Docsly
   │
   ▼
Update Subscription
   │
   ▼
User Premium
Paket yang Dijual
Monthly
Paket	Harga
Pro	Rp39.000/bulan
Premium	Rp89.000/bulan

Nanti bisa ditambah Annual.

Misalnya

Pro

Rp390.000/tahun

(Hemat 2 bulan)

Premium

Rp890.000/tahun

Database yang Saya Sarankan
users
id
email
full_name

plan

plan

FREE_TRIAL
FREE
PRO
PREMIUM
subscriptions
id

user_id

plan

status

start_date

end_date

renewal

payment_provider

provider_subscription_id

provider_invoice_id

created_at

status

ACTIVE

EXPIRED

CANCELLED

PENDING
payments
id

user_id

invoice_id

transaction_id

amount

currency

payment_method

status

provider

created_at

status

pending

paid

expired

failed

refunded
Flow User Baru
Register

↓

Status

FREE_TRIAL

↓

trial_start

↓

trial_end

30 hari

↓

Semua fitur aktif

↓

AI Credit berjalan

↓

Hari ke-30

↓

Otomatis

FREE
Flow Upgrade

User

↓

Klik

Upgrade

↓

Pilih

Pro

↓

Backend

↓

Request

Mayar API

↓

Mayar membuat Checkout

↓

Mengembalikan URL Checkout

↓

Redirect User

↓

Bayar

↓

Webhook

↓

Docsly

↓

Update

PRO
Setelah Pembayaran Berhasil

Misalnya webhook mengirim

payment.received

Maka backend akan:

Verifikasi webhook.
Cari user.
Simpan transaksi.
Update subscription.
Aktifkan fitur.

Mayar menyediakan webhook untuk menerima event pembayaran secara real-time.

Ketika Langganan Habis

Cron Job

setiap jam

↓

cek

subscription.end_date

↓

Jika

today > end_date

↓

ubah

FREE

↓

AI Credit ikut berubah

↓

Storage tetap

↓

Dokumen tetap aman

AI Credit

Saat user upgrade

misalnya

Pro

500 Credit

Premium

1500 Credit

Saat downgrade

langsung

10 Credit / hari
Dashboard Subscription

Saya menyarankan membuat halaman khusus.

Misalnya

Settings

   └── Subscription

Berisi

Current Plan

FREE TRIAL

Sisa Trial

18 Hari

AI Credit

34 / 50

Storage

1.1 GB / 2 GB

Renewal

-

Upgrade Button

Kalau Pro

Current Plan

PRO

Renew

12 Agustus

Payment

Mayar

Manage Subscription
Webhook yang Perlu Dibuat

Saya menyarankan endpoint

POST

/api/payment/mayar/webhook

Flow

Mayar

↓

POST

/api/payment/mayar/webhook

↓

Verify

↓

Update Payment

↓

Update Subscription

↓

Response 200
Environment Variable
MAYAR_API_KEY=

MAYAR_BASE_URL=https://api.mayar.id/hl/v1

MAYAR_WEBHOOK_SECRET=

NEXT_PUBLIC_APP_URL=

SUPABASE_URL=

SUPABASE_SERVICE_ROLE=

Mayar menggunakan API Key dengan autentikasi Bearer dan menyediakan base URL untuk production maupun sandbox. API key dapat dibuat dari dashboard Mayar.