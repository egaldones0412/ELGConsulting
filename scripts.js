/**
 * scripts.js v43 — wired to your Calendly + Formspree
 * Features: Year, Mobile nav, Theme toggle, Testimonials, Dynamic pricing, Scroll spy, Header shadow,
 * Booking modal, AJAX contact form, Offer JSON-LD injection
 */
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavToggle();
  initThemeToggle();
  initTestimonialSlider();
  initDynamicPricing();
  initScrollSpy();
  initHeaderScrollState();
  initBookingModal();
  initContactForm();
});

/* Year */
function initYear(){ document.getElementById('year')?.append(new Date().getFullYear()); }

/* Mobile Nav */
function initNavToggle(){
  const toggle = document.querySelector('.nav-toggle');
  const list = document.getElementById('nav-list');
  if(!toggle || !list) return;
  toggle.addEventListener('click', ()=>{
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true':'false');
  });
  list.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      if(list.classList.contains('open')){
        list.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      }
    });
  });
}

/* Theme toggle */
function initThemeToggle(){
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  const stored = localStorage.getItem('theme');
  if(stored){ root.setAttribute('data-theme', stored); sync(stored); }
  else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = prefersDark ? 'dark' : 'light';
    root.setAttribute('data-theme', mode);
    sync(mode);
  }
  btn.addEventListener('click', ()=>{
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    sync(next);
  });
  function sync(mode){
    const dark = mode === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true':'false');
    btn.setAttribute('aria-label', dark ? 'Activate light mode' : 'Activate dark mode');
  }
}

/* Booking Modal */
function initBookingModal(){
  const modal = document.getElementById('bookingModal');
  const openers = [document.getElementById('openBooking'), document.getElementById('openBooking2'), document.getElementById('openBooking3')].filter(Boolean);
  const closeBtn = document.getElementById('closeBooking');
  const frame = document.getElementById('bookingFrame');

  // Your Calendly URL from the screenshot
  const BOOKING_URL = 'https://calendly.com/info_elgconsulting';

  if(!modal || !frame) return;

  openers.forEach(btn=>{
    btn?.addEventListener('click', (e)=>{
      e.preventDefault();
      if(!modal.open){
        frame.src = BOOKING_URL;
        modal.showModal();
      }
    });
  });

  closeBtn?.addEventListener('click', ()=>modal.close());
  modal.addEventListener('close', ()=>{ frame.src = 'about:blank'; });
  modal.addEventListener('click', (e)=>{
    const rect = modal.querySelector('.booking-wrap')?.getBoundingClientRect();
    if(!rect) return;
    const inDialog = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
    if(!inDialog) modal.close();
  });
}

/* Contact Form (Formspree) */
function initContactForm(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form || !status) return;

  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); // try AJAX first

    const endpoint = form.action; // https://formspree.io/f/xvgqywoz
    if(!endpoint.includes('/f/')){
      status.textContent = 'Please configure the contact form endpoint.';
      status.style.color = '#B00020';
      return form.submit();
    }

    status.textContent = 'Sending…';
    status.style.color = '';

    const data = new FormData(form);
    try{
      const res = await fetch(endpoint, {
        method:'POST',
        headers:{ 'Accept':'application/json' },
        body: data
      });
      if(res.ok){
        form.reset();
        status.textContent = 'Thanks! We will reply within 1 business day.';
        status.style.color = 'green';
      } else {
        const msg = await res.json().catch(()=>null);
        status.textContent = (msg && msg.error) ? msg.error : 'Something went wrong. Please email us at info@elgconsulting.works';
        status.style.color = '#B00020';
      }
    } catch {
      status.textContent = 'Network error. Please try again or email us at info@elgconsulting.works';
      status.style.color = '#B00020';
    }
  });
}

/* Testimonials slider */
function initTestimonialSlider(){
  const slider = document.querySelector('.testimonial-slider');
  if(!slider) return;
  const slides = slider.querySelectorAll('.slide');
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  if(!slides.length || !dotsWrap) return;
  let idx=0;
  slides.forEach((_,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.setAttribute('role','tab');
    b.setAttribute('aria-selected',i===0?'true':'false');
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
  prev?.addEventListener('click',()=>go((idx-1+slides.length)%slides.length));
  next?.addEventListener('click',()=>go((idx+1)%slides.length));
}

/* Scroll spy */
function initScrollSpy(){
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  if(!navLinks.length) return;
  const sections = navLinks.map(l=>document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const map = new Map();
  sections.forEach(sec=>map.set(sec.id, navLinks.find(l=>l.getAttribute('href')==='#'+sec.id)));
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        map.forEach(l=>{ l.removeAttribute('aria-current'); l.classList.remove('is-active'); });
        const link = map.get(entry.target.id);
        if(link){ link.setAttribute('aria-current','true'); link.classList.add('is-active'); }
      }
    });
  },{ rootMargin:'-55% 0px -40% 0px', threshold:[0,0.25,0.5,0.75,1] });
  sections.forEach(sec=>observer.observe(sec));
}

/* Header shadow */
function initHeaderScrollState(){
  const header=document.querySelector('.site-header');
  if(!header) return;
  const set=()=>{ window.scrollY>8 ? header.classList.add('scrolled') : header.classList.remove('scrolled'); };
  set(); window.addEventListener('scroll', set, {passive:true});
}

/* Dynamic Pricing + Offer JSON-LD */
function initDynamicPricing(){
  const plansMount = document.getElementById('plansMount');
  const addOnsMount = document.getElementById('addOnsMount');
  const toggleWrap = document.querySelector('.billing-toggle-wrap');
  const toggleButtons = document.querySelectorAll('.billing-toggle');
  const noteEl = document.getElementById('billing-note');
  if(!plansMount || !toggleWrap) return;

  let config=null, currentCycle='monthly';

  fetch('pricing-config.json',{cache:'no-store'})
    .then(r=>{ if(!r.ok) throw new Error('fetch fail'); return r.json(); })
    .then(json=>{ config=json; setup(); })
    .catch(()=>{
      try { config = JSON.parse(document.getElementById('pricing-config-fallback')?.textContent||'{}'); }
      catch { config = { currencySymbol:'$', annualMultiplier:10, plans:[{id:'fallback',name:'Fallback',monthly:500,features:['Feature A','Feature B'],ctaLabel:'Contact',ctaHref:'#contact'}], addOns:[] }; }
      setup();
    });

  function setup(){
    currentCycle = config.defaultCycle || 'monthly';
    toggleWrap.dataset.cycle = currentCycle;
    updateToggleAria();
    renderAll();
    bindToggle();
    window.addEventListener('resize', debounce(()=>renderPlans(true),140));
  }

  function bindToggle(){
    toggleButtons.forEach(btn=>{
      btn.addEventListener('click',()=>{
        const cycle = btn.dataset.cycle;
        if(cycle===currentCycle) return;
        currentCycle = cycle;
        toggleWrap.dataset.cycle = cycle;
        updateToggleAria();
        announceCycle();
        renderPlans(true);
      });
      btn.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const arr=[...toggleButtons];
        let i=arr.indexOf(btn);
        i = e.key==='ArrowRight' ? (i+1)%arr.length : (i-1+arr.length)%arr.length;
        arr[i].focus(); arr[i].click();
      });
    });
  }
  function updateToggleAria(){ toggleButtons.forEach(b=>{ const active=b.dataset.cycle===currentCycle; b.setAttribute('aria-pressed',active?'true':'false'); b.setAttribute('aria-checked',active?'true':'false'); }); }
  function announceCycle(){ if(noteEl) noteEl.textContent = currentCycle==='annual' ? `Annual billing selected – ${(config.annualMultiplier||10)} months paid for 12 months of service.` : 'Monthly billing selected.'; }

  function computePrice(plan){
    if(plan.custom) return { custom:true, label:plan.customLabel||'Custom', amount:null, per:null };
    if(currentCycle==='monthly') return { amount: plan.monthly, per:'/mo', savings:false };
    const mult = config.annualMultiplier || 10;
    return { amount: plan.monthly * mult, per:'/yr', savings:true };
  }
  function formatCurrency(n){ const sym=config.currencySymbol||'$'; return typeof n==='number' ? sym + n.toLocaleString() : n; }
  function isMobile(){ return window.innerWidth < 760; }
  function orderedPlans(){
    const arr = [...(config?.plans||[])];
    if(isMobile()){
      const idx = arr.findIndex(p=>p.popular);
      if(idx>0){ const [pop]=arr.splice(idx,1); arr.unshift(pop); }
    }
    return arr;
  }

  function renderPlans(updateSchema=false){
    if(!config?.plans?.length){ plansMount.innerHTML='<p class="tiny">No plans configured.</p>'; return; }
    plansMount.setAttribute('aria-busy','true');
    const frag=document.createDocumentFragment();
    orderedPlans().forEach(plan=>{
      const pr=computePrice(plan);
      const card=document.createElement('article');
      card.className='plan-card'+(plan.popular?' popular':'');
      card.dataset.plan=plan.id;
      card.innerHTML=`
        ${plan.badge && plan.popular ? `<div class="plan-badge">${escapeHTML(plan.badge)}</div>`:''}
        <div class="plan-head">
          <h3>${escapeHTML(plan.name)}</h3>
          ${plan.popular && plan.popularNote ? `<p class="plan-subnote">${escapeHTML(plan.popularNote)}</p>`:''}
          <p class="plan-price-line">
            ${
              pr.custom
                ? `<span class="amt">${escapeHTML(pr.label)}</span>`
                : `<span class="amt">${escapeHTML(formatCurrency(pr.amount))}</span>
                   <span class="per">${escapeHTML(pr.per)}</span>
                   ${currentCycle==='annual' && pr.savings ? '<span class="savings">Save 2 Months</span>':''}
                   ${currentCycle==='annual' && config.annualLabelAddon ? `<span class="savings alt">${escapeHTML(config.annualLabelAddon)}</span>`:''}`
            }
          </p>
        </div>
        <ul class="plan-features">${(plan.features||[]).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}</ul>
        <div class="plan-cta">
          <a href="${escapeAttr(plan.ctaHref||'#contact')}" class="btn ${plan.ctaVariant==='ghost'?'ghost':'primary'} small full">
            ${escapeHTML(plan.ctaLabel||'Select')}
          </a>
        </div>`;
      frag.appendChild(card);
    });
    plansMount.innerHTML=''; plansMount.appendChild(frag);
    plansMount.setAttribute('aria-busy','false');

    if(updateSchema) injectOfferSchema();
  }

  function renderAddOns(){
    if(!addOnsMount) return;
    addOnsMount.setAttribute('aria-busy','true');
    if(!config?.addOns?.length){ addOnsMount.innerHTML='<p class="tiny center muted">No add‑ons listed.</p>'; addOnsMount.setAttribute('aria-busy','false'); return; }
    const icons={cleanup:'🧹',backmonths:'⏱️',payroll:'👥','kpi-custom':'📊'};
    const frag=document.createDocumentFragment();
    config.addOns.forEach(a=>{
      const d=document.createElement('div'); d.className='addon-card';
      const icon = icons[a.id] || '➕';
      d.innerHTML=`
        <div class="addon-head">
          <div class="addon-icon" aria-hidden="true">${icon}</div>
          <h4 class="addon-name">${escapeHTML(a.name)}</h4>
          <span class="addon-price">${escapeHTML(a.pricing||'Quoted')}</span>
        </div>
        <p class="addon-desc">${escapeHTML(a.description||'')}</p>`;
      frag.appendChild(d);
    });
    addOnsMount.innerHTML=''; addOnsMount.appendChild(frag);
    addOnsMount.setAttribute('aria-busy','false');
  }

  function renderAll(){ renderPlans(true); renderAddOns(); announceCycle(); }

  // Offer JSON-LD
  function injectOfferSchema(){
    try{
      document.querySelectorAll('script[data-scope="offers"]').forEach(n=>n.remove());
      const offers = (config.plans||[]).filter(p=>!p.custom).map(p=>{
        const monthly = p.monthly;
        const annualTotal = monthly * (config.annualMultiplier||10);
        return [
          {
            "@type":"Offer",
            "name":`${p.name} (Monthly)`,
            "price": monthly,
            "priceCurrency": "USD",
            "url":"https://www.elgconsulting.works/#pricing",
            "availability":"https://schema.org/InStock"
          },
          {
            "@type":"Offer",
            "name":`${p.name} (Annual)`,
            "price": annualTotal,
            "priceCurrency": "USD",
            "url":"https://www.elgconsulting.works/#pricing",
            "availability":"https://schema.org/InStock"
          }
        ];
      }).flat();

      const data = {
        "@context":"https://schema.org",
        "@type":"Service",
        "name":"ELG Consulting Bookkeeping Services",
        "url":"https://www.elgconsulting.works/",
        "offers": offers
      };
      const s = document.createElement('script');
      s.type='application/ld+json';
      s.dataset.scope='offers';
      s.textContent = JSON.stringify(data);
      document.body.appendChild(s);
    }catch{}
  }

  function escapeHTML(str){ return (str||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(str){ return escapeHTML(str); }
  function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
}
