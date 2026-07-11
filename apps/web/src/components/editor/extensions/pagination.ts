import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const PaginationPluginKey = new PluginKey('pagination');

export const Pagination = Extension.create({
  name: 'pagination',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PaginationPluginKey,
        state: {
          init() {
            return { spacers: {}, layout: { top: 96, bottom: 96 } };
          },
          apply(tr, value) {
            const newLayout = tr.getMeta('layoutUpdate');
            if (newLayout) {
              value = { ...value, layout: newLayout };
            }
            const meta = tr.getMeta(PaginationPluginKey);
            if (meta) {
              return { ...value, spacers: meta.spacers };
            }
            if (tr.docChanged && value.spacers) {
              // Map spacer positions so they don't disappear during typing
              const newSpacers: Record<number, number> = {};
              const oldSpacers = value.spacers as Record<string, number>;
              Object.keys(oldSpacers).forEach(posStr => {
                const pos = parseInt(posStr, 10);
                const newPos = tr.mapping.map(pos);
                newSpacers[newPos] = oldSpacers[posStr];
              });
              return { ...value, spacers: newSpacers };
            }
            return value;
          }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state) as { spacers: Record<number, number> };
            const spacers = pluginState?.spacers || {};
            const decos: Decoration[] = [];
            
            Object.keys(spacers).forEach(posStr => {
              const pos = parseInt(posStr, 10);
              const height = spacers[pos];
              
              const spacer = document.createElement('div');
              spacer.className = 'page-break-spacer';
              spacer.style.height = `${height}px`;
              spacer.style.width = '100%';
              spacer.style.display = 'block';
              spacer.style.pointerEvents = 'none';
              
              decos.push(Decoration.widget(pos, spacer, { side: -1 }));
            });
            
            return DecorationSet.create(state.doc, decos);
          }
        },
        view: () => ({
          update: (view) => {
            // Capture scroll position before modifying DOM to prevent jumping
            const scrollContainer = view.dom.closest('.overflow-y-auto') || document.documentElement;
            const scrollTop = scrollContainer.scrollTop;
            const scrollLeft = scrollContainer.scrollLeft;
            
            // Hide spacers to measure natural layout
            const spacerEls = view.dom.querySelectorAll('.page-break-spacer');
            spacerEls.forEach((el: any) => {
              el.style.display = 'none';
              if (el.parentElement?.classList.contains('ProseMirror-widget')) {
                el.parentElement.style.display = 'none';
              }
            });
            
            // Force browser reflow to get true natural positions
            void view.dom.offsetHeight;
            
            const pluginState = PaginationPluginKey.getState(view.state) as any;
            const topMargin = pluginState?.layout?.top || 96;
            const bottomMargin = pluginState?.layout?.bottom || 96;
            
            const PAGE_HEIGHT = 1123;
            const PAGE_GAP = 40;
            const PRINTABLE_HEIGHT = PAGE_HEIGHT - topMargin - bottomMargin;
            const UNPRINTABLE_GAP = bottomMargin + PAGE_GAP + topMargin;
            const STEP = PAGE_HEIGHT + PAGE_GAP;
            
            let currentPush = 0;
            const newSpacers: Record<number, number> = {};
            
            let pos = 0;
            view.state.doc.forEach((node, offset, index) => {
              const domNode = view.nodeDOM(pos) as HTMLElement;
              if (domNode && domNode.nodeType === 1) {
                const rect = domNode.getBoundingClientRect();
                const editorRect = view.dom.getBoundingClientRect();
                
                const naturalTop = Math.round(rect.top - editorRect.top);
                const naturalBottom = Math.round(rect.bottom - editorRect.top);
                
                const simulatedTop = naturalTop + currentPush;
                const simulatedBottom = naturalBottom + currentPush;
                
                const pageIndex = Math.floor(simulatedTop / STEP);
                const pagePrintableEnd = pageIndex * STEP + PRINTABLE_HEIGHT;
                
                if (simulatedBottom > pagePrintableEnd) {
                  // Keep lines together for headings, images, and tables, or if the top is already too close to the end
                  if (
                    node.type.name === 'heading' || 
                    node.type.name === 'imagePlaceholder' || 
                    node.type.name === 'table' ||
                    simulatedTop >= pagePrintableEnd - 24
                  ) {
                    const nextPageStart = (pageIndex + 1) * STEP;
                    const pushAmount = Math.round(nextPageStart - simulatedTop);
                    currentPush += pushAmount;
                    newSpacers[pos] = pushAmount;
                  } else if (node.type.name === 'orderedList' || node.type.name === 'bulletList' || node.type.name === 'taskList') {
                    // Line-level pagination (per item) for lists
                    let foundSplit = false;
                    
                    node.forEach((itemNode, offset) => {
                      if (foundSplit) return;
                      
                      const itemPos = pos + offset + 1;
                      const domNode = view.nodeDOM(itemPos) as HTMLElement;
                      if (domNode && domNode.nodeType === 1) {
                        const rect = domNode.getBoundingClientRect();
                        const editorRect = view.dom.getBoundingClientRect();
                        const itemTop = Math.round(rect.top - editorRect.top);
                        const itemBottom = Math.round(rect.bottom - editorRect.top);
                        
                        if (itemBottom + currentPush > pagePrintableEnd) {
                          // Push this list item to the next page
                          if (itemTop + currentPush > pageIndex * STEP + 40) {
                            const nextPageStart = (pageIndex + 1) * STEP;
                            const pushAmount = Math.round(nextPageStart - (itemTop + currentPush));
                            currentPush += pushAmount;
                            newSpacers[itemPos] = pushAmount;
                            foundSplit = true;
                          }
                        }
                      }
                    });
                    
                    if (!foundSplit) {
                      // Fallback if no item was cleanly found, push the whole list
                      const nextPageStart = (pageIndex + 1) * STEP;
                      const pushAmount = Math.round(nextPageStart - simulatedTop);
                      currentPush += pushAmount;
                      newSpacers[pos] = pushAmount;
                    }
                  } else {
                    // Line-level pagination for paragraphs
                    let overflowPos = pos;
                    const nextPageStart = (pageIndex + 1) * STEP;
                    let foundSplit = false;
                    
                    try {
                      // Gunakan binary search untuk menemukan karakter secara efisien (mengurangi ribuan loop menjadi <10)
                      let low = 1;
                      let high = node.nodeSize - 2;
                      let charNaturalTop = 0;

                      while (low <= high) {
                        const mid = Math.floor((low + high) / 2);
                        const coords = view.coordsAtPos(pos + mid);
                        const cTop = Math.round(coords.top - editorRect.top);
                        
                        if (cTop + currentPush > pagePrintableEnd) {
                          overflowPos = pos + mid;
                          charNaturalTop = cTop;
                          foundSplit = true;
                          high = mid - 1; // Cari karakter yang lebih awal di baris yang sama
                        } else {
                          low = mid + 1; // Cari di baris/teks selanjutnya
                        }
                      }
                      
                      if (foundSplit) {
                        const pushAmount = Math.round(nextPageStart - (charNaturalTop + currentPush));
                        currentPush += pushAmount;
                        newSpacers[overflowPos] = pushAmount;
                      }
                    } catch (e) {
                      // Silently fallback if coordsAtPos fails for some positions
                    }
                    
                    // Fallback if we couldn't find a split point
                    if (!foundSplit) {
                      const pushAmount = Math.round(nextPageStart - simulatedTop);
                      currentPush += pushAmount;
                      newSpacers[pos] = pushAmount;
                    }
                  }
                }
              }
              pos += node.nodeSize;
            });
            
            // Restore spacers
            spacerEls.forEach((el: any) => {
              el.style.display = 'block';
              if (el.parentElement?.classList.contains('ProseMirror-widget')) {
                el.parentElement.style.display = '';
              }
            });
            
            // Restore scroll position to prevent jumping
            scrollContainer.scrollTop = scrollTop;
            scrollContainer.scrollLeft = scrollLeft;
            
            // Compare newSpacers with current state to prevent infinite loops
            const currentState = pluginState?.spacers || {};
            let isSame = true;
            
            const newKeys = Object.keys(newSpacers);
            const currentKeys = Object.keys(currentState);
            
            if (newKeys.length !== currentKeys.length) {
              isSame = false;
            } else {
              for (const key of newKeys) {
                const k = parseInt(key, 10);
                if (currentState[k] === undefined || Math.abs(newSpacers[k] - currentState[k]) > 5) {
                  isSame = false;
                  break;
                }
              }
            }
            
            if (!isSame) {
              setTimeout(() => {
                 const tr = view.state.tr.setMeta(PaginationPluginKey, { spacers: newSpacers });
                 view.dispatch(tr);
              }, 0);
            }
          }
        })
      })
    ];
  }
});
