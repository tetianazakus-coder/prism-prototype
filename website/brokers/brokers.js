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
    field.value = path.getAttribute('aria-label').replace(/^Explore /, '');
  }
  paths.forEach(path => {
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
