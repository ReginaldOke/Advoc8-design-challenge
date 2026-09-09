/* Feed builder (redesign): the feed on the right is live. Keywords re-order it and highlight matches, jurisdiction, stakeholders and sources narrow it, and it scrolls on its own. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var host = document.getElementById('sample-results'); if (!host || !window.TIMELINE_ITEMS || !window.replicaRender) return;
  var esc = window.replicaEsc;
  var ITEMS = window.TIMELINE_ITEMS.filter(function (i) { return !i.divider; });
  function kindOf(i) { return i.type === 'social' ? 'social' : (/Parliament/.test(i.metaText || '') ? 'parliament' : 'media'); }
  function blob(i) { return [i.pre, i.title, i.text, (i.bullets || []).join(' '), (i.badges || []).join(' '), (i.authors || []).map(function (a) { return a.name + ' ' + (a.role || ''); }).join(' ')].join(' ').toLowerCase(); }
  var META = ITEMS.map(function (i) { return { item: i, kind: kindOf(i), juris: (i.authors && i.authors[0] && i.authors[0].juris) || 'Federal', names: (i.authors || []).map(function (a) { return a.name; }), blob: blob(i), title: (i.title || '').toLowerCase(), badges: (i.badges || []).join(' ').toLowerCase() }; });
  var SRC = [['media', 'Media Releases', 'fa-newspaper'], ['parliament', 'Parliament', 'fa-landmark-flag'], ['social', 'Social Media', 'fa-hashtag']];
  var sources = { media: true, parliament: true, social: true };

  /* the panel around the list */
  var right = host.closest('.setup-right'); var wrap = document.createElement('div'); wrap.className = 'build-feed'; wrap.id = 'buildFeed';
  var SUBS = { parliament: [['Chamber Hansard', .6], ['Committee Documents', .3], ['Daily Programs', .1]], social: [['Facebook', .5], ['X (Twitter)', .3], ['LinkedIn', .2]] };
  var subOn = { parliament: { 'Chamber Hansard': true, 'Committee Documents': true, 'Daily Programs': true }, social: { 'Facebook': true, 'X (Twitter)': true, 'LinkedIn': true } };
  function pillFor(s) {
    var subs = SUBS[s[0]];
    return '<div class="l2-fchip build-src' + (subs ? ' build-src--sub' : '') + '" data-k="' + s[0] + '"><button type="button" class="l2-fbtn" aria-pressed="true"' + (subs ? ' aria-haspopup="true" aria-expanded="false"' : '') + '><i class="far ' + s[2] + '"></i><span class="val"><span>' + s[1] + '</span></span><span class="badge text-secondary bg-secondary-soft badge-pill n">0</span>' + (subs ? '<i class="fas fa-chevron-down caret"></i>' : '') + '</button>' +
      (subs ? '<div class="l2-pop" role="menu" style="min-width:250px">' + subs.map(function (x) { return '<label class="opt"><input type="checkbox" value="' + x[0] + '" checked>' + x[0] + '<span class="n" data-sub="' + x[0] + '"></span></label>'; }).join('') + '<div class="rule"></div><div class="pfoot"><span class="build-src__sel"></span><button type="button" class="build-src__all">Select all</button></div></div>' : '') + '</div>';
  }
  wrap.innerHTML = '<div class="build-feed__head"><div class="build-feed__title"><i class="far fa-wave-pulse"></i><span>Your feed</span><span class="l2-count" id="buildCount"></span></div><div class="build-feed__expect"><i class="far fa-wave-pulse"></i><span id="buildExpect"></span></div><div class="build-feed__pills" id="buildPills">' + SRC.map(pillFor).join('') + '</div></div><div class="build-feed__list" id="buildList"></div>';
  var old = right.firstElementChild; right.insertBefore(wrap, old); wrap.querySelector('#buildList').appendChild(host); old.remove();
  var list = wrap.querySelector('#buildList'), count = wrap.querySelector('#buildCount'), expect = wrap.querySelector('#buildExpect');

  function keywords() {
    var bool = document.getElementById('kwBoolean'), src;
    if (bool && !bool.classList.contains('d-none')) src = (document.getElementById('kwBooleanQuery').value || '').split(/\b(?:AND|OR|NOT|NEAR(?:\/\d+)?)\b|[()]/i);
    else src = [].slice.call(document.querySelectorAll('#keywordRows input')).map(function (i) { return i.value; });
    return src.map(function (s) { return s.replace(/["*]/g, '').trim().toLowerCase(); }).filter(function (s) { return s.length > 1; });
  }
  function jurisOn() { var on = {}; document.querySelectorAll('input[id^="jurisdiction_"]:checked').forEach(function (i) { var l = document.querySelector('label[for="' + i.id + '"]'); if (l) on[l.textContent.trim()] = true; }); return on; }
  function stakeholders() { return [].slice.call(document.querySelectorAll('#stakeholderRows .stakeholder-row .font-weight-bold')).map(function (e) { return e.textContent.trim(); }); }
  function score(m, kws) { var s = 0; kws.forEach(function (k) { if (m.title.indexOf(k) !== -1) s += 3; if (m.badges.indexOf(k) !== -1) s += 2; s += Math.min(m.blob.split(k).length - 1, 4); }); return s; }
  function compute() {
    var kws = keywords(), jo = jurisOn(), sh = stakeholders();
    var rows = META.filter(function (m) { return jo[m.juris]; });
    if (sh.length) rows = rows.filter(function (m) { return sh.some(function (n) { return m.names.indexOf(n) !== -1 || m.blob.indexOf(n.toLowerCase()) !== -1; }); });
    rows = rows.map(function (m, i) { return { m: m, s: kws.length ? score(m, kws) : 0, i: i }; });
    var counts = { media: 0, parliament: 0, social: 0 }; rows.forEach(function (r) { counts[r.m.kind]++; });
    rows = rows.filter(function (r) { return sources[r.m.kind]; });
    rows.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    return { rows: rows, counts: counts, kws: kws };
  }
  /* wrap keyword matches in the rendered cards */
  function highlight(root, kws) {
    var re = new RegExp('(' + kws.map(function (k) { return k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'ig');
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) { return n.parentNode.closest('button, .badge, .dropdown-menu, mark, .avatar') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
    var nodes = []; while (walker.nextNode()) if (re.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var frag = document.createDocumentFragment(); n.nodeValue.split(re).forEach(function (part, i) { if (i % 2) { var m = document.createElement('mark'); m.textContent = part; frag.appendChild(m); } else if (part) frag.appendChild(document.createTextNode(part)); });
      n.parentNode.replaceChild(frag, n);
    });
  }
  var timer;
  function update() {
    var r = compute();
    list.classList.add('is-updating');
    setTimeout(function () {
      window.replicaRender('sample-results', r.rows.map(function (x) { return x.m.item; }));
      if (!r.rows.length) host.innerHTML = '<div class="build-feed__empty"><i class="far fa-magnifying-glass"></i><p class="mb-1 font-weight-bold">Nothing matches yet</p><p class="mb-0 small">Widen the jurisdiction, remove a stakeholder or turn a source back on.</p></div>';
      if (r.kws.length) highlight(host, r.kws);
      var n = r.rows.length;
      count.innerHTML = '<b>' + n + '</b> ' + (n === 1 ? 'item' : 'items');
      var lo = Math.round(n / 8), hi = Math.max(lo + 1, Math.round(n / 3));
      expect.innerHTML = 'Expect around <b>' + lo + ' to ' + hi + '</b> results per day.';
      wrap.querySelectorAll('.build-src').forEach(function (c) {
        var k = c.dataset.k, subs = SUBS[k], frac = 1;
        if (subs) { var all = 0, on = 0; subs.forEach(function (x) { all += x[1]; if (subOn[k][x[0]]) on += x[1]; }); frac = all ? on / all : 1; }
        c.querySelector(':scope > .l2-fbtn > .n').textContent = Math.round(r.counts[k] * frac);
        c.classList.toggle('is-off', !sources[k]); c.classList.toggle('is-part', sources[k] && frac < 1);
        c.querySelector('.l2-fbtn').setAttribute('aria-pressed', sources[k]);
        if (subs) { c.querySelectorAll('.n[data-sub]').forEach(function (b) { var w = subs.filter(function (x) { return x[0] === b.dataset.sub; })[0][1]; b.textContent = Math.round(r.counts[k] * w); }); var sel = subs.filter(function (x) { return subOn[k][x[0]]; }).length; c.querySelector('.build-src__sel').textContent = sel + ' of ' + subs.length + ' selected'; }
      });
      list.classList.remove('is-updating'); list.scrollTop = 0;
    }, 120);
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(update, 140); }
  window.buildFeedUpdate = update;

  (function () {
    wrap.querySelectorAll('.build-src').forEach(function (c) {
      var k = c.dataset.k, btn = c.querySelector('.l2-fbtn');
      btn.onclick = function (e) {
        if (SUBS[k] && e.target.closest('.caret')) { var o = c.classList.toggle('open'); btn.setAttribute('aria-expanded', o); wrap.querySelectorAll('.build-src.open').forEach(function (x) { if (x !== c) x.classList.remove('open'); }); return; }
        sources[k] = !sources[k];
        if (SUBS[k] && sources[k]) { SUBS[k].forEach(function (x) { subOn[k][x[0]] = true; }); c.querySelectorAll('input').forEach(function (i) { i.checked = true; }); }
        update();
      };
      c.addEventListener('change', function (e) {
        if (e.target.type !== 'checkbox') return;
        subOn[k][e.target.value] = e.target.checked;
        sources[k] = SUBS[k].some(function (x) { return subOn[k][x[0]]; });
        update();
      });
      var all = c.querySelector('.build-src__all'); if (all) all.onclick = function () { SUBS[k].forEach(function (x) { subOn[k][x[0]] = true; }); c.querySelectorAll('input').forEach(function (i) { i.checked = true; }); sources[k] = true; update(); };
    });
    document.addEventListener('mousedown', function (e) { if (!e.target.closest('.build-src')) wrap.querySelectorAll('.build-src.open').forEach(function (x) { x.classList.remove('open'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') wrap.querySelectorAll('.build-src.open').forEach(function (x) { x.classList.remove('open'); }); });
  })();
  document.addEventListener('input', function (e) { if (e.target.closest('#keywordRows, #kwBoolean')) schedule(); });
  document.addEventListener('change', function (e) { if (/^jurisdiction_|^select_all_/.test(e.target.id || '')) schedule(); });
  document.addEventListener('click', function (e) { if (e.target.closest('.sh-x, .kw-remove, #kwToBoolean, #kwToSimple')) setTimeout(schedule, 0); });
  /* gentle page scroll: eased over about a second, instant when the user prefers reduced motion */
  function scrollParent(el) {
    var p = el.parentElement;
    while (p && p !== document.documentElement) { var cs = getComputedStyle(p); if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 2) return p; p = p.parentElement; }
    return null;
  }
  function glideTo(el, block, dur) {
    if (!el) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sp = scrollParent(el), r = el.getBoundingClientRect();
    var top = sp ? sp.getBoundingClientRect().top : 0, view = sp ? sp.clientHeight : innerHeight, cur = sp ? sp.scrollTop : window.scrollY;
    var target = block === 'end' ? cur + (r.bottom - top) - view + 24 : cur + (r.top - top) - 24;
    var max = (sp ? sp.scrollHeight : document.documentElement.scrollHeight) - view; target = Math.max(0, Math.min(target, max));
    function set(y) { if (sp) sp.scrollTop = y; else window.scrollTo(0, y); }
    if (reduce) { set(target); return; }
    var dist = target - cur, t0 = performance.now(); dur = dur || 1100;
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    (function step(now) { var p = Math.min(1, (now - t0) / dur); set(cur + dist * ease(p)); if (p < 1) requestAnimationFrame(step); })(t0);
  }
  window.l2Glide = glideTo;
  /* guided flow: after each answer the page glides to the next section */
  function section(name) { return [].slice.call(document.querySelectorAll('.setup-section')).filter(function (s) { var h = s.querySelector('h2'); return h && h.textContent.trim() === name; })[0]; }
  function glide(name, then) { var s = section(name); if (!s) return; setTimeout(function () { glideTo(s, 'start'); if (then) setTimeout(then, 1150); }, 260); }
  document.addEventListener('click', function (e) { if (!e.target.closest('.js-topic-apply')) return; glide('Keywords', function () { var inp = [].slice.call(document.querySelectorAll('#keywordRows input')).filter(function (i) { return !i.value.trim(); })[0] || document.querySelector('#keywordRows input'); if (inp) inp.focus({ preventScroll: true }); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    if (e.target.closest('#keywordRows input')) {
      e.preventDefault();
      var inputs = [].slice.call(document.querySelectorAll('#keywordRows input')), idx = inputs.indexOf(e.target), next = inputs.slice(idx + 1).filter(function (i) { return !i.value.trim(); })[0];
      if (e.target.value.trim() && next) next.focus(); /* like the search page: Enter takes you to the next term */
      else if (inputs.some(function (i) { return i.value.trim(); })) glide('Jurisdiction'); /* Enter on an empty row moves on */
    }
    else if (e.target.closest('#stakeholderRows, .setup-section') && e.target.type === 'search') { e.preventDefault(); var f = document.querySelector('.setup-footer'); if (f) setTimeout(function () { glideTo(f, 'end'); }, 220); }
  });
  var jt; document.addEventListener('change', function (e) { if (/^jurisdiction_|^select_all_/.test(e.target.id || '')) { clearTimeout(jt); jt = setTimeout(function () { glide('Stakeholders'); }, 900); } });
  window.buildLiveUpdate = schedule;
  window.buildSources = {
    get: function () { return { media: !!sources.media, parliament: !!sources.parliament, social: !!sources.social }; },
    set: function (o) { Object.keys(o).forEach(function (k) { if (!(k in sources)) return; sources[k] = !!o[k]; if (SUBS[k]) { SUBS[k].forEach(function (x) { subOn[k][x[0]] = !!o[k]; }); var c = wrap.querySelector('.build-src[data-k="' + k + '"]'); if (c) c.querySelectorAll('input').forEach(function (i) { i.checked = !!o[k]; }); } }); update(); }
  };
  /* keyword placeholders like the search page: the first empty row suggests a phrase for the chosen topic */
  function currentTopic() { var t = document.querySelector('#topicSelected .topic-pick span:last-child'); return (t && t.textContent.trim().split(' › ')[0]) || (window.l2TopicHint ? window.l2TopicHint() : null); }
  function syncKwPlaceholders() {
    var inputs = [].slice.call(document.querySelectorAll('#keywordRows input')), first = true;
    inputs.forEach(function (i) { if (i.value.trim()) { first = false; return; } i.placeholder = first ? (window.l2TryPhrase ? window.l2TryPhrase(currentTopic()) : 'Try "solar panels"') : 'Add another term…'; first = false; });
  }
  window.buildSyncPlaceholders = syncKwPlaceholders;
  document.addEventListener('input', function (e) { if (e.target.closest('#keywordRows')) setTimeout(syncKwPlaceholders, 0); });
  document.addEventListener('click', function (e) { if (e.target.closest('.js-topic-apply, .kw-remove')) setTimeout(syncKwPlaceholders, 0); });
  syncKwPlaceholders();
  /* replica.js fills the sample list on DOMContentLoaded; take over after it */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(update, 0); }); else update();
})();
