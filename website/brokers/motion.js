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
  // The Nest's padding, still cut its loop in "large" (Tanya, 26 Oct). aria 'none' leaves the lines
  // readable as they are: SplitText's own label runs a title's two lines together ("firm.Without").
  const lines = (title, delay) => {
    SplitText.create(title, {type: 'lines', mask: 'lines', aria: 'none', autoSplit: true, onSplit(split) {
      split.masks.forEach(mask => Object.assign(mask.style, {paddingBottom: '.14em', marginBottom: '-.14em'}));
      return gsap.fromTo(split.lines, {yPercent: 110, opacity: 0}, {yPercent: 0, opacity: 1, duration: 1.05, ease, stagger: .06,
        delay: delay || 0, scrollTrigger: delay === undefined ? {trigger: title, start: 'top 82%', once: true} : undefined});
    }});
  };

  document.fonts.ready.then(() => {
    // Hero, on load, at The Nest's delays: eyebrow, photo 0.1s, copy 0.15s, title lines 0.2s.
    const hero = document.querySelector('.hero');
    reveal(hero.querySelector('.eyebrow'));
    reveal(hero.querySelector('.hero-visual'), .1);
    reveal(hero.querySelector('.hero-lower'), .15);
    lines(hero.querySelector('h1'), .2);
    root.classList.remove('motion-pending');

    document.querySelectorAll('main section h2').forEach(title => lines(title));

    // Blocks, each on its own trigger as The Nest wraps them. A container that holds a title reveals its other
    // children instead, so no title moves twice.
    const picked = gsap.utils.toArray('.section-label, .proof > div, .problem-body, .desk-line, .pillar > *, .section-heading > *, .walk-stage, .territory-grid > *, .testimonial-grid > *, .roi-comparison, .plans > article, .pricing-footnote, .comparison, .faq-grid > *, .final-grid > *')
      .flatMap(block => block.querySelector('h2') ? [...block.children] : block)
      .filter(block => block.tagName !== 'H2');
    const blocks = [...new Set(picked)];
    blocks.filter(block => !blocks.some(other => other !== block && other.contains(block))).forEach(block => reveal(block));

    // Drafted: the economics bars draw from the left (0.45s power3.out, 0.07s apart) once the scale is 90% down.
    gsap.fromTo('.scale-bar', {scaleX: 0, transformOrigin: 'left center'}, {scaleX: 1, duration: .45, ease: 'power3.out', stagger: .07,
      scrollTrigger: {trigger: '.economics-scale', start: 'top 90%', once: true}});
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
