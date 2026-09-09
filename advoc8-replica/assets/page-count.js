/* Result counts beside the page title (redesign): "846 people", "13 items", "24 items". They follow the search and filters on each page. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var page = (location.pathname.match(/([^/]*)\.html$/) || [0, ''])[1];
  var h1 = document.querySelector('.l2-head h1, .header-title'); if (!h1 || document.getElementById('l2Count')) return;
  var out = document.createElement('span'); out.className = 'l2-count'; out.id = 'l2Count';
  var after = h1; /* the count sits right after the title; the week chevrons on Agenda follow the count */
  after.insertAdjacentElement('afterend', out);
  function show(n, label) { out.innerHTML = '<b>' + Number(n).toLocaleString('en-AU') + '</b> ' + label; }
  function visible(sel) { return [].slice.call(document.querySelectorAll(sel)).filter(function (e) { return !e.classList.contains('d-none') && e.offsetParent !== null; }).length; }
  var t; function later() { clearTimeout(t); t = setTimeout(function () { if (update) update(); }, 60); }
  var update = null;
  var mirror = document.querySelector('.action-bar .text-muted.small');
  if (mirror && /<b>/.test(mirror.innerHTML)) {
    /* stakeholder lists: the total comes from the live app; applied facets scale it by the share of the options ticked */
    update = function () {
      var m = mirror.textContent.replace(/\s+/g, ' ').trim().match(/^([\d,]+)\s+(.*)$/); if (!m) { out.textContent = mirror.textContent.trim(); return; }
      var total = parseInt(m[1].replace(/,/g, ''), 10), n = total;
      document.querySelectorAll('.facet-chip').forEach(function (chip) {
        var all = 0, on = 0, any = false;
        chip.querySelectorAll('label.opt').forEach(function (o) { var i = o.querySelector('input'), c = o.querySelector('.n'); var v = c ? parseInt(c.textContent.replace(/[^\d]/g, ''), 10) || 0 : 0; all += v; if (i && i.checked) { any = true; on += v; } });
        if (any && all > 0) n = n * (on / all);
      });
      show(Math.max(1, Math.round(n)), m[2]);
    };
    document.addEventListener('change', function (e) { if (e.target.closest('.facet-chip')) later(); });
    mirror.classList.add('l2-hidden');
    new MutationObserver(update).observe(mirror, { childList: true, subtree: true, characterData: true });
  } else if (page === 'saved2') {
    var sc = document.getElementById('savedCount');
    update = function () { var m = sc.textContent.match(/^(\d+)\s+(.*)$/); if (m) show(m[1], m[2]); };
    sc.classList.add('l2-hidden');
    new MutationObserver(update).observe(sc, { childList: true, characterData: true, subtree: true });
  } else if (page === 'feeds2') {
    update = function () { var n = visible('#feedList > *'); show(n, n === 1 ? 'feed' : 'feeds'); };
  } else if (/^feed/.test(page)) {
    update = function () { var n = document.querySelectorAll('#timeline-cards [data-card-type]:not(.d-none)').length; show(n, n === 1 ? 'item' : 'items'); };
  } else if (page === 'agenda2') {
    var h2 = [].slice.call(document.querySelectorAll('h2')).filter(function (e) { return /Key Events/.test(e.textContent); })[0];
    var card = null, node = h2; while (node && !card) { var sib = node.nextElementSibling; while (sib && !card) { if (sib.classList && sib.classList.contains('card')) card = sib; sib = sib.nextElementSibling; } node = node.parentElement; }
    if (card) update = function () { var n = [].slice.call(card.querySelectorAll('.list-group-item')).filter(function (e) { return !e.classList.contains('d-none') && e.offsetParent !== null; }).length; show(n, n === 1 ? 'day with events' : 'days with events'); };
  } else if (page === 'posts2') {
    update = function () { var n = visible('#main .card.card-sm'); show(n, n === 1 ? 'activity' : 'activities'); };
  }
  if (!update) { out.remove(); return; }
  new MutationObserver(later).observe(document.getElementById('main') || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', later); update();
})();
