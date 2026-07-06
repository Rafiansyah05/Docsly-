PANDUAN DEVELOPMENT & INTEGRASI TECH STACK
DOCSLY
AI Office Agent — Dari Nol Sampai Live di Domain Sendiri
Dokumen Panduan Teknis Implementasi
Domain Produksi: docsly.space
Versi 1.0 — Juli 2026
Disusun sebagai pendamping teknis dari Product Requirement Document (PRD) Docsly
 
0. TENTANG DOKUMEN INI
Dokumen ini adalah panduan teknis step-by-step untuk mengintegrasikan seluruh tech stack Docsly (sesuai Bab 5 PRD) agar aplikasi benar-benar bisa berjalan end-to-end: dari database, backend, frontend, AI, hingga hosting dan deployment ke domain produksi docsly.space.
Dokumen ini TIDAK menggantikan PRD — dokumen ini menjawab pertanyaan "bagaimana cara menyambungkan semua komponen ini secara teknis", sedangkan PRD menjawab "apa yang harus dibangun dan mengapa". Gunakan keduanya bersamaan, dan gunakan dokumen ini bersama file Rencana Sprint & Prompt AI Agent (dokumen kedua) saat melakukan vibecoding.
Cara Pakai Dokumen Ini
Ikuti urutan bab secara berurutan (1 → 14). Setiap bab dirancang agar tidak bergantung pada bab yang belum dikerjakan. Jangan lompat ke bab deployment (Bab 12–14) sebelum bab database, backend, dan frontend selesai berjalan di lokal (local development).
1. PRASYARAT & AKUN YANG DIPERLUKAN
1.1 Tools Lokal
•	Node.js versi 20 LTS ke atas + npm/pnpm
•	Git + akun GitHub
•	Code editor (VS Code direkomendasikan)
•	Docker Desktop (opsional, untuk menjalankan Supabase lokal / LibreOffice headless)
1.2 Akun Layanan (Buat Semua di Awal)
Layanan	Fungsi	Tier Awal
Supabase	Database PostgreSQL, Auth, Storage	Free tier
Cloudflare	DNS, CDN, R2 Storage (opsional)	Free tier
Vercel	Hosting Frontend Next.js	Hobby/Free
Railway atau Fly.io	Hosting Backend + Worker AI	Free/Starter
Anthropic Console (console.anthropic.com)	API Key model Claude untuk AI Agent	Pay-as-you-go
GitHub	Repository + CI/CD (GitHub Actions)	Free
Resend	Email transaksional (verifikasi, notifikasi)	Free tier
Sentry	Error tracking FE & BE	Free tier
Registrar domain (tempat beli docsly.space)	Kepemilikan & pengaturan DNS domain	Sudah dimiliki

Penting
Simpan seluruh API Key, connection string, dan credential di file .env — JANGAN PERNAH commit file .env ke Git. Tambahkan .env ke .gitignore sejak commit pertama.
2. STRUKTUR REPOSITORY PROJECT
Karena tim kecil (3–6 orang), gunakan struktur monorepo sederhana agar frontend dan backend mudah dikelola bersama tanpa overhead tooling monorepo yang kompleks (Turborepo/Nx opsional bila tim sudah nyaman).
docsly/
├── apps/
│   ├── web/              # Next.js 14 (App Router) — Frontend + Tiptap Editor
│   └── api/              # NestJS — Backend (Auth proxy, AI Agent, Export, dst)
├── packages/
│   └── shared-types/     # Tipe TypeScript bersama FE-BE (opsional)
├── .github/workflows/    # GitHub Actions CI/CD
├── package.json
└── README.md
Alternatif tercepat untuk MVP awal (sesuai catatan Bab 5 PRD): gunakan Next.js API Routes saja tanpa NestJS terpisah, lalu migrasi ke NestJS saat tim/fitur bertambah. Panduan ini mengasumsikan struktur terpisah (apps/web + apps/api) karena lebih mudah di-scale saat proses AI (job asinkron) perlu dijalankan sebagai service mandiri.
3. SETUP DATABASE — SUPABASE (POSTGRESQL)
3.1 Membuat Project Supabase
1.	Buka supabase.com → New Project.
2.	Pilih region terdekat dengan mayoritas target pengguna (misalnya Singapore untuk latensi terbaik ke Indonesia).
3.	Simpan Database Password yang digenerate — ini dibutuhkan untuk connection string.
4.	Setelah project aktif, buka Project Settings → API untuk mengambil: Project URL, anon public key, dan service_role key (rahasia, hanya untuk backend).
3.2 Membuat Skema Tabel Sesuai Bab 6 PRD
Buat migration SQL berdasarkan entitas pada Bab 6.1 PRD (User, Workspace, Document, Document Version, AI Conversation, Prompt History, Subscription, Usage, Settings, Attachment, Image Placeholder, Reference, Bibliography Entry). Jalankan lewat Supabase SQL Editor atau via CLI migration.
-- Contoh potongan schema inti (jalankan di Supabase SQL Editor)
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  nama_workspace text not null,
  dibuat_pada timestamptz default now()
);
 
create table documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) not null,
  judul text not null,
  jenis_dokumen text,
  status text default 'draft',
  konten_json_terkini jsonb,
  dibuat_pada timestamptz default now(),
  diperbarui_pada timestamptz default now()
);
 
create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) not null,
  konten_json_snapshot jsonb,
  ringkasan_perubahan text,
  dibuat_oleh text,
  dibuat_pada timestamptz default now()
);
 
-- Lanjutkan pola yang sama untuk ai_conversations, prompt_history,
-- subscriptions, usage, settings, attachments, image_placeholders,
-- "references", bibliography_entries sesuai atribut kunci di Bab 6.1 PRD
3.3 Mengaktifkan Row Level Security (RLS)
Wajib diaktifkan sejak awal (Bab 3.2 NFR PRD — isolasi data antar pengguna). Tanpa RLS aktif, seluruh baris tabel dapat diakses lintas akun.
alter table workspaces enable row level security;
alter table documents enable row level security;
 
create policy "User hanya akses workspace miliknya"
  on workspaces for all
  using (auth.uid() = user_id);
 
create policy "User hanya akses dokumen di workspace miliknya"
  on documents for all
  using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );
Ulangi pola RLS ini untuk seluruh tabel yang menyimpan data milik pengguna. Uji dengan dua akun berbeda untuk memastikan tidak ada kebocoran data lintas akun sebelum lanjut ke bab berikutnya.
4. SETUP AUTENTIKASI — SUPABASE AUTH
5.	Di Supabase Dashboard → Authentication → Providers, aktifkan Email dan Google.
6.	Untuk Google SSO: buat OAuth Client ID di Google Cloud Console, tambahkan Authorized redirect URI dari Supabase (format: https://<project-ref>.supabase.co/auth/v1/callback).
7.	Salin Client ID & Client Secret Google ke pengaturan provider Google di Supabase.
8.	Di frontend, gunakan @supabase/ssr atau @supabase/auth-helpers-nextjs agar session token (JWT) tersimpan sebagai httpOnly cookie (bukan localStorage), sesuai requirement keamanan Bab 3.3 PRD.
9.	Buat halaman redirect callback (/auth/callback) di Next.js untuk menukar OAuth code menjadi session.
Cek Keamanan
Pastikan refresh token TIDAK disimpan di localStorage. Gunakan cookie httpOnly + secure agar risiko XSS berkurang, sesuai Bab 3.3 PRD.
5. SETUP STORAGE — SUPABASE STORAGE / CLOUDFLARE R2
Storage dipakai untuk menyimpan file yang diunggah pengguna (gambar untuk Image Placeholder, dokumen DOCX/PDF yang diupload untuk dikonversi) dan file hasil export.
5.1 Opsi A — Supabase Storage (Paling Cepat untuk MVP)
10.	Di Supabase Dashboard → Storage, buat bucket baru: user-uploads dan document-exports.
11.	Set bucket bersifat private, lalu buat policy akses berbasis auth.uid() agar hanya pemilik dokumen yang bisa membaca/menulis file miliknya.
5.2 Opsi B — Cloudflare R2 (Direkomendasikan Saat Volume Bertambah, Bab 5 PRD)
12.	Di dashboard Cloudflare → R2, buat bucket baru (misalnya docsly-storage).
13.	Buat R2 API Token (Manage R2 API Tokens) dengan permission Object Read & Write, simpan Access Key ID dan Secret Access Key.
14.	Karena R2 kompatibel dengan S3 API, gunakan SDK AWS S3 (@aws-sdk/client-s3) di backend dengan endpoint khusus R2:
// backend .env
R2_ACCOUNT_ID=xxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxx
R2_BUCKET=docsly-storage
R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
15.	R2 tidak mengenakan biaya egress (data keluar) — cocok untuk file dokumen dan gambar pengguna yang terus bertambah, sesuai alasan pemilihan di Bab 5 PRD.
6. SETUP BACKEND — NESTJS / NEXT.JS API ROUTES
6.1 Inisialisasi & Environment Variables
# apps/api/.env
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx   # rahasia, jangan expose ke frontend
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
REDIS_URL=redis://default:<password>@<host>:<port>
RESEND_API_KEY=re_xxxxxxxx
SENTRY_DSN=https://xxxxxxxx
R2_ENDPOINT=... (lihat Bab 5.2)
NODE_ENV=development
6.2 Modul Utama Backend (Sejalan dengan Bab 2 & Bab 4 PRD)
•	AuthModule — validasi JWT dari Supabase pada setiap request terproteksi.
•	DocumentModule — CRUD dokumen, versioning (Bab 3.8), autosave endpoint (Bab 3.9).
•	AiAgentModule — Context Builder, Intent Classifier, Task Executor, Diff Renderer (Bab 2.2).
•	ExportModule — generate DOCX (library docx) dan PDF (LibreOffice headless / Puppeteer).
•	UploadModule — terima file DOCX/PDF, ekstraksi (Mammoth.js/pandoc), OCR untuk PDF scan (Bab 2.11).
•	QueueModule — job asinkron via BullMQ + Redis untuk proses AI berat (Bab 3.4).
6.3 Setup Message Queue (BullMQ + Redis)
Wajib untuk proses AI berat (pembuatan dokumen penuh) agar tidak blocking request dan tahan lonjakan trafik, sesuai NFR Scalability Bab 3.4.
npm install bullmq ioredis --save
 
// queue.module.ts (ringkas)
import { BullModule } from '@nestjs/bullmq';
BullModule.forRoot({
  connection: { url: process.env.REDIS_URL },
});
Redis dapat dihosting via Railway/Upstash/Redis Cloud tier gratis untuk tahap awal.
7. INTEGRASI AI — CLAUDE API & MODEL ROUTING
7.1 Setup API Key
16.	Buat akun di console.anthropic.com, generate API Key.
17.	Simpan sebagai ANTHROPIC_API_KEY di environment backend (JANGAN di frontend — semua panggilan AI harus lewat backend agar API key tidak bocor ke klien).
7.2 Instalasi SDK
npm install @anthropic-ai/sdk --save
# atau gunakan Vercel AI SDK untuk abstraksi streaming + tool-calling seragam:
npm install ai @ai-sdk/anthropic --save
7.3 Model Routing (Sesuai Bab 4.2 PRD)
Gunakan tier ekonomis (setara Haiku) sebagai default untuk seluruh tugas transformasi teks (grammar, ringkas, perpanjang), dan eskalasi ke tier menengah hanya untuk tugas yang membutuhkan penalaran lebih dalam (outline dokumen kompleks, argumentasi ilmiah).
// ai-router.service.ts (contoh sederhana)
function pilihModel(jenisTugas: string) {
  const tugasRingan = ['grammar_check', 'ringkas', 'perpanjang', 'ubah_gaya'];
  if (tugasRingan.includes(jenisTugas)) {
    return 'claude-haiku-4-5-20251001/gemini-flash'; // tier ekonomis
  }
  return 'claude-sonnet-5'; // tier menengah, untuk outline/argumentasi kompleks
}
Catatan Model
Nama model string berubah dari waktu ke waktu. Selalu cek console.anthropic.com atau docs.claude.com untuk daftar model string terbaru sebelum deploy ke production.
7.4 Context Builder & Output Terstruktur
Sesuai arsitektur fungsional Bab 2.2 PRD, AI harus menghasilkan JSON patch terhadap struktur dokumen Tiptap, bukan teks bebas. Gunakan tool-calling / structured output (system prompt yang mewajibkan output JSON saja) agar hasil AI dapat dipetakan langsung ke Diff Renderer di editor.
7.5 Efisiensi Biaya (Bab 4.3 PRD)
•	Caching: simpan hash instruksi + hasil di Redis/DB untuk instruksi identik.
•	Context Compression: untuk dokumen panjang, kirim ringkasan heading, bukan seluruh isi.
•	Chunking: proses per bab/bagian untuk instruksi lokal.
•	Conversation Memory: simpan metadata terstruktur (jenis dokumen, jawaban Smart Question), bukan seluruh riwayat chat mentah.
8. INTEGRASI EDITOR (TIPTAP) & DOCUMENT PROCESSING
8.1 Setup Tiptap di Frontend
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit --save
npm install @tiptap/extension-table @tiptap/extension-table-row \
  @tiptap/extension-table-cell @tiptap/extension-table-header \
  @tiptap/extension-image @tiptap/extension-link --save
Bangun extension kustom untuk page-layout (header/footer/margin/page-break) karena tidak tersedia bawaan di Tiptap (lihat pembahasan Bab 2.1 PRD). Simpan konten sebagai JSON terstruktur (editor.getJSON()), bukan HTML, agar mudah dipetakan ke DOCX saat export.
8.2 Export ke DOCX (Node.js library docx)
npm install docx --save
# Backend: petakan setiap node JSON Tiptap (heading, paragraph, table, image)
# ke elemen library docx (Paragraph, TextRun, Table, ImageRun) secara terprogram.
8.3 Export ke PDF (Konsisten dari DOCX)
Sesuai pertimbangan teknis Bab 2.10 PRD: PDF diturunkan dari DOCX yang sudah jadi (bukan proses terpisah), agar hasil visual PDF-DOCX konsisten.
# Install LibreOffice headless di server backend (Docker image direkomendasikan)
soffice --headless --convert-to pdf --outdir ./output ./generated.docx
8.4 Upload & Konversi Dokumen Lama (Bab 2.11 PRD)
•	DOCX → gunakan Mammoth.js atau pandoc untuk ekstraksi struktur ke JSON Tiptap.
•	PDF berbasis teks → ekstraksi struktur langsung (akurasi lebih rendah dari DOCX).
•	PDF hasil scan → jalankan OCR (Tesseract open-source, atau API OCR pihak ketiga) sebelum konversi ke struktur editor.
9. SETUP FRONTEND — NEXT.JS 14
9.1 Inisialisasi Project
npx create-next-app@latest apps/web --typescript --tailwind --app
cd apps/web
npm install @supabase/ssr @supabase/supabase-js --save
9.2 Environment Variables Frontend
# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx   # aman untuk publik, dibatasi RLS
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001   # ganti ke URL backend produksi saat deploy
9.3 Menyambungkan Frontend ke Backend & Supabase
•	Buat Supabase client di lib/supabase/client.ts (browser) dan lib/supabase/server.ts (server component), sesuai pola @supabase/ssr.
•	Seluruh permintaan AI Agent, export, dan upload dikirim ke NEXT_PUBLIC_API_BASE_URL (backend), bukan langsung ke Supabase, agar API key AI tetap aman di backend.
•	Sertakan JWT Supabase (via cookie) pada header Authorization saat memanggil backend agar backend dapat memvalidasi identitas pengguna.
9.4 Menjalankan Semuanya di Lokal (Local Development)
# Terminal 1 — Backend
cd apps/api && npm run start:dev     # berjalan di http://localhost:3001
 
# Terminal 2 — Frontend
cd apps/web && npm run dev           # berjalan di http://localhost:3000
 
# Terminal 3 (opsional) — Redis lokal untuk queue
docker run -p 6379:6379 redis
Checkpoint Wajib
Sebelum lanjut ke bab hosting/deployment, pastikan alur berikut sudah berjalan 100% di lokal: register/login → buat dokumen → AI Agent merespons → export DOCX berhasil dibuka di Microsoft Word. Ini adalah syarat minimum sebelum production.
10. CI/CD DENGAN GITHUB ACTIONS
Sesuai rekomendasi Bab 5 PRD, gunakan GitHub Actions untuk lint, test, dan build otomatis setiap push/pull request, sebelum deployment ke Vercel/Railway.
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run lint
      - run: npm run build
Vercel akan otomatis membangun preview deployment untuk setiap pull request bila repository dihubungkan langsung ke project Vercel — ini terjadi otomatis tanpa perlu ditulis manual di workflow di atas.
11. MONITORING, LOGGING, ERROR TRACKING & EMAIL
11.1 Sentry (Error Tracking)
npm install @sentry/nextjs --save   # untuk apps/web
npm install @sentry/node --save     # untuk apps/api
npx @sentry/wizard@latest -i nextjs
11.2 Better Stack / UptimeRobot (Status Page & Uptime)
•	Daftarkan endpoint health-check backend (misalnya GET /health) dan URL frontend produksi ke UptimeRobot/Better Stack.
•	Aktifkan status page publik sederhana sesuai NFR Availability Bab 3.5 PRD untuk transparansi insiden.
11.3 PostHog (Product Analytics)
npm install posthog-js --save   # frontend tracking
11.4 Resend (Email Transaksional)
npm install resend --save
// backend .env
RESEND_API_KEY=re_xxxxxxxx
// Digunakan untuk: verifikasi email, reset password, notifikasi AI selesai bekerja
11.5 Logging Terstruktur
Sesuai Bab 3.6 PRD, catat setiap permintaan AI dalam format JSON (jenis instruksi, waktu respons, status, token input/output) ke tabel Prompt History — data ini juga dipakai untuk estimasi biaya AI (Bab 8.2 PRD).
12. DEPLOYMENT KE PRODUCTION
12.1 Deploy Frontend (Vercel)
18.	Push repository ke GitHub (branch main untuk production).
19.	Buka vercel.com → New Project → Import repository GitHub Docsly.
20.	Set Root Directory ke apps/web (karena struktur monorepo).
21.	Framework Preset otomatis terdeteksi sebagai Next.js.
22.	Tambahkan seluruh Environment Variables produksi (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_API_BASE_URL — arahkan ke URL backend produksi dari Bab 12.2) di menu Vercel → Settings → Environment Variables.
23.	Klik Deploy. Vercel akan memberi URL sementara (contoh: docsly.vercel.app) untuk verifikasi awal sebelum domain custom dipasang.
12.2 Deploy Backend (Railway atau Fly.io)
Contoh menggunakan Railway (alur Fly.io serupa: buat app, set env var, deploy via CLI/GitHub):
24.	Buka railway.app → New Project → Deploy from GitHub Repo, pilih repository Docsly.
25.	Set Root Directory ke apps/api.
26.	Tambahkan Redis sebagai service tambahan di Railway (Add Service → Database → Redis) — Railway akan otomatis menyediakan REDIS_URL.
27.	Tambahkan seluruh Environment Variables backend (Bab 6.1: DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, RESEND_API_KEY, SENTRY_DSN, R2 credentials).
28.	Railway akan memberi domain sementara (contoh: docsly-api.up.railway.app) — catat URL ini, akan dipakai sebagai NEXT_PUBLIC_API_BASE_URL produksi di Vercel.
29.	Kembali ke Vercel, update NEXT_PUBLIC_API_BASE_URL dengan URL backend Railway ini, lalu redeploy frontend.
Verifikasi Sebelum Lanjut
Akses URL Vercel sementara dan pastikan seluruh alur (login, buat dokumen, AI Agent, export) berjalan normal menggunakan backend production Railway, SEBELUM memasang custom domain di Bab 13.
13. DEPLOYMENT DENGAN DOMAIN docsly.space
Bab ini menjelaskan cara menghubungkan domain yang sudah Anda beli (docsly.space) ke frontend (Vercel) dan backend (Railway/Fly.io), dengan opsi menambahkan Cloudflare sebagai lapisan DNS + CDN + proteksi tambahan (sesuai rekomendasi Bab 5 PRD).
13.1 Rencana Struktur Subdomain
Subdomain	Digunakan Untuk	Diarahkan Ke
docsly.space (root/apex)	Aplikasi utama Docsly (Frontend)	Vercel
www.docsly.space	Redirect ke root domain	Vercel
api.docsly.space	Backend API	Railway/Fly.io
status.docsly.space (opsional)	Status page publik (Bab 3.5)	Better Stack/UptimeRobot

13.2 Opsi A — Domain Langsung ke Vercel (Tanpa Cloudflare Proxy)
Opsi paling sederhana bila Anda belum butuh fitur Cloudflare (CDN/WAF tambahan) di awal Beta.
30.	Login ke akun registrar tempat docsly.space dibeli, buka pengaturan DNS domain tersebut.
31.	Di Vercel Dashboard → Project → Settings → Domains, tambahkan docsly.space dan www.docsly.space.
32.	Vercel akan menampilkan instruksi record DNS yang harus ditambahkan, umumnya:
Tipe    Nama    Nilai
A       @       76.76.21.21          (IP Vercel untuk apex domain)
CNAME   www     cname.vercel-dns.com
33.	Tambahkan kedua record tersebut di panel DNS registrar Anda.
34.	Tunggu propagasi DNS (umumnya 5 menit – 24 jam). Vercel otomatis menerbitkan sertifikat SSL (HTTPS) begitu DNS terverifikasi.
35.	Untuk backend: di Railway → Settings → Networking → Custom Domain, tambahkan api.docsly.space, lalu tambahkan record CNAME yang diberikan Railway ke panel DNS registrar.
13.3 Opsi B — Domain via Cloudflare (Direkomendasikan, Sesuai Bab 5 PRD)
Cloudflare disebutkan dalam PRD sebagai bagian dari strategi Storage (R2) dan dapat sekaligus difungsikan sebagai DNS + CDN + proteksi dasar (rate limiting, DDoS protection) untuk domain docsly.space tanpa biaya tambahan.
36.	Buka dashboard.cloudflare.com → Add a Site → masukkan docsly.space.
37.	Pilih paket Free.
38.	Cloudflare akan memindai record DNS yang ada dan memberi Anda 2 nameserver baru (contoh: aisha.ns.cloudflare.com, walt.ns.cloudflare.com).
39.	Kembali ke panel registrar tempat domain dibeli, ganti Nameserver domain dari nameserver default registrar ke 2 nameserver Cloudflare tersebut.
40.	Tunggu propagasi (bisa sampai 24 jam, biasanya lebih cepat). Status di Cloudflare akan berubah menjadi Active.
41.	Setelah aktif, tambahkan record DNS di Cloudflare (DNS → Records):
Tipe    Nama    Konten                   Proxy status
A       @       76.76.21.21              DNS only (abu-abu) *lihat catatan
CNAME   www     cname.vercel-dns.com     DNS only
CNAME   api     <target-dari-railway>    DNS only
Catatan Penting soal Proxy Cloudflare (Ikon Awan)
Untuk domain yang mengarah ke Vercel/Railway, set status proxy menjadi "DNS only" (ikon awan abu-abu, bukan oranye) pada tahap awal. Proxy oranye Cloudflare dapat mengganggu penerbitan SSL otomatis Vercel/Railway dan menyebabkan konflik sertifikat. Setelah domain terbukti berjalan stabil, proxy oranye dapat diaktifkan bertahap khusus untuk kebutuhan CDN/WAF dengan pengaturan SSL Mode "Full (Strict)" di Cloudflare agar tidak terjadi redirect loop.
42.	Di Vercel → Settings → Domains, tambahkan docsly.space dan www.docsly.space seperti pada Opsi A — Vercel akan memverifikasi otomatis karena DNS sudah aktif di Cloudflare.
43.	Di Railway → Networking → Custom Domain, tambahkan api.docsly.space dan ikuti instruksi CNAME yang diberikan.
44.	Set SSL/TLS Mode di Cloudflare (SSL/TLS → Overview) ke Full (Strict) agar koneksi Cloudflare ↔ Vercel/Railway tetap terenkripsi end-to-end.
13.4 Update Environment Variables ke Domain Produksi
Setelah domain aktif, perbarui environment variables agar seluruh sistem mengacu ke domain docsly.space, bukan lagi URL sementara Vercel/Railway:
# Vercel (Frontend) — Production Environment Variables
NEXT_PUBLIC_API_BASE_URL=https://api.docsly.space
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
 
# Railway (Backend) — Production Environment Variables
FRONTEND_URL=https://docsly.space
CORS_ORIGIN=https://docsly.space
45.	Update juga Redirect URL di Supabase → Authentication → URL Configuration: Site URL = https://docsly.space, dan tambahkan https://docsly.space/auth/callback pada Redirect URLs (penting agar login Google SSO tidak gagal redirect di production).
46.	Update Authorized redirect URI di Google Cloud Console OAuth Client menjadi domain produksi Supabase (biasanya tidak berubah karena redirect tetap ke Supabase, bukan ke docsly.space langsung — namun tetap cek Authorized JavaScript origins agar mencantumkan https://docsly.space).
47.	Redeploy frontend dan backend setelah environment variable diperbarui agar perubahan berlaku.
13.5 Verifikasi Akhir Domain
•	Buka https://docsly.space — pastikan SSL valid (gembok hijau di browser, tanpa peringatan not secure).
•	Uji alur register/login (termasuk Google SSO) di domain docsly.space, bukan lagi di URL sementara Vercel.
•	Uji panggilan AI Agent dari https://docsly.space — pastikan tidak ada error CORS ke api.docsly.space.
•	Uji export DOCX/PDF berjalan normal di domain produksi.
•	Cek www.docsly.space otomatis redirect ke docsly.space (atau sebaliknya, sesuai preferensi) tanpa error.
14. CHECKLIST AKHIR SEBELUM RILIS BETA
•	Seluruh RLS policy database sudah diuji dengan dua akun berbeda (tidak ada kebocoran data).
•	Backup database otomatis harian aktif, retensi minimal 30 hari (Bab 3.7 PRD).
•	Autosave berjalan stabil termasuk saat koneksi tidak stabil (Bab 3.9 PRD).
•	Sentry sudah menangkap error dari frontend maupun backend production.
•	Status page publik aktif dan dapat diakses (Bab 3.5 PRD).
•	SSL aktif dan valid di docsly.space, www.docsly.space, dan api.docsly.space.
•	Environment variable production tidak ada yang masih menunjuk ke URL sementara (vercel.app / railway.app).
•	Uji ekspor DOCX dibuka di Microsoft Word tanpa peringatan kerusakan file.
•	Uji beban dasar: dokumen 50+ halaman tetap responsif di production (Bab 3.1 PRD).

Langkah Selanjutnya
Setelah seluruh checklist di atas terpenuhi, lanjutkan ke dokumen kedua — Rencana Sprint & Prompt AI Agent — untuk eksekusi pengembangan fitur secara bertahap dan terkontrol menggunakan AI coding agent (vibecoding).

