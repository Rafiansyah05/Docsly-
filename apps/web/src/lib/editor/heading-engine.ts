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
          const headingType = schema.nodes.heading;
          if (headingType) {
            let finalAttrs = {
              ...node.attrs,
              level: detectedLevel,
              preserveFormat: true,
            };

            tr = tr.setNodeMarkup(mappedPos, headingType, finalAttrs, node.marks);
            changed = true;

            result.totalFound++;
            if (detectedLevel === 1) result.h1Count++;
            else if (detectedLevel === 2) result.h2Count++;
            else if (detectedLevel === 3) result.h3Count++;
          }
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
          
          const mappedPos = tr.mapping.map(tn.pos);
          const headingType = schema.nodes.heading;
          let finalAttrs = {
            ...tn.node.attrs,
            level: tn.assignedLevel,
            preserveFormat: true,
          };

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
  }

  if (changed) {
    tr.setMeta('addToHistory', true);
    view.dispatch(tr);
  }

  return result;
}
