/* ============================================
   ANI STUDIOS — Brands Lightbox
   Instant navigation, preloading, zero lag
   ============================================ */

(function() {
  'use strict';

  var lightbox = document.getElementById('brandsLightbox');
  if (!lightbox) return;

  var overlay = lightbox.querySelector('.brands-lightbox__overlay');
  var closeBtn = lightbox.querySelector('.brands-lightbox__close');
  var prevBtn = lightbox.querySelector('.brands-lightbox__prev');
  var nextBtn = lightbox.querySelector('.brands-lightbox__next');
  var image = lightbox.querySelector('.brands-lightbox__image');
  var captionText = lightbox.querySelector('.brands-lightbox__caption-text');
  var imageWrap = lightbox.querySelector('.brands-lightbox__image-wrap');
  var items = document.querySelectorAll('.brands-ig-grid__item');

  var currentIndex = 0;
  var isOpen = false;
  var scrollPosition = 0;
  var preloadCache = {};

  // Build source list once
  var sources = [];
  items.forEach(function(item) {
    sources.push({
      src: item.getAttribute('data-src'),
      caption: item.getAttribute('data-caption')
    });
  });

  // Preload an image by index (no-op if already cached)
  function preload(index) {
    if (index < 0 || index >= sources.length) return;
    var src = sources[index].src;
    if (preloadCache[src]) return;
    var img = new Image();
    img.src = src;
    preloadCache[src] = img;
  }

  // Preload neighbors
  function preloadNeighbors(index) {
    preload((index + 1) % sources.length);
    preload((index - 1 + sources.length) % sources.length);
    preload((index + 2) % sources.length);
  }

  function updateContent() {
    var data = sources[currentIndex];
    image.src = data.src;
    image.alt = data.caption;
    captionText.textContent = data.caption;
    preloadNeighbors(currentIndex);
  }

  function open(index) {
    currentIndex = index;
    updateContent();

    // Lock body scroll (iOS-safe)
    scrollPosition = window.pageYOffset;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + scrollPosition + 'px';
    document.body.style.width = '100%';

    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-active');
    isOpen = true;
  }

  function close() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.classList.remove('is-active');

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);

    isOpen = false;
  }

  function prev() {
    currentIndex = (currentIndex - 1 + sources.length) % sources.length;
    updateContent();
  }

  function next() {
    currentIndex = (currentIndex + 1) % sources.length;
    updateContent();
  }

  // Grid clicks
  items.forEach(function(item, i) {
    item.addEventListener('click', function() { open(i); });
    item.style.cursor = 'pointer';
  });

  // Close
  closeBtn.addEventListener('click', function(e) { e.stopPropagation(); close(); });
  overlay.addEventListener('click', close);

  // Nav
  prevBtn.addEventListener('click', function(e) { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', function(e) { e.stopPropagation(); next(); });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe on image area
  var touchStartX = 0;
  var touchStartY = 0;

  imageWrap.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  imageWrap.addEventListener('touchmove', function(e) {
    var dx = Math.abs(e.changedTouches[0].screenX - touchStartX);
    var dy = Math.abs(e.changedTouches[0].screenY - touchStartY);
    if (dx > dy && dx > 10) e.preventDefault();
  }, { passive: false });

  imageWrap.addEventListener('touchend', function(e) {
    var dx = touchStartX - e.changedTouches[0].screenX;
    var dy = Math.abs(touchStartY - e.changedTouches[0].screenY);
    if (Math.abs(dx) > 35 && Math.abs(dx) > dy) {
      if (dx > 0) next(); else prev();
    }
  }, { passive: true });

  // Eagerly preload first few images on page load
  for (var i = 0; i < Math.min(6, sources.length); i++) {
    preload(i);
  }
})();
