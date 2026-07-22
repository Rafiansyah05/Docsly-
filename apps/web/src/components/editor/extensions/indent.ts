import { Extension } from '@tiptap/core';

export interface IndentOptions {
  types: string[];
  indentUnit: string;
  minIndent: number;
  maxIndent: number;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType;
      outdent: () => ReturnType;
      indentFirstLine: () => ReturnType;
      outdentFirstLine: () => ReturnType;
    };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      indentUnit: '2rem',
      minIndent: 0,
      maxIndent: 8,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: element => {
              const indentStr = element.getAttribute('data-indent');
              return indentStr ? parseInt(indentStr, 10) : 0;
            },
            renderHTML: attributes => {
              if (attributes.indent === 0 && !attributes.firstLineIndent && !attributes.hangingIndent) {
                return {};
              }
              const styles = [];
              if (attributes.indent > 0) {
                const safeIndent = Math.min(attributes.indent, this.options.maxIndent);
                styles.push(`margin-left: calc(${safeIndent} * ${this.options.indentUnit})`);
              }
              if (attributes.firstLineIndent > 0) {
                styles.push(`text-indent: calc(${attributes.firstLineIndent} * 1.27cm)`);
              }
              if (attributes.hangingIndent) {
                styles.push('padding-left: 1.27cm');
                styles.push('text-indent: -1.27cm');
              }
              return {
                'data-indent': attributes.indent?.toString() || '0',
                'data-first-line-indent': attributes.firstLineIndent?.toString() || '0',
                'data-hanging-indent': attributes.hangingIndent ? 'true' : undefined,
                style: styles.join('; '),
              };
            },
          },
          firstLineIndent: {
            default: 0,
            parseHTML: element => {
              const val = element.getAttribute('data-first-line-indent');
              return val ? parseInt(val, 10) : 0;
            },
            renderHTML: attributes => {
              // The style is already rendered in the indent attribute hook to combine styles, 
              // but we need this attribute definition for tiptap to track it.
              return {};
            }
          },
          hangingIndent: {
            default: false,
            parseHTML: element => element.hasAttribute('data-hanging-indent'),
            renderHTML: () => ({})
          }
        },
      },
    ];
  },

  addCommands() {
    return {
      indent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent < this.options.maxIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent + 1 });
              applied = true;
            }
          }
        });
        if (applied && dispatch) dispatch(tr);
        return applied;
      },
      outdent: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const currentIndent = node.attrs.indent || 0;
            if (currentIndent > this.options.minIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent - 1 });
              applied = true;
            }
          }
        });
        if (applied && dispatch) dispatch(tr);
        return applied;
      },
      indentFirstLine: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const current = node.attrs.firstLineIndent || 0;
            if (current < this.options.maxIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, firstLineIndent: current + 1 });
              applied = true;
            }
          }
        });
        if (applied && dispatch) dispatch(tr);
        return applied;
      },
      outdentFirstLine: () => ({ tr, state, dispatch }) => {
        const { selection } = state;
        let applied = false;
        tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            const current = node.attrs.firstLineIndent || 0;
            if (current > this.options.minIndent) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, firstLineIndent: current - 1 });
              applied = true;
            }
          }
        });
        if (applied && dispatch) dispatch(tr);
        return applied;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {


        const { selection } = this.editor.state;
        const { $from, empty } = selection;

        // If cursor is at the beginning of the block (parentOffset === 0)
        if (empty && $from.parentOffset === 0) {
          return this.editor.commands.indentFirstLine();
        }

        // If not at the beginning, prevent default tab behavior (do not insert spaces/tabs)
        // per user requirement "Jangan membuat indent" if at the middle.
        return true; 
      },
      'Shift-Tab': () => {


        const { selection } = this.editor.state;
        const { $from, empty } = selection;

        if (empty && $from.parentOffset === 0) {
          return this.editor.commands.outdentFirstLine();
        }

        return true;
      },
    };
  },
});
