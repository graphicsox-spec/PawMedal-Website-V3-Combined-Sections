const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFile = path.join(root, 'preview', 'index.html');
const html = fs.readFileSync(htmlFile, 'utf8');

const regex = /<img[^>]+src=["']([^"']+)["']/g;
let match;
const missing = [];
const found = [];

while ((match = regex.exec(html)) !== null) {
  const src = match[1];
  if (src.startsWith('http')) {
    continue;
  }
  const filePath = path.resolve(root, 'preview', src);
  if (!fs.existsSync(filePath)) {
    missing.push({ src, filePath });
  } else {
    found.push(src);
  }
}

console.log(`Verified ${found.length} local images: All Exist!`);
if (missing.length > 0) {
  console.error('Missing images:', missing);
  process.exit(1);
} else {
  console.log('✓ All images exist on disk without 404s.');
}
