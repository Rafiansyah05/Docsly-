import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { TableOfContents } from './src/components/editor/extensions/toc';

const editor = new Editor({
  extensions: [Document, Paragraph, Text, TableOfContents],
  content: {
    type: 'doc',
    content: [
      {
        type: 'tableOfContents',
        attrs: {
          headings: [
            { level: 1, text: 'Hello', pageNumStr: '1' }
          ]
        }
      }
    ]
  }
});
console.log(editor.getHTML());
