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
        },
      },
    ];
  },
});
