import {
  HEADING_KEYWORDS_H1,
  HEADING_KEYWORDS_GENERAL,
  BAB_PATTERN,
  NUM_H2_PATTERN,
  NUM_ONLY_H2,
  NUM_H3_PATTERN,
  NUM_ONLY_H3,
  NUM_H4_PATTERN,
  NUM_ONLY_H4,
  NUM_H5_PATTERN,
  NUM_ONLY_H5,
  SENTENCE_TERMINATORS,
  ENDS_WITH_CONJUNCTION
} from './heading-rules';

export interface ScoringContext {
  text: string;
  isBold: boolean;
  isCenter: boolean;
  nextNodeIsLong: boolean;
  prevNodeIsEmpty: boolean;
  hasBullet: boolean;
}

export function scoreHeading(ctx: ScoringContext): number {
  const { text, isBold, isCenter, nextNodeIsLong, prevNodeIsEmpty, hasBullet } = ctx;
  const trimmed = text.trim();
  let score = 0;

  if (!trimmed) return -100; // empty paragraph — never a heading

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const charCount = trimmed.length;
  const upper = trimmed.toUpperCase();

  // ── Absolute Truths (Numbering Hierarchies) ──────────────────────────────────
  // If a text strictly matches a heading hierarchy pattern, it receives a massive score
  // to bypass all formatting negative rules.
  if (BAB_PATTERN.test(trimmed)) score += 100;
  if (
    NUM_H2_PATTERN.test(trimmed) || NUM_ONLY_H2.test(trimmed) ||
    NUM_H3_PATTERN.test(trimmed) || NUM_ONLY_H3.test(trimmed) ||
    NUM_H4_PATTERN.test(trimmed) || NUM_ONLY_H4.test(trimmed) ||
    NUM_H5_PATTERN.test(trimmed) || NUM_ONLY_H5.test(trimmed)
  ) {
    score += 100;
  }

  // ── Hard disqualifiers ────────────────────────────────────────────────────────
  if (hasBullet) score -= 60;                            // Rule 13
  if (wordCount > 12) score -= 40;                       // Rule 15
  if (ENDS_WITH_CONJUNCTION.test(trimmed)) score -= 30;  // Rule 14
  if (SENTENCE_TERMINATORS.test(trimmed)) score -= 20;   // Rule 2 (negative)
  if (!/^[A-Z0-9]/.test(trimmed)) score -= 50;           // Not capitalized

  // Early exit for deeply negative scores if they aren't forced by patterns
  if (score < -30) return score;

  // ── Positive rules ────────────────────────────────────────────────────────────
  // Rule 1 — Word count
  if (wordCount <= 8) score += 20;

  // Rule 2 — Not ending with period
  if (!trimmed.endsWith('.')) score += 10;

  // Rule 3 — ALL UPPERCASE
  if (trimmed === upper && wordCount >= 1) score += 30;

  // Rule 4 — Dictionary match (H1 keywords)
  if (HEADING_KEYWORDS_H1.has(upper)) score += 40;
  // General sub-keywords
  if (HEADING_KEYWORDS_GENERAL.has(trimmed.toLowerCase())) score += 30;

  // Rule 6 — Short character count
  if (charCount < 70) score += 10;

  // Rule 7 — Not ending with comma/semicolon/colon
  if (!/[,;:]$/.test(trimmed)) score += 5;

  // Rule 8 — Preceded by empty paragraph
  if (prevNodeIsEmpty) score += 15;

  // Rule 9 — Followed by long paragraph
  if (nextNodeIsLong) score += 20;

  // Rule 10 — Bold text
  if (isBold) score += 10;

  // Rule 12 — Center-aligned
  if (isCenter) score += 15;

  return score;
}
