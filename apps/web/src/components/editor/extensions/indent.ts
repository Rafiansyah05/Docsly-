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
      types: ['paragraph', 'heading', 'blockquote'],
      indentUnit: '32px',
      minIndent: 0,
      maxIndent: 8,
      indentLevels: [0, 1, 2, 3, 4, 5, 6, 7, 8],
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
        const { state, view, commands } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) {
          let applied = false;
          let tr = state.tr;
          tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentIndent = node.attrs.indent || 0;
              if (currentIndent < this.options.maxIndent) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent + 1 });
                applied = true;
              }
            }
          });
          if (applied) {
            // @ts-ignore
            const { syncListNumbers } = require('./flat-list-engine');
            syncListNumbers(tr, tr.doc, selection.from);
            view.dispatch(tr);
            return true;
          }
          return false;
        }

        if (empty && $from.parentOffset === 0) {
          const parent = $from.parent;
          const attrs = parent.attrs;

          if (attrs.listType && attrs.listType !== 'none') {
            const currentIndent = attrs.indent || 0;
            if (currentIndent < this.options.maxIndent) {
              const tr = state.tr.setNodeMarkup($from.before(), undefined, {
                ...attrs,
                indent: currentIndent + 1,
              });
              // @ts-ignore
              const { syncListNumbers } = require('./flat-list-engine');
              syncListNumbers(tr, tr.doc, $from.pos);
              view.dispatch(tr);
              return true;
            }
          }
          return commands.indentFirstLine();
        }

        return true; 
      },
      'Shift-Tab': () => {
        const { state, view, commands } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) {
          let applied = false;
          let tr = state.tr;
          tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentIndent = node.attrs.indent || 0;
              if (currentIndent > 0) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: currentIndent - 1 });
                applied = true;
              }
            }
          });
          if (applied) {
            // @ts-ignore
            const { syncListNumbers } = require('./flat-list-engine');
            syncListNumbers(tr, tr.doc, selection.from);
            view.dispatch(tr);
            return true;
          }
          return false;
        }

        if (empty && $from.parentOffset === 0) {
          const parent = $from.parent;
          const attrs = parent.attrs;

          if (attrs.listType && attrs.listType !== 'none') {
            const currentIndent = attrs.indent || 0;
            if (currentIndent > 0) {
              const tr = state.tr.setNodeMarkup($from.before(), undefined, {
                ...attrs,
                indent: currentIndent - 1,
              });
              // @ts-ignore
              const { syncListNumbers } = require('./flat-list-engine');
              syncListNumbers(tr, tr.doc, $from.pos);
              view.dispatch(tr);
              return true;
            }
          }
          return commands.outdentFirstLine();
        }

        return true;
      },
    };
  },
});
