/* Layout 1 top bar search: clicking Search (or Command K) opens a wide search box over the top bar with a Recently viewed list of feeds, people and organisations. Type to filter, arrow keys to move, Enter to open, Escape or Cancel to close. */
(function () {
  var launcher = document.querySelector('#topbar .nav-search-launcher'); if (!launcher) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function items() {
    var out = [];
    document.querySelectorAll('#feeds_sidebar_collapse > a.nav-link').forEach(function (a) {
      if (/View all/i.test(a.textContent)) return;
      var em = a.querySelector('.flex-noshrink'), nm = a.querySelector('.text-nowrap');
      var h = a.getAttribute('href'); out.push({ t: 'feed', n: nm ? nm.textContent.trim() : a.textContent.trim(), emoji: em ? em.textContent.trim() : '', href: (h && h !== '#') ? h : 'feed.html' });
    });
    out.push({ t: 'person', n: 'Anthony Albanese', s: 'Prime Minister | Federal', href: 'person.html' });
    out.push({ t: 'org', n: 'Climate Change Authority', s: 'Agency | Federal', href: 'orgs.html' });
    out.push({ t: 'org', n: 'Solar Citizens', s: 'Peak Body', href: 'orgs.html' });
    out.push({ t: 'org', n: 'Institute of Public Affairs', s: 'IPA | Peak Body', href: 'orgs.html' });
    out.push({ t: 'org', n: 'Smart Energy Council', s: 'Peak Body', href: 'orgs.html' });
    return out;
  }
  var ICON = { feed: 'fa-wave-pulse', person: 'fa-user', org: 'fa-sitemap' };
  var wrap = null, input, list, shown = [], sel = 0;
  function build() {
    wrap = document.createElement('div'); wrap.className = 'tsq';
    wrap.innerHTML = '<div class="tsq__box"><i class="far fa-search tsq__mag"></i><input type="search" class="tsq__input" placeholder="Start typing…" aria-label="Search" autocomplete="off"><button type="button" class="tsq__cancel">Cancel</button></div>' +
      '<div class="tsq__panel" role="listbox"><div class="tsq__head"><span class="tsq__title">Recently viewed</span><span class="tsq__hint"><i class="far fa-circle-info"></i> Use <kbd>&uarr;</kbd> <kbd>&darr;</kbd> and <kbd>Enter</kbd> to navigate</span></div><div class="tsq__list"></div></div>';
    document.body.appendChild(wrap);
    input = wrap.querySelector('.tsq__input'); list = wrap.querySelector('.tsq__list');
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { var it = shown[sel]; if (it) { e.preventDefault(); location.href = it.href; } }
      else if (e.key === 'Escape') { close(); }
    });
    wrap.querySelector('.tsq__cancel').addEventListener('click', close);
    list.addEventListener('mousemove', function (e) { var a = e.target.closest('.tsq__item'); if (a && +a.dataset.i !== sel) { sel = +a.dataset.i; paint(); } });
  }
  function render(q) {
    q = (q || '').trim().toLowerCase();
    shown = items().filter(function (it) { return !q || (it.n + ' ' + (it.s || '')).toLowerCase().indexOf(q) !== -1; });
    wrap.querySelector('.tsq__title').textContent = q ? (shown.length ? 'Results' : 'No matches') : 'Recently viewed';
    sel = 0;
    list.innerHTML = shown.map(function (it, i) {
      return '<a class="tsq__item" role="option" href="' + esc(it.href) + '" data-i="' + i + '"><i class="far ' + ICON[it.t] + ' fa-fw tsq__ico"></i>' +
        (it.emoji ? '<span class="tsq__emoji">' + esc(it.emoji) + '</span>' : '') +
        '<span class="tsq__txt"><span class="tsq__name">' + esc(it.n) + '</span>' + (it.s ? '<span class="tsq__sub">' + esc(it.s) + '</span>' : '') + '</span></a>';
    }).join('') || '<div class="tsq__empty">Try a feed, person or organisation name.</div>';
    paint();
  }
  function paint() { list.querySelectorAll('.tsq__item').forEach(function (a, i) { a.classList.toggle('is-sel', i === sel); }); }
  function move(d) { if (!shown.length) return; sel = (sel + d + shown.length) % shown.length; paint(); var cur = list.querySelector('.is-sel'); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
  function place() {
    var r = launcher.getBoundingClientRect(), rr = window.innerWidth - 24;
    document.querySelectorAll('#topbar .navbar-nav').forEach(function (n) { var b = n.getBoundingClientRect(); if (b.left > r.right && b.left - 16 < rr) rr = b.left - 16; }); /* stop short of the icons on the right */
    wrap.style.left = Math.round(r.left) + 'px'; wrap.style.top = Math.round(r.top + r.height / 2 - 26) + 'px';
    wrap.style.width = Math.max(420, Math.round(rr - r.left)) + 'px';
  }
  function open() {
    if (!wrap) build();
    place(); render(''); input.value = '';
    wrap.classList.add('is-open'); document.body.classList.add('tsq-open');
    requestAnimationFrame(function () { wrap.classList.add('is-in'); input.focus(); });
  }
  function close() {
    if (!wrap || !wrap.classList.contains('is-open')) return;
    wrap.classList.remove('is-in'); document.body.classList.remove('tsq-open');
    setTimeout(function () { wrap.classList.remove('is-open'); }, 160);
    launcher.focus();
  }
  launcher.addEventListener('click', function (e) { e.preventDefault(); open(); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (wrap && wrap.classList.contains('is-open')) close(); else open(); }
  });
  document.addEventListener('mousedown', function (e) { if (wrap && wrap.classList.contains('is-open') && !wrap.contains(e.target) && !launcher.contains(e.target)) close(); });
  window.addEventListener('resize', function () { if (wrap && wrap.classList.contains('is-open')) place(); });
})();
