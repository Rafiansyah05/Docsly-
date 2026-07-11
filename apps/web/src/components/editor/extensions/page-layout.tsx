import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export interface PageLayoutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageLayout: {
      /**
       * Insert a page layout break
       */
      setPageLayout: (options?: { margin?: string; orientation?: string; header?: string; footer?: string }) => ReturnType;
    };
  }
}

export const PageLayout = Node.create<PageLayoutOptions>({
  name: 'pageLayout',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'page-layout-break',
      },
    };
  },

  addAttributes() {
    return {
      margin: {
        default: 'normal',
        parseHTML: element => element.getAttribute('data-margin'),
        renderHTML: attributes => {
          if (!attributes.margin) return {};
          return { 'data-margin': attributes.margin };
        },
      },
      orientation: {
        default: 'portrait',
        parseHTML: element => element.getAttribute('data-orientation'),
        renderHTML: attributes => {
          if (!attributes.orientation) return {};
          return { 'data-orientation': attributes.orientation };
        },
      },
      header: {
        default: '',
        parseHTML: element => element.getAttribute('data-header'),
        renderHTML: attributes => {
          if (!attributes.header) return {};
          return { 'data-header': attributes.header };
        },
      },
      footer: {
        default: '',
        parseHTML: element => element.getAttribute('data-footer'),
        renderHTML: attributes => {
          if (!attributes.footer) return {};
          return { 'data-footer': attributes.footer };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-layout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'page-layout' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageLayoutComponent) as any;
  },

  addCommands() {
    return {
      setPageLayout: (options) => ({ chain }) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: options,
          })
          .run();
      },
    };
  },
});

function PageLayoutComponent(props: any) {
  const { node, updateAttributes, deleteNode } = props;
  const { margin, orientation, header, footer } = node.attrs;

  return (
    <NodeViewWrapper className="page-layout-break relative my-8 p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col gap-2 select-none group">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={deleteNode} className="text-xs bg-white border border-slate-200 text-red-500 px-2 py-1 rounded shadow-sm hover:bg-red-50">
          Hapus Section
        </button>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Page Section Break</span>
        <div className="flex-1 h-px bg-slate-300" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">Margin</label>
          <select 
            className="text-xs p-1 border rounded bg-white"
            value={margin} 
            onChange={e => updateAttributes({ margin: e.target.value })}
          >
            <option value="normal">Normal</option>
            <option value="narrow">Narrow</option>
            <option value="moderate">Moderate</option>
            <option value="wide">Wide</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-500">Orientasi</label>
          <select 
            className="text-xs p-1 border rounded bg-white"
            value={orientation} 
            onChange={e => updateAttributes({ orientation: e.target.value })}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 mt-2">
        <label className="text-[10px] uppercase font-bold text-slate-500">Header Teks</label>
        <input 
          type="text" 
          className="text-xs p-1.5 border rounded bg-white"
          value={header}
          onChange={e => updateAttributes({ header: e.target.value })}
          placeholder="Teks header section ini..."
        />
      </div>
      <div className="flex flex-col gap-1 mt-1">
        <label className="text-[10px] uppercase font-bold text-slate-500">Footer Teks</label>
        <input 
          type="text" 
          className="text-xs p-1.5 border rounded bg-white"
          value={footer}
          onChange={e => updateAttributes({ footer: e.target.value })}
          placeholder="Teks footer section ini..."
        />
      </div>
    </NodeViewWrapper>
  );
}
