const fs = require('fs');
const path = require('path');

const addRuntime = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addRuntime(fullPath);
    } else if (file === 'route.ts' || file === 'route.js' || file === 'page.tsx' || file === 'page.js') {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes("export const runtime = 'edge'")) {
        // preserve 'use client'; if it exists at the top
        if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
          const lines = content.split('\n');
          const useClient = lines.shift();
          content = useClient + "\nexport const runtime = 'edge';\n" + lines.join('\n');
        } else {
          content = "export const runtime = 'edge';\n" + content;
        }
        fs.writeFileSync(fullPath, content);
        console.log('Added to', fullPath);
      }
    }
  }
};

addRuntime(path.join(__dirname, 'src/app'));
