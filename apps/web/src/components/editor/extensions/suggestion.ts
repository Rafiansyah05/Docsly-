import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    suggestion: {
      applyAiOperations: (operations: any[]) => ReturnType;
      acceptSuggestion: (pos: number) => ReturnType;
      rejectSuggestion: (pos: number) => ReturnType;
    };
  }
}

export const Suggestion = Extension.create({
  name: 'suggestion',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'listItem'],
        attributes: {
          suggestion: {
            default: null,
            parseHTML: element => element.getAttribute('data-suggestion') || null,
            renderHTML: attributes => {
              if (!attributes.suggestion) {
                return {};
              }
              const classes = [attributes.suggestion === 'insert' ? 'suggestion-insert' : 'suggestion-delete'];
              if (attributes.assumed) {
                classes.push('suggestion-assumed');
              }
              return {
                'data-suggestion': attributes.suggestion,
                ...(attributes.assumed ? { 'data-assumed': 'true' } : {}),
                class: classes.join(' '),
              };
            },
          },
          assumed: {
            default: false,
            parseHTML: element => element.getAttribute('data-assumed') === 'true',
            renderHTML: attributes => {
              if (!attributes.assumed) {
                return {};
              }
              // This is usually handled by the suggestion renderHTML above, but just in case:
              return {
                'data-assumed': 'true',
              };
            }
          }
        },
      },
    ];
  },

  addCommands() {
    return {
      applyAiOperations: (operations: any[]) => ({ tr, state, dispatch }) => {
        // Map block indices to original positions in the document
        const originalPositions = new Map<number, number>();
        const originalNodes = new Map<number, any>();
        let idx = 0;
        state.doc.forEach((node, offset) => {
          originalPositions.set(idx, offset);
          originalNodes.set(idx, node);
          idx++;
        });

        // We will maintain an "append" position for out-of-bounds inserts
        let appendPos = state.doc.content.size;

        operations.forEach(op => {
          let targetPos = originalPositions.has(op.index) ? originalPositions.get(op.index)! : -1;
          let targetNode = originalNodes.has(op.index) ? originalNodes.get(op.index)! : null;

          let mappedPos = targetPos !== -1 ? tr.mapping.map(targetPos) : tr.mapping.map(appendPos);

          if (op.op === 'delete') {
            if (targetNode && targetPos !== -1) {
              tr.setNodeMarkup(mappedPos, undefined, {
                ...targetNode.attrs,
                suggestion: 'delete',
              });
            }
          } else if (op.op === 'insert') {
            const newNode = state.schema.nodeFromJSON({
              ...op.node,
              attrs: {
                ...(op.node.attrs || {}),
                suggestion: 'insert',
              },
            });
            tr.insert(mappedPos, newNode);
            // After inserting at appendPos, the appendPos conceptually shifts forward
            if (targetPos === -1) {
              appendPos += newNode.nodeSize;
            }
          } else if (op.op === 'replace') {
            if (targetNode && targetPos !== -1) {
              tr.setNodeMarkup(mappedPos, undefined, {
                ...targetNode.attrs,
                suggestion: 'delete',
              });
              
              const newNode = state.schema.nodeFromJSON({
                ...op.node,
                attrs: {
                  ...(op.node.attrs || {}),
                  suggestion: 'insert',
                },
              });
              tr.insert(mappedPos + targetNode.nodeSize, newNode);
            }
          } else if (op.op === 'setDocumentSettings' && op.settings) {
            if (op.settings.margin) {
              const currentLayout = tr.doc.attrs.layout || { top: 96, bottom: 96, left: 96, right: 96 };
              tr.setDocAttribute('layout', { ...currentLayout, ...op.settings.margin });
            }
            if (op.settings.pageSettings) {
              const currentPageSettings = tr.doc.attrs.pageSettings || {};
              const defaultSections = [{ startPage: 1, format: 'arabic', startNumber: 1 }];
              tr.setDocAttribute('pageSettings', { 
                ...currentPageSettings, 
                ...op.settings.pageSettings,
                sections: op.settings.pageSettings.sections || currentPageSettings.sections || defaultSections
              });
            }
          }
        });

        if (dispatch) dispatch(tr);
        return true;
      },

      acceptSuggestion: (pos: number) => ({ tr, state, dispatch }) => {
        if (pos < 0 || pos >= tr.doc.content.size) return false;
        const node = tr.doc.nodeAt(pos);
        if (!node) return false;

        const suggestion = node.attrs.suggestion;
        if (suggestion === 'insert') {
          // Remove the suggestion attribute (keep node)
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            suggestion: null,
          });
        } else if (suggestion === 'delete') {
          // Actually delete the node
          tr.delete(pos, pos + node.nodeSize);
        }

        if (dispatch) dispatch(tr);
        return true;
      },

      rejectSuggestion: (pos: number) => ({ tr, state, dispatch }) => {
        if (pos < 0 || pos >= tr.doc.content.size) return false;
        const node = tr.doc.nodeAt(pos);
        if (!node) return false;

        const suggestion = node.attrs.suggestion;
        if (suggestion === 'insert') {
          // Delete the inserted node
          tr.delete(pos, pos + node.nodeSize);
        } else if (suggestion === 'delete') {
          // Remove the suggestion attribute (restore node)
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            suggestion: null,
          });
        }

        if (dispatch) dispatch(tr);
        return true;
      },
    };
  },
});
