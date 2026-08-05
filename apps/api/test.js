
const HTMLtoDOCX = require('html-to-docx');
const fs = require('fs');
const cheerio = require('cheerio');

async function test() {
  let html = '<p data-list-type=\
bullet\ data-list-prefix=\•
\>Test bullet</p><p></p><p>Another line</p>';
  const $ = cheerio.load(html);
  
  \[data-list-type].each((_, el) => {
    const listType = \.attr('data-list-type');
    if (listType && listType !== 'none') {
      const prefix = \.attr('data-list-prefix') || '';
      if (prefix) {
        \.prepend('<span>' + prefix + '&nbsp;</span>');
      }
    }
  });

  \p.each((_, el) => {
    if (\.text().trim() === '' && \.find('img').length === 0) {
      \.html('<br>');
    }
  });

  const processedHtml = \body.html() || html;

  const fullHtml = \
    <!DOCTYPE html>
    <html>
    <head><meta charset=\utf-8\><title>Test</title></head>
    <body>\</body>
    </html>
  \;
  
  const buffer = await HTMLtoDOCX(fullHtml, null, {});
  fs.writeFileSync('test.docx', buffer);
  console.log('done');
}
test().catch(console.error);

