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
