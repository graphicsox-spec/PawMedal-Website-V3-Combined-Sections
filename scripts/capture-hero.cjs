const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const previewRoot = path.join(root, 'preview');
const assetsRoot = path.join(previewRoot, 'assets');
const artifactDir = 'C:\\Users\\graph\\.gemini\\antigravity\\brain\\f74f4193-5954-413d-abcf-72250efec91e';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file;
  if (pathname === '/' || pathname === '/index.html') {
    file = path.join(previewRoot, 'index.html');
  } else if (pathname.startsWith('/assets/')) {
    file = path.resolve(assetsRoot, pathname.slice('/assets/'.length));
  } else {
    res.writeHead(404);
    return res.end();
  }
  fs.readFile(file, (err, bytes) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(bytes);
  });
});

server.listen(4188, '127.0.0.1', async () => {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 960 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const destPath = path.join(artifactDir, 'shot-hero-3line-heading.png');
    await page.screenshot({
      path: destPath,
      clip: { x: 0, y: 0, width: 1920, height: 960 }
    });
    console.log('Screenshot saved to:', destPath);
  } catch (err) {
    console.error('Error capturing screenshot:', err);
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
