import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import { formatPageNumber, PageSettings } from '@/lib/page-numbers';
import { PaginationPluginKey } from './pagination';

const TocComponent = ({ editor, node, updateAttributes, getPos }: any) => {
  const [headings, setHeadings] = useState<any[]>(node?.attrs?.headings || []);
  const [spacers, setSpacers] = useState<Record<number, number>>({});

  useEffect(() => {
    const updateToc = () => {
      const newHeadings: any[] = [];
      const dom = editor?.view?.dom;
      const editorRect = dom ? dom.getBoundingClientRect() : null;
      const FULL_STEP = 1163;
      const UNPRINTABLE_GAP = 96 + 40 + 96;
      const pageSettings = editor.state.doc.attrs.pageSettings as PageSettings | null;

      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'heading') {
          let pageNumStr = '';
          if (dom && editorRect && pageSettings?.enabled) {
            try {
              const domNode = editor.view.nodeDOM(pos) as HTMLElement;
              if (domNode && domNode.nodeType === 1) {
                const rect = domNode.getBoundingClientRect();
                const relativeY = Math.max(0, rect.top - editorRect.top);
                const absolutePage = Math.max(1, Math.ceil((relativeY + UNPRINTABLE_GAP) / FULL_STEP));
                pageNumStr = formatPageNumber(absolutePage, pageSettings) || '';
              }
            } catch (e) {
              // ignore
            }
          }

          const existing = node.attrs.headings?.find((old: any) => old.id === node.attrs.id);
          newHeadings.push({
            level: node.attrs.level,
            text: node.textContent,
            customText: existing?.customText,
            id: node.attrs.id,
            pos,
            pageNumStr
          });
        }
      });
      const currentHeadingsStr = JSON.stringify(node?.attrs?.headings || []);
      const newHeadingsStr = JSON.stringify(newHeadings);
      
      if (currentHeadingsStr !== newHeadingsStr) {
        setHeadings(newHeadings);
        updateAttributes({ headings: newHeadings });
      }
    };
    
    const updateSpacers = () => {
      const pos = typeof getPos === 'function' ? getPos() : -1;
      if (pos !== -1) {
        const pluginState = PaginationPluginKey.getState(editor.state) as any;
        const currentSpacers = pluginState?.spacers?.[`toc_${pos}`] || {};
        
        setSpacers(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(currentSpacers)) {
            return currentSpacers;
          }
          return prev;
        });
      }
    };

    // Need a small timeout to let the DOM render before calculating coordinates
    const handleUpdate = () => {
      setTimeout(() => {
        updateToc();
      }, 50);
    };
    
    const handleTransaction = () => {
      updateSpacers();
    };

    updateToc();
    updateSpacers();
    editor.on('update', handleUpdate);
    editor.on('transaction', handleTransaction);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  return (
    <NodeViewWrapper className="toc-wrapper my-4">
      <div 
        className="font-bold text-[14pt] text-center mb-4 outline-none"
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => updateAttributes({ title: e.currentTarget.textContent })}
      >
        {node.attrs.title || 'DAFTAR ISI'}
      </div>
      {headings.length === 0 ? (
        <div className="text-slate-400 text-sm">Belum ada heading di dokumen ini.</div>
      ) : (
        <ul className="space-y-1">
          {headings.map((h, idx) => (
            <li
              key={h.id || idx}
              style={{ 
                marginLeft: `${(h.level - 1) * 1.5}rem`,
                marginTop: spacers[idx] ? `${spacers[idx]}px` : undefined,
                ...(spacers[idx] ? {
                  position: 'relative',
                  borderTop: `${spacers[idx]}px solid transparent`,
                  backgroundClip: 'padding-box',
                  marginTop: 0, // override margin with border to act as a spacer that respects layout better
                } : {})
              }}
              className="text-sm flex items-end gap-2 group"
            >
              <span
                title="Ctrl+Click (Windows) atau Cmd+Click (Mac) untuk menuju ke bagian ini"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey) return; // Allow normal click for editing
                  e.preventDefault();
                  
                  // Find current position by ID to avoid stale pos RangeError
                  let targetPos = -1;
                  editor.state.doc.descendants((node: any, pos: number) => {
                    if (node.type.name === 'heading' && node.attrs.id === h.id) {
                      targetPos = pos;
                      return false; // stop traversal
                    }
                  });

                  if (targetPos !== -1) {
                    try {
                      editor.commands.setTextSelection(targetPos + 1);
                      editor.commands.focus();
                      const domNode = editor.view.domAtPos(targetPos).node;
                      if (domNode instanceof Element) {
                        domNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else if (domNode.parentElement) {
                        domNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    } catch (err) {
                      console.warn('Scroll to heading failed:', err);
                    }
                  }
                }}
                className="text-black cursor-pointer flex-shrink-0 outline-none hover:text-slate-700 hover:underline decoration-slate-400 underline-offset-4"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const newHeadings = [...headings];
                  newHeadings[idx].customText = e.currentTarget.textContent;
                  updateAttributes({ headings: newHeadings });
                }}
              >
                {h.customText || h.text}
              </span>
              <div className="flex-grow border-b-2 border-dotted border-slate-400 mb-1 opacity-50 group-hover:opacity-100 transition-opacity min-w-[20px]"></div>
              {h.pageNumStr && (
                <span className="flex-shrink-0 font-['Times_New_Roman',Times,serif] text-slate-700">
                  {h.pageNumStr}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </NodeViewWrapper>
  );
};

export const TableOfContents = Node.create({
  name: 'tableOfContents',
  group: 'block',
  atom: true, // it shouldn't have editable content inside it
  
  addAttributes() {
    return {
      title: {
        default: 'DAFTAR ISI',
        parseHTML: element => element.getAttribute('data-title') || 'DAFTAR ISI',
        renderHTML: attributes => ({ 'data-title': attributes.title }),
      },
      headings: {
        default: [],
        parseHTML: element => {
          const raw = element.getAttribute('data-headings');
          if (raw) {
            try { return JSON.parse(raw); } catch (e) { return []; }
          }
          return [];
        },
        renderHTML: attributes => {
          return { 'data-headings': JSON.stringify(attributes.headings || []) };
        }
      }
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-toc]' }];
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const headings = node.attrs.headings || [];
    const title = node.attrs.title || 'DAFTAR ISI';

    const items = headings.map((h: any) => {
      const indent = (h.level - 1) * 1.5;
      return [
        'li',
        { style: `display: flex; align-items: flex-end; margin-bottom: 4px; margin-left: ${indent}em;` },
        ['a', { href: `#${h.id}`, style: 'margin-right: 4px; color: black; text-decoration: none;' }, h.customText || h.text],
        ['span', { style: 'flex-grow: 1; border-bottom: 2px dotted black; opacity: 0.3; margin: 0 4px 4px 0; min-width: 20px;' }],
        ['span', { style: 'white-space: nowrap; font-family: "Times New Roman", Times, serif;' }, h.pageNumStr || '']
      ];
    });

    const ulOrEmpty = headings.length === 0 
      ? ['div', { style: 'color: #94a3b8; font-size: 0.875rem;' }, 'Belum ada heading di dokumen ini.']
      : ['ul', { style: 'list-style: none; padding: 0; margin: 0;' }, ...items];

    return [
      'div', 
      mergeAttributes(HTMLAttributes, { 'data-toc': '', style: 'margin-top: 1em; margin-bottom: 2em; page-break-inside: avoid;' }),
      ['div', { style: 'text-align: center; font-weight: bold; font-size: 14pt; margin-bottom: 1em;' }, title],
      ulOrEmpty
    ];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(TocComponent) as any;
  },
});
