/* Feed pages: the Analysis tab shows the same charts as Search (activity over time, party breakdown, top stakeholders), scaled to the feed. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var host = document.getElementById('analysis-empty'); if (!host) return;
  var esc = window.replicaEsc || function (s) { return String(s); };
  var page = (location.pathname.match(/([^/]*)\.html$/) || [0, ''])[1];
  var SCALE = { 'feed2': 0.32, 'feed-datacenters2': 0.55, 'feed-agriculture2': 0.9 }[page] || 0.4;
  host.innerHTML = '<div id="analysis-results" class="fa-grid">' + '<div class="mx-auto l2-charts">                   <div class="card card-sm">                     <div class="card-header">                       <h4 class="card-header-title">Last 6 months</h4>                       <ul class="nav nav-tabs nav-tabs-sm card-header-tabs">                         <li class="nav-item"><a class="nav-link histo-tab" href="#">Day</a></li>                         <li class="nav-item"><a class="nav-link active histo-tab" href="#">Week</a></li>                         <li class="nav-item"><a class="nav-link histo-tab" href="#">Month</a></li>                         <li class="nav-item"><a class="nav-link histo-tab" href="#">Year</a></li>                       </ul>                     </div>                     <div class="card-body">                       <div class="histo" id="histoBars"></div>                       <div class="histo-labels" id="histoLabels"></div>                     </div>                   </div>                   <div class="card card-sm">                     <div class="card-header">                       <h4 class="card-header-title">Party Breakdown</h4>                     </div>                     <div class="card-body">                       <div class="treemap" id="partyTreemap"></div>                     </div>                   </div>                   <div class="card card-sm">                     <div class="card-header">                       <h4 class="card-header-title">Top Stakeholders</h4>                       <ul class="nav nav-tabs nav-tabs-sm card-header-tabs">                         <li class="nav-item"><a class="nav-link active stake-tab" href="#" data-mode="count"><i class="fas fa-list-ol mr-1"></i> Count</a></li>                         <li class="nav-item"><a class="nav-link stake-tab" href="#" data-mode="proportion"><i class="fas fa-percent mr-1"></i> Proportion</a></li>                       </ul>                     </div>                     <div class="card-body">                       <div class="top-stakeholders-chart" id="stakeChart"></div>                     </div>                   </div>                 </div>' + '</div>';
  var timeframe = { label: 'Last 6 months', weeks: 28 };
  var YEAR_CURVE = [0.31, 0.42, 0.5, 0.64, 0.83, 1];
  var HISTO = {
    labels: ['Mar 2', 'Mar 9', 'Mar 16', 'Mar 23', 'Mar 30', 'Apr 6', 'Apr 13', 'Apr 20', 'Apr 27', 'May 4', 'May 11', 'May 18', 'May 25', 'Jun 1', 'Jun 8', 'Jun 15', 'Jun 22', 'Jun 29', 'Jul 6', 'Jul 13', 'Jul 20', 'Jul 27', 'Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7'],
    values: [0, 58, 48, 107, 55, 18, 31, 38, 95, 57, 52, 58, 49, 67, 38, 45, 32, 39, 33, 30, 27, 39, 41, 48, 45, 39, 37, 10],
    filtered: [0, 0, 3, 3, 0, 0, 4, 0, 0, 0, 2, 0, 3, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0]
  };

  /* Treemap geometry captured from the live Chart.js instance (455x228 canvas) */
  var PARTY_FULL = [
    { x: 1, y: 1, w: 312, h: 227, label: 'ALP', v: 157, c: '#eb1e1e' },
    { x: 313, y: 1, w: 141, h: 111, label: 'ONP', v: 35, c: '#f6773e' },
    { x: 313, y: 113, w: 82, h: 71, label: 'NAT', v: 13, c: '#248000' },
    { x: 313, y: 184, w: 82, h: 43, label: 'LNP', v: 8, c: '#1947ab' },
    { x: 396, y: 113, w: 58, h: 61, label: 'IND', v: 8, c: '#888888' },
    { x: 396, y: 174, w: 33, h: 53, label: 'LP', v: 4, c: '#1947ab' },
    { x: 430, y: 174, w: 24, h: 53, label: 'LD', v: 3, c: '#f5b60a' }
  ];
  var PARTY_FILTERED = [
    { x: 1, y: 1, w: 182, h: 227, label: 'ALP', v: 17, c: '#eb1e1e' }
  ];
  var TM_W = 455, TM_H = 228;

  var STAKE_FULL = [
    ['Smart Energy Council', 65], ['Chris Bowen', 23], ['Institute of Public Affairs', 19],
    ['Solar Citizens', 18], ['Malcolm Roberts', 18], ['Tim Ayres', 15], ['Josh Wilson', 13],
    ['Amber-Jade Sanderson', 12], ['Climate Change Authority', 11],
    ['Australian Academy of Technological Sciences and Engineering', 10],
    ['Department of Climate Change, Energy, the Environment and Water', 10],
    ['Barnaby Joyce', 10], ['Anne Webster', 10], ['Parliament of Australia', 8],
    ['Essential Energy', 8], ['Commonwealth Scientific and Industrial Research Organisation', 8],
    ['Andrew Willcox', 8], ['Anthony Albanese', 8], ['Pauline Hanson', 7], ['Murray Watt', 6]
  ];
  var histoPeriod = 'week';
  var DAY_WEIGHTS = [0.19, 0.21, 0.18, 0.17, 0.15, 0.05, 0.05];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function weekDate(label) { return new Date(label + ', 2026'); }
  function fmtDay(d) { return MONTHS[d.getMonth()] + ' ' + d.getDate(); }
  function bucket(vals, labels, period) {
    if (period === 'week') return { vals: vals, labels: labels };
    if (period === 'day') {
      var dv = [], dl = [];
      vals.forEach(function (v, i) {
        var start = weekDate(labels[i]);
        DAY_WEIGHTS.forEach(function (w, d) {
          var day = new Date(start); day.setDate(start.getDate() + d);
          dv.push(Math.round(v * w)); dl.push(fmtDay(day));
        });
      });
      return { vals: dv, labels: dl };
    }
    if (period === 'year') {
      /* current year = the real total; earlier years follow the topic's growth curve so the trend over time is visible */
      var total = vals.reduce(function (a, b) { return a + b; }, 0);
      var YEAR_CURVE = [0.31, 0.42, 0.5, 0.64, 0.83, 1];
      var thisYear = weekDate(labels[labels.length - 1]).getFullYear();
      return { vals: YEAR_CURVE.map(function (f) { return Math.round(total * f); }),
               labels: YEAR_CURVE.map(function (_, i) { return String(thisYear - (YEAR_CURVE.length - 1 - i)); }) };
    }
    var keys = [], sums = {};
    vals.forEach(function (v, i) {
      var d = weekDate(labels[i]);
      var k = MONTHS[d.getMonth()] + ' ' + d.getFullYear();
      if (!(k in sums)) { sums[k] = 0; keys.push(k); }
      sums[k] += v;
    });
    return { vals: keys.map(function (k) { return sums[k]; }), labels: keys.map(function (k) { return k.split(' ')[0]; }) };
  }
  function renderHisto(values) {
    currentHistoValues = values;
    var n = Math.min(timeframe.weeks, values.length);
    var b = bucket(values.slice(values.length - n), HISTO.labels.slice(HISTO.labels.length - n), histoPeriod);
    var vals = b.vals, labels = b.labels;
    var max = Math.max.apply(null, vals.concat([1]));
    var bars = document.getElementById('histoBars');
    bars.classList.toggle('histo--dense', vals.length > 40);
    bars.innerHTML = vals.map(function (v, i) {
      var h = Math.round((v / max) * 100);
      return '<div class="histo__col" data-label="' + labels[i] + '" data-value="' + v + '"><div class="histo__bar" style="height: ' + h + '%; --i: ' + i + ';"></div></div>';
    }).join('');
    currentHistoLabels = labels;
    renderHistoLabels();
    requestAnimationFrame(renderHistoLabels);
    document.querySelector('#analysis-results .card-header-title').textContent = timeframe.label;
  }
  /* labels are thinned by the real column width, so wait for layout and re-run on resize */
  var currentHistoLabels = [];
  function renderHistoLabels() {
    var bars = document.getElementById('histoBars'), labels = currentHistoLabels;
    if (!bars || !labels.length) return;
    var w = bars.clientWidth; if (!w) return;
    var slot = w / labels.length;
    var minPx = document.body.classList.contains('l2-body') ? 52 : 26; /* redesign: horizontal centred labels need more room */
    var skip = Math.max(1, Math.ceil(minPx / Math.max(slot, 1)));
    document.getElementById('histoLabels').innerHTML = labels.map(function (l, i) {
      return '<span>' + ((i % skip === 0) ? l : '') + '</span>';
    }).join('');
  }
  var currentHistoLabels = [];
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { renderHistoLabels(); }); ro.observe(document.getElementById('histoBars')); }
  function renderTreemap(cells) {
    document.getElementById('partyTreemap').innerHTML = cells.map(function (c, i) {
      return '<div class="treemap__cell" data-label="' + c.label + '" data-value="' + c.v + '" style="--i:' + i + '; left:' + (c.x / TM_W * 100) + '%; top:' + (c.y / TM_H * 100) + '%; width:' + (c.w / TM_W * 100) + '%; height:' + (c.h / TM_H * 100) + '%; background:' + c.c + ';">' +
        '<div class="tm-label">' + c.label + '</div><div class="tm-value">' + c.v + '</div></div>';
    }).join('');
  }

  var stakeData = STAKE_FULL;
  function renderStake(data, mode) {
    var max = data[0][1];
    var total = data.reduce(function (s, d) { return s + d[1]; }, 0);
    document.getElementById('stakeChart').innerHTML = data.slice(0, 8).map(function (d, i) {
      var pct = mode === 'proportion' ? (d[1] / total * 100) : (d[1] / max * 100);
      var badge = mode === 'proportion' ? (Math.round(d[1] / total * 1000) / 10) + '%' : d[1];
      var av = stakeAvatar(d[0]);
      return '<a class="w-100 my-3 d-block text-reset top-stakeholders-chart__bar' + (av ? ' l2-stake' : '') + '" href="#" onclick="return false;" style="--i:' + i + ';">' +
        av + '<div class="l2-stake__body">' +
        '<div class="top-stakeholders-chart__data" style="width: ' + pct + '%; margin-bottom: 3px;"></div>' +
        '<div class="d-flex align-items-center flex-gap-2">' +
          '<div class="text-truncate">' + esc(d[0]) + '</div>' +
          '<div class="badge badge-light ml-1">' + badge + '</div>' +
        '</div></div></a>';
    }).join('');
  }
  var STAKE_IMAGES = {
    'Chris Bowen': ['avatars/chris-bowen.jpg', 'person'], 'Malcolm Roberts': ['avatars/malcolm-roberts.jpg', 'person'],
    'Tim Ayres': ['avatars/tim-ayres.jpg', 'person'], 'Josh Wilson': ['avatars/josh-wilson.jpg', 'person'],
    'Amber-Jade Sanderson': ['avatars/amber-jade-sanderson.jpg', 'person'], 'Anthony Albanese': ['avatars/anthony-albanese.jpg', 'person'],
    'Penny Wong': ['avatars/penny-wong.jpg', 'person'], 'Pauline Hanson': ['avatars/pauline-hanson.jpg', 'person'], 'Bob Katter': ['avatars/bob-katter.jpg', 'person'], 'Jim Chalmers': ['avatars/jim-chalmers.jpg', 'person'], 'Tony Burke': ['avatars/tony-burke.jpg', 'person'],
    'Smart Energy Council': ['logos/smart-energy-council.png', 'org'], 'Institute of Public Affairs': ['logos/institute-of-public-affairs.png', 'org'],
    'Solar Citizens': ['logos/solar-citizens.png', 'org'], 'Climate Change Authority': ['logos/climate-change-authority.png', 'org']
  };
  function stakeAvatar(name) {
    if (!document.body.classList.contains('l2-body')) return '';
    var hit = STAKE_IMAGES[name];
    if (hit) return '<span class="stake-avatar stake-avatar--' + hit[1] + '"><img src="/assets/' + hit[0] + '" alt=""></span>';
    var isOrg = /council|institute|authority|association|australia|department|alliance|group|foundation|union|party|centre|center|agency|energy|scientific|organisation|society|network|federation|school|university|commission|office|bank|company|corporation|limited|pty|ltd|parliament|forum|chamber|industry|committee|board|trust/i.test(name);
    var initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    return '<span class="stake-avatar stake-avatar--' + (isOrg ? 'org' : 'person') + ' stake-avatar--initials">' + esc(initials) + '</span>';
  }


  var values = HISTO.values.map(function (v) { return Math.round(v * SCALE); });
  var stakeData = STAKE_FULL.map(function (d) { return [d[0], Math.max(1, Math.round(d[1] * SCALE * 1.4))]; });
  var party = PARTY_FULL.map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; o.v = Math.max(1, Math.round(c.v * SCALE)); return o; });
  function currentStakeMode() { var a = document.querySelector('#analysis-results .stake-tab.active'); return a ? a.getAttribute('data-mode') : 'count'; }
  var rendered = false;
  function renderAll() { renderHisto(values); renderTreemap(party); renderStake(stakeData, currentStakeMode()); rendered = true; }
  /* chart tabs are handled here first so the page's Timeline/Analysis tab handler never sees them */
  document.addEventListener('click', function (e) {
    var ht = e.target.closest('#analysis-results .histo-tab');
    if (ht) { e.preventDefault(); e.stopPropagation(); document.querySelectorAll('#analysis-results .histo-tab').forEach(function (t) { t.classList.toggle('active', t === ht); }); histoPeriod = ht.textContent.trim().toLowerCase(); renderHisto(values); return; }
    var st = e.target.closest('#analysis-results .stake-tab');
    if (st) { e.preventDefault(); e.stopPropagation(); document.querySelectorAll('#analysis-results .stake-tab').forEach(function (t) { t.classList.toggle('active', t === st); }); renderStake(stakeData, currentStakeMode()); return; }
    var tab = e.target.closest('.nav-tabs .nav-link');
    if (tab && /Analysis/.test(tab.textContent)) setTimeout(function () { renderAll(); }, 30);
  }, true);
  var mo = new MutationObserver(function () { if (!host.classList.contains('d-none') && !rendered) renderAll(); });
  mo.observe(host, { attributes: true, attributeFilter: ['class'] });
})();
