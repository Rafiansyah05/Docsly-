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
              const newSpacers: Record<string, any> = {};
              const oldSpacers = value.spacers as Record<string, any>;
              Object.keys(oldSpacers).forEach(posStr => {
                if (posStr.startsWith('toc_') || posStr.startsWith('bg_')) {
                  const actualPos = parseInt(posStr.replace('toc_', '').replace('bg_', ''), 10);
                  if (!isNaN(actualPos)) {
                    const newPos = tr.mapping.map(actualPos);
                    const prefix = posStr.startsWith('toc_') ? 'toc_' : 'bg_';
                    newSpacers[`${prefix}${newPos}`] = oldSpacers[posStr];
                  }
                  return;
                }
                const pos = parseInt(posStr, 10);
                if (!isNaN(pos)) {
                  const newPos = tr.mapping.map(pos);
                  newSpacers[newPos] = oldSpacers[posStr];
                }
              });
              return { ...value, spacers: newSpacers };
            }
            return value;
          }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state) as { spacers: Record<string, any> };
            const spacers = pluginState?.spacers || {};
            const decos: Decoration[] = [];
            
            Object.keys(spacers).forEach((posStr) => {
              if (posStr.startsWith('toc_')) return;
              
              if (posStr.startsWith('bg_')) {
                try {
                  const pos = parseInt(posStr.replace('bg_', ''), 10);
                  const bgData = spacers[posStr];
                  if (bgData && bgData.type === 'codeBlockBg') {
                    const bgContainer = document.createElement('div');
                    bgContainer.className = 'code-block-bg-container';
                    
                    const frags = bgData.fragments;
                    frags.forEach((frag: any, idx: number) => {
                      const f = document.createElement('div');
                      f.className = 'code-block-bg-fragment';
                      if (frags.length === 1) {
                        f.classList.add('single-frag');
                      } else if (idx === 0) {
                        f.classList.add('first-frag');
                      } else if (idx === frags.length - 1) {
                        f.classList.add('last-frag');
                      }
                      
                      f.style.top = `${frag.top}px`;
                      if (frag.bottom !== undefined) {
                        f.style.bottom = `${frag.bottom}px`;
                      }
                      if (frag.height !== undefined) {
                        f.style.height = `${frag.height}px`;
                      }
                      bgContainer.appendChild(f);
                    });
                    
                    // Inject at the start of the codeBlock (pos + 1)
                    decos.push(Decoration.widget(pos + 1, bgContainer, { side: -1 }));
                  }
                } catch (e) {
                  console.error('Error generating codeBlock background widget:', e);
                }
                return;
              }
              
              const pos = parseInt(posStr, 10);
              let height = 0;
              if (typeof spacers[posStr] === 'number') {
                height = spacers[posStr];
              } else if (spacers[posStr] && typeof spacers[posStr] === 'object') {
                height = spacers[posStr].height || 0;
              }
              // Cek apakah posisi ini berada di antara Table Row
              let isTableRow = false;
              try {
                const $pos = state.doc.resolve(pos);
                if ($pos.nodeAfter && $pos.nodeAfter.type.name === 'tableRow') {
                  isTableRow = true;
                }
              } catch (e) {}
              
              if (isTableRow) {
                const spacer = document.createElement('tr');
                spacer.className = 'page-break-spacer';
                spacer.style.pointerEvents = 'none';
                spacer.style.backgroundColor = 'transparent';
                
                // Mirror the exact cell structure to prevent table grid destruction
                try {
                  const $pos = state.doc.resolve(pos);
                  if ($pos.nodeAfter && $pos.nodeAfter.type.name === 'tableRow') {
                    $pos.nodeAfter.forEach((cell) => {
                      const td = document.createElement('td');
                      td.colSpan = cell.attrs.colspan || 1;
                      td.style.height = `${height}px`;
                      td.style.padding = '0';
                      td.style.backgroundColor = 'transparent';
                      td.style.border = 'hidden';
                      spacer.appendChild(td);
                    });
                  }
                } catch (e) {}
                
                // Fallback if empty
                if (spacer.childNodes.length === 0) {
                  const td = document.createElement('td');
                  td.style.height = `${height}px`;
                  td.style.padding = '0';
                  td.style.backgroundColor = 'transparent';
                  td.style.border = 'hidden';
                  spacer.appendChild(td);
                }
                
                decos.push(Decoration.widget(pos, spacer, { side: -1 }));
              } else {
                const spacer = document.createElement('div');
                spacer.className = 'page-break-spacer';
                spacer.style.height = `${height}px`;
                spacer.style.width = '100%';
                spacer.style.display = 'block';
                spacer.style.pointerEvents = 'none';
                
                decos.push(Decoration.widget(pos, spacer, { side: -1 }));
              }
            });
            
            return DecorationSet.create(state.doc, decos);
          }
        },
        view: () => {
          let timeoutId: any = null;
          return {
            update: (view) => {
              if (timeoutId) clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                if (view.isDestroyed) return;
                // Freeze view.dom height to prevent browser from clamping scrollTop when spacers are hidden
            const editorDom = view.dom as HTMLElement;
            const originalMinHeight = editorDom.style.minHeight;
            if (editorDom.scrollHeight > editorDom.clientHeight) {
              editorDom.style.minHeight = `${editorDom.scrollHeight}px`;
            }
            
            // Capture exact scroll position of ALL scrollable parents and window
            const scrollParents: { el: HTMLElement | Window, top: number, left: number }[] = [];
            let currentParent: HTMLElement | null = editorDom;
            while (currentParent) {
              scrollParents.push({ el: currentParent, top: currentParent.scrollTop, left: currentParent.scrollLeft });
              currentParent = currentParent.parentElement;
            }
            scrollParents.push({ el: window, top: window.scrollY, left: window.scrollX });
            
            // Hide spacers to measure natural layout
            const spacerEls = view.dom.querySelectorAll('.page-break-spacer');
            spacerEls.forEach((el: any) => {
              el.style.display = 'none';
              if (el.parentElement?.classList.contains('ProseMirror-widget')) {
                el.parentElement.style.display = 'none';
              }
            });
            
            const tocSpaceredLis = view.dom.querySelectorAll('.toc-wrapper li[style*="margin-top"]');
            const originalTocStyles = new Map();
            tocSpaceredLis.forEach((li: any) => {
              originalTocStyles.set(li, li.style.cssText);
              li.style.marginTop = '0';
              li.style.borderTop = 'none';
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
            const newSpacers: Record<string, any> = {};
            
            // Find the last node that actually contains content
            let lastContentPos = -1;
            view.state.doc.forEach((node, offset) => {
              const hasText = node.textContent.trim() !== '';
              const isMedia = node.type.name === 'image' || node.type.name === 'table' || node.type.name === 'horizontalRule' || node.type.name === 'equation' || node.type.name === 'callout' || node.type.name === 'imagePlaceholder' || node.type.name === 'codeBlock' || node.type.name === 'bulletList' || node.type.name === 'orderedList';
              if (hasText || isMedia) {
                lastContentPos = Math.max(lastContentPos, offset);
              }
            });
            
            let pos = 0;
            view.state.doc.forEach((node, offset, index) => {
              // Ignore nodes that are strictly after the last content node (trailing empty nodes)
              if (offset > lastContentPos) {
                pos += node.nodeSize;
                return;
              }
              
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
                  // Keep lines together for headings, images, or if the top is already too close to the end
                  if (
                    node.type.name === 'heading' || 
                    node.type.name === 'imagePlaceholder' || 
                    simulatedTop >= pagePrintableEnd - 24
                  ) {
                    const nextPageStart = (pageIndex + 1) * STEP;
                    const pushAmount = Math.round(nextPageStart - simulatedTop);
                    currentPush += pushAmount;
                    newSpacers[pos] = pushAmount;
                  } else if (node.type.name === 'table') {
                    // Line-level pagination for tables (per row)
                    let foundSplit = false;
                    
                    node.forEach((rowNode, offset, index) => {
                      if (rowNode.type.name !== 'tableRow') return;
                      
                      const rowPos = pos + offset + 1;
                      const domNode = view.nodeDOM(rowPos) as HTMLElement;
                      if (domNode && domNode.nodeType === 1) {
                        const rect = domNode.getBoundingClientRect();
                        const editorRect = view.dom.getBoundingClientRect();
                        const itemTop = Math.round(rect.top - editorRect.top);
                        const itemBottom = Math.round(rect.bottom - editorRect.top);
                        
                        // Calculate dynamically which page this row is CURRENTLY on
                        const currentItemTop = itemTop + currentPush;
                        const currentPageIdx = Math.floor(currentItemTop / STEP);
                        const currentPagePrintableEnd = currentPageIdx * STEP + PRINTABLE_HEIGHT;
                        
                        if (itemBottom + currentPush > currentPagePrintableEnd) {
                          // Push this row to the next page
                          if (currentItemTop > currentPageIdx * STEP + 40) {
                            const nextPageStart = (currentPageIdx + 1) * STEP;
                            const pushAmount = Math.round(nextPageStart - currentItemTop);
                            currentPush += pushAmount;
                            
                            // If this is the VERY FIRST row of the table, push the ENTIRE table instead
                            // Inserting a <tr> spacer before the first row destroys fixed table layouts!
                            if (index === 0) {
                              newSpacers[pos] = pushAmount;
                            } else {
                              newSpacers[rowPos] = pushAmount;
                            }
                            foundSplit = true;
                          }
                        }
                      }
                    });
                    
                    if (!foundSplit && simulatedBottom > pagePrintableEnd && simulatedTop > pageIndex * STEP + 40) {
                      const nextPageStart = (pageIndex + 1) * STEP;
                      const pushAmount = Math.round(nextPageStart - simulatedTop);
                      currentPush += pushAmount;
                      newSpacers[pos] = pushAmount;
                    }
                  } else if (node.type.name === 'orderedList' || node.type.name === 'bulletList' || node.type.name === 'taskList') {
                    // Line-level pagination (per item) for lists
                    let foundSplit = false;
                    
                    node.forEach((itemNode, offset) => {
                      const itemPos = pos + offset + 1;
                      const domNode = view.nodeDOM(itemPos) as HTMLElement;
                      if (domNode && domNode.nodeType === 1) {
                        const rect = domNode.getBoundingClientRect();
                        const editorRect = view.dom.getBoundingClientRect();
                        const itemTop = Math.round(rect.top - editorRect.top);
                        const itemBottom = Math.round(rect.bottom - editorRect.top);
                        
                        const currentItemTop = itemTop + currentPush;
                        const currentPageIdx = Math.floor(currentItemTop / STEP);
                        const currentPagePrintableEnd = currentPageIdx * STEP + PRINTABLE_HEIGHT;
                        
                        if (itemBottom + currentPush > currentPagePrintableEnd) {
                          // Push this list item to the next page
                          if (currentItemTop > currentPageIdx * STEP + 40) {
                            const nextPageStart = (currentPageIdx + 1) * STEP;
                            const pushAmount = Math.round(nextPageStart - currentItemTop);
                            currentPush += pushAmount;
                            newSpacers[itemPos] = pushAmount;
                            foundSplit = true;
                          }
                        }
                      }
                    });
                    
                    if (!foundSplit && simulatedBottom > pagePrintableEnd && simulatedTop > pageIndex * STEP + 40) {
                      // Fallback if no item was cleanly found, push the whole list
                      const nextPageStart = (pageIndex + 1) * STEP;
                      const pushAmount = Math.round(nextPageStart - simulatedTop);
                      currentPush += pushAmount;
                      newSpacers[pos] = pushAmount;
                    }
                  } else if (node.type.name === 'tableOfContents') {
                    // Line-level pagination for TOC items
                    let foundSplit = false;
                    const domNode = view.nodeDOM(pos) as HTMLElement;
                    
                    if (domNode && domNode.nodeType === 1) {
                      const lis = Array.from(domNode.querySelectorAll('li'));
                      const tocSpacers: Record<number, number> = {};
                      
                      lis.forEach((li, idx) => {
                        const rect = li.getBoundingClientRect();
                        const editorRect = view.dom.getBoundingClientRect();
                        const itemTop = Math.round(rect.top - editorRect.top);
                        const itemBottom = Math.round(rect.bottom - editorRect.top);
                        
                        const currentItemTop = itemTop + currentPush;
                        const currentPageIdx = Math.floor(currentItemTop / STEP);
                        const currentPagePrintableEnd = currentPageIdx * STEP + PRINTABLE_HEIGHT;
                        
                        if (itemBottom + currentPush > currentPagePrintableEnd) {
                          if (currentItemTop > currentPageIdx * STEP + 40) {
                            const nextPageStart = (currentPageIdx + 1) * STEP;
                            const pushAmount = Math.round(nextPageStart - currentItemTop);
                            currentPush += pushAmount;
                            tocSpacers[idx] = pushAmount;
                            foundSplit = true;
                          }
                        }
                      });
                      
                      if (Object.keys(tocSpacers).length > 0) {
                        newSpacers[`toc_${pos}`] = tocSpacers;
                      }
                    }
                    
                    if (!foundSplit && simulatedBottom > pagePrintableEnd && simulatedTop > pageIndex * STEP + 40) {
                      const nextPageStart = (pageIndex + 1) * STEP;
                      const pushAmount = Math.round(nextPageStart - simulatedTop);
                      currentPush += pushAmount;
                      newSpacers[pos] = pushAmount;
                    }
                  } else {
                    // Line-level pagination for paragraphs (can span multiple pages)
                    try {
                      const isCodeBlock = node.type.name === 'codeBlock';
                      const padding = isCodeBlock ? 16 : 0;
                      let searchStart = 1;
                      const maxLen = node.nodeSize - 2;
                      let localPush = 0;
                      let anySplit = false;
                      
                      const fragments: { top: number, bottom?: number, height?: number }[] = [];
                      let currentFragTop = 0;
                      
                      while (searchStart <= maxLen) {
                        let low = searchStart;
                        let high = maxLen;
                        let overflowPos = -1;
                        let charNaturalTop = 0;
                        // Calculate target page for this chunk
                        let currentTargetPageIdx = 0;
                        try {
                          const startCoords = view.coordsAtPos(pos + searchStart);
                          const startTop = Math.round(startCoords.top - editorRect.top);
                          currentTargetPageIdx = Math.floor((startTop + currentPush + localPush) / STEP);
                        } catch (e) {
                          currentTargetPageIdx = Math.floor((simulatedTop + localPush) / STEP);
                        }
                        const cPrintableEnd = currentTargetPageIdx * STEP + PRINTABLE_HEIGHT;
                        
                        // Find the first character that overflows its CURRENT page
                        while (low <= high) {
                          const mid = Math.floor((low + high) / 2);
                          const coords = view.coordsAtPos(pos + mid);
                          const cTop = Math.round(coords.top - editorRect.top);
                          const cBottom = Math.round(coords.bottom - editorRect.top);
                          
                          if (cBottom + currentPush + localPush > cPrintableEnd - padding) {
                            overflowPos = pos + mid;
                            charNaturalTop = cTop;
                            high = mid - 1; // Look for an earlier character in the same line
                          } else {
                            low = mid + 1;
                          }
                        }
                        
                        if (overflowPos !== -1) {
                           const nextPageStart = (currentTargetPageIdx + 1) * STEP;
                           const pushAmount = Math.round(nextPageStart + padding - (charNaturalTop + currentPush + localPush));
                           
                           if (isCodeBlock) {
                             const splitY = charNaturalTop - naturalTop + localPush;
                             fragments.push({ top: currentFragTop, height: splitY + padding - currentFragTop });
                             currentFragTop = splitY + pushAmount - padding;
                           }
                           
                           localPush += pushAmount;
                           newSpacers[overflowPos] = pushAmount;
                           anySplit = true;
                           
                           // Continue searching the rest of the paragraph starting from this character
                           searchStart = overflowPos - pos;
                        } else {
                           break; // No more overflows in this node
                        }
                      }
                      
                      if (anySplit) {
                        currentPush += localPush;
                      } else if (!anySplit && simulatedBottom > pagePrintableEnd && simulatedTop > pageIndex * STEP + 40) {
                        // Fallback if we couldn't find a split point
                        const nextPageStart = (pageIndex + 1) * STEP;
                        const pushAmount = Math.round(nextPageStart - simulatedTop);
                        currentPush += pushAmount;
                        newSpacers[pos] = pushAmount;
                      }
                      
                      if (isCodeBlock) {
                        fragments.push({ top: currentFragTop, bottom: 0 });
                        newSpacers[`bg_${pos}`] = { type: 'codeBlockBg', fragments };
                      }
                    } catch (e) {
                      // Silently fallback if coordsAtPos fails for some positions
                    }
                  }
                }
                
                // Ensure ALL codeBlocks get a background registered, even if they don't split
                if (node.type.name === 'codeBlock' && !newSpacers[`bg_${pos}`]) {
                  newSpacers[`bg_${pos}`] = { type: 'codeBlockBg', fragments: [{ top: 0, bottom: 0 }] };
                }
              }
              pos += node.nodeSize;
            });
            
            // Restore spacers
            spacerEls.forEach((el: any) => {
              el.style.display = '';
              if (el.parentElement?.classList.contains('ProseMirror-widget')) {
                el.parentElement.style.display = '';
              }
            });
            
            // Restore original minHeight so it can shrink normally if content is deleted
            editorDom.style.minHeight = originalMinHeight;
            
            tocSpaceredLis.forEach((li: any) => {
              if (originalTocStyles.has(li)) {
                li.style.cssText = originalTocStyles.get(li);
              }
            });
            
            // Unfreeze editor height
            editorDom.style.minHeight = originalMinHeight;
            
            // Manually restore scroll position so it doesn't jump to the cursor
            scrollParents.forEach(({ el, top, left }) => {
              if (el === window) {
                window.scrollTo(left, top);
              } else {
                (el as HTMLElement).scrollTop = top;
                (el as HTMLElement).scrollLeft = left;
              }
            });
            
            // Compare newSpacers with current state to prevent infinite loops
            const currentState = pluginState?.spacers || {};
            let isSame = true;
            
            const newKeys = Object.keys(newSpacers);
            const currentKeys = Object.keys(currentState);
            
            if (newKeys.length !== currentKeys.length) {
              isSame = false;
            } else {
              for (const key of newKeys) {
                if (key.startsWith('toc_')) {
                   const newVal = JSON.stringify(newSpacers[key]);
                   const oldVal = JSON.stringify(currentState[key]);
                   if (newVal !== oldVal) {
                     isSame = false;
                     break;
                   }
                } else {
                  if (currentState[key] === undefined || Math.abs(newSpacers[key] - currentState[key]) > 5) {
                    isSame = false;
                    break;
                  }
                }
              }
            }
            
            if (!isSame) {
              const tr = view.state.tr.setMeta(PaginationPluginKey, { spacers: newSpacers });
              view.dispatch(tr);
            }
          }, 400);
            },
            destroy: () => {
              if (timeoutId) clearTimeout(timeoutId);
            }
          };
        }
      })
    ];
  }
});
