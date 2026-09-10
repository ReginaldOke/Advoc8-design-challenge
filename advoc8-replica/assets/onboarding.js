/* Onboarding (redesign): press R for the sign in screen, then a topic chooser that hands off to Search or the feed builder. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var GROUPS = [{"name": "Economy and business", "topics": [["📈", "Economics", ["Budget", "Economy"]], ["💸", "Taxation", ["Charities and NFPs", "Company Tax", "Income Tax", "Property Tax"]], ["💳", "Finance", ["Banking", "Financial Services Sector", "Insurance", "Investment", "Payments", "Superannuation"]], ["👔", "Corporate Affairs", ["Business Regulation", "Small Business"]], ["🌐", "Industry, Science and Innovation", ["Industry", "Innovation", "Science"]], ["🖥️", "Technology", ["Cybersecurity", "Data", "Digital Technologies", "Gaming"]], ["🔍", "Consumer Affairs", ["Consumer Rights", "Pricing", "Product Safety", "Scams"]], ["🥤", "Food and Beverage", ["Beverages", "Food Regulation", "Food and Grocery"]], ["🏖️", "Tourism and Hospitality", ["Accommodation", "Cruise Industry", "Events", "Gambling", "Hospitality", "Liquor", "Overseas Travel"]], ["💶", "Government Grants", []], ["🚘", "Transport", ["Aviation", "Freight and Logistics", "Maritime", "Private Transport - Bikes", "Private Transport - Cars", "Private Transport - Motorcycles", "Private Transport - e-Bikes and PMDs", "Public Transport - Buses", "Public Transport - Rail", "Public Transport - Taxis and Ridesharing", "Roads - Infrastructure and Investment", "Roads - Safety", "Roads - Traffic Management"]], ["💼", "Workplace Relations", ["Enterprise Bargaining", "Fair Work", "Industrial Activities", "Labour Market"]]]}, {"name": "Environment and energy", "topics": [["🐑", "Agriculture", ["Agricultural Industry", "Agricultural Science", "Biosecurity", "Crops", "Fisheries", "Forestry", "Livestock", "Sustainable Agriculture", "Water Management"]], ["⚡", "Energy and Mining", ["Electricity Market", "Energy Efficiency", "Energy Emissions", "Energy Industry", "Gas", "Mining", "Nuclear", "Petroleum", "Renewables"]], ["🌳", "Environment", ["Climate Change", "Conservation", "Landcare", "Waste and Pollution", "Water"]], ["📋", "Planning and Development", ["Construction", "Heritage", "Infrastructure", "Planning", "Property", "Regional Development"]]]}, {"name": "Health and society", "topics": [["🎨", "Arts and Culture", []], ["🎓", "Education", ["Early Education", "Primary Education", "Schools and Teaching", "Secondary Education", "Tertiary Education"]], ["⚕️", "Health", ["Aged Care", "Bioethics", "Cancer", "Communicable Diseases", "Diabetes", "Disability", "Drug Addiction", "Eye Disease", "Health Funding", "Health Sector", "Heart Disease", "Kidney Disease", "Medical Devices", "Medicines", "Mental Health", "Neurological Conditions", "Obesity", "Primary Healthcare", "Secondary Healthcare", "Tobacco"]], ["🌏", "Indigenous Affairs", ["Indigenous Affairs - General", "Indigenous Employment", "Indigenous Health and Wellbeing", "Native Title", "Reconciliation and Recognition"]], ["🏛️", "Social Services", ["Child Care", "Child Protection", "Disability Services", "Domestic Violence", "Housing & Homelessness", "LGBTQIIA+", "Pensioners", "Social Services Sector", "Veterans Affairs", "Young People"]], ["🏉", "Sport and Recreation", []]]}, {"name": "Government, law and security", "topics": [["🪖", "Defence", ["Defence Contracting", "Defence Forces", "Defence Policy", "Security Alliances"]], ["🚨", "Emergency Management", ["Emergency Services", "Natural Disasters"]], ["🤝", "Foreign Affairs and Trade", ["Foreign Aid and Development", "Free Trade Agreements", "International Relations", "Regional Architecture", "Trade and Investment"]], ["🛂", "Home Affairs", ["Immigration and Citizenship", "Multicultural Affairs", "National Security"]], ["⚖️", "Legal Affairs", ["Consumer Data Right", "Defamation", "Freedom of Information", "Intellectual Property", "Privacy"]], ["📰", "Media and Communications", ["Advertising", "Broadcasting", "Content Regulation", "Telecommunications"]]]}];
  var INITIALS = 'RO';
  var IMG = {"🐑": "ewe.png", "🎨": "artist_palette.png", "🔍": "magnifying_glass_tilted_left.png", "👔": "necktie.png", "🪖": "military_helmet.png", "📈": "chart_increasing.png", "🎓": "graduation_cap.png", "🚨": "police_car_light.png", "⚡": "high_voltage.png", "🌳": "deciduous_tree.png", "💳": "credit_card.png", "🥤": "cup_with_straw.png", "🤝": "handshake.png", "💶": "euro_banknote.png", "⚕️": "medical_symbol.png", "🛂": "passport_control.png", "🌏": "globe_showing_asia_australia.png", "🌐": "globe_with_meridians.png", "⚖️": "balance_scale.png", "📰": "newspaper.png", "📋": "clipboard.png", "🏛️": "classical_building.png", "🏉": "rugby_football.png", "💸": "money_with_wings.png", "🖥️": "desktop_computer.png", "🏖️": "beach_with_umbrella.png", "🚗": "automobile.png", "💼": "briefcase.png", "🚘": "oncoming_automobile.png"};
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function findTopic(name) { for (var i = 0; i < GROUPS.length; i++) for (var j = 0; j < GROUPS[i].topics.length; j++) if (GROUPS[i].topics[j][1] === name) return GROUPS[i].topics[j]; return null; }

  /* ---- sign in ---- */
  var screen = null;
  function closeScreen() { if (screen) { screen.classList.remove('show'); var s = screen; setTimeout(function () { s.remove(); }, 180); screen = null; document.body.classList.remove('ob-lock'); } }
  function openScreen(cls, html) {
    var prev = screen; screen = null;
    if (prev) { prev.classList.add('ob-leaving'); setTimeout(function () { prev.remove(); }, 250); }
    screen = el('div', 'ob-screen ' + cls, html); document.body.appendChild(screen); document.body.classList.add('ob-lock');
    requestAnimationFrame(function () { screen.classList.add('show'); });
    return screen;
  }
  window.obShowSignIn = function () { if (!screen) showSignIn(); };
  function showSignIn() {
    var s = openScreen('ob-signin',
      '<div class="ob-card" role="dialog" aria-modal="true" aria-labelledby="obTitle">' +
        '<div class="ob-head"><img class="ob-logo" src="assets/logo-circle-dark.svg?v=2" alt=""><div><h1 id="obTitle">Welcome to Advoc8</h1><p class="ob-sub">A few quick details to set up your account.</p></div></div>' +
        '<form class="ob-form" novalidate autocomplete="off">' +
          '<div class="ob-row"><label>First name<input type="text" value="Reg" autocomplete="off"></label><label>Last name<input type="text" value="Oke" autocomplete="off"></label></div>' +
          '<label>Job title<input type="text" value="Product Designer" autocomplete="off"></label>' +
          '<label>Password<input type="text" class="ob-secret" value="prototype" autocomplete="off" data-lpignore="true" spellcheck="false" aria-label="Password"></label>' +
          '<label class="ob-check"><input type="checkbox" checked><span>I agree to Advoc8’s <a href="#" onclick="return false;">Terms of Service</a> and <a href="#" onclick="return false;">Privacy Policy</a></span></label>' +
          '<button type="submit" class="btn btn-primary btn-block ob-go">Get started</button>' +
        '</form>' +
        '<div class="ob-or"><span>or</span></div>' +
        '<button type="button" class="btn btn-white btn-block ob-sso"><i class="fab fa-google"></i>Continue with Google</button>' +
        '<button type="button" class="btn btn-white btn-block ob-sso"><i class="fab fa-microsoft"></i>Continue with Microsoft</button>' +
        '<p class="ob-foot">Stuck? Email <a href="#" onclick="return false;">support@advoc8.co</a></p>' +
      '</div>');
    s.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); showTopics(); });
    s.querySelectorAll('.ob-sso').forEach(function (b) { b.onclick = showTopics; });
    setTimeout(function () { var i = s.querySelector('input'); if (i) i.focus(); }, 200);
  }

  /* ---- topic chooser ---- */
  var picked = null;
  function showTopics() {
    picked = null;
    var body = GROUPS.map(function (g) {
      return '<section class="ob-group"><h2>' + esc(g.name) + '</h2><div class="ob-grid">' + g.topics.map(function (t) {
        var img = IMG[t[0]] ? '<img class="ob-topic__img" src="assets/emoji3d/' + IMG[t[0]] + '" alt="" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'), {className: \'ob-topic__emoji\', textContent: \'' + t[0] + '\'}))">' : '<span class="ob-topic__emoji">' + t[0] + '</span>';
        return '<button type="button" class="ob-topic" data-name="' + esc(t[1]) + '">' + img + '<span class="ob-topic__name">' + esc(t[1]) + '</span><i class="fas fa-circle-check ob-topic__tick"></i></button>';
      }).join('') + '</div></section>';
    }).join('');
    var fromCard = screen && screen.querySelector('.ob-card') ? screen.querySelector('.ob-card').getBoundingClientRect() : null;
    var s = openScreen('ob-topics',
      '<div class="ob-panel" role="dialog" aria-modal="true" aria-labelledby="obTopicsTitle">' +
        '<header class="ob-panel__head"><div><h1 id="obTopicsTitle">Choose a topic</h1><p class="ob-sub">Pick the area you work in. You can add more later.</p></div><button type="button" class="ob-skip">Skip for now</button></header>' +
        '<div class="ob-panel__body">' + body + '</div>' +
        '<footer class="ob-panel__foot"><div class="ob-picked" id="obPicked">No topic selected yet</div><div class="ob-ctas"><button type="button" class="btn btn-white" id="obBuild" disabled><i class="far fa-layer-group mr-2"></i>Build a feed</button><button type="button" class="btn btn-primary" id="obResearch" disabled><i class="far fa-search mr-2"></i>Research this topic</button></div></footer>' +
      '</div>');
    /* grow from where the sign in card was into the full panel (FLIP), content fading in as it settles */
    if (fromCard) {
      var panel = s.querySelector('.ob-panel');
      s.classList.add('show'); s.classList.add('ob-morphing');
      var to = panel.getBoundingClientRect();
      var sx = fromCard.width / to.width, sy = fromCard.height / to.height;
      panel.style.transformOrigin = '0 0';
      panel.style.transform = 'translate(' + (fromCard.left - to.left) + 'px, ' + (fromCard.top - to.top) + 'px) scale(' + sx + ', ' + sy + ')';
      panel.style.transition = 'none';
      void panel.offsetWidth;
      requestAnimationFrame(function () {
        panel.style.transition = 'transform .55s cubic-bezier(.2,.8,.2,1), border-radius .55s ease';
        panel.style.transform = 'none';
        setTimeout(function () { s.classList.remove('ob-morphing'); }, 180); /* content starts fading in while the panel is still growing */
        setTimeout(function () { panel.style.transition = ''; panel.style.transform = ''; }, 600);
      });
    }
    s.querySelector('.ob-skip').onclick = closeScreen;
    s.querySelectorAll('.ob-topic').forEach(function (b) {
      b.onclick = function () {
        s.querySelectorAll('.ob-topic.is-picked').forEach(function (x) { x.classList.remove('is-picked'); });
        b.classList.add('is-picked'); picked = findTopic(b.dataset.name);
        s.querySelector('#obPicked').innerHTML = '<span class="ob-picked__emoji">' + picked[0] + '</span> <b>' + esc(picked[1]) + '</b> selected';
        s.querySelector('#obResearch').disabled = false; s.querySelector('#obBuild').disabled = false;
      };
    });
    function fresh() { try { sessionStorage.removeItem('advoc8-toured-search2'); sessionStorage.removeItem('advoc8-toured-build2'); localStorage.setItem('advoc8-proto-collapsed', '1'); } catch (e) {} } /* a new hand-off: the tour may show once more, and the controls panel starts minimised so it stays out of the way */ /* a new hand-off: the tour may show once more */
    s.querySelector('#obResearch').onclick = function () { if (picked) { remember(); fresh(); location.href = 'search2.html?topic=' + encodeURIComponent(picked[1]); } };
    s.querySelector('#obBuild').onclick = function () { if (picked) { remember(); fresh(); location.href = 'build2.html?topic=' + encodeURIComponent(picked[1]); } };
  }
  function remember() { try { localStorage.setItem('advoc8-onboard', JSON.stringify({ topic: picked[1], subs: picked[2] || [], at: Date.now() })); } catch (e) {} }

  /* the same topic images everywhere a topic is listed (filters, feed builder) */
  var EMO = Object.keys(IMG).sort(function (a, b) { return b.length - a.length; });
  function topicImages(root) {
    (root.querySelectorAll ? root.querySelectorAll('#topics-list label, #topicModal label, .topic-group label, .topic-pick > span:first-child') : []).forEach(function (lab) {
      if (lab.dataset.topicImg) return;
      var tn = null; for (var i = 0; i < lab.childNodes.length; i++) if (lab.childNodes[i].nodeType === 3 && lab.childNodes[i].textContent.trim()) { tn = lab.childNodes[i]; break; }
      if (!tn) return; var txt = tn.textContent; var hit = EMO.filter(function (e) { return txt.trimStart().indexOf(e) === 0; })[0]; if (!hit) return;
      lab.dataset.topicImg = '1';
      var img = document.createElement('img'); img.className = 'topic-img'; img.alt = ''; img.src = 'assets/emoji3d/' + IMG[hit];
      tn.textContent = txt.trimStart().slice(hit.length).replace(/^\s+/, ' ');
      lab.insertBefore(img, tn);
    });
  }
  topicImages(document);
  new MutationObserver(function (m) { m.forEach(function (x) { x.addedNodes.forEach(function (n) { if (n.nodeType === 1) topicImages(n); }); }); }).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, a = document.activeElement;
    function typing(el) { return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable); }
    if (typing(t) || typing(a)) return;
    if (e.key === 'r' || e.key === 'R') {
      /* R is a page shortcut only: not while anything in a search bar, a window or a panel has focus */
      if (e.repeat || e.isComposing) return;
      if (t && t !== document.body && t !== document.documentElement && t.closest('.l2-search, #l2SearchWrap, .l2-searchwrap, .index-search-box, .tsq, .rd, .l2-modal, .np, .modal, .bsp, .spal, .l2-pop, .keyword-input, form')) return;
      if (a && a !== document.body && a.closest && a.closest('.l2-search, #l2SearchWrap, .l2-searchwrap, .index-search-box, .tsq, .rd, .l2-modal, .np, .modal, .bsp, .spal, .l2-pop, .keyword-input, form')) return;
      if (document.querySelector('.rd, .l2-modal, .np, .tsq.is-open, .modal.show')) return;
      e.preventDefault(); if (screen) closeScreen(); else showSignIn();
    }
    else if (e.key === 'Escape' && screen) closeScreen();
  });

  /* ---- hand-offs ---- */
  var topicParam = (location.search.match(/[?&]topic=([^&#]*)/) || [])[1];
  var topic = topicParam ? findTopic(decodeURIComponent(topicParam.replace(/\+/g, ' '))) : null;
  if (!topic) return;
  var page = (location.pathname.match(/([^/]*)\.html$/) || [0, ''])[1];
  /* the tour runs once per hand-off from onboarding: not again on a reload, a prototype swap or a return to the page */
  var toured = false; try { toured = sessionStorage.getItem('advoc8-toured-' + page) === '1'; sessionStorage.setItem('advoc8-toured-' + page, '1'); } catch (e) {}
  try { history.replaceState(null, '', location.pathname); } catch (e) {}

  if (page === 'search2') {
    window.addEventListener('load', function () {
      /* nothing typed for them: the search bar stays empty and the tour suggests what to do; their topic is already ticked in Filters */
      var modal = document.getElementById('filterModal');
      if (modal) {
        var norm = function (t) { return t.replace(/\s+/g, ' ').replace(/^[^A-Za-z0-9]+/, '').trim().toLowerCase().replace(/&/g, 'and'); }; /* drops a leading emoji, or nothing when the emoji is an image */
        var lab = [].slice.call(modal.querySelectorAll('#topics-list label')).filter(function (l) { return norm(l.textContent) === norm(topic[1]); })[0];
        var cb = lab && modal.querySelector('#' + (lab.getAttribute('for') || '').replace(/([^\w-])/g, '\\$1'));
        if (cb) { cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      var fchip = document.querySelector('.l2-fchip--filters'), fcount = document.getElementById('l2FiltersCount');
      if (fchip) fchip.classList.add('active'); if (fcount) fcount.textContent = '1';
      if (!toured) setTimeout(showTip, 500);
    });
  }
  /* A short tour: one card at a time, pointing at the thing it talks about */
  function showTip(STEPS, opts) {
    opts = opts || {};
    STEPS = STEPS || [
      { target: '#l2Search', title: 'Start with a search', text: 'Enter keywords to narrow down your search.' },
      { target: function () { var f = document.querySelector('.l2-fchip--filters'); return (f && f.offsetParent) ? f : (document.querySelector('.l2-fchip--group') || document.getElementById('l2SrcChip')); }, title: 'Filter the results', text: 'Filter by topic, jurisdiction, stakeholder or content type. Combine a few to get exactly what you need.' },
      { target: '#l2SaveFeed', title: 'Turn it into a feed', text: 'Save this as a feed and get notified when new items are published.' }
    ];
    var i = 0, card = el('div', 'ob-tour', ''), cur = null;
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-live', 'polite');
    document.body.appendChild(card);
    function target() { var t = STEPS[i].target; return typeof t === 'function' ? t() : document.querySelector(t); }
    function render() {
      var st = STEPS[i], last = i === STEPS.length - 1;
      card.classList.add('is-switching');
      setTimeout(function () { card.classList.remove('is-switching'); }, 260);
      card.innerHTML = '<div class="ob-tour__arrow"></div>' +
        '<button type="button" class="ob-tour__close" aria-label="Close tour">&#215;</button>' +
        '<p class="ob-tour__step">' + (i + 1) + ' of ' + STEPS.length + '</p>' +
        '<h3>' + esc(st.title) + '</h3><p class="ob-tour__text">' + esc(st.text) + '</p>' +
        '<div class="ob-tour__foot"><div class="ob-tour__dots">' + STEPS.map(function (_, k) { return '<span' + (k === i ? ' class="on"' : '') + '></span>'; }).join('') + '</div>' +
        '<div class="ob-tour__btns">' + (i > 0 ? '<button type="button" class="ob-tour__back">Back</button>' : '') + '<button type="button" class="btn btn-primary btn-sm ob-tour__next">' + (last ? 'Done' : 'Next') + '</button></div></div>';
      card.querySelector('.ob-tour__close').onclick = close;
      card.querySelector('.ob-tour__next').onclick = function () { if (last) close(); else { i++; render(); } };
      var back = card.querySelector('.ob-tour__back'); if (back) back.onclick = function () { i--; render(); };
      if (cur) cur.classList.remove('ob-tour-target');
      cur = target(); if (cur) { cur.classList.add('ob-tour-target'); cur.scrollIntoView({ block: 'nearest' }); }
      place(); requestAnimationFrame(function () { card.classList.add('show'); });
      if (i === 0 && opts.enterEl) opts.enterEl.focus({ preventScroll: true }); else card.querySelector('.ob-tour__next').focus({ preventScroll: true });
    }
    function place() {
      if (!cur) return;
      var r = cur.getBoundingClientRect(), w = card.offsetWidth, hgt = card.offsetHeight, gap = 14;
      var below = r.bottom + gap + hgt < window.innerHeight - 12;
      var top = below ? r.bottom + gap : r.top - gap - hgt;
      var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
      card.style.top = Math.round(top) + 'px'; card.style.left = Math.round(left) + 'px';
      card.classList.toggle('ob-tour--above', !below);
      var ar = card.querySelector('.ob-tour__arrow'); ar.style.left = Math.round(Math.min(Math.max(18, r.left + r.width / 2 - left), w - 18)) + 'px';
    }
    function close() { card.classList.remove('show'); if (cur) cur.classList.remove('ob-tour-target'); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); document.removeEventListener('keydown', keys); setTimeout(function () { card.remove(); }, 180); }
    function keys(e) { if (e.key === 'Escape') close(); else if ((e.key === 'ArrowRight' || e.key === 'Enter') && e.target.closest('.ob-tour')) { e.preventDefault(); card.querySelector('.ob-tour__next').click(); } else if (e.key === 'ArrowLeft' && i > 0) { i--; render(); } }
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true); document.addEventListener('keydown', keys);
    /* typing a term and pressing Enter completes step one */
    var inp = opts.enterEl = opts.enterEl || document.getElementById('feeds_v2-search_keyword_input');
    function onEnter(e) { if (e.key === 'Enter' && i === 0 && document.body.contains(card)) { setTimeout(function () { if (i === 0) { i = 1; render(); } }, 350); } }
    if (inp) inp.addEventListener('keydown', onEnter);
    /* adding a filter in the Filters window and closing it completes step two */
    var fm = document.getElementById('filterModal'), fmWasOpen = false, fmObs = null;
    if (fm && STEPS.length > 2) {
      fmObs = new MutationObserver(function () {
        var open = fm.classList.contains('show');
        if (open) { fmWasOpen = true; return; }
        if (!fmWasOpen) return; fmWasOpen = false;
        if (!document.body.contains(card) || i !== 1) return;
        var n = document.getElementById('l2FiltersCount'); if (n && n.textContent.trim()) setTimeout(function () { if (i === 1 && document.body.contains(card)) { i = 2; render(); } }, 250);
      });
      fmObs.observe(fm, { attributes: true, attributeFilter: ['class'] });
      var closeOrig = close; close = function () { if (fmObs) fmObs.disconnect(); closeOrig(); };
    }
    render();
  }

  if (page === 'build2') {
    window.addEventListener('load', function () {
      var sel = document.getElementById('topicSelected'), lbl = document.getElementById('topicSelectedLabel'), btn = document.getElementById('topicSelect');
      if (!sel) return;
      sel.innerHTML = '<div class="topic-pick"><span>' + topic[0] + '</span><span>' + esc(topic[1]) + '</span></div>';
      sel.classList.remove('d-none'); lbl.classList.remove('d-none'); btn.classList.add('d-none');
      /* a fresh feed: no sample keyword or stakeholders */
      document.querySelectorAll('#keywordRows .keyword-row').forEach(function (r, i) { if (i > 0) r.remove(); else { r.querySelector('input').value = ''; var ty = r.querySelector('.keyword-input__type'); if (ty) ty.textContent = ''; } });
      document.querySelectorAll('#stakeholderRows .stakeholder-row').forEach(function (r) { r.remove(); });
      if (window.buildFeedUpdate) window.buildFeedUpdate();
      if (window.buildSyncPlaceholders) window.buildSyncPlaceholders();
      var kw = document.querySelector('#keywordRows .keyword-row input'), sec = kw && kw.closest('.setup-section');
      setTimeout(function () {
        if (sec) { if (window.l2Glide) window.l2Glide(sec, 'start', 1300); else sec.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        setTimeout(function () {
          if (toured) { if (kw) kw.focus({ preventScroll: true }); return; }
          showTip([
            { target: function () { return document.querySelector('#keywordRows .keyword-row .keyword-input'); }, title: 'Add your search terms', text: 'Add the words and phrases you want to track, one per line.' },
            { target: '.build-feed__head', title: 'Your feed updates as you go', text: 'Results re-order and narrow as you refine your terms and filters. Create the feed when it looks right.' }
          ], { enterEl: kw });
          if (kw) kw.focus({ preventScroll: true });
        }, 1350);
      }, 1100);
    });
  }
})();
