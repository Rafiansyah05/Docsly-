import { Editor } from '@tiptap/react';

export type FormatType = 'NUMERIC' | 'UPPER_ALPHA' | 'LOWER_ALPHA' | 'ROMAN_UPPER' | 'ROMAN_LOWER' | 'DECIMAL' | 'BAB' | 'UNKNOWN';

export function getMarkerInfo(node: any): { marker: string, format: FormatType, rawText: string, value: number } | null {
  const rawText = node.textContent || '';
  const prefix = (node.attrs.listType && node.attrs.listType !== 'none' && node.attrs.listPrefix) 
    ? node.attrs.listPrefix + ' ' 
    : '';
  const fullText = (prefix + rawText).trim();

  if (/^BAB\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|\d+)/i.test(fullText)) {
    return { marker: 'BAB', format: 'BAB', rawText: fullText, value: 0 };
  }

  // Regex to match Roman Numerals (up to 39), Alpha, Decimal, or Numeric
  // Note: We use a non-capturing group for the Roman/Alpha/Numeric alternates
  // ROMAN: ^(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)$
  const match = fullText.match(/^([A-Za-z]|(?:[IVXLCDMivxlcdm]+)|\d+|(?:(?:\d+\.)*\d+))[.)]\s/);
  if (match) {
    const marker = match[1];
    let format: FormatType = 'UNKNOWN';
    let value = 0;

    const romanUpperRegex = /^(?=[MDCLXVI])M*(C[MD]|D?C*)(X[CL]|L?X*)(I[XV]|V?I*)$/;
    const romanLowerRegex = /^(?=[mdclxvi])m*(c[md]|d?c*)(x[cl]|l?x*)(i[xv]|v?i*)$/;

    if (marker.includes('.')) {
      format = 'DECIMAL';
    } else if (/^\d+$/.test(marker)) {
      format = 'NUMERIC';
      value = parseInt(marker, 10);
    } else if (romanUpperRegex.test(marker) && marker !== 'I' && marker !== 'V' && marker !== 'X' && marker !== 'L' && marker !== 'C' && marker !== 'D' && marker !== 'M') {
      // If it's a multi-letter roman numeral
      format = 'ROMAN_UPPER';
      value = parseRoman(marker);
    } else if (romanLowerRegex.test(marker) && marker !== 'i' && marker !== 'v' && marker !== 'x' && marker !== 'l' && marker !== 'c' && marker !== 'd' && marker !== 'm') {
      format = 'ROMAN_LOWER';
      value = parseRoman(marker);
    } else if (/^[A-Z]$/.test(marker)) {
      if (marker === 'I' || marker === 'V' || marker === 'X') {
        // Ambiguous single letter. We treat it as ROMAN if the context requires it, but for now default to UPPER_ALPHA
        format = 'UPPER_ALPHA';
        value = marker.charCodeAt(0) - 64; // A = 1
      } else {
        format = 'UPPER_ALPHA';
        value = marker.charCodeAt(0) - 64;
      }
    } else if (/^[a-z]$/.test(marker)) {
      if (marker === 'i' || marker === 'v' || marker === 'x') {
        format = 'LOWER_ALPHA';
        value = marker.charCodeAt(0) - 96;
      } else {
        format = 'LOWER_ALPHA';
        value = marker.charCodeAt(0) - 96;
      }
    }
    
    // Override for Roman single letters (I, V, X) - will be handled during sequence check if needed
    
    return { marker, format, rawText: fullText, value };
  }

  return null;
}

function parseRoman(roman: string): number {
  const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  let result = 0;
  roman = roman.toLowerCase();
  for (let i = 0; i < roman.length; i++) {
    const current = map[roman[i]];
    const next = map[roman[i + 1]];
    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

export function countWordsUntilNextListMarker(startIndex: number, nodes: {node: any, pos: number}[]): number {
  let count = 0;
  for (let i = startIndex + 1; i < nodes.length; i++) {
    const node = nodes[i].node;
    if (getMarkerInfo(node) || node.attrs?.listType === 'bullet') break;
    const text = node.textContent || '';
    count += text.split(/\s+/).filter(Boolean).length;
  }
  return count;
}

export function calculateModeBScore(
  node: any, 
  wordCount: number, 
  hasParent: boolean, 
  hasChildren: boolean,
  nextNodeIsLong: boolean,
  isStandaloneParagraph: boolean
): number {
  let score = 30; // Numbering Pattern Valid is assumed if we get here
  
  // Base bonus for H1 to compensate for lack of parent
  if (!hasParent) score += 25; 
  else score += 25; // Berada di bawah Parent
  
  // If it has children, it's definitely structurally important, give it the nextNodeIsLong bonus equivalent
  if (hasChildren) score += 15;
  else if (nextNodeIsLong) score += 15;

  if (wordCount >= 20) score += 35;
  if (isStandaloneParagraph) score += 10;
  
  const text = node.textContent || '';
  if (/[.?!;,]$/.test(text.trim())) score -= 20;
  
  // Only penalize empty content if it also has no children
  if (wordCount < 5 && !hasChildren) score -= 50;
  
  return score;
}

export function isNextInSequence(prevMarkerInfo: ReturnType<typeof getMarkerInfo> | null, currMarkerInfo: ReturnType<typeof getMarkerInfo> | null): boolean {
  if (!prevMarkerInfo || !currMarkerInfo) return false;
  
  let prevFormat = prevMarkerInfo.format;
  let currFormat = currMarkerInfo.format;
  let prevValue = prevMarkerInfo.value;
  let currValue = currMarkerInfo.value;

  // Handle ambiguous single Roman letters (I, V, X)
  if (prevFormat === 'ROMAN_UPPER' && currFormat === 'UPPER_ALPHA') {
    if (currMarkerInfo.marker === 'I' || currMarkerInfo.marker === 'V' || currMarkerInfo.marker === 'X') {
      currFormat = 'ROMAN_UPPER';
      currValue = parseRoman(currMarkerInfo.marker);
    }
  }
  if (prevFormat === 'ROMAN_LOWER' && currFormat === 'LOWER_ALPHA') {
    if (currMarkerInfo.marker === 'i' || currMarkerInfo.marker === 'v' || currMarkerInfo.marker === 'x') {
      currFormat = 'ROMAN_LOWER';
      currValue = parseRoman(currMarkerInfo.marker);
    }
  }
  if (prevFormat === 'UPPER_ALPHA' && currFormat === 'ROMAN_UPPER') {
    if (prevMarkerInfo.marker === 'I' || prevMarkerInfo.marker === 'V' || prevMarkerInfo.marker === 'X') {
      prevFormat = 'ROMAN_UPPER';
      prevValue = parseRoman(prevMarkerInfo.marker);
    } else {
      // Current is a multi-letter roman, but prev is a non-roman upper alpha. 
      // Example: prev = B, curr = III. They are not same format.
    }
  }

  // To be a sibling, the format must exactly match AND the sequence value must advance (curr > prev)
  // If curr <= prev (e.g. A followed by A, or 2 followed by 1), it is considered a reset/child, NOT a sibling!
  if (prevFormat === currFormat && currValue > prevValue) {
    // If we've confirmed they are both treated as ROMAN_UPPER for this check, we should 
    // ideally mutate the info format so that subsequent checks know it's ROMAN.
    // We can do this because objects are passed by reference.
    if (prevFormat !== prevMarkerInfo.format) {
       prevMarkerInfo.format = prevFormat;
       prevMarkerInfo.value = prevValue;
    }
    if (currFormat !== currMarkerInfo.format) {
       currMarkerInfo.format = currFormat;
       currMarkerInfo.value = currValue;
    }
    return true;
  }
  
  return false;
}

export interface TreeNode {
  node: any;
  pos: number;
  mappedPos: number;
  info: ReturnType<typeof getMarkerInfo>;
  wordCount: number;
  nextNodeIsLong: boolean;
  isStandaloneParagraph: boolean;
  parent: TreeNode | null;
  children: TreeNode[];
  score: number;
  assignedLevel: number;
  depth?: number;
}

export function buildDocumentTree(markerNodes: {node: any, pos: number, info: ReturnType<typeof getMarkerInfo>}[], allNodes: {node: any, pos: number}[]): TreeNode[] {
  const rootNodes: TreeNode[] = [];
  const activePath: TreeNode[] = [];

  for (let i = 0; i < markerNodes.length; i++) {
    const mn = markerNodes[i];
    
    // Calculate word count for this node (words until next marker)
    let wordCount = 0;
    const startIndex = allNodes.findIndex(n => n.pos === mn.pos);
    let nextNodeIsLong = false;
    let isStandaloneParagraph = true;

    if (startIndex !== -1) {
      for (let j = startIndex + 1; j < allNodes.length; j++) {
        const nextNode = allNodes[j].node;
        if (getMarkerInfo(nextNode) || nextNode.attrs?.listType === 'bullet') break;
        
        const text = nextNode.textContent || '';
        if (text.trim()) {
          const words = text.split(/\s+/).filter(Boolean).length;
          wordCount += words;
          if (j === startIndex + 1 && words > 12) nextNodeIsLong = true;
          if (j > startIndex + 1) isStandaloneParagraph = false;
        }
      }
    }

    const treeNode: TreeNode = {
      node: mn.node,
      pos: mn.pos,
      mappedPos: mn.pos,
      info: mn.info,
      wordCount,
      nextNodeIsLong,
      isStandaloneParagraph,
      parent: null,
      children: [],
      score: 0,
      assignedLevel: 0
    };

    // Find if it's a sibling of any active node
    let siblingIndex = -1;
    for (let j = activePath.length - 1; j >= 0; j--) {
      if (isNextInSequence(activePath[j].info, treeNode.info)) {
        siblingIndex = j;
        break;
      }
    }

    if (siblingIndex !== -1) {
      // It's a sibling of activePath[siblingIndex]
      const sibling = activePath[siblingIndex];
      treeNode.parent = sibling.parent;
      if (treeNode.parent) {
        treeNode.parent.children.push(treeNode);
      } else {
        rootNodes.push(treeNode);
      }
      // Truncate activePath and push new node
      activePath.length = siblingIndex;
      activePath.push(treeNode);
    } else {
      // It's a child of the deepest active node
      if (activePath.length > 0) {
        const parent = activePath[activePath.length - 1];
        treeNode.parent = parent;
        parent.children.push(treeNode);
      } else {
        rootNodes.push(treeNode);
      }
      activePath.push(treeNode);
    }
  }

  return rootNodes;
}

export function correctAnomaly(node: any, mappedPos: number, tr: any, currentMarker: string, targetFormat: FormatType, index: number): string {
  const clean = currentMarker.replace(/[.)\s]/g, '');
  let newPrefix = clean;

  if (targetFormat === 'NUMERIC') newPrefix = (index + 1).toString();
  else if (targetFormat === 'LOWER_ALPHA') newPrefix = String.fromCharCode(96 + index + 1);
  else if (targetFormat === 'UPPER_ALPHA') newPrefix = String.fromCharCode(64 + index + 1);
  else if (targetFormat === 'ROMAN_UPPER') newPrefix = toRoman(index + 1);
  else if (targetFormat === 'ROMAN_LOWER') newPrefix = toRoman(index + 1).toLowerCase();
  
  if (node.attrs.listType && node.attrs.listType !== 'none' && node.attrs.listPrefix) {
    tr = tr.setNodeMarkup(mappedPos, null, { ...node.attrs, listPrefix: newPrefix + '.' });
  } else {
    const text = node.textContent || '';
    const match = text.match(/^([A-Za-z]|(?:[IVXLCDMivxlcdm]+)|\d+|(?:(?:\d+\.)*\d+))([.)]\s)/);
    if (match) {
      tr = tr.delete(mappedPos + 1, mappedPos + 1 + match[1].length);
      tr = tr.insertText(newPrefix, mappedPos + 1);
    }
  }
  return newPrefix;
}

function toRoman(num: number): string {
  const map: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400,
    C: 100, XC: 90, L: 50, XL: 40,
    X: 10, IX: 9, V: 5, IV: 4, I: 1
  };
  let result = '';
  for (const key in map) {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  }
  return result || 'I';
}
