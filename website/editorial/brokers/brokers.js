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

