const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/editor/tiptap-editor.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = `  const executePageDelete = (nodes: { from: number; to: number }[]) => {
    if (!editor) return;
    let tr = editor.state.tr;
    let deleted = false;

    // 1. Delete the specific nodes on the page
    nodes
      .sort((a, b) => b.from - a.from)
      .forEach(({ from, to }) => {
        tr = tr.delete(from, to);
        deleted = true;
      });

    // 2. Aggressively trim any trailing empty paragraphs in the entire document
    // This guarantees that ghost pages caused by trailing spaces are destroyed
    const currentDoc = tr.doc;
    for (let i = currentDoc.childCount - 1; i >= 0; i--) {
      const node = currentDoc.child(i);
      if (node.type.name === 'paragraph' && node.textContent.trim() === '') {
        const from = tr.mapping.map(currentDoc.resolve(0).posAtIndex(i));
        const to = from + node.nodeSize;
        tr = tr.delete(from, to);
        deleted = true;
      } else {
        break; // Stop at the first real content
      }
    }

    if (deleted) {
      editor.view.dispatch(tr);
    }
    setPendingDeleteNodes(null);
    setShowDeleteModal(false);
  };`;

const replacement = `  const executePageDelete = (nodes: { from: number; to: number }[]) => {
    if (!editor) return;
    let tr = editor.state.tr;
    let deleted = false;

    // 1. Delete the specific nodes on the page
    nodes
      .sort((a, b) => b.from - a.from)
      .forEach(({ from, to }) => {
        tr = tr.delete(from, to);
        deleted = true;
      });

    // 2. Aggressively trim any trailing empty paragraphs in the entire document
    while (tr.doc.childCount > 1) {
      const lastChild = tr.doc.child(tr.doc.childCount - 1);
      if (lastChild.type.name === 'paragraph' && lastChild.textContent.trim() === '') {
        const from = tr.doc.content.size - lastChild.nodeSize;
        const to = from + lastChild.nodeSize;
        tr = tr.delete(from, to);
        deleted = true;
      } else {
        break;
      }
    }

    if (deleted) {
      editor.view.dispatch(tr);
    }
    setPendingDeleteNodes(null);
    setShowDeleteModal(false);
  };`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('Fixed executePageDelete');
