Menurut saya untuk Docsly, landing page **jangan dibuat seperti landing page SaaS AI biasa** yang hanya berisi:

> Hero → Feature → Pricing → Footer

Karena sekarang banyak produk AI menggunakan pola yang sama. Docsly memiliki positioning yang cukup kuat: **AI Workspace untuk membuat dan menyelesaikan dokumen**, jadi landing page harus memberikan kesan:

> "Ini adalah aplikasi profesional tempat dokumen dibuat, bukan sekadar chatbot AI."

Konsep visual yang saya sarankan:

**Clean White Tech + Premium SaaS + Subtle 3D Interaction**

Referensi rasa:

* Linear
* Notion
* Framer
* Raycast
* Vercel
* Perplexity

Tetapi tetap memiliki identitas Docsly sendiri.

---

# 1. Konsep Design Utama Docsly Landing Page

## Tema

Background:

```text
Pure White
+
Soft Gray
+
Subtle Gradient
+
Glass Effect
+
3D Floating Object
```

Jangan gunakan:

❌ Neon berlebihan
❌ Banyak card warna-warni
❌ Gradient besar seperti website AI template
❌ Terlalu banyak animasi

---

# 2. Tech Stack yang Saya Sarankan

Karena Docsly sudah menggunakan Next.js, gunakan stack ini:

## Framework

### Next.js App Router

Tetap:

```
Next.js
React
TypeScript
Tailwind CSS
```

---

# UI Component

## Shadcn UI

Gunakan untuk:

* Button
* Dialog
* Navbar
* Cards
* Accordion FAQ

Alasan:

* clean
* mudah dikustom
* tidak terlihat seperti template

---

# Animation

## Framer Motion

Wajib.

Untuk:

* page transition
* fade in
* scroll animation
* hover effect
* micro interaction

Install:

```bash
npm install framer-motion
```

Contoh:

Hero text:

Masuk dari bawah:

```
opacity 0
y:40

↓

opacity 1
y:0
```

---

# 3D Animation

Untuk yang kamu inginkan:

> "animasi 3D mengikuti cursor"

Saya sarankan:

## React Three Fiber

Library:

```
three.js
+
@react-three/fiber
+
@react-three/drei
```

Install:

```bash
npm install three @react-three/fiber @react-three/drei
```

Gunakan untuk membuat:

* floating document
* AI orb
* abstract workspace object

Contoh:

Hero:

```
              AI Core


        _________
       /        /
      / DOC    /
     /________/


cursor bergerak

↓

object mengikuti arah cursor
```

---

# 4. Cursor Interaction

Gunakan:

## react-use-gesture

atau native pointer event.

Efek:

Cursor bergerak kanan:

Object sedikit rotate kanan.

Cursor bergerak kiri:

Object rotate kiri.

Jangan terlalu besar.

Pergerakan:

```javascript
rotation:

x: 5deg

y: 10deg
```

bukan:

```javascript
rotate 180deg
```

Karena terlihat gimmick.

---

# 5. Struktur Landing Page Docsly

Saya sarankan:

```
Landing Page

Navbar

Hero

Problem Section

Solution

How Docsly Works

Features

AI Workspace Demo

Collaboration

Templates

Pricing

FAQ

CTA

Footer

```

---

# DETAIL SETIAP SECTION

---

# Navbar

Design:

Minimal.

```
-------------------------------------------------

Docsly logo


Product
Features
Pricing
FAQ


        Login
        Start Free Trial

-------------------------------------------------
```

Button:

Primary:

```
Start Free Trial
```

Secondary:

```
Login
```

---

Behavior:

Navbar sticky.

Saat scroll:

background:

```
white/80%

backdrop blur
```

---

# Hero Section

Ini bagian paling penting.

Jangan:

> "The best AI document platform"

Terlalu umum.

Gunakan value proposition.

Contoh:

```
Create better documents,
with an AI that understands your work.


Docsly combines AI writing,
document editing, and collaboration
in one intelligent workspace.


[Start Free Trial]

No credit card required
30 days full access

```

---

Sisi kanan:

3D object.

Konsep:

```
AI-powered document workspace

       floating document

          ✨

       AI assistant
```

---

# Animasi Hero

Saat load:

Text:

```
fade up
stagger
```

Button:

hover:

```
scale 1.05
```

3D:

idle animation:

```
floating up/down
2 seconds loop
```

---

# Problem Section

Jangan langsung fitur.

Jelaskan masalah.

Contoh:

```
Creating documents shouldn't
feel complicated.

People spend hours:
- formatting documents
- fixing structure
- managing references
- rewriting content

Docsly changes that.
```

---

Visual:

Gunakan animasi:

Dokumen berantakan:

↓

menjadi:

Dokumen rapi.

---

# Solution Section

```
Meet Docsly AI Workspace

One place to create,
improve, and manage documents.
```

---

Buat 3 kartu:

## AI Writing

AI membantu membuat isi.

## Smart Editing

Perbaikan format otomatis.

## Collaboration

Kerja bersama realtime.

---

# Feature Section

Jangan buat 20 fitur.

Ambil fitur utama.

Saya pilih:

## AI Document Agent

Visual:

Chat + document.

---

## Smart Formatting

Visual:

Before:

```
text berantakan
```

After:

```
document profesional
```

---

## Citation Assistant

Visual:

Reference otomatis.

---

## Real-time Collaboration

Visual:

Cursor beberapa user.

---

# AI Workspace Demo

Ini menurut saya bagian yang bisa membuat Docsly berbeda.

Buat simulasi:

```
Browser window


Document


AI Chat


Sidebar


```

Dengan animasi:

* cursor bergerak
* text muncul otomatis
* AI response muncul

Jangan hanya gambar screenshot.

Buat menggunakan React component.

---

# Template Section

Tampilkan:

```
Popular Templates

📄 Thesis

📄 Proposal

📄 Resume

📄 Report

```

Dengan hover:

card naik sedikit.

---

# Pricing Preview

Jangan terlalu detail.

Cukup:

```
Free Trial

30 days full access

Try all Docsly features

[Start Free Trial]

```

---

# FAQ

Gunakan:

Shadcn Accordion.

Pertanyaan:

* What is Docsly?
* How does AI work?
* Is my document private?
* Can I collaborate?
* How does Free Trial work?

---

# Final CTA

Bagian sebelum footer:

```
Ready to transform
the way you create documents?


Start using Docsly today.

[Try Docsly Free]

```

---

# Footer Profesional

Jangan footer kecil.

Buat seperti SaaS.

Struktur:

```
Docsly


Product

Features
Pricing
Templates


Resources

FAQ
Support
Documentation


Company

About
Contact
Privacy
Terms


Social

Instagram
LinkedIn
Twitter


© 2026 Docsly

```

---

# Library Tambahan yang Saya Rekomendasikan

## 1. Lenis Smooth Scroll

Untuk smooth scrolling premium.

```bash
npm install lenis
```

Efek:

Scroll terasa seperti website premium.

---

## 2. React Three Fiber

Untuk 3D.

```bash
npm install three @react-three/fiber @react-three/drei
```

---

## 3. Framer Motion

Animation utama.

```bash
npm install framer-motion
```

---

## 4. GSAP (Optional)

Kalau ingin animasi lebih kompleks.

Untuk:

* timeline animation
* text reveal
* advanced scroll

Namun jangan gunakan semuanya sekaligus.

Rekomendasi:

```
Framer Motion
+
React Three Fiber
+
Lenis
```

sudah cukup.

---

# Struktur Folder

Saya sarankan:

```
app
 |
 └── page.tsx


components
 |
 ├── landing
 │
 ├── Navbar.tsx
 ├── Hero.tsx
 ├── Problem.tsx
 ├── Features.tsx
 ├── Demo.tsx
 ├── Pricing.tsx
 ├── FAQ.tsx
 ├── CTA.tsx
 ├── Footer.tsx
 │
 └── 3d
     └── DocumentScene.tsx

```

---

# Prompt Implementasi untuk AI Coding Assistant

Gunakan ini:

```
Buat landing page premium untuk Docsly menggunakan Next.js App Router, TypeScript, dan Tailwind CSS.

Landing page harus terlihat seperti produk SaaS teknologi modern, bukan template AI biasa.

Design direction:

- White elegant background
- Professional technology feeling
- Minimal
- Premium SaaS style
- Inspired by Linear, Notion, Vercel, Raycast
- Avoid generic AI landing page design


Implementasikan:

1. Navbar:
- Docsly logo
- Product
- Features
- Pricing
- FAQ
- Login button
- Signup / Start Free Trial button
- Sticky navbar dengan blur effect


2. Hero:
- Strong headline
- Explanation Docsly AI Workspace
- CTA button:
  Start Free Trial
  Login
- Mention:
  30 days free trial
- Add interactive 3D scene


3. 3D:
Gunakan React Three Fiber.
Buat floating document + AI workspace object.
Object harus:
- mengikuti cursor movement
- smooth rotation
- subtle floating animation
- tidak terlihat seperti template AI


4. Animation:
Gunakan Framer Motion:
- fade up animation
- stagger children
- smooth section reveal
- hover micro interaction


5. Sections:
- Problem
- Solution
- Features
- AI Workspace Demo
- Collaboration
- Templates
- Pricing
- FAQ
- Final CTA
- Footer


6. Gunakan:
- shadcn/ui
- Framer Motion
- React Three Fiber
- Lenis smooth scrolling


7. Buat reusable component.
Jangan membuat satu file page.tsx besar.


8. Design:
- consistent spacing
- premium typography
- responsive desktop/mobile
- clean white theme
- subtle border
- no excessive shadow
- no excessive gradient


Landing page harus memberikan kesan bahwa Docsly adalah AI productivity platform profesional.
```

---

Saran terakhir saya: **jangan terlalu mengejar banyak animasi**. Landing page premium biasanya justru menang karena animasinya halus dan terasa "mahal". Untuk Docsly, kombinasi yang menurut saya paling kuat adalah:

**Hero 3D document + cursor interaction + smooth scroll + AI workspace demo interaktif.**

Itu sudah cukup membuatnya terlihat seperti produk SaaS serius, bukan sekadar website promosi.
