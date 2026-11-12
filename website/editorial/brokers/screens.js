/* Product screens for the three capability chapters (Tanya, 29 Oct: "can we make some animations for that
   screens/flows?", then "do all three"). Each crop marked data-screen gets an HTML rebuild of its prototype screen in
   place of the PNG, which stays in the markup as the fallback if this script never runs. Styles are in screens.css.
   With motion on, each screen plays its flow once when its crop is 75% down the viewport and rests on the last frame:
   - leads: a new opportunity arrives at the top and its 24-hour clock runs; View opens its record, Accept unlocks the
     borrower in the same modal, and its footer Close shows the row Accepted
   - lenders: Texas, then Multifamily, narrow the network (28 to 14 to 9) and one lender is saved to the shortlist
   - deal: the broker logs each lender's reply from its Outreach dropdown, then Request execution support opens the prototype's request page
     and three needs are ticked; the page then scrolls to the documents it will ask for, and the cursor rests on Send
     request
   - advisors (12 Nov, pillar 03, in place of leads): the borrower's directory narrows to advisors who work Texas and
     the pointer rests on View profile
   The walkthrough ("See a deal go from posted to quoted", 2 Nov) adds three more on one deal, played as one
   click-to-play film across its tabs: create (Riverside's facts go in and 15 lenders match), matches (one more lender
   saved, the loan request sent to four) and contacted (two replies logged).
   The flows use only the prototype's own screens, enums and demo data; nothing in them is a shipped-product claim.
   Home's "Built for every side of the deal" uses the same engine for its three side screens (Tanya, 5 Nov: "make nav
   sidebar collapsed; make same interaction/animation logic for dropdown/status change as on broker page"): the
   broker's Deals board, the borrower's My deals and the lender's Requests, rebuilt from the screenshots they replace
   with the collapsed rail. A side plays when it opens (the open one first when the list is 75% down the viewport), as
   one short story each: a status picked from the board's own select, an advisor taking a deal, a request arriving
   and being saved. Their sample rows are the screenshots' sandbox data [~]. */
(() => {
  'use strict';
  const crops = [...document.querySelectorAll('[data-screen]')];
  // Photos in a screen resolve from this script's folder, so Brokers, /lp/broker and Home all reach img/.
  const IMG = new URL('../img/', document.currentScript?.src || location.href).href;
  if (!crops.length) return;
  const animate = document.documentElement.classList.contains('motion') && window.gsap && window.ScrollTrigger;

  const svg = (d, size = 16, width = 2) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  // The rail icons are the prototype's own paths; the rest are the Lucide glyphs it uses elsewhere.
  const I = {
    home: '<path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
    deals: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>',
    lenders: '<path d="M3 9 12 4l9 5"/><path d="M5 10v8M9.7 10v8M14.3 10v8M19 10v8"/><path d="M3 21h18"/>',
    opps: '<path d="M17 18a5 5 0 0 0-10 0"/><circle cx="12" cy="9" r="3"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3M6.38 18.7 4 21M17.64 18.67 20 21"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    chevR: '<path d="m9 6 6 6-6 6"/>',
    filter: '<path d="M3 6h18M7 12h10M10 18h4"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    kebab: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    board: '<rect x="3" y="3" width="7" height="13" rx="1"/><rect x="14" y="3" width="7" height="9" rx="1"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M10 8h4M18 16h4"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
  };
  // The broker's menu by default; Home's borrower and lender screens pass their own. Home's screens also pass the
  // person's initials, and their rail ends as the prototype's does: Help, Account and the avatar under a rule.
  const rail = (active, menu = ['home', 'deals', 'lenders', 'opps', 'msg', 'alarm', 'book', 'users'], who) => `<div class="ps-rail"><div class="ps-rail-top"><span class="ps-mark"></span></div><div class="ps-rail-menu">${
    menu.map(name =>
      `<i class="${name === active ? 'on' : ''}${name === 'book' ? ' gap' : ''}">${svg(I[name])}</i>`).join('')}</div>${
    who ? `<div class="ps-rail-foot"><i>${svg(I.help)}</i><i>${svg(I.card)}</i></div><div class="ps-rail-me"><span>${who}</span></div>` : ''}</div>`;
  // Home's toolbar parts: the prototype's search field and multiselect trigger (.inp, .ms__btn).
  const search = (placeholder, width) => `<span class="ps-search" style="width:${width}px">${svg(I.search, 15)}${placeholder}</span>`;
  const ms = label => `<span class="ps-ms">${label} <span class="ps-any">Any</span><span class="ps-chev">${svg(I.chev, 15)}</span></span>`;
  const check = on => `<span class="ps-check${on ? ' on' : ''}">${svg(I.check, 12, 3)}</span>`;
  const plus = n => n ? `<span class="ps-plus">+${n}</span>` : '';
  const cursor = '<svg class="ps-cursor" viewBox="0 0 24 24"><path d="M4 2.5 19.5 13l-7 1.4 4.2 7.2-2.6 1.5-4.2-7.3L5 20.5z" fill="#0f172a" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg><span class="ps-ripple"></span>';
  // Outreach dispositions, DISPOSITION in the prototype (the repo's lenders/types.ts): label and dot colour.
  const DISPOSITION = {
    contact: ['Not yet contacted', '#b48b2b'], silent: ['Has not responded', '#586478'],
    review: ['Interested - under review', '#023e8a'], notfit: ['Not a fit', '#dc2626'], quoted: ['Quoted', '#479e28']
  };
  // The Deals board's stages, STAGES in the prototype (deals-prototype.html), with their tones as dot colours.
  const STAGE = {
    Leads: ['Leads', '#586478'], Screening: ['Screening', '#b48b2b'], Outreach: ['Outreach', '#023e8a'], Quoting: ['Quoting', '#023e8a'],
    Processing: ['Processing', '#023e8a'], Funded: ['Funded', '#479e28'], Dead: ['Dead', '#dc2626'], 'On hold': ['On hold', '#586478']
  };
  const outreach = (key, labels = DISPOSITION) => `<span class="ps-sel"><span class="ps-dot" style="background:${labels[key][1]}"></span><span class="ps-st" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${labels[key][0]}</span><span class="ps-chev">${svg(I.chev)}</span></span>`;
  // The Outreach list a row's select opens; screens.js places it under the select.
  const outreachPop = (labels = DISPOSITION) => `<div class="ps-pop">${Object.entries(labels).map(([v, [label, colour]]) =>
    `<span class="ps-pi" data-v="${v}"><span class="ps-dot" style="background:${colour};width:8px;height:8px"></span>${label}<span class="ps-tick">${svg(I.check, 14)}</span></span>`).join('')}</div>`;
  // #/deal/riverside down to the lenders card: the deal screen, Matched lenders and Lenders contacted all open on it.
  const dealHead = () => `<div class="ps-crumb">Deals</div>
    <div class="ps-deal-head"><div class="ps-h1">Riverside Apartments Acquisition</div>
      <span class="ps-sel" style="width:122px"><span class="ps-dot" style="background:#012758"></span>Outreach<span class="ps-chev">${svg(I.chev)}</span></span>
      <span class="ps-btn lg" data-exec>Request execution support</span><span class="ps-btn lg">Edit deal</span><span class="ps-kebab">${svg(I.kebab)}</span></div>
    <div class="ps-card ps-row-card"><b>Deal summary</b><span>Updated 4 Aug ${svg(I.chevR)}</span></div>`;
  // A Selected lenders row: the lender, its range, Multifamily and its Outreach select.
  const lenderRow = (name, sub, range, more, key, attr = '') => `<div class="ps-tr" data-cur="${key}" ${attr}><span>${check(false)}</span><span><b>${name}</b><span class="ps-sub">${sub}</span></span><span>${range}</span><span>Multifamily${plus(more)}</span><span>${outreach(key)}</span><span class="ps-kebab">${svg(I.kebab)}</span><i class="ps-wash" style="background:#ebeff6"></i></div>`;
  // New deal form parts (#/deals/new, .frm): a field with its label, a text input and a select trigger. data-in and
  // data-sel name the ones a flow fills.
  const field = (label, required, control, cls = '') => `<div class="ps-field ${cls}"><span class="ps-flabel">${label}${required ? ' <i>*</i>' : ''}</span>${control}</div>`;
  const input = (placeholder, key, prefix) => `<span class="ps-input ps-fin"${key ? ` data-in="${key}"` : ''}>${prefix ? `<span class="ps-pre">${prefix}</span>` : ''}<span class="ps-v">${placeholder}</span></span>`;
  const select = (value, key, set) => `<span class="ps-sel ps-fsel${set ? ' set' : ''}"${key ? ` data-sel="${key}"` : ''}><span class="ps-v">${value}</span><span class="ps-chev">${svg(I.chev)}</span></span>`;
  const options = (key, items) => `<div class="ps-pop" data-pop="${key}">${items.map(item => `<span class="ps-pi">${item}</span>`).join('')}</div>`;

  // Each screen: the width it is laid out at (the browser window it pretends to be), the height its story needs in
  // view, and its markup. The layout is fluid above that width, so a wide crop gets a wider window, not empty space.
  const SCREENS = {
    leads: {width: 900, fit: 528, html: () => {
      const row = (amount, type, sub, place, time, status, cls = '') => `<div class="ps-tr ${cls}"><span>${amount}</span><span>${type}<span class="ps-sub">${sub}</span></span><span>${place}</span><span>${time}</span><span>${status}</span><span><span class="ps-btn">${svg(I.eye, 14)}View</span></span><i class="ps-wash" style="background:#f6f1e6"></i></div>`;
      // The record the View button opens: the prototype's oppModal for opp-dallas, its demo data verbatim (San Antonio
      // until 2 Nov, when Tanya picked the Dallas record as the example). The
      // borrower stays locked until Accept (Tony's 27 Aug row), then the same modal shows who it is.
      const fact = (k, v) => `<div class="ps-fact"><span>${k}</span><span>${v}</span></div>`;
      return `<div class="ps-app ps-opps">${rail('opps')}<div class="ps-main">
        <div class="ps-h1">Opportunities</div>
        <p class="ps-lede">Routed to you by property type and market. Accept or decline within 24 hours, or it passes to the next broker.</p>
        <div class="ps-card" data-trim><div class="ps-card-head"><b>All opportunities</b><span class="ps-due" data-due>1 needs your response</span></div>
          <div class="ps-th"><span>Amount</span><span>Property type</span><span>Location</span><span>Time remaining</span><span>Status</span><span></span></div>
          ${row('$2.75M', 'Multifamily', 'Refinance', 'Dallas, TX',
            '<span class="ps-swap"><span class="ps-badge ps-gold ps-time" data-clock>23h 59m</span><span class="ps-unset" data-answered style="opacity:0">Answered in time</span></span>',
            '<span class="ps-swap"><span class="ps-badge ps-gold" data-needs>Needs response</span><span class="ps-badge ps-green" data-accepted style="opacity:0">Accepted</span></span>', 'ps-new')}
          ${row('$6.75M', 'Retail-multi tenant', 'Acquisition', 'San Antonio, TX', '<span class="ps-badge ps-gold ps-time" data-tick>13h 59m</span>', '<span class="ps-badge ps-gold">Needs response</span>')}
          ${row('$3.2M', 'Mixed-use', 'Acquisition', 'Tampa, FL', '<span class="ps-unset">Answered in time</span>', '<span class="ps-badge ps-red">Declined</span>')}
          ${row('$5.0M', 'Industrial', 'Refinance', 'Houston, TX', '<span class="ps-unset">Window closed 2 Sep</span>', '<span class="ps-badge ps-muted">Reassigned</span>')}
          ${row('$4.0M', 'Multifamily', 'Construction', 'Austin, TX', '<span class="ps-unset">Answered in time</span>', '<span class="ps-badge ps-green">Accepted</span>')}
          ${row('$1.9M', 'Retail-multi tenant', 'Refinance', 'Dallas, TX', '<span class="ps-unset">Answered in time</span>', '<span class="ps-badge ps-green">Accepted</span>')}
          ${row('$7.4M', 'Hotel/motel', 'Acquisition', 'Fort Worth, TX', '<span class="ps-unset">Answered in time</span>', '<span class="ps-badge ps-red">Declined</span>')}
          ${row('$1.1M', 'Multifamily', 'Refinance', 'Waco, TX', '<span class="ps-unset">Answered in time</span>', '<span class="ps-badge ps-green">Accepted</span>')}
          ${row('$2.4M', 'Self-storage', 'Acquisition', 'San Marcos, TX', '<span class="ps-unset">Window closed 24 Aug</span>', '<span class="ps-badge ps-muted">Reassigned</span>')}
          ${row('$6.1M', 'Multifamily', 'Refinance', 'Houston, TX', '<span class="ps-unset">Answered in time</span>', '<span class="ps-badge ps-green">Accepted</span>')}
        </div></div>
        <div class="ps-scrim" data-modal><div class="ps-mdl">
          <div class="ps-mhd"><div class="ps-mttl"><b>$2.75M Multifamily refinance in Dallas, TX</b><span>Received today, 9:12 AM · submitted 5 Sep</span></div>
            <span class="ps-left" data-pill>${svg(I.clock, 13)}<span data-tick>23h 59m</span>left</span><span class="ps-x" data-close>${svg(I.x)}</span></div>
          <div class="ps-mbd" data-mbody>
            <div class="ps-note ok" data-ok style="display:none">${svg(I.check, 14)}<span>You accepted this opportunity. <u>Dallas Multifamily Refinance</u> is on your board at Leads, and the borrower's contact details are below.</span></div>
            <b class="ps-sec">The deal</b>
            <p class="ps-prose">Rate-and-term refinance of a 36-unit garden-style community in Old East Dallas. The sponsor self-manages, the asset has held above 90% occupancy for two years, and the existing bank loan matures in January.</p>
            ${fact('Loan amount', '$2.75M')}${fact('Leverage', '67% LTV')}${fact('Property type', 'Multifamily')}${fact('Execution type', 'Agency (Fannie Mae)')}
            ${fact('Location', 'Dallas, TX')}${fact('Transaction', 'Refinance · $2.1M outstanding · matures Jan 2027')}${fact('Units', '36 units · 91.2% occupied')}${fact('Year built', '2001')}
            <b class="ps-sec ps-sec-b">Borrower</b>
            <div class="ps-note" data-lock>${svg(I.lock, 14)}<span>Name, company, email and phone unlock the moment you accept.</span></div>
            <div data-who style="display:none">${fact('Name', 'Marisol Delgado')}${fact('Company', 'Trinity Bend Capital · Managing Partner')}${fact('Email', '<span style="color:#012758">m.delgado@trinitybend.com</span>')}${fact('Phone', '(214) 555-0163')}</div>
          </div>
          <div class="ps-mft"><span class="ps-btn danger" data-decline>Decline</span><span class="ps-btn primary" data-accept>Accept opportunity</span><span class="ps-btn outline" data-done style="display:none">Close</span><span class="ps-btn primary" data-open style="display:none">Open the deal</span></div>
        </div></div></div>`;
    }},
    lenders: {width: 1080, fit: 545, html: () => {
      // The Lenders directory's own demo lenders, A to Z as it lists them; tx and mf mark Texas and Multifamily. Nine
      // carry both, so the filtered table holds the 9 its count reads and still runs past the crop.
      const LENDERS = [
        ['Amplify Credit Union', 'Marisol Reyes · Credit union', '$1.0M – $10.0M', 'Multifamily', 1, 'TX', 0, 1, 1, true],
        ['Anchor Senior Housing Capital', 'Ruth Delgado · Agency lender', '$5.0M – $45.0M', 'Senior housing', 2, 'TX · AZ', 1, 1, 0],
        ['Atlantic Coast Credit Union', 'Miles Barrera · Credit union', '$1.0M – $8.0M', 'Industrial', 2, 'GA · FL', 1, 0, 0],
        ['Bayfront Hospitality Finance', 'Owen Castellanos · Non-bank / investment fund', '$5.0M – $60.0M', 'Hotel/motel', 2, 'FL · GA', 1, 0, 0],
        ['Calder & Bly Real Estate Credit', 'James Calder · Debt fund', '$20.0M – $200.0M', 'Office-multi tenant', 2, 'NY · NJ', 2, 0, 0],
        ['Cobalt Street Capital', 'Sofia Marchetti · Debt fund', '$2.0M – $50.0M', 'Retail-multi tenant', 2, 'TX · NY', 1, 1, 0],
        ['Fielding Life & Annuity', 'Robert Nakamura · Life insurance company', '$15.0M – $100.0M', 'Multifamily', 2, 'AZ · TX', 1, 1, 1],
        ['Gulf Bridge Credit', 'Ana Ferreira · Debt fund', '$5.0M – $40.0M', 'Hotel/motel', 2, 'FL · AL', 3, 0, 0],
        ['Harbor Point Advisors', 'Alexis Nwosu · Non-bank / investment fund', '$2.0M – $30.0M', 'Multifamily', 2, 'TX · LA', 1, 1, 1],
        ['Meridian Debt Partners', 'Alice Chen · Non-bank / investment fund', '$1.0M – $15.0M', 'Retail-multi tenant', 2, 'TX · OK', 0, 1, 0],
        ['Northline Capital', 'Dana Ortiz · Life insurance company', '$10.0M – $75.0M', 'Multifamily', 2, 'AZ · CA', 2, 1, 1],
        ['Presidio Structured Capital', 'Victor Hale · Non-bank / investment fund', '$8.0M – $80.0M', 'Multifamily', 1, 'CA · NV', 2, 1, 1],
        ['Ridgeway Mezzanine', 'Hannah Oyelaran · Debt fund', '$2.0M – $20.0M', 'Multifamily', 2, 'TX · FL', 2, 1, 1],
        ['Sandbox Debt Fund', 'Lena Lender · Debt fund', '$1.0M – $25.0M', 'Multifamily', 3, 'TX · FL', 2, 1, 1],
        ['Sunbelt Agency Group', 'Nadia Coleman · Agency lender', '$3.0M – $50.0M', 'Multifamily', 2, 'TX · OK', 3, 1, 1],
        ['Trailhead Construction Finance', 'Emma Bergström · Non-bank / investment fund', '$4.0M – $40.0M', 'Build to rent', 2, 'TX · AZ', 2, 1, 1]
      ];
      const opt = (label, key) => `<span class="ps-opt"${key ? ` data-opt="${key}"` : ''}>${check(false)}${label}</span>`;
      return `<div class="ps-app ps-lenders">${rail('lenders')}<div class="ps-main">
        <div class="ps-h1">Lenders</div>
        <span class="ps-seg"><span class="on">Network <em data-network>28</em></span><span>Prospector</span></span>
        <div class="ps-body"><div class="ps-filters"><b>Filters</b>
            <span class="ps-short">${svg(I.bookmark)}My shortlist<strong data-short>3</strong></span>
            <div class="ps-fgroup"><p>State ${svg(I.chev)}</p><span class="ps-input">${svg(I.search, 14)}Search states…</span>
              ${opt('Texas', 'tx')}${opt('Georgia')}${opt('Arizona')}${opt('Florida')}<span class="ps-more">Show all 51</span></div>
            <div class="ps-fgroup"><p>Property type ${svg(I.chev)}</p>
              ${opt('Multifamily', 'mf')}${opt('Industrial')}${opt('Mixed-use')}${opt('Retail-multi tenant')}<span class="ps-more">Show all 24</span></div>
          </div>
          <div class="ps-card" data-trim><div class="ps-tools"><span class="ps-icon-btn">${svg(I.filter)}</span><span class="ps-input">${svg(I.search, 14)}Name, institution or title</span><span class="ps-toggle"></span>Group by account<span class="ps-icon-btn" style="margin-left:auto">${svg(I.gear)}</span></div>
            <div class="ps-th"><span>${check(false)}</span><span></span><span>Lender</span><span>Loan range</span><span>Property type</span><span>State</span></div>
            ${LENDERS.map(([name, sub, range, prop, more, states, moreStates, tx, mf, prospector]) =>
              `<div class="ps-tr" data-tx="${tx}" data-mf="${mf}"${name.startsWith('Fielding') ? ' data-save' : ''}><span>${check(false)}</span><span class="ps-bm">${svg(I.bookmark)}</span><span><span class="ps-nm"><b>${name}</b>${prospector ? '<span class="ps-badge ps-blue">Prospector</span>' : ''}</span><span class="ps-sub">${sub}</span></span><span>${range}</span><span>${prop}${plus(more)}</span><span>${states}${plus(moreStates)}</span></div>`).join('')}
          </div></div></div><span class="ps-tip">Save to your shortlist</span></div>`;
    }},
    deal: {width: 1020, fit: 560, html: () => {
      const lender = lenderRow;
      const need = (title, text, key) => `<div class="ps-need"${key ? ` data-need="${key}"` : ''}>${check(false)}<span><b>${title}</b><span class="ps-sub" style="font-size:13px">${text}</span></span></div>`;
      const have = (label, value) => `<div class="ps-have"><span>${label}</span><strong>${value}</strong></div>`;
      return `<div class="ps-app ps-deal">${rail('deals')}<div class="ps-main">
        <div class="ps-scene" data-scene="deal">
          ${dealHead()}
          <div class="ps-card ps-lend" data-trim><div class="ps-card-head"><b>Lenders for this deal</b><span class="ps-btn primary">Send loan request</span></div>
            <span class="ps-seg"><span>Matches <em>15</em></span><span class="on">Selected lenders <em>7</em></span></span>
            <div class="ps-th"><span>${check(false)}</span><span>Lender</span><span>Loan range</span><span>Property type</span><span>Outreach</span><span></span></div>
            ${lender('Lena Lender', 'Principal · Sandbox Debt Fund · Debt fund', '$1.0M – $25.0M', 3, 'review', '')}
            ${lender('Nadia Coleman', 'Managing Director, Agency · Sunbelt Agency Group', '$3.0M – $50.0M', 2, 'silent', 'data-reply="review"')}
            ${lender('Dana Ortiz', 'SVP, Real Estate Finance · Northline Capital', '$10.0M – $75.0M', 2, 'contact', '')}
            ${lender('Alexis Nwosu', 'Managing Partner · Harbor Point Advisors', '$2.0M – $30.0M', 2, 'contact', '')}
            ${lender('Hannah Oyelaran', 'Principal · Ridgeway Mezzanine', '$2.0M – $20.0M', 2, 'contact', '')}
            ${lender('Victor Hale', 'Managing Director · Presidio Structured Capital', '$8.0M – $80.0M', 1, 'contact', '')}
            ${lender('Colin Marsh', 'Director · Harbor Point Advisors', '$1.0M – $25.0M', 1, 'contact', '')}
          </div>
          ${outreachPop()}
        </div>
        <div class="ps-scene" data-scene="request" style="opacity:0;visibility:hidden">
          <div class="ps-crumb">Deals <s>›</s> Riverside Apartments Acquisition</div>
          <div class="ps-h1">Request execution support</div>
          <p class="ps-lede">The team works Riverside Apartments Acquisition with you. Tell us what you need and where the borrower relationship stands; we will come back with anything still missing.</p>
          <div class="ps-req"><div class="ps-req-main"><div class="ps-card ps-req-card"><b>What do you need from us?</b>
              ${need('Financial model', 'Sources and uses, operating projections and debt sizing, in Excel.')}
              ${need('Lender-ready package', 'The executive summary and the submission package a lender receives.', 1)}
              ${need('Credit memo', 'The underwritten view — what the deal sizes to, and what the binding constraint is.', 2)}
              ${need('Lender outreach', 'The team works the matching and the lender follow-up with you.', 3)}</div>
              <div class="ps-card ps-supply"><b>What we will ask you to supply</b>
                ${['PFS', 'SREO', 'Bio', 'Offering memorandum (OM)', 'Purchase agreement'].map(doc => `<div class="ps-doc"><span>${doc}</span>${svg(I.upload)}</div>`).join('')}</div>
              <div class="ps-foot"><span class="ps-btn ghost">Cancel</span><span class="ps-btn primary" data-send>Send request</span></div></div>
            <div class="ps-card ps-req-side"><b style="font-size:16px;font-weight:600">What we already have</b><span class="ps-sub" style="margin-top:10px;font-size:13px">Taken from the deal — you do not need to send any of it again.</span>
              ${have('The loan request', '$4.5M · Acquisition')}${have('The property', 'Multifamily · Austin, TX')}${have('The sponsor', 'Brightwater Residential · 2 principals')}${have('Sources and uses', '3 sources, 7 uses')}</div></div>
        </div></div></div>`;
    }},
    // The walkthrough (#walkthrough) plays the next three as one story on the same deal: Riverside is created, its
    // matches get a loan request, and its lenders' replies are logged.
    // New deal (#/deals/new, measured filled at 1440 on 2 Nov). The Matched lenders card stays empty until loan
    // amount, property type and state are all set (draftReady), then shows the prototype's own count for Riverside's
    // facts: 15 of 28, 9 strong and 6 partial.
    create: {width: 1180, fit: 640, html: () => `<div class="ps-app ps-create">${rail('deals')}<div class="ps-main"><div data-page>
        <div class="ps-crumb">Deals</div>
        <div class="ps-h1">New deal</div>
        <p class="ps-lede">Only the facts lenders match on. Your contact details come from your profile, so the form never asks for them again.</p>
        <div class="ps-frm"><div class="ps-frm-col">
            <div class="ps-card ps-fcard"><b class="ps-ftitle">Deal information</b>
              ${field('Deal name', true, input('e.g. $12MM Acquisition | Riverside Apartments, Houston, TX', 'name'))}
              <span class="ps-help" data-left>80 characters left</span>
              ${field('Loan amount', true, input('12,000,000', 'amt', '$'), 'ps-amt')}
              <div class="ps-row" style="--n:2">${field('Property type', true, select('Select…', 'prop'))}${field('Execution type <span>(optional)</span>', false, select('Not sure yet — keep matching broad', 'exec', true))}</div>
              <span class="ps-flabel ps-tx">Transaction</span><span class="ps-seg"><span class="on">Acquisition</span><span>Refinance</span><span>Construction</span></span>
              <div class="ps-row" style="--n:3">${field('Purchase price', false, input('8,000,000', '', '$'))}${field('Under contract?', false, select('Not set', '', true))}${field('Target closing date', false, input('e.g. 15 Nov 2026'))}</div>
            </div>
            <div class="ps-card ps-fcard"><b class="ps-ftitle">Property location</b>
              ${field('Street address', false, input('6149 N Scottsdale Rd'))}
              <div class="ps-row" style="--n:3">${field('City', false, input('Houston'))}${field('State', true, select('Select…', 'state'))}${field('Zip', true, input('77002'))}</div>
            </div>
            <div class="ps-card ps-fcard"><b class="ps-ftitle">Property details</b>
              <div class="ps-row" style="--n:4">${field('Units', true, input('42'))}${field('Square footage', false, input('38500'))}${field('Year built', true, input('2016'))}${field('Occupancy %', false, input('93'))}</div>
            </div></div>
          <div class="ps-frm-rail">
            <div class="ps-card ps-fcard" data-mpv><b class="ps-ftitle">Matched lenders</b>
              <p class="ps-empty" data-empty>Add loan amount, property type and state — matches preview here before you save.</p>
              <div data-count style="display:none"><div class="ps-big" data-n>0</div><p class="ps-mpv-sub">of 28 lenders in the network match this deal so far</p>
                <p class="ps-bands"><span><b data-strong>0</b> strong</span><span><b data-partial>0</b> partial</span></p></div></div>
            <div class="ps-card ps-fcard"><div class="ps-tips"><b>Make this deal stronger</b><ul>
                <li>Execution type narrows matching to strong (85+) fits — blank keeps it broad.</li>
                <li>Drop in what you have — rent roll, T-12, sponsor PFS. Complete packages get faster responses.</li>
                <li>In the overview: the plan, cap rate, submarket — for a value-add, rehab scope, costs, status.</li></ul></div>
              <span class="ps-btn white ps-ai">✦ Build from documents with AI</span></div>
          </div></div></div>
        ${options('prop', ['Hotel/motel', 'Industrial', 'Mixed-use', 'Multifamily', 'Office-multi tenant', 'Retail-multi tenant'])}
        ${options('exec', ['Not sure yet — keep matching broad', 'Agency (Fannie Mae)', 'Agency (Freddie Mac)', 'Balance sheet debt', 'Bridge / short-term debt (<3 yrs)'])}
        ${options('state', ['South Dakota (SD)', 'Tennessee (TN)', 'Texas (TX)', 'Utah (UT)', 'Vermont (VT)'])}
      </div></div>`},
    // Riverside's Matches tab (#/deal/riverside, the prototype's demo lenders in its own order). Three are already
    // selected; Save to deal on Alexis Nwosu makes four, and Send loan request opens the prototype's send dialog.
    matches: {width: 1080, fit: 600, html: () => {
      const tick = svg(I.check, 12, 2.4);
      const row = (name, sub, range, prop, more, exec, moreExec, selected, attr = '') => `<div class="ps-tr"${selected ? ' data-picked' : ''} ${attr}><span>${check(false)}</span><span><b>${name}</b><span class="ps-sub">${sub}</span></span><span>${range}</span><span>${prop}${plus(more)}</span><span>${exec}${plus(moreExec)}</span>
        <span class="ps-acts"><span class="ps-swap">${selected
          ? `<span class="ps-badge ps-green" data-chip>${tick}Selected</span><span class="ps-badge ps-green" data-sent style="opacity:0">${tick}Request sent</span>`
          : `<span class="ps-btn" data-savebtn>Save to deal</span><span class="ps-badge ps-green" data-chip style="opacity:0">${tick}Selected</span><span class="ps-badge ps-green" data-sent style="opacity:0">${tick}Request sent</span>`}</span><span class="ps-kebab">${svg(I.kebab)}</span></span><i class="ps-wash" style="background:#ebeff6"></i></div>`;
      const to = (name, sub) => `<div class="ps-to">${check(true)}<span><b>${name}</b><span class="ps-sub">${sub}</span></span></div>`;
      return `<div class="ps-app ps-deal ps-matches">${rail('deals')}<div class="ps-main"><div class="ps-scene">
        ${dealHead()}
        <div class="ps-card ps-lend" data-trim><div class="ps-card-head"><b>Lenders for this deal</b><span class="ps-btn primary" data-sendreq>Send loan request</span></div>
          <span class="ps-seg"><span class="on">Matches <em>15</em></span><span>Selected lenders <em data-selcount>3</em></span></span>
          <div class="ps-tools"><span class="ps-input">${svg(I.search, 14)}Name, institution or title</span><span class="ps-toggle"></span>Group by account<span class="ps-muted-r">8 accounts</span></div>
          <div class="ps-th"><span>${check(false)}</span><span>Lender</span><span>Loan range</span><span>Property type</span><span>Execution type</span><span></span></div>
          ${row('Harbor Point Advisors', 'Alexis Nwosu · Non-bank / investment fund', '$2.0M – $30.0M', 'Multifamily', 2, 'Agency (Fannie Mae)', 2, false, 'data-add')}
          ${row('Harbor Point Advisors', 'Colin Marsh · Non-bank / investment fund', '$1.0M – $25.0M', 'Multifamily', 1, 'Agency (Fannie Mae)', 1, false)}
          ${row('Sandbox Debt Fund', 'Lena Lender · Debt fund', '$1.0M – $25.0M', 'Multifamily · Industrial', 2, 'Agency (Fannie Mae)', 4, true)}
          ${row('Sunbelt Agency Group', 'Nadia Coleman · Agency lender', '$3.0M – $50.0M', 'Multifamily', 2, 'Agency (Fannie Mae)', 3, true)}
          ${row('Sunbelt Agency Group', 'Ethan Park · Agency lender', '$3.0M – $50.0M', 'Multifamily · Senior housing', 1, 'Agency (Fannie Mae)', 3, false)}
          ${row('Sunbelt Agency Group', 'Monique Leclair · Agency lender', '$1.0M – $20.0M', 'Multifamily', 1, 'Agency (Fannie Mae)', 2, false)}
          ${row('Sunbelt Agency Group', 'Renée Alvarado · Agency lender', '$3.0M – $45.0M', 'Multifamily · Mixed-use', 0, 'Agency (Fannie Mae)', 2, false)}
          ${row('Harbor Point Advisors', 'Yara Haddad · Non-bank / investment fund', '$3.0M – $35.0M', 'Multifamily · Mixed-use', 0, 'Agency (Fannie Mae)', 1, false)}
        </div></div>
        <div class="ps-scrim" data-modal><div class="ps-mdl ps-send">
          <div class="ps-mhd"><div class="ps-mttl"><b>Send loan request</b><span>Riverside Apartments Acquisition · $4.5M · one request, every recipient sees the same package</span></div><span class="ps-x">${svg(I.x)}</span></div>
          <div class="ps-mbd">${to('Lena Lender', 'Sandbox Debt Fund · $1.0M – $25.0M')}${to('Nadia Coleman', 'Sunbelt Agency Group · $3.0M – $50.0M')}${to('Dana Ortiz', 'Northline Capital · $10.0M – $75.0M')}${to('Alexis Nwosu', 'Harbor Point Advisors · $2.0M – $30.0M')}</div>
          <div class="ps-mft"><span class="ps-note-s">Accelerator sends each request to 12 lenders.</span><span class="ps-btn primary" data-sendall>Send to 4 lenders</span></div>
        </div></div>
        <div class="ps-toast" data-toast><span>Loan request sent to 4 lenders.</span><u>Undo</u></div>
      </div></div>`;
    }},
    // Riverside's Selected lenders tab after the send: every request out on 4 Aug, Lena already interested, the rest
    // silent. The broker logs two replies from the Outreach selects.
    contacted: {width: 1080, fit: 600, html: () => `<div class="ps-app ps-deal ps-contacted">${rail('deals')}<div class="ps-main">
        <div class="ps-scene" data-scene="deal">
          ${dealHead()}
          <div class="ps-card ps-lend" data-trim><div class="ps-card-head"><b>Lenders for this deal</b><span class="ps-btn primary">Send loan request</span></div>
            <span class="ps-seg"><span>Matches <em>15</em></span><span class="on">Selected lenders <em>4</em></span></span>
            <div class="ps-th"><span>${check(false)}</span><span>Lender</span><span>Loan range</span><span>Property type</span><span>Outreach</span><span></span></div>
            ${lenderRow('Lena Lender', 'Sandbox Debt Fund · Request sent 4 Aug', '$1.0M – $25.0M', 3, 'review')}
            ${lenderRow('Nadia Coleman', 'Sunbelt Agency Group · Request sent 4 Aug', '$3.0M – $50.0M', 2, 'silent', 'data-reply="quoted"')}
            ${lenderRow('Dana Ortiz', 'Northline Capital · Request sent 4 Aug', '$10.0M – $75.0M', 2, 'silent', 'data-reply="review"')}
            ${lenderRow('Alexis Nwosu', 'Harbor Point Advisors · Request sent 4 Aug', '$2.0M – $30.0M', 2, 'silent')}
            <div class="ps-tr"><span>${check(false)}</span><span><span class="ps-nm"><b>Comerica Bank</b><span class="ps-badge ps-blue">Prospector</span></span><span class="ps-sub">Bank · FDIC cert 983 · 3 branches nearby</span></span><span class="ps-unset">No contacts yet</span><span>—</span><span class="ps-unset">No contact yet</span><span class="ps-kebab">${svg(I.kebab)}</span></div>
          </div>
          ${outreachPop()}
        </div></div></div>`},
    // Home's side screens, rebuilt from deals-prototype.html as it renders at 1280 with the rail collapsed (measured
    // 5 Nov: #/deals as the broker, #/loans as the borrower, #/requests as the lender): the same structure, rows,
    // sizes and colours, laid out 1242px wide (the rail and the 1194px view) so every column lands where the
    // prototype's does. Tanya, 5 Nov: "use exact same ui as in prototype and figma, check paddings and colors".
    // Home, brokers ("Run a pipeline like a large firm"): Foundry Flex is the row the story moves.
    'home-deals': {width: 1242, fit: 600, html: () => {
      const srt = (label, act) => `${label}<span class="ps-srt${act ? ' act' : ''}">⇅</span>`;
      const row = (name, sub, amount, state, exec, n, accounts, stage, updated, attr = '') => `<div class="ps-tr" data-cur="${stage}" ${attr}><span><b>${name}</b><span class="ps-sub">${sub}</span></span><span class="ps-num">${amount}</span><span>${state}</span><span${exec === 'Not specified' ? ' class="ps-unset"' : ''}>${exec}</span><span><span class="ps-n" data-n>${n}</span><span class="ps-sub ps-acc" data-acc>${accounts}</span></span><span>${outreach(stage, STAGE)}</span><span>${updated}</span><span class="ps-acts"><span class="ps-btn sm">Find lenders</span><span class="ps-kebab">${svg(I.kebab)}</span></span><i class="ps-wash" style="background:#f6f1e6"></i></div>`;
      return `<div class="ps-app ps-home ps-board">${rail('deals', undefined, 'BB')}<div class="ps-main"><div class="ps-scene" data-scene="board">
        <div class="ps-head"><div class="ps-h1">Your deals</div><span class="ps-btn primary">＋ New deal</span></div>
        <div class="ps-card" data-trim>
          <div class="ps-bar">${search('Search deals', 340)}<span class="ps-seg ps-seg-icon" style="margin-left:auto"><span class="on">${svg(I.list, 15)}</span><span>${svg(I.board, 15)}</span></span><span class="ps-btn">${svg(I.gear, 15)}Settings</span></div>
          <div class="ps-bar">${ms('State')}${ms('Property type')}${ms('Loan amount')}${ms('Execution type')}</div>
          <div class="ps-th"><span>${srt('Deal')}</span><span>${srt('Amount')}</span><span>State</span><span>Execution type</span><span>${srt('Matches')}</span><span>${srt('Status')}</span><span>${srt('Updated', true)}</span><span></span></div>
          ${row('Magnolia Court Multifamily Refinance', 'Multifamily', '$14.2M', 'South Carolina', 'Permanent | fixed-rate', 1, '1 account', 'Leads', '26 Aug')}
          ${row('Harborview Student Housing Acquisition', 'Student housing', '$10.5M', 'Texas', 'Agency (Freddie Mac)', 4, '2 accounts', 'Leads', '25 Aug')}
          ${row('Foundry Flex Industrial Purchase', 'Industrial', '$5.8M', 'North Carolina', 'Balance sheet debt', 4, '4 accounts', 'Screening', '24 Aug', 'data-reply="Outreach"')}
          ${row('Lakeline Self-Storage Refinance', 'Self-storage', '$4.6M', 'Florida', 'Balance sheet debt', 1, '1 account', 'Screening', '11 Aug')}
          ${row('Crescent Senior Living Acquisition', 'Senior housing', '$9.75M', 'Arizona', 'Agency (Fannie Mae)', 5, '3 accounts', 'Screening', '9 Aug')}
          ${row('Pearl District Office Refinance', 'Office-multi tenant', '$7.2M', 'New York', 'Balance sheet debt', 1, '1 account', 'Leads', '6 Aug')}
          ${row('Riverside Apartments Acquisition', 'Multifamily', '$4.5M', 'Texas', 'Agency (Fannie Mae)', 15, '8 accounts · 3 saved', 'Outreach', '4 Aug')}
          ${row('Midtown Retail Permanent Debt', 'Retail-multi tenant', '$3.1M', 'Texas', 'Agency (Fannie Mae)', 5, '4 accounts · 1 saved', 'Quoting', '4 Aug')}
          ${row('Northside Industrial Refinance', 'Industrial', '$6.4M', 'Georgia', 'Agency (Fannie Mae)', 6, '6 accounts · 2 saved', 'Quoting', '4 Aug')}
          ${row('Gulf Coast Hotel Bridge Loan', 'Hotel/motel', '$8.25M', 'Florida', 'Not specified', 3, '3 accounts · 2 saved', 'Processing', '4 Aug')}
          ${row('Old Town Mixed-Use Bridge', 'Mixed-use', '$5.4M', 'Texas', 'Bridge / short-term debt (<3 yrs)', 6, '5 accounts', 'Dead', '28 Jul')}
        </div>
        ${outreachPop(STAGE)}
      </div></div></div>`;
    }},
    // Home, borrowers ("Financing with a person, not a portal"): My deals in the prototype's order. Elm Street is the
    // deal an advisor takes on. Laid out 1338 wide, the prototype at 1376 (Tanya, 5 Nov: "for borrowers use same layout
    // as on prototype"): the narrowest window where its whole table fits the card. Every side screen's table runs to
    // the crop's bottom edge, as on Brokers (Tanya, 5 Nov: "fill table with the rows to the bottom"), so the
    // prototype's seven deals are followed by six sample ones [~], and Active counts 13.
    'home-borrower': {width: 1338, fit: 560, html: () => {
      const srt = (label, act) => `${label}<span class="ps-srt${act ? ' act' : ''}">⇅</span>`;
      const dot = colour => `<span class="ps-dot" style="background:${colour}"></span>`;
      const row = (name, addr, amount, tx, advisor, stage, colour, quotes, out, act, day, attr = '') => `<div class="ps-tr" ${attr}><span><b>${name}</b><span class="ps-sub">${addr}</span></span><span><b class="ps-num">${amount}</b><span class="ps-sub ps-txn">${tx}</span></span><span>${advisor}</span><span class="ps-stage">${dot(colour)}<span>${stage}</span></span><span>${quotes}</span><span>${out}</span><span><span class="ps-act">${act}</span><span class="ps-sub ps-day">${day}</span></span><span class="ps-acts"><span class="ps-kebab">${svg(I.kebab)}</span></span><i class="ps-wash" style="background:#f6f1e6"></i></div>`;
      const unset = text => `<span class="ps-unset">${text}</span>`, nil = '<span class="ps-nil">—</span>';
      const swap = (before, after, key) => `<span class="ps-swap">${before}<span data-${key} style="opacity:0">${after}</span></span>`;
      const gold = '#b48b2b', navy = '#023e8a';
      return `<div class="ps-app ps-home ps-mydeals">${rail('deals', ['home', 'deals', 'user', 'users'], 'PN')}<div class="ps-main">
        <div class="ps-head"><div><div class="ps-h1">My deals</div><p class="ps-lede">All your deals, advisor, status and action items in one place.</p></div><span class="ps-btn primary">＋ Start a new search</span></div>
        <div class="ps-card" data-trim>
          <div class="ps-bar"><span class="ps-seg"><span class="on">Active <em>13</em></span><span>Funded <em>1</em></span><span>Dead <em>1</em></span><span>Draft <em>1</em></span></span></div>
          <div class="ps-bar">${search('Search deals', 260)}${ms('Stage')}<span class="ps-btn" style="margin-left:auto">${svg(I.gear, 15)}Settings</span></div>
          <div class="ps-th"><span>${srt('Property')}</span><span>${srt('Loan request')}</span><span>Advisor</span><span>${srt('Stage')}</span><span>${srt('Quotes')}</span><span>${srt('Outstanding')}</span><span>${srt('Last activity', true)}</span><span></span></div>
          ${row('Mesa self-storage refinance', '1450 W Main St, Mesa, AZ', '$4.1M', 'Refinance', 'Anjali Mehta', 'Lender outreach', navy, 3, '1 item', 'Quote added: Debt fund', '2 Oct')}
          ${row('Round Rock apartments acquisition', '1800 N Mays St, Round Rock, TX', '$7.8M', 'Purchase', 'Jordan Ellis', 'Processing', '#479e28', 2, '4 items', 'Organizational documents requested', '22 Sep')}
          ${row('Canyon Ridge apartments acquisition', '3300 E Speedway Blvd, Tucson, AZ', '$6.3M', 'Purchase', 'Anjali Mehta', 'Preparing lender memo', navy, nil, '2 items', 'Rent roll and T-12 requested', '21 Sep')}
          ${row('Elm Street office refinance', '700 Elm St, Houston, TX', '$3.8M', 'Refinance', swap(unset('No advisor yet'), 'Jordan Ellis', 'adv'), swap('<span>Submitted to LenderPrism</span>', 'Preparing lender memo', 'stage'), gold, nil,
            swap(unset('None'), '2 items', 'out'), swap('<span>Request submitted</span>', 'Rent roll and T-12 requested', 'act'), swap('<span>20 Sep</span>', '23 Sep', 'day'), 'data-take')}
          ${row('Lakeview Flats refinance', '2201 S Lamar Blvd, Austin, TX', '$3.2M', 'Refinance', 'Jordan Ellis', 'Lender outreach', navy, 2, '2 items', 'Quote updated: Regional bank', '19 Sep')}
          ${row('Pecan Street mixed-use acquisition', '118 E Pecan St, San Marcos, TX', '$5.6M', 'Purchase', unset('Pending · Maya Okafor'), 'Submitted to LenderPrism', gold, nil, '1 item', 'Sent to Maya Okafor', '17 Sep')}
          ${row('Cedar Park industrial refinance', '901 Toro Grande Dr, Cedar Park, TX', '$2.4M', 'Refinance', unset('No advisor yet'), 'Submitted to LenderPrism', gold, nil, unset('None'), 'Jordan Ellis passed. The deal has no advisor', '15 Sep')}
          ${row('Bluebonnet Plaza retail refinance', '4410 W Gate Blvd, Austin, TX', '$2.9M', 'Refinance', 'Anjali Mehta', 'Lender outreach', navy, 1, '3 items', 'Quote added: Life company', '12 Sep')}
          ${row('Riverwalk hotel acquisition', '210 Losoya St, San Antonio, TX', '$9.4M', 'Purchase', 'Jordan Ellis', 'Preparing lender memo', navy, nil, '2 items', 'Operating statements requested', '10 Sep')}
          ${row('Saguaro Ridge apartments refinance', '7550 E McDonald Dr, Scottsdale, AZ', '$5.1M', 'Refinance', 'Anjali Mehta', 'Processing', '#479e28', 3, '1 item', 'Appraisal ordered', '8 Sep')}
          ${row('Gateway industrial acquisition', '5200 Gateway Blvd, El Paso, TX', '$3.6M', 'Purchase', unset('No advisor yet'), 'Submitted to LenderPrism', gold, nil, unset('None'), 'Request submitted', '5 Sep')}
          ${row('Bayfront medical office refinance', '600 Shoreline Blvd, Corpus Christi, TX', '$4.7M', 'Refinance', 'Jordan Ellis', 'Lender outreach', navy, 1, '2 items', 'Quote added: Regional bank', '3 Sep')}
          ${row('Sunset Ridge self-storage acquisition', '3900 W Sunset Rd, Las Vegas, NV', '$2.2M', 'Purchase', 'Anjali Mehta', 'Preparing lender memo', navy, nil, '3 items', 'Rent roll requested', '1 Sep')}
        </div>
      </div></div>`;
    }},
    // Home, lenders ("Deal flow that fits your box"): Requests in the prototype's order, with Westgate Commons, a
    // sample request [~], waiting at height 0 above them; Northside and Ybor are already saved. Four sample requests
    // [~] follow the prototype's eight so the table runs to the crop's bottom edge, and the counts take them in.
    'home-requests': {width: 1242, fit: 600, html: () => {
      const row = (name, sub, amount, tx, fin, by, firm, day, {fresh = false, saved = false, cls = ''} = {}) => `<div class="ps-tr ${cls}"><span>${check(false)}</span><span><span class="ps-bm${saved ? ' on' : ''}">${svg(I.bookmark, 15)}</span></span><span><span class="ps-nm"><b>${name}</b>${fresh ? '<span class="ps-udot"></span>' : ''}</span><span class="ps-sub">${sub}</span></span><span class="ps-num">${amount}</span><span>${tx}</span><span>${fin}</span><span><span class="ps-by">${by}</span><span class="ps-sub">${firm}</span></span><span>${day}</span><span><span class="ps-badge ps-blue">New</span></span><span></span><i class="ps-wash" style="background:#f6f1e6"></i></div>`;
      const picked = '<strong>Picked you</strong> · Sandbox Capital Advisors';
      return `<div class="ps-app ps-home ps-requests">${rail('inbox', ['home', 'inbox', 'msg'], 'LL')}<div class="ps-main">
        <div class="ps-head"><div><div class="ps-h1">Requests</div><p class="ps-lede">Requests matched to your lending parameters.</p></div><span class="ps-btn">${svg(I.sliders)}Lending parameters</span></div>
        <div class="ps-card" data-trim>
          <div class="ps-bar"><span class="ps-seg"><span class="on">Needs decision <em data-need>12</em></span><span>Interested <em>3</em></span><span>Passed <em>3</em></span><span>Saved <em data-saved>3</em></span><span>All <em data-all>18</em></span></span></div>
          <div class="ps-bar">${search('Search requests', 260)}${ms('Property type')}${ms('Type of financing')}${ms('State')}<span class="ps-ms">Picked for you <em>2</em></span></div>
          <div class="ps-th"><span>${check(false)}</span><span>Request</span><span>Loan amount</span><span>Transaction</span><span>Financing</span><span>Submitted by</span><span>Received</span><span>Status</span><span></span></div>
          ${row('Westgate Commons acquisition', 'Multifamily · Dallas, TX', '$7.4M', 'Purchase', 'Agency (Fannie Mae)', 'Jordan Ellis', 'Ellis Capital', '20 Oct', {fresh: true, cls: 'ps-new'})}
          ${row('Peachtree Flats acquisition', 'Multifamily · Atlanta, GA', '$12.5M', 'Purchase', 'Agency (Freddie Mac)', 'Maya Okafor', 'Okafor Capital', '19 Oct', {fresh: true})}
          ${row('Foundry Flex Industrial Purchase', 'Industrial · Charlotte, NC', '$5.8M', 'Purchase', 'Balance sheet debt', 'Bruno Broker', picked, '18 Oct', {fresh: true})}
          ${row('Raleigh distribution center purchase', 'Industrial · Raleigh, NC', '$18.0M', 'Purchase', 'CMBS', 'Dev Anand', 'Anand Capital', '18 Oct', {fresh: true})}
          ${row('Riverside Apartments Acquisition', 'Multifamily · Austin, TX', '$4.5M', 'Purchase', 'Agency (Fannie Mae)', 'Bruno Broker', picked, '17 Oct', {fresh: true})}
          ${row('Fort Worth workforce housing acquisition', 'Multifamily · Fort Worth, TX', '$9.2M', 'Purchase', 'Agency (Fannie Mae)', 'Omar Haddad', 'Haddad Real Estate', '16 Oct')}
          ${row('Lakeview Flats refinance', 'Multifamily · Austin, TX', '$3.2M', 'Refinance', 'Agency (Fannie Mae)', 'Jordan Ellis', 'Ellis Capital', '15 Oct')}
          ${row('Northside Industrial Refinance', 'Industrial · Atlanta, GA', '$6.4M', 'Refinance', 'Agency (Fannie Mae)', 'Bruno Broker', 'Sandbox Capital Advisors', '14 Oct', {saved: true})}
          ${row('Ybor mixed-use refinance', 'Mixed-use · Tampa, FL', '$6.75M', 'Refinance', 'Bridge / short-term debt (<3 yrs)', 'Luis Caraballo', 'Caraballo Advisors', '11 Oct', {saved: true})}
          ${row('Cypress Creek self-storage refinance', 'Self-storage · Houston, TX', '$4.2M', 'Refinance', 'Balance sheet debt', 'Omar Haddad', 'Haddad Real Estate', '10 Oct')}
          ${row('Belmont medical office acquisition', 'Office · Nashville, TN', '$8.6M', 'Purchase', 'CMBS', 'Maya Okafor', 'Okafor Capital', '9 Oct')}
          ${row('Battery Wharf hotel refinance', 'Hotel/motel · Charleston, SC', '$11.3M', 'Refinance', 'Bridge / short-term debt (<3 yrs)', 'Dev Anand', 'Anand Capital', '8 Oct')}
          ${row('Mill Creek apartments acquisition', 'Multifamily · Raleigh, NC', '$7.9M', 'Purchase', 'Agency (Freddie Mac)', 'Luis Caraballo', 'Caraballo Advisors', '7 Oct')}
        </div>
      </div><span class="ps-tip">Save</span></div>`;
    }},
    // Brokers, pillar 03 "Broker support & promotion" (Tanya, 12 Nov: "build E, but keep current logic for frame sizes
    // and animations"): the borrower's side of the broker profile, #/brokers as the borrower ("Choose your financing
    // advisor"), rebuilt 1:1 from the prototype with the rail collapsed (Tanya, 13 Nov: "make it 1:1 as on prototype,
    // same layout and photos"): drawn 1300 wide, the prototype at 1338, where its auto-fill grid runs four columns and
    // the filter bar one row. The twelve advisors are the prototype's first twelve, in its order, with its own clamped
    // bios and pill budgets; every name and photo is the prototype's demo data [~]. The whole page shows in the crop
    // (12 Nov: "show full page ... as for other 2 sections"), so this screen alone may scale to 0.35 (min), under the
    // 0.45 the table screens keep. The card holds no data-trim: fit() does not snap to a row of tall cards, and a card
    // cut by the bottom edge stays, as a page scrolling on.
    advisors: {width: 1300, fit: 600, min: .35, html: () => {
      const tick = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5 14.6 5l3.5-.3.4 3.5 2.6 2.4-1.9 3 .9 3.4-3.4.9-1.7 3-3.1-1.3-3.1 1.3-1.7-3-3.4-.9.9-3.4-1.9-3L5.5 8.2 5.9 4.7 9.4 5z"/><path d="m9 12 2 2 4-4"/></svg>';
      const facet = (label, [shown, more]) => `<div class="ps-facet"><div class="ps-fsec">${label}</div><div class="ps-pills">${
        shown.map(x => `<span class="ps-pill">${x}</span>`).join('')}${more ? `<span class="ps-pill more">+${more}</span>` : ''}</div></div>`;
      // name, photo, verified, place, bio, property types, execution types, property locations, works Texas
      const ADVISORS = [
        ['Jordan Ellis', 'jordan-ellis', 1, 'Magnolia, TX', 'Twelve years placing agency and bridge debt on Texas multifamily. I work every request myself, from the first call to closing.', [['Multifamily', 'Industrial'], 4], [['Agency (Fannie Mae)'], 2], [['Texas', 'Oklahoma', 'Louisiana'], 2], 1],
        ['Maya Okafor', 'maya-okafor', 1, 'Dallas, TX', 'Value-add multifamily and hospitality across the Southwest. Balance-sheet and CMBS executions, with life-company relationships for stabilised assets.', [['Multifamily', 'Industrial'], 6], [['CMBS', 'Balance sheet debt'], 2], [['Texas', 'Arizona', 'New Mexico'], 2], 1],
        ['Luis Caraballo', 'luis-caraballo', 0, 'Tampa, FL', 'Southeast industrial and multifamily. Former bank lender, so the package a credit committee wants is the package I build.', [['Multifamily', 'Industrial'], 5], [['Balance sheet debt'], 2], [['Florida', 'Georgia', 'Alabama'], 1], 0],
        ['Anjali Mehta', 'anjali-mehta', 1, 'Phoenix, AZ', 'Multifamily and self storage across the desert Southwest. Agency first, bridge when the story needs it.', [['Multifamily'], 5], [['Agency (Freddie Mac)'], 3], [['Arizona', 'Nevada'], 3], 1],
        ['Marcus Webb', 'marcus-webb', 1, 'Atlanta, GA', 'Two decades on Southeast office and retail. I take the deals other brokers call hard, and I tell you early when one is.', [['Office-multi tenant'], 6], [['Bridge / short-term debt (<3 yrs)'], 3], [['Georgia', 'Florida'], 4], 0],
        ['Elena Vasquez', 'elena-vasquez', 1, 'Denver, CO', 'Mountain West multifamily and industrial, including ground-up. Small enough to answer the phone, connected enough to place the debt.', [['Multifamily', 'Industrial'], 5], [['Construction loans'], 3], [['Colorado', 'Utah', 'Wyoming'], 2], 0],
        ['Dev Anand', 'dev-anand', 1, 'Chicago, IL', 'Midwest industrial, from last-mile infill to a million square feet. Life companies and debt funds, and I know which one wants your asset.', [['Industrial'], 6], [['Permanent | fixed-rate'], 2], [['Illinois', 'Indiana'], 4], 0],
        ['Nina Brandt', 'nina-brandt', 1, 'Seattle, WA', 'Pacific Northwest multifamily and hospitality. Heavy on construction takeouts and assets coming off a bridge.', [['Multifamily', 'Hotel/motel'], 4], [['Construction loans'], 2], [['Washington', 'Oregon', 'Idaho'], 1], 0],
        ['Omar Haddad', 'omar-haddad', 0, 'Houston, TX', 'Gulf Coast industrial and retail. I work the smaller end of the market that the national shops will not return a call on.', [['Industrial'], 5], [['Hard / private money'], 2], [['Texas', 'Louisiana'], 2], 1],
        ['Claire Boone', 'claire-boone', 1, 'Nashville, TN', 'Tennessee Valley multifamily and storage. Former agency underwriter; I size the deal the way the lender will before you see a term sheet.', [['Multifamily'], 6], [['FHA/HUD'], 2], [['Tennessee', 'Kentucky'], 3], 0],
        ['Tomas Lindqvist', 'tomas-lindqvist', 0, 'Minneapolis, MN', 'Upper Midwest industrial and storage, secondary and tertiary markets. Regional banks and credit unions, where the relationship still moves the rate.', [['Industrial', 'Self-storage'], 4], [['Balance sheet debt'], 2], [['Minnesota', 'North Dakota'], 4], 0],
        ['Rachel Osei', 'rachel-osei', 1, 'Charlotte, NC', 'Carolinas and Virginia, most asset classes. Fifteen lender relationships I actually use, not a list I inherited.', [['Multifamily'], 8], [['Balance sheet debt', 'CMBS'], 2], [['North Carolina'], 4], 0]
      ];
      // The Property location list as it opens (A to Z, eight in view), and the two that "Te" and "Tex" leave.
      const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware'];
      // The name sits in its own span: GSAP measures a hidden checkbox by moving it and puts it back before its next
      // element sibling, so beside bare text the box landed after the name.
      const state = (name, later) => `<span class="ps-msi" data-st="${name}"${later ? ' style="display:none"' : ''}>${check(false)}<span>${name}</span></span>`;
      return `<div class="ps-app ps-advisors">${rail('users', ['home', 'deals', 'user', 'users'], 'PN')}<div class="ps-main"><div class="ps-scene" data-scene>
        <div class="ps-head"><div class="ps-h1">Choose your financing advisor</div><p class="ps-lede">Your financing advisor structures your request, finds lenders and guides it to closing.</p></div>
        <div class="ps-card">
          <div class="ps-bar">${search('Search advisors', 260)}${ms('Property type')}<span class="ps-ms" data-geo>Property location <span class="ps-any">Any</span><span class="ps-chip">Texas</span><span class="ps-chev">${svg(I.chev, 15)}</span><span class="ps-msx">${svg(I.x, 14)}</span></span>${ms('Advisor location')}${ms('Execution type')}<span class="ps-clear" data-clear>Clear all</span></div>
          <div class="ps-agrid">${ADVISORS.map(([name, photo, verified, place, bio, types, fins, geos, tx]) => `<div class="ps-tr ps-acard" data-tx="${tx}">
            <div class="ps-bav"><img src="${IMG}advisors/${photo}.jpg" alt=""></div>
            <div class="ps-aname"><b>${name}</b>${verified ? `<span class="ps-vtick">${tick}</span>` : ''}</div><div class="ps-aplace">${place}</div>
            <div class="ps-about">${bio}</div>
            ${facet('Property type', types)}${facet('Execution type', fins)}${facet('Property location', geos)}
            <div class="ps-go"${name === 'Jordan Ellis' ? ' data-go' : ''}><span>View profile →</span></div></div>`).join('')}</div>
        </div>
        <div class="ps-pop ps-msp" data-pop><span class="ps-msfind" data-find>${svg(I.search, 14)}<span class="ps-v">Search states…</span></span>
          <div class="ps-mslist">${STATES.map(name => state(name)).join('')}${state('Tennessee', true)}${state('Texas', true)}</div>
          <div class="ps-msfoot"><span>Select all</span><span class="off">Clear</span></div></div>
      </div></div></div>`;
    }}
  };

  // Scale: the screen is drawn at prototype size and scaled to its crop, never below 0.45 so its 14px text stays near
  // 6px (a spec's min lowers that floor for its own screen). Where that floor leaves the screen wider than the crop, the view pans to whatever the flow is acting on.
  // Then the scale is nudged so the crop's bottom edge falls on a row boundary of the screen's table: no cut row and
  // no white strip under the last whole one (Tanya, 29 Oct). It scales down to take in the cut row, and up to end on
  // the last whole one only where down would pass the 0.45 floor; a screen pushed wider than its crop pans as before. A re-wrap of the text above the table moves the rows, so it measures again, up to
  // three times.
  const fit = screen => {
    const {crop, ui, spec} = screen;
    const w = crop.clientWidth, h = crop.clientHeight;
    const scale = k => {
      const width = Math.max(spec.width, w / k);
      Object.assign(ui.style, {width: width + 'px', height: h / k + 'px'});
      Object.assign(screen, {k, w, width});
      const x = panX(screen, screen.focus);
      if (window.gsap) gsap.set(ui, {scale: k, x});
      else ui.style.transform = `translateX(${x}px) scale(${k})`;
    };
    const min = spec.min ?? .45;
    let k = Math.max(min, Math.min(w / spec.width, h / spec.fit));
    scale(k);
    for (let i = 0; i < 3; i++) {
      const {last, cut} = rowEdges(screen);
      if (!cut) break;
      const up = last ? h / last : 0, down = h / cut;
      const next = down >= min ? down : up;
      if (!next || Math.abs(next - k) < 1e-4) break;
      scale(k = next);
    }
    trim(screen);
  };
  // In screen pixels: the bottom of the last row the crop shows whole, and of the row its bottom edge cuts.
  const rowEdges = ({ui, k}) => {
    const u = ui.getBoundingClientRect(), H = ui.offsetHeight;
    let last = 0;
    for (const row of ui.querySelectorAll('[data-trim] .ps-tr:not([data-out])')) {
      const r = row.getBoundingClientRect();
      if (r.height < 1) continue;
      const bottom = (r.bottom - u.top) / k;
      if (bottom > H + .5) return {last, cut: (r.top - u.top) / k < H - .5 ? bottom : 0};
      last = bottom;
    }
    return {last, cut: 0};
  };
  // A table that runs past the crop shows whole rows only: a row cut by the bottom edge fades out, and fades back in
  // when a scroll, a growing row or a filter brings all of it into view. Rows still collapsed (height 0) and rows a
  // filter is removing (data-out) are left to their flow.
  const trim = ({ui, k}) => ui.querySelectorAll('[data-trim] .ps-tr:not([data-out])').forEach(row => {
    const u = ui.getBoundingClientRect(), r = row.getBoundingClientRect();
    const fits = r.height < 1 || (r.bottom - u.top) / k <= ui.offsetHeight + .5;
    if (fits === (row.fits ?? true)) return;
    row.fits = fits;
    if (window.gsap && animate) gsap.to(row, {opacity: +fits, duration: .25, overwrite: 'auto'});
    else row.style.opacity = +fits;
  });
  const panX = ({k, w, width}, focus = 0) => Math.min(0, Math.max(w - width * k, w / 2 - focus * k));

  const screens = crops.map(crop => {
    const spec = SCREENS[crop.dataset.screen];
    const fallback = crop.querySelector('img');
    const ui = document.createElement('div');
    ui.className = 'ps';
    ui.setAttribute('aria-hidden', 'true');
    ui.innerHTML = spec.html() + cursor;
    crop.setAttribute('role', 'img');
    crop.setAttribute('aria-label', fallback ? fallback.alt : '');
    fallback?.remove();
    crop.classList.add('ps-live');
    crop.append(ui);
    const screen = {crop, ui, spec, focus: 0};
    fit(screen);
    new ResizeObserver(() => fit(screen)).observe(crop);
    return screen;
  });
  if (!animate) return;

  // Helpers shared by the flows. Positions are read when a step starts, in the screen's own pixels.
  const ease = 'power3.inOut';
  const where = (screen, el, fx = .5, fy = .5) => {
    const u = screen.ui.getBoundingClientRect(), r = el.getBoundingClientRect();
    return {x: (r.left - u.left + r.width * fx) / screen.k, y: (r.top - u.top + r.height * fy) / screen.k};
  };
  // focus is a screen x, or an element whose centre the view should hold.
  const pan = (screen, focus) => gsap.to(screen.ui, {duration: .8, ease,
    x: () => panX(screen, screen.focus = typeof focus === 'number' ? focus : where(screen, focus).x)});
  // Where the crop is too short for a scene, the scene scrolls up until el's bottom (or the screen y a function returns)
  // is in view; no el scrolls it back.
  const lift = (screen, scene, el, duration = .8) => gsap.to(scene, {duration, ease, onUpdate: () => trim(screen), y: () => {
    if (!el) return 0;
    const y = gsap.getProperty(scene, 'y'), bottom = typeof el === 'function' ? el() : where(screen, el, .5, 1).y;
    return Math.min(0, y + screen.crop.clientHeight / screen.k - 12 - bottom);
  }});
  const point = (screen, el) => {
    const arrow = screen.ui.querySelector('.ps-cursor');
    return gsap.timeline()
      .set(arrow, {x: () => (screen.w - panX(screen, screen.focus)) / screen.k - 60, y: () => screen.crop.clientHeight / screen.k - 40})
      .to(arrow, {opacity: 1, duration: .25})
      .to(arrow, {duration: .85, ease: 'power2.inOut', x: () => where(screen, el).x - 4, y: () => where(screen, el).y - 2.5}, '<');
  };
  // Pointing again keeps the cursor where it is and travels from there.
  const travel = (screen, el) => gsap.to(screen.ui.querySelector('.ps-cursor'),
    {duration: .75, ease: 'power2.inOut', x: () => where(screen, el).x - 4, y: () => where(screen, el).y - 2.5});
  const click = (screen, el) => {
    const arrow = screen.ui.querySelector('.ps-cursor'), ring = screen.ui.querySelector('.ps-ripple');
    return gsap.timeline()
      .to(arrow, {scale: .82, transformOrigin: '15% 10%', duration: .1, yoyo: true, repeat: 1})
      .fromTo(el, {scale: 1}, {scale: .96, duration: .1, yoyo: true, repeat: 1}, 0)
      .fromTo(ring, {x: () => where(screen, el).x, y: () => where(screen, el).y, scale: .3, opacity: .9},
        {scale: 1.25, opacity: 0, duration: .55, ease: 'power2.out', immediateRender: false}, 0);
  };
  const leave = screen => gsap.to(screen.ui.querySelector('.ps-cursor'), {opacity: 0, duration: .4});
  const swap = (from, to) => gsap.timeline().to(from, {opacity: 0, y: -4, duration: .25}).fromTo(to, {opacity: 0, y: 4}, {opacity: 1, y: 0, duration: .3});
  const recount = (el, to, duration = .6) => {
    const value = {n: Number(el.textContent)};
    return gsap.to(value, {n: to, duration, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(value.n); }});
  };
  const tick = el => {
    const [h, m] = el.textContent.match(/\d+/g).map(Number), left = h * 60 + m - 1;
    el.textContent = `${Math.floor(left / 60)}h ${left % 60}m`;
  };
  const tickBox = el => { el.classList.add('on'); gsap.fromTo(el, {scale: .7}, {scale: 1, duration: .35, ease: 'back.out(2.5)'}); };
  // Pans to el first only where the screen is wider than its crop; where it fits, a pan would only add a still pause.
  const follow = (screen, el) => screen.width * screen.k > screen.w + 1 ? pan(screen, el) : gsap.timeline();
  // A prototype select (sel__trg and sel__pop): the cursor opens it, its list drops 6px under the trigger, the cursor
  // picks label, and the list closes with the trigger showing it. The list sits outside the form column, so it stays
  // put when the form under it has been scrolled.
  const pick = (screen, trigger, label) => {
    const pop = screen.ui.querySelector(`[data-pop="${trigger.dataset.sel}"]`);
    const item = [...pop.children].find(option => option.textContent === label);
    const place = () => {
      const app = pop.offsetParent.getBoundingClientRect(), r = trigger.getBoundingClientRect();
      Object.assign(pop.style, {left: (r.left - app.left) / screen.k + 'px', top: (r.bottom - app.top) / screen.k + 6 + 'px', width: r.width / screen.k + 'px'});
    };
    return gsap.timeline()
      .add(follow(screen, trigger))
      .add(travel(screen, trigger))
      .add(click(screen, trigger))
      .add(() => { place(); trigger.classList.add('focus'); }, '-=.4')
      .fromTo(pop, {autoAlpha: 0, y: -4}, {autoAlpha: 1, y: 0, duration: .18, immediateRender: false}, '<')
      .add(travel(screen, item), '+=.2')
      .add(() => item.classList.add('hover'), '-=.2')
      .add(click(screen, item))
      .to(pop, {autoAlpha: 0, duration: .15}, '-=.35')
      .add(() => { trigger.querySelector('.ps-v').textContent = label; trigger.classList.add('set'); trigger.classList.remove('focus'); }, '<');
  };
  // Types text into a form input at an even pace; each(n) runs with the length typed so far.
  const type = (el, text, duration, each) => {
    const typed = {n: 0}, value = el.querySelector('.ps-v');
    return gsap.to(typed, {n: text.length, duration, ease: 'none',
      onStart: () => { el.classList.add('set'); value.textContent = ''; },
      onUpdate: () => { const n = Math.round(typed.n); value.textContent = text.slice(0, n); each?.(n); }});
  };
  // The broker logs a lender's reply from its row's Outreach select, as in the prototype: the select opens its list
  // (sel__pop, measured on #/deal/riverside), the cursor picks the new disposition and the list closes on it. Where
  // the crop is short the scene scrolls so the open list is in view.
  // Home's Deals board picks a stage the same way, from the board's own list (labels = STAGE).
  const reply = (screen, scene, row, first, labels = DISPOSITION) => {
    const pop = scene.querySelector('.ps-pop'), sel = row.querySelector('.ps-sel'), key = row.dataset.reply;
    const item = pop.querySelector(`[data-v="${key}"]`), [label, colour] = labels[key];
    const text = row.querySelector('.ps-st'), dot = row.querySelector('.ps-dot');
    const place = () => {
      const r = sel.getBoundingClientRect(), box = scene.getBoundingClientRect();
      Object.assign(pop.style, {left: (r.left - box.left) / screen.k + 'px', top: (r.bottom - box.top) / screen.k + 6 + 'px', width: r.width / screen.k + 'px'});
      pop.querySelectorAll('.ps-pi').forEach(option => {
        option.classList.remove('hover');
        option.querySelector('.ps-tick').style.opacity = option.dataset.v === row.dataset.cur ? 1 : 0;
      });
    };
    return gsap.timeline()
      .add(lift(screen, scene, () => where(screen, sel, .5, 1).y + 6 + pop.offsetHeight))
      .add(first ? point(screen, sel) : travel(screen, sel))
      .add(click(screen, sel))
      .add(place, '-=.4')
      .fromTo(pop, {autoAlpha: 0, y: -4}, {autoAlpha: 1, y: 0, duration: .18, immediateRender: false}, '<')
      .add(travel(screen, item), '+=.2')
      .add(() => item.classList.add('hover'), '-=.2')
      .add(click(screen, item))
      .to(pop, {autoAlpha: 0, duration: .15}, '-=.35')
      .add(() => { text.textContent = label; row.dataset.cur = key; }, '<')
      .to(dot, {backgroundColor: colour, duration: .25}, '<')
      .fromTo(dot, {scale: 1}, {scale: 1.8, duration: .15, yoyo: true, repeat: 1}, '<')
      .fromTo(row.querySelector('.ps-wash'), {opacity: 0}, {opacity: 1, duration: .25, yoyo: true, repeat: 1, repeatDelay: .3}, '<');
  };

  const FLOWS = {
    leads(screen) {
      const q = s => screen.ui.querySelector(s), qa = s => [...screen.ui.querySelectorAll(s)];
      const row = q('.ps-new'), view = row.querySelector('.ps-btn'), clock = q('[data-clock]');
      // The open count beside the title, plain muted text as the prototype draws it, verb agreeing with the number.
      const due = n => gsap.timeline().to(q('[data-due]'), {opacity: 0, duration: .15})
        .add(() => { q('[data-due]').textContent = `${n} need${n === 1 ? 's' : ''} your response`; })
        .to(q('[data-due]'), {opacity: 1, duration: .2});
      const tl = gsap.timeline({paused: true});
      tl.to(row, {height: 56, borderBottomWidth: 1, duration: .75, ease, onUpdate: () => trim(screen)})
        .from([...row.children].filter(cell => !cell.matches('.ps-wash')), {opacity: 0, y: 10, duration: .5, stagger: .05, ease: 'power2.out'}, '<.3')
        .fromTo(row.querySelector('.ps-wash'), {opacity: 1}, {opacity: 0, duration: 2.6, ease: 'power1.in'}, '<')
        .add(due(2), '<');
      // The 24-hour clocks run (a minute a beat, faster than life) until the broker answers.
      for (let i = 1; i <= 3; i++) tl.add(() => { tick(clock); qa('[data-tick]').forEach(tick); }, 1.3 + i * 1.1);
      // View opens the record as the prototype does, a modal over the list. The broker reads down to the locked
      // Borrower line and accepts; the modal stays open, the borrower unlocks and the footer becomes Open the deal.
      const modal = q('[data-modal]'), body = q('[data-mbody]'), accept = q('[data-accept]');
      const unlock = gsap.timeline()
        .to([q('[data-pill]'), q('[data-lock]'), q('[data-decline]'), accept], {opacity: 0, duration: .2})
        .add(() => {
          ['[data-lock]', '[data-decline]', '[data-accept]'].forEach(s => { q(s).style.display = 'none'; });
          ['[data-who]', '[data-ok]', '[data-done]', '[data-open]'].forEach(s => { q(s).style.display = ''; });
          body.scrollTop = body.scrollHeight;
        })
        .fromTo([q('[data-who]'), q('[data-done]'), q('[data-open]')], {opacity: 0}, {opacity: 1, duration: .35, immediateRender: false});
      tl.add(pan(screen, 900), 1.6)
        .add(point(screen, view), 2.4)
        .add(click(screen, view))
        .add(pan(screen, 457), '+=.1')
        .fromTo(modal, {autoAlpha: 0}, {autoAlpha: 1, duration: .25}, '<')
        .from(q('.ps-mdl'), {y: 10, scale: .98, opacity: 0, duration: .35, ease: 'power2.out'}, '<.05')
        .to(body, {scrollTop: () => body.scrollHeight - body.clientHeight, duration: 1.5, ease}, '+=.5')
        .add(travel(screen, accept), '-=.3')
        .add(click(screen, accept))
        .add(unlock, '+=.15')
        .add(swap(q('[data-needs]'), q('[data-accepted]')), '<')
        .add(swap(clock, q('[data-answered]')), '<')
        .add(due(1), '<')
        .add(travel(screen, q('[data-done]')), '+=1.6')
        .add(click(screen, q('[data-done]')))
        .to(modal, {autoAlpha: 0, duration: .3}, '+=.1')
        .add(pan(screen, 900), '<')
        .add(leave(screen), '+=.5');
      return tl;
    },
    lenders(screen) {
      const q = s => screen.ui.querySelector(s), qa = s => [...screen.ui.querySelectorAll(s)];
      const narrow = attr => qa('.ps-tr').filter(row => row.dataset[attr] === '0' && row.offsetHeight);
      const hide = rows => {
        rows.forEach(row => { row.dataset.out = ''; });
        return gsap.to(rows, {height: 0, opacity: 0, borderBottomWidth: 0, duration: .55, ease, stagger: .04, onUpdate: () => trim(screen)});
      };
      const filter = (screen, key, attr, count) => {
        const box = q(`[data-opt="${key}"] .ps-check`);
        return gsap.timeline().add(click(screen, box)).add(() => tickBox(box), .1)
          .add(() => hide(narrow(attr)), .35).add(recount(q('[data-network]'), count), .35);
      };
      // Before the save the pointer rests on the bookmark long enough for the prototype's tooltip, which it hides
      // the moment the button is used (Tanya, 29 Oct).
      const save = q('[data-save] .ps-bm'), tip = q('.ps-tip');
      const placeTip = () => {
        const a = q('.ps-app').getBoundingClientRect(), r = save.getBoundingClientRect();
        gsap.set(tip, {left: (r.left - a.left + r.width / 2) / screen.k - tip.offsetWidth / 2, top: (r.top - a.top) / screen.k - tip.offsetHeight - 7});
      };
      return gsap.timeline({paused: true})
        .add(point(screen, q('[data-opt="tx"] .ps-check')), .4)
        .add(filter(screen, 'tx', 'tx', 14))
        .add(travel(screen, q('[data-opt="mf"] .ps-check')), '+=.6')
        .add(filter(screen, 'mf', 'mf', 9))
        .add(travel(screen, save), '+=.9')
        .add(() => { save.classList.add('hover'); placeTip(); }, '-=.15')
        .fromTo(tip, {autoAlpha: 0}, {autoAlpha: 1, duration: .12, immediateRender: false}, '<')
        .add(click(screen, save), '+=.8')
        .to(tip, {autoAlpha: 0, duration: .12}, '<')
        .add(() => { save.classList.add('on'); gsap.fromTo(save, {scale: .6}, {scale: 1, duration: .4, ease: 'back.out(2.5)'}); }, '-=.45')
        .add(recount(q('[data-short]'), 4, .3), '<')
        .add(() => save.classList.remove('hover'), '+=.6')
        .add(leave(screen), '<');
    },
    deal(screen) {
      const q = s => screen.ui.querySelector(s);
      // The broker logs Nadia's reply from her row's Outreach select, as in the prototype: the select opens its list
      // (sel__pop, measured on #/deal/riverside), the cursor picks the new disposition and the list closes on it. One
      // reply only, then straight to the button (Tanya, 29 Oct). On a narrow crop the view first moves to the Outreach
      // column, and where the crop is short the table scrolls so the open list is in view; both come back before the
      // button.
      const scene = q('[data-scene="deal"]');
      const tl = gsap.timeline({paused: true}).add(pan(screen, q('.ps-deal .ps-th > :nth-child(5)')), .2);
      tl.add(reply(screen, scene, q('[data-reply]'), true), 1);
      const exec = q('[data-exec]');
      tl.add(lift(screen, scene), '+=.3')
        .add(pan(screen, exec), '<')
        // the cursor measures its target as it sets off, so it waits until the view has stopped moving
        .add(travel(screen, exec))
        .add(click(screen, exec))
        .add(pan(screen, 0), '+=.2')
        .to(q('[data-scene="deal"]'), {opacity: 0, x: -40, duration: .5, ease}, '<')
        .fromTo(q('[data-scene="request"]'), {autoAlpha: 0, x: 40}, {autoAlpha: 1, x: 0, duration: .6, ease}, '<.25');
      [1, 2, 3].forEach(n => {
        const box = q(`[data-need="${n}"] .ps-check`);
        tl.add(travel(screen, box), n === 1 ? '+=.2' : '+=.15').add(click(screen, box)).add(() => tickBox(box), '-=.45');
      });
      // Then the page scrolls to the documents the desk will ask for and the form's own footer, and the cursor rests on
      // Send request. It does not click: sending redraws the whole page as the requested state, a scene of its own.
      const send = q('[data-send]');
      return tl.add(lift(screen, q('[data-scene="request"]'), q('.ps-foot'), 1.2), '+=.5')
        .add(travel(screen, send))
        .to(send, {backgroundColor: 'rgba(1,39,88,.9)', duration: .2})
        .add(leave(screen), '+=1.2');
    },
    // Riverside's facts go in (its name, the $4.5M ask, Multifamily on Fannie Mae, Texas), and the moment the state is
    // set the Matched lenders card fills with the count. It ends there, before Create deal: the count is the point.
    create(screen) {
      const q = s => screen.ui.querySelector(s), qa = s => [...screen.ui.querySelectorAll(s)];
      const name = q('[data-in="name"]'), amount = q('[data-in="amt"]'), left = q('[data-left]');
      const state = q('[data-sel="state"]'), statePop = q('[data-pop="state"]');
      // The page scrolls until State and its open list are in view, and the rail sticks 16px from the top on the way,
      // as the prototype's sticky .frm__rail does.
      const page = q('[data-page]'), side = q('.ps-frm-rail');
      let to = 0;
      const scroll = gsap.timeline()
        .add(() => { to = Math.min(0, screen.crop.clientHeight / screen.k - 12 - (where(screen, state, .5, 1).y + 6 + statePop.offsetHeight)); })
        .to(page, {y: () => to, duration: .8, ease})
        .to(side, {y: () => Math.max(0, 16 - side.offsetTop - to), duration: .8, ease}, '<');
      const focus = el => () => { qa('.ps-fin.focus').forEach(f => f.classList.remove('focus')); el?.classList.add('focus'); };
      return gsap.timeline({paused: true})
        .add(point(screen, name), .3)
        .add(click(screen, name))
        .add(focus(name), '-=.4')
        .add(type(name, 'Riverside Apartments Acquisition', 1.5, n => { left.textContent = `${80 - n} characters left`; }))
        .add(travel(screen, amount), '+=.3')
        .add(click(screen, amount))
        .add(focus(amount), '-=.4')
        .add(type(amount, '4,500,000', .8))
        .add(focus(null), '+=.2')
        .add(pick(screen, q('[data-sel="prop"]'), 'Multifamily'))
        .add(pick(screen, q('[data-sel="exec"]'), 'Agency (Fannie Mae)'), '+=.2')
        .add(scroll, '+=.2')
        .add(pick(screen, state, 'Texas (TX)'))
        .add(follow(screen, q('[data-mpv]')), '+=.1')
        .to(q('[data-empty]'), {autoAlpha: 0, duration: .2}, '<')
        .add(() => { q('[data-empty]').style.display = 'none'; q('[data-count]').style.display = ''; })
        .fromTo(q('[data-count]'), {autoAlpha: 0, y: 4}, {autoAlpha: 1, y: 0, duration: .3, immediateRender: false})
        .add(recount(q('[data-n]'), 15, 1), '<')
        .add(recount(q('[data-strong]'), 9, 1), '<')
        .add(recount(q('[data-partial]'), 6, 1), '<')
        .add(travel(screen, q('[data-n]')), '<')
        .add(leave(screen), '+=1.6');
    },
    // Save to deal on Alexis Nwosu (Selected lenders 3 to 4), then Send loan request: the dialog lists the four and
    // sends; the toast confirms and every selected row reads Request sent. The tab shows the count only, without the
    // prototype's "· 4 sent" (Tanya, 2 Nov: "not show 'sent' inside the tabs").
    matches(screen) {
      const q = s => screen.ui.querySelector(s), qa = s => [...screen.ui.querySelectorAll(s)];
      const row = q('[data-add]'), save = row.querySelector('[data-savebtn]'), request = q('[data-sendreq]');
      const modal = q('[data-modal]'), send = q('[data-sendall]'), toast = q('[data-toast]');
      return gsap.timeline({paused: true})
        .add(follow(screen, save), .2)
        .add(point(screen, save), .4)
        .add(click(screen, save))
        .add(swap(save, row.querySelector('[data-chip]')), '-=.3')
        .fromTo(row.querySelector('.ps-wash'), {opacity: 0}, {opacity: 1, duration: .25, yoyo: true, repeat: 1, repeatDelay: .3, immediateRender: false}, '<')
        .add(recount(q('[data-selcount]'), 4, .3), '<')
        .add(follow(screen, request), '+=.4')
        .add(travel(screen, request))
        .add(click(screen, request))
        .add(pan(screen, 0), '+=.1')
        .fromTo(modal, {autoAlpha: 0}, {autoAlpha: 1, duration: .25, immediateRender: false}, '<')
        .from(q('.ps-send'), {y: 10, scale: .98, opacity: 0, duration: .35, ease: 'power2.out', immediateRender: false}, '<.05')
        .add(follow(screen, send), '+=.6')
        .add(travel(screen, send))
        .add(click(screen, send))
        .to(modal, {autoAlpha: 0, duration: .3}, '+=.1')
        .fromTo(toast, {autoAlpha: 0, y: -8}, {autoAlpha: 1, y: 0, duration: .3, ease: 'power2.out', immediateRender: false}, '<')
        .add(gsap.timeline().add(qa('[data-picked], [data-add]').map(picked => swap(picked.querySelector('[data-chip]'), picked.querySelector('[data-sent]')))), '<.2')
        .add(leave(screen), '+=.4')
        .to(toast, {autoAlpha: 0, duration: .3}, '+=1.6');
    },
    // Two replies come in and the broker logs them: Nadia quotes, Dana is interested.
    contacted(screen) {
      const q = s => screen.ui.querySelector(s), scene = q('[data-scene="deal"]'), [quote, interest] = screen.ui.querySelectorAll('[data-reply]');
      return gsap.timeline({paused: true})
        .add(pan(screen, q('.ps-deal .ps-th > :nth-child(5)')), .2)
        .add(reply(screen, scene, quote, true), .6)
        .add(reply(screen, scene, interest), '+=.5')
        .add(leave(screen), '+=1.2');
    },
    // Home, brokers: the matching engine counts Foundry Flex's lenders up to four, then the broker opens its status
    // and picks Outreach from the board's stages, as the Brokers deal flow logs a reply.
    'home-deals'(screen) {
      const q = s => screen.ui.querySelector(s), scene = q('[data-scene="board"]'), row = q('[data-reply]');
      const n = row.querySelector('[data-n]'), accounts = row.querySelector('[data-acc]'), wash = row.querySelector('.ps-wash');
      const count = {v: 0};
      const show = () => { const v = Math.round(count.v); n.textContent = v; accounts.textContent = `${v} account${v === 1 ? '' : 's'}`; };
      show();
      return gsap.timeline({paused: true})
        .add(follow(screen, n), .1)
        .fromTo(wash, {opacity: 0}, {opacity: 1, duration: .3, immediateRender: false}, .2)
        .to(count, {v: 4, duration: 1.1, ease: 'power1.inOut', onUpdate: show}, .3)
        .to(wash, {opacity: 0, duration: .6}, 1.4)
        .add(follow(screen, row.querySelector('.ps-sel')), 1.4)
        .add(reply(screen, scene, row, true, STAGE), 1.5)
        .add(leave(screen), '+=.3');
    },
    // Home, borrowers: no pointer, the advisor does the work. Jordan Ellis takes Elm Street, the stage moves on, and
    // the documents asked for show as Outstanding and as the last activity.
    'home-borrower'(screen) {
      const row = screen.ui.querySelector('[data-take]'), wash = row.querySelector('.ps-wash'), dot = row.querySelector('.ps-stage .ps-dot');
      const turn = key => { const to = row.querySelector(`[data-${key}]`); return swap(to.previousElementSibling, to); };
      return gsap.timeline({paused: true})
        .add(follow(screen, row.querySelector('[data-adv]')), .1)
        .fromTo(wash, {opacity: 0}, {opacity: 1, duration: .3, immediateRender: false}, .2)
        .add(turn('adv'), .5)
        .add(turn('stage'), 1.2)
        .to(dot, {backgroundColor: '#023e8a', duration: .25}, 1.45)
        .fromTo(dot, {scale: 1}, {scale: 1.8, duration: .15, yoyo: true, repeat: 1}, 1.45)
        .add(follow(screen, row.querySelector('[data-out]')), 1.7)
        .add(turn('out'), 1.9)
        .add(turn('act'), 2.3)
        .add(turn('day'), 2.3)
        .to(wash, {opacity: 0, duration: 1}, 3.1);
    },
    // Home, lenders: Westgate Commons arrives at the top of Requests and Needs decision and All count it; the lender
    // saves it from its bookmark, as the Brokers lenders flow saves a lender: the pointer rests long enough for the
    // prototype's "Save" tooltip (#tipbox, its data-tip on .bmkbtn), which hides the moment the button is used, and
    // Saved counts it.
    'home-requests'(screen) {
      const q = s => screen.ui.querySelector(s), row = q('.ps-new'), bm = row.querySelector('.ps-bm'), tip = q('.ps-tip');
      const placeTip = () => {
        const a = q('.ps-app').getBoundingClientRect(), r = bm.getBoundingClientRect();
        gsap.set(tip, {left: (r.left - a.left + r.width / 2) / screen.k - tip.offsetWidth / 2, top: (r.top - a.top) / screen.k - tip.offsetHeight - 7});
      };
      return gsap.timeline({paused: true})
        .to(row, {height: 57, borderBottomWidth: 1, duration: .75, ease, onUpdate: () => trim(screen)}, .2)
        .from([...row.children].filter(cell => !cell.matches('.ps-wash')), {opacity: 0, y: 10, duration: .5, stagger: .05, ease: 'power2.out'}, '<.3')
        .fromTo(row.querySelector('.ps-wash'), {opacity: 1}, {opacity: 0, duration: 2.6, ease: 'power1.in'}, '<')
        .add(recount(q('[data-need]'), 13, .4), '<')
        .add(recount(q('[data-all]'), 19, .4), '<')
        .add(point(screen, bm), 1.5)
        .add(() => { bm.classList.add('hover'); placeTip(); }, '-=.15')
        .fromTo(tip, {autoAlpha: 0}, {autoAlpha: 1, duration: .12, immediateRender: false}, '<')
        .add(click(screen, bm), '+=.7')
        .to(tip, {autoAlpha: 0, duration: .12}, '<')
        .add(() => { bm.classList.add('on'); gsap.fromTo(bm, {scale: .6}, {scale: 1, duration: .4, ease: 'back.out(2.5)'}); }, '-=.45')
        .add(recount(q('[data-saved]'), 4, .3), '<')
        .add(() => bm.classList.remove('hover'), '+=.6')
        .add(leave(screen), '<');
    },
    // Brokers, pillar 03: a borrower looks for an advisor who works Texas, as the prototype's directory does it. The
    // cursor opens Property location (ms__pop: search, list, Select all and Clear), types "Tex" into its search and
    // ticks Texas; the trigger shows the Texas badge and its clear, and the cards that do not work Texas drop out
    // while the rest move up, 12 to 4 as in the prototype: Luis Caraballo leaves the first row, Anjali Mehta slides
    // into his place and Omar Haddad comes up from the third row to end it. The pointer ends on Jordan Ellis's View profile. "Clear all" joins
    // the filter bar after Execution type, as the prototype's .clrall does (Tanya, 13 Nov: "align 'Clear all' position
    // with app prototype"), so the grid does not move and the page stays put (12 Nov: "don't scroll page down when
    // filter selected").
    advisors(screen) {
      const q = s => screen.ui.querySelector(s), qa = s => [...screen.ui.querySelectorAll(s)];
      const scene = q('[data-scene]'), trigger = q('[data-geo]'), pop = q('[data-pop]'), find = q('[data-find]');
      const states = qa('[data-st]'), texas = q('[data-st="Texas"]'), box = texas.querySelector('.ps-check'), go = q('[data-go]');
      const place = () => {
        const s = scene.getBoundingClientRect(), r = trigger.getBoundingClientRect();
        Object.assign(pop.style, {left: (r.left - s.left) / screen.k + 'px', top: (r.bottom - s.top) / screen.k + 4 + 'px', width: r.width / screen.k + 'px'});
      };
      // The search narrows the list as it is typed: nothing typed shows A to Z, "T" and "Te" leave Tennessee and Texas.
      const text = 'Tex', typed = {n: 0}, value = find.querySelector('.ps-v');
      const search = gsap.to(typed, {n: text.length, duration: .5, ease: 'none', onStart: () => find.classList.add('set'), onUpdate: () => {
        const part = text.slice(0, Math.round(typed.n)).toLowerCase();
        value.textContent = part ? text.slice(0, part.length) : 'Search states…';
        states.forEach(item => {
          const name = item.dataset.st;
          item.style.display = (part ? name.toLowerCase().startsWith(part) : !['Tennessee', 'Texas'].includes(name)) ? '' : 'none';
        });
      }});
      const cards = qa('.ps-acard'), out = cards.filter(card => card.dataset.tx === '0'), keep = cards.filter(card => card.dataset.tx === '1');
      // The cards that stay move to where the narrower grid puts them (a FLIP: measure, drop the others, measure again,
      // animate the difference).
      const narrow = () => gsap.timeline()
        .to(out, {opacity: 0, scale: .97, duration: .3, ease: 'power1.in'})
        .add(() => {
          const before = new Map(keep.map(card => [card, card.getBoundingClientRect()]));
          out.forEach(card => { card.dataset.out = ''; card.style.display = 'none'; });
          keep.forEach(card => {
            const a = before.get(card), b = card.getBoundingClientRect();
            // one that stays in its row slides along it; one that changes row fades up in its new place, so no card
            // crosses the others diagonally
            if (Math.abs(a.top - b.top) < 1) gsap.fromTo(card, {x: (a.left - b.left) / screen.k}, {x: 0, duration: .7, ease});
            else gsap.fromTo(card, {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: .45, delay: .25, ease: 'power2.out'});
          });
        });
      return gsap.timeline({paused: true})
        .add(follow(screen, trigger), .2)
        .add(point(screen, trigger), .4)
        .add(click(screen, trigger))
        .add(() => { place(); trigger.classList.add('focus'); }, '-=.4')
        .fromTo(pop, {autoAlpha: 0, y: -4}, {autoAlpha: 1, y: 0, duration: .18, immediateRender: false}, '<')
        .add(travel(screen, find), '+=.3')
        .add(click(screen, find))
        .add(() => find.classList.add('focus'), '-=.3')
        .add(search, '+=.1')
        .add(travel(screen, box), '+=.35')
        .add(() => texas.classList.add('hover'), '-=.2')
        .add(click(screen, box))
        .add(() => { tickBox(box); trigger.classList.add('set'); }, '-=.3')
        .fromTo(q('[data-clear]'), {display: 'inline-block', autoAlpha: 0}, {autoAlpha: 1, duration: .25, immediateRender: false}, '<')
        .to(pop, {autoAlpha: 0, duration: .15}, '+=.5')
        .add(() => trigger.classList.remove('focus'), '<')
        .add(narrow(), '+=.15')
        .add(follow(screen, go), '+=.9')
        .add(travel(screen, go), '<')
        .add(() => { go.classList.add('hover'); go.closest('.ps-acard').classList.add('hover'); }, '-=.15')
        .add(click(screen, go), '+=.5')
        .add(leave(screen), '+=.6');
    }
  };

  // Each flow waits for fonts (its pointer targets are measured) and starts once its crop is 75% down the viewport,
  // after the figure's own reveal has settled.
  // Each flow plays once and rests on its last frame; it does not loop, so it never moves beside copy someone is
  // reading. A flow runs 15-25s and starts on scroll beside text, so WCAG 2.2.2 (Pause, Stop, Hide, level A) asks for a
  // way to stop it: each frame gets a button that pauses and plays it, and replays it once it has ended (shown on
  // hover over the frame, see screens.css). A flow also
  // holds while its frame is out of view, so nobody comes back to its middle. See website-animation-loop-research.
  const CTL = {
    pause: ['Pause animation', '<path d="M9 5v14M15 5v14"/>'],
    play: ['Play animation', '<path d="M8 5.5v13l10.5-6.5z"/>'],
    replay: ['Replay animation', '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>']
  };
  const control = screen => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ps-ctl';
    screen.crop.parentElement.append(button);
    const show = state => {
      screen.state = button.dataset.state = state;
      button.setAttribute('aria-label', CTL[state][0]);
      button.innerHTML = svg(CTL[state][1], 14, 1.6);
    };
    const run = () => {
      screen.tl?.kill();
      if (screen.tl) {
        // a replay redraws the screen: the flows rewrite text and classes as they go, which a timeline restart would
        // not undo
        screen.ui.innerHTML = screen.spec.html() + cursor;
        screen.focus = 0;
        fit(screen);
      }
      screen.tl = FLOWS[screen.crop.dataset.screen](screen).eventCallback('onComplete', () => show('replay'));
      screen.tl.play();
      show('pause');
    };
    show('pause');
    button.addEventListener('click', () => {
      if (screen.state === 'replay') run();
      else if (screen.state === 'pause') { screen.tl?.pause(); show('play'); }
      else if (screen.tl) { screen.tl.play(); show('pause'); }
      else run();
    });
    return run;
  };
  // The walkthrough's three chapters play as one film (Tanya, 2 Nov; research in website-walkthrough-player-research).
  // It starts the way the flows above do, once its frame is 75% down the viewport (Tanya, 2 Nov: autoplay "as on these
  // 3 sections", replacing a click-to-play overlay), and plays its chapters in turn: a bronze line on the active tab
  // fills as it goes, the next tab takes over when a chapter ends, and the last one rests on its final frame. Picking
  // a tab plays that chapter. The frame's bottom-right control pauses, plays and replays from chapter 1 (WCAG 2.2.2),
  // and the film holds while out of view.
  // A screen that plays again starts from a fresh drawing: the flows rewrite text and classes as they go.
  const redraw = screen => {
    screen.tl?.kill();
    screen.tl = null;
    screen.ui.innerHTML = screen.spec.html() + cursor;
    screen.focus = 0;
    fit(screen);
  };
  const walkthrough = chapters => {
    const stage = chapters[0].crop.closest('.walk-stage'), view = stage.querySelector('.walk-screen');
    const tabs = [...stage.querySelectorAll('[role=tab]')];
    const selected = () => tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ps-ctl';
    view.append(button);
    stage.dataset.player = 'idle';

    let at = 0, state = '';
    const show = next => {
      state = button.dataset.state = next;
      button.setAttribute('aria-label', CTL[next][0]);
      button.title = CTL[next][0];
      button.innerHTML = svg(CTL[next][1], 14, 1.6);
    };
    const fill = (index, progress) => tabs.forEach((tab, i) => tab.style.setProperty('--p', i === index ? progress : 0));
    const play = index => {
      // Only the incoming chapter starts over. The leaving one stops on its current frame and fades out on it (the
      // panels cross-fade, brokers-editorial.css); it is redrawn when it next plays.
      chapters.forEach(other => { if (other !== chapters[index]) { other.tl?.kill(); other.tl = null; } });
      redraw(chapters[index]);
      at = index;
      const screen = chapters[index];
      screen.tl = FLOWS[screen.crop.dataset.screen](screen)
        .eventCallback('onUpdate', () => fill(index, screen.tl.progress()))
        .eventCallback('onComplete', () => {
          if (index + 1 < chapters.length) tabs[index + 1].click();
          else { show('replay'); stage.dataset.player = 'ended'; }
        });
      screen.tl.play();
      stage.dataset.player = 'playing';
      show('pause');
    };
    show('pause');
    // a tab picked by click, keyboard or the film itself plays that chapter
    stage.addEventListener('tabs:select', event => play(event.detail));
    button.addEventListener('click', () => {
      const tl = chapters[at].tl;
      if (state === 'replay') tabs[0].click();
      else if (!tl) play(selected());
      else if (state === 'pause') { tl.pause(); show('play'); stage.dataset.player = 'paused'; }
      else { tl.play(); show('pause'); stage.dataset.player = 'playing'; }
    });
    ScrollTrigger.create({trigger: view, start: 'top 75%', once: true,
      onEnter: () => gsap.delayedCall(.6, () => { if (stage.dataset.player === 'idle') play(selected()); })});
    ScrollTrigger.create({trigger: view, start: 'top bottom', end: 'bottom top',
      onToggle: ({isActive}) => { const tl = chapters[at].tl; if (tl && state === 'pause') isActive ? tl.play() : tl.pause(); }});
  };

  // Home's sides (one open at a time, site.js's switcher): the opening side's screen is redrawn and plays once its
  // cross-fade is under way (home.css); the closing one stops on its frame and fades out on it. The side open on load
  // plays when the list is 75% down the viewport, as the flows above start. Each story runs about 5s and ends still.
  const sidesPlayer = sides => {
    const list = sides[0].crop.closest('[data-sides]');
    let wait, started = false;
    const of = button => sides.find(screen => screen.crop.closest('[role=region]')?.id === button.getAttribute('aria-controls'));
    const play = screen => {
      started = true;
      sides.forEach(other => { if (other !== screen) { other.tl?.kill(); other.tl = null; } });
      wait?.kill();
      redraw(screen);
      screen.tl = FLOWS[screen.crop.dataset.screen](screen);
      wait = gsap.delayedCall(.45, () => screen.tl.play());
    };
    new MutationObserver(records => records.forEach(({target, oldValue}) => {
      if (target.getAttribute('aria-expanded') !== 'true' || oldValue === 'true') return;
      const screen = of(target);
      if (screen) play(screen);
    })).observe(list, {subtree: true, attributes: true, attributeFilter: ['aria-expanded'], attributeOldValue: true});
    ScrollTrigger.create({trigger: list, start: 'top 75%', once: true, onEnter: () => gsap.delayedCall(.6, () => {
      const open = list.querySelector('button[aria-expanded=true]'), screen = open && of(open);
      if (!started && screen) play(screen);
    })});
  };

  const chapters = screens.filter(screen => screen.crop.closest('.walk-stage'));
  const sides = screens.filter(screen => screen.crop.closest('[data-sides]'));
  document.fonts.ready.then(() => {
    if (sides.length) sidesPlayer(sides);
    screens.filter(screen => !chapters.includes(screen) && !sides.includes(screen)).forEach(screen => {
      const run = control(screen);
      ScrollTrigger.create({trigger: screen.crop, start: 'top 75%', once: true,
        onEnter: () => gsap.delayedCall(.6, () => { if (screen.state === 'pause') run(); })});
      ScrollTrigger.create({trigger: screen.crop, start: 'top bottom', end: 'bottom top',
        onToggle: ({isActive}) => { if (screen.tl && screen.state === 'pause') isActive ? screen.tl.play() : screen.tl.pause(); }});
    });
    if (chapters.length) walkthrough(chapters);
  });
})();
