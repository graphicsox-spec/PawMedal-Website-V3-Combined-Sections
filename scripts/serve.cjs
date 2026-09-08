const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const previewRoot = path.join(root, 'preview');
const assetsRoot = path.join(previewRoot, 'assets');

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
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405);
    return res.end();
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }

  let file;
  if (pathname === '/' || pathname === '/index.html') {
    file = path.join(previewRoot, 'index.html');
  } else if (pathname.startsWith('/assets/')) {
    file = path.resolve(assetsRoot, pathname.slice('/assets/'.length));
    if (!file.startsWith(assetsRoot + path.sep) || !mime[path.extname(file).toLowerCase()]) {
      res.writeHead(404);
      return res.end();
    }
  } else if (pathname.startsWith('/preview/assets/')) {
    file = path.resolve(assetsRoot, pathname.slice('/preview/assets/'.length));
    if (!file.startsWith(assetsRoot + path.sep) || !mime[path.extname(file).toLowerCase()]) {
      res.writeHead(404);
      return res.end();
    }
  } else {
    res.writeHead(404);
    return res.end();
  }

  fs.readFile(file, (err, bytes) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    res.end(req.method === 'HEAD' ? undefined : bytes);
  });
});

const PORT = 4173;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`PawMedal V2 Preview Server running at: http://127.0.0.1:${PORT}`);
});
