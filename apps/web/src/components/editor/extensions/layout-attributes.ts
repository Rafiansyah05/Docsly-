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
              if (!attributes.listFontSize) return {};
              return { style: `font-size: ${attributes.listFontSize}` };
            },
          },
          listFontFamily: {
            default: '',
            parseHTML: element => element.style.fontFamily || '',
            renderHTML: attributes => {
              if (!attributes.listFontFamily) return {};
              return { style: `font-family: ${attributes.listFontFamily}` };
            },
          },
          listColor: {
            default: '',
            parseHTML: element => element.style.color || '',
            renderHTML: attributes => {
              if (!attributes.listColor) return {};
              return { style: `color: ${attributes.listColor}` };
            },
          },
          listFontWeight: {
            default: '',
            parseHTML: element => element.style.fontWeight || '',
            renderHTML: attributes => {
              if (!attributes.listFontWeight) return {};
              return { style: `font-weight: ${attributes.listFontWeight}` };
            },
          },
          listFontStyle: {
            default: '',
            parseHTML: element => element.style.fontStyle || '',
            renderHTML: attributes => {
              if (!attributes.listFontStyle) return {};
              return { style: `font-style: ${attributes.listFontStyle}` };
            },
          },
          listTextDecoration: {
            default: '',
            parseHTML: element => element.style.textDecoration || '',
            renderHTML: attributes => {
              if (!attributes.listTextDecoration) return {};
              return { style: `text-decoration: ${attributes.listTextDecoration}` };
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

          newState.doc.descendants((node: any, pos: number) => {
            if (this.options.types.includes(node.type.name)) {
              if (node.attrs.listType && node.attrs.listType !== 'none') {
                let firstWeight = '';
                let firstStyle = '';
                let firstDecoration = '';
                let firstFontSize = '';
                let firstFontFamily = '';
                let firstColor = '';
                
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

                // If the block is completely empty (no text node), keep existing attributes
                if (!found) {
                  firstWeight = node.attrs.listFontWeight || '';
                  firstStyle = node.attrs.listFontStyle || '';
                  firstDecoration = node.attrs.listTextDecoration || '';
                  firstFontSize = node.attrs.listFontSize || '';
                  firstFontFamily = node.attrs.listFontFamily || '';
                  firstColor = node.attrs.listColor || '';
                }
                
                if (
                  node.attrs.listFontWeight !== firstWeight ||
                  node.attrs.listFontStyle !== firstStyle ||
                  node.attrs.listTextDecoration !== firstDecoration ||
                  node.attrs.listFontSize !== firstFontSize ||
                  node.attrs.listFontFamily !== firstFontFamily ||
                  node.attrs.listColor !== firstColor
                ) {
                  tr.setNodeMarkup(pos, undefined, {
                    ...node.attrs,
                    listFontWeight: firstWeight,
                    listFontStyle: firstStyle,
                    listTextDecoration: firstDecoration,
                    listFontSize: firstFontSize,
                    listFontFamily: firstFontFamily,
                    listColor: firstColor,
                  });
                  modified = true;
                }
              }
            }
          });

          return modified ? tr : null;
        }
      })
    ];
  },
});
