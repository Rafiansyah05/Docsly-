import { Node, mergeAttributes, Extension } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import { formatCitation } from '@/lib/citation-formatter';

// --- Global Reference Store (for MVP simplicity) ---
// In a real app, this would be in a database or context, synced with the document.
let globalReferences: Record<string, any> = {};

export const addReference = (id: string, ref: any) => {
  globalReferences[id] = ref;
  // Trigger re-render of bibliography
  window.dispatchEvent(new Event('referencesUpdated'));
};

export const getReferences = () => Object.values(globalReferences);

// --- In-Text Citation Node ---
export const Citation = Node.create({
  name: 'citation',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      refId: {
        default: null,
      },
      style: {
        default: 'APA', // APA or Harvard
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-citation]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-citation': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer((props: any) => {
      const ref = globalReferences[props.node.attrs.refId];
      if (!ref) {
        return <NodeViewWrapper as="span" className="bg-red-100 text-red-600 px-1 rounded text-sm">[Ref Missing]</NodeViewWrapper>;
      }
      
      const author = ref.penulis ? ref.penulis.split(' ')[0] : 'Unknown';
      const year = ref.tahun || 'n.d.';
      
      let displayText = `(${author}, ${year})`;
      if (props.node.attrs.style === 'Harvard') {
        displayText = `(${author} ${year})`; // Simplified Harvard difference
      }

      return (
        <NodeViewWrapper as="span" className="bg-slate-100 text-blue-700 px-1 rounded text-sm cursor-pointer hover:bg-slate-200 transition-colors">
          {displayText}
        </NodeViewWrapper>
      );
    }) as any;
  },
});

// --- Bibliography Node ---
const BibliographyComponent = ({ editor }: any) => {
  const [refs, setRefs] = useState<any[]>([]);

  useEffect(() => {
    const update = () => {
      const allRefs = getReferences();
      // Sort alphabetically by author
      const sorted = allRefs.sort((a, b) => (a.penulis || '').localeCompare(b.penulis || ''));
      setRefs(sorted);
    };
    
    update();
    window.addEventListener('referencesUpdated', update);
    return () => window.removeEventListener('referencesUpdated', update);
  }, []);

  return (
    <NodeViewWrapper className="bibliography-wrapper mt-8 border-t pt-4">
      <div className="font-bold text-xl mb-4 text-center">DAFTAR PUSTAKA</div>
      {refs.length === 0 ? (
        <p className="text-slate-400 italic text-sm">Belum ada sitasi yang ditambahkan ke dokumen ini.</p>
      ) : (
        <div className="space-y-3">
          {refs.map((r, idx) => (
              <div 
                key={r.id || idx} 
                className="text-sm text-slate-800 leading-relaxed break-words" 
                style={{ paddingLeft: '1.27cm', textIndent: '-1.27cm', marginLeft: '0px' }}
              >
                {formatCitation(r, 'APA').map((part, i) => (
                  <span key={i} className={part.italic ? 'italic' : ''}>{part.text}</span>
                ))}
              </div>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
};

export const Bibliography = Node.create({
  name: 'bibliography',
  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-bibliography]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-bibliography': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BibliographyComponent) as any;
  },
});
