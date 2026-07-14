import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  SectionType,
  PageOrientation,
  Header,
  Footer,
  ImageRun,
  ExternalHyperlink,
  ShadingType,
  TabStopType,
  LeaderType,
  PageNumber,
  NumberFormat
} from 'docx';
import imageSize from 'image-size';

interface TiptapJSON {
  type: string;
  content?: TiptapJSON[];
  text?: string;
  marks?: any[];
  attrs?: any;
}

export async function convertToDocx(json: TiptapJSON): Promise<Document> {
  const sections: any[] = [];
  let currentSectionChildren: any[] = [];
  
  let currentMargin = {
    top: 1440,
    right: 1440,
    bottom: 1440,
    left: 1440,
  };
  let currentOrientation: any = PageOrientation.PORTRAIT;
  let currentHeader = '';
  let currentFooter = '';
  let globalPageCounter = 1;
  const pageSettings = json.attrs?.pageSettings;
  const sortedSections = pageSettings?.sections ? [...pageSettings.sections].sort((a: any, b: any) => a.startPage - b.startPage) : [];
  
  const pushSection = () => {
    if (currentSectionChildren.length === 0) return;
    
    let defaultHeader: any = currentHeader ? new Header({ children: [new Paragraph(currentHeader)] }) : undefined;
    let defaultFooter: any = currentFooter ? new Footer({ children: [new Paragraph(currentFooter)] }) : undefined;
    
    let formatType: any = NumberFormat.DECIMAL;
    let startNumber = 1;
    let pageNumbersConfig: any = undefined;
    let activeSection = null;

    if (pageSettings?.enabled && sortedSections.length > 0) {
      const { position = 'bottom', align = 'center' } = pageSettings;
      
      for (const sec of sortedSections) {
        if (globalPageCounter >= sec.startPage) {
          activeSection = sec;
        }
      }
      
      if (activeSection) {
        const alignMap: Record<string, typeof AlignmentType[keyof typeof AlignmentType]> = {
        left: AlignmentType.LEFT,
        center: AlignmentType.CENTER,
        right: AlignmentType.RIGHT,
      };
      
      const formatMap: Record<string, typeof NumberFormat[keyof typeof NumberFormat]> = {
        arabic: NumberFormat.DECIMAL,
        roman_lower: NumberFormat.LOWER_ROMAN,
        roman_upper: NumberFormat.UPPER_ROMAN,
      };
      
      formatType = formatMap[activeSection.format] || NumberFormat.DECIMAL;
      startNumber = parseInt(activeSection.startNumber) + (globalPageCounter - activeSection.startPage);
        startNumber = isNaN(startNumber) || startNumber < 1 ? 1 : startNumber;

        const pgNumPara = new Paragraph({
          alignment: alignMap[align] || AlignmentType.CENTER,
          children: [
            new TextRun({
              children: [PageNumber.CURRENT],
              font: 'Times New Roman',
              size: 22, // 11pt
            }),
          ],
        });

        if (position === 'top') {
          defaultHeader = new Header({ children: [pgNumPara] });
        } else {
          defaultFooter = new Footer({ children: [pgNumPara] });
        }
        
        pageNumbersConfig = {
          start: startNumber,
          formatType: formatType,
        };
      }
    }
    
    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          margin: currentMargin,
          size: {
            orientation: currentOrientation,
          },
          pageNumbers: pageNumbersConfig,
        },
        titlePage: false,
      },
      headers: defaultHeader ? { default: defaultHeader } : undefined,
      footers: defaultFooter ? { default: defaultFooter } : undefined,
      children: [...currentSectionChildren],
    });
    currentSectionChildren = [];
  };

  const getAlignment = (align?: string) => {
    switch (align) {
      case 'center': return AlignmentType.CENTER;
      case 'right': return AlignmentType.RIGHT;
      case 'justify': return AlignmentType.JUSTIFIED;
      case 'left':
      default: return AlignmentType.LEFT;
    }
  };

  const processNode = async (node: TiptapJSON, context: any = { listLevel: 0, listRef: null }): Promise<any> => {
    if (node.attrs?.suggestion === 'delete') {
      return null;
    }
    switch (node.type) {
      case 'heading':
      case 'paragraph': {
        const alignment = getAlignment(node.attrs?.textAlign || node.attrs?.align);
        const children = node.content ? await Promise.all(
          node.content.map(child => processNode(child, context))
        ) : [];
        
        // Extract ImageRuns that need to be wrapped
        const processedChildren = children.filter(Boolean).map(c => {
          if (c && c.isImageBlock) return c.run;
          return c;
        });
        
        const pProps: any = {
          alignment,
          children: processedChildren,
          spacing: { line: 276, after: 200 }, // Default Word spacing
        };
        
        if (node.type === 'heading') {
          const levelMap: Record<number, any> = {
            1: HeadingLevel.HEADING_1,
            2: HeadingLevel.HEADING_2,
            3: HeadingLevel.HEADING_3,
            4: HeadingLevel.HEADING_4,
            5: HeadingLevel.HEADING_5,
            6: HeadingLevel.HEADING_6,
          };
          const level = node.attrs?.level || 1;
          pProps.heading = levelMap[level];
          pProps.keepNext = true;
          pProps.keepLines = true;
          pProps.spacing = { before: 240, after: 120 }; // Headings have different default spacing
        }

        // Line Height mapping
        if (node.attrs?.lineHeight) {
          const lh = parseFloat(node.attrs.lineHeight);
          if (!isNaN(lh)) {
            pProps.spacing.line = Math.round(lh * 240); // 240 is 1.0 spacing in Word
            pProps.spacing.lineRule = "auto";
          }
        }

        // Indent mapping
        if (node.attrs?.indent) {
          const ind = parseInt(node.attrs.indent);
          if (!isNaN(ind)) {
            pProps.indent = pProps.indent || {};
            pProps.indent.left = ind * 360; // 360 twips = 0.25 inch per indent level
          }
        }
        
        if (node.attrs?.firstLineIndent) {
          const ind = parseInt(node.attrs.firstLineIndent);
          if (!isNaN(ind) && ind > 0) {
            pProps.indent = pProps.indent || {};
            pProps.indent.firstLine = ind * 720; // 720 twips = 0.5 inch = 1.27 cm
          }
        }

        // List numbering mapping
        if (context.listRef && context.isFirstBlock) {
          pProps.numbering = {
            reference: context.listRef,
            level: context.listLevel
          };
        }

        return new Paragraph(pProps);
      }

      case 'text': {
        const textRunProps: any = { text: node.text };
        let linkHref = null;
        
        if (node.marks) {
          node.marks.forEach(mark => {
            if (mark.type === 'bold') textRunProps.bold = true;
            if (mark.type === 'italic') textRunProps.italics = true;
            if (mark.type === 'underline') textRunProps.underline = { type: 'single' };
            if (mark.type === 'strike') textRunProps.strike = true;
            if (mark.type === 'superscript') textRunProps.superScript = true;
            if (mark.type === 'subscript') textRunProps.subScript = true;
            
            if (mark.type === 'link') {
              linkHref = mark.attrs?.href;
            }
            
            if (mark.type === 'highlight') {
              const color = (mark.attrs?.color || '#ffff00').replace('#', '');
              textRunProps.shading = {
                type: ShadingType.CLEAR,
                fill: color
              };
            }
            
            if (mark.type === 'textStyle') {
              if (mark.attrs?.fontFamily) textRunProps.font = mark.attrs.fontFamily;
              if (mark.attrs?.fontSize) {
                const fs = mark.attrs.fontSize.toLowerCase();
                let pt = 12;
                if (fs.endsWith('px')) {
                  pt = parseInt(fs) * 0.75;
                } else if (fs.endsWith('pt')) {
                  pt = parseInt(fs);
                } else {
                  pt = parseInt(fs);
                }
                if (!isNaN(pt)) textRunProps.size = Math.round(pt * 2); // Word size is in half-points
              }
              if (mark.attrs?.color) {
                textRunProps.color = mark.attrs.color.replace('#', '');
              }
            }
          });
        }
        
        const run = new TextRun(textRunProps);
        
        if (linkHref) {
           return new ExternalHyperlink({
             children: [
               new TextRun({ ...textRunProps, color: '0563C1', underline: { type: 'single' } })
             ],
             link: linkHref
           });
        }
        return run;
      }
      
      case 'image':
      case 'imageResize': {
        const src = node.attrs?.src;
        if (!src) return null;
        
        try {
          const response = await fetch(src);
          if (!response.ok) throw new Error('Failed to fetch image');
          const arrayBuffer = await response.arrayBuffer();
          
          let width = node.attrs?.width ? parseInt(node.attrs.width, 10) : undefined;
          let height = node.attrs?.height ? parseInt(node.attrs.height, 10) : undefined;
          
          if (!width || !height) {
            try {
              const dimensions = imageSize(Buffer.from(arrayBuffer));
              if (dimensions.width && dimensions.height) {
                if (!width && !height) {
                  width = dimensions.width;
                  height = dimensions.height;
                } else if (width && !height) {
                  height = Math.round(dimensions.height * (width / dimensions.width));
                } else if (!width && height) {
                  width = Math.round(dimensions.width * (height / dimensions.height));
                }
              }
            } catch (err) {
              console.error('Failed to get image dimensions:', err);
            }
          }

          if (!width) width = 300;
          if (!height) height = 300;

          if (width > 600) {
            const ratio = 600 / width;
            width = 600;
            height = Math.round(height * ratio);
          }

          // @ts-expect-error docx library version mismatch for ImageRun types
          const imageRun = new ImageRun({
            data: arrayBuffer,
            transformation: { width, height }
          });

          let alignment: any = AlignmentType.LEFT;
          if (node.attrs?.textAlign === 'center' || node.attrs?.align === 'center') alignment = AlignmentType.CENTER;
          else if (node.attrs?.textAlign === 'right' || node.attrs?.align === 'right') alignment = AlignmentType.RIGHT;

          return { isImageBlock: true, run: imageRun, alignment };
        } catch (e) {
          return new TextRun(`[Image: ${src}]`);
        }
      }

      case 'pageLayout': {
        pushSection();
        const marginMap: Record<string, any> = {
          normal: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          narrow: { top: 720, right: 720, bottom: 720, left: 720 },
          moderate: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
          wide: { top: 1440, right: 2880, bottom: 1440, left: 2880 },
        };
        const m = node.attrs?.margin || 'normal';
        if (marginMap[m]) currentMargin = marginMap[m];
        
        currentOrientation = node.attrs?.orientation === 'landscape' ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT;
        currentHeader = node.attrs?.header || '';
        currentFooter = node.attrs?.footer || '';
        return null;
      }
      
      case 'table': {
        const rows = [];
        if (node.content) {
          for (const row of node.content) {
            const cells = [];
            if (row.content) {
              for (const cell of row.content) {
                const cellChildren = cell.content ? await Promise.all(cell.content.map(p => processNode(p, context))) : [];
                cells.push(new TableCell({
                  children: cellChildren.filter(Boolean).length > 0 ? cellChildren.filter(Boolean).flat() : [new Paragraph('')],
                }));
              }
            }
            rows.push(new TableRow({ children: cells }));
          }
        }
        
        return new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
            insideVertical: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
          }
        });
      }

      case 'tableOfContents': {
        const tocTitle = node.attrs?.title || 'DAFTAR ISI';
        const headings = node.attrs?.headings || [];
        
        const titlePara = new Paragraph({
          text: tocTitle,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 }
        });
        
        const items = headings.map((h: any) => {
          const indent = (h.level - 1) * 360; // 0.25 inch per level
          return new Paragraph({
            tabStops: [
              {
                type: TabStopType.RIGHT,
                position: 9000, // Right aligned for standard page width
                leader: LeaderType.DOT,
              }
            ],
            indent: { left: indent },
            children: [
              new TextRun({ text: h.customText || h.text }),
              new TextRun({ text: '\t' }),
              new TextRun({ text: h.pageNumStr || '' })
            ],
            spacing: { after: 60 }
          });
        });
        
        return [titlePara, ...items];
      }
      
      case 'bulletList':
      case 'orderedList': {
        if (!node.content) return [];
        const ref = node.type === 'bulletList' ? 'bullet-list' : 'ordered-list';
        const newLevel = context.listRef ? context.listLevel + 1 : 0;
        const newContext = { ...context, listRef: ref, listLevel: newLevel };
        
        const items = [];
        for (const listItem of node.content) {
          if (listItem.content) {
            let isFirstBlock = true;
            for (const block of listItem.content) {
              const bContext = { ...newContext, isFirstBlock };
              const res = await processNode(block, bContext);
              if (res) {
                if (Array.isArray(res)) items.push(...res);
                else items.push(res);
              }
              if (block.type === 'paragraph' || block.type === 'heading') isFirstBlock = false;
            }
          }
        }
        return items;
      }

      default:
        if (node.content) {
          const children = await Promise.all(node.content.map(child => processNode(child, context)));
          return children.filter(Boolean).flat();
        }
        return null;
    }
  };

  // Traverse document root
  if (json.content) {
    for (const child of json.content) {
      if (child.attrs?.suggestion === 'delete') continue;
      
      if (child.attrs?.pageBreakBefore) {
        pushSection();
        globalPageCounter++;
      }
      
      const docxNode = await processNode(child);
      if (docxNode) {
        if (Array.isArray(docxNode)) {
          currentSectionChildren.push(...docxNode.filter(Boolean).map(c => c.isImageBlock ? new Paragraph({ alignment: c.alignment, children: [c.run] }) : c));
        } else {
          if (docxNode.isImageBlock) {
            currentSectionChildren.push(new Paragraph({ alignment: docxNode.alignment, children: [docxNode.run] }));
          } else if (docxNode instanceof ImageRun || docxNode instanceof TextRun || docxNode instanceof ExternalHyperlink) {
            currentSectionChildren.push(new Paragraph({ children: [docxNode] }));
          } else {
            currentSectionChildren.push(docxNode);
          }
        }
      }
    }
  }
  
  pushSection();
  if (sections.length === 0) {
    sections.push({
      properties: {
        page: {
          margin: currentMargin,
          size: { orientation: currentOrientation }
        }
      },
      children: [new Paragraph('')],
    });
  }

  return new Document({
    numbering: {
      config: [
        {
          reference: 'bullet-list',
          levels: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(level => ({
            level,
            format: 'bullet',
            text: '\u2022', // standard round bullet
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720 + (level * 360), hanging: 360 },
              }
            }
          })),
        },
        {
          reference: 'ordered-list',
          levels: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(level => ({
            level,
            format: 'decimal',
            text: `%${level + 1}.`,
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 720 + (level * 360), hanging: 360 },
              }
            }
          })),
        }
      ]
    },
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 24, // 12pt
            color: "000000",
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 32, bold: true, color: '000000' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 28, bold: true, color: '000000' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 24, bold: true, color: '000000' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading4',
          name: 'Heading 4',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 22, bold: true, color: '000000' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading5',
          name: 'Heading 5',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 22, bold: true, color: '000000' },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        {
          id: 'Heading6',
          name: 'Heading 6',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { size: 22, bold: true, color: '000000' },
          paragraph: { spacing: { before: 240, after: 120 } },
        }
      ]
    },
    sections,
  });
}
