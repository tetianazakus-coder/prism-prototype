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
  matchMedia('(min-width:851px)').addEventListener('change', closeMenu);

  const tabs = $$('.walk-tabs [role=tab]');
  const verticalTabs = matchMedia('(max-width:0px)');
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

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-ready');
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('seen'); reveal.unobserve(entry.target); }
    }), {threshold:.08});
    $$('.reveal').forEach(element => reveal.observe(element));
  }
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
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const image = document.querySelector('.hero-image img');
  let queued = false;
  function updateParallax() {
    if (!queued) {
      queued = true;
      requestAnimationFrame(() => {
        const distance = Math.min(window.scrollY, hero.offsetHeight);
        image.style.setProperty('--parallax', motion.matches ? '0px' : `${distance * .16}px`);
        queued = false;
      });
    }
  }
  window.addEventListener('scroll', updateParallax, {passive:true});
  motion.addEventListener('change', updateParallax);
  updateParallax();
  const bars = document.querySelector('.quote-bars');
  if (bars) {
    const buttons = [...bars.querySelectorAll('[data-quote]')];
    const stage = document.querySelector('.quote-stage');
    const show = button => {
      buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      stage.querySelectorAll('.quote-slide').forEach(slide => slide.hidden = slide.dataset.slide !== button.dataset.quote);
    };
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => show(button));
      button.querySelector('span').addEventListener('animationend', () => show(buttons[(i + 1) % buttons.length]));
    });
    // The bar fill is the timer: it only runs while the section is on screen and motion is allowed.
    new IntersectionObserver(([entry]) => {
      const playing = entry.isIntersecting && !motion.matches;
      bars.classList.toggle('is-playing', playing);
      stage.setAttribute('aria-live', playing ? 'off' : 'polite');
    }, {threshold: .35}).observe(bars.closest('section'));
  }
})();

// Scroll motion: headings split into masked lines, photo wipes and drift, count-ups, staggered lists,
// drawn section rules and the map sweep. The CSS for each lives at the end of type.css.
(() => {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('motion-ready');
  const targets = [];

  // Each <br>-separated run becomes .line > span, keeping inline markup such as <em>. A heading whose
  // <br>s are hidden by CSS reflows as prose, so it stays one masked block.
  document.querySelectorAll('section h2, .pillar h3').forEach(heading => {
    const br = heading.querySelector('br');
    const groups = [[]];
    [...heading.childNodes].forEach(node => {
      if (node.nodeName === 'BR' && getComputedStyle(br).display !== 'none') groups.push([]);
      else if (node.nodeName !== 'BR') groups[groups.length - 1].push(node);
    });
    heading.textContent = '';
    groups.forEach((nodes, i) => {
      const line = document.createElement('span');
      const inner = document.createElement('span');
      line.className = 'line';
      inner.style.setProperty('--i', i);
      inner.append(...nodes);
      line.append(inner);
      heading.append(line);
    });
    heading.classList.add('split');
    targets.push(heading);
  });

  document.querySelectorAll('.pillar .feature-list, .execution-visual ol').forEach(list => {
    list.classList.add('stagger');
    [...list.children].forEach((item, i) => item.style.setProperty('--i', i));
    targets.push(list);
  });

  // The animated digits are hidden from screen readers; an .sr-only twin carries the real figure.
  const counters = new Map();
  document.querySelectorAll('.proof strong, .photo-stat, .fee strong, .annual-cost strong').forEach(element => {
    const text = [...element.childNodes].find(node => node.nodeType === 3 && /\d/.test(node.nodeValue));
    const match = text && text.nodeValue.match(/^(\D*)([\d,]+)(.*)$/s);
    if (!match) return;
    const value = Number(match[2].replace(/,/g, ''));
    const digits = document.createElement('span');
    const twin = document.createElement('span');
    digits.className = 'count';
    digits.setAttribute('aria-hidden', 'true');
    digits.textContent = match[1] + '0' + match[3];
    twin.className = 'sr-only';
    twin.textContent = text.nodeValue;
    text.replaceWith(digits, twin);
    counters.set(element, {digits, value, before: match[1], after: match[3]});
    targets.push(element);
  });
  const count = ({digits, value, before, after}) => {
    const start = performance.now();
    const tick = now => {
      const t = Math.min((now - start) / 1600, 1);
      digits.textContent = before + Math.round(value * (1 - Math.pow(2, -10 * t))).toLocaleString('en-US') + after;
      if (t < 1) requestAnimationFrame(tick);
      else digits.textContent = before + value.toLocaleString('en-US') + after;
    };
    requestAnimationFrame(tick);
  };

  const map = document.querySelector('.territory-map svg');
  if (map) {
    const paths = [...map.querySelectorAll('path')];
    const boxes = paths.map(path => path.getBBox());
    const left = Math.min(...boxes.map(box => box.x));
    const span = Math.max(...boxes.map(box => box.x + box.width)) - left;
    paths.forEach((path, i) => path.style.setProperty('--d', ((boxes[i].x - left) / span).toFixed(3)));
  }

  targets.push(...document.querySelectorAll('.chapter-photo, .quote-stage, .execution, .final, .economics-scale, .section-label, .territory-map'));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    if (counters.has(entry.target)) count(counters.get(entry.target));
    observer.unobserve(entry.target);
  }), {threshold: .2, rootMargin: '0px 0px -8% 0px'});
  targets.forEach(target => observer.observe(target));

  // Photo drift: each chapter image moves up to 6% of its frame height against the scroll. It eases a tenth
  // of the way to its target each frame, so a mouse wheel's 100px steps glide instead of jumping.
  const photos = [...document.querySelectorAll('.chapter-photo')].map(frame => ({frame, image: frame.querySelector('img'), current: null}));
  let running = false;
  const drift = () => {
    let moving = false;
    photos.forEach(photo => {
      const box = photo.frame.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (box.top + box.height / 2 - innerHeight / 2) / innerHeight));
      const target = progress * box.height * .06;
      photo.current = photo.current === null ? target : photo.current + (target - photo.current) * .1;
      if (Math.abs(target - photo.current) > .1) moving = true;
      else photo.current = target;
      photo.image.style.setProperty('--drift', `${photo.current.toFixed(2)}px`);
    });
    running = moving;
    if (moving) requestAnimationFrame(drift);
  };
  const start = () => { if (!running) { running = true; requestAnimationFrame(drift); } };
  addEventListener('scroll', start, {passive: true});
  addEventListener('resize', start);
  drift();
})();
