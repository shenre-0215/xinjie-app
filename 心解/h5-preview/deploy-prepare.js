const fs = require('fs');
const path = require('path');

const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${path.basename(src)} -> ${dest}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${file}`);
    }
  });
}

copyFile(path.resolve(__dirname, 'app.html'), path.resolve(distDir, 'app.html'));
copyFile(path.resolve(__dirname, 'manifest.json'), path.resolve(distDir, 'manifest.json'));
copyFile(path.resolve(__dirname, 'uni-mock.js'), path.resolve(distDir, 'uni-mock.js'));
copyDir(path.resolve(__dirname, 'icons'), path.resolve(distDir, 'icons'));

console.log('Deployment preparation completed!');