/* Stakeholder search palette (redesign): recently viewed people and organisations, with photos/logos, filtered as you type. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var box = document.querySelector('.l2-searchrow .index-search-box'), input = box && box.querySelector('input[type=search]');
  if (!box || !input) return;
  var ITEMS = [
    { t: 'org', n: 'Climate Change Authority', s: 'Agency | Federal', img: 'logos/climate-change-authority.png', href: 'orgs2.html' },
    { t: 'org', n: 'Solar Citizens', s: 'Peak Body', img: 'logos/solar-citizens.png', href: 'interest-groups2.html' },
    { t: 'org', n: 'Institute of Public Affairs', s: 'IPA | Peak Body', img: 'logos/institute-of-public-affairs.png', href: 'interest-groups2.html' },
    { t: 'org', n: 'Smart Energy Council', s: 'Peak Body', img: 'logos/smart-energy-council.png', href: 'interest-groups2.html' },
    { t: 'person', n: 'Amber-Jade Sanderson', s: 'Minister for Energy and Decarbonisation | WA', img: 'avatars/amber-jade-sanderson.jpg', href: 'person2.html' },
    { t: 'person', n: 'Josh Wilson', s: 'Assistant Minister for Climate Change and Energy | Federal', img: 'avatars/josh-wilson.jpg', href: 'person2.html' },
    { t: 'person', n: 'Tim Ayres', s: 'Minister for Science | Federal', img: 'avatars/tim-ayres.jpg', href: 'person2.html' },
    { t: 'person', n: 'Malcolm Roberts', s: 'Senator for Queensland (QLD) | Federal', img: 'avatars/malcolm-roberts.jpg', href: 'person2.html' },
    { t: 'person', n: 'Chris Bowen', s: 'Minister for Climate Change and Energy | Federal', img: 'avatars/chris-bowen.jpg', href: 'person2.html' },
    { t: 'person', n: 'Anthony Albanese', s: 'Prime Minister | Federal', img: 'avatars/anthony-albanese.jpg', href: 'person2.html' },
    { t: 'person', n: 'Penny Wong', s: 'Minister for Foreign Affairs | Federal', img: 'avatars/penny-wong.jpg', href: 'person2.html' },
    { t: 'person', n: 'Jim Chalmers', s: 'Treasurer | Federal', img: 'avatars/jim-chalmers.jpg', href: 'person2.html' },
    { t: 'person', n: 'Katy Gallagher', s: 'Minister for Finance | Federal', img: 'avatars/katy-gallagher.jpg', href: 'person2.html' },
    { t: 'person', n: 'Richard Marles', s: 'Minister for Defence | Federal', img: 'avatars/richard-marles.jpg', href: 'person2.html' },
    { t: 'person', n: 'Chris Minns', s: 'Premier | NSW', img: 'avatars/chris-minns.jpg', href: 'person2.html' },
    { t: 'person', n: 'David Crisafulli', s: 'Premier | QLD', img: 'avatars/david-crisafulli.jpg', href: 'person2.html' },
    { t: 'org', n: 'Department of Health, Disability and Ageing', s: 'DHDA | Department | Federal', img: null, href: 'orgs2.html' },
    { t: 'org', n: 'Department of the Prime Minister and Cabinet', s: 'DPMC | Department | Federal', img: null, href: 'orgs2.html' }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initials(n) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  var pal = document.createElement('div'); pal.className = 'spal'; pal.hidden = true;
  pal.innerHTML = '<div class="spal__head"><span class="spal__title">Recently viewed</span><span class="spal__hint"><i class="far fa-circle-info"></i> Use <kbd>↑</kbd> <kbd>↓</kbd> and <kbd>Enter</kbd> to navigate</span></div><div class="spal__list" role="listbox"></div>';
  box.style.position = 'relative'; box.appendChild(pal);
  var list = pal.querySelector('.spal__list'), sel = 0, shown = [];
  function render(q) {
    q = (q || '').trim().toLowerCase();
    shown = ITEMS.filter(function (it) { return !q || (it.n + ' ' + it.s).toLowerCase().indexOf(q) !== -1; }).slice(0, 10);
    pal.querySelector('.spal__title').textContent = q ? (shown.length ? 'Stakeholders' : 'No matches') : 'Recently viewed';
    sel = 0;
    list.innerHTML = shown.map(function (it, i) {
      var av = it.img ? '<img src="assets/' + it.img + '" alt="">' : '<span class="spal__ini">' + esc(initials(it.n)) + '</span>';
      return '<a class="spal__item' + (i === sel ? ' is-sel' : '') + '" role="option" href="' + it.href + '" data-i="' + i + '"><span class="spal__av spal__av--' + it.t + '">' + av + '</span><span class="spal__txt"><span class="spal__name">' + esc(it.n) + '</span><span class="spal__sub">' + esc(it.s) + '</span></span><i class="fal ' + (it.t === 'org' ? 'fa-sitemap' : 'fa-user') + ' spal__type"></i></a>';
    }).join('') || '<div class="spal__empty">Try a person, organisation or department name.</div>';
  }
  function open() { pal.style.maxWidth = Math.max(320, window.innerWidth - box.getBoundingClientRect().left - 24) + "px"; render(input.value); pal.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function close() { pal.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  function move(d) { if (!shown.length) return; sel = (sel + d + shown.length) % shown.length; list.querySelectorAll('.spal__item').forEach(function (a, i) { a.classList.toggle('is-sel', i === sel); }); var cur = list.querySelector('.is-sel'); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
  input.setAttribute('aria-haspopup', 'listbox'); input.setAttribute('autocomplete', 'off');
  input.addEventListener('focus', open); input.addEventListener('click', open);
  input.addEventListener('input', function () { render(input.value); pal.hidden = false; });
  input.addEventListener('keydown', function (e) {
    if (pal.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { open(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { var it = shown[sel]; if (it && !pal.hidden) { e.preventDefault(); location.href = it.href; } }
    else if (e.key === 'Escape') { close(); input.blur(); }
  });
  list.addEventListener('mousemove', function (e) { var a = e.target.closest('.spal__item'); if (a) { sel = +a.dataset.i; list.querySelectorAll('.spal__item').forEach(function (x, i) { x.classList.toggle('is-sel', i === sel); }); } });
  document.addEventListener('mousedown', function (e) { if (!box.contains(e.target)) close(); });
})();
