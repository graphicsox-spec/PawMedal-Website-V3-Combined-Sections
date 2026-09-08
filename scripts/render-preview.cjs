const fs = require('fs');
const path = require('path');
const { Liquid } = require('liquidjs');

const root = path.resolve(__dirname, '..');
const engine = new Liquid({
  root: path.join(root, 'theme/sections'),
  extname: '.liquid'
});

engine.registerFilter('asset_url', v => './assets/' + v);
engine.registerFilter('stylesheet_tag', v => `<link rel="stylesheet" href="${v}">`);
engine.registerFilter('default', (val, fallback) => (val !== undefined && val !== null && val !== '') ? val : fallback);

const sections = JSON.parse(fs.readFileSync(path.join(__dirname, 'sections.json'), 'utf8'));

(async () => {
  let body = '';
  for (const s of sections) {
    const filePath = path.join(root, 'theme/sections', 'pawmedal-' + s.slug + '.liquid');
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: Section file not found: ${filePath}`);
      continue;
    }
    const file = fs.readFileSync(filePath, 'utf8');
    let schema = {};
    let settings = {};
    let blocks = [];
    if (file.includes('{% schema %}')) {
      try {
        const schemaSource = file.split('{% schema %}')[1].split('{% endschema %}')[0];
        schema = JSON.parse(schemaSource);
        settings = Object.fromEntries(
          (schema.settings || [])
            .filter(x => x.default !== undefined)
            .map(x => [x.id, x.default])
        );
        blocks = ((schema.presets || [])[0]?.blocks || []).map((b, i) => ({
          ...b,
          id: `block-${i}`,
          shopify_attributes: ''
        }));
      } catch (e) {
        console.warn(`Could not parse schema for ${s.slug}:`, e.message);
      }
    }
    const source = file.split('{% schema %}')[0];
    const rendered = await engine.parseAndRender(source, {
      section: { id: s.slug, settings, blocks }
    });
    body += `\n    <!-- SECTION ${s.name} -->\n    ` + rendered.trim() + '\n';
  }

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PawMedal V2 — Personalized Smart Pet Tags & Apple Find My GPS</title>
  <meta name="description" content="Discover PawMedal V2. Personalized luxury smart pet tags featuring Apple Find My global tracking, instant NFC & QR pet profiles, and aerospace aluminum construction.">
  <link rel="icon" href="./assets/Favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="./assets/Favicon.svg">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=format_color_reset">
  <link rel="stylesheet" href="./assets/pawmedal.css">
  <script>
    /* PawMedal Security & IP Protection */
    (function(){
      document.addEventListener('contextmenu',function(e){e.preventDefault();return false;},true);
      document.addEventListener('keydown',function(e){
        var c=e.ctrlKey||e.metaKey,k=(e.key||'').toLowerCase(),code=e.keyCode||e.which;
        if(code===123||k==='f12'||(c&&e.shiftKey&&(k==='i'||k==='j'||k==='c'||code===73||code===74||code===67))||(c&&(k==='u'||k==='s'||k==='p'||code===85||code===83||code===80))){
          e.preventDefault();e.stopPropagation();return false;
        }
        if(c&&(k==='a'||k==='c'||code===65||code===67)){
          var t=(document.activeElement&&document.activeElement.tagName)?document.activeElement.tagName.toLowerCase():'';
          if(t!=='input'&&t!=='textarea'){e.preventDefault();return false;}
        }
      },true);
      document.addEventListener('dragstart',function(e){
        var t=(e.target&&e.target.tagName)?e.target.tagName.toLowerCase():'';
        if(t==='img'||t==='svg'||t==='a'){e.preventDefault();return false;}
      },true);
    })();
  </script>
</head>
<body class="pawmedal-v2-body">

  <div style="background: #111111; color: #FAF7F2; text-align: center; padding: 9px 16px; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; display: flex; align-items: center; justify-content: center; gap: 8px;">
    <img src="./assets/wand_shine_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Wand" class="pm-wand-icon-gold" width="16" height="16" style="width: 16px; height: 16px; flex-shrink: 0;">
    <span><span style="color: #E0B463;">Global Free Shipping</span> on all orders over €50 · 30-Day Money-Back Guarantee</span>
  </div>

  <header class="pm-header-bar">
    <div class="pawmedal-wrap pm-header-inner">
      <a href="#" class="pm-logo-link" aria-label="PawMedal Home">
        <img src="./assets/PawMedal-Logo.svg" alt="PawMedal - Always Find Home" class="pm-logo-img">
      </a>

      <nav class="pm-nav">
        <a href="#shop">Shop</a>
        <a href="#how-it-works">How It Works</a>
        <a href="#finder-spotlight">Finder</a>
        <a href="#construction">Engineering</a>
        <a href="#comparison">Compare</a>
        <a href="#design-studio">Design Yours</a>
        <a href="#faq">FAQ</a>
      </nav>

      <div class="pm-header-actions">
        <button type="button" class="pm-header-icon-btn" aria-label="Search">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
        <button type="button" class="pm-header-icon-btn" aria-label="Cart" style="position: relative;">
          <i class="fa-solid fa-bag-shopping"></i>
          <span style="position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #C69746; color: #ffffff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center;">1</span>
        </button>
        <a href="#design-studio" class="pm-btn pm-btn-gold" style="padding: 10px 22px; font-size: 13px;">
          Design Tag
        </a>
        <button type="button" class="pm-mobile-toggle" aria-label="Toggle menu">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  </header>

  <main id="main">
${body}
  </main>

  <footer class="pm-footer">
    <div class="pawmedal-wrap">
      <div class="pm-footer-grid">
        <!-- Brand Column -->
        <div class="pm-footer-brand">
          <a href="#" class="pm-footer-logo-link" aria-label="PawMedal Home">
            <img src="./assets/PawMedal-LogoV2.svg" alt="PawMedal" class="pm-footer-logo">
          </a>
          <p class="pm-footer-desc">
            Elevating pet security with aerospace engineering, Apple Find My global connectivity, and timeless Scandinavian craftsmanship.
          </p>
          <div class="pm-footer-socials">
            <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
          </div>
        </div>

        <!-- Products Column -->
        <div class="pm-footer-col">
          <h4 class="pm-footer-title">Products</h4>
          <ul class="pm-footer-links">
            <li><a href="#shop">PawMedal Tag</a></li>
            <li><a href="#shop">PawMedal Finder</a></li>
            <li><a href="#shop">Protection Bundle</a></li>
            <li><a href="#design-studio">Artisan Series</a></li>
            <li><a href="#design-studio">AI Customizer</a></li>
          </ul>
        </div>

        <!-- Technology Column -->
        <div class="pm-footer-col">
          <h4 class="pm-footer-title">Technology</h4>
          <ul class="pm-footer-links">
            <li><a href="#how-it-works">Cloud Pet Profile</a></li>
            <li><a href="#finder-spotlight">Apple Find My</a></li>
            <li><a href="#construction">Exploded Pedestal</a></li>
            <li><a href="#comparison">Compare Models</a></li>
            <li><a href="#faq">Questions &amp; Answers</a></li>
          </ul>
        </div>

        <!-- Newsletter Column -->
        <div class="pm-footer-col pm-footer-newsletter-col">
          <h4 class="pm-footer-title">Join The Pet Club</h4>
          <p class="pm-footer-desc">
            Get exclusive early access to limited artist releases and VIP pet safety updates.
          </p>
          <form class="pm-footer-form" onsubmit="event.preventDefault(); alert('Welcome to the PawMedal Pet Club!');">
            <input type="email" placeholder="Your email address" required class="pm-footer-input">
            <button type="submit" class="pm-btn pm-btn-gold pm-footer-submit">Join</button>
          </form>
          <div class="pm-footer-guarantee">
            <i class="fa-solid fa-shield-check"></i> Zero spam · Unsubscribe anytime
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="pm-footer-bottom">
        <div class="pm-footer-copy">
          © 2026 PawMedal. All rights reserved. Always Find Home.
        </div>
        <div class="pm-footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Shipping &amp; Returns</a>
          <a href="#">Warranty</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="./assets/pawmedal.js"></script>
</body>
</html>`;

  // Always sync theme/assets to preview/assets
  fs.cpSync(path.join(root, 'theme/assets'), path.join(root, 'preview/assets'), { recursive: true });

  fs.writeFileSync(path.join(root, 'preview/index.html'), doc, 'utf8');

  // Also sync dist/ for production previews
  const dist = path.join(root, 'dist');
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dist, 'index.html'), doc, 'utf8');
  fs.writeFileSync(path.join(dist, '.nojekyll'), '', 'utf8');
  fs.cpSync(path.join(root, 'theme/assets'), path.join(dist, 'assets'), { recursive: true });

  // Also sync docs/ for GitHub Pages /docs folder support
  const docs = path.join(root, 'docs');
  fs.mkdirSync(path.join(docs, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(docs, 'index.html'), doc, 'utf8');
  fs.writeFileSync(path.join(docs, '.nojekyll'), '', 'utf8');
  fs.cpSync(path.join(root, 'theme/assets'), path.join(docs, 'assets'), { recursive: true });

  console.log('✓ Successfully synced all theme assets and rendered 11 Liquid sections into preview/, dist/, and docs/');
})();
