/* Editorial motion, after The Nest (thenest.pl/en), read from its bundle on 26 Oct 2026 (Tanya: "for the 1st option
   (editorial) use only animations/transitions, scroll animation from this site"). Its numbers are kept: Lenis 1.3.25
   with a 1.2s exponential glide and 0.8s anchor jumps, driven by gsap.ticker (GSAP 3.15); MaskedLines for titles,
   Reveal for blocks, Drafted for measured bars, and the hero plate's pointer tilt. The head script sets .motion unless
   reduced motion is on; without it, or without the libraries, nothing runs and the page stays static. Hover timings
   live in editorial.css. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.classList.contains('motion') || !window.gsap || !window.ScrollTrigger || !window.SplitText) {
    root.classList.remove('motion', 'motion-pending');
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const ease = 'expo.out';

  // Smooth scroll at The Nest's settings. Anchor jumps glide too; Lenis 1.3.25 stops them at the CSS
  // scroll-padding-top, so The Nest's fixed -64 offset is not needed. Dialogs keep native scroll; touch stays native.
  if (window.Lenis) {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      anchors: {duration: .8, easing: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2},
      prevent: node => node.closest('dialog')
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Reveal: a block rises 22px and fades in over 0.9s once its top is 88% down the viewport (at once if it already is).
  const reveal = (block, delay = 0) => gsap.fromTo(block, {opacity: 0, y: 22}, {opacity: 1, y: 0, duration: .9, ease, delay,
    clearProps: 'transform', scrollTrigger: {trigger: block, start: 'top 88%', once: true}});

  // Masked lines: each line of a title rises out of its own mask (110% to 0 over 1.05s, 0.06s apart) once the title is
  // 82% down, or on load after a delay for the hero. autoSplit re-splits on resize and carries the tween's progress over.
  // Each mask is padded .14em below so descenders are not clipped: Bodoni's g reaches .26em under the baseline and .08em,
  // The Nest's padding, still cut its loop in "large" (Tanya, 26 Oct). It is padded .22em each side too, cancelled by
  // the margin, because an italic swash runs past its advance: the y of "Prism family" was cut (Tanya, 5 Nov: "fix font
  // cut"); a heading in a flex row shrinks to its text, so the mask has no slack. .1em was not enough: Bodoni Moda
  // 11pt italic f overhangs .195em left and .142em right, j .21em left, so the ball of the f in the Brokers closing
  // "forever." was cut (5 Nov). aria 'none' leaves the lines
  // readable as they are: SplitText's own label runs a title's two lines together ("firm.Without").
  const lines = (title, delay) => {
    SplitText.create(title, {type: 'lines', mask: 'lines', aria: 'none', autoSplit: true, onSplit(split) {
      split.masks.forEach(mask => Object.assign(mask.style, {padding: '0 .22em .14em', margin: '0 -.22em -.14em'}));
      return gsap.fromTo(split.lines, {yPercent: 110, opacity: 0}, {yPercent: 0, opacity: 1, duration: 1.05, ease, stagger: .06,
        delay: delay || 0, scrollTrigger: delay === undefined ? {trigger: title, start: 'top 82%', once: true} : undefined});
    }});
  };

  // The Pricing header's ledger works its sum in reading order (Option 3 of the Pricing motion review,
  // assets/website/pricing-motion-options/; Tanya, 5 Nov: "add recommended"). The cap, then each row rises as the one
  // above lands (0.7s, 0.35s apart), its figure counting from 0 over 1.1s; the ink rule over the total draws from the
  // left (0.6s power3.out) and "10+ years" lands last, under 3s in all. As in the proof count-up below, the counting
  // digits are hidden from screen readers and an .sr-only twin in the same dd carries the real figure.
  const workSum = (ledger, delay) => {
    const total = ledger.querySelector('.total');
    const rule = document.createElement('span');
    rule.className = 'ledger-rule';
    rule.setAttribute('aria-hidden', 'true');
    if (total) total.prepend(rule);
    const play = gsap.timeline({delay, defaults: {ease}});
    play.fromTo(ledger.querySelector('.ledger-cap'), {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: .6, clearProps: 'transform'}, 0);
    ledger.querySelectorAll('dl > div').forEach((row, n) => {
      const at = .25 + n * .35 + (row === total ? .25 : 0);
      if (row === total) play.fromTo(rule, {scaleX: 0}, {scaleX: 1, duration: .6, ease: 'power3.out'}, at - .25);
      play.fromTo(row, {opacity: 0, y: 14}, {opacity: 1, y: 0, duration: .7, clearProps: 'transform'}, at);
      const dd = row.querySelector('dd');
      let figure = dd.querySelector('em');
      if (!figure) {
        figure = document.createElement('span');
        figure.append(...dd.childNodes);
        dd.append(figure);
      }
      const node = [...figure.childNodes].find(child => child.nodeType === 3 && /\d/.test(child.nodeValue));
      if (!node) return;
      const twin = document.createElement('span');
      twin.className = 'sr-only';
      twin.textContent = figure.textContent;
      figure.before(twin);
      figure.setAttribute('aria-hidden', 'true');
      const sign = node.nodeValue.match(/^\D*/)[0];
      const target = Number(node.nodeValue.replace(/\D/g, ''));
      const value = {i: 0};
      node.nodeValue = sign + '0';
      play.to(value, {i: target, duration: 1.1, onUpdate: () => { node.nodeValue = sign + Math.round(value.i).toLocaleString('en-US'); }}, at);
    });
  };

  // Billing toggle (Options 1 and 2 of the Pricing motion review; Pricing, Brokers and /lp/broker). site.js swaps the
  // prices and notes on click; this reads each price before it does (capture phase) and, after, rolls every digit that
  // changed: the old one rises out of its slot as the new one rises in (0.6s, 0.04s apart, each plan 0.06s after the one
  // before), so $159 to $199 rolls only the 5 and the 9. The line under each price fades across. When the roll lands
  // the price is plain text again. The navy fill slides to the pressed button (0.45s) instead of switching in one frame;
  // editorial.css (.billing.sliding) moves the fill off the buttons onto it. #billing-announcement already tells screen
  // readers the new prices.
  const prices = gsap.utils.toArray('[data-price]');
  const notes = gsap.utils.toArray('[data-note]');
  const shown = new Map();
  const roll = (price, from, to, delay) => {
    if (!from || from === to) return;
    if (from.length !== to.length) {
      gsap.fromTo(price, {opacity: 0, y: 12}, {opacity: 1, y: 0, duration: .6, ease, delay, clearProps: 'transform'});
      return;
    }
    price.textContent = '';
    let last;
    [...to].forEach((digit, i) => {
      if (from[i] === digit) { price.append(digit); return; }
      const slot = document.createElement('span');
      slot.className = 'price-slot';
      const out = Object.assign(document.createElement('span'), {textContent: from[i]});
      const into = Object.assign(document.createElement('span'), {textContent: digit});
      out.setAttribute('aria-hidden', 'true');
      slot.append(out, into);
      price.append(slot);
      gsap.to(out, {yPercent: -100, duration: .6, ease, delay: delay + i * .04});
      last = gsap.fromTo(into, {yPercent: 100}, {yPercent: 0, duration: .6, ease, delay: delay + i * .04});
    });
    if (last) last.eventCallback('onComplete', () => { price.textContent = to; });
  };
  document.querySelectorAll('[data-billing]').forEach(button => {
    button.addEventListener('click', () => prices.forEach(price => {
      gsap.killTweensOf(price.querySelectorAll('span'));
      shown.set(price, price.dataset.shown || price.textContent);
    }), true);
    button.addEventListener('click', () => {
      prices.forEach((price, n) => {
        const to = price.textContent;
        roll(price, shown.get(price), to, n * .06);
        price.dataset.shown = to;
      });
      gsap.fromTo(notes, {opacity: 0, y: 6}, {opacity: 1, y: 0, duration: .4, ease: 'power2.out', stagger: .06, clearProps: 'transform'});
    });
  });
  const toggles = [...document.querySelectorAll('.billing')].map(group => {
    const fill = document.createElement('span');
    fill.className = 'billing-fill';
    fill.setAttribute('aria-hidden', 'true');
    group.prepend(fill);
    group.classList.add('sliding');
    const place = duration => {
      const on = group.querySelector('[aria-pressed=true]');
      if (on) gsap.to(fill, {x: on.offsetLeft, width: on.offsetWidth, duration, ease});
    };
    group.addEventListener('click', event => { if (event.target.closest('[data-billing]')) place(.45); });
    return place;
  });
  const placeToggles = () => toggles.forEach(place => place(0));
  placeToggles();
  addEventListener('resize', placeToggles);

  // Photo drift (Option 6 of the Pricing motion review; Tanya, 5 Nov: "add Photo drift"): a closing band set on a photo
  // (Pricing's city at dusk, Home's multifamily) moves its photo from top to bottom of its crop while the band crosses
  // the viewport, scrubbed to the scroll with no easing, so the photo stops when the reader does and the card or text
  // in front reads as lifted off it. About 290px of travel on Pricing at 1440. The navy wash is a flat gradient, so
  // moving it with the photo shows nothing.
  document.querySelectorAll('.final').forEach(band => {
    if (!/url\(/.test(getComputedStyle(band).backgroundImage)) return;
    gsap.fromTo(band, {backgroundPositionY: '0%'}, {backgroundPositionY: '100%', ease: 'none',
      scrollTrigger: {trigger: band, start: 'top bottom', end: 'bottom top', scrub: true}});
  });

  document.fonts.ready.then(() => {
    placeToggles();
    // Hero, on load, at The Nest's delays: eyebrow, photo 0.1s, copy 0.15s, title lines 0.2s.
    // Pages without a photo or a lower block (Pricing) skip those steps.
    const hero = document.querySelector('.hero');
    const pick = selector => hero.querySelector(selector);
    if (pick('.eyebrow')) reveal(pick('.eyebrow'));
    if (pick('.ledger')) workSum(pick('.ledger'), .5);
    else if (pick('.hero-visual')) reveal(pick('.hero-visual'), .1);
    if (pick('.hero-lower')) reveal(pick('.hero-lower'), .15);
    lines(pick('h1'), .2);
    root.classList.remove('motion-pending');

    document.querySelectorAll('main section h2').forEach(title => lines(title));

    // Blocks, each on its own trigger as The Nest wraps them. A container that holds a title reveals its other
    // children instead, so no title moves twice.
    const picked = gsap.utils.toArray('.proof > div, .problem-body, .desk-line, .pillar > *, .section-heading > *, .walk-stage, .territory-grid > *, .testimonial-grid > *, .roi-comparison, .plans > article, .pricing-footnote, .comparison, .compare .table-scroll, .compare-notes, .sides-list, .platform-pair > *, .feature-cards > *, .notify > *, .faq-grid > *, .final-grid > *')
      .flatMap(block => block.querySelector('h2') ? [...block.children] : block)
      .filter(block => block.tagName !== 'H2');
    const blocks = [...new Set(picked)];
    blocks.filter(block => !blocks.some(other => other !== block && other.contains(block))).forEach(block => reveal(block));

    // Person cards, one by one, after Stellar Management's news photos (stellarmanagement.com, read from its bundle on
    // 5 Nov 2026: xPercent -110 to 0, power1.out, 1.05s, once the card is 80% down the viewport). Here the photo slides
    // inside its own frame, which clips it, so it never crosses the card beside it. Cards that arrive together play
    // left to right, 0.16s apart; a card's name and lines rise as its photo lands (Tanya, 5 Nov: "add similar exit
    // animation, one by one", then "make it smother like here"). A card without a photo (About's [Photo] frames) only
    // rises. The hover zoom is CSS, in components.css.
    const cards = gsap.utils.toArray('.person-grid > li');
    if (cards.length) {
      const photos = list => list.flatMap(card => [...card.querySelectorAll('.portrait > img')]);
      const words = list => list.flatMap(card => [...card.children].filter(part => !part.classList.contains('portrait')));
      gsap.set(photos(cards), {xPercent: -110});
      gsap.set(words(cards), {opacity: 0, y: 22});
      ScrollTrigger.batch(cards, {start: 'top 80%', once: true, onEnter: batch => batch.forEach((card, n) => {
        gsap.to(photos([card]), {xPercent: 0, duration: 1.05, ease: 'power1.out', delay: n * .16, clearProps: 'transform'});
        gsap.to(words([card]), {opacity: 1, y: 0, duration: .9, ease, delay: n * .16 + .2, stagger: .05, clearProps: 'transform'});
      })});
    }

    // Platform cards' hover stack, after Concrete Management's portal (concretemanagement.ch/fr, its Portail
    // onBtnMouseEnter / onBtnMouseLeave read from main.js on 5 Nov 2026). On hover a portrait box opens at the card's
    // right: its clip runs from inset(90% 91% 92% 93%) to nothing, it turns from a tilt to straight and fades in, 1.8s
    // expo.out. Where Concrete's box cycles photos, ours holds the deal's capital stack (components.css says why): the
    // card's own layer, debt or equity by its eyebrow, fills from its floor over the same 1.8s, 0.15s in, and the two
    // labels rise 0.1s apart (1.2s power4.out, Concrete's button values). It fills once per hover; a loop would read as
    // loading. On leave it closes in 1.2s and tilts to a random ±15°. The grow and fade of the cards are CSS. Concrete
    // shows it over 767px; here from 1100px, where the card's right is clear of its text.
    const hoverCards = gsap.utils.toArray('.platform-pair > .platform-card');
    const roomy = matchMedia('(min-width: 1100px) and (hover: hover) and (pointer: fine)');
    if (hoverCards.length) {
      const shut = 'inset(90% 91% 92% 93%)';
      hoverCards.forEach(card => {
        const kind = (card.querySelector('.eyebrow') || {textContent: ''}).textContent.trim().toLowerCase();
        let box, fill, labels, play;
        card.addEventListener('mouseenter', () => {
          if (!roomy.matches) return;
          if (!box) {
            box = document.createElement('div');
            box.className = 'platform-stack';
            box.setAttribute('aria-hidden', 'true');
            box.append(...[['eq', 'equity', 'Equity'], ['debt', 'debt', 'Debt']].map(([key, layer, word]) => {
              const part = document.createElement('span');
              part.className = key + (layer === kind ? ' own' : '');
              if (layer === kind) part.append(document.createElement('i'));
              part.append(Object.assign(document.createElement('b'), {textContent: word}));
              return part;
            }));
            card.append(box);
            fill = box.querySelector('i');
            labels = [...box.querySelectorAll('b')];
            gsap.set(box, {clipPath: shut, rotate: gsap.utils.random(-15, 15)});
          }
          gsap.killTweensOf([box, fill, ...labels].filter(Boolean));
          play = gsap.timeline({defaults: {duration: 1.8, ease}})
            .to(box, {clipPath: 'inset(0% 0% 0% 0%)', rotate: 0, opacity: 1})
            .fromTo(labels, {yPercent: 140}, {yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: .1}, .3);
          if (fill) play.fromTo(fill, {scaleY: 0}, {scaleY: 1}, .15);
        });
        card.addEventListener('mouseleave', () => {
          if (!box) return;
          gsap.to(box, {clipPath: shut, opacity: 0, rotate: gsap.utils.random(-15, 15), duration: 1.2, ease, onComplete: () => play && play.kill()});
        });
      });

      // The row's height eases with the columns (components.css). Line wraps are steps, so when the narrowed card's
      // description wraps partway through the .8s grow, both cards would jump a line taller. Each description is
      // given, in px, its height at the end state's column width (1.5fr to 1fr, or 1fr each on leave), measured on a
      // hidden copy, and CSS eases between the two on the columns' curve. Inline heights are cleared after leave and on
      // resize, so the cards' natural layout takes over again. Same media query as the CSS grow.
      const pair = hoverCards[0].parentElement;
      const grows = matchMedia('(min-width: 851px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
      const texts = hoverCards.map(card => card.querySelector(':scope > p:not(.eyebrow):not(.platform-here)'));
      const heightAt = (card, text, column) => {
        const cs = getComputedStyle(card);
        const copy = text.cloneNode(true);
        copy.style.cssText = `position:absolute;visibility:hidden;height:auto;transition:none;width:${column - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth)}px`;
        card.append(copy);
        const h = copy.getBoundingClientRect().height;
        copy.remove();
        return h;
      };
      const settle = hovered => {
        if (!grows.matches) return;
        const room = pair.clientWidth - (parseFloat(getComputedStyle(pair).columnGap) || 0);
        // Both descriptions ease to one height, the taller end state's: where one card's text unwraps as the other's
        // wraps (1024), separate targets crossed mid-way and the row dipped 14px before rising again.
        const target = Math.max(...hoverCards.map((card, i) => texts[i] ? heightAt(card, texts[i], room * (hovered < 0 ? .5 : (i === hovered ? 1.5 : 1) / 2.5)) : 0));
        texts.forEach(text => {
          if (!text) return;
          if (!text.style.height) { text.style.height = text.getBoundingClientRect().height + 'px'; text.offsetHeight; }
          text.style.height = target + 'px';
        });
      };
      const release = () => texts.forEach(text => text && (text.style.height = ''));
      let resting;
      hoverCards.forEach((card, i) => {
        card.addEventListener('mouseenter', () => { clearTimeout(resting); settle(i); });
        card.addEventListener('mouseleave', () => { settle(-1); clearTimeout(resting); resting = setTimeout(() => { if (!pair.matches(':hover')) release(); }, 900); });
      });
      addEventListener('resize', release);
    }

    // Testimonials ticker, after Casa Momo's reviews (casamomo.at, a Framer Ticker, measured 5 Nov 2026; Tanya, 5 Nov:
    // "check how this section is animated [...] make the same"). The row drifts left at 40px/s without end, eases to a
    // stop under a mouse, and can be dragged, coasting on release (speed decays 7.5% a frame: a 300px flick runs on ~245px here, ~270px there). Each word of a quote sits
    // in its own mask, 100px low and tilted 8° on its bottom edge; a line's words rise together (1.3s expo.out) when the
    // line reaches the bottom of the viewport, as Casa Momo's do, with no delay between words. editorial.css (.ticking)
    // hides the arrows and lets cards keep their own height. Copies that fill the loop are hidden from assistive tech.
    const track = document.querySelector('.quote-track');
    if (track) {
      const section = track.closest('.testimonials');
      const originals = [...track.children];
      section.classList.add('ticking');
      const period = () => originals.length * (originals[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0));
      for (let n = Math.ceil(Math.max(innerWidth, screen.width) / period()) + 1; n > 0; n--) originals.forEach(card => {
        const copy = card.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.inert = true;
        track.append(copy);
      });

      // Words, grouped into lines by their page position, so the same line across every card rises on one trigger.
      const rows = new Map();
      track.querySelectorAll('.quote-card > p').forEach(quote => {
        const split = SplitText.create(quote, {type: 'words', mask: 'words', aria: 'none'});
        split.masks.forEach(mask => Object.assign(mask.style, {padding: '0 .06em .14em', margin: '0 -.06em -.14em'}));
        gsap.set(split.words, {y: 100, rotation: 8, transformOrigin: '50% 100%'});
        split.words.forEach((word, n) => {
          const key = Math.round(split.masks[n].getBoundingClientRect().top + scrollY);
          if (!rows.has(key)) rows.set(key, []);
          rows.get(key).push(word);
        });
      });
      rows.forEach(words => ScrollTrigger.create({trigger: words[0].parentElement, start: 'top bottom', once: true,
        onEnter: () => gsap.to(words, {y: 0, rotation: 0, duration: 1.3, ease, overwrite: true})}));

      // The drift, on gsap.ticker, only while the section is on screen or held.
      const state = {speed: 1};
      let offset = 0, coast = 0, span = period(), held = null, live = false;
      addEventListener('resize', () => { span = period(); });
      ScrollTrigger.create({trigger: section, start: 'top bottom', end: 'bottom top', onToggle: self => { live = self.isActive; }});
      gsap.ticker.add((time, dt) => {
        if (!live && !held) return;
        if (!held) {
          offset += (40 * state.speed + coast) * dt / 1000;
          coast = Math.abs(coast) < 1 ? 0 : coast * Math.pow(.925, dt / 16.7);
        }
        track.style.transform = `translate3d(${-(((offset % span) + span) % span)}px,0,0)`;
      });
      const pause = stop => gsap.to(state, {speed: stop ? 0 : 1, duration: .5, ease: 'power2.out', overwrite: true});
      track.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pause(true); });
      track.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pause(false); });
      track.addEventListener('pointerdown', e => {
        if (e.button) return;
        track.setPointerCapture(e.pointerId);
        held = {x: e.clientX, t: performance.now(), v: 0};
        coast = 0;
        track.classList.add('held');
      });
      track.addEventListener('pointermove', e => {
        if (!held) return;
        const now = performance.now(), dx = e.clientX - held.x;
        offset -= dx;
        held.v = -dx / Math.max(1, now - held.t) * 1000;
        held.x = e.clientX;
        held.t = now;
      });
      const release = () => {
        if (!held) return;
        coast = performance.now() - held.t < 100 ? held.v : 0; // a hand that stopped before letting go does not throw
        held = null;
        track.classList.remove('held');
      };
      track.addEventListener('pointerup', release);
      track.addEventListener('pointercancel', release);
    }

    // Drafted: the economics bars draw from the left (0.45s power3.out, 0.07s apart) once the scale is 90% down.
    if (document.querySelector('.scale-bar')) gsap.fromTo('.scale-bar', {scaleX: 0, transformOrigin: 'left center'}, {scaleX: 1, duration: .45, ease: 'power3.out', stagger: .07,
      scrollTrigger: {trigger: '.economics-scale', start: 'top 90%', once: true}});

    // Steps rail (Home, Tanya 5 Nov: "use animated vertical line as [...] on broker"): the bronze dash-dot line runs down
    // the steps' left edge and draws with its head 55% down the viewport, as brokers/rail.js does; each step's diamond
    // fills and its row wakes once the head reaches the diamond. home.css draws the line in one length per step, from its
    // diamond (--mid) to the next, so each row carries its own progress.
    // A row's number, title and paragraph split into masked lines, padded as lines() pads them, and rise (0.9s, 0.07s
    // apart) the first time the head reaches its diamond; until then the rail and the hollow diamond show the step to
    // come. Option D of the steps motion review, assets/website/steps-motion-options/ (Tanya, 5 Nov: "option D").
    // autoSplit re-splits on resize; a row that has risen stays risen.
    const steps = document.querySelector('.step-list');
    if (steps) {
      const rows = [...steps.children];
      const parts = rows.map(() => []), risen = new Set();
      rows.forEach((row, n) => [...row.children].forEach((part, k) => SplitText.create(part, {type: 'lines', mask: 'lines', aria: 'none', autoSplit: true, onSplit(split) {
        split.masks.forEach(mask => Object.assign(mask.style, {padding: '0 .22em .14em', margin: '0 -.22em -.14em'}));
        parts[n][k] = split.lines;
        gsap.set(split.lines, {yPercent: risen.has(n) ? 0 : 110});
      }})));
      const draw = () => {
        const box = steps.getBoundingClientRect(), mid = parseFloat(getComputedStyle(steps).getPropertyValue('--mid'));
        const head = innerHeight * .55 - box.top;
        rows.forEach((row, n) => {
          const from = row.offsetTop + mid, on = head >= from;
          row.style.setProperty('--p', Math.min(1, Math.max(0, (head - from) / row.offsetHeight)));
          row.classList.toggle('on', on);
          if (on && !risen.has(n)) {
            risen.add(n);
            gsap.to(parts[n].flat(), {yPercent: 0, duration: .9, ease, stagger: .07});
          }
        });
      };
      steps.classList.add('live');
      ScrollTrigger.create({trigger: steps, start: 'top bottom', end: 'bottom top', onUpdate: draw, onRefresh: draw});
      draw();
    }

    // Count-up, as on the Find and Cinematic options (Tanya, 29 Oct): each proof figure counts from 0 over 1.5s expo.out
    // as its block reveals. The digits are hidden from screen readers; an .sr-only twin carries the real figure.
    // [N] and "Limited" have no digits and stay as they are. Tabular numerals keep the width still while it counts.
    document.querySelectorAll('.proof strong').forEach(figure => {
      const node = [...figure.childNodes].find(child => child.nodeType === 3 && /\d/.test(child.nodeValue));
      if (!node) return;
      const target = Number(node.nodeValue.replace(/,/g, ''));
      const twin = document.createElement('span');
      twin.className = 'sr-only';
      twin.textContent = figure.textContent;
      figure.after(twin);
      figure.setAttribute('aria-hidden', 'true');
      const value = {i: 0};
      node.nodeValue = '0';
      gsap.to(value, {i: target, duration: 1.5, ease, scrollTrigger: {trigger: figure, start: 'top 88%', once: true},
        onUpdate: () => { node.nodeValue = Math.round(value.i).toLocaleString('en-US'); }});
    });
  });

  // Hero plate: with a fine pointer the photo leans toward it, 6° across its own box, easing 7% a frame, only while
  // the hero photo is in view. It sits at 1.03 (editorial.css) so a lean never shows the paper at its corners.
  const photo = document.querySelector('.quiet-photo > img');
  if (photo && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let box = null, frame = 0, x = 0, y = 0, toX = 0, toY = 0;
    const aim = event => {
      box ??= photo.getBoundingClientRect();
      toX = -6 * ((event.clientY - box.top - box.height / 2) / box.height);
      toY = 6 * ((event.clientX - box.left - box.width / 2) / box.width);
    };
    const stale = () => { box = null; };
    const step = () => {
      if (Math.abs(toX - x) > .01 || Math.abs(toY - y) > .01) {
        x += (toX - x) * .07; y += (toY - y) * .07;
        photo.style.transform = `scale(1.03) rotateX(${x}deg) rotateY(${y}deg)`;
      }
      frame = requestAnimationFrame(step);
    };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) {
        box = null;
        addEventListener('mousemove', aim, {passive: true});
        addEventListener('scroll', stale, {passive: true});
        addEventListener('resize', stale);
        frame = requestAnimationFrame(step);
      } else if (!entry.isIntersecting && frame) {
        cancelAnimationFrame(frame); frame = 0; toX = toY = 0;
        removeEventListener('mousemove', aim);
        removeEventListener('scroll', stale);
        removeEventListener('resize', stale);
      }
    }, {threshold: .1}).observe(photo.parentElement);
  }
})();
