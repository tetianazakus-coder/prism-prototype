(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Native dialogs handle focus trapping, Escape and focus restoration.
  function openDialog(dialog) {
    dialog.showModal();
    document.body.classList.add('modal-open');
  }
  $$('dialog').forEach(dialog => {
    $$('[data-close]', dialog).forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  function notice(title, message, booking = false) {
    $('#notice-title').textContent = title;
    $('#notice-body').textContent = message;
    $('#booking-link').hidden = !booking;
    openDialog($('#notice-dialog'));
  }
  $$('[data-signup]').forEach(button => button.addEventListener('click', () => {
    const plan = button.dataset.signup;
    notice(`${plan} is your next step.`, 'This is a preview of the new broker experience. Enrollment for these revised plans is not connected yet. No account has been created and no trial has started. You can speak with the team through their existing calendar.', true);
  }));
  $$('[data-book]').forEach(button => button.addEventListener('click', () => notice('Meet the team.', 'The new 20-minute booking option is awaiting setup. You can use the team’s existing discovery-call calendar; it may offer a different duration. Check the duration before booking.', true)));
  $$('[data-unavailable]').forEach(button => button.addEventListener('click', () => notice(button.dataset.unavailable, 'This destination is part of the new website structure and is not included in this local preview. Its approved page or URL must be connected before launch.')));
  $$('[data-territory]').forEach(button => button.addEventListener('click', () => openDialog($('#inquiry-dialog'))));
  $$('[data-enlarge]').forEach(button => button.addEventListener('click', () => {
    const sourceImage = button.closest('figure').querySelector('img');
    $('#enlarged-screen').src = button.dataset.enlarge;
    $('#enlarged-screen').alt = sourceImage.alt;
    openDialog($('#screen-dialog'));
  }));

  const menu = $('#navigation');
  const menuButton = $('.menu-toggle');
  function closeMenu() { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  $$('a,button', menu).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const solutions = $('.solutions');
    if (solutions.open) { solutions.open = false; $('summary', solutions).focus(); }
    if (menu.classList.contains('open')) { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.solutions')) $('.solutions').open = false;
    if (!event.target.closest('.site-header')) closeMenu();
  });
  matchMedia('(min-width:901px)').addEventListener('change', closeMenu);

  const tabs = $$('.walk-tabs [role=tab]');
  const verticalTabs = matchMedia('(min-width:761px)');
  function syncTabOrientation() { $('.walk-tabs').setAttribute('aria-orientation', verticalTabs.matches ? 'vertical' : 'horizontal'); }
  verticalTabs.addEventListener('change', syncTabOrientation);
  syncTabOrientation();
  function activateTab(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    });
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === (verticalTabs.matches ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % tabs.length;
      if (event.key === (verticalTabs.matches ? 'ArrowUp' : 'ArrowLeft')) next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); activateTab(next, true); }
    });
  });

  const rates = { annual: {accelerator:159, pro:399}, monthly:{accelerator:199, pro:499} };
  $$('[data-billing]').forEach(button => button.addEventListener('click', () => {
    const billing = button.dataset.billing;
    $$('[data-billing]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    Object.entries(rates[billing]).forEach(([plan, price]) => {
      $(`[data-price="${plan}"]`).textContent = `$${price}`;
      $(`[data-note="${plan}"]`).textContent = billing === 'annual'
        ? `$${(price * 12).toLocaleString('en-US')} billed annually · $${rates.monthly[plan]} monthly`
        : `Billed monthly · $${rates.annual[plan]}/month on annual billing`;
    });
    $('#billing-announcement').textContent = `${billing === 'annual' ? 'Annual' : 'Monthly'} billing. Accelerator $${rates[billing].accelerator} per month. Pro $${rates[billing].pro} per month.`;
  }));

  // Local preview only: no network, browser storage, or pretend submission success.
  $('#territory-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    $('#inquiry-status').textContent = `Inquiry ready for review: ${data.get('states')} · ${data.get('assets')}. Not sent. Delivery is not connected in this preview. Use the team calendar below to discuss your territory.`;
  });
  $('#newsletter-form').addEventListener('submit', event => {
    event.preventDefault();
    $('#newsletter-status').textContent = 'Not subscribed. Newsletter delivery is not connected in this preview.';
  });
})();

(() => {
  const select = document.querySelector('#state-select');
  const paths = [...document.querySelectorAll('[data-state]')];
  function chooseState(code) {
    select.value = code;
    paths.forEach(path => {
      path.classList.toggle('selected', path.dataset.state === code);
      path.setAttribute('aria-pressed', String(path.dataset.state === code));
    });
    const name = select.selectedOptions[0].textContent;
    document.querySelector('#state-status').textContent = code
      ? `${name} selected. Illustrative only — contact our team to confirm availability by asset class.`
      : 'Illustrative only. Availability is confirmed by our team.';
    document.querySelector('#territory-form [name="states"]').value = code ? name : '';
  }
  select.addEventListener('change', () => chooseState(select.value));
  paths.forEach(path => {
    path.addEventListener('click', () => chooseState(path.dataset.state));
    path.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseState(path.dataset.state); }
    });
  });
})();

(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min=0, max=1) => Math.max(min, Math.min(max, value));
  const hero = document.querySelector('.hero');
  const heroPin = document.querySelector('.hero-pin');
  const photo = document.querySelector('.city-film');
  const mask = document.querySelector('.brand-mask');
  let maskSize = '';
  function resizeMask() {
    const w = heroPin.clientWidth, h = heroPin.clientHeight;
    const size = `${w} ${h}`;
    if (maskSize === size) return;
    maskSize = size;
    mask.setAttribute('viewBox', `0 0 ${w} ${h}`);
    mask.querySelectorAll('rect').forEach(rect => {rect.setAttribute('width', w);rect.setAttribute('height', h);});
    const text = mask.querySelector('text');
    text.setAttribute('x', w/2);text.setAttribute('y', h*(w<=760?.58:.64));
    text.setAttribute('font-size', w*.205);text.setAttribute('letter-spacing', -w*.013);
  }
  let queued = false;
  function draw() {
    queued = false;
    const vh = innerHeight;
    resizeMask();
    const progress = reduce.matches ? 0 : clamp(-hero.getBoundingClientRect().top / Math.max(1,hero.offsetHeight-heroPin.offsetHeight));
    const baseY = innerWidth <= 760 ? 255 : 230;
    hero.style.setProperty('--building-y', `${baseY*(1-clamp(progress*2))}px`);
    hero.style.setProperty('--building-scale', 1 + progress*.12);
    hero.style.setProperty('--hero-opacity', 1-clamp(progress*3.5));
    hero.style.setProperty('--hero-y', `${-progress*160}px`);
    hero.style.setProperty('--mask-opacity', clamp((progress-.32)/.42));
    const photoRect = photo.getBoundingClientRect();
    if (!reduce.matches && photoRect.bottom>0 && photoRect.top<vh) photo.style.setProperty('--photo-y',`${-5-clamp((vh-photoRect.top)/(vh+photoRect.height))*9}%`);
  }
  function update(){if(!queued){queued=true;requestAnimationFrame(draw);}}
  // Wheel smoothing as on the reference: Lenis 1.3.17 at its defaults (lerp 0.1; touch stays native).
  // Effects draw in the frame Lenis moves the page, not one frame behind. Dialogs keep native scroll.
  // With GSAP loaded (motion.js), its ticker drives Lenis and ScrollTrigger reads every Lenis frame, as on the reference.
  let lenis = window.Lenis && !reduce.matches ? new Lenis({autoRaf:!window.gsap, prevent:node=>node.closest('dialog')}) : null;
  if (lenis) lenis.on('scroll',draw); else addEventListener('scroll',update,{passive:true});
  if (lenis && window.gsap) {
    gsap.ticker.add(time=>{if (lenis) lenis.raf(time*1000);});
    gsap.ticker.lagSmoothing(0);
    if (window.ScrollTrigger) lenis.on('scroll',ScrollTrigger.update);
  }
  addEventListener('resize',update);
  reduce.addEventListener('change',()=>{
    if (reduce.matches && lenis) {lenis.destroy();lenis=null;addEventListener('scroll',update,{passive:true});}
    update();
  });
  document.fonts.ready.then(update);
  draw();

  document.querySelectorAll('.service-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const opening=button.getAttribute('aria-expanded')!=='true';
      document.querySelectorAll('.service-toggle').forEach(other=>{
        const open=other===button && opening;
        other.setAttribute('aria-expanded',String(open));
        document.getElementById(other.getAttribute('aria-controls')).hidden=!open;
      });
      requestAnimationFrame(() => button.scrollIntoView({block: 'nearest', behavior: reduce.matches ? 'instant' : 'smooth'}));
      update();
    });
  });
  document.querySelectorAll('[data-quote]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-quote]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
    document.querySelectorAll('[data-slide]').forEach(slide=>slide.hidden=slide.dataset.slide!==button.dataset.quote);
  }));
})();
