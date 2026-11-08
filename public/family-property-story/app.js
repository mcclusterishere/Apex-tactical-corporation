(() => {
  const slides = [...document.querySelectorAll('[data-slide]')];
  const nav = [...document.querySelectorAll('.chapter-nav a')];
  const present = document.querySelector('#present');
  const controls = document.querySelector('.present-controls');
  let index = 0, presenting = false;
  const groups = [];
  function show(i, scroll = true) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, n) => s.classList.toggle('slide-visible', n === index));
    nav.forEach(a => {const active = a.hash === '#' + slides[index].id; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');});
    document.querySelector('#slide-count').textContent = `${index + 1} / ${slides.length}`;
    document.querySelector('#previous').disabled = index === 0;
    document.querySelector('#next').disabled = index === slides.length - 1;
    if (presenting && scroll) window.scrollTo({top: 0, behavior: 'instant'});
  }
  function mode(value) {
    presenting = value;
    document.body.classList.toggle('presenting', value);
    present.textContent = value ? 'Exit presentation' : 'Present';
    present.setAttribute('aria-pressed', String(value));
    controls.setAttribute('aria-hidden', String(!value));
    show(index);
    if (!value) {slides[index].scrollIntoView({behavior: 'instant'}); present.focus({preventScroll: true});}
  }
  function filterGroup(name, cardSelector, attribute) {
    const input = document.querySelector('#' + name + '-search');
    const buttons = [...document.querySelectorAll(`[data-filter-group="${name}"]`)];
    const cards = [...document.querySelectorAll(cardSelector)];
    const count = document.querySelector('#' + name + '-count');
    const empty = document.querySelector('#' + name + '-empty');
    let category = 'all';
    function apply() {
      const q = input ? input.value.trim().toLocaleLowerCase() : '';
      let shown = 0;
      cards.forEach(c => {c.hidden = !((category === 'all' || c.dataset[attribute] === category) && (c.textContent + " " + c.id).toLocaleLowerCase().includes(q)); if (!c.hidden) shown++;});
      count.textContent = `${shown} of ${cards.length} ${name === 'source' ? 'record groups' : name === 'parcel' ? 'investigated parcels' : 'moments'} shown`;
      empty.hidden = shown > 0;
    }
    function reset() {category = 'all'; if (input) input.value = ''; buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === 'all'))); apply();}
    if (input) input.addEventListener('input', apply);
    buttons.forEach(b => b.addEventListener('click', () => {category = b.dataset.filter; buttons.forEach(other => other.setAttribute('aria-pressed', String(other === b))); apply();}));
    groups.push({cards, reset}); apply();
  }
  filterGroup('source', '.source-card', 'group');
  filterGroup('parcel', '.parcel-card', 'group');
  filterGroup('timeline', '.timeline-item', 'group');
  function reveal(target) {
    for (const group of groups) {const found = group.cards.find(c => c === target || c.contains(target)); if (found && found.hidden) group.reset();}
    const slide = target.matches('[data-slide]') ? target : target.closest('[data-slide]');
    if (slide) {show(slides.indexOf(slide), false); if (presenting && target === slide) window.scrollTo({top:0, behavior:'instant'});}
  }
  function followHash() {
    const id = window.location.hash.slice(1); if (!id) return;
    const target = document.getElementById(decodeURIComponent(id)); if (target) {reveal(target); target.scrollIntoView({behavior:'instant'});}
  }
  present.addEventListener('click', () => mode(!presenting));
  document.querySelector('#previous').addEventListener('click', () => show(index - 1));
  document.querySelector('#next').addEventListener('click', () => show(index + 1));
  document.querySelector('#exit-present').addEventListener('click', () => mode(false));
  document.querySelector('#print').addEventListener('click', () => window.print());
  document.addEventListener('keydown', event => {
    if (!presenting) return;
    if (event.key === 'Escape') {mode(false); return;}
    if (event.target.closest('input,textarea,select,summary,button,a')) return;
    if (event.key === 'ArrowRight') {event.preventDefault(); show(index + 1);}
    if (event.key === 'ArrowLeft') {event.preventDefault(); show(index - 1);}
  });
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href^="#"]'); if (!a) return;
    const target = document.getElementById(a.getAttribute('href').slice(1)); if (!target) return;
    reveal(target);
  });
  window.addEventListener('hashchange', followHash);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {if (presenting) return; for (const entry of entries) if (entry.isIntersecting) show(slides.indexOf(entry.target), false);}, {rootMargin:'-5% 0px -65% 0px'});
    slides.forEach(s => observer.observe(s));
  }
  show(0, false); followHash();
})();
