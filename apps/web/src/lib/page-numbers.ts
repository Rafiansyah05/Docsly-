export type PageNumberFormat = 'arabic' | 'roman_lower' | 'roman_upper';

export type PageNumberSection = {
  startPage: number; // Halaman absolut (1-based)
  format: PageNumberFormat;
  startNumber: number; // Nilai mulai (e.g. mulai dari 1 atau mulai dari i)
};

export type PageSettings = {
  enabled: boolean;
  position: 'top' | 'bottom';
  align: 'left' | 'center' | 'right';
  sections: PageNumberSection[];
};

export const defaultPageSettings: PageSettings = {
  enabled: false,
  position: 'bottom',
  align: 'center',
  sections: [
    { startPage: 1, format: 'arabic', startNumber: 1 }
  ]
};

export function toRoman(num: number): string {
  if (num < 1) return '';
  const roman: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let result = '';
  for (const key in roman) {
    while (num >= roman[key]) {
      result += key;
      num -= roman[key];
    }
  }
  return result;
}

export function fromRoman(str: string): number {
  str = str.toUpperCase();
  const roman: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let result = 0;
  let i = 0;
  while (i < str.length) {
    if (i + 1 < str.length && roman[str.substring(i, i + 2)]) {
      result += roman[str.substring(i, i + 2)];
      i += 2;
    } else if (roman[str[i]]) {
      result += roman[str[i]];
      i += 1;
    } else {
      // Invalid character, stop parsing
      break;
    }
  }
  return result;
}

export function formatPageNumber(absolutePage: number, settings: PageSettings | null): string | null {
  if (!settings || !settings.enabled || !settings.sections || settings.sections.length === 0) {
    return null;
  }

  // Cari section yang berlaku untuk halaman absolut ini
  // Array sections harus diurutkan berdasarkan startPage (dari kecil ke besar)
  const sortedSections = [...settings.sections].sort((a, b) => a.startPage - b.startPage);
  
  let currentSection = sortedSections[0];
  for (const sec of sortedSections) {
    if (absolutePage >= sec.startPage) {
      currentSection = sec;
    } else {
      break;
    }
  }

  if (!currentSection) return null; // Jika entah bagaimana halaman berada sebelum section pertama, kembalikan null atau asumsikan section pertama

  // Hitung nomor relatif di dalam section ini
  // absolutePage: 4, section startPage: 4, startNumber: 1 => relNumber: 1
  // absolutePage: 5, section startPage: 4, startNumber: 1 => relNumber: 2
  const offset = absolutePage - currentSection.startPage;
  const relNumber = currentSection.startNumber + offset;

  if (relNumber < 1) return null; // Tidak bisa merender nomor negatif/0 untuk format standar dokumen

  if (currentSection.format === 'roman_lower') {
    return toRoman(relNumber).toLowerCase();
  } else if (currentSection.format === 'roman_upper') {
    return toRoman(relNumber);
  } else {
    // arabic
    return relNumber.toString();
  }
}

export function estimatePageCount(kontenJson: any): number {
  if (!kontenJson) return 1;
  
  if (typeof kontenJson._totalPages === 'number') {
    return kontenJson._totalPages;
  }

  let totalHeight = 0;
  let pageBreaks = 0;

  function traverse(node: any) {
    if (!node) return;
    
    // Check if the node has attributes suggesting a page break
    if (node.attrs && (node.attrs.pageBreakBefore || node.attrs.pageBreakSpacer)) {
      pageBreaks++;
    }

    if (node.type === 'paragraph') {
      let chars = 0;
      if (node.content) {
        node.content.forEach((child: any) => {
          if (child.type === 'text' && child.text) {
            chars += child.text.length;
          }
        });
      }
      // Approx 90 chars per line for 12pt font. Line height ~24px + 16px paragraph margin
      const lines = Math.max(1, Math.ceil(chars / 90));
      totalHeight += (lines * 24) + 16;
    } else if (node.type === 'heading') {
      let chars = 0;
      if (node.content) {
        node.content.forEach((child: any) => {
          if (child.type === 'text' && child.text) {
            chars += child.text.length;
          }
        });
      }
      const lines = Math.max(1, Math.ceil(chars / 60));
      totalHeight += (lines * 36) + 24;
    } else if (node.type === 'table') {
      // Rough estimate for table height
      totalHeight += 200;
    } else if (node.type === 'imagePlaceholder' || node.type === 'image') {
      // Rough estimate for image height
      totalHeight += 400;
    } else if (node.type === 'bulletList' || node.type === 'orderedList') {
      totalHeight += 16; // Just the list margins
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }

  try {
    traverse(kontenJson);
  } catch (err) {
    console.error('Error traversing document JSON:', err);
  }

  // An empty document is at least 1 page.
  if (totalHeight === 0 && pageBreaks === 0) {
    return 1;
  }

  // A standard A4 page is approx 1123px tall (at 96 DPI), minus top/bottom margins (say 192px total)
  // Let's use 1000px as a rough printable area height.
  const PRINTABLE_HEIGHT = 1000;
  const estimatedPages = Math.max(1, Math.ceil(totalHeight / PRINTABLE_HEIGHT), pageBreaks + 1);
  return estimatedPages;
}
