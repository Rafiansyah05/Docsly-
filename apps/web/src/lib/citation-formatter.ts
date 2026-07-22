export type RichTextPart = {
  text: string;
  italic?: boolean;
};

export function toSentenceCase(str: string): string {
  if (!str) return '';
  const parts = str.split(':');
  const processPart = (part: string) => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  };
  return parts.map(processPart).join(': ');
}

export function formatAuthors(authorString: string): string {
  if (!authorString) return 'Unknown';
  
  let authors = authorString.split(';');
  
  authors = authors.map(a => a.trim()).filter(a => a);
  
  if (authors.length === 0) return 'Unknown';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  
  const last = authors.pop();
  return `${authors.join(', ')}, & ${last}`;
}

export function formatCitation(ref: any, style: 'APA' | 'Harvard' = 'APA'): RichTextPart[] {
  const parts: RichTextPart[] = [];
  
  const authorStr = formatAuthors(ref.penulis);
  const year = ref.tahun || 'n.d.';
  const title = ref.judul || '';
  const publisher = ref.penerbit || '';
  const jenis = (ref.jenis || 'Buku').toLowerCase();

  parts.push({ text: `${authorStr} ` });
  
  if (style === 'APA') {
    parts.push({ text: `(${year}). ` });
  } else {
    parts.push({ text: `${year}. ` });
  }

  if (jenis === 'jurnal' || jenis === 'journal') {
    parts.push({ text: `${toSentenceCase(title)}. ` });
    if (publisher) {
      parts.push({ text: `${publisher}.`, italic: true });
    }
  } else {
    if (title) {
      parts.push({ text: `${toSentenceCase(title)}.`, italic: true });
    }
    if (publisher) {
      parts.push({ text: ` ${publisher}.` });
    }
  }

  return parts;
}
