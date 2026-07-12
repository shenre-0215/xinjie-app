/**
 * Fix resource paths for GitHub Pages deployment.
 * Replaces absolute paths (/xinjie-app/...) with relative (./...)
 *
 * Usage: node scripts/fix-paths.js [buildDir]
 */
const fs = require('fs')
const path = require('path')

const buildDir = process.argv[2] || path.join(__dirname, '..', '心解', 'dist')

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const original = content.length
  // Replace /xinjie-app/ base with relative ./
  content = content.replace(/\/xinjie-app\//g, './')
  content = content.replace(/href="\//g, 'href="./')
  content = content.replace(/src="\//g, 'src="./')
  if (content.length !== original) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log('Fixed:', path.relative(buildDir, filePath))
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) traverse(filePath)
    else if (file.endsWith('.html') || file.endsWith('.js') || file.endsWith('.css')) fixFile(filePath)
  }
}

if (!fs.existsSync(buildDir)) {
  console.error('Build dir not found:', buildDir)
  process.exit(0)
}

traverse(buildDir)
console.log('✅ Path fix done!')
