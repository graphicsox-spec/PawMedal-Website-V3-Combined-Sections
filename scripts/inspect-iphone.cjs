const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const imgPath = path.resolve(__dirname, '../theme/assets/pawmedal-iphone17-transparent.png');

const server = http.createServer((req, res) => {
  if (req.url === '/img.png') {
    res.writeHead(200, { 'Content-Type': 'image/png' });
    fs.createReadStream(imgPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <body style="background: #2b7; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
        <img src="/img.png" style="max-height: 90vh; max-width: 90vw; object-fit: contain;">
      </body>
      </html>
    `);
  }
});

server.listen(4277, '127.0.0.1', async () => {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
    await page.goto('http://127.0.0.1:4277/', { waitUntil: 'networkidle' });
    const artifactDir = 'C:\\Users\\graph\\.gemini\\antigravity\\brain\\f74f4193-5954-413d-abcf-72250efec91e';
    await page.screenshot({ path: path.join(artifactDir, 'shot-inspect-iphone17.png') });
    console.log('Saved inspection image');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});
