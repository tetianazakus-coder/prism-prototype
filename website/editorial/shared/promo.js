/* Holiday special: the switch, the dismiss and the contact form (promo.css). */
(() => {
  'use strict';
  const root = document.documentElement;
  // Chris's one click: 'on' or 'off' takes the banner on or off every page. ?promo= overrides it for a review.
  const PROMO = 'on';
  const params = new URLSearchParams(location.search);
  root.dataset.promo = params.get('promo') || PROMO;
  // A visitor's ×, remembered in this browser only. Keyed to the campaign, so the next promotion shows again.
  // ?reset brings it back.
  const KEY = 'lp-promo-founders-circle-dismissed'; // Tony's new offer, 18 Nov: shows again to anyone who closed the first.
  try {
    if (params.has('reset')) localStorage.removeItem(KEY);
    if (localStorage.getItem(KEY)) root.classList.add('promo-dismissed');
  } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-promo-dismiss]').forEach(button => button.addEventListener('click', () => {
      root.classList.add('promo-dismissed');
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      // The button goes with its banner: hand focus to the content it sat over.
      const next = document.getElementById('plans') || document.getElementById('main');
      next.setAttribute('tabindex', '-1'); next.focus({preventScroll: true});
    }));
    const dialog = document.getElementById('promo-dialog');
    if (!dialog) return;
    const more = () => dialog.classList.toggle('is-more', dialog.scrollTop + dialog.clientHeight < dialog.scrollHeight - 1);
    dialog.addEventListener('scroll', more);
    addEventListener('resize', more);
    // site.js wires every dialog's close, backdrop click and body.modal-open removal.
    document.querySelectorAll('[data-promo-contact]').forEach(button => button.addEventListener('click', () => {
      dialog.showModal(); document.body.classList.add('modal-open'); more();
    }));
    document.getElementById('promo-form').addEventListener('submit', event => {
      event.preventDefault();
      document.getElementById('promo-status').textContent = 'Request ready for review. Not sent. Delivery is not connected in this preview.';
    });
  });
})();
