(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // header shadow + mobile bar
  const header = $('.header'), mbar = $('.mbar'), hero = $('.hero');
  if (!header || !hero) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', scrollY > 10);
    if (mbar) mbar.classList.toggle('is-on', scrollY > hero.offsetHeight * 0.6);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // burger
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open);
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }));

  // reveal on scroll, staggered within a parent
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const sibs = $$('.reveal', e.target.parentElement);
    e.target.style.setProperty('--rd', (Math.max(0, sibs.indexOf(e.target)) % 6) * 0.08 + 's');
    e.target.classList.add('is-in'); io.unobserve(e.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  const steps = $('.steps');
  if (steps) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { steps.classList.add('is-in'); o.disconnect(); } }), { threshold: .3 }).observe(steps);

  // count up
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
    const tick = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    el.textContent = '0'; requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $$('[data-count]').forEach(el => cio.observe(el));

  // active nav link
  const links = $$('.nav a[href^="#"]');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sio.observe(s));

  // wizard
  const form = $('#wizard'); if (!form) return;
  const panes = $$('.wpane', form), bar = $('#wbar'), stepTxt = $('#wstep'), next = $('#wnext'), back = $('#wback');
  let cur = 1;
  const show = n => {
    cur = n; panes.forEach(p => p.classList.toggle('is-on', +p.dataset.pane === n));
    bar.style.width = (n / 3 * 100) + '%'; stepTxt.textContent = `Schritt ${n} von 3`;
    back.hidden = n === 1;
    next.firstChild.textContent = n === 3 ? 'Dach-Check anfragen ' : 'Weiter ';
    $$('.err', form).forEach(e => e.classList.remove('show'));
  };
  const valid = n => {
    if (n === 1) return !!form.querySelector('input[name="Anliegen"]:checked');
    if (n === 2) return $('#ort').value.trim().length > 1;
    if (n === 3) return $('#name').value.trim().length > 1 && $('#tel').value.replace(/\D/g, '').length >= 6;
  };
  next.addEventListener('click', () => {
    if (!valid(cur)) { const e = form.querySelector(`[data-err="${cur}"]`); e.classList.remove('show'); void e.offsetWidth; e.classList.add('show'); return; }
    if (cur < 3) return show(cur + 1);
    const data = new FormData(form); let body = 'Anfrage Dach-Check über die Website\n\n';
    for (const [k, v] of data) if (v) body += `${k}: ${v}\n`;
    location.href = 'mailto:metz-bedachungen@t-online.de?subject=' + encodeURIComponent('Dach-Check Anfrage: ' + (data.get('Anliegen') || '')) + '&body=' + encodeURIComponent(body);
    form.innerHTML = '<div class="wizard__done"><div class="tick"><svg width="44" height="44" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3"/></svg></div><h3>Fast geschafft</h3><p>Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. Bitte nur noch auf Senden tippen.<br>Oder rufen Sie direkt an: <a class="link" href="tel:+49442181797">04421 81797</a></p></div>';
  });
  back.addEventListener('click', () => show(cur - 1));
  // auto-advance when an option is picked on step 1
  $$('input[name="Anliegen"]', form).forEach(r => r.addEventListener('change', () => setTimeout(() => cur === 1 && show(2), 250)));

  // topic shortcuts (hero widget + service cards) preselect step 1
  const pick = topic => {
    const r = form.querySelector(`input[name="Anliegen"][value="${topic}"]`);
    if (r) { r.checked = true; show(2); }
  };
  $$('[data-topic]').forEach(el => el.addEventListener('click', e => {
    pick(el.dataset.topic);
    if (el.tagName === 'BUTTON') { e.preventDefault(); $('#anfrage').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#ort').focus({ preventScroll: true }), 700); }
  }));
})();
