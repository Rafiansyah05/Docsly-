const fs = require('fs');

async function check() {
  const html = '<p data-list-type="bullet" data-list-prefix="• ">First line</p><p></p><p>Second line</p>';
  try {
    const res = await fetch('http://localhost:3001/api/export/docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Test API', html })
    });
    
    if (!res.ok) {
      console.log('API Error:', res.status, await res.text());
      return;
    }
    
    const buffer = await res.arrayBuffer();
    fs.writeFileSync('api-test.docx', Buffer.from(buffer));
    console.log('Downloaded API DOCX, size:', buffer.byteLength);
  } catch (err) {
    console.error(err);
  }
}
check();
