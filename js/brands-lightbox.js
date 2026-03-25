/* ============================================
   ANI STUDIOS — Brands Lightbox
   Instagram-style post modal on mobile
   Desktop: arrow nav + keyboard
   Mobile: swipe-only with smooth slide
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
  var igCaptionText = lightbox.querySelector('.brands-lightbox__ig-caption-text');
  var imageWrap = lightbox.querySelector('.brands-lightbox__image-wrap');
  var content = lightbox.querySelector('.brands-lightbox__content');
  var items = document.querySelectorAll('.brands-ig-grid__item');

  var currentIndex = 0;
  var isOpen = false;
  var scrollPosition = 0;
  var preloadCache = {};

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // Build source list once
  var sources = [];
  items.forEach(function(item) {
    sources.push({
      src: item.getAttribute('data-src'),
      caption: item.getAttribute('data-caption')
    });
  });

  // Preload an image by index
  function preload(index) {
    if (index < 0 || index >= sources.length) return;
    var src = sources[index].src;
    if (preloadCache[src]) return;
    var img = new Image();
    img.src = src;
    preloadCache[src] = img;
  }

  function preloadNeighbors(index) {
    preload((index + 1) % sources.length);
    preload((index - 1 + sources.length) % sources.length);
    preload((index + 2) % sources.length);
  }

  function updateContent() {
    var data = sources[currentIndex];
    image.src = data.src;
    image.alt = data.caption;
    if (captionText) captionText.textContent = data.caption;
    if (igCaptionText) igCaptionText.textContent = data.caption;
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
    // Reset any lingering transform
    image.style.transition = '';
    image.style.transform = '';
  }

  function goToPrev() {
    currentIndex = (currentIndex - 1 + sources.length) % sources.length;
    updateContent();
  }

  function goToNext() {
    currentIndex = (currentIndex + 1) % sources.length;
    updateContent();
  }

  // Grid clicks
  items.forEach(function(item, i) {
    item.addEventListener('click', function() { open(i); });
    item.style.cursor = 'pointer';
  });

  // Close handlers
  closeBtn.addEventListener('click', function(e) { e.stopPropagation(); close(); });
  overlay.addEventListener('click', close);

  // Desktop: arrow button nav
  prevBtn.addEventListener('click', function(e) { e.stopPropagation(); goToPrev(); });
  nextBtn.addEventListener('click', function(e) { e.stopPropagation(); goToNext(); });

  // Keyboard nav (desktop + mobile)
  document.addEventListener('keydown', function(e) {
    if (!isOpen) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
  });

  // =============================================
  //  MOBILE: Drag-to-swipe with smooth slide
  //  Feels like native Instagram post swiping
  // =============================================

  var touchStartX = 0;
  var touchStartY = 0;
  var touchCurrentX = 0;
  var isDragging = false;
  var isHorizontalSwipe = null;
  var animating = false;

  content.addEventListener('touchstart', function(e) {
    if (!isMobile() || animating) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchCurrentX = touchStartX;
    isDragging = true;
    isHorizontalSwipe = null;
    image.style.transition = 'none';
  }, { passive: true });

  content.addEventListener('touchmove', function(e) {
    if (!isMobile() || !isDragging || animating) return;

    touchCurrentX = e.touches[0].clientX;
    var dx = touchCurrentX - touchStartX;
    var dy = e.touches[0].clientY - touchStartY;

    // Determine direction on first significant move
    if (isHorizontalSwipe === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
    }

    if (isHorizontalSwipe) {
      e.preventDefault();
      // Follow finger with slight resistance (0.85 multiplier for drag feel)
      image.style.transform = 'translateX(' + (dx * 0.85) + 'px)';
    }
  }, { passive: false });

  content.addEventListener('touchend', function(e) {
    if (!isMobile() || !isDragging || animating) return;
    isDragging = false;

    if (!isHorizontalSwipe) {
      image.style.transform = '';
      image.style.transition = '';
      return;
    }

    var dx = touchCurrentX - touchStartX;
    var threshold = 50;
    var vw = window.innerWidth;

    if (Math.abs(dx) > threshold) {
      // Commit swipe — slide current image off screen
      animating = true;
      var goingNext = dx < 0;
      var slideOutX = goingNext ? -vw : vw;

      image.style.transition = 'transform 0.2s ease-out';
      image.style.transform = 'translateX(' + slideOutX + 'px)';

      setTimeout(function() {
        // Update to next/prev photo
        if (goingNext) {
          currentIndex = (currentIndex + 1) % sources.length;
        } else {
          currentIndex = (currentIndex - 1 + sources.length) % sources.length;
        }

        var data = sources[currentIndex];
        image.src = data.src;
        image.alt = data.caption;
        if (captionText) captionText.textContent = data.caption;
        if (igCaptionText) igCaptionText.textContent = data.caption;
        preloadNeighbors(currentIndex);

        // Position new image on the opposite side (off-screen)
        image.style.transition = 'none';
        image.style.transform = 'translateX(' + (-slideOutX) + 'px)';

        // Force reflow so the browser registers the new position
        void image.offsetWidth;

        // Slide new image in from the side
        image.style.transition = 'transform 0.25s ease-out';
        image.style.transform = 'translateX(0)';

        setTimeout(function() {
          image.style.transition = '';
          image.style.transform = '';
          animating = false;
        }, 260);
      }, 200);

    } else {
      // Below threshold — snap back to center
      image.style.transition = 'transform 0.2s ease-out';
      image.style.transform = 'translateX(0)';
      setTimeout(function() {
        image.style.transition = '';
        image.style.transform = '';
      }, 210);
    }
  }, { passive: true });

  // Eagerly preload first few images on page load
  for (var i = 0; i < Math.min(6, sources.length); i++) {
    preload(i);
  }
})();
