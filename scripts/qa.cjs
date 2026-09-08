const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const previewRoot = path.join(root, 'preview');
const assetsRoot = path.join(previewRoot, 'assets');
const outDir = path.join(root, 'docs', 'qa');
fs.mkdirSync(outDir, { recursive: true });

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

// Internal mini server for testing
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

const PORT = 4174;
server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Test server running at http://127.0.0.1:${PORT}`);

  const viewports = [
    { width: 1440, height: 1000 },
    { width: 1024, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
    { width: 360, height: 800 }
  ];

  let browser;
  const failures = [];

  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch (e2) {
      console.error('Could not launch browser:', e2.message);
      server.close();
      process.exit(1);
    }
  }

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(`http://127.0.0.1:${PORT}`, { waitUntil: 'networkidle' });

    // Scroll through page to trigger lazy loaded elements
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += Math.max(300, window.innerHeight * 0.7)) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => {})));
    });

    const metrics = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('main > section'));
      const missingTargets = Array.from(document.querySelectorAll('a[href^="#"]'))
        .map(a => a.getAttribute('href'))
        .filter(href => href && href.length > 1 && !document.querySelector(href));
      const badImages = Array.from(document.images)
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.getAttribute('src'));
      const doc = document.documentElement;

      return {
        sectionCount: sections.length,
        h1: document.querySelector('h1')?.textContent.trim(),
        overflow: doc.scrollWidth - doc.clientWidth,
        missingTargets: [...new Set(missingTargets)],
        badImages
      };
    });

    if (metrics.sectionCount !== 11) {
      failures.push(`${viewport.width}: Expected 11 sections, found ${metrics.sectionCount}`);
    }
    if (metrics.overflow > 1) {
      failures.push(`${viewport.width}: Horizontal scroll overflow: ${metrics.overflow}px`);
    }
    if (metrics.missingTargets.length > 0) {
      failures.push(`${viewport.width}: Broken anchor links: ${metrics.missingTargets.join(', ')}`);
    }
    if (metrics.badImages.length > 0) {
      failures.push(`${viewport.width}: Broken images: ${metrics.badImages.join(', ')}`);
    }
    if (errors.length > 0) {
      failures.push(`${viewport.width}: Console errors: ${errors.join(' | ')}`);
    }

    // Interaction test on 1440 width:
    if (viewport.width === 1440) {
      // 1. Tag Customizer live name typing
      const nameInput = page.locator('#pm-tag-name-input');
      if (await nameInput.count()) {
        await nameInput.fill('Buster');
        const liveName = await page.locator('#pm-live-tag-name').textContent();
        if (liveName.trim() !== 'Buster') {
          failures.push('1440: Tag customizer name did not update to Buster');
        }
      }

      // 2. Profile tab switcher
      const medicalTab = page.locator('[data-view-id="view-medical"]');
      if (await medicalTab.count()) {
        await medicalTab.click();
        const isMedVisible = await page.locator('#view-medical').isVisible();
        if (!isMedVisible) {
          failures.push('1440: Profile medical tab did not display on click');
        }
      }

      // 3. FAQ Accordion
      const secondFaqTrigger = page.locator('.pm-faq-trigger').nth(1);
      if (await secondFaqTrigger.count()) {
        await secondFaqTrigger.click();
        const parentFaq = page.locator('.pm-faq-item').nth(1);
        const hasActiveClass = await parentFaq.evaluate(el => el.classList.contains('active'));
        if (!hasActiveClass) {
          failures.push('1440: FAQ item 2 did not open on trigger click');
        }
      }
    }

    // Save screenshots for visual verification
    await page.screenshot({
      path: path.join(outDir, `pawmedal-v2-${viewport.width}.png`),
      fullPage: true
    });

    await page.close();
  }

  await browser.close();
  server.close();

  if (failures.length > 0) {
    console.error('QA Failures detected:\n' + failures.join('\n'));
    process.exit(1);
  } else {
    console.log('✓ All QA automated checks passed across 1440, 1024, 768, 390, and 360px viewports!');
    console.log(`Screenshots saved to ${outDir}`);
  }
});
