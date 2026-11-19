// Join as an independent broker: the application form behaves as About's contact form (site.js). It checks its required
// fields; a valid submit says plainly that nothing was sent, since delivery is not connected (where applications go is
// Tony's call: a form, not an address, as he prefers). ?apply=sent previews the confirmation that replaces the form.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('join-form');
  const status = document.getElementById('join-status');
  const sent = document.getElementById('join-sent');
  if (!form || !status || !sent) return;
  const showSent = on => { form.hidden = on; sent.hidden = !on; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let first = null;
    for (const el of form.querySelectorAll('[required]')) {
      const bad = !el.checkValidity();
      if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      if (bad && !first) first = el;
    }
    if (first) {
      status.classList.add('is-error');
      status.textContent = 'Fill in your name, work email and years in CRE debt.';
      first.focus();
      return;
    }
    status.classList.remove('is-error');
    status.textContent = 'Application ready for review. Not sent. Delivery is not connected in this preview.';
  });
  document.getElementById('join-again').addEventListener('click', () => {
    form.reset(); status.classList.remove('is-error'); status.textContent = '';
    showSent(false); form.querySelector('input').focus();
  });
  if (new URLSearchParams(location.search).get('apply') === 'sent') showSent(true);
});
