/* ============================================
   ANI STUDIOS — Brands Instagram-Style Lightbox
   ============================================ */

(function() {
  'use strict';

  const lightbox = document.getElementById('brandsLightbox');
  if (!lightbox) return;

  const overlay = lightbox.querySelector('.brands-lightbox__overlay');
  const closeBtn = lightbox.querySelector('.brands-lightbox__close');
  const prevBtn = lightbox.querySelector('.brands-lightbox__prev');
  const nextBtn = lightbox.querySelector('.brands-lightbox__next');
  const image = lightbox.querySelector('.brands-lightbox__image');
  const captionText = lightbox.querySelector('.brands-lightbox__caption-text');
  const items = document.querySelectorAll('.brands-ig-grid__item');

  let currentIndex = 0;
  let isOpen = false;

  function open(index) {
    currentIndex = index;
    updateContent();
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    isOpen = true;
  }

  function close() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
    isOpen = false;
  }

  function prev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    updateContent();
  }

  function next() {
    currentIndex = (currentIndex + 1) % items.length;
    updateContent();
  }

  function updateContent() {
    const item = items[currentIndex];
    const src = item.getAttribute('data-src');
    const caption = item.getAttribute('data-caption');
    image.src = src;
    image.alt = caption;
    captionText.textContent = caption;
  }

  // Click on grid items
  items.forEach(function(item, i) {
    item.addEventListener('click', function() {
      open(i);
    });
    item.style.cursor = 'pointer';
  });

  // Close
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Nav
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    prev();
  });
  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    next();
  });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  }, { passive: true });
})();
