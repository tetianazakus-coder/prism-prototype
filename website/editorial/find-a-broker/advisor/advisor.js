// An advisor's profile (index.html records the request and the design). ?a=<slug> picks the advisor; without it, or with a
// slug that is not listed, the page keeps Sean Hasson as written in the markup. The data is the live directory's public
// profile (GET /api/public/brokers/:slug on lenderprism.com, read 21 Nov), word for word, cleaned as find-a-broker's cards
// are: "Build to Rent (B2R)" reads "Build to Rent", "Richmond hill" reads "Richmond Hill". ?a=sample is a made-up advisor
// with closed transactions, which the public API does not return for the live ones (23 Nov). Property types: Multifamily
// first, then A to Z, as the cards list them. Every state reads "All states" [💡 rec], as the port's cards do.
// Connect opens the same short form as Find an advisor's cards (find.js); preview: nothing is sent.
(() => {
  'use strict';
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const ADVISORS = {
    "sean-hasson": {
      "name": "Sean Hasson",
      "first": "Sean",
      "company": "Hasson Capital LLC",
      "place": "Magnolia, TX",
      "since": "July 2025",
      "bio": "As a seasoned commercial finance professional with over two decades of experience in the lending space, I help small business owners and real estate investors secure the right capital for their needs. By leveraging a nationwide network of banks and alternative lenders, I deliver tailored funding solutions that go beyond traditional lending channels — truly “Better Than A Banker.",
      "linkedin": "https://www.linkedin.com/in/sean-hasson-240b115a/",
      "website": "https://hassoncapital.com/",
      "types": [
        "Multifamily",
        "Assisted Living / Memory Care",
        "Build to Rent",
        "Hotel/Motel",
        "Industrial",
        "Land",
        "Manufactured Housing / Mobile Home Park",
        "Marina",
        "Medical Office",
        "Mixed-Use",
        "Nursing Facility",
        "Office-Multi Tenant",
        "Office-Owner/User",
        "Office-Single Tenant",
        "Other",
        "RV Park",
        "Retail-Multi Tenant",
        "Retail-Single Tenant",
        "Self-Storage",
        "Senior Housing",
        "Single-Family Rentals (1-4 Units)",
        "Student Housing"
      ],
      "states": [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District of Columbia",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming"
      ],
      "closings": []
    },
    "dustin-shively": {
      "name": "Dustin Shively",
      "first": "Dustin",
      "company": "Front Street Advisors, Ltd",
      "place": "Richmond Hill, GA",
      "since": "July 2026",
      "bio": "As a CPA-led commercial mortgage broker, I help businesses and real estate investors secure financing nationwide. With extensive experience structuring complex transactions, I work with banks, credit unions, life companies, CMBS lenders, agencies, and private capital sources to find the best solution. We specialize in medical, self-storage, hospitality, construction, acquisitions, refinancing, and creative financing strategies that many brokers overlook.",
      "linkedin": "https://www.linkedin.com/in/dustinshively/",
      "website": "https://www.frontstreetltd.com/",
      "types": [
        "Multifamily",
        "Assisted Living / Memory Care",
        "Build to Rent",
        "Build to Sell Single-Family & Condos",
        "Hotel/Motel",
        "Industrial",
        "Land",
        "Manufactured Housing / Mobile Home Park",
        "Medical Office",
        "Nursing Facility",
        "Office-Multi Tenant",
        "Office-Owner/User",
        "Office-Single Tenant",
        "RV Park",
        "Retail-Multi Tenant",
        "Retail-Single Tenant",
        "Self-Storage",
        "Senior Housing",
        "Single-Family Rentals (1-4 Units)",
        "Student Housing"
      ],
      "states": [
        "Florida",
        "Georgia",
        "Illinois",
        "Indiana",
        "Kentucky",
        "Massachusetts",
        "Michigan",
        "Missouri",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "Ohio",
        "Pennsylvania",
        "South Carolina",
        "Tennessee",
        "Texas",
        "Utah",
        "Virginia",
        "Wisconsin"
      ],
      "closings": []
    },
    "lynn-shulman": {
      "name": "Lynn Shulman",
      "first": "Lynn",
      "company": "Loadoff Investment Group",
      "place": "Phoenix, AZ",
      "since": "July 2026",
      "bio": "Loadoff Investment Group helps real estate investors purchase and refinance multifamily and commercial property without letting capital kill the deal. Funding starts with the investor - loans are sourced through nationwide established lender relationships. Specializing in senior, bridge, and value-add debt for multifamily, student housing, and MHC investors.\nWhen the investor comes first, the capital fits.",
      "linkedin": "https://linkedin.com/in/loadoffinvestgroup",
      "website": "https://loadoffenterprisesllc.com",
      "types": [
        "Multifamily",
        "Build to Rent",
        "Build to Sell Single-Family & Condos",
        "Hotel/Motel",
        "Industrial",
        "Land",
        "Manufactured Housing / Mobile Home Park",
        "Marina",
        "Medical Office",
        "Mixed-Use",
        "Office-Multi Tenant",
        "Office-Owner/User",
        "Office-Single Tenant",
        "Other",
        "RV Park",
        "Self-Storage",
        "Single-Family Rentals (1-4 Units)"
      ],
      "states": [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District of Columbia",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming"
      ],
      "closings": []
    },
    "sample": {
      "name": "Avery Collins",
      "first": "Avery",
      "company": "",
      "place": "Denver, CO",
      "since": "March 2025",
      "bio": "Sample profile. I arrange debt for multifamily, build-to-rent and industrial owners across the Mountain West, from first acquisition to refinance.",
      "linkedin": "",
      "website": "",
      "photo": false,
      "types": [
        "Multifamily",
        "Build to Rent",
        "Industrial",
        "Mixed-Use",
        "Retail-Multi Tenant",
        "Self-Storage"
      ],
      "states": [
        "Arizona",
        "Colorado",
        "Kansas",
        "Nevada",
        "New Mexico",
        "Texas",
        "Utah",
        "Wyoming"
      ],
      "closings": [
        {
          "name": "Elm Street Apartments",
          "amount": 8500000,
          "closed": "2026-10",
          "type": "Multifamily",
          "city": "Denver",
          "state": "CO",
          "financing": [
            "Agency (Fannie Mae)"
          ]
        },
        {
          "name": null,
          "amount": 4200000,
          "closed": "2026-09",
          "type": "Retail-Multi Tenant",
          "city": "Boulder",
          "state": "CO",
          "financing": [
            "Balance Sheet Debt"
          ]
        },
        {
          "name": "Cedar Ridge Self Storage",
          "amount": 6750000,
          "closed": "2026-08",
          "type": "Self-Storage",
          "city": "Phoenix",
          "state": "AZ",
          "financing": [
            "Bridge / Short-Term Debt (<3 Yrs)"
          ]
        },
        {
          "name": null,
          "amount": 21000000,
          "closed": "2026-06",
          "type": "Build to Rent",
          "city": "Austin",
          "state": "TX",
          "financing": [
            "Construction Loans"
          ]
        },
        {
          "name": "Mesa Industrial Park",
          "amount": 12400000,
          "closed": "2026-04",
          "type": "Industrial",
          "city": "Salt Lake City",
          "state": "UT",
          "financing": [
            "CMBS"
          ]
        },
        {
          "name": null,
          "amount": 3100000,
          "closed": "2026-02",
          "type": "Multifamily",
          "city": "Albuquerque",
          "state": "NM",
          "financing": [
            "Agency (Freddie Mac)"
          ]
        },
        {
          "name": null,
          "amount": 9800000,
          "closed": "2025-11",
          "type": "Mixed-Use",
          "city": "Fort Collins",
          "state": "CO",
          "financing": [
            "Balance Sheet Debt"
          ]
        }
      ]
    }
  };
  const ALL_STATES = 51;
  const slug = new URLSearchParams(location.search).get('a');
  const key = ADVISORS[slug] ? slug : 'sean-hasson';
  const advisor = ADVISORS[key];
  const set = (name, text) => $$(`[data-advisor="${name}"]`).forEach(node => { node.textContent = text; });

  set('name', advisor.name); set('first', advisor.first); set('company', advisor.company); set('place', advisor.place);
  set('since', advisor.since); set('bio', advisor.bio);
  // Every state reads "All states"; fewer list in columns, as Zillow's "Service areas" do. The map of the US over them,
  // as the app's profile sets one over its list (LEN-253, #562's UsMap: the same paths, us-states.js), each state the
  // advisor covers filled (Tanya, 23 Nov: "go", on the US map and closed transactions). Decorative: the list under it
  // carries the names. Every state fills it.
  const states = document.querySelector('[data-advisor="states"]');
  const covered = advisor.states.length >= ALL_STATES ? null : new Set(advisor.states);
  const SVG = 'http://www.w3.org/2000/svg';
  const map = document.createElementNS(SVG, 'svg');
  map.setAttribute('class', 'advisor-map');
  map.setAttribute('viewBox', '0 0 975 610');
  map.setAttribute('aria-hidden', 'true');
  map.setAttribute('focusable', 'false');
  map.append(...Object.entries(window.US_STATE_PATHS || {}).map(([name, d]) => {
    const path = document.createElementNS(SVG, 'path');
    path.setAttribute('d', d);
    if (!covered || covered.has(name)) path.setAttribute('class', 'on');
    return path;
  }));
  if (!covered) states.replaceChildren(map, Object.assign(document.createElement('span'), { className: 'advisor-all', textContent: 'All states' }));
  else {
    const list = Object.assign(document.createElement('ul'), { className: 'advisor-list is-states' });
    list.append(...advisor.states.map(state => Object.assign(document.createElement('li'), { textContent: state })));
    states.replaceChildren(map, list);
  }
  // No photo (the sample advisor): the frame keeps its dashed placeholder (components.css .portrait).
  const photo = document.querySelector('[data-advisor="photo"]');
  if (advisor.photo === false) photo.remove();
  else photo.src = `../../img/brokers/${key}.jpg`;
  document.title = `${advisor.name}, financing advisor — LenderPrism`;
  // No company: the details line holds the city alone.
  if (!advisor.company) document.querySelector('.advisor-company').hidden = true;
  const types = document.querySelector('[data-advisor="types"]');
  types.replaceChildren(...advisor.types.map(type => Object.assign(document.createElement('li'), { textContent: type })));
  const links = document.querySelector('[data-advisor="links"]');
  // Text buttons with a small leading icon, as the app's advisor profile sets LinkedIn and Website (Borrower Figma 16:1552;
  // Tanya, 22 Nov: "make this text buttons with less icons"): no underline and no arrow. 18px, not 14 (23 Nov: "icons
  // here looks too tiny"): the glyphs fill only about 70% of their 16-unit box.
  const ICONS = {
    LinkedIn: '<svg class="icon-in" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.6 6h2.3v7.4H3.6zM4.75 2.5a1.33 1.33 0 1 1 0 2.66 1.33 1.33 0 0 1 0-2.66zM7.3 6h2.2v1h.03c.31-.58 1.06-1.2 2.18-1.2 2.33 0 2.76 1.53 2.76 3.53v4.07h-2.3V9.8c0-.86-.02-1.97-1.2-1.97-1.2 0-1.38.94-1.38 1.9v3.67H7.3z"/></svg>',
    Website: '<svg class="icon-link" width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6.5 9.5a2.5 2.5 0 0 0 3.54 0l2.12-2.12a2.5 2.5 0 0 0-3.54-3.54l-.7.7M9.5 6.5a2.5 2.5 0 0 0-3.54 0L3.84 8.62a2.5 2.5 0 0 0 3.54 3.54l.7-.7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  };
  const link = (href, text) => {
    const a = Object.assign(document.createElement('a'), { className: 'advisor-link', href, target: '_blank', rel: 'noopener noreferrer' });
    a.innerHTML = `${ICONS[text]}${text}<span class="sr-only"> (opens in a new tab)</span>`;
    return a;
  };
  links.replaceChildren(...[advisor.linkedin && link(advisor.linkedin, 'LinkedIn'), advisor.website && link(advisor.website, 'Website')].filter(Boolean));
  links.hidden = !links.children.length;
  // Short lists (six or fewer types, and six or fewer states or all of them) sit side by side under one hairline.
  const SHORT = 6;
  const allStates = advisor.states.length >= ALL_STATES;
  document.querySelector('.advisor-facts').classList.toggle('is-pair', advisor.types.length <= SHORT && (allStates || advisor.states.length <= SHORT));

  // Closed transactions, newest first, each on Home's closing card (shared/market.css): the month closed as the eyebrow,
  // the loan amount, then ruled rows: the property's name when given, its type, the financing, the place. The type is a
  // row, not the eyebrow as on Home: the app's types run long ("Retail-Multi Tenant", "Assisted Living / Memory Care")
  // and broke the eyebrow onto two lines, which set the amounts in a row at two heights. None entered, no section, as in the app (#562's ClosingsCard): "no closings" would read
  // as a verdict on the advisor. Four show, two rows of the column's two; "Show all" opens the rest, as the app does
  // after six. The live profiles have none in the public API, so only the sample advisor shows the section.
  const SHOWN = 4;
  const closings = document.querySelector('.advisor-closings');
  if (advisor.closings.length) {
    const money = n => '$' + n.toLocaleString('en-US');
    const month = ym => { const [y, m] = ym.split('-').map(Number); return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }); };
    const el = (tag, className, text) => Object.assign(document.createElement(tag), className ? { className } : {}, text != null ? { textContent: text } : {});
    const row = (term, value) => { const div = el('div'); div.append(el('dt', '', term), el('dd', '', value)); return div; };
    const cards = advisor.closings.map((c, n) => {
      const card = el('li', 'closing-card' + (key === 'sample' ? ' sample' : ''));
      const head = el('div', 'closing-head');
      head.append(el('p', 'eyebrow', `Closed ${month(c.closed)}`));
      const rows = el('dl');
      if (c.name) rows.append(row('Property', c.name));
      rows.append(row('Property type', c.type));
      if (c.financing.length) rows.append(row('Financing', c.financing.join(', ')));
      rows.append(row('Location', `${c.city}, ${c.state}`));
      card.append(head, el('p', 'closing-amount', money(c.amount)), rows);
      card.hidden = n >= SHOWN;
      return card;
    });
    closings.querySelector('ul').replaceChildren(...cards);
    const more = closings.querySelector('.advisor-more'), button = more.querySelector('button');
    const label = open => { button.textContent = open ? 'Show fewer' : `Show all ${cards.length}`; button.setAttribute('aria-expanded', String(open)); };
    more.hidden = cards.length <= SHOWN;
    label(false);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      cards.forEach((card, n) => { if (n >= SHOWN) card.hidden = !open; });
      label(open);
      if (!open) closings.scrollIntoView({ block: 'start' }); // closing, the reader is taken back to the section's top
    });
    closings.hidden = false;
  }

  const connect = document.getElementById('connect-dialog');
  const connectForm = document.getElementById('connect-form');
  const ask = connect.querySelector('.connect-ask'), done = connect.querySelector('.connect-done');
  const fill = (name, text) => $$(`[data-connect="${name}"]`, connect).forEach(node => { node.textContent = text; });
  fill('name', advisor.name); fill('first', advisor.first);
  connectForm.elements.advisor.value = key;
  document.querySelector('[data-connect-open]').addEventListener('click', () => {
    if (window.LenderPrism) window.LenderPrism.openDialog(connect); else connect.showModal();
    ask.querySelector('.dialog-bd').scrollTop = 0; // a reopened form starts at its first field
  });
  connectForm.addEventListener('submit', event => {
    event.preventDefault();
    fill('email', connectForm.elements.email.value.trim());
    ask.hidden = true; done.hidden = false;
    done.querySelector('h2').focus();
  });
  connect.addEventListener('close', () => { connectForm.reset(); ask.hidden = false; done.hidden = true; });
})();
