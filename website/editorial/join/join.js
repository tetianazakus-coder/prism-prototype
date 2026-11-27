// Join as an independent broker: the application form behaves as About's contact form (site.js, which also checks its
// answers, as every form's, and lets this handler run only once they are right). A valid submit says plainly that
// nothing was sent, since delivery is not connected in this preview. On the site, applications go to Tony's address,
// the same as the contact form's (Tony, 23 Nov); the page shows a form, not an address. ?apply=sent previews the confirmation that replaces the form.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('join-form');
  const status = document.getElementById('join-status');
  const sent = document.getElementById('join-sent');
  if (!form || !status || !sent) return;
  const showSent = on => { form.hidden = on; sent.hidden = !on; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Application ready for review. Not sent. Delivery is not connected in this preview.';
  });
  document.getElementById('join-again').addEventListener('click', () => {
    form.reset(); status.classList.remove('is-error'); status.textContent = '';
    showSent(false); form.querySelector('input').focus();
  });
  if (new URLSearchParams(location.search).get('apply') === 'sent') showSent(true);
});
