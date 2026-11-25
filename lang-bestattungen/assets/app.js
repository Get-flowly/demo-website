(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // nav
  const nav = $('#nav'), burger = $('.nav__burger'), mnav = $('#mnav'), callbar = $('.callbar');
  const onScroll = () => {
    nav.classList.toggle('is-solid', scrollY > 30);
    callbar && callbar.classList.toggle('is-on', scrollY > innerHeight * 0.6);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open);
  });
  $$('a', mnav).forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); mnav.classList.remove('is-open'); }));
  const links = $$('.nav__links a');
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(l => { const s = $(l.hash); s && so.observe(s); });

  // reveal + count
  const countUp = el => {
    const to = +el.dataset.to, t0 = performance.now(), dur = 1200;
    const tick = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); $$('.count', e.target).forEach(countUp); io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // where did it happen
  const whereBtns = $$('[data-where]');
  whereBtns.forEach(b => b.addEventListener('click', () => {
    whereBtns.forEach(x => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
    $$('[data-show]').forEach(el => { el.hidden = el.dataset.show !== b.dataset.where; });
    $$('.fact[data-show]').forEach(el => el.classList.add('is-in'));
  }));

  // document finder
  const docList = $('#docList'), docN = $('#docN');
  const D = {
    base: [['Todesbescheinigung', 'vom Arzt ausgestellt'], ['Personalausweis', 'des/der Verstorbenen'], ['Nachweis akademischer Grade', 'falls vorhanden']],
    ledig: [['Geburtsurkunde', 'des/der Verstorbenen'], ['Beglaubigte Abschrift aus dem Familienbuch der Eltern', '']],
    verheiratet: [['Heiratsurkunde der letzten Ehe', ''], ['Beglaubigte Abschrift aus dem Familienbuch der letzten Ehe', '']],
    verwitwet: [['Heiratsurkunde der letzten Ehe', ''], ['Beglaubigte Abschrift aus dem Familienbuch der letzten Ehe', ''], ['Sterbeurkunde des Ehegatten bzw. Scheidungsurteil', '']],
    feuer: [['Unbedenklichkeitserklärung', 'in Bayern von der Polizei ausgestellt, wir kümmern uns darum'], ['Schriftliche Willenserklärung zur Feuerbestattung', 'des Verstorbenen oder der nächsten Angehörigen']],
    aussiedler: [['Aussiedlerausweis und Einbürgerungsurkunde', ''], ['Geburts- und Heiratsurkunden im Original', 'jeweils mit deutscher Übersetzung'], ['Namensänderungsurkunde', 'bei Namensänderung']],
    extra: [['Bestattungs-Vorsorgevertrag und Grabdokumente', 'wenn vorhanden']]
  };
  let prev = new Set();
  const renderDocs = () => {
    const stand = $('input[name=stand]:checked').value;
    const items = [...D.base, ...D[stand], ...($('#feuer').checked ? D.feuer : []), ...($('#aussiedler').checked ? D.aussiedler : []), ...D.extra];
    const now = new Set(items.map(i => i[0]));
    docList.innerHTML = items.map(([t, s], i) =>
      `<li class="${prev.size && !prev.has(t) ? 'is-new' : ''}" style="animation-delay:${i * 30}ms"><span>${t}${s ? `<small>${s}</small>` : ''}</span></li>`).join('');
    docN.textContent = items.length;
    prev = now;
  };
  $$('input[name=stand], #feuer, #aussiedler').forEach(i => i.addEventListener('change', renderDocs));
  renderDocs();
  $('#docPrint').addEventListener('click', () => print());

  // accordion: one open at a time
  const accs = $$('#acc details');
  accs.forEach(d => d.addEventListener('toggle', () => { if (d.open) accs.forEach(o => o !== d && (o.open = false)); }));

  // type tabs
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[role=tab]', box);
    const select = t => tabs.forEach(x => {
      const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      $('#' + x.getAttribute('aria-controls')).hidden = !on;
    });
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
        e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; select(n); n.focus();
      });
    });
  });

  // compass checklist
  const cbtns = $$('.compass__list button'), cdone = $('#compassDone');
  cbtns.forEach(b => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      const on = b.classList.toggle('on'); b.setAttribute('aria-pressed', on);
      const n = cbtns.filter(x => x.classList.contains('on')).length;
      cdone.innerHTML = n === cbtns.length
        ? 'Sie haben alles bedacht. Sprechen wir gemeinsam darüber: <a href="tel:+491731028368">0173 102 83 68</a>'
        : `${n} von ${cbtns.length} geklärt. Offene Fragen besprechen wir gern mit Ihnen: <a href="tel:+491731028368">0173 102 83 68</a>`;
    });
  });

  // map
  $('#mapBtn').addEventListener('click', () => {
    $('#map').innerHTML = '<iframe title="Karte: Kirchweg 2, 95185 Gattendorf" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Kirchweg+2,+95185+Gattendorf&output=embed"></iframe>';
  });

  // wizard
  const form = $('#wizard'), steps = $$('.wstep', form), dots = $$('.wizard__dots li', form), back = $('#wBack'), next = $('#wNext');
  let cur = 1;
  const show = n => {
    cur = n;
    steps.forEach(s => s.classList.toggle('is-on', +s.dataset.step === n));
    dots.forEach((d, i) => d.classList.toggle('on', i < Math.min(n, 3)));
    back.hidden = n === 1 || n === 4; next.hidden = n === 4;
    next.textContent = n === 3 ? 'Anfrage senden' : 'Weiter';
  };
  const valid = n => {
    const err = $('.werr', steps[n - 1]); let ok = true;
    if (n === 1) ok = !!form.anliegen.value;
    if (n === 3) ok = !!(form.name.value.trim() && form.telefon.value.trim());
    if (err) err.hidden = ok; return ok;
  };
  next.addEventListener('click', () => {
    if (!valid(cur)) return;
    if (cur < 3) return show(cur + 1);
    const f = form;
    const body = [`Anliegen: ${f.anliegen.value}`, `Bestattungsart: ${f.art.value || '-'}`, `Name: ${f.name.value}`, `Telefon: ${f.telefon.value}`, `E-Mail: ${f.email.value || '-'}`, '', f.nachricht.value].join('\n');
    location.href = `mailto:info@lang-bestattungen.de?subject=${encodeURIComponent('Anfrage: ' + f.anliegen.value)}&body=${encodeURIComponent(body)}`;
    show(4);
  });
  back.addEventListener('click', () => show(cur - 1));
  $$('input[name=anliegen]', form).forEach(r => r.addEventListener('change', () => { valid(1); setTimeout(() => show(2), 250); }));
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.pick;
    $(`input[name=anliegen][value="${v}"]`).checked = true;
    show(2);
  }));
})();
