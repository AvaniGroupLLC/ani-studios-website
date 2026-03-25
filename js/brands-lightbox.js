/* ============================================
   ANI STUDIOS — Brands Instagram-Style Lightbox
   Mobile-optimized: full-screen, swipe, touch targets
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
  let scrollPosition = 0;

  function open(index) {
    currentIndex = index;
    updateContent();

    // Save scroll position and lock body (prevents iOS bounce)
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

    // Restore scroll position
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollPosition);

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
    var item = items[currentIndex];
    var src = item.getAttribute('data-src');
    var caption = item.getAttribute('data-caption');

    // Fade image transition
    image.style.opacity = '0';
    setTimeout(function() {
      image.src = src;
      image.alt = caption;
      image.onload = function() {
        image.style.opacity = '1';
      };
    }, 120);

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
  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    close();
  });
  overlay.addEventListener('click', close);

  // Nav buttons
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

  // Swipe support for mobile — only on the image area
  var touchStartX = 0;
  var touchStartY = 0;
  var touchEndX = 0;
  var touchEndY = 0;
  var isSwiping = false;

  var imageWrap = lightbox.querySelector('.brands-lightbox__image-wrap');

  imageWrap.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    isSwiping = true;
  }, { passive: true });

  imageWrap.addEventListener('touchmove', function(e) {
    if (!isSwiping) return;
    var diffX = Math.abs(e.changedTouches[0].screenX - touchStartX);
    var diffY = Math.abs(e.changedTouches[0].screenY - touchStartY);
    // If horizontal swipe, prevent vertical scroll
    if (diffX > diffY && diffX > 10) {
      e.preventDefault();
    }
  }, { passive: false });

  imageWrap.addEventListener('touchend', function(e) {
    if (!isSwiping) return;
    isSwiping = false;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    var diffX = touchStartX - touchEndX;
    var diffY = Math.abs(touchStartY - touchEndY);

    // Only register horizontal swipes (not vertical scroll)
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
      if (diffX > 0) next();
      else prev();
    }
  }, { passive: true });

  // Also allow close by tapping the image area (single tap without swipe)
  var tapTimer = null;
  imageWrap.addEventListener('touchend', function(e) {
    var diffX = Math.abs(touchStartX - e.changedTouches[0].screenX);
    var diffY = Math.abs(touchStartY - e.changedTouches[0].screenY);
    // Only close on tap (not swipe)
    if (diffX < 10 && diffY < 10) {
      // Don't close on tap — use X button instead.
      // This prevents accidental closes during navigation.
    }
  }, { passive: true });

  // Add smooth opacity transition to lightbox image
  image.style.transition = 'opacity 0.15s ease';
})();
