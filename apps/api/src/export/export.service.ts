import { Injectable, BadRequestException } from '@nestjs/common';
import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

@Injectable()
export class ExportService {

  async processDocx(buffer: Buffer, config: any): Promise<Buffer> {
    if (!config || (!config.bibliography && !config.pageNumbering)) {
      return buffer;
    }

    try {
      const zip = new PizZip(buffer);
      
      let docXmlString = zip.file('word/document.xml')?.asText();
      if (!docXmlString) {
        throw new BadRequestException('Invalid DOCX format: missing word/document.xml');
      }

      const parser = new DOMParser();
      const docXml = parser.parseFromString(docXmlString, 'text/xml');
      
      const wNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
      const body = docXml.getElementsByTagNameNS(wNamespace, 'body')[0];
      if (!body) throw new Error('Body tag not found');

      if (config.bibliography && config.bibliography.text) {
        this.addBibliography(docXml, body, config.bibliography.text, wNamespace);
      }

      if (config.pageNumbering) {
        this.addPageNumbering(zip, docXml, body, config.pageNumbering, wNamespace);
      }

      const serializer = new XMLSerializer();
      zip.file('word/document.xml', serializer.serializeToString(docXml));

      return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    } catch (e: any) {
      console.error('Error processing DOCX:', e);
      throw new BadRequestException('Gagal memproses dokumen Word. Pastikan format valid.');
    }
  }

  private addBibliography(docXml: Document, body: Element, text: string, wNamespace: string) {
    const sectPrs = body.getElementsByTagNameNS(wNamespace, 'sectPr');
    const lastSectPr = sectPrs.length > 0 ? sectPrs[sectPrs.length - 1] : null;

    const createEl = (tag: string) => docXml.createElementNS(wNamespace, 'w:' + tag);

    const titleP = createEl('p');
    titleP.innerHTML = `<w:pPr xmlns:w="${wNamespace}"><w:jc w:val="center"/></w:pPr><w:r xmlns:w="${wNamespace}"><w:br w:type="page"/></w:r><w:r xmlns:w="${wNamespace}"><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>Daftar Pustaka</w:t></w:r>`;

    if (lastSectPr) {
      body.insertBefore(titleP, lastSectPr);
    } else {
      body.appendChild(titleP);
    }

    const entries = text.split('\n').filter((l: string) => l.trim().length > 0);
    for (const entry of entries) {
      const p = createEl('p');
      p.innerHTML = `<w:pPr xmlns:w="${wNamespace}"><w:spacing w:after="240" w:line="360" w:lineRule="auto"/><w:ind w:left="720" w:hanging="720"/></w:pPr><w:r xmlns:w="${wNamespace}"><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t>${this.escapeXml(entry.trim())}</w:t></w:r>`;
      if (lastSectPr) {
        body.insertBefore(p, lastSectPr);
      } else {
        body.appendChild(p);
      }
    }
  }

  private addPageNumbering(zip: PizZip, docXml: Document, body: Element, config: any, wNamespace: string) {
    const relsXmlString = zip.file('word/_rels/document.xml.rels')?.asText();
    if (!relsXmlString) return;

    const parser = new DOMParser();
    const relsXml = parser.parseFromString(relsXmlString, 'text/xml');
    const relsNode = relsXml.documentElement;
    const serializer = new XMLSerializer();

    const sectPrs = body.getElementsByTagNameNS(wNamespace, 'sectPr');
    const pnConfigs = Array.isArray(config) ? config : [config];

    for (let i = 0; i < sectPrs.length; i++) {
      const sectPr = sectPrs[i];
      // If array has fewer items, don't apply to remaining sections (or maybe apply the last one? Let's just apply if config exists for this index, or if there's only 1 config, apply to all)
      const secConfig = Array.isArray(config) 
        ? (config[i] || null) // per-section config
        : config; // apply same config to all

      if (!secConfig) continue;

      const rId = 'rIdDocslyFtr' + i + '_' + Date.now();
      const footerFileName = 'footerDocsly_' + i + '_' + Date.now() + '.xml';

      // 1. Create Relationship
      const relNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships';
      const rel = relsXml.createElementNS(relNamespace, 'Relationship');
      rel.setAttribute('Id', rId);
      rel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer');
      rel.setAttribute('Target', footerFileName);
      relsNode.appendChild(rel);

      // 2. Format variables
      let alignment = 'center';
      if (secConfig.position === 'left') alignment = 'left';
      if (secConfig.position === 'right') alignment = 'right';

      let formatStr = 'Arabic';
      let wFmt = 'decimal';
      if (secConfig.format === 'roman_lower' || secConfig.format === 'i, ii, iii') { formatStr = 'roman'; wFmt = 'lowerRoman'; }
      if (secConfig.format === 'roman_upper' || secConfig.format === 'I, II, III') { formatStr = 'Roman'; wFmt = 'upperRoman'; }
      if (secConfig.format === 'A, B, C') { formatStr = 'Alphabetic'; wFmt = 'upperLetter'; }
      if (secConfig.format === '01, 02, 03') { formatStr = 'Arabic \\* FORMAT 0#'; wFmt = 'decimalZero'; }

      // 3. Create Footer XML
      const footerContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
          '<w:p>' +
            '<w:pPr>' +
              '<w:jc w:val="' + alignment + '"/>' +
            '</w:pPr>' +
            '<w:r>' +
              '<w:rPr>' +
                '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
                '<w:sz w:val="24"/>' +
              '</w:rPr>' +
              '<w:fldChar w:fldCharType="begin"/>' +
            '</w:r>' +
            '<w:r>' +
              '<w:rPr>' +
                '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
                '<w:sz w:val="24"/>' +
              '</w:rPr>' +
              '<w:instrText xml:space="preserve"> PAGE \\* ' + formatStr + ' </w:instrText>' +
            '</w:r>' +
            '<w:r>' +
              '<w:rPr>' +
                '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
                '<w:sz w:val="24"/>' +
              '</w:rPr>' +
              '<w:fldChar w:fldCharType="separate"/>' +
            '</w:r>' +
            '<w:r>' +
              '<w:rPr>' +
                '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
                '<w:sz w:val="24"/>' +
              '</w:rPr>' +
              '<w:t>1</w:t>' +
            '</w:r>' +
            '<w:r>' +
              '<w:rPr>' +
                '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>' +
                '<w:sz w:val="24"/>' +
              '</w:rPr>' +
              '<w:fldChar w:fldCharType="end"/>' +
            '</w:r>' +
          '</w:p>' +
        '</w:ftr>';

      zip.file('word/' + footerFileName, footerContent);

      // 4. Update ContentTypes
      const ctXmlString = zip.file('[ContentTypes].xml')?.asText();
      if (ctXmlString) {
        const ctXml = parser.parseFromString(ctXmlString, 'text/xml');
        const typesNode = ctXml.documentElement;
        const override = ctXml.createElementNS('http://schemas.openxmlformats.org/package/2006/content-types', 'Override');
        override.setAttribute('PartName', '/word/' + footerFileName);
        override.setAttribute('ContentType', 'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml');
        typesNode.appendChild(override);
        zip.file('[ContentTypes].xml', serializer.serializeToString(ctXml));
      }

      // 5. Link Footer to Section
      const ftrRef = docXml.createElementNS(wNamespace, 'w:footerReference');
      ftrRef.setAttribute('w:type', 'default');
      ftrRef.setAttribute('r:id', rId);
      ftrRef.setAttribute('xmlns:r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
      sectPr.appendChild(ftrRef);

      // Handle start number
      if (secConfig.startNumber !== undefined && secConfig.startNumber !== null) {
        let pgNumType = sectPr.getElementsByTagNameNS(wNamespace, 'pgNumType')[0];
        if (!pgNumType) {
          pgNumType = docXml.createElementNS(wNamespace, 'w:pgNumType');
          sectPr.appendChild(pgNumType);
        }
        pgNumType.setAttribute('w:start', secConfig.startNumber.toString());
        pgNumType.setAttribute('w:fmt', wFmt);
      }
    }

    zip.file('word/_rels/document.xml.rels', serializer.serializeToString(relsXml));
  }

  private escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }
}
