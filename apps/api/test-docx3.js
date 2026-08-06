const HTMLtoDOCX = require('html-to-docx');
const cheerio = require('cheerio');
const fs = require('fs');

async function check() {
  const html = '<p data-list-type="bullet" data-list-prefix="• ">First line</p><p></p><p>Second line</p>';
  const $ = cheerio.load(html);

  $('[data-list-type]').each((_, el) => {
    const listType = $(el).attr('data-list-type');
    if (listType && listType !== 'none') {
      let prefix = $(el).attr('data-list-prefix') || '';
      if (prefix) {
        // Escape special characters to HTML entities to avoid encoding corruption in DOCX XML
        prefix = prefix.replace(/•/g, '&#8226;');
        $(el).prepend('<span>' + prefix + ' </span>');
      }
    }
  });

  $('p').each((_, el) => {
    if ($(el).text().trim() === '' && $(el).find('img').length === 0 && $(el).find('br').length === 0) {
      $(el).html('<br>');
    }
  });

  const processedHtml = $('body').html() || html;
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Dokumen</title>
    </head>
    <body>
      ${processedHtml}
    </body>
    </html>
  `;
  
  const buffer = await HTMLtoDOCX(fullHtml, null, { title: 'Test' });
  fs.writeFileSync('test3.docx', buffer);
}
check().catch(console.error);
