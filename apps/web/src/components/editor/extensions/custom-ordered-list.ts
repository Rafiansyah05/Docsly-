// @ts-nocheck
import { OrderedList } from '@tiptap/extension-ordered-list';
import { wrappingInputRule } from '@tiptap/core';

export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listType: {
        default: 'decimal',
        parseHTML: element => element.getAttribute('type') || 'decimal',
        renderHTML: attributes => {
          if (attributes.listType === 'decimal') {
            return {};
          }
          return {
            type: attributes.listType === 'lower-alpha' ? 'a' : '1',
            'data-list-type': attributes.listType,
          };
        },
      },
    };
  },

  addInputRules() {
    return [
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
