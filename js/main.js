/* ============================================
   ANI STUDIOS — Main JavaScript
   Scroll reveals, parallax, nav, page transitions
   ============================================ */

(function () {
  'use strict';

  // --- Page Transition: Fade In ---
  const overlay = document.querySelector('.page-transition');
  if (overlay) {
    window.addEventListener('load', () => {
      overlay.classList.add('is-hidden');
    });
  }

  // --- Page Transition: Fade Out on Link Click ---
  document.querySelectorAll('a[href]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      // Skip anchors, external links, and javascript: links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http') ||
        link.target === '_blank'
      ) return;

      e.preventDefault();
      if (overlay) {
        overlay.classList.remove('is-hidden');
        overlay.addEventListener('transitionend', () => {
          window.location.href = href;
        }, { once: true });
      } else {
        window.location.href = href;
      }
    });
  });

  // --- Navigation: Scroll State ---
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 80) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile Menu Toggle ---
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('is-active');
      mobileMenu.classList.toggle('is-open');
      document.body.style.overflow = mobileMenu.classList.contains('is-open')
        ? 'hidden'
        : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-active');
        mobileMenu.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll Reveal (Intersection Observer) ---
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: show all immediately
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  // --- Hero Parallax ---
  const heroImage = document.querySelector('.hero__image img');
  if (heroImage) {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!prefersReducedMotion) {
      let ticking = false;
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const scrollY = window.scrollY;
              const heroHeight =
                document.querySelector('.hero')?.offsetHeight || 0;
              if (scrollY <= heroHeight) {
                heroImage.style.transform = `translateY(${scrollY * 0.35}px) scale(1.05)`;
              }
              ticking = false;
            });
            ticking = true;
          }
        },
        { passive: true }
      );
    }
  }

  // --- Smooth Scroll for Anchor Links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
