// Find a broker filters: a search by name, the property's state (a single-select) and two multiselects built from the cards' data, each with the Select all + Clear
// footer (the default on every multiselect since 22 Oct). Within a filter any ticked value matches; across filters every filter
// must match; an empty filter matches all. The state does not filter: brokers who work there come first and the rest follow
// under a divider (Christian, 12 Nov: "we show the brokers who work there first"). Twelve cards show, then "Show more
// brokers" adds twelve. Without script every card shows and the filters stay closed.
(() => {
  'use strict';
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const cards = $$('.broker-card');
  const filters = $$('.filter[data-filter]');
  const values = (card, key) => card.dataset[key].split('|');
  // Search by name (10 Nov): matches from the start of any word in the card's name ("pi" finds Jordan Pike, "jordan p"
  // too; "son" does not find Hasson), ignoring case, accents and extra spaces, and narrows
  // the grid together with the filters. The field's own clear button (the x in a search input) fires "input" too.
  const search = document.querySelector('.find-search input');
  const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  search.addEventListener('input', () => apply());

  // The property's state, from the picker or from ?state= (Home's brokers section links here with it); the address keeps the pick.
  // The picker is a single-select on the filter buttons' pattern: a combobox search over a listbox, arrows and Enter pick.
  const grid = document.querySelector('.broker-grid');
  const stateField = document.querySelector('.find-state');
  const stateToggle = stateField.querySelector('.filter-toggle');
  const stateLabel = stateField.querySelector('.find-state-label');
  const statePop = stateField.querySelector('.filter-pop');
  const stateSearch = stateField.querySelector('input');
  const stateOptions = $$('[role=option]', stateField);
  const stateNone = stateField.querySelector('.state-none');
  let state = '';
  let activeOption = null;
  const setActive = option => {
    stateOptions.forEach(other => other.classList.toggle('is-active', other === option));
    activeOption = option;
    if (option) { stateSearch.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({block: 'nearest'}); }
    else stateSearch.removeAttribute('aria-activedescendant');
  };
  const visibleOptions = () => stateOptions.filter(option => !option.hidden);
  const filterStates = () => {
    const query = fold(stateSearch.value);
    // "All states" (value "") stands only over the full list; a search shows matching states alone.
    stateOptions.forEach(option => { option.hidden = !!query && !(option.dataset.value && (' ' + fold(option.dataset.value)).includes(' ' + query)); });
    const shown = visibleOptions();
    stateNone.hidden = shown.length > 0;
    setActive(shown.find(option => option.dataset.value === state) || shown[0] || null);
  };
  const openState = open => {
    stateToggle.setAttribute('aria-expanded', String(open));
    statePop.hidden = !open;
    if (!open) return;
    filters.forEach(filter => close(filter));
    stateSearch.value = '';
    filterStates();
    stateSearch.focus();
  };
  const pickState = value => {
    state = value;
    stateOptions.forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === value)));
    stateLabel.textContent = value || 'Property state';
    stateField.classList.toggle('active', !!value);
    const url = new URL(location.href);
    if (value) url.searchParams.set('state', value); else url.searchParams.delete('state');
    history.replaceState(null, '', url);
  };
  const asked = new URLSearchParams(location.search).get('state');
  if (asked && stateOptions.some(option => option.dataset.value === asked)) pickState(asked);
  stateToggle.addEventListener('click', () => openState(statePop.hidden));
  stateSearch.addEventListener('input', filterStates);
  stateSearch.addEventListener('keydown', event => {
    const shown = visibleOptions();
    const at = shown.indexOf(activeOption);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (shown.length) setActive(shown[(at + (event.key === 'ArrowDown' ? 1 : shown.length - 1)) % shown.length]);
    } else if (event.key === 'Enter' && activeOption) {
      event.preventDefault();
      pickState(activeOption.dataset.value); openState(false); stateToggle.focus(); apply();
    }
  });
  stateOptions.forEach(option => option.addEventListener('mousemove', () => { if (activeOption !== option) setActive(option); }));
  stateOptions.forEach(option => option.addEventListener('click', () => { pickState(option.dataset.value); openState(false); stateToggle.focus(); apply(); }));
  stateField.addEventListener('keydown', event => { if (event.key === 'Escape') { openState(false); stateToggle.focus(); } });
  const divider = document.createElement('li');
  divider.className = 'find-divider';
  const PAGE = 12;
  let limit = PAGE;
  const more = document.querySelector('.find-more');
  more.querySelector('button').addEventListener('click', () => { limit += PAGE; apply(false); });

  filters.forEach(filter => {
    const key = filter.dataset.filter;
    const options = [...new Set(cards.flatMap(card => values(card, key)))].sort();
    filter.querySelector('.filter-options').innerHTML = options.map(value =>
      `<label><input type="checkbox" value="${value.replace(/"/g, '&quot;')}"> <span>${value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></label>`).join('');
  });

  function apply(reset = true) {
    if (reset) limit = PAGE;
    const picked = Object.fromEntries(filters.map(filter => [filter.dataset.filter, $$('input:checked', filter).map(input => input.value)]));
    filters.forEach(filter => {
      const n = picked[filter.dataset.filter].length;
      filter.querySelector('.filter-count').textContent = n ? ` · ${n}` : '';
      filter.classList.toggle('active', n > 0);
    });
    const query = fold(search.value);
    const matched = cards.filter(card => Object.entries(picked).every(([key, list]) => !list.length || values(card, key).some(value => list.includes(value)))
      && (!query || (' ' + fold(card.querySelector('h3').textContent)).includes(' ' + query)));
    const local = state ? matched.filter(card => values(card, 'states').includes(state)) : matched;
    const rest = state ? matched.filter(card => !local.includes(card)) : [];
    // Order: the state's brokers, the divider when others follow, the others; cards the filters drop go last, hidden.
    const order = [...local, ...(state && rest.length ? [divider] : []), ...rest, ...cards.filter(card => !matched.includes(card))];
    order.forEach(node => grid.append(node));
    divider.textContent = local.length ? 'Brokers in other states' : `No brokers work in ${state} yet. Brokers in other states`;
    divider.hidden = !(state && rest.length) || local.length + rest.length === 0;
    let n = 0;
    cards.forEach(card => { card.hidden = true; });
    [...local, ...rest].forEach(card => { card.hidden = ++n > limit; });
    if (rest.length && local.length >= limit) divider.hidden = true;
    more.hidden = matched.length <= limit;
    const shown = matched.length;
    document.querySelector('.find-empty').hidden = shown > 0;
    document.querySelector('.find-count').textContent = state
      ? `${local.length} in ${state} · ${shown} ${shown === 1 ? 'broker' : 'brokers'}`
      : `${shown} ${shown === 1 ? 'broker' : 'brokers'}`;
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
      if (open) openState(false);
      toggle.setAttribute('aria-expanded', String(open));
      filter.querySelector('.filter-pop').hidden = !open;
    });
    filter.addEventListener('change', apply);
    filter.querySelector('[data-all]').addEventListener('click', () => { $$('input', filter).forEach(input => { input.checked = true; }); apply(); });
    filter.querySelector('[data-clear]').addEventListener('click', () => { $$('input', filter).forEach(input => { input.checked = false; }); apply(); });
    filter.addEventListener('keydown', event => { if (event.key === 'Escape') close(filter, true); });
  });
  document.addEventListener('click', event => {
    filters.forEach(filter => { if (!filter.contains(event.target)) close(filter); });
    if (!stateField.contains(event.target)) openState(false);
  });
  apply();
})();
