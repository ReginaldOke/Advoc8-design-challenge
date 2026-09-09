/* Narrow windows (redesign): below 800px the Sources, Time frame and Sort chips fold into one "Filters (N)" chip with a single popover. Above that they return to the row. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var MQ = window.matchMedia('(max-width: 800px)');
  var groups = [];
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function make(row, items, opts) {
    items = items.filter(function (i) { return i.el; });
    if (!row || !items.length) return;
    var g = { row: row, items: items, opts: opts || {}, open: false };
    g.chip = el('div', 'l2-fchip l2-fchip--group');
    g.chip.innerHTML = '<button type="button" class="l2-fbtn" aria-haspopup="true" aria-expanded="false"><i class="far fa-sliders-h"></i><span class="val"><span>Filters (' + items.length + ')</span></span><span class="grp-dot" hidden></span><i class="fas fa-chevron-down caret"></i></button><div class="l2-pop l2-pop--group" role="group"><div class="grp-body"></div>' + (g.opts.more ? '<div class="rule"></div><button type="button" class="grp-more">' + g.opts.more.label + '</button>' : '') + '</div>';
    g.body = g.chip.querySelector('.grp-body');
    g.btn = g.chip.querySelector('.l2-fbtn');
    g.btn.onclick = function () { g.open = !g.open; g.chip.classList.toggle('open', g.open); g.btn.setAttribute('aria-expanded', g.open); if (g.open) refresh(g); };
    var more = g.chip.querySelector('.grp-more');
    if (more) more.onclick = function () { close(g); var t = document.querySelector(g.opts.more.trigger); if (t) t.click(); };
    items.forEach(function (it) { it.ph = document.createComment('chip:' + (it.label || '')); it.row = el('div', 'grp-row'); it.k = el('span', 'grp-k', it.label || ''); it.row.appendChild(it.k); });
    groups.push(g);
  }
  function close(g) { g.open = false; g.chip.classList.remove('open'); g.btn.setAttribute('aria-expanded', 'false'); }
  function refresh(g) {
    var any = false;
    g.items.forEach(function (it) {
      var active = it.el.classList.contains('active') || !!it.el.querySelector('.active, .is-sel');
      if (active) any = true;
      if (it.value) it.k.textContent = it.label + (it.value(it.el) ? ': ' + it.value(it.el) : '');
    });
    g.chip.querySelector('.grp-dot').hidden = !any;
  }
  function collapse(g) {
    if (g.collapsed) return; g.collapsed = true;
    g.items.forEach(function (it) { it.el.parentNode.insertBefore(it.ph, it.el); it.row.appendChild(it.el); g.body.appendChild(it.row); });
    (g.opts.anchor || g.row).appendChild(g.chip);
    refresh(g);
  }
  function expand(g) {
    if (!g.collapsed) return; g.collapsed = false; close(g);
    g.items.forEach(function (it) { it.ph.parentNode.insertBefore(it.el, it.ph); it.ph.remove(); });
    g.chip.remove();
  }
  function apply() { groups.forEach(function (g) { MQ.matches ? collapse(g) : expand(g); }); }
  var poll = setInterval(function () { groups.forEach(refresh); }, 800);
  document.addEventListener('mousedown', function (e) { groups.forEach(function (g) { if (g.open && !g.chip.contains(e.target)) close(g); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') groups.forEach(close); });

  var $ = function (s) { return document.querySelector(s); };
  var tip = function (c) { return (c.getAttribute('data-tooltip') || '').replace(/^Sort: /, ''); };
  var val = function (c) { var v = c.querySelector('.val > span'); return v ? v.textContent.trim() : ''; };
  /* Search page */
  make($('.l2-searchrow'), [
    { el: $('#l2SrcChip'), label: 'Sources', value: val },
    { el: $('#l2DateChip'), label: 'Time frame', value: val },
    { el: $('#l2SortChip'), label: 'Sort', value: tip }
  ], { more: $('.l2-fchip--filters .filter-button') ? { label: 'All filters (topics, stakeholders and more)', trigger: '.l2-fchip--filters .filter-button' } : null });
  /* Feed pages: sources, time frame and the content type pills fold into one chip */
  var pills = $('.l2-toolbar__pills'), feedRow = $('.l2-feedrow');
  if (feedRow) {
    var feedItems = [{ el: $('#feSrc'), label: 'Sources', value: val }, { el: $('#feDateChip'), label: 'Time frame', value: val }];
    if (pills && pills.offsetParent) feedItems.push({ el: pills, label: 'Show' });
    make(feedRow, feedItems);
  } else if (pills) {
    make(pills.parentNode, [{ el: pills, label: 'Show' }], { more: $('.l2-toolbar .filter-button') ? { label: 'All filters', trigger: '.l2-toolbar .filter-button' } : null });
  }

  if (MQ.addEventListener) MQ.addEventListener('change', apply); else MQ.addListener(apply);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(apply, 80); });
  apply();
})();
