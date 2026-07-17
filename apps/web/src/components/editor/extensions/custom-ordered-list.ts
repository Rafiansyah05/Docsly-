// @ts-nocheck
import { OrderedList } from '@tiptap/extension-ordered-list';
import { wrappingInputRule } from '@tiptap/core';

export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listType: {
        default: 'decimal',
        parseHTML: element => element.getAttribute('data-list-type') || element.getAttribute('type') || 'decimal',
        renderHTML: attributes => {
          if (attributes.listType === 'decimal') {
            return {};
          }
          if (attributes.listType === 'multi-level') {
            return {
              'data-list-type': 'multi-level',
            };
          }
          return {
            type: attributes.listType === 'lower-alpha' ? 'a' : '1',
            'data-list-type': attributes.listType,
          };
        },
      },
      listPrefix: {
        default: null,
        parseHTML: element => element.getAttribute('data-prefix') || null,
        renderHTML: attributes => {
          if (!attributes.listPrefix) return {};
          const startNum = attributes.start ? attributes.start - 1 : 0;
          return { 
            'data-prefix': attributes.listPrefix,
            style: `--list-prefix: '${attributes.listPrefix}'; --list-start: ${startNum};`
          };
        },
      },
    };
  },

  addInputRules() {
    return [
      // Multi-level list: "1.1. ", "1.1.1. " dsb
      wrappingInputRule({
        find: /^((?:\d+\.)+)(\d+)\.?\s$/,
        type: this.type,
        getAttributes: match => {
          return { 
            listType: 'multi-level', 
            listPrefix: match[1],
            start: +match[2]
          };
        },
        joinPredicate: (match, node) => node.type === this.type && node.attrs.listType === 'multi-level' && node.attrs.listPrefix === match[1],
      }),
      // Standard number list: "1. "
      wrappingInputRule({
        find: /^(\d+)\.\s$/,
        type: this.type,
        getAttributes: match => ({ start: +match[1], listType: 'decimal' }),
        joinPredicate: (match, node) => node.type === this.type && node.attrs.listType === 'decimal',
      }),
      // Alphabetical list: "a. "
      wrappingInputRule({
        find: /^([a-z])\.\s$/,
        type: this.type,
        getAttributes: match => ({ start: match[1].charCodeAt(0) - 96, listType: 'lower-alpha' }),
        joinPredicate: (match, node) => node.type === this.type && node.attrs.listType === 'lower-alpha',
      }),
    ];
  },
});
