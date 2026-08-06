const HTMLtoDOCX = require('html-to-docx');
const cheerio = require('cheerio');
const fs = require('fs');

async function check() {
  const html = '<p data-list-type="bullet" data-list-prefix="• ">First bullet</p><p data-list-type="bullet" data-list-prefix="• ">Second bullet</p><p></p><p data-list-type="ordered" data-list-prefix="1. ">First num</p><p data-list-type="ordered" data-list-prefix="2. ">Second num</p>';
  const $ = cheerio.load(html);

  // Group consecutive list items
  const children = $('body').children().toArray();
  let currentList = null;
  let currentListType = null;

  for (const el of children) {
    const listType = $(el).attr('data-list-type');
    
    if (listType === 'bullet' || listType === 'ordered') {
      const isOrdered = listType === 'ordered';
      const listTag = isOrdered ? '<ol></ol>' : '<ul></ul>';
      
      if (currentListType !== listType) {
        currentList = $(listTag);
        $(el).before(currentList);
        currentListType = listType;
      }
      
      const li = $('<li></li>').html($(el).html());
      currentList.append(li);
      $(el).remove();
    } else {
      currentList = null;
      currentListType = null;
    }
  }

  $('p').each((_, el) => {
    if ($(el).text().trim() === '' && $(el).find('img').length === 0 && $(el).find('br').length === 0) {
      $(el).html('<br>');
    }
  });

  const processedHtml = $('body').html() || html;
  console.log("Processed HTML:\n", processedHtml);
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body>${processedHtml}</body>
    </html>
  `;
  
  const buffer = await HTMLtoDOCX(fullHtml, null, { title: 'Test' });
  fs.writeFileSync('test5.docx', buffer);
}
check().catch(console.error);
