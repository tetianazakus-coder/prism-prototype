// Solutions staircase rail. A dash-dot bronze line draws down the left margin from chapter 01 as
// the reader scrolls; rail.css steps chapters 02 and 03 one tread right and the line turns with
// them along each floor line, where a diamond fills as the line arrives.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const section = document.querySelector('.capabilities');
  if (!section) return;
  const pillars = [...section.querySelectorAll('.pillar')];
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'rail');
  svg.setAttribute('aria-hidden', 'true');
  section.prepend(svg);
  let path, segs = [], total = 0, nodes = [], frame = 0;

  const el = (tag, attrs, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return parent.appendChild(n);
  };
  // offsetTop/Left, not getBoundingClientRect: the pillars carry a .reveal translate until seen.
  const pos = n => { let x = 0, y = 0; for (; n && n !== section; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y }; };
  const diamond = (x, y, s = 5) => `M${x} ${y - s}L${x + s} ${y}L${x} ${y + s}L${x - s} ${y}Z`;

  function build() {
    svg.replaceChildren(); path = null;
    if (innerWidth < 1024) return;
    // The flag sits on chapter 01's number; the line runs only through the numbered sequence.
    const num = pillars[0].querySelector('.chapter-number');
    const left = pos(pillars[0]).x;
    const gap = Math.min(32, left * .6);
    const start = { x: left - gap, y: pos(num).y + num.offsetHeight / 2 };
    const pts = [start], marks = [];
    pillars.slice(1).forEach(p => {
      const x = pos(p).x - gap, y = pos(p).y;          // the pillar's border-top is the floor line
      const prev = pts[pts.length - 1];
      pts.push({ x: prev.x, y });
      if (x !== prev.x) pts.push({ x, y });
      marks.push({ x, y, to: pos(p).x, len: 0 });
    });
    const last = pillars[pillars.length - 1];
    pts.push({ x: pts[pts.length - 1].x, y: pos(last).y + last.offsetHeight * .85 });

    segs = []; total = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
      segs.push({ a, b, len, from: total }); total += len;
      for (const m of marks) if (m.x === b.x && m.y === b.y && !m.len) m.len = total;
    }
    const d = 'M' + pts.map(p => `${p.x} ${p.y}`).join('L');
    const defs = el('defs', {}), mask = el('mask', { id: 'rail-reveal', maskUnits: 'userSpaceOnUse' }, defs);
    path = el('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 24, 'stroke-dasharray': `${total} ${total}` }, mask);
    el('path', { d, class: 'rail-ink', mask: 'url(#rail-reveal)' });
    el('path', { d: diamond(start.x, start.y, 6), class: 'rail-flag' });
    el('path', { d: `M${start.x + 9} ${start.y - 6}L${start.x + 21} ${start.y}L${start.x + 9} ${start.y + 6}Z`, class: 'rail-flag' });
    nodes = marks.map(m => {
      const n = el('path', { d: diamond(m.x, m.y), class: 'rail-node' });
      el('line', { x1: m.x + 8, y1: m.y, x2: m.to, y2: m.y, class: 'rail-tick' });
      return { n, len: m.len };
    });
    tick();
  }

  // The head sits 55% down the viewport; vertical and horizontal runs both spend scroll distance,
  // so a stair turn draws across 64px of scroll instead of snapping in.
  function tick() {
    frame = 0;
    if (!path) return;
    let drawn = total;
    if (!still.matches) {
      const head = innerHeight * .55 - section.getBoundingClientRect().top;
      let budget = head - segs[0].a.y; drawn = 0;
      for (const s of segs) { if (budget <= 0) break; const use = Math.min(s.len, budget); drawn += use; budget -= use; }
    }
    path.setAttribute('stroke-dashoffset', total - drawn);
    for (const { n, len } of nodes) n.classList.toggle('on', drawn >= len);
  }

  addEventListener('scroll', () => { frame ||= requestAnimationFrame(tick); }, { passive: true });
  new ResizeObserver(() => build()).observe(section);
  still.addEventListener('change', tick);
  document.fonts?.ready.then(build);
  build();
})();
