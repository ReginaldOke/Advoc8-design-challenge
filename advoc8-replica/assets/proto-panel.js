/* Prototype controls: bottom-right liquid-glass panel with an A/B switcher and a per-page design-changes log. */
(function () {
  var MAP = { 'index': 'search2', 'people': 'people2', 'feeds': 'feeds2', 'saved': 'saved2', 'feed': 'feed2', 'agenda': 'agenda2',
              'posts': 'posts2', 'orgs': 'orgs2', 'person': 'person2', 'build': 'build2', 'alerts': 'alerts2',
              'public-servants': 'public-servants2', 'councillors': 'councillors2', 'all-people': 'all-people2',
              'local-councils': 'local-councils2', 'interest-groups': 'interest-groups2', 'all-orgs': 'all-orgs2' };
  var BACK = {}; Object.keys(MAP).forEach(function (k) { BACK[MAP[k]] = k; });
  var page = (location.pathname.match(/([^/]*)\.html$/) || [0, 'index'])[1];
  if (!BACK[page] && /^feed-.*2$/.test(page)) BACK[page] = 'feed'; /* feed pages scraped for the redesign only */
  var isB = !!BACK[page];
  var base = isB ? BACK[page] : page;
  var l1 = MAP[base] ? base : 'index', l2 = MAP[base] || 'search2';

  var SINGLE_NAV = true; /* false hides the single side nav option (layout "3"); the rail and panel is then shown as C */
  var L = '4'; try { L = localStorage.getItem('advoc8-layout') || '4'; } catch (e) {}
  if (!SINGLE_NAV && L === '3') L = '4';
  var V = isB ? L : '1'; /* which prototype this page is showing: 1 original, 2 light touch, 3 side nav, 4 rail and panel */
  var GLOBAL_ALL = [
    ['2', 'The top bar and sidebar are unchanged. Only the page content is new.'],
    ['3', 'Navigation moved from the dark top bar to a side panel.'],
    ['4', 'Navigation moved from the dark top bar to a slim icon rail, with a panel for each section.'],
    ['3', 'The side panel can be collapsed to icons, and the choice is remembered.'],
    ['4', 'The rail and panel can be collapsed, and the choice is remembered.'],
    ['234', 'Every page has the same search bar and filter chips in the same place.'],
    ['234', 'A result count sits next to the page title and updates with the search and filters.'],
    ['34', 'One visual style across the app: rounded cards, light grey background, one icon set.'],
    ['34', 'Theme toggle: Light, Navy or Dark.'],
    ['234', 'Charts animate in and respond to hover.'],
    ['234', 'Topic lists use the same topic images as sign-up.'],
    ['234', 'Sign in and onboarding (press R): pick a topic, then research it or build a feed.'],
    ['234', 'Feeds and saved labels in the sidebar, and the feed cards on Your Feeds, can be dragged into a new order.'],
    ['34', 'The Maps tab was removed.']
  ];
  var GLOBAL = GLOBAL_ALL.filter(function (x) { return x[0].indexOf(V) !== -1; }).map(function (x) { return x[1]; });
  /* Each entry is text, or [prototypes it applies to, text]. 2 = light touch, 3 = side nav, 4 = rail and panel. */
  var LOGS = {
    'index': { name: 'Search', items: [
      'One search bar with the filters next to it.',
      'Advanced search opens under the search bar, for keywords or a boolean query.',
      'The empty search box suggests a phrase for the topic you chose at sign-up.',
      'Save as feed turns your search into a feed and opens it.',
      'A Sentiment chart shows how each search term is being talked about, week by week. Click a term in the key to hide or show it.',
      'The expand button on an item opens it in a full-screen reading view.',
      'A short tour introduces search, filters and saving a feed.'
    ]},
    'feeds': { name: 'Your Feeds', items: [
      'A search bar filters your feeds as you type.',
      ['34', 'Drag feeds into a new order, here or in the side panel.'],
      ['2', 'Drag feeds into a new order.']
    ]},
    'saved': { name: 'Saved Items', items: [
      'Labels sit in the sidebar under Saved Items. Click one to filter.',
      ['34', 'Click Saved Items again to fold the labels away.']
    ]},
    'feed': { name: 'Feed', items: [
      'The feed’s topic, keywords, sources and time frame are chips at the top of the page. Click one to change it.',
      'Search within the feed starts with the feed’s own terms. Add or remove one to narrow the results.',
      'Once you change something, a reset icon and a Save changes button appear at the top right.',
      'The Analysis tab has the same charts as Search.',
      'Hover a bar, party or stakeholder in a chart to view those items, or add them as a filter.',
      'A Sentiment chart at the bottom of Analysis tracks each search term week by week.',
      'Saving a feed opens the Schedule alerts panel. Close it and you can type a new name straight away.',
      'Edit Filters in the "..." menu opens the feed in the builder with everything filled in.'
    ]},
    'agenda': { name: 'Agenda', items: [
      'This Week shows the real sitting days, with today marked.',
      'A search bar covers inquiries, consultations and sitting days.',
      'The side cards are gone, so the list uses the full width.',
      'Week arrows sit next to the title. Subscribe to Calendar is the main button at the top right.'
    ]},
    'people': { name: 'Stakeholders', items: [
      'One search bar. Click it to see recently viewed people and organisations.',
      'Filters are chips above the list instead of a side panel.',
      'The list is one long scroll, with actions shown on hover.',
      'Photos for people, logos for organisations.',
      ['34', 'Each stakeholder group has its own page in the side panel.']
    ]},
    'person': { name: 'Stakeholders', items: [
      ['4', 'Opening a profile folds the side panel away so the page has the full width.'],
      'Profile photo in the header.'
    ]},
    'build': { name: 'Set up feed', items: [
      'The feed on the right updates as you go. Keywords re-order it; jurisdiction, stakeholders and sources narrow it.',
      'Arriving from sign-up lands you on the keywords with a short guide.',
      'The Schedule Alerts step is gone. Create feed opens the new feed with the alerts panel.',
      'Choose a topic uses the same topics window as Search.',
      'Stakeholders start empty. Click the search to pick from suggestions, or type a name.',
      'The first keyword box suggests a phrase for your topic. Enter moves you to the next term.'
    ]}
  };
  Object.keys(LOGS).forEach(function (k) { LOGS[k] = { name: LOGS[k].name, items: LOGS[k].items.filter(function (x) { return typeof x === 'string' || x[0].indexOf(V) !== -1; }).map(function (x) { return typeof x === 'string' ? x : x[1]; }) }; });

  ['public-servants', 'councillors', 'all-people', 'local-councils', 'interest-groups', 'all-orgs', 'orgs'].forEach(function (k) { LOGS[k] = LOGS['people']; });
  var log = LOGS[base] || { name: 'This page', items: [] };
  if (V === '1') { var NONE = 'No changes. The existing site was cloned with Claude.'; log = { name: log.name, items: [NONE] }; GLOBAL = [NONE]; } /* option A is the app as it is */

  var collapsed = false; try { collapsed = localStorage.getItem('advoc8-proto-collapsed') === '1'; } catch (e) {}

  function opt(letter, name, sub, href, layout, on) {
    return '<a class="proto__opt' + (on ? ' is-on' : '') + '"' + (layout ? ' data-layout="' + layout + '"' : ' data-allow-l1') + ' href="' + href + '"><span class="proto__letter">' + letter + '</span><span class="proto__name">' + name + '</span><span class="proto__sub">' + sub + '</span></a>';
  }
  var el = document.createElement('aside');
  el.className = 'proto' + (collapsed ? ' is-collapsed' : '');
  el.setAttribute('aria-label', 'Prototype controls');
  el.innerHTML =
    '<button type="button" class="proto__pill" aria-expanded="' + (!collapsed) + '"><span class="proto__pill-dot"></span>Prototype controls<i class="far fa-chevron-up"></i></button>' +
    '<div class="proto__inner">' +
      '<div class="proto__head"><span class="proto__title">Prototype controls</span><button type="button" class="proto__collapse" aria-label="Collapse"><i class="far fa-chevron-down"></i></button></div>' +
      '<div class="proto__section"><button type="button" class="proto__onb"' + (V === '1' ? ' hidden' : '') + '><i class="far fa-play"></i>See onboarding flow</button><div class="proto__theme"></div><div class="proto__switch">' +
        opt('A', 'Original', 'As the app is today', l1 + '.html' + location.search, null, V === '1') +
        opt('B', 'Light touch', 'Existing UI, improved UX', l2 + '.html' + location.search, '2', V === '2') +
        (SINGLE_NAV ? opt('C', 'Side nav', 'Single panel', l2 + '.html' + location.search, '3', V === '3') : '') +
        opt(SINGLE_NAV ? 'D' : 'C', 'Double nav', 'Partitioned panel', l2 + '.html' + location.search, '4', V === '4') +
      '</div></div>' +
      '<div class="proto__section proto__section--log"><details class="proto__more proto__more--page"><summary class="proto__label">Changes to this page <span class="proto__page">' + log.name + '</span><i class="far fa-chevron-down proto__more-chev"></i></summary>' +
        '<ol class="proto__list">' + log.items.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></details>' +
        '<details class="proto__more"><summary class="proto__label">Changes across all pages<i class="far fa-chevron-down proto__more-chev"></i></summary><ol class="proto__list">' + GLOBAL.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></details>' +
      '</div>' +
    '</div>';
  el.classList.add('proto--init');
  document.body.appendChild(el);
  requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('proto--init'); }); });
  if (collapsed) el.style.width = (function () { var probe = el.querySelector('.proto__pill').cloneNode(true); probe.style.cssText = 'position:absolute;visibility:hidden;display:inline-flex;height:42px;width:auto;padding:0 18px 0 16px;white-space:nowrap;'; document.body.appendChild(probe); var w = Math.ceil(probe.getBoundingClientRect().width) + 2; probe.remove(); return w + 'px'; })();

  var pillEl = el.querySelector('.proto__pill');
  function pillWidth() { /* measure the pill's natural width so the collapsed panel fits its text exactly */
    var probe = pillEl.cloneNode(true); probe.style.cssText = 'position:absolute;visibility:hidden;display:inline-flex;height:42px;width:auto;padding:0 18px 0 16px;white-space:nowrap;';
    document.body.appendChild(probe); var w = Math.ceil(probe.getBoundingClientRect().width) + 2; probe.remove(); return w;
  }
  function setCollapsed(v) {
    collapsed = v; el.classList.toggle('is-collapsed', v);
    el.style.width = v ? pillWidth() + 'px' : '';
    el.querySelector('.proto__pill').setAttribute('aria-expanded', !v);
    try { localStorage.setItem('advoc8-proto-collapsed', v ? '1' : '0'); } catch (e) {}
  }
  el.querySelector('.proto__collapse').addEventListener('click', function () { setCollapsed(true); });
  el.querySelector('.proto__pill').addEventListener('click', function () { setCollapsed(false); });

  /* fold the rail colour control into the panel when it exists */
  function adoptTheme() {
    var t = document.querySelector('.rail-theme-toggle'); var slot = el.querySelector('.proto__theme');
    if (t && slot && !slot.contains(t)) { slot.innerHTML = ''; slot.appendChild(t); t.classList.add('in-panel'); slot.style.display = ''; }
    else if (!t && slot) slot.style.display = 'none';
  }
  adoptTheme(); setTimeout(adoptTheme, 50);
  el.addEventListener('click', function (e) { var a = e.target.closest('.proto__opt[data-layout]'); if (a) { try { localStorage.setItem('advoc8-layout', a.dataset.layout); } catch (err) {} } });
  var onb = el.querySelector('.proto__onb');
  onb.addEventListener('click', function () { if (window.obShowSignIn) window.obShowSignIn(); else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', bubbles: true })); });
})();
