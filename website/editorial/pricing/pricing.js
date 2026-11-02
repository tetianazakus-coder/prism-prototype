// Comparison groups: the rows show without script; with it, each group starts collapsed behind its
// "See what's included" button (Tony's ask, requirements doc Pricing intro).
(() => {
  'use strict';
  document.querySelectorAll('.compare-group button').forEach(button => {
    const rows = document.getElementById(button.getAttribute('aria-controls'));
    const set = open => { button.setAttribute('aria-expanded', String(open)); rows.hidden = !open; };
    set(false);
    button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
  });
})();
