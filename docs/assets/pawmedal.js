/* ==========================================================================
   PAWMEDAL V2 — CLIENT-SIDE INTERACTIONS & CUSTOMIZER SCRIPT
   ========================================================================== */

(function () {
  'use strict';

  /* Security & Intellectual Property Protection Shield */
  function initSecurityShield() {
    // 1. Disable Right-Click Context Menu
    document.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      return false;
    }, { capture: true });

    // 2. Disable Inspection Hotkeys: F12, Ctrl/Cmd + Shift + I/J/C, Ctrl/Cmd + U/S/P
    document.addEventListener('keydown', function (e) {
      var isCmdOrCtrl = e.ctrlKey || e.metaKey;
      var code = e.keyCode || e.which;
      var key = (e.key || '').toLowerCase();

      // F12
      if (code === 123 || key === 'f12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + Shift + I / J / C (DevTools)
      if (isCmdOrCtrl && e.shiftKey && (key === 'i' || key === 'j' || key === 'c' || code === 73 || code === 74 || code === 67)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + U (View Source)
      if (isCmdOrCtrl && (key === 'u' || code === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + S (Save Webpage)
      if (isCmdOrCtrl && (key === 's' || code === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl/Cmd + P (Print)
      if (isCmdOrCtrl && (key === 'p' || code === 80)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Global select-all & copy outside inputs
      if (isCmdOrCtrl && (key === 'a' || key === 'c' || code === 65 || code === 67)) {
        var activeTag = (document.activeElement && document.activeElement.tagName) ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          return false;
        }
      }
    }, { capture: true });

    // 3. Disable Dragging of Images & Media
    document.addEventListener('dragstart', function (e) {
      var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      if (tag === 'img' || tag === 'svg' || tag === 'a') {
        e.preventDefault();
        return false;
      }
    }, { capture: true });

    // 4. Console Deterrence & Periodic Clear
    try {
      if (window.console) {
        var banner = function () {
          console.clear();
          console.log('%c⚠ PAWMEDAL™ PROPRIETARY SOURCE', 'color: #E0B463; font-size: 20px; font-weight: 800; background: #111111; padding: 8px 16px; border-radius: 6px; border: 1px solid #C69746;');
          console.log('%cNotice: All design elements, markup, and interactive code are copyright protected. Unauthorized duplication, extraction, or reverse-engineering is strictly prohibited.', 'color: #888888; font-size: 12px; font-weight: 500;');
        };
        banner();
        setInterval(banner, 3000);
      }
    } catch (err) {}
  }

  // Execute shield immediately
  initSecurityShield();

  function initPawMedal() {
    initHeroVideo();
    initStickyHeader();
    initLiveCustomizer();
    initProfileTabs();
    initFaqAccordion();
    initMobileNav();
    initSmoothScroll();
  }

  /* Hero Video Autoplay Assurance */
  function initHeroVideo() {
    var video = document.querySelector('.pm-hero-bg-video');
    if (!video) return;
    video.muted = true;
    var playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(function () {
        // Fallback poster image remains visible seamlessly
      });
    }
  }

  /* 0. Sticky Header Elevation */
  function initStickyHeader() {
    var header = document.querySelector('.pm-header-bar');
    if (!header) return;

    function handleScroll() {
      if (window.scrollY > 15) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* 1. Live Interactive Tag Customizer */
  function initLiveCustomizer() {
    var nameInput = document.getElementById('pm-tag-name-input');
    var liveNameDisplay = document.getElementById('pm-live-tag-name');
    var tagImage = document.getElementById('pm-live-tag-image');
    var swatches = document.querySelectorAll('.pm-swatch-item');
    var aiBtn = document.getElementById('pm-ai-generate-btn');
    var aiInput = document.getElementById('pm-ai-prompt-input');

    if (nameInput && liveNameDisplay) {
      nameInput.addEventListener('input', function (e) {
        var val = e.target.value.trim();
        liveNameDisplay.textContent = val.length > 0 ? val : 'Luna';
      });
    }

    if (swatches.length && tagImage) {
      swatches.forEach(function (swatch) {
        swatch.addEventListener('click', function () {
          swatches.forEach(function (s) { s.classList.remove('active'); });
          this.classList.add('active');
          var newImgSrc = this.getAttribute('data-tag-src');
          if (newImgSrc) {
            tagImage.style.opacity = '0.7';
            tagImage.style.transform = 'scale(0.96)';
            setTimeout(function () {
              tagImage.src = newImgSrc;
              tagImage.style.opacity = '1';
              tagImage.style.transform = 'scale(1)';
            }, 150);
          }
        });
      });
    }

    if (aiBtn && aiInput && nameInput && liveNameDisplay) {
      aiBtn.addEventListener('click', function () {
        var promptVal = aiInput.value.trim();
        if (!promptVal) {
          aiInput.focus();
          return;
        }
        var origText = aiBtn.innerHTML;
        aiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Designing...';
        aiBtn.disabled = true;

        setTimeout(function () {
          aiBtn.innerHTML = origText;
          aiBtn.disabled = false;
          // Switch to stockholm/gold theme as result
          var targetSwatch = document.querySelector('.pm-swatch-item[data-design="city"]');
          if (targetSwatch) {
            targetSwatch.click();
          }
        }, 1200);
      });
    }
  }

  /* 2. Interactive Pet Profile Tabs */
  function initProfileTabs() {
    var tabBtns = document.querySelectorAll('.pm-tab-btn');
    var screenViews = document.querySelectorAll('.pm-profile-screen-view');

    if (!tabBtns.length || !screenViews.length) return;

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetViewId = this.getAttribute('data-view-id');
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        screenViews.forEach(function (v) { v.classList.remove('active'); });

        this.classList.add('active');
        var activeView = document.getElementById(targetViewId);
        if (activeView) {
          activeView.classList.add('active');
        }
      });
    });
  }

  /* 3. FAQ Accordions */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll('.pm-faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(function (item) {
      var trigger = item.querySelector('.pm-faq-trigger');
      if (trigger) {
        trigger.addEventListener('click', function () {
          var isOpen = item.classList.contains('active');
          // Close siblings if single accordion desired
          faqItems.forEach(function (other) { other.classList.remove('active'); });
          if (!isOpen) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  /* 4. Mobile Navigation */
  function initMobileNav() {
    var toggle = document.querySelector('.pm-mobile-toggle');
    var nav = document.querySelector('.pm-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var isVisible = nav.style.display === 'flex';
        nav.style.display = isVisible ? 'none' : 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '76px';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = '#FAF7F2';
        nav.style.padding = '24px';
        nav.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
        nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
      });
    }
  }

  /* 5. Smooth Anchor Scroll */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          var targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // Run on DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPawMedal);
  } else {
    initPawMedal();
  }

  // Support Shopify Customizer Section Reload
  document.addEventListener('shopify:section:load', initPawMedal);
})();
