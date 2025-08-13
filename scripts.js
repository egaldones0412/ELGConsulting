/**
 * scripts.js v40
 * Features:
 *  - Dynamic year
 *  - Mobile navigation
 *  - Theme toggle (replica)
 *  - Testimonial slider
 *  - Dynamic pricing (monthly/annual toggle, popular plan animation, add-ons)
 */

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavToggle();
  initThemeToggle();
  initTestimonialSlider();
  initDynamicPricing();
});

/* Year */
function initYear(){
  const el = document.getElementById('year');
  if(el) el.textContent = new Date().getFullYear();
}

/* Mobile nav */
function initNavToggle(){
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if(!navToggle || !navList) return;
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true':'false');
  });
}

/* Theme toggle */
function initThemeToggle(){
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if(!btn) return;
  const stored = localStorage.getItem('theme');
  if(stored){
    root.setAttribute('data-theme', stored);
    sync(stored);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = prefersDark ? 'dark':'light';
    root.setAttribute('data-theme', mode);
    sync(mode);
  }
  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    sync(next);
  });
  function sync(mode){
    const dark = mode === 'dark';
    btn.setAttribute('aria-pressed', dark ? 'true':'false');
    btn.setAttribute('aria-label', dark ? 'Activate light mode':'Activate dark mode');
  }
}

/* Testimonial slider */
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
  prev?.addEventListener('click',()=>go((idx-1+slides.length)%slides.length));
  next?.addEventListener('click',()=>go((idx+1)%slides.length));
}

/* Dynamic Pricing */
function initDynamicPricing(){
  const plansMount = document.getElementById('plansMount');
  const addOnsMount = document.getElementById('addOnsMount');
  const toggleWrap = document.querySelector('.billing-toggle-wrap');
  const toggleButtons = document.querySelectorAll('.billing-toggle');
  const noteEl = document.getElementById('billing-note');
  if(!plansMount || !toggleWrap) return;

  let config=null;
  let currentCycle='monthly';

  fetch('pricing-config.json',{cache:'no-store'})
    .then(r=>{ if(!r.ok) throw new Error('fetch fail'); return r.json(); })
    .then(json=>{ config=json; setup(); })
    .catch(()=>{
      try {
        const raw = document.getElementById('pricing-config-fallback')?.textContent || '{}';
        config = JSON.parse(raw);
      } catch {
        config = {
          currencySymbol:'$',
            annualMultiplier:10,
          plans:[{id:'fallback',name:'Fallback',monthly:500,features:['Feature A','Feature B'],ctaLabel:'Contact',ctaHref:'#contact'}],
          addOns:[]
        };
      }
      setup();
    });

  function setup(){
    currentCycle = config.defaultCycle || 'monthly';
    toggleWrap.dataset.cycle = currentCycle;
    updateToggleAria();
    renderAll();
    bindToggle();
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
        renderPlans();
      });
      btn.addEventListener('keydown',e=>{
        if(!['ArrowLeft','ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const arr = Array.from(toggleButtons);
        let i = arr.indexOf(btn);
        if(e.key==='ArrowRight') i=(i+1)%arr.length;
        else i=(i-1+arr.length)%arr.length;
        arr[i].focus();
        arr[i].click();
      });
    });
  }

  function updateToggleAria(){
    toggleButtons.forEach(b=>{
      const active = b.dataset.cycle===currentCycle;
      b.setAttribute('aria-pressed',active?'true':'false');
      b.setAttribute('aria-checked',active?'true':'false');
    });
  }

  function announceCycle(){
    if(!noteEl) return;
    noteEl.textContent = currentCycle==='annual'
      ? `Annual billing selected. Equivalent to ${(config.annualMultiplier||10)} months paid for 12 months of service.`
      : 'Monthly billing selected.';
  }

  function computePrice(plan){
    if(plan.custom) return { label:plan.customLabel||'Custom', custom:true };
    if(currentCycle==='monthly') {
      return { amount: plan.monthly, per:'/mo', savings:false };
    }
    const mult = config.annualMultiplier || 10;
    return { amount: plan.monthly * mult, per:'/yr', savings:true };
  }

  function formatCurrency(n){
    const sym = config.currencySymbol || '$';
    if(typeof n!=='number') return n;
    return sym + n.toLocaleString();
  }

  function renderPlans(){
    if(!config?.plans?.length){
      plansMount.innerHTML = '<p class="tiny">No plans configured.</p>';
      return;
    }
    plansMount.setAttribute('aria-busy','true');
    const frag=document.createDocumentFragment();
    config.plans.forEach(plan=>{
      const pr = computePrice(plan);
      const card=document.createElement('article');
      card.className='plan-card'+(plan.popular?' popular':'');
      card.setAttribute('data-plan',plan.id);
      card.innerHTML=`
        ${plan.badge && plan.popular ? `<div class="plan-badge">${escapeHTML(plan.badge)}</div>`:''}
        <div class="plan-head">
          <h3>${escapeHTML(plan.name)}</h3>
          <p class="plan-price-line">
            ${ pr.custom
              ? `<span class="amt">${escapeHTML(pr.label)}</span>`
              : `<span class="amt">${escapeHTML(formatCurrency(pr.amount))}</span><span class="per">${escapeHTML(pr.per)}</span>
                 ${ currentCycle==='annual' && pr.savings ? '<span class="savings">Save 2 Months</span>' : '' }
                 ${ currentCycle==='annual' && config.annualLabelAddon ? `<span class="savings alt">${escapeHTML(config.annualLabelAddon)}</span>`:'' }`
            }
          </p>
        </div>
        <ul class="plan-features">
          ${(plan.features||[]).map(f=>`<li>${escapeHTML(f)}</li>`).join('')}
        </ul>
        <div class="plan-cta">
          <a href="${escapeAttr(plan.ctaHref||'#contact')}" class="btn ${plan.ctaVariant==='ghost'?'ghost':'primary'} small full">
            ${escapeHTML(plan.ctaLabel||'Select')}
          </a>
        </div>
      `;
      frag.appendChild(card);
    });
    plansMount.innerHTML='';
    plansMount.appendChild(frag);
    plansMount.setAttribute('aria-busy','false');
  }

  function renderAddOns(){
    if(!addOnsMount) return;
    addOnsMount.setAttribute('aria-busy','true');
    if(!config?.addOns?.length){
      addOnsMount.innerHTML='<p class="tiny center muted">No add‑ons listed.</p>';
      addOnsMount.setAttribute('aria-busy','false');
      return;
    }
    const frag=document.createDocumentFragment();
    config.addOns.forEach(a=>{
      const card=document.createElement('div');
      card.className='addon-card';
      card.innerHTML=`
        <div class="addon-head">
          <h4 class="addon-name">${escapeHTML(a.name)}</h4>
          <span class="addon-price">${escapeHTML(a.pricing||'Quoted')}</span>
        </div>
        <p class="addon-desc">${escapeHTML(a.description||'')}</p>
      `;
      frag.appendChild(card);
    });
    addOnsMount.innerHTML='';
    addOnsMount.appendChild(frag);
    addOnsMount.setAttribute('aria-busy','false');
  }

  function renderAll(){
    renderPlans();
    renderAddOns();
    announceCycle();
  }

  function escapeHTML(str){
    return (str||'').replace(/[&<>"']/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function escapeAttr(str){ return escapeHTML(str); }

  // Expose for debugging
  window.__pricing = {
    getConfig:()=>config,
    setCycle:(c)=>{ if(['monthly','annual'].includes(c)){ currentCycle=c; toggleWrap.dataset.cycle=c; updateToggleAria(); renderPlans(); announceCycle(); } },
    rerender:renderAll
  };
}

/* End scripts.js v40 */
