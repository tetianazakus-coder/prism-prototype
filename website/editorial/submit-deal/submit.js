/* Submit your deal: the two-step borrower form and its thank-you view. Nothing is sent or stored: this is a design
   preview, and the thank-you view says so. site.js owns the dialogs' close buttons and backdrop. */
(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const form = $('.deal-form');
  if (!form) return;

  const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
  // The product's 24 property types less the five on chips (platform-audit-findings, /loans/new).
  const OTHER_TYPES = ['Assisted living / memory care', 'Build to rent', 'Build to sell single-family & condos', 'Land', 'Manufactured housing / mobile home park', 'Marina', 'Medical office', 'Note purchase financing', 'Nursing facility', 'Office-multi tenant', 'Office-owner/user', 'Office-single tenant', 'Other', 'Retail-multi tenant', 'Retail-single tenant', 'RV park', 'Senior housing', 'Single-family rentals (1-4 units)', 'Student housing'];
  const LISTS = {state: STATES, property_other: OTHER_TYPES};
  const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const CHEV = '<svg class="chev" width="8" height="5" viewBox="0 0 8 5" aria-hidden="true"><path d="M1 1l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LENS = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M11 11l3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  const TICK = '<svg class="tick" width="12" height="9" viewBox="0 0 12 9" aria-hidden="true"><path d="M1 4.5l3.5 3.5L11 1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Searchable single-select, after Find a broker's Property state picker (find.js): a button that reads the pick, a
  // combobox search over a listbox, arrows and Enter pick, Escape closes. Built from the root's data attributes so one
  // function serves State and "Other type"; find.js can take it over when that file is next open.
  const selects = {};
  function initSelect(root) {
    const name = root.dataset.select;
    const placeholder = root.dataset.placeholder;
    const noun = root.dataset.noun;
    const field = root.closest('.field');
    const labelId = field.querySelector('.field-label, legend')?.id || (field.querySelector('legend').id = 'l-' + name);
    root.innerHTML = `<button class="select-toggle is-empty" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="pop-${name}" aria-labelledby="${labelId} v-${name}" aria-describedby="e-${field.dataset.field}"><span class="select-value" id="v-${name}">${placeholder}</span>${CHEV}</button>`
      + `<div class="select-pop" data-lenis-prevent id="pop-${name}" hidden><label class="select-search"><span class="sr-only">Search ${noun}</span>${LENS}<input type="text" role="combobox" aria-controls="list-${name}" aria-expanded="true" aria-autocomplete="list" placeholder="Search ${noun}" autocomplete="off" spellcheck="false"></label>`
      + `<ul class="select-options" id="list-${name}" role="listbox" aria-labelledby="${labelId}"></ul><p class="select-none" hidden>No ${noun} match.</p></div><input type="hidden" name="${name}">`;
    const toggle = $('.select-toggle', root);
    const label = $('.select-value', root);
    const pop = $('.select-pop', root);
    const search = $('.select-search input', root);
    const list = $('.select-options', root);
    const none = $('.select-none', root);
    const hidden = $('input[type=hidden]', root);
    LISTS[name].forEach((value, index) => {
      const option = document.createElement('li');
      option.id = `opt-${name}-${index}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.dataset.value = value;
      option.innerHTML = '<span></span>' + TICK;
      option.firstChild.textContent = value;
      list.append(option);
    });
    const options = $$('[role=option]', list);
    let active = null;
    const setActive = option => {
      options.forEach(other => other.classList.toggle('is-active', other === option));
      active = option;
      if (option) { search.setAttribute('aria-activedescendant', option.id); option.scrollIntoView({block: 'nearest'}); }
      else search.removeAttribute('aria-activedescendant');
    };
    const shown = () => options.filter(option => !option.hidden);
    const filter = () => {
      const query = fold(search.value);
      options.forEach(option => { option.hidden = !!query && !(' ' + fold(option.dataset.value).replace(/[-/]/g, ' ')).includes(' ' + query); });
      const visible = shown();
      none.hidden = visible.length > 0;
      setActive(visible.find(option => option.dataset.value === hidden.value) || visible[0] || null);
    };
    const open = isOpen => {
      toggle.setAttribute('aria-expanded', String(isOpen));
      pop.hidden = !isOpen;
      if (!isOpen) return;
      Object.values(selects).forEach(other => { if (other.root !== root) other.open(false); });
      search.value = '';
      filter();
      search.focus({preventScroll: true});
      pop.scrollIntoView({block: 'nearest'});
    };
    const pick = value => {
      hidden.value = value;
      options.forEach(option => option.setAttribute('aria-selected', String(option.dataset.value === value)));
      label.textContent = value || placeholder;
      toggle.classList.toggle('is-empty', !value);
      clearError(field);
    };
    const choose = option => { pick(option.dataset.value); open(false); toggle.focus(); };
    toggle.addEventListener('click', () => open(pop.hidden));
    search.addEventListener('input', filter);
    search.addEventListener('keydown', event => {
      const visible = shown();
      const at = visible.indexOf(active);
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (visible.length) setActive(visible[(at + (event.key === 'ArrowDown' ? 1 : visible.length - 1)) % visible.length]);
      } else if (event.key === 'Enter') {
        event.preventDefault(); // Enter picks; it never submits the form from inside the list.
        if (active) choose(active);
      }
    });
    options.forEach(option => {
      option.addEventListener('mousemove', () => { if (active !== option) setActive(option); });
      option.addEventListener('click', () => choose(option));
    });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && !pop.hidden) { event.stopPropagation(); open(false); toggle.focus(); } });
    root.addEventListener('focusout', event => { if (!pop.hidden && event.relatedTarget && !root.contains(event.relatedTarget)) open(false); });
    selects[name] = {root, open, pick, toggle, get value() { return hidden.value; }};
  }
  $$('[data-select]', form).forEach(initSelect);
  document.addEventListener('pointerdown', event => Object.values(selects).forEach(select => { if (!select.root.contains(event.target)) select.open(false); }));

  // Errors: one line under the field, tied to its control; the first wrong field takes focus on submit.
  const fieldOf = name => $(`[data-field="${name}"]`, form);
  const controlsOf = field => $$('input:not([type=hidden]), textarea, .select-toggle', field).filter(control => !control.closest('.select-pop'));
  function setError(field, message) {
    const line = $('.field-error', field);
    line.textContent = message;
    line.hidden = false;
    field.classList.add('has-error');
    if (field.tagName === 'FIELDSET') field.setAttribute('aria-invalid', 'true');
    else controlsOf(field).forEach(control => control.setAttribute('aria-invalid', 'true'));
  }
  function clearError(field) {
    const line = $('.field-error', field);
    if (!line || line.hidden) return;
    line.hidden = true;
    line.textContent = '';
    field.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    controlsOf(field).forEach(control => control.removeAttribute('aria-invalid'));
  }
  $$('.field', form).forEach(field => {
    field.addEventListener('input', () => clearError(field));
    field.addEventListener('change', () => clearError(field));
  });

  const value = name => (form.elements[name]?.value || '').trim();
  const digits = text => text.replace(/\D/g, '');
  const emailOk = text => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text);
  const checked = name => $$(`input[name="${name}"]:checked`, form).map(input => input.value);

  const CHECKS = {
    1: [
      ['full_name', () => value('full_name') ? '' : 'Enter your full name.'],
      ['email', () => !value('email') ? 'Enter your email.' : emailOk(value('email')) ? '' : 'Enter an email like name@company.com.'],
      ['phone', () => !value('phone') ? 'Enter your phone number.' : digits(value('phone')).length >= (value('phone_code') === '+1' ? 10 : 6) ? '' : value('phone_code') === '+1' ? 'Enter a full phone number, with the area code.' : 'Enter a full phone number.'],
    ],
    2: [
      ['amount', () => checked('amount').length ? '' : 'Choose a loan amount.'],
      ['property', () => !checked('property').length ? 'Choose a property type.' : checked('property')[0] === 'other' && !selects.property_other.value ? 'Choose the property type from the list.' : ''],
      ['purpose', () => checked('purpose').length ? '' : 'Choose purchase or refinance.'],
      ['financing', () => checked('financing').length ? '' : 'Choose a financing type, or “Not sure”.'],
      ['state', () => selects.state.value ? '' : 'Choose the property’s state.'],
    ],
  };
  function validate(step) {
    let first = null;
    CHECKS[step].forEach(([name, check]) => {
      const field = fieldOf(name);
      const message = check();
      if (!message) return clearError(field);
      setError(field, message);
      first ||= field;
    });
    if (first) {
      const target = (first.dataset.field === 'property' && checked('property')[0] === 'other') ? selects.property_other.toggle : controlsOf(first)[0];
      target.focus({preventScroll: true});
      first.scrollIntoView({block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
    return !first;
  }

  // Email: the format is checked on leaving the field, once something is typed.
  form.elements.email.addEventListener('blur', () => { if (value('email') && !emailOk(value('email'))) setError(fieldOf('email'), 'Enter an email like name@company.com.'); });

  // Phone: under +1, ten digits take the US shape as they are typed; under another code the number stays as written.
  const phone = form.elements.phone;
  const code = form.elements.phone_code;
  const shapePhone = () => {
    if (code.value !== '+1') return;
    const d = digits(phone.value).replace(/^1(?=\d{10})/, '').slice(0, 10);
    phone.value = d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d;
  };
  phone.addEventListener('input', shapePhone);
  code.addEventListener('change', () => {
    phone.placeholder = code.value === '+1' ? '(555) 123-4567' : 'Phone number';
    if (code.value === '+1') shapePhone(); else phone.value = digits(phone.value);
  });

  // Property type: "Other type" opens the rest of the list in the select.
  const otherType = $('.other-type', form);
  $$('input[name=property]', form).forEach(input => input.addEventListener('change', () => {
    const other = input.value === 'other' && input.checked;
    otherType.hidden = !other;
    if (other) selects.property_other.open(true);
  }));

  // Financing: "Not sure" stands alone; "Show all" opens the other eleven types.
  const financing = $$('input[name=financing]', form);
  financing.forEach(input => input.addEventListener('change', () => {
    if (!input.checked) return;
    financing.forEach(other => { if ((input.value === 'Not sure') !== (other.value === 'Not sure')) other.checked = false; });
  }));
  const more = $('.chip-more', form);
  more.addEventListener('click', () => {
    const first = $('.chip.more', form);
    $$('.chip.more', form).forEach(chip => { chip.hidden = false; });
    more.hidden = true;
    $('input', first).focus();
  });

  // Steps.
  const steps = $$('.deal-step', form);
  const bar = $('.deal-bar', form);
  function show(step, focus = true) {
    steps.forEach(panel => { panel.hidden = Number(panel.dataset.step) !== step; });
    $('[data-step-now]', form).textContent = step;
    bar.setAttribute('aria-valuenow', step);
    $('i', bar).style.width = step * 50 + '%';
    back.hidden = step !== 2;
    if (!focus) return;
    $('h2', steps[step - 1]).focus({preventScroll: true});
    document.getElementById('request').scrollIntoView({block: 'start'});
  }
  // Step 2 gets a history entry, so the browser's Back, the iPhone edge swipe and the Android back key return to step 1
  // with the answers kept, as the Back button does; before, they left the page [rec]. From the thank-you view a browser
  // Back passes over the step 1 entry and leaves, as it did before.
  // Two Backs do the same: the top one on the progress row, and the footer one beside the main button from 601px.
  const back = $('.deal-progress .deal-back', form);
  $$('.deal-back', form).forEach(button => button.addEventListener('click', () => { if (history.state?.step === 2) history.back(); else show(1); }));
  addEventListener('popstate', event => {
    if ($('.submit').hidden) { history.back(); return; }
    show(event.state?.step === 2 ? 2 : 1);
  });

  // Views: the form (with its head), the thank-you view, the account step and its end state. One shows at a time.
  const params = new URLSearchParams(location.search);
  const STATE = params.get('state');
  const done = $('.done');
  const account = $('.account');
  const ready = $('.ready');
  const accountForm = $('.account-form');
  const VIEWS = {form: [$('.submit'), $('.submit-head')], done: [done], account: [account], ready: [ready]};
  function open(name) {
    Object.entries(VIEWS).forEach(([key, nodes]) => nodes.forEach(node => { node.hidden = key !== name; }));
    if (name === 'form') return;
    scrollTo(0, 0);
    $('h1', VIEWS[name][0]).focus({preventScroll: true});
  }
  // The thank-you card's own account form (from 851px): the email is the request's, kept in a hidden username field.
  const quickForm = $('.account-quick');
  const fillAll = fill => {
    // An email wraps before its "@", never mid-word ("tetiana.zakus" over "@cieden.com"; Tanya, 16 Nov, on "cieden.c" over "om").
    $$('[data-fill]').forEach(node => {
      if (!(node.dataset.fill in fill)) return;
      const value = fill[node.dataset.fill], at = node.dataset.fill === 'email' ? value.indexOf('@') : -1;
      if (at > 0) node.replaceChildren(value.slice(0, at), document.createElement('wbr'), value.slice(at));
      else node.textContent = value;
    });
    if ('email' in fill) quickForm.elements.acc_email.value = fill.email;
  };
  function finish() {
    const type = checked('property')[0] === 'other' ? selects.property_other.value : checked('property')[0];
    // The greeting takes the first word of the full name [~]; Tony may still ask for two fields (question 269).
    fillAll({first: value('full_name').split(/\s+/)[0], email: value('email'), deal: `${type} ${checked('purpose')[0].toLowerCase()} in ${selects.state.value}`});
    open('done');
  }

  // A button that sends shows its busy label for a moment; ?state=loading holds it there for review.
  function busy(button, then) {
    if (button.getAttribute('aria-busy') === 'true') return;
    const label = button.firstChild;
    const text = label.textContent;
    button.setAttribute('aria-busy', 'true');
    label.textContent = button.dataset.busy + ' ';
    if (STATE === 'loading') return;
    setTimeout(() => { button.removeAttribute('aria-busy'); label.textContent = text; then(); }, 600);
  }
  // ?state=fail: the first send of step 2 fails and says so; the answers stay and the second try goes through.
  let failed = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const panel = steps.find(item => !item.hidden);
    const step = Number(panel.dataset.step);
    if (!validate(step)) return;
    const fail = $('.deal-fail', panel);
    fail.hidden = true;
    busy($('button[type=submit]', panel), () => {
      if (STATE === 'fail' && step === 2 && !failed) { failed = true; fail.hidden = false; return; }
      if (step === 1) { history.pushState({step: 2}, ''); show(2); } else finish();
    });
  });

  // Thank-you actions. Each one confirms in a status line beside it.
  const status = $('.done-status', done);
  const shareStatus = $('.share-status', done);
  const say = (text, line = status) => { line.textContent = ''; requestAnimationFrame(() => { line.textContent = text; }); };
  const save = (text, type, name) => {
    const link = Object.assign(document.createElement('a'), {href: URL.createObjectURL(new Blob([text], {type})), download: name});
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };
  const matchDialog = $('#match-dialog');
  $('.match-card', done).addEventListener('click', () => { matchDialog.showModal(); document.body.classList.add('modal-open'); });
  // The account step shows the preview's rows beside its form: copied from the dialog, so there is one list.
  const accountMatches = $('.account-matches', account);
  accountMatches.append(...['.match-list', '.match-rest'].map(sel => $(sel, matchDialog).cloneNode(true)));
  const stamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const fix = $('.email-fix-form', done);
  let fixFrom = null;
  const fixInput = $('input', fix);
  const fixError = $('.field-error', fix);
  const ACTS = {
    // The matches email goes out on submit; this sends it again (phone card, "Didn’t get it? Send again").
    resend: () => say(`Sent again to ${value('email')} ✓`),
    remind: () => {
      // A calendar file for tomorrow at 9:00, local time: a reminder to open the emailed link on a computer.
      const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(9, 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60000);
      save(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LenderPrism//Borrower request//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@lenderprism.com`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, 'SUMMARY:See my LenderPrism lender matches', 'DESCRIPTION:Open the link in the LenderPrism email on a computer to see who matched your deal.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar', 'lenderprism-matches.ics');
      say('Reminder added ✓');
    },
    // "Save our number" [~]: a contact card, so the advisor's call is not an unknown number. The number is a placeholder.
    vcard: () => {
      save(['BEGIN:VCARD', 'VERSION:3.0', 'N:;LenderPrism;;;', 'FN:LenderPrism', 'ORG:LenderPrism', 'TITLE:Financing advisors', 'TEL;TYPE=WORK,VOICE:+1-555-555-0100', 'URL:https://lenderprism.com', 'NOTE:Your LenderPrism financing advisor calls from this number.', 'END:VCARD'].join('\r\n'), 'text/vcard', 'lenderprism.vcf');
      say('Contact saved ✓', shareStatus);
    },
    share: async () => {
      const url = new URL('../borrowers/', location.href).href;
      try {
        if (navigator.share) { await navigator.share({title: 'LenderPrism', text: 'Submit a commercial real estate deal to LenderPrism', url}); say('Shared ✓', shareStatus); }
        else { await navigator.clipboard.writeText(url); say('Link copied ✓', shareStatus); }
      } catch (error) { if (error.name !== 'AbortError') say('Copy this link: ' + url, shareStatus); }
    },
    // A mistyped email: corrected here, and the matches go out again.
    // "Change" sits on each card's email; the one correction form moves under the email of the card in view, and
    // after Save the focus returns to that Change.
    fix: button => {
      const isOpen = fix.hidden;
      if (isOpen) { fixFrom = button; button.closest('.account-email').after(fix); }
      fix.hidden = !isOpen;
      $$('[data-act=fix]', done).forEach(change => change.setAttribute('aria-expanded', String(isOpen)));
      if (isOpen) { fixInput.value = value('email'); fixInput.focus(); fixInput.select(); }
    },
    fixsave: () => {
      const next = fixInput.value.trim();
      const wrong = !emailOk(next);
      fixError.hidden = !wrong;
      fixError.textContent = wrong ? 'Enter an email like name@company.com.' : '';
      fixInput.toggleAttribute('aria-invalid', wrong);
      if (wrong) return fixInput.focus();
      form.elements.email.value = next;
      fillAll({email: next});
      ACTS.fix(fixFrom);
      fixFrom.focus();
      // With no matches yet nothing has been sent, so the change is only confirmed.
      say(done.classList.contains('nomatch') ? `Email changed to ${next} ✓` : `Email changed. Matches sent to ${next} ✓`);
    },
    // On the thank-you card the link goes to the request's email; on the account step, to the email in its field.
    magic: button => done.contains(button)
      ? say(`Link sent to ${value('email')} ✓`)
      : say(`Link sent to ${accountForm.elements.acc_email.value.trim() || value('email')} ✓`, $('.share-status', button.parentNode)),
  };
  $$('[data-act]').forEach(button => button.addEventListener('click', () => ACTS[button.dataset.act](button)));
  fixInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); ACTS.fixsave(); } });

  // Account step: the email comes from the request; one password, eight characters or more.
  $$('[data-go]').forEach(button => button.addEventListener('click', () => {
    if (matchDialog.open) { matchDialog.close(); document.body.classList.remove('modal-open'); }
    if (button.dataset.go === 'account') accountForm.elements.acc_email.value = value('email');
    open(button.dataset.go);
  }));
  // Both account forms, the step's and the thank-you card's, run the same way: Show, the checks, then the end state.
  [accountForm, quickForm].forEach(accForm => {
    const passShow = $('.pass-show', accForm);
    passShow.addEventListener('click', () => {
      const shown = accForm.elements.acc_password.type === 'password';
      accForm.elements.acc_password.type = shown ? 'text' : 'password';
      passShow.setAttribute('aria-pressed', String(shown));
      passShow.textContent = shown ? 'Hide' : 'Show';
    });
    const accountField = name => $(`[data-field="${name}"]`, accForm);
    $$('.field', accForm).forEach(field => field.addEventListener('input', () => clearError(field)));
    accForm.addEventListener('submit', event => {
      event.preventDefault();
      const email = accForm.elements.acc_email.value.trim();
      const wrong = [
        // The card's email is the request's, already checked; only the step's field can be empty or mistyped.
        ['acc_email', accForm === quickForm ? '' : !email ? 'Enter your email.' : emailOk(email) ? '' : 'Enter an email like name@company.com.'],
        ['acc_password', accForm.elements.acc_password.value.length >= 8 ? '' : 'Use at least 8 characters.'],
      ].filter(([name, message]) => { const field = accountField(name); if (!field) return false; if (message) setError(field, message); else clearError(field); return message; });
      if (wrong.length) return $('input', accountField(wrong[0][0])).focus();
      busy($('button[type=submit]', accForm), () => { fillAll({email}); open('ready'); });
    });
  });

  // ?view=deal, done, account and ready open step 2, the thank-you view, the account step and its end state with sample
  // answers, for review and for Figma. ?state= shows the states that have no route of their own: errors (an empty send
  // of the step in view), loading, fail, and on the thank-you view nomatch and exists.
  const view = params.get('view');
  if (['deal', 'done', 'account', 'ready'].includes(view)) {
    form.elements.full_name.value = 'Jane Cooper';
    form.elements.email.value = 'jane@example.com'; phone.value = '(512) 555-0142';
    show(2, false);
    if (view !== 'deal') {
      $('input[name=amount][value="$2–5M"]', form).checked = true;
      $('input[name=property][value=Multifamily]', form).checked = true;
      $('input[name=purpose][value=Refinance]', form).checked = true;
      $('input[name=financing][value="Not sure"]', form).checked = true;
      selects.state.pick('Texas');
      finish();
      if (view === 'account') { accountForm.elements.acc_email.value = value('email'); open('account'); }
      if (view === 'ready') open('ready');
    }
  }
  // ?view=done&state=errors: the thank-you card's account form sent empty (shown from 851px).
  if (STATE === 'errors') { if (view === 'account') accountForm.requestSubmit(); else if (view === 'done') quickForm.requestSubmit(); else if (view !== 'ready') form.requestSubmit(); }
  if (STATE === 'loading' && view !== 'done' && view !== 'ready') (view === 'account' ? accountForm : form).requestSubmit();
  if (STATE === 'nomatch') { done.classList.add('nomatch'); $('.match-card', done).hidden = true; $('.match-none', done).hidden = false; accountMatches.hidden = true; }
  if (STATE === 'exists') { done.classList.add('has-account'); $('.account-exists', done).hidden = false; }
})();
