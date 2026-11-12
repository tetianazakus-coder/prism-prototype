/* Behaviour every Editorial page shares: dialogs and the preview notice, the header menu and
   Solutions dropdown, the billing toggle, the inquiry and newsletter forms, tabs, and the testimonial carousel. Split on
   2 Nov from brokers/brokers.js, which keeps the walkthrough; openDialog is shared with it as
   LenderPrism.openDialog. Load it before the page's own script. */
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

  // Header menu and Solutions dropdown. The /lp/broker header has neither (no top nav on the ad landing).
  const menu = $('#navigation');
  const menuButton = $('.menu-toggle');
  const solutions = $('.solutions');
  if (menu && menuButton && solutions) {
    function closeMenu() { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    $$('a,button', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (solutions.open) { solutions.open = false; $('summary', solutions).focus(); }
      if (menu.classList.contains('open')) { closeMenu(); menuButton.focus(); }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.solutions')) solutions.open = false;
      if (!event.target.closest('.site-header')) closeMenu();
    });
    matchMedia('(min-width:851px)').addEventListener('change', closeMenu);
  }

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
      $(`[data-note="${plan}"]`).innerHTML = billing === 'annual'
        ? `When billed annually and paid in full<br>$${(price * 12).toLocaleString('en-US')} a year`
        : `Billed monthly`;
    });
    $('#billing-announcement').textContent = `${billing === 'annual' ? 'Annual' : 'Monthly'} billing. Accelerator $${rates[billing].accelerator} per month. Pro $${rates[billing].pro} per month.`;
  }));

  // Brokers' ROI section: Accelerator or Pro against the same $50,000 fee (Tony, Figma comment: "Can we alternate or toggle
  // between Accelerator and Pro?"; Tanya, 12 Nov: "buils opt A"). The section's data-plan picks which words show
  // (brokers-editorial.css); this sets it, the pressed state, the figure's label and a line for screen readers.
  const roiPlans = {accelerator: ['Accelerator', '1,908', 26], pro: ['Pro', '4,788', 10]};
  $$('[data-roi]').forEach(section => section.querySelectorAll('[data-roi-plan]').forEach(button => button.addEventListener('click', () => {
    const [name, cost, years] = roiPlans[button.dataset.roiPlan];
    section.dataset.plan = button.dataset.roiPlan;
    section.querySelectorAll('[data-roi-plan]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    section.querySelector('.economics-scale').setAttribute('aria-label', `Illustrative gross origination fee of 50,000 dollars compared with annual ${name} cost of ${cost} dollars`);
    section.querySelector('[data-roi-status]').textContent = `${name}: $${cost} a year. One closed deal covers about ${years} years.`;
  })));

  // Local preview only: no network, browser storage, or pretend submission success.
  $('#contact-form')?.addEventListener('submit', event => {
    event.preventDefault();
    $('#contact-status').textContent = 'Message ready for review. Not sent. Delivery is not connected in this preview.';
  });
  $('#newsletter-form').addEventListener('submit', event => {
    event.preventDefault();
    $('#newsletter-status').textContent = 'Not subscribed. Newsletter delivery is not connected in this preview.';
  });
  // Get notified (Borrowers, Lenders): the doc's success line shows, marked as a preview. Nothing is sent or stored.
  $$('[data-notify]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    $('.notify-status', form).textContent = `${form.dataset.notify} Preview only: nothing was sent.`;
  }));
  // Tabs (the Brokers walkthrough, and any other tablist): arrow keys follow the list's aria-orientation, which
  // a page may switch with the layout; Home and End jump to the ends. The list announces each choice as tabs:select.
  $$('[role=tablist]').forEach(list => {
    const tabs = $$('[role=tab]', list);
    function activateTab(index, focus = false) {
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        panel.hidden = i !== index;
        panel.classList.toggle('tab-enter', i === index);
      });
      if (focus) tabs[index].focus();
      list.dispatchEvent(new CustomEvent('tabs:select', {detail: index, bubbles: true}));
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activateTab(index));
      tab.addEventListener('keydown', event => {
        const vertical = list.getAttribute('aria-orientation') === 'vertical';
        let next;
        if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) next = (index + 1) % tabs.length;
        if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) next = (index + tabs.length - 1) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (next !== undefined) { event.preventDefault(); activateTab(next, true); }
      });
    });
  });
  // Home's "Built for every side": one side open at a time, each a disclosure button over its region, and the open
  // side's screen shows beside the list. Pressing the open side keeps it open, so a screen always shows.
  $$('[data-sides]').forEach(list => {
    const buttons = $$('button[aria-controls]', list);
    buttons.forEach(button => button.addEventListener('click', () => buttons.forEach(other => {
      const open = other === button;
      other.setAttribute('aria-expanded', String(open));
      // Closed regions stay rendered so they can fold shut (home.css); inert keeps them out of focus and the
      // accessibility tree, as hidden did.
      document.getElementById(other.getAttribute('aria-controls')).inert = !open;
    })));
  });
  // Scroll reveals live in motion.js.
  window.LenderPrism = {openDialog};
})();

// Home's three content stages, from Tony's Figma comments (about 6 Nov). 1, at launch: the approach band alone. 2, once
// there are closed deals to post: the closed transactions join it. 3, once there are testimonials too: the testimonials
// join, and the approach band, there only "until we have testimonials and tombstones", goes. Each band lists the states
// it shows in (data-states); the markup is stage 1, and ?stage=2 or ?stage=3 in the address previews the others.
// This runs before motion.js measures anything.
const homeStage = new URLSearchParams(location.search).get('stage');
if (homeStage) document.querySelectorAll('[data-states]').forEach(band => {
  band.hidden = !band.dataset.states.split(' ').includes(homeStage);
});

// Arrow carousels (testimonials; Home's closed transactions), each with the arrows in its own section.
document.querySelectorAll('.quote-track').forEach(track => {
  const [prev, next] = track.closest('section').querySelectorAll('.quote-arrows button');
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
});
