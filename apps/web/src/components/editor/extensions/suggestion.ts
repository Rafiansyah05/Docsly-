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
        // Sort operations descending by index to prevent index shifting issues
        const sortedOps = [...operations].sort((a, b) => b.index - a.index);

        sortedOps.forEach(op => {
          // Find the Prosemirror position for the block at op.index
          let currentIndex = 0;
          let targetPos = -1;
          let targetNode: any = null;

          tr.doc.forEach((node, offset) => {
            if (currentIndex === op.index) {
              targetPos = offset;
              targetNode = node;
            }
            currentIndex++;
          });

          if (targetPos === -1) {
            // If index is out of bounds, default to end of document
            targetPos = tr.doc.content.size;
          }

          if (op.op === 'delete') {
            if (targetNode) {
              // Mark as deleted
              tr.setNodeMarkup(targetPos, undefined, {
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
            tr.insert(targetPos, newNode);
          } else if (op.op === 'replace') {
            if (targetNode) {
              // Mark current as deleted
              tr.setNodeMarkup(targetPos, undefined, {
                ...targetNode.attrs,
                suggestion: 'delete',
              });
              
              // Insert new one after it
              const newNode = state.schema.nodeFromJSON({
                ...op.node,
                attrs: {
                  ...(op.node.attrs || {}),
                  suggestion: 'insert',
                },
              });
              tr.insert(targetPos + targetNode.nodeSize, newNode);
            }
          } else if (op.op === 'setDocumentSettings' && op.settings) {
            // Apply Document Level Settings directly
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
