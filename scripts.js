// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('nav-list');
if (toggle && navList) {
  toggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// Dynamic year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Testimonial slider
(function initSlider() {
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  if (!slides.length) return;

  let index = 0;
  let autoTimer;

  function renderDots() {
    slides.forEach((_s,i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-label', `Go to testimonial ${i+1}`);
      btn.addEventListener('click', () => goTo(i,true));
      dotsWrap.appendChild(btn);
    });
  }

  function updateActive() {
    slides.forEach((s,i)=> s.classList.toggle('active', i===index));
    const dots = dotsWrap.querySelectorAll('button');
    dots.forEach((d,i)=> d.setAttribute('aria-selected', i===index ? 'true' : 'false'));
  }

  function goTo(i, user=false) {
    index = (i+slides.length) % slides.length;
    updateActive();
    if (user) restartAuto();
  }

  function next() { goTo(index+1); }
  function prev() { goTo(index-1); }

  function startAuto() {
    autoTimer = setInterval(next, 6000);
  }
  function restartAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  renderDots();
  updateActive();
  startAuto();

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restartAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restartAuto(); });
})();

// FAQ details – close others (optional)
(function initFAQ(){
  const faq = document.querySelector('.faq');
  if (!faq) return;
  faq.addEventListener('toggle', e => {
    if (e.target.tagName !== 'DETAILS' || !e.target.open) return;
    [...faq.querySelectorAll('details')].forEach(d => {
      if (d !== e.target) d.open = false;
    });
  });
})();
