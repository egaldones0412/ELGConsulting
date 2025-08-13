/* v1_full_refresh JS: navigation, theme, hero carousel, progress bar, KPI pops, metric count, forms */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile Nav */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        if (navList.classList.contains('open')) {
          navList.classList.remove('open');
          navToggle.setAttribute('aria-expanded','false');
        }
      })
    );
  }

  /* Active nav link on scroll */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: [0,0.25,0.5,1] });
  sections.forEach(s => observer.observe(s));

  /* Theme Toggle */
  const themeToggle = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  if (stored) {
    root.setAttribute('data-theme', stored);
    syncTheme(stored);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark':'light');
    syncTheme(prefersDark ? 'dark':'light');
  }
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    syncTheme(next);
  });
  function syncTheme(mode){
    themeToggle?.setAttribute('aria-pressed', mode === 'dark' ? 'true':'false');
    themeToggle?.setAttribute('aria-label', mode === 'dark' ? 'Activate light mode' : 'Activate dark mode');
  }

  /* Hero Carousel */
  (function initHero(){
    const carousel = document.querySelector('.hero-carousel');
    if(!carousel) return;
    const track = carousel.querySelector('.hc-track');
    const slides = Array.from(track.children);
    const prevBtn = carousel.querySelector('.hc-arrow.prev');
    const nextBtn = carousel.querySelector('.hc-arrow.next');
    const dotsWrap = carousel.querySelector('.hc-dots');
    const status = carousel.querySelector('.hc-status');
    const viewport = carousel.querySelector('.hc-viewport');
    const progressBar = carousel.querySelector('.hc-progress-bar');

    const AUTOPLAY = true;
    const INTERVAL = 6500; // ms
    const LOOP = true;
    const POPUPS = true;
    let index = 0;
    let timer = null;
    let progressTimer = null;
    let popTimer = null;

    slides.forEach((_,i)=>{
      const b = document.createElement('button');
      b.type='button';
      b.setAttribute('role','tab');
      b.setAttribute('aria-label',`Go to slide ${i+1}`);
      b.setAttribute('aria-selected', i===0 ? 'true':'false');
      b.addEventListener('click', ()=>goTo(i,true));
      dotsWrap.appendChild(b);
    });

    function updateStatus(){
      status.textContent = `Slide ${index+1} of ${slides.length}`;
      slides.forEach((s,i)=> s.setAttribute('aria-label', `${i+1} of ${slides.length}`));
    }
    function setActive(){
      slides.forEach(s=>{
        s.classList.remove('is-active');
        s.querySelector('.hc-diagonals')?.classList.remove('animating');
      });
      const active = slides[index];
      active.classList.add('is-active');
      active.querySelector('.hc-diagonals')?.classList.add('animating');
      Array.from(dotsWrap.children).forEach((d,i)=> d.setAttribute('aria-selected', i===index ? 'true':'false'));
      updateStatus();
      restartProgress();
      if(POPUPS) resetPopups();
    }
    function goTo(i,user=false){
      if(i < 0) i = LOOP ? slides.length-1 : 0;
      if(i >= slides.length) i = LOOP ? 0 : slides.length-1;
      index = i;
      track.style.transform = `translateX(${ -index*100 }%)`;
      setActive();
      if(user) restartAutoplay();
    }
    function next(){ goTo(index+1); }
    function prev(){ goTo(index-1); }

    nextBtn?.addEventListener('click', ()=> next());
    prevBtn?.addEventListener('click', ()=> prev());

    viewport?.addEventListener('keydown', e=>{
      if(e.key === 'ArrowRight'){ e.preventDefault(); next(); }
      if(e.key === 'ArrowLeft'){ e.preventDefault(); prev(); }
    });

    /* Swipe */
    let startX=0, dragging=false;
    viewport?.addEventListener('pointerdown', e=>{
      dragging=true; startX=e.clientX;
      viewport.setPointerCapture(e.pointerId);
      track.style.transition='none';
    });
    viewport?.addEventListener('pointermove', e=>{
      if(!dragging) return;
      const dx = e.clientX - startX;
      const pct = dx / viewport.clientWidth * 100;
      track.style.transform = `translateX(${ -index*100 + pct }%)`;
    });
    function endDrag(e){
      if(!dragging) return;
      dragging=false; track.style.transition='';
      const dx = e.clientX - startX;
      if(Math.abs(dx) > viewport.clientWidth * 0.18) {
        dx < 0 ? next() : prev();
      } else goTo(index);
    }
    viewport?.addEventListener('pointerup', endDrag);
    viewport?.addEventListener('pointercancel', endDrag);
    viewport?.addEventListener('pointerleave', endDrag);

    /* Autoplay */
    function startAutoplay(){
      if(!AUTOPLAY) return;
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stopAutoplay();
      timer = setInterval(()=> next(), INTERVAL);
      restartProgress();
    }
    function stopAutoplay(){
      if(timer) { clearInterval(timer); timer=null; }
      if(progressTimer){ clearTimeout(progressTimer); progressTimer=null; }
    }
    function restartAutoplay(){
      stopAutoplay();
      startAutoplay();
    }

    /* Progress Bar */
    function restartProgress(){
      if(!progressBar) return;
      progressBar.style.transition='none';
      progressBar.style.width='0%';
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          progressBar.style.transition=`width ${INTERVAL}ms linear`;
          progressBar.style.width='100%';
        });
      });
    }

    /* KPI Popups */
    const popMessages = [
      'Close SLA Met',
      'Variance Note Added',
      'GM +2.4%',
      'AR Days ↓ 3',
      'Run Rate ↑',
      'Expense Ratio ↓'
    ];
    function spawnPopup(){
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const active = slides[index];
      const layer = active.querySelector('.hc-overlay');
      if(!layer) return;
      const pop = document.createElement('div');
      pop.className='kpi-pop';
      pop.setAttribute('aria-hidden','true');
      pop.textContent = popMessages[Math.floor(Math.random()*popMessages.length)];
      pop.style.left = (35 + Math.random()*40) + '%';
      pop.style.top = (28 + Math.random()*40) + '%';
      layer.appendChild(pop);
      setTimeout(()=>{
        pop.classList.add('out');
        setTimeout(()=> pop.remove(), 1200);
      }, 2300);
    }
    function schedulePopups(){
      stopPopups();
      if(!POPUPS) return;
      popTimer = setInterval(spawnPopup, 3200);
    }
    function stopPopups(){ if(popTimer) { clearInterval(popTimer); popTimer=null; } }
    function resetPopups(){
      stopPopups();
      slides.forEach(s=> s.querySelectorAll('.kpi-pop').forEach(p=>p.remove()));
      schedulePopups();
    }

    if(carousel){
      carousel.addEventListener('mouseenter', ()=>{ stopAutoplay(); stopPopups(); });
      carousel.addEventListener('mouseleave', ()=>{ startAutoplay(); schedulePopups(); });
      carousel.addEventListener('focusin', ()=>{ stopAutoplay(); stopPopups(); });
      carousel.addEventListener('focusout', ()=>{ startAutoplay(); schedulePopups(); });
    }

    setActive();
    startAutoplay();
    schedulePopups();
  })();

  /* Testimonials Slider */
  (function initTestimonials(){
    const slider = document.querySelector('.testimonial-slider');
    if(!slider) return;
    const slides = slider.querySelectorAll('.slide');
    const prev = slider.querySelector('.prev');
    const next = slider.querySelector('.next');
    const dotsWrap = slider.querySelector('.slider-dots');
    let idx = 0;

    slides.forEach((_,i)=>{
      const b=document.createElement('button');
      b.setAttribute('role','tab');
      b.setAttribute('aria-selected', i===0?'true':'false');
      b.addEventListener('click',()=>go(i));
      dotsWrap.appendChild(b);
    });

    function go(i){
      slides[idx].classList.remove('active');
      dotsWrap.children[idx].setAttribute('aria-selected','false');
      idx=i;
      slides[idx].classList.add('active');
      dotsWrap.children[idx].setAttribute('aria-selected','true');
    }
    prev?.addEventListener('click', ()=> go((idx-1+slides.length)%slides.length));
    next?.addEventListener('click', ()=> go((idx+1)%slides.length));
  })();

  /* Metric Count Animations */
  const metricEls = document.querySelectorAll('.metric-value[data-target]');
  const numObserver = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        animateNumber(entry.target);
        numObserver.unobserve(entry.target);
      }
    });
  },{ threshold:.4 });
  metricEls.forEach(el=> numObserver.observe(el));

  function animateNumber(el){
    const targetRaw = el.getAttribute('data-target') || '';
    const isPercent = targetRaw.includes('%');
    const target = parseFloat(targetRaw.replace(/[^\d.]/g,'')) || 0;
    const dur = 1400;
    const start = performance.now();
    const initialText = targetRaw.match(/[a-zA-Z%]+$/) ? targetRaw.match(/[a-zA-Z%]+$/)[0] : (isPercent ? '%' : '');
    function frame(t){
      const p = Math.min(1,(t-start)/dur);
      const val = Math.round(target * p);
      el.textContent = isPercent ? `${val}%` : val + initialText;
      if(p<1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Contact Form (demo only) */
  const contactForm = document.getElementById('contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', e=>{
      e.preventDefault();
      const status = contactForm.querySelector('.form-status');
      status.textContent = 'Sending...';
      setTimeout(()=>{
        status.textContent='Message received. We will reply shortly.';
        contactForm.reset();
      },1200);
    });
  }

  /* Newsletter */
  const nlForm = document.getElementById('newsletter-form');
  if(nlForm){
    nlForm.addEventListener('submit', e=>{
      e.preventDefault();
      const st = nlForm.querySelector('.nl-status');
      st.textContent='Subscribing...';
      setTimeout(()=>{
        st.textContent='Thanks! Check your inbox.';
        nlForm.reset();
      },1000);
    });
  }
});
