/* Charts (redesign): hovering a bar, party block or stakeholder row shows a small card with the name and count, plus View and Add to Filters. View opens the matching items in a side panel. Add to Filters adds a chip to the filter row and narrows the results. Works on Search and on every feed's Analysis tab. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var esc = window.replicaEsc || function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var PARTY = { ALP: 'Australian Labor Party', LP: 'Liberal Party', LNP: 'Liberal National Party', NAT: 'The Nationals', GRN: 'The Greens', IND: 'Independent', ONP: 'One Nation', LD: 'Liberal Democrats', KAP: 'Katter’s Australian Party', CA: 'Centre Alliance', JLN: 'Jacqui Lambie Network', CLP: 'Country Liberal Party' };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var ICON = { date: 'fa-calendar', party: 'fa-flag', stakeholder: 'fa-user' };
  var isFeed = !!document.getElementById('timeline-cards');
  function listRoot() { return document.getElementById(isFeed ? 'timeline-cards' : 'search-results'); }
  function allCards() { var r = listRoot(); return r ? [].slice.call(r.querySelectorAll('[data-card-type]')) : []; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function fmt(n) { return Number(n).toLocaleString('en-AU'); }

  /* ---- what was hovered ---- */
  function infoFor(t) {
    var hb = t.closest('.histo__bar'), col = hb && hb.closest('.histo__col'), cell = t.closest('.treemap__cell'), bar = t.closest('.top-stakeholders-chart__bar');
    if (col && col.hasAttribute('data-label')) {
      var label = col.getAttribute('data-label'), cols = col.parentNode.children.length;
      var gran = /^\d{4}$/.test(label) ? 'year' : (/^[A-Z][a-z]{2}$/.test(label) ? 'month' : (cols > 40 ? 'day' : 'week'));
      return { kind: 'date', key: label, title: label, sub: fmt(col.getAttribute('data-value')) + ' items', value: +col.getAttribute('data-value'), gran: gran, anchor: col.querySelector('.histo__bar') || col, place: 'above' };
    }
    if (cell && cell.hasAttribute('data-label')) {
      var code = cell.getAttribute('data-label');
      return { kind: 'party', key: code, title: PARTY[code] || code, sub: fmt(cell.getAttribute('data-value')) + ' items', value: +cell.getAttribute('data-value'), anchor: cell, place: 'centre' };
    }
    if (bar) {
      var name = (bar.querySelector('.text-truncate') || bar).textContent.trim(), b = bar.querySelector('.badge');
      var v = b ? b.textContent.trim() : '';
      return { kind: 'stakeholder', key: name, title: name, sub: v ? (/%/.test(v) ? v + ' of items' : fmt(v) + ' items') : '', value: parseInt(v, 10) || 0, anchor: bar.querySelector('.top-stakeholders-chart__data') || bar, place: 'above' };
    }
    return null;
  }

  /* ---- does a card match a selection ---- */
  function cardDate(card) {
    var m = card.textContent.match(/(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)/);
    return m ? new Date(2026, MONTHS.indexOf(m[2]), +m[1]) : null;
  }
  function matches(card, f) {
    if (f.kind === 'party') { var b = card.querySelector('.badge.party'); return !!b && b.textContent.trim() === f.key; }
    if (f.kind === 'stakeholder') return card.textContent.indexOf(f.key) !== -1;
    if (f.kind === 'date') {
      var d = cardDate(card); if (!d) return false;
      if (f.gran === 'year') return d.getFullYear() === +f.key;
      if (f.gran === 'month') return MONTHS[d.getMonth()].slice(0, 3) === f.key;
      var start = new Date(f.key + ', 2026'); if (isNaN(start)) return false;
      var end = new Date(start); end.setDate(start.getDate() + (f.gran === 'day' ? 1 : 7));
      return d >= start && d < end;
    }
    return true;
  }
  function matching(f) { var c = allCards(), m = c.filter(function (x) { return matches(x, f); }); return m.length ? m : c.slice(0, 5); } /* prototype data is thin: fall back to a sample */

  /* ---- hover card ---- */
  var card = null, current = null, hideT = null;
  function ensureCard() {
    if (card) return card;
    card = el('div', 'l2-chartcard', '<div class="l2-chartcard__hd"><span class="l2-chartcard__t"></span><span class="l2-chartcard__n"></span></div><div class="l2-chartcard__btns"><button type="button" class="btn btn-white btn-sm" data-act="view"><i class="far fa-rectangle-list"></i>View</button><button type="button" class="btn btn-white btn-sm" data-act="filter"><i class="far fa-magnifying-glass-plus"></i>Add to Filters</button></div>');
    document.body.appendChild(card);
    card.addEventListener('mouseenter', function () { clearTimeout(hideT); });
    card.addEventListener('mouseleave', function () { scheduleHide(); });
    card.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b || !current) return;
      if (b.dataset.act === 'view') openPanel(current); else addFacet(current);
      hideNow();
    });
    return card;
  }
  function place(info) {
    var c = ensureCard(), r = info.anchor.getBoundingClientRect(), w = c.offsetWidth, h = c.offsetHeight;
    var x = r.left + r.width / 2 - w / 2, y;
    if (info.place === 'centre') y = r.top + r.height / 2 - h / 2; else y = r.top - h - 10;
    if (y < 8) y = r.bottom + 10;
    x = Math.max(8, Math.min(x, innerWidth - w - 8)); y = Math.max(8, Math.min(y, innerHeight - h - 8));
    c.style.left = Math.round(x) + 'px'; c.style.top = Math.round(y) + 'px';
  }
  function show(info) {
    var c = ensureCard(); current = info; clearTimeout(hideT);
    c.querySelector('.l2-chartcard__t').textContent = info.title; c.querySelector('.l2-chartcard__n').textContent = info.sub;
    c.querySelector('.l2-chartcard__n').hidden = !info.sub;
    if (window.applyTablerIcons) window.applyTablerIcons(c);
    c.classList.add('show'); place(info);
    document.querySelectorAll('.l2-chart-hot').forEach(function (x) { x.classList.remove('l2-chart-hot'); });
    (info.anchor.closest('.histo__col, .treemap__cell, .top-stakeholders-chart__bar') || info.anchor).classList.add('l2-chart-hot');
  }
  function hideNow() { clearTimeout(hideT); if (card) card.classList.remove('show'); document.querySelectorAll('.l2-chart-hot').forEach(function (x) { x.classList.remove('l2-chart-hot'); }); }
  function scheduleHide() { clearTimeout(hideT); hideT = setTimeout(hideNow, 160); }
  document.addEventListener('mouseover', function (e) {
    if (card && card.contains(e.target)) return;
    if (document.querySelector('.ob-tour')) { hideNow(); return; } /* the onboarding guide has the floor */
    var info = infoFor(e.target);
    if (info) { if (!current || current.kind !== info.kind || current.key !== info.key || !card.classList.contains('show')) show(info); else clearTimeout(hideT); }
    else if (card && card.classList.contains('show')) scheduleHide();
  });
  document.addEventListener('scroll', hideNow, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideNow(); });

  /* ---- View: matching items in a side panel ---- */
  var panel = null;
  function openPanel(info) {
    closePanel();
    panel = el('div', 'np l2-viewpanel l2-wrap'); /* l2-wrap so the cloned cards pick up the theme rules */
    panel.innerHTML = '<div class="np__scrim"></div><aside class="np__panel" role="dialog" aria-modal="true" aria-labelledby="vpTitle">' +
      '<header class="np__head"><h2 id="vpTitle"><i class="far ' + ICON[info.kind] + ' fa-fw"></i><span class="l2-viewpanel__name">' + esc(info.title) + '</span><span class="l2-viewpanel__sub">' + esc(info.sub) + '</span></h2><button type="button" class="np__close" aria-label="Close">&#215;</button></header>' +
      '<div class="np__body l2-viewpanel__body"></div>' +
      '<footer class="np__foot"><button type="button" class="btn btn-white np__cancel">Close</button><button type="button" class="btn btn-primary" data-act="filter"><i class="far fa-magnifying-glass-plus mr-2"></i>Add to Filters</button></footer></aside>';
    var body = panel.querySelector('.np__body');
    matching(info).forEach(function (c) { var k = c.cloneNode(true); k.classList.remove('d-none'); k.querySelectorAll('.hover-controls, .l2-cardacts').forEach(function (x) { x.remove(); }); body.appendChild(k); });
    document.body.appendChild(panel);
    if (window.applyTablerIcons) window.applyTablerIcons(panel);
    void panel.offsetWidth; requestAnimationFrame(function () { panel.classList.add('show'); });
    panel.querySelector('.np__close').onclick = closePanel; panel.querySelector('.np__cancel').onclick = closePanel; panel.querySelector('.np__scrim').onclick = closePanel;
    panel.querySelector('[data-act="filter"]').onclick = function () { addFacet(info); closePanel(); };
    document.addEventListener('keydown', panelKey);
    setTimeout(function () { var b = panel && panel.querySelector('.np__close'); if (b) b.focus(); }, 250);
  }
  function panelKey(e) { if (e.key === 'Escape') closePanel(); }
  function closePanel() { if (!panel) return; var p = panel; panel = null; p.classList.remove('show'); document.removeEventListener('keydown', panelKey); setTimeout(function () { p.remove(); }, 260); }

  /* ---- Add to Filters: the selection goes into the Filters window (parties or stakeholders) or the time frame chip. The list narrows and the Filters chip shows it is active. ---- */
  var facets = {}, sample = null;
  var CODE = {}; Object.keys(PARTY).forEach(function (k) { CODE[PARTY[k]] = k; });
  function matchFacet(card, f) { return f.keys.some(function (key) { return matches(card, { kind: f.kind, key: key, gran: f.gran }); }); }
  function matchAll(c) { return Object.keys(facets).every(function (k) { return matchFacet(c, facets[k]); }); }
  window.l2FacetMatch = function (c) { return sample ? sample.indexOf(c) !== -1 : matchAll(c); };
  function hasParties() { return !!document.getElementById('parties') && !!(window.l2Select && window.l2Select.parties); }
  function refreshFilterChip() {
    /* Search: the Filters chip count comes from the window's own Show Results; feeds: mark the chip active with a count */
    if (!isFeed) { var b = document.querySelector('.js-show-results'); if (b) b.click(); return; }
    var chip = document.querySelector('.l2-fchip--filters'); if (!chip) return;
    var n = (window.l2Select && window.l2Select.stakeholders) ? window.l2Select.stakeholders.chosen().length : 0;
    chip.classList.toggle('active', n > 0);
    var badge = chip.querySelector('.n'); if (!badge && n) { badge = el('span', 'badge text-secondary bg-secondary-soft badge-pill n'); chip.querySelector('.filter-button, .l2-fbtn').appendChild(badge); }
    if (badge) badge.textContent = n ? String(n) : '';
  }
  function isoDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dateSpan(f) {
    if (f.gran === 'year') return [new Date(+f.key, 0, 1), new Date(+f.key, 11, 31)];
    if (f.gran === 'month') { var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(f.key); return [new Date(2026, m, 1), new Date(2026, m + 1, 0)]; }
    var s = new Date(f.key + ', 2026'), e = new Date(s); e.setDate(s.getDate() + (f.gran === 'day' ? 0 : 6)); return [s, e];
  }
  function dateTitle(f) { return f.gran === 'week' ? 'Week of ' + f.key : (f.gran === 'month' ? f.key + ' 2026' : f.key); }
  function addFacet(info) {
    var f = { kind: info.kind, keys: [info.key], title: info.title, gran: info.gran, value: info.value };
    if (info.kind === 'date') {
      facets.date = f;
      if (isFeed) { if (window.feSetDate) window.feSetDate(dateTitle(f)); }
      else {
        var chip = document.getElementById('l2DateChip'), ins = chip ? chip.querySelectorAll('input[type=date]') : [];
        if (ins.length === 2) { var sp = dateSpan(f); ins[0].value = isoDate(sp[0]); ins[1].value = isoDate(sp[1]); ins[1].dispatchEvent(new Event('change', { bubbles: true })); var lbl = chip.querySelector('.val > span'); if (lbl) lbl.textContent = dateTitle(f); }
      }
      apply(); return;
    }
    var group = (info.kind === 'party' && hasParties()) ? 'parties' : 'stakeholders';
    var name = info.kind === 'party' ? (PARTY[info.key] || info.key) : info.key;
    if (window.l2Select && window.l2Select[group]) window.l2Select[group].pick(name);
    var sec = document.getElementById(group); if (sec) { sec.classList.add('show'); var hb = document.querySelector('#' + group + '-header button'); if (hb) { hb.classList.remove('collapsed'); hb.setAttribute('aria-expanded', 'true'); } }
    syncFromSelects(); refreshFilterChip(); apply();
  }
  /* rebuild the party and stakeholder facets from what is ticked in the Filters window */
  function syncFromSelects() {
    var parties = (window.l2Select && window.l2Select.parties) ? window.l2Select.parties.chosen() : [];
    var stakes = (window.l2Select && window.l2Select.stakeholders) ? window.l2Select.stakeholders.chosen() : [];
    var pc = [], sn = [];
    parties.concat(stakes).forEach(function (n) { if (CODE[n]) pc.push(CODE[n]); else if (stakes.indexOf(n) !== -1) sn.push(n); });
    if (pc.length) facets.party = { kind: 'party', keys: pc, title: pc.join(', '), value: (facets.party && facets.party.value) || 0 }; else delete facets.party;
    if (sn.length) facets.stakeholder = { kind: 'stakeholder', keys: sn, title: sn.join(', '), value: (facets.stakeholder && facets.stakeholder.value) || 0 }; else delete facets.stakeholder;
  }
  document.addEventListener('l2-select', function () { syncFromSelects(); if (isFeed) refreshFilterChip(); apply(); });
  window.l2FacetCount = function () { return Object.keys(facets).length; };
  window.l2RemoveFacet = function (kind) { if (facets[kind]) { delete facets[kind]; apply(); } };
  window.l2ClearFacets = function () {
    facets = {};
    if (window.l2Select) Object.keys(window.l2Select).forEach(function (k) { window.l2Select[k].clear(); });
    refreshFilterChip(); apply();
  };
  function apply() {
    var any = Object.keys(facets).length > 0;
    /* prototype data is thin: when nothing matches every filter, keep a small sample visible rather than an empty page */
    sample = null; if (any && !allCards().some(matchAll)) sample = allCards().slice(0, 5);
    if (isFeed) { if (window.feApplyTimeline) window.feApplyTimeline(); }
    else {
      if (window.l2ApplySources) window.l2ApplySources();
      else allCards().forEach(function (c) { c.classList.toggle('d-none', !window.l2FacetMatch(c)); });
      var rc = document.getElementById('results-count');
      if (rc && any) { var v = Math.min.apply(null, Object.keys(facets).map(function (k) { return facets[k].value || Infinity; })); if (isFinite(v)) rc.textContent = fmt(v) + ' results'; }
    }
    window.dispatchEvent(new Event('l2-facets'));
  }
  /* keep the narrowed count when the search re-estimates after a filter change */
  if (!isFeed && window.l2Recount) { var orig = window.l2Recount; window.l2Recount = function () { orig(); if (Object.keys(facets).length) { var rc = document.getElementById('results-count'); var v = Math.min.apply(null, Object.keys(facets).map(function (k) { return facets[k].value || Infinity; })); if (rc && isFinite(v)) rc.textContent = fmt(v) + ' results'; } }; }
})();
