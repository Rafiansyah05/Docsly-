import { Editor } from '@tiptap/react';

export function applyMultilevelNumbering(editor: Editor) {
  const { state, view } = editor;
  const { doc } = state;
  let tr = state.tr;
  let changed = false;

  // We maintain a tree of counters. 
  // numberingCounters[0] is for 1-digit prefixes (e.g., "1.")
  // numberingCounters[1] is for 2-digit prefixes (e.g., "1.1.")
  const numberingCounters: number[] = [];

  const nodes: { node: any; pos: number }[] = [];
  doc.forEach((node: any, offset: number) => {
    nodes.push({ node, pos: offset });
  });

  for (let i = 0; i < nodes.length; i++) {
    const { node, pos } = nodes[i];
    
    const isDecimalList = node.attrs?.listType === 'decimal';
    const isHeading = node.type.name === 'heading';

    // If it's a Heading WITHOUT a decimal list, it might be a Chapter (BAB I).
    // In Indonesian format, "BAB II" resets the first digit of the sub-numbering to 2!
    if (isHeading && !isDecimalList) {
      const text = node.textContent.trim().toUpperCase();
      const babMatch = text.match(/^BAB\s+([IVXivx]+|\d+)/i);
      if (babMatch) {
        let babNumber = 1;
        const roman = babMatch[1].toUpperCase();
        if (roman === 'I' || roman === '1') babNumber = 1;
        else if (roman === 'II' || roman === '2') babNumber = 2;
        else if (roman === 'III' || roman === '3') babNumber = 3;
        else if (roman === 'IV' || roman === '4') babNumber = 4;
        else if (roman === 'V' || roman === '5') babNumber = 5;
        else if (roman === 'VI' || roman === '6') babNumber = 6;
        else if (roman === 'VII' || roman === '7') babNumber = 7;
        else if (roman === 'VIII' || roman === '8') babNumber = 8;
        else if (roman === 'IX' || roman === '9') babNumber = 9;
        else if (roman === 'X' || roman === '10') babNumber = 10;
        
        // Force the first counter to be the BAB number, and reset children
        numberingCounters[0] = babNumber;
        numberingCounters.length = 1; // Clear deeper levels
      }
      continue;
    }

    if (isDecimalList) {
      const currentPrefix = (node.attrs.listPrefix || '').trim();
      // Extract the numbers from the prefix, e.g., "1.2." -> [1, 2]
      const parts = currentPrefix.split('.').filter(Boolean).map((n: string) => parseInt(n, 10));
      
      if (parts.length === 0) continue; // safety check

      const depth = parts.length;
      
      // Ensure the counters array is at least this deep
      while (numberingCounters.length < depth) {
        numberingCounters.push(0);
      }

      // Increment the counter for this depth
      numberingCounters[depth - 1]++;

      // Reset all deeper counters
      numberingCounters.length = depth;

      // Construct the new prefix
      // Wait, if depth is 2 (e.g. 2.1), the first digit should be numberingCounters[0]
      // which was set by BAB II!
      // If numberingCounters[0] was never initialized (no BAB), it defaults to parts[0] or 1.
      
      // Check if we need to initialize missing parent counters (if they skipped levels)
      for (let d = 0; d < depth; d++) {
        if (numberingCounters[d] === undefined || isNaN(numberingCounters[d]) || numberingCounters[d] === 0) {
          numberingCounters[d] = parts[d] || 1; 
        }
      }

      const newPrefix = numberingCounters.join('.') + '.';

      if (currentPrefix !== newPrefix) {
        const mappedPos = tr.mapping.map(pos);
        const newAttrs = {
          ...node.attrs,
          listPrefix: newPrefix
        };
        tr = tr.setNodeMarkup(mappedPos, null, newAttrs, node.marks);
        changed = true;
      }
    }
  }

  if (changed) {
    tr.setMeta('addToHistory', true);
    view.dispatch(tr);
  }
}
