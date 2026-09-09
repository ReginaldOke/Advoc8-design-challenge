/* Search flow: keyword -> results -> filters -> Save as Feed (index.html) */
(function () {
  'use strict';

  var input = document.querySelector('#feeds_v2_index input[type=search]');
  if (!input) return;

  /* ---------------- Data ---------------- */

  var THUMB = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
    '<rect width="96" height="96" fill="#cfe0f0"/>' +
    '<rect x="10" y="26" width="76" height="44" rx="3" fill="#4a708c"/>' +
    '<line x1="10" y1="48" x2="86" y2="48" stroke="#cfe0f0" stroke-width="2"/>' +
    '<line x1="48" y1="26" x2="48" y2="70" stroke="#cfe0f0" stroke-width="2"/></svg>'
  );


  var RESULTS_FILTERED = [
    { pre: 'Question Time', title: 'Climate Action',
      author: { name: 'Emily Bourke', party: 'ALP', pc: 'background-color: #eb1e1e; color: white;', juris: 'SA', role: 'Member of Executive Council' },
      metaIcon: 'far fa-landmark-flag mr-2', metaStyle: '',
      metaText: 'South Australia Parliament • Legislative Council • 2 September',
      paragraphs: [
        'We have also been able to make investments across many different areas and we know this is important because a lot of places in South Australia have gone to using renewable energy as a source. Looking at areas, if I was to go to the Murray Mallee, for example, over 48 per cent of households, I am advised, have <mark>solar panels</mark>. If I was to look at the Yorke Peninsula, over 55 per cent of households, I am advised, have renewable energy. We have been able to be a leader when it comes to renewable energy, something that is not seen in many places in the world, because of our investments, because of the targets that we have set and because we continue to find innovative ways to make sure that renewable energy is supported but also through this transition of making those targets achievable.'
      ],
      badges: ['Climate Action'] },
    { pre: 'Bills', title: 'Northern Water Project (Land and Infrastructure) Bill',
      author: { name: 'Jenn Roberts', party: 'ALP', pc: 'background-color: #eb1e1e; color: white;', juris: 'SA', role: 'Member for Hartley' },
      metaIcon: 'far fa-landmark-flag mr-2', metaStyle: '',
      metaText: 'South Australia Parliament • House of Assembly • 20 August',
      paragraphs: [
        'At the heart of our transition to a sustainable future is an increase in demand for copper. Copper is essential in almost every piece of green energy technology, from <mark>solar panels</mark> and wind turbines to electric vehicles, batteries and the electricity networks that connect them. And with two-thirds of Australia’s known copper resources, South Australia is better placed than any other state to produce the materials that the net zero transition needs most.',
        'It could help unlock more than $25 billion in private investment over the coming years and strengthen South Australia’s role in the supply chains that will underpin the global transition to a cleaner economy. The benefits will not stop at the mine gate. The copper produced here can become the batteries, <mark>solar panels</mark>, wind turbines and electricity infrastructure that help Australia and the world move towards net zero. At the same time, reducing our reliance on the Great Artesian Basin gives us an opportunity to better protect this incredibly important natural resource for generations to come.'
      ] }
  ];

  function cardKind(item) { return item.kind || (/facebook|twitter|linkedin/i.test(item.netIcon || '') ? 'social' : (/Parliament/.test(item.metaText || '') ? 'parliament' : 'media')); }
  function fromScraped(c) {
    var persons = (c.persons || []).map(function (p) {
      return { name: p[0], party: p[1], pc: p[2], juris: p[3], role: p[4] };
    });
    return {
      kind: c.kind, pre: c.pre, title: c.title,
      org: c.org, juris: c.orgJ,
      person: persons[0],
      netIcon: c.mi, netStyle: c.mis, metaText: c.mt,
      bullets: c.bullets, paragraphs: (c.paras || []).map(function (p) { return p.replace(/\n/g, ' '); }),
      text: c.text, badges: c.badges, thumb: c.thumb
    };
  }
  var IDLE_LIST = window.SEARCH_DATA.idle.map(fromScraped);
  var SOLAR_LIST = window.SEARCH_DATA.solar.map(fromScraped);
  var currentList = IDLE_LIST;

  function bodyContent(item) {
    if (item.bullets && item.bullets.length) {
      return '<div class="card-text text-gray-800 feed-body"><div><div class="forDumbOutlooks"><ul class="m-0 px-4">' +
        item.bullets.map(function (b) { return '<li class="pb-1">' + esc(b) + '</li>'; }).join('') +
        '</ul></div></div></div>';
    }
    if (item.paragraphs && item.paragraphs.length) {
      return '<div class="card-text text-gray-800 feed-body"><div class="d-flex flex-column flex-gap-3">' +
        item.paragraphs.map(function (p) { return '<div class="border-left border-3 pl-2 mb-2">' + p + '</div>'; }).join('') +
        '</div></div>';
    }
    return '<div class="card-text text-gray-800 feed-body">' +
      esc(item.text || '').replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>') + '</div>';
  }

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
  var STAKE_FILTERED = [
    ['Penny Sharpe', 3], ['Jo Haylen', 2], ['Daniel Mookhey', 2], ['Emily Bourke', 1]
  ];

  /* ---------------- Rendering ---------------- */

  var esc = window.replicaEsc;

  function hoverControls() {
    return '' +
      '<div class="z-3 position-absolute top-0 right-0 mt-3 mr-3 hover-reveal__hidden">' +
        '<div class="d-flex flex-gap-2">' +
          '<div class="dropdown">' +
            '<button class="btn btn-white btn-sm" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
              '<i class="far fa-share-from-square fa-fw mr-1"></i> Share' +
            '</button>' +
            '<div class="dropdown-menu dropdown-menu-right">' +
              '<a class="dropdown-item" href="#"><i class="fa-regular fa-paper-plane mr-3"></i>Email</a>' +
              '<a class="dropdown-item" href="#"><i class="fa-regular fa-copy mr-3"></i>Copy Link</a>' +
            '</div>' +
          '</div>' +
          '<div><button class="btn btn-white btn-sm js-save-btn" type="button"><i class="fa-regular fa-bookmark fa-fw mr-1"></i> Save</button></div>' +
          '<button class="btn btn-white btn-sm js-expand-btn" type="button" aria-label="Open in reader" data-tooltip="Open in reader"><i class="far fa-arrows-maximize fa-fw"></i></button>' +
        '</div>' +
      '</div>';
  }

  function orgResultCard(item) {
    return '' +
      '<div class="mb-3" data-card-type="' + cardKind(item) + '">' +
        '<div class="card card-sm hover-gray-bg hover-reveal mb-2">' +
          hoverControls() +
          '<div class="border-bottom card-body">' +
            (item.title ?
              '<a class="stretched-link text-reset" href="#"><h3 class="card-title font-weight-bold mb-2">' + esc(item.title) + '</h3></a>' : '') +
            '<div class="text-gray-800 mb-2 z-2 position-relative">' +
              '<a class="text-reset" href="#">' +
                '<div class="d-flex flex-gap-2 align-items-baseline my-1">' +
                  '<h4 class="font-weight-bold small mb-0">' +
                    '<span class="pr-2">' + esc(item.org) + '</span>' +
                    '<small><span class="badge bg-secondary-soft text-dark">' + esc(item.juris) + '</span></small>' +
                  '</h4>' +
                '</div>' +
              '</a>' +
            '</div>' +
            '<p class="small card-text mb-0 text-gray-700">' +
              '<i class="' + item.netIcon + ' mr-2" style="' + (item.netStyle || '') + '"></i>' +
              esc(item.metaText) +
            '</p>' +
          '</div>' +
          '<div class="card-body">' +
            bodyContent(item) +
            (item.thumb ?
              '<div class="row rounded overflow-hidden mt-3 mx-1"><div class="p-0 mr-2"><img class="img-fluid avatar-img avatar-lg rounded replica-thumb-placeholder" src="' + THUMB + '" alt=""></div></div>' : '') +
            '<a class="stretched-link" style="opacity: 0; height: 0px; display: block;" href="#">Open Post</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function hansardResultCard(item) {
    var a = item.author;
    var badges = (item.badges || []).map(function (b) {
      return '<span class="badge badge-soft-primary">' + esc(b) + '</span>';
    }).join('');
    return '' +
      '<div class="mb-3" data-card-type="' + cardKind(item) + '">' +
        '<div class="card card-sm hover-gray-bg hover-reveal mb-2">' +
          hoverControls() +
          '<div class="border-bottom card-body">' +
            (item.pre ? '<p class="small card-text text-gray-700 mb-2">' + esc(item.pre) + '</p>' : '') +
            (item.title ? '<a class="stretched-link text-reset" href="#"><h3 class="card-title font-weight-bold mb-2">' + esc(item.title) + '</h3></a>' : '') +
            '<div class="text-gray-800 mb-2 z-2 position-relative">' +
              '<a class="text-reset" href="#">' +
                '<div class="d-md-flex flex-gap-2 align-items-baseline my-1">' +
                  '<h4 class="font-weight-bold small mb-md-0 mb-1" style="width: fit-content;">' +
                    '<div class="d-flex align-items-center flex-gap-2">' +
                      '<span style="white-space:nowrap;">' + esc(a.name) + '</span>' +
                      '<div class="d-inline-flex flex-gap-1 small">' +
                        '<span class="badge party" style="' + a.pc + '">' + esc(a.party) + '</span>' +
                        '<span class="badge bg-secondary-soft text-dark">' + esc(a.juris) + '</span>' +
                      '</div>' +
                    '</div>' +
                  '</h4>' +
                  '<h5 class="text-muted font-weight-normal mb-0 small text-truncate">' + esc(a.role) + '</h5>' +
                '</div>' +
              '</a>' +
            '</div>' +
            '<p class="small card-text mb-0 text-gray-700">' +
              '<i class="' + item.metaIcon + '" style="' + (item.metaStyle || '') + '"></i>' +
              esc(item.metaText) +
            '</p>' +
          '</div>' +
          '<div class="card-body">' +
            bodyContent(item) +
            (item.thumb ?
              '<div class="row rounded overflow-hidden mt-3 mx-1"><div class="p-0 mr-2"><img class="img-fluid avatar-img avatar-lg rounded replica-thumb-placeholder" src="' + THUMB + '" alt=""></div></div>' : '') +
            (badges ? '<p class="card-text mt-2">' + badges + '</p>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderResults(items) {
    currentList = items;
    var el = document.getElementById('search-results');
    el.innerHTML = items.map(function (item) {
      if (item.person) {
        return hansardResultCard({
          kind: item.kind, pre: item.pre, title: item.title, author: item.person,
          metaIcon: item.netIcon, metaStyle: item.netStyle,
          metaText: item.metaText, paragraphs: item.paragraphs, bullets: item.bullets,
          text: item.text, badges: item.badges, thumb: item.thumb
        });
      }
      return item.author ? hansardResultCard(item) : orgResultCard(item);
    }).join('\n');
  }

  var timeframe = { label: 'Last 6 months', weeks: 28 };
  var currentHistoValues = HISTO.values;

  /* Day / Week / Month / Year bucketing of the weekly series */
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
  if (window.ResizeObserver) {
    var histoRO = new ResizeObserver(function () { renderHistoLabels(); });
    var histoEl = document.getElementById('histoBars'); if (histoEl) histoRO.observe(histoEl);
  }

  var TIMEFRAME_WEEKS = {
    'Last 24 hours': 1, 'Last 7 days': 1, 'Last 30 days': 4,
    'Last 6 months': 28, 'Last 12 months': 28, 'All Time': 28, 'Exact Dates': 28
  };

  window.replicaApplyTimeframe = function (label) {
    timeframe = { label: label, weeks: TIMEFRAME_WEEKS[label] || 28 };
    var pillLabel = document.querySelector('.js-timeframe > a.nav-link .ml-2');
    if (pillLabel) pillLabel.textContent = label;
    if (state === 'idle') return;
    renderHisto(currentHistoValues);
    var n = Math.min(timeframe.weeks, currentHistoValues.length);
    var sum = currentHistoValues.slice(currentHistoValues.length - n)
      .reduce(function (s, v) { return s + v; }, 0);
    var full = timeframe.weeks >= 28;
    var count = document.getElementById('results-count');
    if (state === 'results') {
      count.textContent = full ? '1,236 results' : sum.toLocaleString('en-AU') + ' results';
    } else {
      count.textContent = full ? '17 results' : sum.toLocaleString('en-AU') + ' results';
    }
  };

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
  /* Layout 2/3 only: photo (people) or logo (organisations) beside each stakeholder; initials when none is known */
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
    if (hit) return '<span class="stake-avatar stake-avatar--' + hit[1] + '"><img src="assets/' + hit[0] + '" alt=""></span>';
    var isOrg = /council|institute|authority|association|australia|department|alliance|group|foundation|union|party|centre|center|agency|energy|scientific|organisation|society|network|federation|school|university|commission|office|bank|company|corporation|limited|pty|ltd|parliament|forum|chamber|industry|committee|board|trust/i.test(name);
    var initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    return '<span class="stake-avatar stake-avatar--' + (isOrg ? 'org' : 'person') + ' stake-avatar--initials">' + esc(initials) + '</span>';
  }

  /* ---------------- State machine ---------------- */

  var PILLS = {
    idle: { mr: '42K', parl: '46K', sm: '470K', other: '547' },
    results: { mr: '316', parl: '472', sm: '444', other: '4' },
    filtered: { mr: '11', parl: '6', sm: '0', other: '0' }
  };

  function setPillCounts(p) {
    var pills = document.querySelectorAll('.filter-pills .badge.badge-pill, .filter-pills .badge');
    var lis = document.querySelectorAll('#content_type_filter_form .filter-pills > li');
    var vals = [p.mr, p.parl, p.sm, p.other];
    lis.forEach(function (li, i) {
      var b = li.querySelector('.badge');
      if (b && vals[i] !== undefined) b.textContent = vals[i];
    });
  }

  var state = 'idle';
  function setState(next, chips) {
    state = next;
    var isIdle = next === 'idle';
    var results = next === 'results' || next === 'filtered';
    var noResults = next === 'noresults';
    var pillsBar = document.querySelector('.my-3.d-flex.nav-overflow');
    if (pillsBar) pillsBar.classList.toggle('d-none', noResults);
    var countRow = document.getElementById('results-count').closest('.row');
    if (countRow) countRow.classList.toggle('d-none', noResults);
    document.getElementById('sortWrap').classList.toggle('d-none', !results);
    document.getElementById('analysis-idle').classList.toggle('d-none', results || noResults);
    document.getElementById('analysis-results').classList.toggle('d-none', !results);
    if (noResults) {
      document.getElementById('filterChips').classList.add('d-none');
      var fb = document.querySelector('.filter-button .filters-active-dot');
      if (fb) fb.remove();
      document.getElementById('search-results').innerHTML =
        '<h3 class="font-weight-bold text-center mt-5" style="font-size: 1.25rem;">No results found</h3>';
      return;
    }
    var chipsEl = document.getElementById('filterChips');
    chipsEl.classList.toggle('d-none', next !== 'filtered');
    var filterBtn = document.querySelector('.filter-button');
    var dot = filterBtn.querySelector('.filters-active-dot');
    if (next === 'filtered' && !dot) {
      filterBtn.insertAdjacentHTML('beforeend', '<span class="filters-active-dot"></span>');
    } else if (next !== 'filtered' && dot) {
      dot.remove();
    }

    var count = document.getElementById('results-count');
    setPillCounts(PILLS[next]);
    if (isIdle) {
      count.textContent = window.SEARCH_DATA.idleCount;
      renderResults(IDLE_LIST);
      return;
    }
    if (next === 'results') {
      count.textContent = window.SEARCH_DATA.solarCount;
      renderResults(SOLAR_LIST);
      renderHisto(HISTO.values);
      renderTreemap(PARTY_FULL);
      stakeData = STAKE_FULL;
      renderStake(stakeData, currentStakeMode());
    } else {
      count.textContent = '17 results';
      renderResults(RESULTS_FILTERED);
      renderHisto(HISTO.filtered);
      renderTreemap(PARTY_FILTERED);
      stakeData = STAKE_FILTERED;
      renderStake(stakeData, currentStakeMode());
      chipsEl.innerHTML = chips.map(function (c) {
        return '<span class="chip">' + esc(c) + '<span class="chip-x"><i class="fal fa-times"></i></span></span>';
      }).join('');
    }
  }

  function currentStakeMode() {
    var active = document.querySelector('.stake-tab.active');
    return active ? active.getAttribute('data-mode') : 'count';
  }

  /* Search input: Enter triggers results */
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var term = input.value.trim();
      if (!term) setState('idle');
      else if (/solar|panel|battery|batteries|renewabl/i.test(term)) setState('results');
      else setState('noresults');
    }
  });
  input.addEventListener('input', function () {
    if (!input.value.trim() && state !== 'idle') setState('idle');
  });

  /* Filters modal "Show Results" collects chips */
  document.addEventListener('click', function (e) {
    if (e.target.closest('.js-show-results')) {
      var modal = document.getElementById('filterModal');
      var chips = [];
      modal.querySelectorAll('#topics-list input[id^="feeds_v2_topic_group_"]:checked, #topics-list input[id^="feeds_v2_topic_group_"]:indeterminate').forEach(function (c) {
        var lbl = modal.querySelector('label[for="' + c.id + '"]');
        if (lbl) chips.push(lbl.textContent.replace(/\s+/g, ' ').trim().replace(/^\S+\s+/, ''));
      });
      var jur = [];
      modal.querySelectorAll('#jurisdictions input.btn-check:not([id^=select_all]):checked, #jurisdictions input#jurisdiction_1:checked').forEach(function (c) {
        var lbl = modal.querySelector('label[for="' + c.id + '"]');
        if (lbl && jur.indexOf(lbl.textContent.trim()) === -1) jur.push(lbl.textContent.trim());
      });
      if (jur.length) {
        chips.push(jur.length > 1 ? jur.slice(0, -1).join(', ') + ', and ' + jur[jur.length - 1] : jur[0]);
      }
      var partyTyped = modal.querySelector('#parties .select2-search__field');
      if (partyTyped && partyTyped.value.trim()) chips.push(partyTyped.value.trim());
      modal.querySelectorAll('#parties .select2-selection__choice').forEach(function (li) { chips.push(li.textContent.replace(/\u00d7/g, '').trim()); });
      modal.querySelectorAll('#stakeholders .select2-selection__choice').forEach(function (li) { chips.push(li.textContent.replace(/\u00d7/g, '').trim()); });
      if (chips.length && input.value.trim()) {
        setState('filtered', chips);
      } else if (input.value.trim()) {
        setState('results');
      }
    }
    /* chip removal */
    var x = e.target.closest('.chip-x');
    if (x) {
      x.closest('.chip').remove();
      if (!document.querySelectorAll('#filterChips .chip').length) setState('results');
    }
    /* sort */
    var sortOpt = e.target.closest('.sort-opt');
    if (sortOpt) {
      e.preventDefault();
      document.getElementById('sortLabel').textContent = sortOpt.textContent;
      if (sortOpt.textContent === 'Most Recent') {
        var el = document.getElementById('search-results');
        [...el.children].reverse().forEach(function (c) { el.appendChild(c); });
      } else {
        renderResults(state === 'filtered' ? RESULTS_FILTERED :
          (state === 'results' ? SOLAR_LIST : IDLE_LIST));
      }
    }
    /* histogram period tabs: re-bucket the series */
    var htab = e.target.closest('.histo-tab');
    if (htab) {
      e.preventDefault();
      document.querySelectorAll('.histo-tab').forEach(function (t) { t.classList.toggle('active', t === htab); });
      histoPeriod = htab.textContent.trim().toLowerCase();
      renderHisto(currentHistoValues);
    }
    /* stakeholder count/proportion tabs */
    var stab = e.target.closest('.stake-tab');
    if (stab) {
      e.preventDefault();
      document.querySelectorAll('.stake-tab').forEach(function (t) { t.classList.toggle('active', t === stab); });
      renderStake(stakeData, stab.getAttribute('data-mode'));
    }
  });

  /* Initial idle render from scraped data */
  document.getElementById('results-count').setAttribute('data-default', window.SEARCH_DATA.idleCount);

  /* ---- redesign only: results for any query, and a count that responds to every term and filter change ---- */
  if (document.body.classList.contains('l2-body')) (function () {
    function fromFeed(i) {
      var a = (i.authors || [])[0];
      return { kind: i.type === 'social' ? 'social' : (/Parliament/.test(i.metaText) ? 'parliament' : 'media'), pre: i.pre, title: i.title,
        org: i.org ? i.org.name : (a && !a.party && !a.role ? a.name : null), juris: i.org ? i.org.juris : (a && !a.party && !a.role ? a.juris : ''),
        person: a && (a.party || a.role) ? { name: a.name, party: a.party, pc: '', juris: a.juris, role: a.role } : null,
        netIcon: i.metaIcon, netStyle: i.metaIconStyle, metaText: i.metaText, bullets: i.bullets || [], paragraphs: [], text: i.text, badges: i.badges || [], thumb: i.thumb };
    }
    var POOL = IDLE_LIST.concat(SOLAR_LIST);
    if (window.FEED_DATA) Object.keys(window.FEED_DATA).forEach(function (k) { window.FEED_DATA[k].items.forEach(function (i) { if (!i.divider) POOL.push(fromFeed(i)); }); });
    var seen = {}; POOL = POOL.filter(function (p) { var k = (p.title || p.text || '').slice(0, 60); if (seen[k]) return false; seen[k] = true; return true; });
    function hay(p) { return [p.title, p.text, (p.bullets || []).join(' '), (p.badges || []).join(' '), p.org, p.person && p.person.name, p.pre].filter(Boolean).join(' ').toLowerCase(); }
    function hash(s) { var x = 0; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; }
    function parse(q) {
      var pos = [], neg = [], and = / AND /.test(q);
      q.replace(/\((.*?)\)/g, '$1').split(/ (?:OR|AND) /).forEach(function (part) {
        part.split(/ NOT /).forEach(function (t, i) { t = t.replace(/^"|"$/g, '').trim().toLowerCase(); if (!t) return; (i === 0 ? pos : neg).push(t); });
      });
      return { pos: pos, neg: neg, and: and };
    }
    /* plausible volume per term: real for the solar dataset, otherwise a stable number in a believable range */
    function termVolume(t) { if (/solar|panel|battery|batteries|renewabl/.test(t)) return 1236; var w = t.split(/\s+/).length; var base = 900 + (hash(t) % 38000); return Math.round(base / (w > 1 ? 3.2 : 1)); }
    var SHARE = { media: 0.075, parliament: 0.082, social: 0.838, other: 0.001 };
    var TIME = { 'Last 24 hours': 0.006, 'Last 7 days': 0.04, 'Last 30 days': 0.17, 'Last 6 months': 1, 'Last 12 months': 1.9, 'All Time': 4.3 };
    /* each source counts fully, partly (some of its sub-sources ticked, weighted by their volume) or not at all */
    function subWeight(o) { var n = o.querySelector('.n'); var m = n && n.textContent.replace(/,/g, '').match(/([\d.]+)(K?)/i); return m ? parseFloat(m[1]) * (m[2] ? 1000 : 1) : 1; }
    function sourceFrac(c, p) {
      var kids = [].slice.call(c.querySelectorAll('input[data-parent="' + p.value + '"]'));
      if (!kids.length) return p.checked ? 1 : 0;
      var all = 0, on = 0; kids.forEach(function (k) { var w = subWeight(k.closest('.opt')); all += w; if (k.checked) on += w; });
      return all ? on / all : (p.checked ? 1 : 0);
    }
    function sourcesOn() { var on = {}; var c = document.getElementById('l2SrcChip'); if (!c) return { media: 1, parliament: 1, social: 1, other: 1 }; c.querySelectorAll('.l2-pop > .opt input').forEach(function (i) { on[i.value] = sourceFrac(c, i); }); return on; }
    function dateLabel() { var v = document.querySelector('#l2DateChip .val > span'); return v ? v.textContent.trim() : 'Last 6 months'; }
    var lastQuery = '';
    function estimate() {
      var q = parse(lastQuery), base;
      if (!q.pos.length) base = 560541;
      else { var vols = q.pos.map(termVolume); base = q.and ? Math.round(Math.min.apply(null, vols) * 0.35) : vols.reduce(function (a, b) { return a + b; }, 0); }
      q.neg.forEach(function () { base = Math.round(base * 0.85); });
      var on = sourcesOn(), share = 0; Object.keys(SHARE).forEach(function (k) { share += SHARE[k] * (on[k] || 0); });
      var d = dateLabel(), tf = TIME[d] !== undefined ? TIME[d] : 0.6;
      var n = Math.round(base * share * tf);
      return Math.max(0, n);
    }
    function recount() {
      var n = estimate(), on = sourcesOn();
      document.getElementById('results-count').textContent = n.toLocaleString('en-AU') + ' results';
      var f = n / 560541, fmt = function (x) { x = Math.round(x); return x >= 1000 ? (x >= 10000 ? Math.round(x / 1000) + 'K' : (x / 1000).toFixed(1) + 'K') : String(x); };
      setPillCounts({ mr: fmt(560541 * SHARE.media * f / (share(on) || 1)), parl: fmt(560541 * SHARE.parliament * f / (share(on) || 1)), sm: fmt(560541 * SHARE.social * f / (share(on) || 1)), other: fmt(560541 * SHARE.other * f / (share(on) || 1)) });
    }
    function share(on) { var s = 0; Object.keys(SHARE).forEach(function (k) { s += SHARE[k] * (on[k] || 0); }); return s; }
    window.l2Recount = recount;
    function showGeneric(query) {
      var q = parse(query);
      var hits = POOL.filter(function (p) { var t = hay(p); return q.pos.some(function (w) { return t.indexOf(w) !== -1; }) && !q.neg.some(function (w) { return t.indexOf(w) !== -1; }); });
      var rest = POOL.filter(function (p) { return hits.indexOf(p) === -1; });
      var seed = hash(query); rest.sort(function (a, b) { return (hash(a.title || a.text || '') ^ seed) - (hash(b.title || b.text || '') ^ seed); });
      var list = hits.concat(rest).slice(0, Math.max(12, Math.min(hits.length, 30)));
      setState('results');
      renderResults(list);
      var f = Math.max(0.05, Math.min(4, estimate() / 1236));
      renderHisto(HISTO.values.map(function (v) { return Math.round(v * f); }));
      if (window.replicaApplyTimeframe) window.replicaApplyTimeframe(dateLabel());
      recount();
    }
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      lastQuery = input.value.trim();
      if (!lastQuery) { recount(); return; }
      if (/solar|panel|battery|batteries|renewabl/i.test(lastQuery) && !/ (OR|AND|NOT) /.test(lastQuery)) { recount(); return; }
      showGeneric(lastQuery);
    });
    var origTf = window.replicaApplyTimeframe;
    window.replicaApplyTimeframe = function (label) { origTf(label); recount(); };
    recount();
  })();

  setState('idle');
})();

/* Chart hover tooltips (mirrors Chart.js tooltip styling) */
(function () {
  if (document.body.classList.contains('l2-body')) return; /* the redesign uses the hover card in chart-actions.js */
  var tip = null;
  function show(html, x, y) {
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'chart-tooltip';
      document.body.appendChild(tip);
    }
    tip.innerHTML = html;
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
  }
  function hide() { if (tip) { tip.remove(); tip = null; } }

  document.addEventListener('mouseover', function (e) {
    var col = e.target.closest('.histo__col');
    var cell = e.target.closest('.treemap__cell');
    if (col && col.hasAttribute('data-label')) {
      var r = col.getBoundingClientRect();
      show('<div class="tt-title">' + col.getAttribute('data-label') + '</div>' + col.getAttribute('data-value'),
        r.left + r.width / 2, r.top);
    } else if (cell && cell.hasAttribute('data-label')) {
      var r2 = e.target.closest('.treemap__cell').getBoundingClientRect();
      show('<div class="tt-title">' + cell.getAttribute('data-label') + '</div>' + cell.getAttribute('data-value'),
        r2.left + r2.width / 2, r2.top + 24);
    } else if (tip && !col && !cell) {
      hide();
    }
  });
  document.addEventListener('scroll', hide, true);
})();
