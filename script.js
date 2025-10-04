
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const nav = $('.nav');
const onScrollNav = () => {
  if (window.scrollY > 8) nav.classList.add('shrink');
  else nav.classList.remove('shrink');
};
onScrollNav();
window.addEventListener('scroll', onScrollNav);

$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    const id = a.getAttribute('href');
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
},{ threshold: .16 });

$$('.section, .card, .price-card, .hero-card, .hero-copy h1, .hero-copy p, .cta-row')
  .forEach(el => { el.classList.add('reveal'); io.observe(el); });

const supportsHover = window.matchMedia('(hover:hover)').matches;
if (supportsHover) {
  $$('.card, .price-card').forEach(card=>{
    let rAF = null;
    card.addEventListener('mousemove', (ev)=>{
      const r = card.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - .5;
      const y = (ev.clientY - r.top) / r.height - .5;
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(()=>{
        card.style.transform = `translateY(-4px) rotateX(${y*-6}deg) rotateY(${x*8}deg)`;
      });
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
    });
  });
}

const priceEls = $$('.price');
const toggleBtns = $$('.toggle-btn');
let billing = 'monthly';

const renderPrices = () => {
  priceEls.forEach(p=>{
    const m = Number(p.dataset.monthly);
    const y = Number(p.dataset.yearly); 
    if (billing === 'monthly') {
      p.innerHTML = `${m}<span>/mo</span>`;
    } else {
      const annualTotal = Math.round(y * 12);
      p.innerHTML = `${annualTotal.toLocaleString()}<span>/yr</span>`;
    }
  });
};

toggleBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    billing = btn.dataset.billing;
    toggleBtns.forEach(b => b.setAttribute('aria-pressed', String(b===btn)));
    renderPrices();
  });
});
renderPrices();

const form = $('#contact form');
if (form) {
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const inputs = $$('input[required]', form);
    const invalid = inputs.find(i => !i.value.trim());
    if (invalid) {
      invalid.focus();
      invalid.style.outline = `2px solid var(--brand)`;
      setTimeout(()=> invalid.style.outline = '', 1200);
      return;
    }
    showToast('Thanks! We’ll email you within 24h.');
    form.reset();
  });
}

function showToast(msg){
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> { t.classList.add('hide'); setTimeout(()=> t.remove(), 250); }, 1800);
}
const slider = $('.slider');
if (slider) {
  const track = $('.slides', slider);
  const slides = $$('.slides > *', slider);
  let idx = 0;
  let timer = null;
  const interval = +slider.dataset.interval || 4200;
  const autoplay = slider.dataset.autoplay === 'true';

  const go = (n)=>{
    idx = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx*100}%)`;
    track.style.transition = 'transform .45s ease';
  };
  const next = ()=> go(idx+1);
  const prev = ()=> go(idx-1);

  $('.next', slider)?.addEventListener('click', ()=>{ next(); restart(); });
  $('.prev', slider)?.addEventListener('click', ()=>{ prev(); restart(); });

  const start = ()=> autoplay && (timer = setInterval(next, interval));
  const stop = ()=> timer && clearInterval(timer);
  const restart = ()=> { stop(); start(); };

  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  go(0); start();
}
