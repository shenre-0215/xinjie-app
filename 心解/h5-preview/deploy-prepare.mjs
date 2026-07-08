import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, 'dist');

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${path.basename(src)}`);
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

copyFile(path.resolve(__dirname, 'manifest.json'), path.resolve(distDir, 'manifest.json'));
copyDir(path.resolve(__dirname, 'icons'), path.resolve(distDir, 'icons'));

const indexHtml = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf-8');
const jsMatch = indexHtml.match(/<script type="module"[^>]*src="([^"]+)"/);
const cssMatch = indexHtml.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/);

let appHtml = fs.readFileSync(path.resolve(__dirname, 'app.html'), 'utf-8');

const BASE_PATH = '/xinjie-app/';

appHtml = appHtml.replace(/href="\/manifest\.json"/, `href="${BASE_PATH}manifest.json"`);
appHtml = appHtml.replace(/href="\/icons\//g, `href="${BASE_PATH}icons/`);

if (jsMatch && jsMatch[1]) {
  let jsPath = jsMatch[1];
  if (jsPath.startsWith('/')) jsPath = jsPath.slice(1);
  if (jsPath.startsWith('xinjie-app/')) jsPath = jsPath.replace('xinjie-app/', '');
  appHtml = appHtml.replace(/<script type="module" src="[^"]+"><\/script>/, `<script type="module" src="${BASE_PATH}${jsPath}"></script>`);
  console.log(`Found JS entry: ${BASE_PATH}${jsPath}`);
}

if (cssMatch && cssMatch[1]) {
  let cssPath = cssMatch[1];
  if (cssPath.startsWith('/')) cssPath = cssPath.slice(1);
  if (cssPath.startsWith('xinjie-app/')) cssPath = cssPath.replace('xinjie-app/', '');
  appHtml = appHtml.replace('</head>', `<link rel="stylesheet" href="${BASE_PATH}${cssPath}">\n</head>`);
  console.log(`Found CSS entry: ${BASE_PATH}${cssPath}`);
}

fs.writeFileSync(path.resolve(distDir, 'app.html'), appHtml);
console.log('Generated app.html with correct asset paths');

copyFile(path.resolve(__dirname, 'uni-mock.js'), path.resolve(distDir, 'uni-mock.js'));

console.log('Deployment preparation completed!');