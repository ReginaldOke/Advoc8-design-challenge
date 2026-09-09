/* Feed pages (redesign): keywords and filters are editable chips on every feed. The header description reads from the chips so the two never disagree. New feeds saved from Search arrive with their search carried over. */
(function () {
  var page = (location.pathname.match(/([^/]*)\.html$/) || [0, ''])[1];
  var isNew = /[?&]new=1/.test(location.search);
  var DEFAULTS = {
    'feed2': { name: 'Solar panels', topic: 'Environment', terms: [{ text: 'solar panels', neg: false }, { text: 'rooftop solar', neg: false }, { text: 'home batteries', neg: false }], match: 'any', date: 'Last 6 months', stakeholders: ['Anthony Albanese', 'Pauline Hanson', 'Chris Minns', 'Bob Katter'] },
    'feed-datacenters2': { name: 'data centers', terms: [{ text: 'data centres', neg: false }, { text: 'AI', neg: false }], match: 'any', date: 'Last 6 months' },
    'feed-agriculture2': { name: 'Agriculture', topic: 'Agriculture', terms: [{ text: 'drought', neg: false }, { text: 'biosecurity', neg: false }], match: 'any', date: 'Last 6 months' }
  };
  var KEY = isNew ? 'advoc8-draft-feed' : 'advoc8-feed-v2-' + page; /* v2: earlier saved terms are left behind */
  var s = null; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!s && !isNew && DEFAULTS[page]) s = JSON.parse(JSON.stringify(DEFAULTS[page]));
  if (!s) return;
  var SRC = [['media', 'Media Releases', 'fa-newspaper'], ['parliament', 'Parliament', 'fa-landmark-flag'], ['social', 'Social Media', 'fa-hashtag'], ['other', 'Other', 'fa-file-lines']];
  var DATES = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Last 6 months', 'Last 12 months', 'All Time'];
  s.terms = s.terms || []; s.match = s.match || 'any'; s.date = s.date || 'Last 6 months'; s.name = s.name || 'New feed';
  if (!s.sources || !s.sources.length) s.sources = SRC.map(function (x) { return { v: x[0], label: x[1], on: true }; });
  /* the feed's own search, kept so any narrowing in the search bar can be undone */
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function snap() { return { terms: clone(s.terms), sources: s.sources.map(function (x) { return !!x.on; }), date: s.date }; }
  /* the feed as it is when the page opens is the baseline: Reset and Save changes only appear after an edit here */
  s.saved = snap();
  if (false) s.saved = (!isNew && DEFAULTS[page]) ? { terms: clone(DEFAULTS[page].terms), sources: SRC.map(function () { return true; }), date: DEFAULTS[page].date || 'Last 6 months' } : snap();
  function termsDirty() { return JSON.stringify(s.terms) !== JSON.stringify(s.saved.terms); }
  function dirty() { var sv = { terms: s.saved.terms, sources: s.saved.sources, date: s.saved.date }; return JSON.stringify(snap()) !== JSON.stringify(sv) || (window.l2FacetCount ? window.l2FacetCount() : 0) !== (s.saved.facets || 0); }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function srcOn() { return s.sources.filter(function (x) { return x.on; }); }
  function srcLabel(v) { var m = SRC.filter(function (x) { return x[0] === v; })[0]; return m ? m[1] : v; }
  function humanTerms() {
    var pos = s.terms.filter(function (t) { return !t.neg; }).map(function (t) { return t.text; }), neg = s.terms.filter(function (t) { return t.neg; }).map(function (t) { return t.text; });
    if (!pos.length && !neg.length) return s.topic ? 'Everything in this topic, no keyword filter' : 'No keywords yet';
    var out = 'Mentions of ' + pos.join(s.match === 'any' ? ', ' : ' and ');
    if (neg.length) out += (pos.length ? ', ' : '') + 'not ' + neg.join(' or ');
    return out;
  }

  /* ---- header: name, keywords, sources and time frame ---- */
  if (isNew) { var h1 = document.querySelector('.header-title'); if (h1) h1.textContent = s.name; var pre = document.querySelector('.header-pretitle'); if (pre) pre.textContent = ''; }
  var st = document.querySelector('.header-subtitle');
  function line(ic, id) { return '<div class="d-flex align-items-baseline flex-gap-2"><div class="flex-0"><i class="' + ic + ' fa-fw mx-2"></i></div><div class="flex-1" id="' + id + '"></div></div>'; }
  if (st) { var notif = st.lastElementChild; st.innerHTML = (s.topic ? line('far fa-message-lines', 'feTopic') : '') + line('fas fa-quote-left', 'feMentions') + line('far fa-layer-group', 'feSources') + line('far fa-calendar', 'feDate'); if (notif) st.appendChild(notif); }
  function syncHeader() {
    var m = document.getElementById('feMentions'), so = document.getElementById('feSources'), d = document.getElementById('feDate');
    var tl = document.getElementById('feTopic'); if (tl) tl.textContent = 'Topic: ' + s.topic;
    if (m) m.textContent = humanTerms();
    if (so) so.textContent = srcOn().length === s.sources.length ? 'All sources' : (srcOn().length ? srcOn().map(function (x) { return srcLabel(x.v); }).join(', ') : 'No sources selected');
    if (d) d.textContent = s.date;
  }

  /* ---- editable filter row in place of the feed toolbar ---- */
  var tb = document.querySelector('.l2-toolbar'); if (!tb) return;
  var row = el('div', 'l2-searchrow l2-feedrow');
  row.innerHTML =
    '<div class="l2-search" id="feSearch"><i class="far fa-search mag"></i><span class="l2-chips" id="feChips" style="display:contents"></span><input type="search" id="feInput" autocomplete="off" aria-label="Search within feed"></div>' +
    '<div class="l2-fchip" id="feSrc" data-default="All sources"><button type="button" class="l2-fbtn" aria-haspopup="true" aria-expanded="false"><i class="far fa-layer-group"></i><span class="val" data-ghost="Media Releases"><span>All sources</span></span><span class="badge text-secondary bg-secondary-soft badge-pill n" id="feSrcTotal"></span><i class="fas fa-chevron-down caret"></i></button><button type="button" class="clear" aria-label="Select all sources">&#215;</button><div class="l2-pop" role="menu" style="min-width:300px">' +
      SRC.map(function (x) { return '<label class="opt"><input type="checkbox" value="' + x[0] + '"><i class="far ' + x[2] + '"></i>' + x[1] + '<span class="n" data-k="' + x[0] + '"></span></label>'; }).join('') + '</div></div>' +
    '<div class="l2-fchip" id="feDateChip" data-default="Last 6 months"><button type="button" class="l2-fbtn" aria-haspopup="true" aria-expanded="false"><i class="far fa-calendar"></i><span class="val" data-ghost="Last 12 months"><span></span></span><span class="badge text-secondary bg-secondary-soft badge-pill n" id="feDateCount"></span><i class="fas fa-chevron-down caret"></i></button><button type="button" class="clear" aria-label="Reset time frame">&#215;</button><div class="l2-pop" role="menu">' +
      DATES.map(function (d) { return '<button type="button" class="opt" data-v="' + d + '">' + d + '</button>'; }).join('') + '</div></div>' +
    '<div class="l2-fchip l2-sort l2-iconbtn" id="feSort" data-tooltip="Sort: Most recent"><button type="button" class="l2-fbtn" aria-haspopup="true" aria-expanded="false" aria-label="Sort"><i class="far fa-arrow-up-arrow-down"></i></button><div class="l2-pop right" role="menu" style="min-width:190px"><button type="button" class="opt" data-v="Relevance">Relevance</button><button type="button" class="opt selected" data-v="Most recent">Most recent</button></div></div>' +
    '';
  /* the Filters chip (and its modal) comes across from the old toolbar so it sits beside the search bar like on Search */
  var oldFilters = tb.querySelector('.l2-fchip'); if (oldFilters && oldFilters.querySelector('.filter-button')) { oldFilters.classList.add('l2-fchip--filters'); row.insertBefore(oldFilters, row.querySelector('#feSrc')); }
  tb.parentNode.insertBefore(row, tb); tb.classList.add('l2-hidden');
  var chipsEl = row.querySelector('#feChips'), input = row.querySelector('#feInput'), srcChip = row.querySelector('#feSrc'), dateChip = row.querySelector('#feDateChip'), status = null, sortChip = row.querySelector('#feSort');
  var COUNTS = {}; (function () { var lis = tb.querySelectorAll('.filter-pills > li'); var keys = ['media', 'parliament', 'social', 'other']; lis.forEach(function (li, i) { var b = li.querySelector('.badge'); COUNTS[keys[i]] = b ? parseInt(b.textContent.replace(/[^\d]/g, ''), 10) || 0 : 0; }); if (COUNTS.other === undefined) COUNTS.other = 0; })();
  function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K' : String(n); }
  function syncCounts() { var total = 0; s.sources.forEach(function (x) { if (x.on) total += COUNTS[x.v] || 0; }); srcChip.querySelector('#feSrcTotal').textContent = fmt(total); srcChip.querySelectorAll('.n[data-k]').forEach(function (n) { n.textContent = fmt(COUNTS[n.dataset.k] || 0); }); dateChip.querySelector('#feDateCount').textContent = fmt(total); }

  var flashT;
  function applyTimeline() {
    var cards = document.querySelectorAll('#timeline-cards [data-card-type]'); if (!cards.length) return;
    var on = {}; s.sources.forEach(function (x) { on[x.v] = x.on; });
    var pos = s.terms.filter(function (t) { return !t.neg; }).map(function (t) { return t.text.toLowerCase(); }), neg = s.terms.filter(function (t) { return t.neg; }).map(function (t) { return t.text.toLowerCase(); });
    var shown = 0;
    cards.forEach(function (c) {
      var txt = c.textContent.toLowerCase(), ok = on[c.getAttribute('data-card-type')] !== false;
      if (ok && pos.length) ok = pos.some(function (w) { return txt.indexOf(w) !== -1; });
      if (ok && neg.length) ok = !neg.some(function (w) { return txt.indexOf(w) !== -1; });
      if (ok && window.l2FacetMatch) ok = window.l2FacetMatch(c);
      c.classList.toggle('d-none', !ok); if (ok) shown++;
    });
    if (!shown) cards.forEach(function (c) { var ok = on[c.getAttribute('data-card-type')] !== false; c.classList.toggle('d-none', !ok); }); /* nothing matched the words: keep the feed readable */
    /* a feed saved from Search shows the same number of items as the search did (when that number is 100 or fewer) */
    if (s.count && s.count <= 100) { var seen = 0; cards.forEach(function (c) { if (c.classList.contains('d-none')) return; seen++; if (seen > s.count) c.classList.add('d-none'); }); }
    document.querySelectorAll('#timeline-cards [data-divider]').forEach(function (d) { var n = d.nextElementSibling, any = false; while (n && !n.hasAttribute('data-divider')) { if (!n.classList.contains('d-none')) { any = true; break; } n = n.nextElementSibling; } d.classList.toggle('d-none', !any); });
  }
  window.feApplyTimeline = function () { applyTimeline(); };
  window.feTerms = function () { var l = s.terms.filter(function (t) { return !t.neg; }).map(function (t) { return t.text; }); return l.length ? l : (s.topic ? [s.topic] : []); };
  function save() {
    localStorage.setItem(KEY, JSON.stringify(s)); syncHeader(); applyTimeline();

  }
  var pill = row.querySelector('#feSearch');
  /* Reset feed sits with the header buttons and appears once the search or any filter differs from the saved feed */
  var reset = el('a', 'btn btn-white fe-reset fe-iconbtn', '<i class="far fa-arrow-rotate-left fa-fw"></i>'); reset.href = '#'; reset.hidden = true; reset.setAttribute('aria-label', 'Reset feed'); reset.setAttribute('data-tooltip', 'Reset feed');
  var saveBtn = el('a', 'btn btn-primary fe-save', 'Save changes'); saveBtn.href = '#'; saveBtn.hidden = true;
  (function () { var acts = document.querySelector('.header .col-auto .d-flex'); if (acts) { acts.insertBefore(saveBtn, acts.firstChild); acts.insertBefore(reset, acts.firstChild); } })();
  function syncReset() { var d = dirty(); reset.hidden = !d; saveBtn.hidden = !d; }
  saveBtn.onclick = function (e) { e.preventDefault(); s.savedByUser = true; s.saved = snap(); s.saved.facets = window.l2FacetCount ? window.l2FacetCount() : 0; save(); renderChips(); syncReset(); input.blur(); setQuiet(true);  toast('Changes to feed saved'); };
  window.addEventListener('l2-facets', syncReset);
  /* if the chips need more than one line, the bar takes the whole row and the filter chips drop underneath */
  function fit() {
    pill.classList.remove('is-wide'); row.classList.remove('is-wide'); pill.style.flexBasis = '';
    if (pill.classList.contains('is-quiet')) return;
    /* one line while the terms fit beside the field; the bar widens to the full row once they don't */
    var overflow = pill.scrollWidth > pill.clientWidth + 1 || input.offsetWidth < 100;
    if (overflow) { var w = row.clientWidth; pill.classList.add('is-wide'); row.classList.add('is-wide'); pill.style.flexBasis = w + 'px'; }
  }
  function setQuiet(q) { pill.classList.toggle('is-quiet', q); input.placeholder = q ? 'Search within feed' : ((s.terms.length || s.topic) ? 'Add another term…' : 'Add a term…'); fit(); }
  window.addEventListener('resize', fit);
  function renderChips() {
    chipsEl.innerHTML = '';
    if (s.topic) chipsEl.appendChild(el('span', 'l2-chip l2-chip--topic', '<i class="far fa-message-lines"></i>' + esc(s.topic)));
    s.terms.forEach(function (t, i) {
      if (i > 0 || t.neg || s.topic) chipsEl.appendChild(el('span', 'l2-joiner' + (t.neg ? ' l2-joiner--not' : ''), t.neg ? 'not' : (i === 0 && s.topic ? 'and' : (s.match === 'any' ? 'or' : 'and'))));
      var c = el('span', 'l2-chip', esc(t.text) + '<button type="button" class="x" aria-label="Remove ' + esc(t.text) + '">&#215;</button>');
      c.querySelector('.x').onclick = function () { s.terms.splice(i, 1); renderChips(); save(); input.focus(); };
      chipsEl.appendChild(c);
    });
    var d = termsDirty(); pill.classList.toggle('is-dirty', d); syncReset();
    setQuiet(pill.classList.contains('is-quiet') && !d);
  }
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); var v = input.value.trim(); if (v) { s.terms.push({ text: v, neg: false }); input.value = ''; renderChips(); save(); } }
    else if (e.key === 'Backspace' && !input.value && s.terms.length) { s.terms.pop(); renderChips(); save(); }
    else if (e.key === 'Escape') { input.value = ''; input.blur(); }
  });
  pill.addEventListener('click', function (e) { if (!e.target.closest('.x')) input.focus(); });
  reset.onclick = function (e) {
    e.preventDefault();
    s.terms = clone(s.saved.terms); s.sources.forEach(function (x, i) { x.on = s.saved.sources[i] !== false; }); s.date = s.saved.date;
    if (window.l2ClearFacets) window.l2ClearFacets();
    input.value = ''; renderChips(); syncSrc(); syncDate(); save();
    /* keep the bar open so the original terms stay in view, with the caret ready */
    setQuiet(false); input.focus({ preventScroll: true });
  };
  /* the bar reads "Search within feed" until you click in. Then the feed's own terms appear as chips so you can drop one or add another. It settles back once you leave, unless you changed the search, in which case the chips stay and Reset takes you back. */
  input.addEventListener('focus', function () { setQuiet(false); });
  input.addEventListener('blur', function () { setTimeout(function () { if (!input.value.trim() && !pill.contains(document.activeElement) && !termsDirty()) setQuiet(true); }, 120); });
  setQuiet(!termsDirty()); /* a new feed lands with the quiet search too */

  /* chips: open/close */
  function closeAll(except) { row.querySelectorAll('.l2-fchip.open').forEach(function (c) { if (c !== except && !c.classList.contains('l2-fchip--group')) { c.classList.remove('open'); c.querySelector('.l2-fbtn').setAttribute('aria-expanded', 'false'); } }); }
  [srcChip, dateChip, sortChip].forEach(function (c) {
    c.querySelector('.l2-fbtn').onclick = function () { var o = c.classList.toggle('open'); closeAll(c); this.setAttribute('aria-expanded', o); };
  });
  document.addEventListener('mousedown', function (e) { if (!e.target.closest('.l2-fchip')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  /* sources */
  function syncSrc() {
    syncReset();
    var on = srcOn(), lab = srcChip.querySelector('.val > span');
    srcChip.querySelectorAll('input').forEach(function (i) { i.checked = !!s.sources.filter(function (x) { return x.v === i.value; })[0].on; });
    lab.textContent = on.length === s.sources.length ? 'All sources' : (on.length === 1 ? srcLabel(on[0].v) : on.length + ' sources');
    srcChip.classList.toggle('active', on.length !== s.sources.length);
    syncCounts();
  }
  srcChip.addEventListener('change', function (e) { var x = s.sources.filter(function (y) { return y.v === e.target.value; })[0]; if (x) { x.on = e.target.checked; syncSrc(); save(); } });
  srcChip.querySelector('.clear').onclick = function (e) { e.stopPropagation(); s.sources.forEach(function (x) { x.on = true; }); syncSrc(); save(); };

  /* time frame */
  function syncDate() {
    syncReset();
    dateChip.querySelector('.val > span').textContent = s.date;
    dateChip.querySelectorAll('.opt').forEach(function (o) { o.classList.toggle('selected', o.dataset.v === s.date); });
    dateChip.classList.toggle('active', s.date !== 'Last 6 months');
  }
  dateChip.querySelectorAll('.opt').forEach(function (o) { o.onclick = function () { s.date = o.dataset.v; syncDate(); save(); closeAll(); }; });
  dateChip.querySelector('.clear').onclick = function (e) { e.stopPropagation(); s.date = 'Last 6 months'; syncDate(); save(); if (window.l2RemoveFacet) window.l2RemoveFacet('date'); };
  window.feSetDate = function (label) { s.date = label; syncDate(); save(); };

  function sortIcon(v) { var i = sortChip.querySelector('.l2-fbtn i'); if (!i) return; var n = document.createElement('i'); n.className = 'far ' + (/recent/i.test(v) ? 'fa-arrow-down' : 'fa-arrow-up-arrow-down'); i.replaceWith(n); }
  sortIcon('Most recent');
  sortChip.querySelectorAll('.opt').forEach(function (o) { o.onclick = function () { sortChip.querySelectorAll('.opt').forEach(function (x) { x.classList.toggle('selected', x === o); }); sortChip.setAttribute('data-tooltip', 'Sort: ' + o.dataset.v); sortIcon(o.dataset.v); sortChip.classList.toggle('active', o.dataset.v !== 'Most recent'); var list = document.getElementById('timeline-cards'); if (list) { var cards = [].slice.call(list.children); cards.reverse().forEach(function (c) { list.appendChild(c); }); } closeAll(); }; });
  renderChips(); syncSrc(); syncDate(); syncHeader();
  window.addEventListener('load', function () { setTimeout(applyTimeline, 50); });

  /* side panel: show the new feed as the active item instead of Solar panels */
  function markNav() {
    var items = [].slice.call(document.querySelectorAll('.l2nav__subitem')).filter(function (a) { return /^feed2\.html/.test(a.getAttribute('href') || ''); });
    if (window.l2FeedsNest) { var yfl = document.querySelector('.l2nav__subitem[href="feeds2.html"]'); if (yfl) yfl.classList.add('is-open'); }
    if (items.length) {
      items.forEach(function (a) { a.classList.remove('active'); });
      var a = document.createElement('a'); a.className = 'l2nav__subitem active'; a.href = 'feed2.html?new=1'; a.innerHTML = '<span class="emoji">✨</span>' + esc(s.name);
      items[0].parentNode.insertBefore(a, items[0]);
    }
    /* the visible side panel */
    var side = [].slice.call(document.querySelectorAll('#feeds_sidebar_collapse > a.nav-link')).filter(function (a) { return !/View all/.test(a.textContent); });
    if (side.length) {
      side.forEach(function (a) { a.classList.remove('active'); });
      var b = document.createElement('a'); b.className = 'nav-link active'; b.href = 'feed2.html?new=1'; b.innerHTML = '<span class="mx-2 flex-noshrink">✨</span><span class="text-nowrap">' + esc(s.name) + '</span>';
      side[0].parentNode.insertBefore(b, side[0]);
    }
  }
  /* arrival: nav open, the new feed pops into the list, then the notification panel slides in */
  if (isNew) window.addEventListener('load', function () {
    document.documentElement.classList.remove('panel-collapsed');
    setTimeout(function () {
      markNav();
      document.querySelectorAll('#feeds_sidebar_collapse .nav-link.active, .l2nav__subitem.active').forEach(function (a) { a.classList.add('is-new'); });
    }, 350);
  });

  /* ---- notification settings: a narrow panel on the right ---- */
  var TYPES = [['media', 'Media Releases', 'fa-newspaper'], ['parliament', 'Parliament', 'fa-landmark-flag'], ['social', 'Social Media', 'fa-hashtag'], ['other', 'Other', 'fa-file-lines']];
  var FREQ = ['Off', 'ASAP', 'Daily digest', 'Twice daily digest', 'Weekly digest'];
  var FREQ_META = { 'Off': ['fa-ban', 'Disable alerts for this content'], 'ASAP': ['fa-bolt', 'You’ll know when we know'], 'Daily digest': ['fa-clock', 'Each day at 8:00 AM'], 'Twice daily digest': ['fa-clock', '8:00 AM and 4:00 PM'], 'Weekly digest': ['fa-calendar', 'Each Monday at 8:00 AM'] };
  s.notify = s.notify || { media: 'Weekly digest', parliament: 'Weekly digest', social: 'Daily digest', other: 'Off' };
  function notifyOn() { return Object.keys(s.notify).some(function (k) { return s.notify[k] !== 'Off'; }); }
  function syncNotifyLine() { var b = document.querySelector('.header-subtitle .fa-bell-on, .header-subtitle .fa-bell-slash'); var line = b && b.closest('.d-flex'); if (!line) return; var on = notifyOn(); line.innerHTML = '<div class="flex-0"><i class="fas ' + (on ? 'fa-bell-on text-warning' : 'fa-bell-slash text-muted') + ' fa-fw mx-2"></i></div><div class="flex-1"><a class="text-reset np-open" href="#">Alerts are <span class="font-weight-bold">' + (on ? 'ON' : 'OFF') + '</span></a></div>'; line.className = 'd-flex align-items-baseline flex-gap-2'; }
  var np = null;
  s.recipients = s.recipients || ['reg.oke@example.com'];
  function openNotify(onClose) {
    if (np) return;
    var draft = JSON.parse(JSON.stringify(s.notify)), emails = s.recipients.slice(), editing = false;
    np = el('div', 'np');
    function chipFor(t) {
      var v = draft[t[0]], mt = FREQ_META[v] || FREQ_META['Off'];
      return '<div class="l2-fchip np__chip" data-k="' + t[0] + '"><button type="button" class="l2-fbtn" aria-haspopup="true" aria-expanded="false"><i class="far ' + mt[0] + ' np__chip-ico"></i><span class="val"><span>' + esc(v) + '</span></span><i class="fas fa-chevron-down caret"></i></button><div class="l2-pop right np__pop" role="menu">' +
        FREQ.map(function (f) { var m = FREQ_META[f]; return '<button type="button" class="opt np__opt' + (v === f ? ' selected' : '') + '" data-v="' + f + '"><i class="far ' + m[0] + '"></i><span class="np__opt-txt"><span class="np__opt-t">' + f + '</span><span class="np__opt-s">' + m[1] + '</span></span></button>'; }).join('') + '</div></div>';
    }
    function body() {
      return '<div class="np__who' + (editing ? ' is-editing' : '') + '">' +
          '<div class="np__who-row"><span class="avatar-title rounded-circle ob-initials">RO</span><div class="np__who-txt"><div class="np__name">Reg Oke <span>(you)</span></div><div class="np__sub">' + (editing ? 'Where to send updates' : (emails.length === 1 ? 'Sent to ' + esc(emails[0]) : 'Sent to ' + emails.length + ' addresses')) + '</div></div><button type="button" class="np__edit" aria-label="' + (editing ? 'Done editing recipients' : 'Edit recipients') + '" aria-expanded="' + editing + '"><i class="far ' + (editing ? 'fa-chevron-up' : 'fa-pen-to-square') + '"></i></button></div>' +
          (editing ? '<div class="np__emails">' + emails.map(function (m) { return '<div class="np__email"><i class="far fa-envelope fa-fw"></i><span>' + esc(m) + '</span><button type="button" class="np__email-x" data-m="' + esc(m) + '" aria-label="Remove ' + esc(m) + '"' + (emails.length === 1 ? ' disabled' : '') + '>&#215;</button></div>'; }).join('') +
            '<form class="np__addrow" novalidate><input type="email" placeholder="Add another email" aria-label="Add another email" autocomplete="off"><button type="submit" class="btn btn-white btn-sm">Add</button></form>' +
            '</div>' : '') +
        '</div>' +
        '<div class="np__rows">' + TYPES.map(function (t) { return '<div class="np__row"><i class="far ' + t[2] + ' fa-fw"></i><span class="np__rowname">' + t[1] + '</span>' + chipFor(t) + '</div>'; }).join('') + '</div>';
    }
    np.innerHTML = '<div class="np__scrim"></div><aside class="np__panel" role="dialog" aria-modal="true" aria-labelledby="npTitle">' +
      '<header class="np__head"><h2 id="npTitle">Schedule alerts</h2><div class="np__head-acts"><label class="np__switch" data-tooltip="All alerts on or off"><input type="checkbox" class="np__switch-in" aria-label="All alerts"><span class="np__track"></span><span class="np__switch-lbl">On</span></label><button type="button" class="np__close" aria-label="Close">&#215;</button></div></header>' +
      '<div class="np__body"></div>' +
      '<footer class="np__foot np__foot--one"><button type="button" class="btn btn-primary np__save">Save changes</button></footer></aside>';
    document.body.appendChild(np); document.body.classList.add('np-lock');
    var bodyEl = np.querySelector('.np__body');
    function render() {
      bodyEl.innerHTML = body();
      bodyEl.querySelector('.np__edit').onclick = function () { editing = !editing; render(); if (editing) { var i = bodyEl.querySelector('.np__addrow input'); if (i) i.focus(); } };
      bodyEl.querySelectorAll('.np__email-x').forEach(function (b) { b.onclick = function () { emails = emails.filter(function (m) { return m !== b.dataset.m; }); render(); }; });
      var form = bodyEl.querySelector('.np__addrow');
      if (form) form.addEventListener('submit', function (e) { e.preventDefault(); var i = form.querySelector('input'), v = i.value.trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { i.classList.add('is-invalid'); i.focus(); return; } if (emails.indexOf(v) === -1) emails.push(v); render(); bodyEl.querySelector('.np__addrow input').focus(); });
      bodyEl.querySelectorAll('.np__chip').forEach(function (c) {
        var btn = c.querySelector('.l2-fbtn');
        btn.onclick = function () { var o = c.classList.toggle('open'); bodyEl.querySelectorAll('.np__chip.open').forEach(function (x) { if (x !== c) x.classList.remove('open'); }); btn.setAttribute('aria-expanded', o); if (o) { var pop = c.querySelector('.l2-pop'), r = btn.getBoundingClientRect(); pop.style.position = 'fixed'; pop.style.top = Math.round(r.bottom + 6) + 'px'; pop.style.left = Math.round(r.left) + 'px'; pop.style.width = Math.round(r.width) + 'px'; pop.style.right = 'auto'; } };
        c.querySelectorAll('.opt').forEach(function (o) { o.onclick = function () { draft[c.dataset.k] = o.dataset.v; c.querySelector('.val > span').textContent = o.dataset.v; var ico = c.querySelector('.np__chip-ico'); if (ico) { ico.className = 'far ' + FREQ_META[o.dataset.v][0] + ' np__chip-ico'; delete ico.dataset.fa; ico.innerHTML = ''; } c.querySelectorAll('.opt').forEach(function (x) { x.classList.toggle('selected', x === o); }); c.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }; });
      });
    }
    /* master switch: off sets every content type to Off; on brings back what was set, or the usual defaults */
    var sw = np.querySelector('.np__switch-in'), swLbl = np.querySelector('.np__switch-lbl'), remembered = null;
    function anyOn() { return TYPES.some(function (t) { return draft[t[0]] !== 'Off'; }); }
    function syncSwitch() { var on = anyOn(); sw.checked = on; swLbl.textContent = on ? 'On' : 'Off'; np.classList.toggle('np--off', !on); }
    sw.onchange = function () {
      if (!sw.checked) { remembered = JSON.parse(JSON.stringify(draft)); TYPES.forEach(function (t) { draft[t[0]] = 'Off'; }); }
      else { var src = (remembered && TYPES.some(function (t) { return remembered[t[0]] !== 'Off'; })) ? remembered : { media: 'Weekly digest', parliament: 'Weekly digest', social: 'Daily digest', other: 'Off' }; TYPES.forEach(function (t) { draft[t[0]] = src[t[0]]; }); }
      render(); syncSwitch();
    };
    bodyEl.addEventListener('click', function (e) { if (e.target.closest('.np__opt')) setTimeout(syncSwitch, 0); });
    render(); syncSwitch();
    np.addEventListener('mousedown', function (e) { if (!e.target.closest('.np__chip')) bodyEl.querySelectorAll('.np__chip.open').forEach(function (x) { x.classList.remove('open'); }); });
    void np.offsetWidth; requestAnimationFrame(function () { np.classList.add('show'); });
    function close(saved) {
      np.classList.remove('show'); document.body.classList.remove('np-lock'); document.removeEventListener('keydown', onKey);
      var n = np; setTimeout(function () { n.remove(); }, 220); np = null;
      if (saved) { s.notify = draft; s.recipients = emails; localStorage.setItem(KEY, JSON.stringify(s)); syncNotifyLine(); note('<b>Alerts scheduled.</b> ' + (notifyOn() ? 'Updates go to ' + (emails.length === 1 ? esc(emails[0]) : emails.length + ' addresses') + '.' : 'Notifications are off for this feed.')); }
      if (onClose) onClose();
    }
    function onKey(e) { if (e.key === 'Escape') { if (bodyEl.querySelector('.np__chip.open')) bodyEl.querySelectorAll('.np__chip.open').forEach(function (x) { x.classList.remove('open'); }); else close(false); } }
    document.addEventListener('keydown', onKey);
    np.querySelector('.np__close').onclick = function () { close(false); };
    var npc = np.querySelector('.np__cancel'); if (npc) npc.onclick = function () { close(false); };
    np.querySelector('.np__scrim').onclick = function () { close(false); };
    np.querySelector('.np__save').onclick = function () { close(true); };
    setTimeout(function () { np.querySelector('.np__close').focus(); }, 250);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a.btn, .np-open'); if (!a) return;
    if (a.classList.contains('np-open') || /Notification Settings|Schedule alerts/.test(a.textContent)) { e.preventDefault(); openNotify(); }
  });
  syncNotifyLine();

  /* ---- the "..." menu: Rename edits the title here, Edit Filters opens the feed in the builder with everything filled in ---- */
  (function () {
    var menu = document.querySelector('#dropdownMenuButton + .dropdown-menu'); if (!menu) return;
    var items = [].slice.call(menu.querySelectorAll('.dropdown-item'));
    var rename = items.filter(function (a) { return /Rename/.test(a.textContent); })[0];
    if (rename && !menu.querySelector('[data-act="edit"]')) {
      var edit = document.createElement('a'); edit.className = 'dropdown-item'; edit.href = '#'; edit.setAttribute('data-act', 'edit');
      edit.innerHTML = '<i class="far fa-sliders-h fa-fw mr-2"></i> Edit Filters';
      rename.setAttribute('data-act', 'rename'); rename.insertAdjacentElement('afterend', edit);
      if (window.applyTablerIcons) window.applyTablerIcons(edit);
    }
    menu.addEventListener('click', function (e) {
      var a = e.target.closest('.dropdown-item'); if (!a) return;
      e.preventDefault(); menu.classList.remove('show');
      if (a.dataset.act === 'rename') setTimeout(renameTitle, 60);
      else if (a.dataset.act === 'edit') {
        var payload = { key: KEY, back: location.pathname.split('/').pop() + (isNew ? '?new=1' : ''), name: s.name, topic: s.topic, terms: s.terms, sources: s.sources, date: s.date, stakeholders: s.stakeholders || (DEFAULTS[page] || {}).stakeholders || [] };
        try { localStorage.setItem('advoc8-edit-feed', JSON.stringify(payload)); } catch (err) {}
        location.href = 'build2.html?edit=' + encodeURIComponent(isNew ? 'new' : page);
      }
    });
  })();

  /* ---- rename in place: the title becomes editable, ready to type over ---- */
  function renameTitle() {
    var h1 = document.querySelector('.header-title'); if (!h1) return;
    var emoji = h1.querySelector('.feed-emoji'), original = s.name;
    var span = h1.querySelector('.fe-name'); if (!span) { span = el('span', 'fe-name', esc(s.name)); h1.textContent = ''; if (emoji) h1.appendChild(emoji); h1.appendChild(span); }
    span.contentEditable = 'true'; span.spellcheck = false; h1.classList.add('is-editing'); span.removeAttribute('data-tooltip'); var oldTip = document.querySelector('.replica-tooltip'); if (oldTip) oldTip.remove();
    var hint = el('span', 'fe-rename-hint', ''); hint.hidden = true; h1.appendChild(hint);
    span.focus(); var r = document.createRange(); r.selectNodeContents(span); r.collapse(false); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); /* caret at the end, nothing highlighted */
    function finish(commit) {
      span.contentEditable = 'false'; h1.classList.remove('is-editing'); hint.remove(); span.setAttribute('data-tooltip', 'Rename'); span.removeEventListener('keydown', keys); span.removeEventListener('blur', onBlur);
      var v = span.textContent.replace(/\s+/g, ' ').trim();
      if (!commit || !v) { span.textContent = original; return; }
      s.name = v; span.textContent = v; localStorage.setItem(KEY, JSON.stringify(s)); document.title = v + ' (Layout 2)';
      document.querySelectorAll('#feeds_sidebar_collapse .nav-link.active .text-nowrap').forEach(function (n) { n.textContent = v; });
      var hidden = document.querySelector('.l2nav__subitem.active'); if (hidden) { var dot = hidden.querySelector('.dot, .emoji'); hidden.textContent = v; if (dot) hidden.insertBefore(dot, hidden.firstChild); }
      note('<b>Renamed.</b> This feed is now called ' + esc(v) + '.');
    }
    function keys(e) { if (e.key === 'Enter') { e.preventDefault(); finish(true); } else if (e.key === 'Escape') { e.preventDefault(); finish(false); } }
    function onBlur() { finish(true); }
    span.addEventListener('keydown', keys); span.addEventListener('blur', onBlur);
  }
  document.addEventListener('click', function (e) { var a = e.target.closest('.dropdown-item'); if (a && /Rename/.test(a.textContent)) { e.preventDefault(); renameTitle(); } });
  /* the title is always editable: wrap it once, show a pencil on hover, click to rename */
  (function () {
    var h1 = document.querySelector('.header-title'); if (!h1) return;
    var emoji = h1.querySelector('.feed-emoji');
    if (!h1.querySelector('.fe-name')) { var span = el('span', 'fe-name', esc(s.name)); h1.textContent = ''; if (emoji) h1.appendChild(emoji); h1.appendChild(span); }
    h1.classList.add('fe-editable');
    h1.addEventListener('click', function (e) { if (h1.classList.contains('is-editing')) return; if (e.target.closest('.fe-name, .fe-name-edit')) { e.preventDefault(); renameTitle(); } });
    var nm = h1.querySelector('.fe-name'); nm.setAttribute('tabindex', '0'); nm.setAttribute('role', 'button'); nm.setAttribute('aria-label', 'Feed name, click to rename'); nm.setAttribute('data-tooltip', 'Rename');
    nm.addEventListener('keydown', function (e) { if (!h1.classList.contains('is-editing') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); renameTitle(); } });
  })();

  function note(html) { return; /* no toasts: the page itself shows the change */ }
  /* the one toast: confirming a save */
  function toast(text) { noteOld(esc(text)); }
  try { if (localStorage.getItem('advoc8-feed-saved-toast') === '1') { localStorage.removeItem('advoc8-feed-saved-toast'); setTimeout(function () { toast('Changes to feed saved'); }, 400); } } catch (err) {}
  function noteOld(html) {
    var t = el('div', 'fe-toast', '<i class="far fa-circle-check"></i><div>' + html + '</div><button type="button" class="fe-toast__x" aria-label="Dismiss">&#215;</button>');
    document.body.appendChild(t); t.querySelector('.fe-toast__x').onclick = function () { t.remove(); };
    setTimeout(function () { t.classList.add('show'); }, 30); setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 300); }, 5000);
  }

  /* then the notification panel, once the new feed has settled into the list */
  if (!isNew) return;
  window.addEventListener('load', function () { setTimeout(function () { openNotify(function () { setTimeout(renameTitle, 150); }); }, 1250); });
})();
