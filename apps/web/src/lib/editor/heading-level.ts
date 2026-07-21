import {
  BAB_PATTERN,
  HEADING_KEYWORDS_H1,
  NUM_H2_PATTERN,
  NUM_ONLY_H2,
  NUM_H3_PATTERN,
  NUM_ONLY_H3,
  NUM_H4_PATTERN,
  NUM_ONLY_H4,
  NUM_H5_PATTERN,
  NUM_ONLY_H5,
} from './heading-rules';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function assignHeadingLevel(text: string, score: number, hasBab: boolean): HeadingLevel | null {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();

  // ── Explicit H1 signals ──────────────────────────────────────────────────────
  if (BAB_PATTERN.test(trimmed)) return 1;
  if (HEADING_KEYWORDS_H1.has(upper)) return 1;

  // ── Explicit Hierarchical Numbering Signals ──────────────────────────────────
  // Hierarchy shifting: If the document doesn't use BAB (hasBab = false), 
  // then "1." becomes H1, "1.1" becomes H2, etc.
  const shift = hasBab ? 0 : -1;

  // H5
  if (NUM_H5_PATTERN.test(trimmed) || NUM_ONLY_H5.test(trimmed)) return Math.max(1, 5 + shift) as HeadingLevel;
  // H4
  if (NUM_H4_PATTERN.test(trimmed) || NUM_ONLY_H4.test(trimmed)) return Math.max(1, 4 + shift) as HeadingLevel;
  // H3
  if (NUM_H3_PATTERN.test(trimmed) || NUM_ONLY_H3.test(trimmed)) return Math.max(1, 3 + shift) as HeadingLevel;
  // H2
  if (NUM_H2_PATTERN.test(trimmed) || NUM_ONLY_H2.test(trimmed)) return Math.max(1, 2 + shift) as HeadingLevel;

  // ── Score-based fallback assignment (for non-numbered headings) ──────────────
  if (score >= 70) return 1;
  if (score >= 50) return 2;
  if (score >= 45) return 3;

  return null; // not a heading
}
