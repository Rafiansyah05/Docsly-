import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextBuilder {
  build(documentJson: any, activeBlockIndex?: number): string {
    if (!documentJson || !documentJson.content) {
      return 'Dokumen Kosong.';
    }

    const blocks = documentJson.content;
    let result = '';

    // Build a BAB/chapter structure summary first so the AI always knows
    // what chapters exist and their block indices — critical for correct ordering.
    const babSummary: string[] = [];
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const text = this.getNodeText(block).trim();
      if (!text) continue;
      // Detect BAB headings (heading type or paragraph starting with BAB)
      if (
        block.type === 'heading' ||
        /^BAB\s+([IVXivx]+|\d+)/i.test(text) ||
        /^(PENDAHULUAN|KESIMPULAN|PENUTUP|DAFTAR PUSTAKA|ABSTRAK|KATA PENGANTAR)/i.test(text)
      ) {
        babSummary.push(`  [Block ${i}] ${text.substring(0, 60)}`);
      }
    }

    if (babSummary.length > 0) {
      result += `=== STRUKTUR BAB / CHAPTER SUMMARY ===\n${babSummary.join('\n')}\n=== AKHIR SUMMARY ===\n\n`;
    }

    // If document is very long (e.g. > 80 blocks), apply compression only when
    // we have a clear active cursor position. If there's no activeBlockIndex, show all.
    const limit = 80;
    const shouldCompress = blocks.length > limit && activeBlockIndex !== undefined;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // If compressing, skip content far from activeBlockIndex but keep headings and BAB markers
      if (shouldCompress) {
        const isFar = Math.abs(i - (activeBlockIndex ?? 0)) > 10;
        const text = this.getNodeText(block).trim();
        const isHeading = block.type === 'heading';
        const isBabMarker = /^BAB\s+/i.test(text);
        if (isFar && !isHeading && !isBabMarker) {
          if (!result.endsWith('...compresso\n')) {
            result += `[Blocks ${i}+ terkompresi untuk efisiensi token]\n`;
          }
          continue;
        }
      }

      const text = this.getNodeText(block);
      result += `[Block ${i}] ${block.type}: ${text}\n`;
    }

    return result;
  }

  private getNodeText(node: any): string {
    if (!node) return '';
    if (node.text) return node.text;
    if (node.content) {
      return node.content.map((child: any) => this.getNodeText(child)).join('');
    }
    return '';
  }
}
