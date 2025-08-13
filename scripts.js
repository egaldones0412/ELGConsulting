/**
 * Base JS (v37 baseline extracted)
 * From index (2).html inline script.
 * Functionality:
 *  - Dynamic year
 *  - Mobile nav toggle
 *  - Theme (light/dark) replica toggle with persistence + prefers-color-scheme fallback
 *  - Simple testimonial slider (dots + prev/next)
 *
 * This file is designed as a clean foundation for future enhancements.
 * All features are modularized so you can remove or extend easily.
 *
 * Usage:
 *  1. Remove the inline <script> block from your HTML.
 *  2. Add: <script src="scripts.js" defer></script> before </body>.
 */

/* -------------------------------
 * Boot
 * ----------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavToggle();
  initThemeToggle();
  initTestimonialSlider();
});

/* -------------------------------
 * Dynamic Year
 * ----------------------------- */
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/* -------------------------------
 * Mobile Navigation Toggle
 * ----------------------------- */
function initNavToggle() {
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if (!navToggle || !navList) return;

  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Optional: close menu after clicking a link (uncomment if desired)
  // navList.querySelectorAll('a').forEach(link =>
  //   link.addEventListener('click', () => {
  //     if (navList.classList.contains('open')) {
  //       navList.classList.remove('open');
  //       navToggle.setAttribute('aria-expanded', 'false');
  //     }
  //   })
  // );
}

/* -------------------------------
 * Theme Toggle (Replica Sun/Moon)
 * ----------------------------- */
function initThemeToggle() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const stored = localStorage.getItem('theme');
  if (stored) {
    root.setAttribute('data-theme', stored);
    syncToggle(stored);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = prefersDark ? 'dark' : 'light';
    root.setAttribute('data-theme', mode);
    syncToggle(mode);
  }

  toggleBtn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncToggle(next);
  });

  function syncToggle(mode) {
    const dark = mode === 'dark';
    toggleBtn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', dark ? 'Activate light mode' : 'Activate dark mode');
  }
}

/* -------------------------------
 * Testimonial Slider
 * ----------------------------- */
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  if (!slides.length || !dotsWrap) return;

  let index = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(i) {
    slides[index].classList.remove('active');
    dotsWrap.children[index].setAttribute('aria-selected', 'false');
    index = i;
    slides[index].classList.add('active');
    dotsWrap.children[index].setAttribute('aria-selected', 'true');
  }

  prevBtn?.addEventListener('click', () => {
    goTo((index - 1 + slides.length) % slides.length);
  });
  nextBtn?.addEventListener('click', () => {
    goTo((index + 1) % slides.length);
  });

  // Optional: expose API globally for future enhancements
  window.__testimonialSlider = { goTo, next: () => goTo((index + 1) % slides.length), prev: () => goTo((index - 1 + slides.length) % slides.length) };
}

/* -------------------------------
 * (Future Expansion Hooks)
 * ----------------------------- */
/**
 * You can add new initializers here:
 *  - initAnalytics()
 *  - initFormValidation()
 *  - initIntersectionAnimations()
 * Keep each isolated and then call inside DOMContentLoaded.
 */
