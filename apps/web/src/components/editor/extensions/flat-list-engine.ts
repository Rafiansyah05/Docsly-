import { Extension, InputRule } from '@tiptap/core';
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

function toRoman(num: number): string {
  const roman: Record<string, number> = { m: 1000, cm: 900, d: 500, cd: 400, c: 100, xc: 90, l: 50, xl: 40, x: 10, ix: 9, v: 5, iv: 4, i: 1 };
  let str = '';
  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}

function detectFormat(prefix: string, requireFirst: boolean): 'number' | 'letter' | 'roman' | null {
  if (!prefix) return null;
  const val = prefix.replace('.', '').trim();
  if (/^\d+$/.test(val)) {
    if (requireFirst && val !== '1') return null;
    return 'number';
  }
  if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx)$/i.test(val)) {
    if (requireFirst && val.toLowerCase() !== 'i') return null;
    return 'roman';
  }
  if (/^[a-zA-Z]$/.test(val)) {
    if (requireFirst && val.toLowerCase() !== 'a') return null;
    return 'letter';
  }
  return null;
}

export function syncListNumbers(tr: any, doc: any, pos: number) {
  let resolvedPos = doc.resolve(pos);
  let parentIndex = resolvedPos.index(0);

  let startIndex = parentIndex;
  while (startIndex > 0) {
    const node = doc.child(startIndex - 1);
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      const isNone = !node.attrs.listType || node.attrs.listType === 'none';
      const isZeroIndent = (node.attrs.indent || 0) === 0;
      if (isNone && isZeroIndent) {
        break;
      }
      startIndex--;
    } else {
      break;
    }
  }

  let currentPos = 0;
  for (let i = 0; i < startIndex; i++) {
    currentPos += doc.child(i).nodeSize;
  }

  const counters: Record<number, number> = {};
  const formats: Record<number, 'number' | 'letter' | 'roman'> = {};
  let lastLevel = -1;

  for (let i = startIndex; i < doc.childCount; i++) {
    const node = doc.child(i);
    
    if (node.type.name !== 'paragraph' && node.type.name !== 'heading') {
      break;
    }
    
    const isNone = !node.attrs.listType || node.attrs.listType === 'none';
    const isZeroIndent = (node.attrs.indent || 0) === 0;
    
    if (isNone) {
      if (isZeroIndent) {
        break;
      } else {
        currentPos += node.nodeSize;
        continue;
      }
    }

    const level = Math.min(node.attrs.indent || 0, 8);
    const isBullet = node.attrs.listType === 'bullet';
    
    if (level < lastLevel) {
      for (let l = level + 1; l <= 8; l++) {
        counters[l] = 0;
        delete formats[l];
      }
    }
    
    counters[level] = (counters[level] || 0) + 1;
    lastLevel = level;

    let newPrefix = node.attrs.listPrefix;
    let newType = node.attrs.listType;

    if (isBullet) {
      newPrefix = '•';
    } else {
      newType = 'decimal';
      const c = counters[level];
      
      if (c === 1 && node.attrs.listPrefix) {
        const detected = detectFormat(node.attrs.listPrefix, true);
        if (detected) formats[level] = detected;
      }
      
      if (!formats[level]) {
        if (level === 0) formats[level] = 'number';
        else if (level === 1) formats[level] = 'letter';
        else if (level === 2) formats[level] = 'roman';
        else formats[level] = 'number';
      }

      const format = formats[level];
      if (format === 'number') {
        newPrefix = `${c}.`;
      } else if (format === 'letter') {
        const char = String.fromCharCode(96 + ((c - 1) % 26 + 1));
        newPrefix = `${char}.`;
      } else if (format === 'roman') {
        newPrefix = `${toRoman(c)}.`;
      }
    }

    if (node.attrs.listPrefix !== newPrefix || node.attrs.listType !== newType) {
      tr.setNodeMarkup(currentPos, undefined, {
        ...node.attrs,
        listPrefix: newPrefix,
        listType: newType,
      });
    }

    currentPos += node.nodeSize;
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
      new InputRule({
        find: /^\s*([-*+])\s$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const $start = state.doc.resolve(range.from);
          const block = $start.node();
          const blockPos = $start.before();
          
          let targetIndent = block.attrs.indent || 0;
          if (block.attrs.listType && block.attrs.listType !== 'none') {
            targetIndent += 1;
          } else if (targetIndent === 0) {
            targetIndent = 3; // default for bullet if not in list
          }

          tr.setNodeMarkup(blockPos, undefined, {
            ...block.attrs,
            listType: 'bullet',
            listPrefix: '•',
            indent: targetIndent,
          });
          tr.delete(range.from, range.to);
        },
      }),
      // Number list
      new InputRule({
        find: /^([A-Za-z]|\d+|(?:(?:\d+\.)*\d+))[.)]\s$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const $start = state.doc.resolve(range.from);
          const block = $start.node();
          const blockPos = $start.before();
          
          let prefix = `${match[1]}.`;
          let targetIndent = block.attrs.indent || 0;

          if (block.attrs.listType && block.attrs.listType !== 'none') {
            targetIndent += 1;
          } else if (targetIndent === 0) {
            const val = match[1];
            if (/^\d+$/.test(val)) targetIndent = 0;
            else if (/^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv)$/i.test(val)) targetIndent = 2;
            else if (/^[a-zA-Z]$/.test(val)) targetIndent = 1;
          }

          tr.setNodeMarkup(blockPos, undefined, {
            ...block.attrs,
            listType: 'decimal',
            listPrefix: prefix,
            indent: targetIndent,
          });
          tr.delete(range.from, range.to);
          
          syncListNumbers(tr, tr.doc, blockPos);
        },
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
            const currentIndent = attrs.indent || 0;
            if (currentIndent > 0) {
              const tr = state.tr.setNodeMarkup($from.before(), undefined, {
                ...attrs,
                indent: currentIndent - 1,
              });
              syncListNumbers(tr, tr.doc, $from.pos);
              view.dispatch(tr);
              return true;
            } else {
              const tr = state.tr.setNodeMarkup($from.before(), undefined, {
                ...attrs,
                listType: 'none',
                listPrefix: '',
                indent: 0,
              });
              syncListNumbers(tr, tr.doc, $from.pos);
              view.dispatch(tr);
              return true;
            }
          } else {
            const tr = state.tr.split($from.pos, 1, [{
              type: parent.type,
              attrs: {
                ...attrs,
                listPrefix: '?',
              }
            }]);
            syncListNumbers(tr, tr.doc, $from.pos);
            view.dispatch(tr);
            return true;
          }
        }

        return false;
      },
      Backspace: () => {
        const { state, view, commands } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const parent = $from.parent;
        const attrs = parent.attrs;

        if ($from.parentOffset === 0) {
          const currentIndent = attrs.indent || 0;
          
          if (attrs.listType && attrs.listType !== 'none') {
            // Remove the list format but keep the text visually aligned with the previous list item's text.
            // Since lists have 32px padding, we add 1 to the indent (32px margin) to maintain the same text position.
            const tr = state.tr.setNodeMarkup($from.before(), undefined, {
              ...attrs,
              listType: 'none',
              listPrefix: '',
              indent: currentIndent + 1,
            });
            syncListNumbers(tr, tr.doc, $from.pos);
            view.dispatch(tr);
            return true;
          } else {
            if (currentIndent > 0) {
              const tr = state.tr.setNodeMarkup($from.before(), undefined, {
                ...attrs,
                indent: currentIndent - 1,
              });
              view.dispatch(tr);
              return true;
            }
          }
        }
        return false;
      },
    };
  },
});
