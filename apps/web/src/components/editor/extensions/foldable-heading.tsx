// @ts-nocheck
import { Heading } from '@tiptap/extension-heading';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ChevronRight, ChevronDown } from 'lucide-react';
import React from 'react';

const FoldableHeadingComponent = (props: any) => {
  const { node, updateAttributes, editor } = props;
  const isCollapsed = node.attrs.collapsed;

  const toggleCollapse = () => {
    updateAttributes({ collapsed: !isCollapsed });
  };

  const Tag = `h${node.attrs.level}` as any;
  const isEditable = editor.isEditable;
  const textAlign = node.attrs.textAlign || 'left';

  return (
    <NodeViewWrapper className={`group relative heading-level-${node.attrs.level}`} style={{ textAlign }}>
      {isEditable && (
        <div 
          contentEditable={false} 
          onClick={toggleCollapse}
          className="absolute -left-6 top-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-slate-400 hover:bg-slate-200 select-none"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </div>
      )}
      <NodeViewContent as={Tag} className="w-full m-0 !font-normal !text-base !leading-normal !text-inherit" style={{ textAlign }} />
    </NodeViewWrapper>
  );
};

export const FoldableHeadingPluginKey = new PluginKey('foldableHeading');

export const foldableHeadingPlugin = new Plugin({
  key: FoldableHeadingPluginKey,
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, oldState) {
      const decorations: Decoration[] = [];
      const doc = tr.doc;
      
      let activeFoldLevel: number | null = null;

      doc.forEach((node, offset) => {
        if (node.type.name === 'heading') {
          const level = node.attrs.level;
          
          if (activeFoldLevel !== null && level <= activeFoldLevel) {
            activeFoldLevel = null;
          }
          
          if (activeFoldLevel !== null) {
            decorations.push(Decoration.node(offset, offset + node.nodeSize, {
              style: 'display: none;',
              class: 'hidden-by-fold'
            }));
          } else if (node.attrs.collapsed) {
            activeFoldLevel = level;
          }
        } else if (activeFoldLevel !== null) {
          decorations.push(Decoration.node(offset, offset + node.nodeSize, {
            style: 'display: none;',
            class: 'hidden-by-fold'
          }));
        }
      });
      
      return DecorationSet.create(doc, decorations);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    }
  },
  appendTransaction(transactions, oldState, newState) {
    if (!transactions.some(tr => tr.docChanged)) return;
    let tr = newState.tr;
    let modified = false;

    newState.doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && !node.attrs.id) {
        const id = 'heading-' + Math.random().toString(36).substr(2, 9);
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
        modified = true;
      }
    });

    if (modified) return tr;
  }
});

export const FoldableHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id') || null,
        renderHTML: attributes => {
          if (!attributes.id) return {};
          return { id: attributes.id };
        },
      },
      collapsed: {
        default: false,
        parseHTML: element => element.getAttribute('data-collapsed') === 'true',
        renderHTML: attributes => {
          if (!attributes.collapsed) return {};
          return { 'data-collapsed': 'true' };
        },
      },
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(FoldableHeadingComponent);
  },

  addProseMirrorPlugins() {
    return [
      foldableHeadingPlugin,
    ];
  }
});
