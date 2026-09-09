/* Layout A/B switch ("1" = Layout 1, "2" = Layout 2, same page) + Layout-2 link guard */
(function () {
  /* SINGLE_NAV_ENABLED=false: the single side nav (stored layout "3") is hidden and key 3 opens the rail and panel instead. Set true here, in proto-panel.js and in the head snippet of every *2.html to bring it back. */
  var SINGLE_NAV_ENABLED = false;
  window.ADVOC8_SINGLE_NAV = SINGLE_NAV_ENABLED;
  var MAP = { 'index': 'search2', 'people': 'people2', 'feeds': 'feeds2', 'saved': 'saved2', 'feed': 'feed2',
              'agenda': 'agenda2', 'posts': 'posts2', 'orgs': 'orgs2', 'person': 'person2', 'build': 'build2', 'alerts': 'alerts2' };
  var BACK = {}; Object.keys(MAP).forEach(function (k) { BACK[MAP[k]] = k; });
  function page() { var m = location.pathname.match(/([^/]*)\.html$/); return m ? m[1] : 'index'; }
  var isL2 = document.body && document.body.classList.contains('l2-body');

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, digit = /^[1-4]$/.test(e.key);
    /* 1 to 4 always switch prototypes, even inside a search box, and are never typed there */
    if (!digit && t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (digit) e.preventDefault();
    var p = page();
    if (e.key === '1') { var l1 = BACK[p] || (MAP[p] ? p : null); if (l1 && l1 !== p) location.href = l1 + '.html' + location.search; }
    else if (e.key === '2' || e.key === '3' || e.key === '4') { /* 2 = least change, 3 = single nav, 4 = rail and panel */
      var L = e.key; if (!SINGLE_NAV_ENABLED && L === '3') L = '4'; /* with the side nav hidden, 3 is the rail and panel */
      try { localStorage.setItem('advoc8-layout', L); } catch (err) {}
      var l2 = MAP[p] || (BACK[p] || isL2 ? p : null);
      if (l2 && l2 !== p) { location.href = l2 + '.html' + location.search; return; }
      if (isL2) location.reload(); /* the chrome is built at load, so switching re-opens the page */
    }
  });

  /* Collapsible navs: option 2 nav <-> icon rail; option 3 contextual panel <-> rail only. "[" toggles. */
  var root = document.documentElement;
  function store(k, v) { try { localStorage.setItem(k, v ? '1' : '0'); } catch (err) {} }
  function setNavCollapsed(v) {
    root.classList.toggle('nav-collapsed', v); store('advoc8-nav-collapsed', v); if (typeof syncRailLook === 'function') syncRailLook();
    document.querySelectorAll('.l2nav__item').forEach(function (a) {
      var label = a.querySelector('span') ? a.querySelector('span').textContent : '';
      if (v) a.setAttribute('data-tooltip', label); else a.removeAttribute('data-tooltip');
    });
    syncCollapseTooltips();
  }
  /* collapsed rail: picking a section opens the panel for it. The new page reads the stored state, so the panel is open on arrival */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.l3rail__item'); if (!a || !root.classList.contains('panel-collapsed')) return;
    store('advoc8-panel-collapsed', false);
    if (a.getAttribute('href') === (location.pathname.split('/').pop() || '')) { e.preventDefault(); setPanelCollapsed(false); } /* same section: just open it */
  });
  function setPanelCollapsed(v) { root.classList.toggle('panel-collapsed', v); store('advoc8-panel-collapsed', v); syncCollapseTooltips(); if (typeof syncRailLook === 'function') syncRailLook(); }
  var PANEL_SVG = '<svg class="panel-ico" viewBox="0 0 20 16" width="18" height="14" aria-hidden="true"><rect x="1" y="1" width="18" height="14" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.7"/><line x1="7.5" y1="1.5" x2="7.5" y2="14.5" stroke="currentColor" stroke-width="1.7"/></svg>';
  function mkBtn(cls, icon, label) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.setAttribute('aria-label', label); b.setAttribute('data-tooltip', label); b.innerHTML = '<i class="fas ' + icon + '"></i>'; return b; }
  function injectToggles() {
    var nav = document.getElementById('l2nav');
    if (nav && !nav.querySelector('.l2nav__toggle')) {
      var b = mkBtn('l2nav__toggle', 'fa-sidebar', 'Collapse sidebar'); b.innerHTML = PANEL_SVG;
      b.onclick = function () { setNavCollapsed(true); }; nav.appendChild(b);
      var brand = nav.querySelector('.l2nav__brand');
      if (brand && !brand.querySelector('.l2nav__brand-expand')) {
        var ex = document.createElement('span'); ex.className = 'l2nav__brand-expand'; ex.innerHTML = PANEL_SVG; brand.appendChild(ex);
        brand.addEventListener('click', function (e) { if (root.classList.contains('nav-collapsed')) { e.preventDefault(); setNavCollapsed(false); } });
      }
    }
    var sb = document.getElementById('sidebar'), head = sb && sb.querySelector(':scope > .m-3');
    if (head && !head.querySelector('.l3panel__toggle')) { var pb = mkBtn('l3panel__toggle', 'fa-sidebar', 'Collapse panel'); pb.innerHTML = PANEL_SVG; pb.removeAttribute('data-tooltip'); /* the rail and panel shows no tooltip on its collapse control */ pb.onclick = function () { setPanelCollapsed(true); }; head.appendChild(pb); }
    var logo = document.querySelector('.l3rail__logo');
    if (logo && !logo.querySelector('.l3rail__logo-expand')) {
      var lx = document.createElement('span'); lx.className = 'l3rail__logo-expand'; lx.innerHTML = PANEL_SVG; logo.appendChild(lx);
      logo.addEventListener('click', function (e) { if (root.classList.contains('panel-collapsed')) { e.preventDefault(); setPanelCollapsed(false); } });
    }
    syncCollapseTooltips();
  }
  function syncCollapseTooltips() {
    var brand = document.querySelector('.l2nav__brand'); if (brand) { if (root.classList.contains('nav-collapsed')) brand.setAttribute('data-tooltip', 'Expand sidebar'); else brand.removeAttribute('data-tooltip'); }
    var logo = document.querySelector('.l3rail__logo'); if (logo) logo.removeAttribute('data-tooltip'); /* no tooltip on the rail logo either */
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== '[' || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (root.classList.contains('lc')) return;
    if (root.classList.contains('l3')) setPanelCollapsed(!root.classList.contains('panel-collapsed'));
    else setNavCollapsed(!root.classList.contains('nav-collapsed'));
  });

  /* Option 3 rail theme: navy gradient or white (toggle top right, remembered) */
  function singleNav() { if (!SINGLE_NAV_ENABLED) return false; try { return localStorage.getItem('advoc8-layout') === '3'; } catch (err) { return false; } }
  function themePref() { var t = 'navy'; try { t = localStorage.getItem('advoc8-theme') || (localStorage.getItem('advoc8-rail-navy') === '0' ? 'white' : 'navy'); } catch (err) {} return (t === 'navy' && singleNav()) ? 'white' : t; /* the side nav has no navy option */ }
  function navyPref() { return themePref() !== 'white'; }
  /* the rail is dark only when a dark theme is on AND the panel beside it is open; with the panel collapsed it goes light so it fades into the background (dark mode keeps it dark) */
  function syncRailLook() {
    var t = themePref(), navy = (t === 'navy' && !root.classList.contains('panel-collapsed')) || t === 'dark';
    root.classList.toggle('rail-navy', navy);
    var logo = document.querySelector('.l3rail__logo img'); if (logo) logo.src = navy ? '/assets/logo-mark-light.svg?v=2' : '/assets/logo-circle-dark.svg?v=2';
    var b = document.querySelector('.l2nav__brand img'); if (b) b.src = t === 'dark' ? '/assets/logo-mark-light.svg?v=2' : '/assets/logo-circle-dark.svg?v=2'; /* side nav logo follows the theme */
  }
  function setTheme(t, persist) {
    if (persist !== false) { try { localStorage.setItem('advoc8-theme', t); } catch (err) {} store('advoc8-rail-navy', t === 'white' ? false : true); }
    root.classList.toggle('theme-navy', t === 'navy'); root.classList.toggle('theme-dark', t === 'dark'); syncRailLook();
    document.querySelectorAll('.rail-theme-toggle button').forEach(function (b) { b.classList.toggle('on', b.dataset.theme === t); });
  }
  function setRailTheme(navy) { setTheme(navy ? 'navy' : 'white'); }
  function injectRailThemeToggle() {
    if (document.querySelector('.rail-theme-toggle')) return;
    var t = document.createElement('div'); t.className = 'rail-theme-toggle'; t.setAttribute('role', 'group'); t.setAttribute('aria-label', 'Theme');
    t.innerHTML = '<button type="button" data-theme="white"><i class="far fa-sun"></i>Light</button><button type="button" data-theme="navy"><i class="far fa-droplet"></i>Navy</button><button type="button" data-theme="dark"><i class="far fa-moon"></i>Dark</button>';
    t.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setTheme(b.dataset.theme); });
    document.body.appendChild(t);
    setTheme(themePref(), false); /* apply the remembered theme without rewriting it */
  }

  /* Option 3 = Layout 2 pages with the double nav (compact icon rail + contextual panel) */
  /* Option 2 (least change): the original top bar and sidebar stay; the content area alone carries the redesign styles */
  function applyClassic() {
    root.classList.add('lc'); root.classList.remove('l3', 'theme-navy', 'theme-dark', 'rail-navy', 'nav-collapsed', 'panel-collapsed');
    var wrap = document.getElementById('wrap'), main = document.getElementById('main') || document.getElementById('main-standalone');
    if (wrap) wrap.classList.remove('l2-wrap');
    if (main) main.classList.add('l2-wrap');
    window.l2Classic = true;
    if (page() === 'person2') root.classList.add('lc-profile'); /* the profile takes the full width: no sidebar */
    /* the feeds group stays as in the original, without the View all Feeds link */
    document.querySelectorAll('#sidebar a').forEach(function (a) { if (/View all Feeds/i.test(a.textContent)) a.remove(); });
  }
  function applyVariant() {
    var L = '4'; try { L = localStorage.getItem('advoc8-layout') || '4'; } catch (err) {}
    if (L === '2') { applyClassic(); return; }
    var v3 = !SINGLE_NAV_ENABLED || L !== '3'; /* 3 = single nav, anything else = rail and panel */
    root.classList.toggle('no-navy', !v3); /* the side nav offers White and Dark only */
    document.documentElement.classList.toggle('l3', v3);
    if (v3 && !document.querySelector('.l3rail')) buildRail();
    injectToggles();
    injectRailThemeToggle(); /* side nav and rail and panel both take the theme toggle */
    if (root.classList.contains('nav-collapsed')) setNavCollapsed(true);
  }
  function buildRail() {
    var nav = document.getElementById('l2nav'); if (!nav) return;
    var rail = document.createElement('nav'); rail.className = 'l3rail'; rail.setAttribute('aria-label', 'Main');
    var brand = nav.querySelector('.l2nav__brand');
    var html = '<a class="l3rail__logo" href="' + (brand ? brand.getAttribute('href') : 'search2.html') + '" aria-label="Advoc8 Home"><img src="/assets/logo-circle-dark.svg?v=2" alt=""></a><div class="l3rail__nav">';
    nav.querySelectorAll('.l2nav__group').forEach(function (g) {
      var a = g.querySelector('.l2nav__item'), ico = a.querySelector('i.ico'), label = a.querySelector('span').textContent;
      html += '<a class="l3rail__item' + (g.classList.contains('active') ? ' active' : '') + '" href="' + a.getAttribute('href') + '"><i class="' + (ico ? ico.className.replace('ico', '').replace(/\bfar\b/, 'fal').trim() : '') + '"></i><span>' + label + '</span></a>';
    });
    html += '</div><div class="l3rail__bottom"><a class="l3rail__help" href="#" aria-label="Help"><i class="far fa-question-circle"></i></a>' +
            '<div class="avatar avatar-sm l3rail__avatar" aria-label="Your profile"><span class="avatar-title rounded-circle ob-initials">RO</span></div></div>';
    rail.innerHTML = html;
    nav.parentNode.insertBefore(rail, nav);
    wireRailMenus(rail);
  }
  /* Help and account menus open to the right of the rail, bottom-aligned with their button */
  function wireRailMenus(rail) {
    var MENUS = {
      help: '<a class="dropdown-item" href="#"><i class="fal fa-book fa-fw mr-2"></i>View the Help Centre</a><a class="dropdown-item" href="#"><i class="fal fa-message-lines fa-fw mr-2"></i>Chat with Advoc8 Support</a>',
      user: '<a class="dropdown-item" href="#">Files</a><a class="dropdown-item" href="#">Settings</a><div class="dropdown-divider"></div><a class="dropdown-item" href="#">Sign out</a>'
    };
    var open = null;
    function close() { if (open) { open.remove(); open = null; } rail.querySelectorAll('.is-open').forEach(function (b) { b.classList.remove('is-open'); }); }
    function toggle(btn, kind) {
      if (open && open.dataset.kind === kind) { close(); return; }
      close();
      var m = document.createElement('div'); m.className = 'l3rail__pop'; m.dataset.kind = kind; m.innerHTML = MENUS[kind];
      document.body.appendChild(m);
      var r = btn.getBoundingClientRect(), rr = rail.getBoundingClientRect();
      m.style.left = Math.round(r.right + 8) + 'px';
      m.style.top = Math.round(Math.max(12, r.bottom - m.offsetHeight)) + 'px';
      btn.classList.add('is-open'); open = m;
    }
    var help = rail.querySelector('.l3rail__help'), avatar = rail.querySelector('.l3rail__avatar');
    if (help) help.addEventListener('click', function (e) { e.preventDefault(); toggle(help, 'help'); });
    if (avatar) { avatar.setAttribute('role', 'button'); avatar.setAttribute('tabindex', '0'); avatar.addEventListener('click', function () { toggle(avatar, 'user'); }); }
    document.addEventListener('mousedown', function (e) { if (open && !e.target.closest('.l3rail__pop, .l3rail__help, .l3rail__avatar')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  if (!isL2) return;
  /* phones and tablets: a slim top bar with a menu button; the side nav slides in as a drawer (options C and D) */
  (function () {
    if (root.classList.contains('lc')) return;
    var bar = document.createElement('div'); bar.className = 'l2-mbar';
    bar.innerHTML = '<button type="button" class="l2-mbar__menu" aria-label="Menu"><i class="far fa-bars"></i></button><a class="l2-mbar__logo" href="search2.html"><img src="/assets/logo-circle-dark.svg?v=2" alt="">Advoc8</a><div class="avatar avatar-sm l2-mbar__avatar"><span class="avatar-title rounded-circle ob-initials">RO</span></div>';
    var scrim = document.createElement('div'); scrim.className = 'l2-mscrim';
    document.body.appendChild(bar); document.body.appendChild(scrim);
    function mobile() { return window.matchMedia('(max-width: 991.98px)').matches; }
    function sync() { bar.style.display = mobile() ? '' : 'none'; scrim.style.display = mobile() ? '' : 'none'; if (!mobile()) root.classList.remove('l2-drawer'); }
    sync(); window.addEventListener('resize', sync);
    bar.querySelector('.l2-mbar__menu').addEventListener('click', function () { root.classList.toggle('l2-drawer'); });
    scrim.addEventListener('click', function () { root.classList.remove('l2-drawer'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') root.classList.remove('l2-drawer'); });
    document.addEventListener('click', function (e) { if (mobile() && e.target.closest('.l2nav a[href]:not([href="#"])')) root.classList.remove('l2-drawer'); });
  })();
  /* saved item labels: a folder icon in place of the dot */
  (function () {
    document.querySelectorAll('#sidebar .saved-labels .nav-link').forEach(function (a) {
      if (a.querySelector('i')) return;
      var i = document.createElement('i'); i.className = 'fal fa-folder label-ico';
      a.insertBefore(i, a.firstChild); a.classList.add('has-ico');
    });
  })();
  applyVariant();
  /* a stakeholder profile (option B only): a back button beside the name returns to the list it was opened from */
  if (page() === 'person2' && root.classList.contains('lc')) {
    var prow = document.querySelector('#main .header .row');
    if (prow && !prow.querySelector('.l2-back')) {
      var pcol = document.createElement('div'); pcol.className = 'col-auto pr-0 l2-backcol';
      pcol.innerHTML = '<a class="btn btn-white l2-back" href="people2.html" aria-label="Back" data-tooltip="Back"><i class="far fa-arrow-left"></i></a>';
      prow.insertBefore(pcol, prow.firstChild);
      pcol.querySelector('.l2-back').addEventListener('click', function (e) {
        try { localStorage.setItem('advoc8-nav-collapsed', '0'); localStorage.setItem('advoc8-panel-collapsed', '0'); } catch (err) {} /* the nav folded to open the profile; unfold it on the way back */
        if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); }
      });
    }
  }
  /* rail and panel: the stakeholder links in the panel carry the same icons as the side nav's sub-items */
  (function () {
    if (!root.classList.contains('l3')) return;
    document.querySelectorAll('#sidebar .stake-links .nav-link[href]').forEach(function (a) {
      if (a.querySelector('i')) return;
      var src = document.querySelector('.l2nav__subitem[href="' + a.getAttribute('href') + '"] i.sub-ico'); if (!src) return;
      var i = document.createElement('i'); i.className = src.className.replace('sub-ico', 'stake-ico');
      a.insertBefore(i, a.firstChild); a.classList.add('has-ico');
    });
  })();

  /* Never leave Layout 2: rewrite any Layout-1 target, including ones shared scripts render later */
  var RE = /^(?:\.\/)?(index|people|feeds|saved|feed|agenda|posts|orgs|person|build|alerts)\.html((?:[?#].*)?)$/;
  function fix(el, attr) {
    if (el.hasAttribute('data-allow-l1')) return; /* prototype switcher may cross layouts */
    var v = el.getAttribute(attr); if (!v) return;
    var m = v.match(RE); if (m) el.setAttribute(attr, MAP[m[1]] + '.html' + m[2]);
  }
  function sweep(root) {
    (root.querySelectorAll ? root.querySelectorAll('a[href], form[action]') : []).forEach(function (el) { fix(el, el.tagName === 'FORM' ? 'action' : 'href'); });
    if (root.matches && root.matches('a[href], form[action]')) fix(root, root.tagName === 'FORM' ? 'action' : 'href');
  }
  sweep(document);
  new MutationObserver(function (muts) { muts.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) sweep(n); }); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', function (e) { var a = e.target.closest('a[href]'); if (a) fix(a, 'href'); }, true);
  document.addEventListener('submit', function (e) { if (e.target.tagName === 'FORM') fix(e.target, 'action'); }, true);

  /* Nav: mark the current sub-item, toggle groups via the chevron */
  function key(file, search) { var m = (search || '').match(/[?&]segment=([^&#]*)/); return file + (m ? '?segment=' + m[1] : ''); }
  var here = key(location.pathname.split('/').pop(), location.search);
  document.querySelectorAll('.l2nav__subitem[href]').forEach(function (a) {
    var h = a.getAttribute('href'); if (h === '#') return;
    var parts = h.split('?'); if (key(parts[0], parts[1] ? '?' + parts[1] : '') === here) a.classList.add('active');
  });
  /* side nav (option C): feeds nest under Your Feeds and labels under Saved Items, each with a count and a chevron that folds them in place */
  (function () {
    if (root.classList.contains('lc')) return;
    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function nestUnder(link, items, count, key, label) {
      if (!link || link.querySelector('.l2nav__subchev') || !items.length) return null;
      var nest = document.createElement('div'); nest.className = 'l2nav__nest';
      items.forEach(function (a) { nest.appendChild(a); });
      link.insertAdjacentHTML('beforeend', '<span class="l2nav__count">' + count + '</span><i class="fas fa-chevron-down l2nav__subchev" role="button" aria-label="' + label + '" tabindex="0"></i>');
      link.insertAdjacentElement('afterend', nest);
      var chev = link.querySelector('.l2nav__subchev');
      var pref = null; try { pref = localStorage.getItem(key); } catch (err) {}
      var auto = link.classList.contains('active') || !!nest.querySelector('.active');
      function setOpen(o) { link.classList.toggle('is-open', o); chev.setAttribute('aria-expanded', o); }
      setOpen(pref === null ? auto : pref === '1' || auto);
      function toggle(e) { e.preventDefault(); e.stopPropagation(); var o = !link.classList.contains('is-open'); setOpen(o); try { localStorage.setItem(key, o ? '1' : '0'); } catch (err) {} }
      chev.addEventListener('click', toggle);
      chev.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') toggle(e); });
      link.addEventListener('click', function (e) { if (e.target.closest('.l2nav__subchev')) return; if (link.classList.contains('active')) toggle(e); });
      return nest;
    }
    /* feeds */
    var yf = document.querySelector('.l2nav__subitem[href="feeds2.html"]:not(.l2nav__subitem--link)');
    if (yf) {
      var sub = yf.parentNode, feeds = [].slice.call(sub.querySelectorAll('.l2nav__subitem[href^="feed"]')).filter(function (a) { return a !== yf && !/^feeds2/.test(a.getAttribute('href')); });
      sub.querySelectorAll('.l2nav__subcaption, .l2nav__subitem--link').forEach(function (x) { x.remove(); });
      window.l2FeedsNest = nestUnder(yf, feeds, feeds.length, 'advoc8-yourfeeds-open', 'Show or hide feeds');
    }
    /* saved item labels, mirrored from the page's own label list */
    var sv = document.querySelector('.l2nav__subitem[href="saved2.html"]');
    var labels = [].slice.call(document.querySelectorAll('#sidebar .saved-labels .nav-link'));
    if (sv && labels.length) {
      var cur = location.pathname.split('/').pop() + location.search;
      var items = labels.map(function (l) {
        var a = document.createElement('a'); a.className = 'l2nav__subitem' + (l.getAttribute('href') === cur ? ' active' : ''); a.href = l.getAttribute('href');
        var badge = l.querySelector('.badge'), name = [].slice.call(l.childNodes).filter(function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join('').trim();
        a.innerHTML = '<i class="fal fa-folder sub-ico"></i>' + esc(name) + (badge ? '<span class="l2nav__count">' + esc(badge.textContent.trim()) + '</span>' : '');
        return a;
      });
      var total = document.querySelector('#sidebar .saved-total'); total = total ? total.textContent.trim() : labels.length;
      if (items.some(function (a) { return a.classList.contains('active'); })) sv.classList.remove('active');
      nestUnder(sv, items, total, 'advoc8-saved-open', 'Show or hide labels');
    }
  })();
  document.addEventListener('click', function (e) {
    var chev = e.target.closest('.l2nav__chev');
    if (chev) { e.preventDefault(); e.stopPropagation(); chev.closest('.l2nav__group').classList.toggle('open'); return; }
    var item = e.target.closest('.l2nav__item');
    if (item) {
      var group = item.closest('.l2nav__group');
      if (group.querySelector('.l2nav__sub')) {
        if (group.classList.contains('open')) { e.preventDefault(); group.classList.remove('open'); }
        else if (group.classList.contains('active')) { e.preventDefault(); group.classList.add('open'); }
      }
    }
  });
})();

/* Chip popovers: if an open popover would run off the right edge of the screen, open it to the left instead */
(function () {
  function clamp(chip) {
    var pop = chip.querySelector('.l2-pop'); if (!pop) return;
    chip.classList.remove('l2-pop-right');
    var r = pop.getBoundingClientRect();
    if (r.right > window.innerWidth - 12) chip.classList.add('l2-pop-right');
  }
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      var t = m.target; if (!t.classList || !t.classList.contains('l2-fchip') || !t.classList.contains('open')) return;
      if (m.oldValue && /\bopen\b/.test(m.oldValue)) return; /* already open: this change is the clamp itself, do not loop */
      clamp(t);
    });
  }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['class'], attributeOldValue: true });
})();

/* Saved Items tab: when its labels are showing, clicking it again folds them instead of reloading the page */
document.addEventListener('click', function (e) {
  var a = e.target.closest('#sidebar .nav-link[href="saved2.html"].active');
  if (!a || !a.nextElementSibling || !a.nextElementSibling.classList.contains('saved-labels')) return;
  e.preventDefault(); a.classList.toggle('is-collapsed');
});

/* Opening a stakeholder profile: fold the panel first, then go, so the profile page opens already folded (no snap) */
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="person2.html"]'); if (!a || e.metaKey || e.ctrlKey || e.button !== 0) return;
  var root = document.documentElement; if (root.classList.contains('lc')) return;
  if (!root.classList.contains('l3')) { /* side nav (option C): fold the nav to its icon rail, then go */
    if (root.classList.contains('nav-collapsed')) return;
    e.preventDefault(); root.classList.add('nav-collapsed');
    try { localStorage.setItem('advoc8-nav-collapsed', '1'); } catch (err) {}
    var h2 = a.getAttribute('href'); setTimeout(function () { location.href = h2; }, 340); return;
  }
  if (root.classList.contains('panel-collapsed')) return;
  e.preventDefault();
  root.classList.add('panel-collapsed'); if (typeof syncRailLook === 'function') syncRailLook();
  var href = a.getAttribute('href'); setTimeout(function () { location.href = href; }, 340);
}, true);
