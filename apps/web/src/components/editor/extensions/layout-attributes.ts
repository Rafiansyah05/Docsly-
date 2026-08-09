import { Extension } from '@tiptap/core';

export interface LayoutAttributesOptions {
  types: string[];
}

export const LayoutAttributes = Extension.create<LayoutAttributesOptions>({
  name: 'layoutAttributes',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          listType: {
            default: 'none',
            parseHTML: element => element.getAttribute('data-list-type') || 'none',
            renderHTML: attributes => {
              if (attributes.listType === 'none' || !attributes.listType) return {};
              return { 'data-list-type': attributes.listType };
            },
          },
          listPrefix: {
            default: '',
            parseHTML: element => element.getAttribute('data-list-prefix') || '',
            renderHTML: attributes => {
              if (!attributes.listPrefix) return {};
              return { 'data-list-prefix': attributes.listPrefix };
            },
          },
          listLevel: {
            default: 1,
            parseHTML: element => parseInt(element.getAttribute('data-list-level') || '1', 10),
            renderHTML: attributes => {
              if (attributes.listLevel === 1 || !attributes.listLevel) return {};
              return { 'data-list-level': attributes.listLevel };
            },
          },
          listFontSize: {
            default: '',
            parseHTML: element => element.style.fontSize || '',
            renderHTML: attributes => {
              // only render for lists to avoid conflicts, baseFontSize handles the block style
              if (!attributes.listFontSize || attributes.listType === 'none') return {};
              return { style: `font-size: ${attributes.listFontSize}` };
            },
          },
          listFontFamily: {
            default: '',
            parseHTML: element => element.style.fontFamily || '',
            renderHTML: attributes => {
              if (!attributes.listFontFamily || attributes.listType === 'none') return {};
              return { style: `font-family: ${attributes.listFontFamily}` };
            },
          },
          listColor: {
            default: '',
            parseHTML: element => element.style.color || '',
            renderHTML: attributes => {
              if (!attributes.listColor || attributes.listType === 'none') return {};
              return { style: `color: ${attributes.listColor}` };
            },
          },
          listFontWeight: {
            default: '',
            parseHTML: element => element.style.fontWeight || '',
            renderHTML: attributes => {
              if (!attributes.listFontWeight || attributes.listType === 'none') return {};
              return { style: `font-weight: ${attributes.listFontWeight}` };
            },
          },
          listFontStyle: {
            default: '',
            parseHTML: element => element.style.fontStyle || '',
            renderHTML: attributes => {
              if (!attributes.listFontStyle || attributes.listType === 'none') return {};
              return { style: `font-style: ${attributes.listFontStyle}` };
            },
          },
          listTextDecoration: {
            default: '',
            parseHTML: element => element.style.textDecoration || '',
            renderHTML: attributes => {
              if (!attributes.listTextDecoration || attributes.listType === 'none') return {};
              return { style: `text-decoration: ${attributes.listTextDecoration}` };
            },
          },
          // New generic block formatting to persist fonts on Enter
          baseFontSize: {
            default: '',
            parseHTML: element => element.style.fontSize || '',
            renderHTML: attributes => {
              if (!attributes.baseFontSize) return {};
              return { style: `font-size: ${attributes.baseFontSize}` };
            },
          },
          baseFontFamily: {
            default: '',
            parseHTML: element => element.style.fontFamily || '',
            renderHTML: attributes => {
              if (!attributes.baseFontFamily) return {};
              return { style: `font-family: ${attributes.baseFontFamily}` };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    const { Plugin, PluginKey } = require('prosemirror-state');
    return [
      new Plugin({
        key: new PluginKey('syncListMarks'),
        appendTransaction: (transactions: any[], oldState: any, newState: any) => {
          if (!transactions.some((tr: any) => tr.docChanged)) return null;

          let tr = newState.tr;
          let modified = false;

          let globalLastWeight = '';
          let globalLastStyle = '';
          let globalLastDecoration = '';
          let globalLastFontSize = '';
          let globalLastFontFamily = '';
          let globalLastColor = '';

          newState.doc.descendants((node: any, pos: number) => {
            if (this.options.types.includes(node.type.name)) {
              
              let firstWeight = '';
              let firstStyle = '';
              let firstDecoration = '';
              let firstFontSize = node.attrs.baseFontSize || node.attrs.listFontSize || '';
              let firstFontFamily = node.attrs.baseFontFamily || node.attrs.listFontFamily || '';
              let firstColor = node.attrs.listColor || '';
              
              let found = false;
              node.descendants((child: any) => {
                if (found) return false;
                if (child.isText) {
                  child.marks.forEach((mark: any) => {
                    if (mark.type.name === 'bold') firstWeight = 'bold';
                    if (mark.type.name === 'italic') firstStyle = 'italic';
                    if (mark.type.name === 'underline') firstDecoration = 'underline';
                    if (mark.type.name === 'strike') firstDecoration = firstDecoration ? `${firstDecoration} line-through` : 'line-through';
                    if (mark.type.name === 'textStyle') {
                      if (mark.attrs.fontSize) firstFontSize = mark.attrs.fontSize;
                      if (mark.attrs.fontFamily) firstFontFamily = mark.attrs.fontFamily;
                      if (mark.attrs.color) firstColor = mark.attrs.color;
                    }
                  });
                  found = true;
                  return false;
                }
              });

              // If block is empty, retain its existing properties so they carry over when typing
              // If it doesn't have any, inherit from the previous block (fixes splitListItem / empty lines)
              if (!found) {
                firstWeight = node.attrs.listFontWeight || globalLastWeight || '';
                firstStyle = node.attrs.listFontStyle || globalLastStyle || '';
                firstDecoration = node.attrs.listTextDecoration || globalLastDecoration || '';
                firstFontSize = firstFontSize || globalLastFontSize || '';
                firstFontFamily = firstFontFamily || globalLastFontFamily || '';
                firstColor = firstColor || globalLastColor || '';
              }
              
              globalLastWeight = firstWeight;
              globalLastStyle = firstStyle;
              globalLastDecoration = firstDecoration;
              globalLastFontSize = firstFontSize;
              globalLastFontFamily = firstFontFamily;
              globalLastColor = firstColor;

              // We sync list styling if it's a list, AND we sync base styling globally
              const isList = node.attrs.listType && node.attrs.listType !== 'none';
              
              const updates: any = {};
              let hasUpdates = false;

              if (isList) {
                if (node.attrs.listFontWeight !== firstWeight) { updates.listFontWeight = firstWeight; hasUpdates = true; }
                if (node.attrs.listFontStyle !== firstStyle) { updates.listFontStyle = firstStyle; hasUpdates = true; }
                if (node.attrs.listTextDecoration !== firstDecoration) { updates.listTextDecoration = firstDecoration; hasUpdates = true; }
                if (node.attrs.listFontSize !== firstFontSize) { updates.listFontSize = firstFontSize; hasUpdates = true; }
                if (node.attrs.listFontFamily !== firstFontFamily) { updates.listFontFamily = firstFontFamily; hasUpdates = true; }
                if (node.attrs.listColor !== firstColor) { updates.listColor = firstColor; hasUpdates = true; }
              }

              // Always sync base font family/size for ALL paragraphs/headings to fix the "Enter resets font" issue
              if (node.attrs.baseFontSize !== firstFontSize) { updates.baseFontSize = firstFontSize; hasUpdates = true; }
              if (node.attrs.baseFontFamily !== firstFontFamily) { updates.baseFontFamily = firstFontFamily; hasUpdates = true; }

              if (hasUpdates) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  ...updates
                });
                modified = true;
              }
            }
          });

          return modified ? tr : null;
        }
      })
    ];
  },
});

