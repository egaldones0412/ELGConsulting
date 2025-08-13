// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('nav-list');
if (toggle && navList) {
  toggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  // Close menu when a link is clicked (mobile usability)
  navList.addEventListener('click', e => {
    if (e.target.tagName === 'A' && navList.classList.contains('open')) {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

// Dynamic footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Testimonial slider
(function initSlider(){
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.slide')];
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  if (!slides.length) return;

  let index = 0;
  let autoTimer;

  function buildDots(){
    slides.forEach((_s,i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label',`Go to testimonial ${i+1}`);
      b.addEventListener('click', () => goTo(i,true));
      dotsWrap.appendChild(b);
    });
  }

  function update(){
    slides.forEach((s,i)=> {
      s.classList.toggle('active', i===index);
      s.setAttribute('aria-hidden', i===index ? 'false':'true');
    });
    dotsWrap.querySelectorAll('button').forEach((b,i)=>{
      b.setAttribute('aria-selected', i===index ? 'true':'false');
    });
  }

  function goTo(i,user=false){
    index = (i + slides.length) % slides.length;
    update();
    if (user) restart();
  }

  function next(){ goTo(index+1); }
  function prev(){ goTo(index-1); }

  function start(){ autoTimer = setInterval(next, 6500); }
  function restart(){ clearInterval(autoTimer); start(); }

  buildDots();
  update();
  start();
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
})();

// FAQ: only one open at a time
(function initFAQ(){
  const faq = document.querySelector('.faq');
  if (!faq) return;
  faq.addEventListener('toggle', e => {
    if (e.target.tagName !== 'DETAILS' || !e.target.open) return;
    [...faq.querySelectorAll('details')].forEach(d=>{
      if (d!==e.target) d.open = false;
    });
  });
})();
