const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

// Function to recursively find all .tsx and .ts files
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const action = process.argv[2]; // 'remove' or 'add'
const files = getAllFiles(srcDir);

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  if (action === 'remove') {
    // Replace active export with commented export
    if (content.match(/^export const runtime = 'edge';/m)) {
      newContent = content.replace(/^export const runtime = 'edge';/gm, "// export const runtime = 'edge';");
    }
  } else if (action === 'add') {
    // Replace commented export with active export
    if (content.match(/^\/\/ export const runtime = 'edge';/m)) {
      newContent = content.replace(/^\/\/ export const runtime = 'edge';/gm, "export const runtime = 'edge';");
    }
  }

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    modifiedCount++;
  }
});

console.log(`[Docsly Edge Toggler] Successfully ${action === 'remove' ? 'disabled' : 'enabled'} edge runtime in ${modifiedCount} files.`);
