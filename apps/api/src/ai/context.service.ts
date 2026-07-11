import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextBuilder {
  build(documentJson: any, activeBlockIndex?: number): string {
    if (!documentJson || !documentJson.content) {
      return 'Dokumen Kosong.';
    }

    const blocks = documentJson.content;
    let result = '';

    // If document is very long (e.g. > 50 blocks), apply compression
    const limit = 50;
    const shouldCompress = blocks.length > limit && activeBlockIndex !== undefined;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      
      // If compressing, skip content far from activeBlockIndex but keep headings
      if (shouldCompress) {
        const isFar = Math.abs(i - (activeBlockIndex ?? 0)) > 5;
        const isHeading = block.type === 'heading';
        if (isFar && !isHeading) {
          if (!result.endsWith('...\n')) {
            result += `[Blocks ${i} terkompresi untuk efisiensi token]\n`;
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
