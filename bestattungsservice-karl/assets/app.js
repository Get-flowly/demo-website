(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // nav: solid on scroll, mobile menu, active link
  const nav = $('#nav'), burger = $('.nav__burger'), mnav = $('#mnav');
  const callbar = $('.callbar');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    callbar && callbar.classList.toggle('is-on', y > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    mnav.classList.toggle('is-open', open);
  });
  $$('a', mnav).forEach(a => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false');
    mnav.classList.remove('is-open');
  }));
  const links = $$('.nav__links a');
  const secObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.hash); s && secObs.observe(s); });

  // reveal + count-up
  const fmt = n => n.toLocaleString('de-DE');
  const countUp = el => {
    const to = +el.dataset.to, plain = 'plain' in el.dataset, from = plain ? to - 17 : 0, t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      el.textContent = plain ? v : fmt(v);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    $$('.count', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // documents checklist
  const docs = $$('#docsList input'), bar = $('#docsBar'), cnt = $('#docsCount');
  const upd = () => {
    const n = docs.filter(d => d.checked).length;
    bar.style.width = (n / docs.length * 100) + '%';
    cnt.textContent = n === docs.length ? 'Alles bereit. Danke.' : `${n} von ${docs.length} bereit`;
  };
  docs.forEach(d => d.addEventListener('change', upd));

  // Bestattungsart cards -> jump to matching price card, open details, highlight
  $$('[data-jump]').forEach(a => a.addEventListener('click', () => {
    const el = $(a.hash); if (!el) return;
    el.classList.add('is-in');
    const det = $('details', el); if (det) det.open = true;
    $$('.price').forEach(p => p.classList.toggle('is-target', p === el));
    clearTimeout(window.__hl); window.__hl = setTimeout(() => el.classList.remove('is-target'), 2600);
  }));

  // reviews slider
  const track = $('#reviews');
  $$('.rbtn').forEach(b => b.addEventListener('click', () => {
    const card = track.firstElementChild.getBoundingClientRect().width + 16;
    track.scrollBy({ left: card * +b.dataset.dir, behavior: 'smooth' });
  }));

  // map on click only
  $('#mapBtn').addEventListener('click', () => {
    $('#map').innerHTML = '<iframe title="Karte: Über den Krautländern 5, Erfurt-Urbich" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=%C3%9Cber+den+Krautl%C3%A4ndern+5,+99098+Erfurt&output=embed"></iframe>';
  });

  // form wizard
  const form = $('#wizard'), steps = $$('.wstep', form), dots = $$('.wizard__dots li', form);
  const back = $('#wBack'), next = $('#wNext');
  let cur = 1;
  const show = n => {
    cur = n;
    steps.forEach(s => s.classList.toggle('is-on', +s.dataset.step === n));
    dots.forEach((d, i) => d.classList.toggle('on', i < Math.min(n, 3)));
    back.hidden = n === 1 || n === 4;
    next.hidden = n === 4;
    next.textContent = n === 3 ? 'Anfrage senden' : 'Weiter';
  };
  const valid = n => {
    const s = steps[n - 1], err = $('.werr', s);
    let ok = true;
    if (n === 1) ok = !!form.anliegen.value;
    if (n === 3) ok = form.name.value.trim() && form.telefon.value.trim();
    if (err) err.hidden = !!ok;
    return ok;
  };
  next.addEventListener('click', () => {
    if (!valid(cur)) return;
    if (cur < 3) return show(cur + 1);
    const f = form;
    const body = [
      `Anliegen: ${f.anliegen.value}`,
      `Bestattungsart: ${f.art.value || '-'}`,
      `Name: ${f.name.value}`,
      `Telefon: ${f.telefon.value}`,
      `E-Mail: ${f.email.value || '-'}`,
      '', f.nachricht.value
    ].join('\n');
    location.href = `mailto:kontakt@bestattungsservice-karl.de?subject=${encodeURIComponent('Anfrage: ' + f.anliegen.value)}&body=${encodeURIComponent(body)}`;
    show(4);
  });
  back.addEventListener('click', () => show(cur - 1));
  $$('.choice input[name=anliegen]', form).forEach(r => r.addEventListener('change', () => { valid(1); setTimeout(() => show(2), 250); }));

  // price buttons preselect
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.pick;
    $('input[value="Kostenvoranschlag / Preisanfrage"]').checked = true;
    const art = /See/.test(v) ? 'Seebestattung' : /Erd/.test(v) ? 'Erdbestattung' : 'Feuerbestattung';
    $(`input[name=art][value="${art}"]`).checked = true;
    form.nachricht.value = `Ich interessiere mich für: ${v}`;
    show(2);
  }));
})();
