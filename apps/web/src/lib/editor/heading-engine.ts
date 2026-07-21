import { Editor } from '@tiptap/react';
import { getMarkerInfo, buildDocumentTree, correctAnomaly, calculateModeBScore, FormatType, TreeNode } from './hierarchy-analyzer';
import { isLongText } from './heading-rules';

export interface AutoHeadingResult {
  totalFound: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count: number;
  h6Count: number;
}

export function analyzeDocument(editor: Editor): AutoHeadingResult {
  const result: AutoHeadingResult = {
    totalFound: 0,
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    h4Count: 0,
    h5Count: 0,
    h6Count: 0,
  };

  const { state, view } = editor;
  const { doc, schema } = state;
  let tr = state.tr;
  let changed = false;

  const nodes: { node: any; pos: number }[] = [];
  let hasDecimalMode = false;

  // Pass 1: Collect nodes and determine mode
  doc.forEach((node: any, offset: number) => {
    nodes.push({ node, pos: offset });
    if (node.type.name === 'paragraph' || node.type.name.includes('heading')) {
      const info = getMarkerInfo(node);
      if (info && info.format === 'DECIMAL') {
        hasDecimalMode = true; // Found e.g., 1.1 or 1.1.1
      }
    }
  });

  // Pass 2: Apply Hierarchy

  if (hasDecimalMode) {
    let currentIndent = 0;
    for (let i = 0; i < nodes.length; i++) {
      const { node, pos } = nodes[i];
      const nodeType = node.type.name;

      if (nodeType !== 'paragraph' && !nodeType.includes('heading')) continue;
      
      const info = getMarkerInfo(node);
      const mappedPos = tr.mapping.map(pos);

      if (info) {
        let detectedLevel: number | null = null;
        let newMarkerStr = info.marker;

        // MODE A: Strict Decimal (BAB -> H1, 1.1 -> H2, 1.1.1 -> H3)
        if (info.format === 'BAB') detectedLevel = 1;
        else if (info.format === 'DECIMAL') {
          const parts = info.marker.split('.').filter(Boolean);
          if (parts.length === 2) detectedLevel = 2;
          else if (parts.length === 3) detectedLevel = 3;
        }

        if (detectedLevel !== null && detectedLevel <= 3) {
          currentIndent = detectedLevel === 1 ? 0 : detectedLevel - 1;

          const headingType = schema.nodes.heading;
          if (headingType) {
            let finalAttrs = {
              ...node.attrs,
              level: detectedLevel,
              indent: 0,
              preserveFormat: true,
            };

            if (node.attrs.listType && node.attrs.listType !== 'none' && node.attrs.listPrefix) {
              finalAttrs.listType = 'none';
              finalAttrs.listPrefix = '';
              tr = tr.insertText(newMarkerStr + '. ', mappedPos + 1);
            }

            tr = tr.setNodeMarkup(mappedPos, headingType, finalAttrs, node.marks);
            changed = true;

            result.totalFound++;
            if (detectedLevel === 1) result.h1Count++;
            else if (detectedLevel === 2) result.h2Count++;
            else if (detectedLevel === 3) result.h3Count++;
          }
        } else {
          // It is a list item but not a heading in Mode A. Indent it like content.
          if (currentIndent > 0) {
            const finalAttrs = { ...node.attrs, indent: currentIndent };
            tr = tr.setNodeMarkup(mappedPos, null, finalAttrs, node.marks);
            changed = true;
          }
        }
      } else {
        // Content Node
        if (currentIndent > 0) {
          const finalAttrs = { ...node.attrs, indent: currentIndent };
          tr = tr.setNodeMarkup(mappedPos, null, finalAttrs, node.marks);
          changed = true;
        }
      }
    }
  } else {
    // MODE B: AST Parsing (Rule 7-10)
    const markerNodes = nodes
      .filter(n => n.node.type.name === 'paragraph' || n.node.type.name.includes('heading'))
      .map(n => ({ ...n, info: getMarkerInfo(n.node) }))
      .filter(n => n.info !== null) as any[];

    const tree = buildDocumentTree(markerNodes, nodes);

    const processTree = (treeNodes: TreeNode[], currentLevel: number) => {
      treeNodes.forEach((tn, index) => {
        tn.depth = currentLevel; // Assign depth for indentation logic
        
        // Compute subtree word count
        let totalWordCount = tn.wordCount;
        const addChildrenWords = (childrenNodes: TreeNode[]) => {
          childrenNodes.forEach(child => {
            child.depth = currentLevel + 1; // Assign depth to children beforehand just in case
            totalWordCount += child.wordCount;
            addChildrenWords(child.children);
          });
        };
        addChildrenWords(tn.children);

        const hasChildren = tn.children.length > 0;
        const score = calculateModeBScore(tn.node, totalWordCount, currentLevel > 1, hasChildren, tn.nextNodeIsLong, tn.isStandaloneParagraph);
        tn.score = score;
        
        if (score >= 80 && currentLevel <= 3) {
          tn.assignedLevel = currentLevel;
          
          // Detect Ambiguity and Determine Target Format (Rule 9 & Unconditional Normalization)
          const parentFormat = tn.parent ? tn.parent.info?.format : null;
          let targetFormat: FormatType = tn.info!.format;
          let needsFormatChange = false;
          
          if (parentFormat && tn.info?.format === parentFormat) {
            needsFormatChange = true;
            if (parentFormat === 'UPPER_ALPHA' || parentFormat === 'BAB') targetFormat = 'NUMERIC';
            else if (parentFormat === 'NUMERIC') targetFormat = 'LOWER_ALPHA';
            else targetFormat = 'NUMERIC'; 
          }
          
          const mappedPos = tr.mapping.map(tn.pos);
          
          // Unconditionally normalize the sequence!
          // We always call correctAnomaly to fix sequence gaps (e.g. A, C -> A, B)
          const finalMarkerStr = correctAnomaly(tn.node, mappedPos, tr, tn.info!.marker, targetFormat, index);
          
          const headingType = schema.nodes.heading;
          let finalAttrs = {
            ...tn.node.attrs,
            level: tn.assignedLevel,
            indent: 0,
            preserveFormat: true,
          };

          if (tn.node.attrs.listType && tn.node.attrs.listType !== 'none' && tn.node.attrs.listPrefix) {
            finalAttrs.listType = 'none';
            finalAttrs.listPrefix = '';
            // If it was a list item, correctAnomaly handled the listPrefix attribute instead of text insertion!
            // Wait, correctAnomaly handles BOTH listPrefix and text insertion.
            // If we wipe listType here, we MUST insert the text ourselves if it was a list item!
            // Actually, correctAnomaly updates tr with listPrefix. If we immediately set it to none, we lose the prefix!
            // So we should insert the text here, using finalMarkerStr.
            tr = tr.insertText(finalMarkerStr + '. ', mappedPos + 1);
          }

          tr = tr.setNodeMarkup(mappedPos, headingType, finalAttrs, tn.node.marks);
          changed = true;
          result.totalFound++;
          if (tn.assignedLevel === 1) result.h1Count++;
          else if (tn.assignedLevel === 2) result.h2Count++;
          else if (tn.assignedLevel === 3) result.h3Count++;
        }
        
        processTree(tn.children, currentLevel + 1);
      });
    }

    processTree(tree, 1);

    // Pass 3 (Mode B): Apply Indentation to contents and non-headings
    let currentDepth = 0;
    for (let i = 0; i < nodes.length; i++) {
      const { node, pos } = nodes[i];
      if (node.type.name !== 'paragraph' && !node.type.name.includes('heading')) continue;
      
      const mappedPos = tr.mapping.map(pos);
      const tn = markerNodes.find(m => m.pos === pos);
      
      if (tn) {
        currentDepth = tn.depth || 1;
        if (!tn.assignedLevel && currentDepth > 1) {
          // Normal list item that didn't become a heading. Indent it appropriately.
          const finalAttrs = { ...node.attrs, indent: currentDepth - 1 };
          tr = tr.setNodeMarkup(mappedPos, null, finalAttrs, node.marks);
          changed = true;
        }
      } else {
        // Content node
        if (currentDepth > 0) {
          const contentIndent = currentDepth; // content is indented to match its parent's depth
          const finalAttrs = { ...node.attrs, indent: contentIndent };
          tr = tr.setNodeMarkup(mappedPos, null, finalAttrs, node.marks);
          changed = true;
        }
      }
    }
  }

  if (changed) {
    tr.setMeta('addToHistory', true);
    view.dispatch(tr);
  }

  return result;
}
