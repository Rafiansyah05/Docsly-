const HTMLtoDOCX = require('html-to-docx');
const cheerio = require('cheerio');
const fs = require('fs');

async function check() {
  const html = '<p data-list-type="bullet" data-list-prefix="• ">First line</p><p></p><p>Second line</p>';
  const $ = cheerio.load(html);

  $('[data-list-type]').each((_, el) => {
    const listType = $(el).attr('data-list-type');
    if (listType && listType !== 'none') {
      const prefix = $(el).attr('data-list-prefix') || '';
      if (prefix) {
        $(el).prepend(prefix + '\u00A0');
      }
    }
  });

  $('p').each((_, el) => {
    if ($(el).text().trim() === '' && $(el).find('img').length === 0 && $(el).find('br').length === 0) {
      $(el).text('\u00A0');
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
  
  console.log('Processed HTML:');
  console.log(processedHtml);
  
  try {
    const buffer = await HTMLtoDOCX(fullHtml, null, {
      title: 'Dokumen',
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
    });
    fs.writeFileSync('test.docx', buffer);
    console.log('DOCX generated successfully, size:', buffer.length);
  } catch (err) {
    console.error('Error in HTMLtoDOCX:', err);
  }
}

check().catch(err => {
  console.error('Error generating DOCX:', err);
});
