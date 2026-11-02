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
  function notice(title, message) {
    $('#notice-title').textContent = title;
    $('#notice-body').textContent = message;
    openDialog($('#notice-dialog'));
  }
  // Sign-up and booking CTAs are plain links since 2 Nov (Tanya: "analyze where which of the buttons should lead, and link it
  // correctly"), no longer preview notices. Every Start free trial button and Log in open the redesign prototype
  // (Tanya, 2 Nov: "link some buttons to updated design from prototype"): #/auth/signup/broker, whose Start your search
  // lands on #/auth/trial, "Your 14 days of Accelerator start now — no card needed", and #/auth/login. The prototype has no
  // Essential or Pro sign-up (its trial assigns Accelerator and lets no plan be chosen), so those two plan cards go to the
  // product's broker sign-up, /signup?role=BROKER&plan=<essential|pro>_license, the deep link the live site uses (its
  // territory "Lock-In Your License" opens plan=pro_license); the form pre-selects the plan and skips its role step. Pro
  // also passes billing=annual while Annual is selected (the form reads only "annual"; monthly is its default). Book a
  // call opens the team's discovery-call calendar, the one the live site links.
  // Destinations with no page yet (Broker Agreement) still open the notice.
  $$('[data-unavailable]').forEach(button => button.addEventListener('click', () => notice(button.dataset.unavailable, 'This destination is part of the new website structure and is not included in this local preview. Its approved page or URL must be connected before launch.')));
  $$('[data-territory]').forEach(button => button.addEventListener('click', () => openDialog($('#inquiry-dialog'))));
  // The walkthrough's full-screen button (an icon on the frame since 2 Nov, was a "View full screen" text link). Where
  // screens.js has drawn the live screens, the whole stage (tabs and screen) goes full screen and the player keeps
  // running, rescaled by its ResizeObserver. Where the browser has no element full screen (iPhone Safari) or the
  // screens stayed as images, the selected chapter's screenshot opens in the dialog as before.
  $$('[data-enlarge]').forEach(button => button.addEventListener('click', () => {
    const stage = button.closest('.walk-stage');
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (document.fullscreenEnabled && stage.querySelector('.ps-live')) { stage.requestFullscreen(); return; }
    const screen = $('.walk-panel:not([hidden]) .screen', stage);
    $('#enlarged-screen').src = screen.dataset.src;
    $('#enlarged-screen').alt = screen.getAttribute('aria-label') || $('img', screen)?.alt || '';
    openDialog($('#screen-dialog'));
  }));
  document.addEventListener('fullscreenchange', () => $$('[data-enlarge]').forEach(button => {
    const label = document.fullscreenElement ? 'Exit full screen' : 'View full screen';
    button.setAttribute('aria-label', label);
    button.title = label;
    // Lucide minimize-2 in full screen, maximize-2 outside it
    $('path', button).setAttribute('d', document.fullscreenElement ? 'M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7' : 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7');
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
  const verticalTabs = matchMedia('(min-width:851px)');
  function syncTabOrientation() { $('.walk-tabs').setAttribute('aria-orientation', verticalTabs.matches ? 'vertical' : 'horizontal'); }
  verticalTabs.addEventListener('change', syncTabOrientation);
  syncTabOrientation();
  function activateTab(index, focus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.hidden = i !== index;
      panel.classList.toggle('tab-enter', i === index);
    });
    if (focus) tabs[index].focus();
    // screens.js plays the chosen chapter of the walkthrough
    $('.walk-stage').dispatchEvent(new CustomEvent('walk:select', {detail: index}));
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
    $$('[data-billed]').forEach(link => {
      const url = new URL(link.href);
      if (billing === 'annual') url.searchParams.set('billing', 'annual'); else url.searchParams.delete('billing');
      link.href = url;
    });
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
    $('#inquiry-status').textContent = `Inquiry ready for review: ${data.get('states')} · ${data.get('assets')}. Not sent. Delivery is not connected in this preview. Book a call to discuss your territory.`;
  });
  $('#newsletter-form').addEventListener('submit', event => {
    event.preventDefault();
    $('#newsletter-status').textContent = 'Not subscribed. Newsletter delivery is not connected in this preview.';
  });
  // Scroll reveals live in motion.js.
})();

// Territory map: a state picked on the map is marked and carried into the inquiry form.
(() => {
  const paths = [...document.querySelectorAll('.territory-map [data-state]')];
  const field = document.querySelector('#territory-form [name="states"]');
  function chooseState(path) {
    paths.forEach(other => {
      other.classList.toggle('selected', other === path);
      other.setAttribute('aria-pressed', String(other === path));
    });
    field.value = path.getAttribute('aria-label').replace(/^Explore /, '').replace(/ \(available\)$/, '');
  }
  // Hover label (Tanya, 2 Nov: "show state name on hover"): the state's name and whether it is open, in a paper tag
  // that follows the pointer, or sits over the state on keyboard focus. It replaces the browser's slow <title>
  // tooltip, so those titles are lifted out here; without script they still show.
  const figure = document.querySelector('.territory-map');
  const tip = document.createElement('div');
  tip.className = 'map-tip'; tip.setAttribute('aria-hidden', 'true'); tip.hidden = true;
  figure.append(tip);
  const showTip = (path, x, y) => {
    const box = figure.getBoundingClientRect();
    tip.innerHTML = `${path.dataset.name}<span>${path.classList.contains('available') ? 'Available' : 'Taken'}</span>`;
    tip.style.left = `${x - box.left}px`; tip.style.top = `${y - box.top}px`; tip.hidden = false;
  };
  paths.forEach(path => {
    const title = path.querySelector('title');
    path.dataset.name = title.textContent; title.remove();
    path.addEventListener('pointermove', event => { if (event.pointerType === 'mouse') showTip(path, event.clientX, event.clientY); });
    path.addEventListener('pointerleave', () => { tip.hidden = true; });
    path.addEventListener('focus', () => { if (!path.matches(':focus-visible')) return; const r = path.getBoundingClientRect(); showTip(path, r.left + r.width / 2, r.top + r.height / 2); });
    path.addEventListener('blur', () => { tip.hidden = true; });
    path.addEventListener('click', () => chooseState(path));
    path.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); chooseState(path); }
    });
  });
})();
(() => {
  const track = document.querySelector('.quote-track');
  if (!track) return;
  const [prev, next] = document.querySelectorAll('.quote-arrows button');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const step = () => track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap);
  const sync = () => {
    prev.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 2;
  };
  [prev, next].forEach(button => button.addEventListener('click', () =>
    track.scrollBy({left: step() * button.dataset.step, behavior: reduce.matches ? 'auto' : 'smooth'})));
  track.addEventListener('scroll', sync, {passive: true});
  addEventListener('resize', sync);
  sync();
})();
