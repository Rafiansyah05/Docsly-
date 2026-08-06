const HTMLtoDOCX = require('html-to-docx');
const cheerio = require('cheerio');
const fs = require('fs');

async function check() {
  const html = `
    <ul>
      <li>First bullet</li>
      <li>Second bullet</li>
    </ul>
    <ol>
      <li>First number</li>
      <li>Second number</li>
    </ol>
  `;
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body>${html}</body>
    </html>
  `;
  
  const buffer = await HTMLtoDOCX(fullHtml, null, { title: 'Test' });
  fs.writeFileSync('test4.docx', buffer);
}
check().catch(console.error);
