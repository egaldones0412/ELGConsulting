// Navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('nav-list');

if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
    navToggle.textContent = open ? '✕' : '☰';
  });

  // Close menu when a link is clicked (mobile)
  navList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && navList.classList.contains('open')) {
      navList.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    }
  });
}

// Current year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Testimonial slider
(function initSlider(){
  const slider = document.querySelector('.testimonial-slider');
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('.prev');
  const nextBtn = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  let index = 0;
  let interval;

  function renderDots(){
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Show testimonial ${i+1}`);
      b.setAttribute('role','tab');
      if (i === index) b.setAttribute('aria-selected','true');
      dotsWrap.appendChild(b);
    });
  }

  function update(){
    slides.forEach((s,i)=>{
      s.classList.toggle('active', i===index);
    });
    dotsWrap.querySelectorAll('button').forEach((d,i)=>{
      if (i===index) d.setAttribute('aria-selected','true'); else d.removeAttribute('aria-selected');
    });
  }

  function go(dir){
    index = (index + dir + slides.length) % slides.length;
    update();
  }

  function goTo(i){
    index = i;
    update();
  }

  function startAuto(){
    interval = setInterval(()=>go(1), 9000);
  }
  function stopAuto(){
    clearInterval(interval);
  }

  renderDots();
  update();
  startAuto();

  prevBtn.addEventListener('click', ()=>{ stopAuto(); go(-1); startAuto(); });
  nextBtn.addEventListener('click', ()=>{ stopAuto(); go(1); startAuto(); });
  dotsWrap.addEventListener('click', (e)=>{
    if (e.target.tagName==='BUTTON'){
      stopAuto();
      const buttons = Array.from(dotsWrap.children);
      goTo(buttons.indexOf(e.target));
      startAuto();
    }
  });

  slider.addEventListener('pointerenter', stopAuto);
  slider.addEventListener('pointerleave', startAuto);
})();
