import { Extension } from '@tiptap/core';
import { textblockTypeInputRule } from '@tiptap/react';

export interface FlatListOptions {
  types: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flatList: {
      toggleFlatList: (listType: string, listPrefix?: string) => ReturnType;
    };
  }
}

export const FlatListEngine = Extension.create<FlatListOptions>({
  name: 'flatListEngine',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addCommands() {
    return {
      toggleFlatList: (listType: string, listPrefix: string = '• ') => ({ commands, editor }) => {
        const { selection } = editor.state;
        const attrs = editor.getAttributes(selection.$anchor.parent.type.name);

        if (attrs.listType === listType) {
          // Turn off
          return commands.updateAttributes(selection.$anchor.parent.type.name, {
            listType: 'none',
            listPrefix: '',
          });
        }

        // Turn on
        return commands.updateAttributes(selection.$anchor.parent.type.name, {
          listType,
          listPrefix,
        });
      },
    };
  },

  addInputRules() {
    return [
      // Bullet list
      textblockTypeInputRule({
        find: /^\s*([-*+])\s$/,
        type: this.editor.schema.nodes.paragraph,
        getAttributes: () => ({
          listType: 'bullet',
          listPrefix: '•',
        }),
      }),
      // Number list
      textblockTypeInputRule({
        find: /^([A-Za-z]|\d+|(?:(?:\d+\.)*\d+))[.)]\s$/,
        type: this.editor.schema.nodes.paragraph,
        getAttributes: match => {
          let prefix = `${match[1]}.`;
          return {
            listType: 'decimal',
            listPrefix: prefix,
            indent: 0,
          };
        }
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state, view, commands } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const parent = $from.parent;
        const attrs = parent.attrs;

        if (attrs.listType && attrs.listType !== 'none') {
          if (parent.textContent.trim() === '') {
            // Empty list item, demote to paragraph
            return commands.updateAttributes(parent.type.name, {
              listType: 'none',
              listPrefix: '',
            });
          } else {
            // Split block and increment number
            let nextPrefix = attrs.listPrefix;
            if (attrs.listType === 'decimal') {
              const numMatch = attrs.listPrefix.match(/^(.*?)(\d+)\.?$/);
              const alphaMatch = attrs.listPrefix.match(/^([a-zA-Z])\.?$/);
              
              if (numMatch) {
                nextPrefix = `${numMatch[1]}${parseInt(numMatch[2], 10) + 1}.`;
              } else if (alphaMatch) {
                const char = alphaMatch[1];
                const nextChar = String.fromCharCode(char.charCodeAt(0) + 1);
                nextPrefix = `${nextChar}.`;
              }
            }
            
            // Execute a split transaction to ensure new attributes
            const tr = state.tr.split($from.pos, 1, [{
              type: parent.type,
              attrs: {
                ...attrs,
                listPrefix: nextPrefix,
              }
            }]);
            view.dispatch(tr);
            return true;
          }
        }

        return false;
      },
      Backspace: () => {
        const { state, commands } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const parent = $from.parent;
        const attrs = parent.attrs;

        if (attrs.listType && attrs.listType !== 'none' && $from.parentOffset === 0) {
          // Demote to normal paragraph, but jump to Text Start Position (indent + 1)
          return commands.updateAttributes(parent.type.name, {
            listType: 'none',
            listPrefix: '',
            indent: (attrs.indent || 0) + 1,
          });
        }
        return false;
      },
    };
  },
});
