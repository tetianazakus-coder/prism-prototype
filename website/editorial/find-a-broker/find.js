// Find a broker filters: three multiselects built from the cards' data, each with the Select all + Clear footer (the
// default on every multiselect since 22 Oct). Within a filter any ticked value matches; across filters every filter
// must match; an empty filter matches all. Without script every card shows and the filters stay closed.
(() => {
  'use strict';
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const cards = $$('.broker-card');
  const filters = $$('.filter');
  const values = (card, key) => card.dataset[key].split('|');

  filters.forEach(filter => {
    const key = filter.dataset.filter;
    const options = [...new Set(cards.flatMap(card => values(card, key)))].sort();
    filter.querySelector('.filter-options').innerHTML = options.map(value =>
      `<label><input type="checkbox" value="${value.replace(/"/g, '&quot;')}"> <span>${value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></label>`).join('');
  });

  function apply() {
    const picked = Object.fromEntries(filters.map(filter => [filter.dataset.filter, $$('input:checked', filter).map(input => input.value)]));
    filters.forEach(filter => {
      const n = picked[filter.dataset.filter].length;
      filter.querySelector('.filter-count').textContent = n ? ` · ${n}` : '';
      filter.classList.toggle('active', n > 0);
    });
    let shown = 0;
    cards.forEach(card => {
      const match = Object.entries(picked).every(([key, list]) => !list.length || values(card, key).some(value => list.includes(value)));
      card.hidden = !match;
      if (match) shown++;
    });
    document.querySelector('.find-empty').hidden = shown > 0;
    document.querySelector('.find-count').textContent = `${shown} ${shown === 1 ? 'broker' : 'brokers'}`;
  }

  const close = (filter, focus = false) => {
    const toggle = filter.querySelector('.filter-toggle');
    toggle.setAttribute('aria-expanded', 'false');
    filter.querySelector('.filter-pop').hidden = true;
    if (focus) toggle.focus();
  };
  filters.forEach(filter => {
    const toggle = filter.querySelector('.filter-toggle');
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      filters.forEach(other => other !== filter && close(other));
      toggle.setAttribute('aria-expanded', String(open));
      filter.querySelector('.filter-pop').hidden = !open;
    });
    filter.addEventListener('change', apply);
    filter.querySelector('[data-all]').addEventListener('click', () => { $$('input', filter).forEach(input => { input.checked = true; }); apply(); });
    filter.querySelector('[data-clear]').addEventListener('click', () => { $$('input', filter).forEach(input => { input.checked = false; }); apply(); });
    filter.addEventListener('keydown', event => { if (event.key === 'Escape') close(filter, true); });
  });
  document.addEventListener('click', event => filters.forEach(filter => { if (!filter.contains(event.target)) close(filter); }));
  apply();
})();
