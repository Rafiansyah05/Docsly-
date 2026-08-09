Betul. Kalau **margin dan posisi di Canvas saat ini sudah benar**, maka AI Agent-mu **tidak seharusnya menyentuh logic Canvas sama sekali**.

Masalah yang perlu diselesaikan sekarang jauh lebih sempit:

> **Canvas adalah sumber referensi yang benar. Print Preview browser harus dibuat mengikuti posisi isi dari Canvas, bukan Canvas yang dipaksa mengikuti Print Preview.**

Dari screenshot-mu, saya justru menyarankan **stop dulu semua perubahan pada logic margin Canvas**.

---

# Masalah sebenarnya

Kondisinya sekarang kira-kira:

```text
                 DOCSLY

        ┌────────────────────┐
        │     CANVAS PAGE    │
        │                    │
        │  [CONTENT]         │
        │                    │
        └────────────────────┘
                 │
                 │
                 ▼
          PRINT RENDERER
                 │
                 ▼
        ┌────────────────────┐
        │    PRINT PAGE      │
        │                    │
        │                    │
        │                    │
        │       [CONTENT]    │
        │                    │
        └────────────────────┘

          ❌ posisi berbeda
```

Padahal yang kamu mau:

```text
        CANVAS PAGE
        ┌────────────────────┐
        │                    │
        │  [CONTENT]         │
        │                    │
        └────────────────────┘
                  │
                  │ gunakan
                  │ posisi yang sama
                  ▼
        PRINT PAGE
        ┌────────────────────┐
        │                    │
        │  [CONTENT]         │
        │                    │
        └────────────────────┘
```

Jadi **jangan utak-atik Canvas**.

---

# Saya akan mengubah pendekatannya

AI Agent-mu kemungkinan terlalu fokus pada:

> "Bagaimana membuat Canvas dan Print sama-sama A4?"

Padahal yang kamu minta sekarang adalah:

> **"Canvas saya sudah benar. Bagaimana membuat renderer Print menggunakan layout yang sama?"**

Ini perbedaan yang sangat besar.

---

# Instruksi yang harus kamu berikan ke AI Agent

Saya sarankan **kirim prompt di bawah ini secara utuh**, dan tekankan bagian `DO NOT MODIFY CANVAS`.

```text
STOP MODIFYING THE DOCSLY CANVAS MARGIN LOGIC.

The Canvas document layout is currently CORRECT.

I do NOT want you to redesign, recalculate, or modify the existing Canvas
page margins, padding, content position, page layout, or document margin
logic.

The Canvas is the SOURCE OF TRUTH.

The ONLY problem I want you to fix is:

THE CONTENT POSITION IN BROWSER PRINT PREVIEW MUST MATCH THE CONTENT POSITION
IN THE DOCSLY CANVAS PAGE.

Current situation:

Canvas:
- Page position is correct.
- Document content position is correct.
- Existing margin logic is correct.
- Existing page layout is correct.

Print Preview:
- The paper appears at a different visual scale.
- More importantly, the document content is positioned differently relative
  to the paper.
- The top offset/margin is different.
- The content appears significantly lower than in Canvas.
- Therefore the print renderer is NOT reproducing the same content geometry.

IMPORTANT:

DO NOT FIX THIS BY CHANGING THE CANVAS.

DO NOT:
- change Canvas margin values
- change Canvas padding
- change Canvas page height
- change Canvas page width
- change Canvas content offset
- change the existing margin calculation
- change the editor layout
- change the editor pagination logic
- change the user's document margin settings

Instead:

FIX ONLY THE PRINT RENDERER.

==================================================
CORE REQUIREMENT
==================================================

The existing Canvas layout is the reference.

For every page:

Canvas page
    ↓
measure content position relative to page
    ↓
Print renderer must reproduce the same geometry

The following relationship must remain identical:

contentTop - pageTop

contentLeft - pageLeft

contentWidth / pageWidth

contentHeight / pageHeight

In other words:

If the content begins 30mm from the top of the Canvas page,
the print version must also begin 30mm from the top of the print page.

If the content begins 25mm from the left of the Canvas page,
the print version must also begin 25mm from the left of the print page.

Do NOT guess these values.

Do NOT hardcode a new margin.

Do NOT create another independent margin system.

READ THE EXISTING CANVAS LAYOUT.

==================================================
IMPORTANT ARCHITECTURAL RULE
==================================================

The print renderer must reuse the SAME document layout information already
used by the Canvas.

Do not create:

Canvas margin logic
+
Print margin logic

That creates two sources of truth.

Instead:

Existing Canvas layout
        ↓
existing document geometry
        ↓
Print renderer consumes the same geometry

The Print renderer should be a different OUTPUT renderer, not a different
LAYOUT ENGINE.

==================================================
DEBUGGING FIRST
==================================================

Before changing ANY code, inspect the existing implementation.

Find:

1. The actual Canvas page element.
2. The actual Canvas content/container element.
3. The actual element used to render the document in Print Preview.
4. How the Canvas calculates content position.
5. How the Print renderer calculates content position.
6. Whether Print Preview creates a separate DOM structure.
7. Whether Print Preview adds additional margin/padding.
8. Whether browser default @page margin is affecting the output.
9. Whether body/html margin is affecting the print output.
10. Whether the print renderer applies a different CSS class.
11. Whether the print renderer applies transform/scale.
12. Whether the print renderer has different font metrics.
13. Whether the print renderer uses a different wrapper/container.

Do NOT modify the Canvas before completing this investigation.

==================================================
MEASURE THE DIFFERENCE
==================================================

Use the existing Canvas as the reference.

Measure:

Canvas page bounding rectangle:
pageRect

Canvas content bounding rectangle:
contentRect

Calculate:

contentOffsetTop =
contentRect.top - pageRect.top

contentOffsetLeft =
contentRect.left - pageRect.left

Then perform the equivalent measurement in the print DOM.

Compare:

CANVAS:
contentOffsetTop = X
contentOffsetLeft = Y

PRINT:
contentOffsetTop = A
contentOffsetLeft = B

The goal is:

X ≈ A
Y ≈ B

with only a tiny rendering tolerance.

Do NOT change X or Y.

Instead find why A and B are different.

==================================================
MOST IMPORTANT RULE
==================================================

The Canvas is correct.

If the Canvas says:

PAGE
|
|---- existing margin
|
|---- DOCUMENT CONTENT

then Print must reproduce:

PAGE
|
|---- SAME existing margin
|
|---- SAME DOCUMENT CONTENT

Do NOT modify the first one to match the second one.

Modify the second one to match the first one.

==================================================
PRINT CSS
==================================================

The browser's own print margins must not introduce an additional offset.

Inspect and, if appropriate, use:

@media print {
    @page {
        size: A4 portrait;
        margin: 0;
    }

    html,
    body {
        margin: 0;
        padding: 0;
    }
}

But IMPORTANT:

Do not use this to replace the existing Docsly document margin.

The purpose of margin: 0 is ONLY to remove browser/OS print margins.

The actual document content position must still come from the existing
Docsly document layout.

==================================================
DO NOT CREATE A SECOND MARGIN SYSTEM
==================================================

BAD:

Canvas:
margin = existing Docsly margin

Print:
margin = 30mm

This is wrong.

Also BAD:

Canvas:
padding = existing Docsly value

Print:
padding = another hardcoded value

This is also wrong.

GOOD:

Existing Docsly layout
        ↓
same document geometry
        ↓
Canvas renderer
        ↓
Print renderer

==================================================
IMPORTANT ABOUT SCALE
==================================================

The Canvas may use zoom/scale to display the A4 page on screen.

That is acceptable.

The Print Preview may also display the page at a different visual scale.

That is also acceptable.

I DO NOT require the number of CSS pixels in the Canvas screenshot to be
identical to the number of CSS pixels in browser Print Preview.

What MUST be identical is the RELATIVE DOCUMENT GEOMETRY.

For example:

Canvas:

Page top
↓
30mm
↓
Content

Print:

Page top
↓
30mm
↓
Content

The browser may visually display these at different pixel sizes.

That is NOT the problem.

The problem is when:

Canvas:

Page top
↓
30mm
↓
Content

Print:

Page top
↓
60mm
↓
Content

That is the bug that must be fixed.

==================================================
FONT AND CONTENT GEOMETRY
==================================================

Also verify that the print renderer uses the same:

- font family
- font size
- font weight
- line height
- letter spacing
- paragraph spacing
- heading spacing
- list indentation

as the Canvas.

Do not change the Canvas typography.

Make Print use the same typography configuration.

==================================================
PAGE STRUCTURE
==================================================

If the Canvas currently has:

Page 1
    Content A

Page 2
    Content B

Print must have:

Page 1
    Content A

Page 2
    Content B

Do not let the browser create an independent document flow that moves
content between pages.

==================================================
IMPLEMENTATION STRATEGY
==================================================

Preferred approach:

1. Identify the existing Canvas page DOM structure.
2. Identify the existing document content DOM structure.
3. Identify the existing document styling/configuration.
4. Reuse those styles/geometry in the print renderer.
5. Remove only browser-specific print offsets.
6. Keep the Canvas untouched.
7. Validate Canvas vs Print geometry.
8. Only after the geometry matches, test page breaks and fonts.

Do NOT rewrite the document margin system.

Do NOT rewrite the Canvas pagination system.

Do NOT refactor unrelated editor logic.

Make the smallest possible change necessary to the PRINT rendering path.

==================================================
SUCCESS CRITERIA
==================================================

The fix is successful when:

Canvas:

┌─────────────────────────┐
│                         │
│  1. aisjaisja           │
│     a. saisjaisja       │
│     b. saisjaisjas      │
│                         │
└─────────────────────────┘

Print:

┌─────────────────────────┐
│                         │
│  1. aisjaisja           │
│     a. saisjaisja       │
│     b. saisjaisjas      │
│                         │
└─────────────────────────┘

The screenshots may have different pixel dimensions because of zoom/scaling.

That is acceptable.

But the content must have the SAME relative position, size, typography,
spacing, and page structure relative to the A4 page.

MOST IMPORTANT:

DO NOT TOUCH THE EXISTING CANVAS MARGIN LOGIC.

THE CANVAS IS THE REFERENCE.

FIX THE PRINT RENDERER TO MATCH THE CANVAS.
```

---

# Ada satu hal yang saya ingin kamu cegah dari AI Agent

Kalau agent menjawab seperti:

> "Saya akan mengubah margin Canvas dari 30px menjadi 40px supaya sama dengan print."

**Tolak perubahan itu.**

Karena itu justru membuat:

```text
Canvas sebelumnya benar
       ↓
AI mengubah Canvas
       ↓
Canvas sekarang salah
       ↓
Print mungkin terlihat sama
       ↓
PDF/export kemungkinan ikut bermasalah
```

Itu bukan solusi.

---

# Cara berpikir yang benar

Bayangkan Canvas kamu seperti **cetakan asli**.

```text
CANVAS
┌───────────────────────┐
│                       │
│   DOCUMENT CONTENT    │
│                       │
└───────────────────────┘
       ↑
       │
    BENAR
```

Print Preview harus menjadi **salinan dari cetakan tersebut**:

```text
PRINT
┌───────────────────────┐
│                       │
│   DOCUMENT CONTENT    │
│                       │
└───────────────────────┘
       ↑
       │
    HARUS SAMA
```

Bukan:

```text
CANVAS
┌───────────────────────┐
│                       │
│   DOCUMENT CONTENT    │
└───────────────────────┘
          ↓
     "ubah Canvas"

PRINT
┌───────────────────────┐
│                       │
│                       │
│   DOCUMENT CONTENT    │
└───────────────────────┘
```

---

# Bahkan saya sarankan AI Agent melakukan satu eksperimen sederhana

Sebelum memperbaiki seluruh sistem, minta dia **jangan menyentuh pagination maupun margin**.

Cukup lakukan:

```text
Ambil SATU halaman Canvas yang sudah benar.

Ambil:
- page bounding box
- content bounding box
- computed styles content
- computed styles page

Kemudian bandingkan dengan Print DOM.

Temukan element/style apa yang menyebabkan
contentOffsetTop dan contentOffsetLeft berbeda.

Perbaiki hanya element/style tersebut.
```

Ini jauh lebih aman daripada menyuruh AI Agent "perbaiki A4 printing", karena agent sering akhirnya melakukan refactor besar dan merusak logic yang sebelumnya sudah benar.

### Dan satu koreksi penting dari pembahasan sebelumnya

**Jangan terlalu fokus pada apakah ukuran visual halaman Canvas dan Print Preview terlihat sama dalam pixel.** Browser Print Preview memang dapat melakukan scaling untuk menampilkan kertas di layar.

Yang harus kamu kejar adalah:

**A4 geometry → posisi content relatif terhadap page → typography → pagination.**

Jadi kalau Canvas menampilkan A4 dengan tinggi 800 px dan Print Preview menampilkan A4 dengan tinggi 1000 px, **itu belum tentu bug**.

Tetapi kalau:

```text
Canvas:
page top → 30mm → content

Print:
page top → 60mm → content
```

**itu jelas bug.**

Dan berdasarkan screenshot yang kamu berikan, **itulah bagian yang perlu AI Agent-mu fokuskan sekarang.**
