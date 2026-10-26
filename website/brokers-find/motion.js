// Text, image and transition motion reused from findrealestate.com (Tanya, 26 Oct: "reuse
// animations for text/images, transitions from this site"). The reference runs GSAP 3.13.0 with
// SplitText, ScrollTrigger and CustomEase through one helper module; each helper below keeps the
// values of the reference helper it is named after. Scroll smoothing (Lenis on GSAP's ticker) is
// wired in find.js. Nothing runs under prefers-reduced-motion.
(() => {
  'use strict';
  const {gsap, ScrollTrigger, SplitText, CustomEase} = window;
  const root = document.documentElement;
  if (!gsap || !ScrollTrigger || !SplitText || !CustomEase) { root.classList.remove('motion-intro'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  root.classList.add('gsap-motion');
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const once = (trigger, animation, vars = {}) => ScrollTrigger.create({trigger, animation, once: true, ...vars});
  const menuEase = CustomEase.create('menu', '.76,0,.2,1');
  let moving = false;

  // Words rise out of a per-word mask: 2s power4.out, 0.1s apart, or 0.4s spread over more than five words.
  function wordsUp(element) {
    const split = SplitText.create(element, {type: 'words', mask: 'words', wordsClass: 'rise-word'});
    return gsap.timeline({onComplete: () => split.revert()})
      .fromTo(split.words, {y: '115%'}, {y: '0%', duration: 2, ease: 'power4.out', stagger: split.words.length > 5 ? {amount: .4} : .1});
  }

  // Opacity snaps in over 0.1s while the element travels 70px up over 2s on expo.out.
  function fadeUp(targets, {fromY = 70, opacityDuration = .1, stagger = .1} = {}) {
    return gsap.timeline()
      .fromTo(targets, {opacity: 0}, {opacity: 1, duration: opacityDuration, stagger, clearProps: 'opacity'}, 0)
      .fromTo(targets, {y: fromY}, {y: 0, duration: 2, stagger, ease: 'expo.out', clearProps: 'transform'}, 0);
  }

  // Images wipe in from one edge: clip-path inset, 2s power3.out.
  function clipIn(element, fromLeft = false) {
    return gsap.fromTo(element, {clipPath: fromLeft ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'},
      {clipPath: fromLeft ? 'inset(0 0 0 0%)' : 'inset(0 0% 0 0)', duration: 2, ease: 'power3.out', clearProps: 'clipPath'});
  }

  // The reference's ScrubbedText: each line sits under a block of its own background at 80%,
  // which shrinks to the right (2s power3.out, 0.15s spread) once the heading is 200px into view.
  function backdropOf(element) {
    for (let node = element.parentElement; node; node = node.parentElement) {
      const [r, g, b, a = 1] = getComputedStyle(node).backgroundColor.match(/[\d.]+/g).map(Number);
      if (a > 0) return `rgba(${r},${g},${b},.8)`;
    }
    return 'rgba(255,255,255,.8)';
  }
  function curtain(element) {
    const colour = backdropOf(element);
    const centred = getComputedStyle(element).textAlign === 'center';
    SplitText.create(element, {type: 'lines', linesClass: 'curtain-line', autoSplit: true, onSplit(split) {
      const blocks = split.lines.map(line => {
        if (centred) line.style.marginInline = 'auto';
        const block = document.createElement('i');
        block.className = 'curtain';
        block.style.background = colour;
        line.append(block);
        return block;
      });
      return gsap.to(blocks, {scaleX: 0, transformOrigin: 'right center', duration: 2, ease: 'power3.out', stagger: {amount: .15},
        scrollTrigger: {trigger: element, start: 'top bottom-=200px', end: 'center center'}, onComplete: () => split.revert()});
    }});
  }

  // Figures count up from 0 over 1.5s (expo.out from three digits, power2.inOut below).
  function countUp(element) {
    const node = [...element.childNodes].find(child => child.nodeType === 3 && /\d/.test(child.nodeValue));
    if (!node) return;
    const target = Number(node.nodeValue.replace(/,/g, ''));
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = element.textContent;
    element.after(label);
    element.setAttribute('aria-hidden', 'true');
    const value = {i: 0};
    node.nodeValue = '0';
    once(element, gsap.to(value, {i: target, duration: 1.5, ease: String(target).length < 3 ? 'power2.inOut' : 'expo.out',
      onUpdate: () => { node.nodeValue = Math.round(value.i).toLocaleString('en-US'); }}));
  }

  // Hover: the label rolls up and a copy rolls in under it (0.9s cubic-bezier(.16,1,.3,1), in motion.css).
  function rollLabel(element) {
    const node = [...element.childNodes].find(child => child.nodeType === 3 && child.nodeValue.trim());
    if (!node) return;
    const text = node.nodeValue.trim();
    const clip = document.createElement('lp-roll');
    const label = document.createElement('lp-roll-text');
    label.dataset.text = text;
    label.textContent = text;
    clip.append(label);
    const [lead, trail] = [node.nodeValue.match(/^\s*/)[0], node.nodeValue.match(/\s*$/)[0]];
    node.replaceWith(...[lead, clip, trail].filter(Boolean));
  }
  $$('#navigation > a, .button, .text-link, .footer-grid a, .footer-grid > div > button, .footer-bottom a, .footer-bottom button').forEach(rollLabel);

  // Opening a panel: height and opacity from 0 over 0.3s ease-out (the reference's collapsible).
  const slide = {duration: .3, ease: 'power1.out'};
  function animateDetails(details) {
    const summary = $(':scope > summary', details);
    summary.addEventListener('click', event => {
      if (!moving) return;
      event.preventDefault();
      gsap.killTweensOf(details);
      const from = details.offsetHeight;
      const opening = !details.open || details.dataset.closing === 'true';
      details.open = opening;   // measure the end state, then stay open while it moves
      const to = details.offsetHeight;
      details.open = true;
      details.dataset.closing = String(!opening);
      const content = [...details.children].filter(child => child !== summary);
      gsap.fromTo(details, {height: from, overflow: 'hidden'}, {...slide, height: to, clearProps: 'height,overflow',
        onComplete: () => { if (!opening) details.open = false; delete details.dataset.closing; }});
      gsap.fromTo(content, {opacity: opening ? 0 : 1}, {...slide, opacity: opening ? 1 : 0, clearProps: 'opacity'});
    });
  }
  $$('.faq-items details, .comparison').forEach(animateDetails);
  const serviceWatch = new MutationObserver(records => records.forEach(({target, oldValue}) => {
    if (!moving || target.hidden || oldValue === null) return;
    gsap.fromTo(target, {height: 0, paddingBottom: 0, opacity: 0, overflow: 'hidden'}, {...slide, height: 'auto', paddingBottom: getComputedStyle(target).paddingBottom, opacity: 1, clearProps: 'all'});
  }));
  $$('.service-details').forEach(region => serviceWatch.observe(region, {attributes: true, attributeFilter: ['hidden'], attributeOldValue: true}));

  // Phone menu: the panel unrolls from the top (0.7s cubic-bezier(.76,0,.2,1)), items fade in from 0.4s;
  // closing rolls it back up before it hides.
  const menu = $('#navigation');
  const phone = matchMedia('(max-width:900px)');
  new MutationObserver(([record]) => {
    const was = (record.oldValue || '').split(/\s+/).includes('open');
    const is = menu.classList.contains('open');
    if (!moving || !phone.matches || was === is) return;
    gsap.killTweensOf([menu, ...menu.children]);
    if (is) {
      menu.classList.remove('closing');
      gsap.timeline()
        .fromTo(menu, {scaleY: 0}, {scaleY: 1, transformOrigin: '50% 0', duration: .7, ease: menuEase, clearProps: 'transform'}, 0)
        .fromTo(menu.children, {opacity: 0}, {opacity: 1, duration: 1, stagger: .1, clearProps: 'opacity'}, .4);
    } else {
      menu.classList.add('closing');
      gsap.to(menu, {scaleY: 0, transformOrigin: '50% 0', duration: .7, ease: menuEase, clearProps: 'transform', onComplete: () => menu.classList.remove('closing')});
    }
  }).observe(menu, {attributes: true, attributeFilter: ['class'], attributeOldValue: true});

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    moving = true;
    document.fonts.ready.then(() => {
      // Load: the hero fades up over 0.6s, the headline words rise, the copy and actions follow at 0.4s,
      // and the building settles from 110% over 5s (the reference's home hero timeline).
      const hero = gsap.timeline();
      hero.fromTo(['.hero-pin', '.site-header'], {autoAlpha: 0}, {autoAlpha: 1, duration: .6}, 0)
        .add(wordsUp($('#hero-title')), 0)
        .add(fadeUp($$('.hero-eyebrow, .hero-description, .hero .hero-actions, .hero .micro')), .4)
        .from('.hero-image img', {scale: 1.1, duration: 5, ease: 'expo.out'}, 0)
        .from('.hero-image img', {opacity: 0, duration: .6}, .2)
        .from('.hero-image img', {y: '10%', duration: 3, ease: 'expo.out'}, .2)
        .fromTo('.scroll-cue', {autoAlpha: 0}, {autoAlpha: 1, duration: 1}, .6);
      root.classList.remove('motion-intro');

      // Section headings on a flat background take the line curtain; the closing headline over the photo rises by word.
      $$('main h2').filter(h2 => !h2.closest('.final')).forEach(curtain);
      once($('.final h2'), wordsUp($('.final h2')));

      // Copy, cards and controls fade up as they enter, each on its own trigger; rows of siblings share one.
      $$(['main .eyebrow:not(.hero-eyebrow)', '.problem-copy p', '.center-statement .button', '.section-heading > p', '.billing',
        '.service', '.walk-tabs', '.territory-main', '.testimonial-body', '.roi-copy', '.pricing-footnote', '.comparison',
        '.faq-grid > div > .text-link', '.faq-items details', '.final-content > p:not(.eyebrow)', '.final .hero-actions'].join(','))
        .forEach(element => once(element, fadeUp(element)));
      ['.proof > div', '.roi-figures > div', '.plans > .plan', '.footer-grid > div'].forEach(selector => {
        const row = $$(selector);
        if (row.length) once(row[0], fadeUp(row));
      });
      $$('.proof strong').forEach(countUp);

      // Images wipe in; the closing photo slowly scales with the scroll (1.5s scrub).
      [['.city-film'], ['.walk-stage .walk-panel:not([hidden]) figure'], ['.territory-aside img'], ['.testimonial-image', true]]
        .forEach(([selector, fromLeft]) => { const image = $(selector); if (image) once(image, clipIn(image, fromLeft)); });
      gsap.fromTo('.final-photo', {scale: 1.02}, {scale: 1.1, ease: 'none', scrollTrigger: {trigger: '.final', start: 'top bottom', end: 'bottom top', scrub: 1.5}});

      // Footer: the wordmark's letters fade up from the last one; on desktop the footer slides out from under the page.
      const wordmark = SplitText.create('.footer-wordmark', {type: 'chars'});
      once('.footer-wordmark', fadeUp(wordmark.chars, {fromY: 20, opacityDuration: 1, stagger: {each: .1, from: 'end'}})
        .eventCallback('onComplete', () => wordmark.revert()));
      gsap.matchMedia().add('(min-width:768px)', () => {
        const footer = gsap.timeline({scrollTrigger: {trigger: '.site-footer', start: 'top bottom', end: 'bottom bottom', scrub: true}});
        footer.fromTo('.site-footer > .wrap', {opacity: 0}, {opacity: 1, duration: .3, ease: 'power1.out'}, 0)
          .fromTo('.site-footer > .wrap', {scale: .98}, {scale: 1, duration: .4, ease: 'power1.out'}, 0)
          .fromTo('.site-footer > .wrap', {y: '-40%'}, {y: '0%', duration: 1, ease: 'power1.out'}, 0);
      });
    });

    // Opening a panel or a tab moves everything below it; triggers re-measure once the layout settles.
    let settle;
    const relayout = new ResizeObserver(() => { clearTimeout(settle); settle = setTimeout(() => ScrollTrigger.refresh(), 200); });
    relayout.observe($('main'));
    return () => { moving = false; relayout.disconnect(); root.classList.remove('motion-intro'); };
  });
})();
