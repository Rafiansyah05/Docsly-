// ─── Heading Dictionary (Rule 4) ──────────────────────────────────────────────
export const HEADING_KEYWORDS_H1 = new Set([
  // Academic - Indonesian
  'BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'BAB VI', 'BAB VII', 'BAB VIII', 'BAB IX', 'BAB X',
  'BAB 1', 'BAB 2', 'BAB 3', 'BAB 4', 'BAB 5', 'BAB 6', 'BAB 7', 'BAB 8', 'BAB 9', 'BAB 10',
  'PENDAHULUAN', 'KESIMPULAN', 'ABSTRAK', 'ABSTRACT', 'DAFTAR ISI', 'DAFTAR GAMBAR',
  'DAFTAR TABEL', 'KATA PENGANTAR', 'DAFTAR PUSTAKA', 'LAMPIRAN', 'PENUTUP',
  'TINJAUAN PUSTAKA', 'METODOLOGI', 'METODOLOGI PENELITIAN', 'HASIL PENELITIAN',
  'PEMBAHASAN', 'HASIL DAN PEMBAHASAN', 'SARAN', 'REFERENSI', 'BIBLIOGRAPHY',
  'INTRODUCTION', 'CONCLUSION', 'METHODOLOGY', 'RESULTS', 'DISCUSSION',
  // Report / Business
  'EXECUTIVE SUMMARY', 'RINGKASAN EKSEKUTIF', 'LATAR BELAKANG',
]);

export const HEADING_KEYWORDS_GENERAL = new Set([
  // Sub-section keywords (H2/H3 candidates)
  'latar belakang', 'rumusan masalah', 'tujuan penelitian', 'manfaat penelitian',
  'batasan masalah', 'sistematika penulisan', 'tinjauan umum', 'landasan teori',
  'kerangka berpikir', 'hipotesis', 'populasi dan sampel', 'teknik pengumpulan data',
  'teknik analisis data', 'hasil pengujian', 'analisis data', 'implikasi', 'saran',
  'simpulan', 'kesimpulan dan saran',
]);

// ─── Pattern Matchers ──────────────────────────────────────────────────────────
// Matches: 1, 1.1, 1.1.1, 2.3, 3.4.5 — full line or start of line with text
export const NUM_H2_PATTERN = /^([A-Z]|\d+)\s+\S/;           // "1 Pendahuluan" or "A Pendahuluan" → H2
export const NUM_H3_PATTERN = /^(\d+\.\d+)\s+\S/;            // "1.1 Latar Belakang" → H3
export const NUM_H4_PATTERN = /^(\d+\.\d+\.\d+)\s+\S/;       // "1.1.1 Definisi" → H4
export const NUM_H5_PATTERN = /^(\d+\.\d+\.\d+\.\d+)\s+\S/;  // "1.1.1.1 Tujuan" → H5

export const NUM_ONLY_H2 = /^([A-Z]|\d+)\.?$/;               // "1." or "A." → H2
export const NUM_ONLY_H3 = /^(\d+\.\d+)\.?$/;                // "1.1." or "1.1" → H3
export const NUM_ONLY_H4 = /^(\d+\.\d+\.\d+)\.?$/;           // "1.1.1" → H4
export const NUM_ONLY_H5 = /^(\d+\.\d+\.\d+\.\d+)\.?$/;      // "1.1.1.1" → H5

export const ALPHA_MARKER = /^([A-Za-z]|\d+)[.)]$/;          // "A.", "a.", "1."
export const ALPHA_MARKER_TEXT = /^([A-Za-z]|\d+)[.)]\s/;    // "A. Pendahuluan"

// BAB pattern: "BAB I", "BAB 1", "BAB SATU", etc.
export const BAB_PATTERN = /^BAB\s+([IVXivx]+|\d+|[A-Z]+)$/i;

// Ends with sentence-terminating punct (heading unlikely)
export const SENTENCE_TERMINATORS = /[.?!;,]$/;
export const ENDS_WITH_CONJUNCTION = /\s+(dan|atau|serta|maupun|the|and|or|but|with|of|in|on|at)$/i;

export function isLongText(text: string): boolean {
  return text.split(/\s+/).filter(Boolean).length > 12;
}

export function isEmptyOrWhitespace(text: string): boolean {
  return text.trim().length === 0;
}
