/* Sentiment (redesign): net sentiment for each search term, week by week. A smooth line per term; the area above the zero line is green, below is red. Click a term in the key to show or hide it. Sits at the bottom of the charts on Search and on every feed's Analysis tab. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var esc = window.replicaEsc || function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var isFeed = !!document.getElementById('timeline-cards');
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WEEKS = 28, START = new Date(2026, 2, 2);
  function weekLabel(i) { var d = new Date(START); d.setDate(START.getDate() + i * 7); return MONTHS[d.getMonth()] + ' ' + d.getDate(); }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rnd(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }
  /* a stable, plausible series per term: a slow swell, a faster ripple and a little noise, leaning positive or negative by term */
  function series(term) {
    var t = term.toLowerCase(), h = hash(t), base = /solar|renewab|battery|clean|health|educat/.test(t) ? 0.28 : (/gas|coal|scam|crime|tax|price|cost|debt/.test(t) ? -0.22 : ((h % 100) / 100 - 0.45) * 0.6);
    var p1 = rnd(h) * 6.28, p2 = rnd(h + 7) * 6.28, out = [];
    for (var i = 0; i < WEEKS; i++) {
      var v = base + 0.42 * Math.sin(i / 4.6 + p1) + 0.22 * Math.sin(i / 1.7 + p2) + (rnd(h + i * 13) - 0.5) * 0.18;
      out.push(Math.max(-0.92, Math.min(0.92, v)));
    }
    return out;
  }
  /* smooth path through points (monotone-ish cubic) */
  function smooth(pts) {
    if (pts.length < 2) return '';
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += 'C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ',' + p2[1].toFixed(1);
    }
    return d;
  }

  /* ---- where the card lives ---- */
  var charts = document.querySelector('#analysis-results .l2-charts') || (document.getElementById('stakeChart') && document.getElementById('stakeChart').closest('.card') && document.getElementById('stakeChart').closest('.card').parentNode);
  if (!charts) return;
  var card = document.createElement('div'); card.className = 'card card-sm sent-card';
  card.innerHTML = '<div class="card-header"><div><h4 class="card-header-title"><i class="far fa-sparkles sent-spark"></i>Sentiment</h4><div class="sent-sub">Net sentiment by week for each search term</div></div><div class="sent-key" role="group" aria-label="Search terms"></div></div><div class="card-body"><div class="sent-chart" id="sentChart"></div></div>';
  charts.appendChild(card);
  var keyEl = card.querySelector('.sent-key'), host = card.querySelector('#sentChart');
  var off = {}, tip = null, terms = [], uid = 'sent' + Math.floor(Math.random() * 1e6);

  function currentTerms() {
    var list = [];
    if (isFeed) { if (window.feTerms) list = window.feTerms(); }
    else if (window.l2SearchState) { try { list = window.l2SearchState().terms.filter(function (t) { return !t.neg; }).map(function (t) { return t.text; }); } catch (e) {} }
    list = list.map(function (t) { return String(t).replace(/^"|"$/g, '').trim(); }).filter(Boolean);
    var seen = {}; list = list.filter(function (t) { var k = t.toLowerCase(); if (seen[k]) return false; seen[k] = 1; return true; });
    return list.slice(0, 5);
  }
  function renderKey() {
    keyEl.innerHTML = terms.map(function (t, i) { return '<button type="button" class="sent-key__item c' + i + (off[t.toLowerCase()] ? ' is-off' : '') + '" aria-pressed="' + (off[t.toLowerCase()] ? 'false' : 'true') + '"><span class="sent-key__dot"></span>' + esc(t) + '</button>'; }).join('');
    keyEl.querySelectorAll('.sent-key__item').forEach(function (b, i) { b.onclick = function () { var k = terms[i].toLowerCase(); off[k] = !off[k]; renderKey(); draw(true); }; });
  }
  var lastW = 0, data = {};
  function draw(animate) {
    var W = host.clientWidth; if (!W) return; lastW = W;
    var H = W > 640 ? 240 : 210, padL = 58, padR = 14, padT = 14, padB = 28, cw = W - padL - padR, ch = H - padT - padB, zero = padT + ch / 2;
    var x = function (i) { return padL + (i / (WEEKS - 1)) * cw; }, y = function (v) { return zero - v * (ch / 2); };
    var vis = terms.filter(function (t) { return !off[t.toLowerCase()]; });
    var s = '<svg class="sent-svg' + (animate ? ' is-in' : '') + (vis.length > 1 ? ' is-multi' : '') + '" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Sentiment by week">';
    s += '<defs><linearGradient id="' + uid + '-pos" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16a34a" stop-opacity=".34"/><stop offset="1" stop-color="#16a34a" stop-opacity=".04"/></linearGradient><linearGradient id="' + uid + '-neg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dc2626" stop-opacity=".04"/><stop offset="1" stop-color="#dc2626" stop-opacity=".34"/></linearGradient>' +
      '<clipPath id="' + uid + '-above"><rect x="0" y="0" width="' + W + '" height="' + zero + '"/></clipPath><clipPath id="' + uid + '-below"><rect x="0" y="' + zero + '" width="' + W + '" height="' + (H - zero) + '"/></clipPath></defs>';
    /* grid: quarter lines faint, zero line firm */
    [1, 0.5, -0.5, -1].forEach(function (v) { s += '<line class="sent-grid" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '"/>'; });
    s += '<line class="sent-zero" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + zero + '" y2="' + zero + '"/>';
    s += '<text class="sent-ylab sent-ylab--pos" x="' + (padL - 10) + '" y="' + (y(1) + 4) + '" text-anchor="end">Positive</text><text class="sent-ylab" x="' + (padL - 10) + '" y="' + (zero + 4) + '" text-anchor="end">0</text><text class="sent-ylab sent-ylab--neg" x="' + (padL - 10) + '" y="' + (y(-1) + 4) + '" text-anchor="end">Negative</text>';
    /* x labels, every fourth week like the activity chart */
    var step = Math.max(4, Math.ceil(56 / (cw / (WEEKS - 1))));
    for (var i = 0; i < WEEKS; i += step) s += '<text class="sent-xlab" x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 ? 'start' : 'middle') + '">' + weekLabel(i) + '</text>';
    vis.forEach(function (t) {
      var idx = terms.indexOf(t), vals = data[t.toLowerCase()] || (data[t.toLowerCase()] = series(t));
      var pts = vals.map(function (v, i) { return [x(i), y(v)]; }), line = smooth(pts);
      var area = line + 'L' + x(WEEKS - 1).toFixed(1) + ',' + zero + 'L' + x(0).toFixed(1) + ',' + zero + 'Z';
      s += '<path class="sent-area" d="' + area + '" fill="url(#' + uid + '-pos)" clip-path="url(#' + uid + '-above)"/>';
      s += '<path class="sent-area" d="' + area + '" fill="url(#' + uid + '-neg)" clip-path="url(#' + uid + '-below)"/>';
      s += '<path class="sent-line c' + idx + '" d="' + line + '" data-term="' + esc(t) + '"/>';
    });
    s += '<g class="sent-hover" hidden><line class="sent-guide" y1="' + padT + '" y2="' + (H - padB) + '"/>' + vis.map(function (t) { return '<circle class="sent-dot c' + terms.indexOf(t) + '" r="4"/>'; }).join('') + '</g>';
    if (!vis.length) s += '<text class="sent-empty" x="' + (padL + cw / 2) + '" y="' + (zero - 8) + '" text-anchor="middle">' + (terms.length ? 'Choose a term in the key to show its sentiment' : 'Add a search term to see sentiment') + '</text>';
    s += '<rect class="sent-hit" x="' + padL + '" y="' + padT + '" width="' + cw + '" height="' + ch + '" fill="transparent"/></svg>';
    host.innerHTML = s;
    if (animate) host.querySelectorAll('.sent-line').forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; requestAnimationFrame(function () { p.classList.add('draw'); }); });
    wireHover(vis, x, y, padL, cw);
  }
  function wireHover(vis, x, y, padL, cw) {
    var svg = host.querySelector('svg'), g = svg.querySelector('.sent-hover'), guide = g.querySelector('.sent-guide'), dots = g.querySelectorAll('.sent-dot'), hit = svg.querySelector('.sent-hit');
    function move(e) {
      if (document.querySelector('.ob-tour')) return;
      var r = svg.getBoundingClientRect(), px = e.clientX - r.left, i = Math.round(((px - padL) / cw) * (WEEKS - 1)); i = Math.max(0, Math.min(WEEKS - 1, i));
      g.hidden = false; guide.setAttribute('x1', x(i)); guide.setAttribute('x2', x(i));
      var rows = vis.map(function (t, k) { var v = (data[t.toLowerCase()] || series(t))[i]; dots[k].setAttribute('cx', x(i)); dots[k].setAttribute('cy', y(v)); return '<div class="sent-tip__row c' + terms.indexOf(t) + '"><span class="sent-key__dot"></span><span class="sent-tip__t">' + esc(t) + '</span><b class="' + (v >= 0.02 ? 'pos' : (v <= -0.02 ? 'neg' : '')) + '">' + (v > 0 ? '+' : (v < 0 ? '−' : '')) + Math.round(Math.abs(v) * 100) + '%</b></div>'; }).join('');
      if (!tip) { tip = document.createElement('div'); tip.className = 'sent-tip'; document.body.appendChild(tip); }
      tip.innerHTML = '<div class="sent-tip__d">Week of ' + weekLabel(i) + '</div>' + rows;
      var tw = tip.offsetWidth, th = tip.offsetHeight, left = e.clientX + 14; if (left + tw > innerWidth - 8) left = e.clientX - tw - 14;
      tip.style.left = Math.round(left) + 'px'; tip.style.top = Math.round(Math.max(8, Math.min(e.clientY - th / 2, innerHeight - th - 8))) + 'px'; tip.classList.add('show');
    }
    function leave() { g.hidden = true; if (tip) tip.classList.remove('show'); }
    hit.addEventListener('mousemove', move); hit.addEventListener('mouseleave', leave);
    if (!vis.length) hit.style.pointerEvents = 'none';
  }
  function refresh(animate) {
    var next = currentTerms();
    var changed = next.join('|') !== terms.join('|');
    terms = next; renderKey(); draw(animate || changed);
  }
  if (window.ResizeObserver) new ResizeObserver(function () { if (host.clientWidth && host.clientWidth !== lastW) draw(false); }).observe(host);
  var chips = document.getElementById(isFeed ? 'feChips' : 'l2Chips');
  if (chips) new MutationObserver(function () { clearTimeout(refresh.t); refresh.t = setTimeout(function () { refresh(false); }, 120); }).observe(chips, { childList: true, subtree: true });
  document.addEventListener('scroll', function () { if (tip) tip.classList.remove('show'); }, true);
  window.addEventListener('load', function () { setTimeout(function () { refresh(true); }, 80); });
  refresh(false);
})();
