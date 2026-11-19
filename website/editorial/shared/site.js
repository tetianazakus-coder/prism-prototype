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
  // Destinations with no page yet open the notice. None is left since 16 Nov: the Broker Agreement links went, as Tony does not
  // want the agreement public (question 258); a new placeholder takes data-unavailable="<name>".
  $$('[data-unavailable]').forEach(button => button.addEventListener('click', () => notice(button.dataset.unavailable, 'This destination is part of the new website structure and is not included in this local preview. Its approved page or URL must be connected before launch.')));

  // Header menu. The /lp/broker header has none (no top nav on the ad landing). The Brokers dropdown went on 19 Nov (Tony,
  // option 3 of the header shortlist): every item is a plain link.
  const menu = $('#navigation');
  const menuButton = $('.menu-toggle');
  if (menu && menuButton) {
    function closeMenu() { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
    menuButton.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    $$('a,button', menu).forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (menu.classList.contains('open')) { closeMenu(); menuButton.focus(); }
    });
    document.addEventListener('click', event => {
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

  // Local preview only: no network, browser storage, or pretend submission success. A real submit says it was not sent;
  // ?contact=sent and ?contact=failed show the two outcomes delivery will need, for review (about.css, 14 Nov).
  const contactForm = $('#contact-form');
  if (contactForm) {
    const contactStatus = $('#contact-status'), contactSent = $('#contact-sent');
    const showSent = sent => { contactForm.hidden = sent; contactSent.hidden = !sent; };
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      contactStatus.classList.remove('is-error');
      contactStatus.textContent = 'Message ready for review. Not sent. Delivery is not connected in this preview.';
    });
    $('#contact-again').addEventListener('click', () => {
      contactForm.reset(); contactStatus.classList.remove('is-error'); contactStatus.textContent = '';
      showSent(false); contactForm.querySelector('input').focus();
    });
    const contactPreview = new URLSearchParams(location.search).get('contact');
    if (contactPreview === 'sent') showSent(true);
    if (contactPreview === 'failed') {
      const sample = {name: 'Jordan Ellis', email: 'jordan@example.com', message: 'I have a 48-unit multifamily refinance in Austin and would like to talk about lender fit.'};
      Object.entries(sample).forEach(([name, value]) => { contactForm.elements[name].value = value; });
      contactForm.querySelector('input[value="broker"]').checked = true;
      // The number waits for Tony's Zoho Voice line (question 255), so the message carries the same placeholder as the page.
      const phone = Object.assign(document.createElement('span'), {className: 'placeholder', textContent: '[Phone number]'});
      contactStatus.classList.add('is-error');
      contactStatus.replaceChildren('Your message did not send. Try again, or call ', phone, '.');
    }
  }
  // Pricing's ledger is a calculator (Tony, Figma comment, 17 Nov: "make this interactive calculator to allow users to
  // change the loan amount and the %"; Tanya, 19 Nov: "build"). The loan and the fee are fields; every keystroke recounts
  // the fee and the years each plan's annual price fits in it. Under a year the total reads in months; nothing to count
  // reads "—". While typing the loan shows its digits, and $5,000,000 again on leaving it, so the commas never move the
  // caret. The limits ($1B, 10%) are ours [rec], question 315. One status line tells screen readers the result once
  // typing pauses.
  const calc = $('[data-calc]');
  if (calc) {
    const ACC = 1908, PRO = 4788; // the plan cards' prices on annual billing
    const loanIn = $('[data-loan]', calc), feeIn = $('[data-fee]', calc), status = $('[data-calc-status]', calc);
    const money = n => '$' + Math.round(n).toLocaleString('en-US');
    const amount = value => { const n = Number(String(value).replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0; };
    let loan = 5e6, pct = 1, timer;
    const span = (fee, price) => {
      const years = fee / price;
      if (years >= 1) { const whole = Math.floor(years); return {n: whole, plus: years > whole, unit: whole === 1 ? 'year' : 'years'}; }
      const months = Math.floor(years * 12);
      return months < 1 ? {n: '<1', plus: false, unit: 'month'} : {n: months, plus: false, unit: months === 1 ? 'month' : 'months'};
    };
    const paint = (dd, s) => {
      dd.replaceChildren();
      if (!s) { dd.textContent = '—'; return ''; }
      const em = document.createElement('em');
      em.textContent = s.n;
      if (s.plus) em.append(Object.assign(document.createElement('span'), {textContent: '+'}));
      dd.append(em, ` ${s.unit}`);
      return `${s.n}${s.plus ? '+' : ''} ${s.unit}`;
    };
    const recount = () => {
      const fee = loan * pct / 100;
      $('[data-fee-out]', calc).textContent = fee > 0 ? money(fee) : '—';
      const acc = paint($('[data-acc]', calc), fee > 0 && span(fee, ACC));
      const pro = paint($('[data-pro]', calc), fee > 0 && span(fee, PRO));
      clearTimeout(timer);
      timer = setTimeout(() => {
        status.textContent = fee > 0 ? `Your fee, ${money(fee)}, covers Accelerator for ${acc} and Pro for ${pro}.` : 'Enter a loan amount and a fee.';
      }, 700);
    };
    loanIn.addEventListener('focus', () => { loanIn.value = loan ? String(loan) : ''; loanIn.select(); });
    loanIn.addEventListener('input', () => { loan = Math.min(amount(loanIn.value), 1e9); recount(); });
    loanIn.addEventListener('blur', () => { loanIn.value = loan ? money(loan) : ''; });
    feeIn.addEventListener('input', () => { pct = Math.min(amount(feeIn.value), 10); recount(); });
    feeIn.addEventListener('blur', () => { feeIn.value = pct ? (Math.round(pct * 100) / 100).toFixed(2) : ''; });
    [loanIn, feeIn].forEach(input => input.addEventListener('keydown', event => { if (event.key === 'Enter') input.blur(); }));
  }
  // Every sign-up form says where it was sent from, so one list can be split by page as well as by role (Tony, Figma
  // thread on the Borrowers launch band, about 12 Nov: one sign-up form, role asked throughout) [rec].
  $$('.signup input[name=source]').forEach(input => { input.value = `${location.pathname} ${input.value}`; });
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

// A link to one FAQ question opens it: the comparison's "see FAQ" (Pricing, /lp/broker) points at #faq-execution, a
// details further down the same page. The scroll is the browser's, or Lenis's with motion on; opening the details first
// keeps its answer in view when the scroll lands. A page loaded with that hash opens it too.
const openTarget = hash => {
  const target = hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (target && target.tagName === 'DETAILS') target.open = true;
};
document.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link) openTarget(link.hash);
});
openTarget(location.hash);

// Info buttons on comparison rows (Pricing, /lp/broker): a mouse pointing at the icon shows the row's definition and
// leaving it hides it (Tanya, 13 Nov: "show tooltips on hover"); a click or tap pins it open and closes any other, so
// phones and the keyboard get it too. A second click, a click elsewhere or Escape closes it, Escape returning focus to the
// button. The card's notch points at the icon wherever the card sits (beside it on desktop, under the label on a phone).
const tips = [...document.querySelectorAll('.tip')];
const setTip = (button, open) => {
  const pop = document.getElementById(button.getAttribute('aria-controls'));
  button.setAttribute('aria-expanded', String(open));
  pop.hidden = !open;
  if (!open) delete button.dataset.pinned;
  if (open) {
    const b = button.getBoundingClientRect(), p = pop.getBoundingClientRect();
    pop.style.setProperty('--notch', `${Math.round(b.left + b.width / 2 - p.left - 6)}px`);
  }
};
tips.forEach(button => {
  button.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse' || button.getAttribute('aria-expanded') === 'true') return;
    tips.forEach(other => other !== button && setTip(other, false));
    setTip(button, true);
  });
  button.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !button.dataset.pinned) setTip(button, false);
  });
  button.addEventListener('click', () => {
    const pin = !button.dataset.pinned;
    tips.forEach(other => other !== button && setTip(other, false));
    setTip(button, pin);
    if (pin) button.dataset.pinned = '1';
  });
});
document.addEventListener('click', event => {
  if (!event.target.closest('.tip')) tips.forEach(button => setTip(button, false));
});
document.addEventListener('keydown', event => {
  const open = event.key === 'Escape' && tips.find(button => button.getAttribute('aria-expanded') === 'true');
  if (open) { setTip(open, false); open.focus(); }
});
