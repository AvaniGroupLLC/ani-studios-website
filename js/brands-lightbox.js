/* ============================================
   ANI STUDIOS — Brands Gallery
   Desktop (>768px): Lightbox with arrow nav
   Mobile  (≤768px): Instagram-style scrollable feed
   ============================================ */

(function() {
  'use strict';

  var lightbox = document.getElementById('brandsLightbox');
  var feedEl = document.getElementById('brandsFeed');
  var items = document.querySelectorAll('.brands-ig-grid__item');

  if (!items.length) return;

  // Build sources array from grid data attributes
  var sources = [];
  items.forEach(function(item) {
    sources.push({
      src: item.getAttribute('data-src'),
      caption: item.getAttribute('data-caption')
    });
  });

  function isMobile() {
    return window.innerWidth <= 768;
  }

  // ============================================
  //  DESKTOP: Lightbox
  // ============================================

  var lbOverlay, lbClose, lbPrev, lbNext, lbImage, lbCaptionText;
  var lbCurrentIndex = 0;
  var lbIsOpen = false;
  var preloadCache = {};

  if (lightbox) {
    lbOverlay = lightbox.querySelector('.brands-lightbox__overlay');
    lbClose = lightbox.querySelector('.brands-lightbox__close');
    lbPrev = lightbox.querySelector('.brands-lightbox__prev');
    lbNext = lightbox.querySelector('.brands-lightbox__next');
    lbImage = lightbox.querySelector('.brands-lightbox__image');
    lbCaptionText = lightbox.querySelector('.brands-lightbox__caption-text');

    lbClose.addEventListener('click', function(e) { e.stopPropagation(); closeLightbox(); });
    lbOverlay.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function(e) { e.stopPropagation(); lbGoPrev(); });
    lbNext.addEventListener('click', function(e) { e.stopPropagation(); lbGoNext(); });
  }

  function preload(idx) {
    if (idx < 0 || idx >= sources.length) return;
    var src = sources[idx].src;
    if (preloadCache[src]) return;
    var img = new Image();
    img.src = src;
    preloadCache[src] = img;
  }

  function updateLightbox() {
    var data = sources[lbCurrentIndex];
    lbImage.src = data.src;
    lbImage.alt = data.caption;
    if (lbCaptionText) lbCaptionText.textContent = data.caption;
    preload((lbCurrentIndex + 1) % sources.length);
    preload((lbCurrentIndex - 1 + sources.length) % sources.length);
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lbCurrentIndex = index;
    updateLightbox();
    document.body.style.overflow = 'hidden';
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.classList.add('is-active');
    lbIsOpen = true;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.classList.remove('is-active');
    document.body.style.overflow = '';
    lbIsOpen = false;
  }

  function lbGoPrev() {
    lbCurrentIndex = (lbCurrentIndex - 1 + sources.length) % sources.length;
    updateLightbox();
  }

  function lbGoNext() {
    lbCurrentIndex = (lbCurrentIndex + 1) % sources.length;
    updateLightbox();
  }

  // Keyboard nav for desktop lightbox
  document.addEventListener('keydown', function(e) {
    if (!lbIsOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbGoPrev();
    if (e.key === 'ArrowRight') lbGoNext();
  });

  // ============================================
  //  MOBILE: Instagram Feed View
  // ============================================

  var feedBuilt = false;
  var feedObserver = null;
  var feedScrollPos = 0;
  var feedIsOpen = false;
  var topbarHeight = 0;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function buildFeed() {
    if (feedBuilt || !feedEl) return;

    // Build sticky top bar
    var topbar = document.createElement('div');
    topbar.className = 'brands-feed__topbar';
    topbar.innerHTML =
      '<button class="brands-feed__back" aria-label="Back to grid">' +
        '<svg class="brands-feed__back-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<polyline points="15 18 9 12 15 6"></polyline>' +
        '</svg>' +
        '<span>Posts</span>' +
      '</button>';
    feedEl.appendChild(topbar);

    topbar.querySelector('.brands-feed__back').addEventListener('click', closeFeed);

    // Build all 36 posts
    var postsWrap = document.createElement('div');
    postsWrap.className = 'brands-feed__posts';

    sources.forEach(function(data, index) {
      var post = document.createElement('article');
      post.className = 'brands-feed__post';
      post.setAttribute('data-feed-index', index);

      post.innerHTML =
        '<div class="brands-feed__post-header">' +
          '<div class="brands-feed__avatar">A</div>' +
          '<span class="brands-feed__username">anistudios</span>' +
        '</div>' +
        '<img class="brands-feed__post-img" data-feed-src="' + data.src + '" alt="Brand photography">' +
        '<div class="brands-feed__post-caption">' +
          '<span class="brands-feed__caption-user">anistudios</span> ' +
          '<span class="brands-feed__caption-text">' + escapeHtml(data.caption) + '</span>' +
        '</div>';

      postsWrap.appendChild(post);
    });

    feedEl.appendChild(postsWrap);
    feedBuilt = true;

    // Lazy loading: IntersectionObserver watches feed images
    // rootMargin 600px = preloads ~3 posts below the fold
    var imgs = feedEl.querySelectorAll('.brands-feed__post-img[data-feed-src]');
    feedObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.getAttribute('data-feed-src');
          img.removeAttribute('data-feed-src');
          feedObserver.unobserve(img);
        }
      });
    }, {
      root: feedEl,
      rootMargin: '600px 0px',
      threshold: 0
    });

    imgs.forEach(function(img) { feedObserver.observe(img); });
  }

  function openFeed(index) {
    buildFeed();

    // Lock body scroll (iOS-safe)
    feedScrollPos = window.pageYOffset;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + feedScrollPos + 'px';
    document.body.style.width = '100%';

    feedEl.classList.add('is-active');
    feedIsOpen = true;

    // Get topbar height for scroll offset
    var topbarEl = feedEl.querySelector('.brands-feed__topbar');
    topbarHeight = topbarEl ? topbarEl.offsetHeight : 44;

    // Force-load the tapped image + 4 neighbors immediately
    var posts = feedEl.querySelectorAll('.brands-feed__post');
    for (var i = Math.max(0, index - 1); i <= Math.min(sources.length - 1, index + 4); i++) {
      var img = posts[i].querySelector('.brands-feed__post-img');
      if (img && img.hasAttribute('data-feed-src')) {
        img.src = img.getAttribute('data-feed-src');
        img.removeAttribute('data-feed-src');
        if (feedObserver) feedObserver.unobserve(img);
      }
    }

    // Scroll to the tapped post instantly
    var targetPost = posts[index];
    requestAnimationFrame(function() {
      // Use offsetTop to scroll directly — avoids smooth-scroll interference
      // Subtract topbar height so the post sits just below the sticky bar
      feedEl.scrollTop = targetPost.offsetTop - topbarHeight;
    });
  }

  function closeFeed() {
    feedEl.classList.remove('is-active');
    feedEl.scrollTop = 0;
    feedIsOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, feedScrollPos);
  }

  // Escape key closes feed
  document.addEventListener('keydown', function(e) {
    if (feedIsOpen && e.key === 'Escape') closeFeed();
  });

  // ============================================
  //  GRID CLICK HANDLER
  //  Mobile → Feed | Desktop → Lightbox
  // ============================================

  items.forEach(function(item, i) {
    item.addEventListener('click', function() {
      if (isMobile()) {
        openFeed(i);
      } else {
        openLightbox(i);
      }
    });
    item.style.cursor = 'pointer';
  });

  // Preload first few images for desktop lightbox
  for (var i = 0; i < Math.min(6, sources.length); i++) {
    preload(i);
  }
})();
