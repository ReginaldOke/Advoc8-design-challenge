/* Feed builder (redesign): stakeholder picker. Nothing is added by default. Clicking the search shows suggested people and organisations, typing filters them, and + adds one as a row below. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var rows = document.getElementById('stakeholderRows'); if (!rows) return;
  var host = rows.parentNode, input = host.querySelector('input[type="search"]'); if (!input) return;
  var PARTY = { ALP: '#eb1e1e', ONP: '#f6773e', KAP: '#b50403', LP: '#1947ab', LNP: '#1947ab', GRN: '#35b651', IND: '#888888' };
  var ITEMS = [
    { n: 'Anthony Albanese', r: 'Prime Minister', j: 'Federal', p: 'ALP', img: 'avatars/anthony-albanese.jpg' },
    { n: 'Pauline Hanson', r: 'Leader of One Nation', j: 'Federal', p: 'ONP', img: 'avatars/pauline-hanson.jpg' },
    { n: 'Chris Minns', r: 'Premier', j: 'NSW', p: 'ALP', img: 'avatars/chris-minns.jpg' },
    { n: 'Bob Katter', r: 'Member for Kennedy (QLD)', j: 'Federal', p: 'KAP', img: 'avatars/bob-katter.jpg' },
    { n: 'Chris Bowen', r: 'Minister for Climate Change and Energy', j: 'Federal', p: 'ALP', img: 'avatars/chris-bowen.jpg' },
    { n: 'Penny Wong', r: 'Minister for Foreign Affairs', j: 'Federal', p: 'ALP', img: 'avatars/penny-wong.jpg' },
    { n: 'Jim Chalmers', r: 'Treasurer', j: 'Federal', p: 'ALP', img: 'avatars/jim-chalmers.jpg' },
    { n: 'Angus Taylor', r: 'Shadow Treasurer', j: 'Federal', p: 'LP', img: 'avatars/angus-taylor.jpg' },
    { n: 'Malcolm Roberts', r: 'Senator for Queensland (QLD)', j: 'Federal', p: 'ONP', img: 'avatars/malcolm-roberts.jpg' },
    { n: 'David Crisafulli', r: 'Premier', j: 'QLD', p: 'LNP', img: 'avatars/david-crisafulli.jpg' },
    { n: 'Peter Malinauskas', r: 'Premier', j: 'SA', p: 'ALP', img: 'avatars/peter-malinauskas.jpg' },
    { n: 'Roger Cook', r: 'Premier', j: 'WA', p: 'ALP', img: 'avatars/roger-cook.jpg' },
    { n: 'Smart Energy Council', r: 'Peak body', j: 'Federal', org: true, img: 'logos/smart-energy-council.png' },
    { n: 'Climate Change Authority', r: 'Agency', j: 'Federal', org: true, img: 'logos/climate-change-authority.png' },
    { n: 'Solar Citizens', r: 'Peak body', j: 'Federal', org: true, img: 'logos/solar-citizens.png' }
  ];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function initials(n) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function chosen() { return [].slice.call(rows.querySelectorAll('.stakeholder-row .font-weight-bold')).map(function (e) { return e.textContent.trim(); }); }
  function avatar(it, cls) {
    if (it.img) return '<img class="' + cls + '" src="assets/' + it.img + '" alt="">';
    return '<span class="' + cls + ' bsp__ini">' + esc(initials(it.n)) + '</span>';
  }

  var pal = document.createElement('div'); pal.className = 'bsp'; pal.hidden = true;
  pal.innerHTML = '<div class="bsp__head"><span class="bsp__title">Suggested</span><span class="bsp__hint"><kbd>&uarr;</kbd> <kbd>&darr;</kbd> then <kbd>Enter</kbd> to add</span></div><div class="bsp__list" role="listbox"></div>';
  host.style.position = 'relative'; host.insertBefore(pal, rows);
  var list = pal.querySelector('.bsp__list'), sel = 0, shown = [];

  function render(q) {
    q = (q || '').trim().toLowerCase();
    var have = chosen();
    shown = ITEMS.filter(function (it) { return have.indexOf(it.n) === -1 && (!q || (it.n + ' ' + it.r + ' ' + it.j).toLowerCase().indexOf(q) !== -1); }).slice(0, 8);
    pal.querySelector('.bsp__title').textContent = q ? (shown.length ? 'Stakeholders' : 'No matches') : 'Suggested';
    sel = 0;
    list.innerHTML = shown.map(function (it, i) {
      return '<button type="button" class="bsp__item' + (i === sel ? ' is-sel' : '') + '" role="option" data-i="' + i + '">' +
        '<span class="bsp__av' + (it.org ? ' bsp__av--org' : '') + '">' + avatar(it, 'bsp__img') + '</span>' +
        '<span class="bsp__txt"><span class="bsp__name">' + esc(it.n) + '</span><span class="bsp__sub">' + esc(it.r) + ' | ' + esc(it.j) + '</span></span>' +
        '<span class="bsp__add" aria-hidden="true"><i class="far fa-plus"></i></span></button>';
    }).join('') || '<div class="bsp__empty">Try a person, organisation or department name.</div>';
    if (window.applyTablerIcons) window.applyTablerIcons(list);
  }
  function open() { pal.style.top = (input.offsetTop + input.offsetHeight + 6) + 'px'; render(input.value); pal.hidden = false; input.setAttribute('aria-expanded', 'true'); }
  function close() { pal.hidden = true; input.setAttribute('aria-expanded', 'false'); }
  function move(d) {
    if (!shown.length) return; sel = (sel + d + shown.length) % shown.length;
    list.querySelectorAll('.bsp__item').forEach(function (b, i) { b.classList.toggle('is-sel', i === sel); });
    var cur = list.querySelector('.is-sel'); if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function rowFor(it) {
    var d = document.createElement('div'); d.className = 'stakeholder-row is-new';
    var badge = it.org ? '' : '<span class="badge party" style="background-color: ' + (PARTY[it.p] || '#888') + '; color: white;">' + esc(it.p) + '</span>';
    d.innerHTML = '<div class="avatar avatar-sm mr-3">' + avatar(it, 'avatar-img rounded') + '</div>' +
      '<div style="min-width: 0;"><div class="d-flex align-items-center flex-gap-2"><span class="font-weight-bold">' + esc(it.n) + '</span>' + badge + '<span class="badge bg-secondary-soft text-dark">' + esc(it.j) + '</span></div>' +
      '<div class="text-muted small">' + esc(it.r) + '</div></div>' +
      '<button type="button" class="sh-x" aria-label="Remove ' + esc(it.n) + '"><i class="fal fa-times"></i></button>';
    return d;
  }
  function add(it) {
    if (!it) return;
    var r = rowFor(it); rows.appendChild(r);
    if (window.applyTablerIcons) window.applyTablerIcons(r);
    requestAnimationFrame(function () { r.classList.remove('is-new'); });
    input.value = ''; close();
    if (window.buildLiveUpdate) window.buildLiveUpdate();
  }

  window.buildAddStakeholder = function (name) { var it = ITEMS.filter(function (x) { return x.n === name; })[0]; if (it && chosen().indexOf(name) === -1) add(it); };
  input.setAttribute('aria-haspopup', 'listbox'); input.setAttribute('autocomplete', 'off');
  input.addEventListener('focus', open); input.addEventListener('click', open);
  input.addEventListener('input', function () { render(input.value); pal.hidden = false; });
  input.addEventListener('keydown', function (e) {
    if (pal.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) open();
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { if (!pal.hidden && input.value.trim() && shown[sel]) { e.preventDefault(); e.stopPropagation(); add(shown[sel]); } else close(); }
    else if (e.key === 'Escape') { close(); input.blur(); }
  });
  list.addEventListener('mousemove', function (e) { var b = e.target.closest('.bsp__item'); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; list.querySelectorAll('.bsp__item').forEach(function (x, i) { x.classList.toggle('is-sel', i === sel); }); } });
  list.addEventListener('mousedown', function (e) { e.preventDefault(); }); /* keep focus in the search */
  list.addEventListener('click', function (e) { var b = e.target.closest('.bsp__item'); if (b) add(shown[+b.dataset.i]); });
  document.addEventListener('mousedown', function (e) { if (!host.contains(e.target)) close(); });
})();
