const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalLength = content.length;
  content = content.replace(/\/xinjie-app\//g, './');
  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      traverse(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) {
      fixFile(filePath);
    }
  });
}

traverse(distDir);
console.log('Done!');