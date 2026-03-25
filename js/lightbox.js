/* ============================================
   ANI STUDIOS — Lightbox
   Full-screen image viewer with keyboard nav,
   thumbnail strip, touch/swipe, smooth transitions.
   Inspired by mpkelley.com interaction patterns.
   ============================================ */

(function () {
  'use strict';

  let currentIndex = 0;
  let images = [];
  let lightbox = null;
  let isOpen = false;
  let touchStartX = 0;
  let touchEndX = 0;

  function createLightbox() {
    if (document.getElementById('ani-lightbox')) return;

    const el = document.createElement('div');
    el.id = 'ani-lightbox';
    el.className = 'lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Image viewer');
    el.innerHTML = `
      <div class="lightbox__overlay"></div>
      <button class="lightbox__close" aria-label="Close lightbox">&times;</button>
      <button class="lightbox__prev" aria-label="Previous image">
        <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
          <path d="M18 2L2 18L18 34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="lightbox__stage">
        <img class="lightbox__img" src="" alt="" draggable="false">
      </div>
      <button class="lightbox__next" aria-label="Next image">
        <svg width="20" height="36" viewBox="0 0 20 36" fill="none">
          <path d="M2 2L18 18L2 34" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="lightbox__counter"></div>
      <div class="lightbox__thumbs-toggle">
        <button aria-label="Toggle thumbnails">Show Thumbnails</button>
      </div>
      <div class="lightbox__thumbs">
        <div class="lightbox__thumbs-track"></div>
      </div>
    `;

    document.body.appendChild(el);
    lightbox = el;

    // Event listeners
    el.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);
    el.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    el.querySelector('.lightbox__prev').addEventListener('click', prevImage);
    el.querySelector('.lightbox__next').addEventListener('click', nextImage);

    const thumbsToggle = el.querySelector('.lightbox__thumbs-toggle button');
    const thumbsContainer = el.querySelector('.lightbox__thumbs');
    thumbsToggle.addEventListener('click', function () {
      const isVisible = thumbsContainer.classList.toggle('is-visible');
      thumbsToggle.textContent = isVisible ? 'Hide Thumbnails' : 'Show Thumbnails';
    });

    // Touch/swipe support
    const stage = el.querySelector('.lightbox__stage');
    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stage.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeydown);
  }

  function handleKeydown(e) {
    if (!isOpen) return;
    if (e.key === 'Escape' || e.key === 'Esc') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  }

  function handleSwipe() {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  }

  function openLightbox(galleryImages, startIndex) {
    createLightbox();
    images = galleryImages;
    currentIndex = startIndex || 0;

    // Build thumbnail strip
    const track = lightbox.querySelector('.lightbox__thumbs-track');
    track.innerHTML = '';
    images.forEach(function (src, i) {
      const thumb = document.createElement('div');
      thumb.className = 'lightbox__thumb' + (i === currentIndex ? ' is-active' : '');
      thumb.innerHTML = '<img src="' + src + '" alt="" draggable="false">';
      thumb.addEventListener('click', function () {
        goToImage(i);
      });
      track.appendChild(thumb);
    });

    showImage(currentIndex);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    isOpen = true;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    isOpen = false;
  }

  function showImage(index) {
    const img = lightbox.querySelector('.lightbox__img');
    img.classList.add('is-transitioning');

    setTimeout(function () {
      img.src = images[index];
      img.alt = 'Image ' + (index + 1) + ' of ' + images.length;
      img.classList.remove('is-transitioning');
    }, 150);

    // Update counter
    lightbox.querySelector('.lightbox__counter').textContent =
      (index + 1) + ' / ' + images.length;

    // Update thumbnails
    var thumbs = lightbox.querySelectorAll('.lightbox__thumb');
    thumbs.forEach(function (t, i) {
      t.classList.toggle('is-active', i === index);
    });

    // Scroll active thumbnail into view
    var activeThumb = lightbox.querySelector('.lightbox__thumb.is-active');
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Show/hide prev/next
    lightbox.querySelector('.lightbox__prev').style.visibility =
      index > 0 ? 'visible' : 'hidden';
    lightbox.querySelector('.lightbox__next').style.visibility =
      index < images.length - 1 ? 'visible' : 'hidden';
  }

  function prevImage() {
    if (currentIndex > 0) {
      currentIndex--;
      showImage(currentIndex);
    }
  }

  function nextImage() {
    if (currentIndex < images.length - 1) {
      currentIndex++;
      showImage(currentIndex);
    }
  }

  function goToImage(index) {
    currentIndex = index;
    showImage(currentIndex);
  }

  // Auto-init: find all gallery images on the page
  function init() {
    var galleryImgs = document.querySelectorAll('.gallery-img img, .brand-gallery-img img');
    if (galleryImgs.length === 0) return;

    var srcs = [];
    galleryImgs.forEach(function (img) {
      srcs.push(img.src);
    });

    galleryImgs.forEach(function (img, index) {
      img.style.cursor = 'pointer';
      img.parentElement.style.cursor = 'pointer';
      img.parentElement.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openLightbox(srcs, index);
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.ANILightbox = { open: openLightbox, close: closeLightbox };
})();
