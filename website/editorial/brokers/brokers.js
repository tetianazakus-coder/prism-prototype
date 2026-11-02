(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const {openDialog} = window.LenderPrism;

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

  // The walkthrough tabs stand in a column beside the screen from 851px and in a row above it below that; the arrow
  // keys follow (site.js reads aria-orientation on each key press).
  const verticalTabs = matchMedia('(min-width:851px)');
  function syncTabOrientation() { $('.walk-tabs').setAttribute('aria-orientation', verticalTabs.matches ? 'vertical' : 'horizontal'); }
  verticalTabs.addEventListener('change', syncTabOrientation);
  syncTabOrientation();
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
