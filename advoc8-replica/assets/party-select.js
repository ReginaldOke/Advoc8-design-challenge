/* Filters modal multi-selects: "Select parties" (flat list) and "Select specific stakeholders, lists or sources" (grouped, with roles). Click or type to see the list, pick to add a token, remove with the × or Backspace. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var PARTIES = ['Australian Labor Party', 'Liberal Party', 'Liberal National Party', 'The Greens', 'The Nationals', 'Independent', 'One Nation', 'Katter’s Australian Party', 'Centre Alliance', 'Jacqui Lambie Network', 'Country Liberal Party', 'Animal Justice Party', 'Shooters, Fishers and Farmers'];
  var STAKE = [
    { name: 'People', icon: 'user', items: [
      ['Jeff Bourman', 'Member of the VIC Legislative Council for Eastern Victoria | VIC'], ['Lee Tarlamis', 'Government Whip in the Legislative Council | VIC'],
      ['Sonja Terpstra', 'Member of the VIC Legislative Council for North Eastern Metropolitan | VIC'], ['Darren Cheeseman', 'Member for South Barwon | VIC'],
      ['Chris Bowen', 'Minister for Climate Change and Energy | Federal'], ['Anthony Albanese', 'Prime Minister | Federal'], ['Amber-Jade Sanderson', 'Minister for Energy and Decarbonisation | WA'],
      ['Josh Wilson', 'Assistant Minister for Climate Change and Energy | Federal'], ['Penny Wong', 'Minister for Foreign Affairs | Federal'], ['Jim Chalmers', 'Treasurer | Federal'],
      ['Chris Minns', 'Premier | NSW'], ['David Crisafulli', 'Premier | QLD'], ['Malcolm Roberts', 'Senator for Queensland | Federal'] ] },
    { name: 'Organisations', icon: 'sitemap', items: [
      ['Climate Change Authority', 'Agency | Federal'], ['Smart Energy Council', 'Peak Body'], ['Solar Citizens', 'Peak Body'], ['Institute of Public Affairs', 'Peak Body'],
      ['Department of Climate Change, Energy, the Environment and Water', 'Department | Federal'], ['Australian Energy Market Operator', 'Agency | Federal'] ] },
    { name: 'Lists', icon: 'list', items: [ ['Energy ministers', 'Your list · 9 people'], ['NSW crossbench', 'Your list · 14 people'], ['Renewables peak bodies', 'Shared list · 6 organisations'] ] },
    { name: 'Sources', icon: 'news', items: [ ['ABC News', 'Media source'], ['The Australian', 'Media source'], ['RenewEconomy', 'Media source'], ['The Guardian Australia', 'Media source'] ] }
  ];
  var ICON = { user: 'fal fa-user', sitemap: 'fal fa-sitemap', list: 'fal fa-list', news: 'fal fa-newspaper' };
  document.querySelectorAll('.select2-selection--multiple').forEach(function (sel) {
    var grouped = !!sel.closest('#stakeholders');
    var label = sel.closest('.form-group') && sel.closest('.form-group').querySelector('label');
    if (grouped && label) label.textContent = 'Select specific stakeholders, lists or sources';
    var input = sel.querySelector('.select2-search__field'), list = sel.querySelector('.select2-selection__rendered'), searchLi = input.closest('li');
    var container = sel.closest('.select2-container'); if (!container) return;
    var chosen = [], drop = null, hi = 0;
    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function options() {
      var q = input.value.trim().toLowerCase();
      if (!grouped) return PARTIES.filter(function (p) { return chosen.indexOf(p) === -1 && (!q || p.toLowerCase().indexOf(q) !== -1); }).map(function (p) { return { v: p }; });
      var out = [];
      STAKE.forEach(function (g) { g.items.forEach(function (it) { if (chosen.indexOf(it[0]) === -1 && (!q || (it[0] + ' ' + it[1]).toLowerCase().indexOf(q) !== -1)) out.push({ v: it[0], s: it[1], g: g.name, icon: g.icon }); }); });
      return out;
    }
    function render() {
      if (!drop) return;
      var opts = options(); hi = Math.min(hi, Math.max(0, opts.length - 1));
      var html = '', lastGroup = null;
      opts.forEach(function (o, i) {
        if (grouped && o.g !== lastGroup) { html += '<li class="select2-results__group">' + esc(o.g) + '</li>'; lastGroup = o.g; }
        html += '<li class="select2-results__option' + (i === hi ? ' select2-results__option--highlighted' : '') + (grouped ? ' select2-results__option--rich' : '') + '" role="option" data-v="' + esc(o.v) + '">' +
          (grouped ? '<i class="' + ICON[o.icon] + ' fa-fw"></i><span class="opt-txt"><span class="opt-t">' + esc(o.v) + '</span><span class="opt-s">' + esc(o.s) + '</span></span>' : esc(o.v)) + '</li>';
      });
      drop.querySelector('.select2-results__options').innerHTML = html || '<li class="select2-results__option select2-results__message">' + (grouped ? 'No stakeholders, lists or sources found' : 'No parties found') + '</li>';
    }
    function open() {
      if (drop) { render(); return; }
      drop = document.createElement('span'); drop.className = 'select2-container select2-container--default select2-container--open l2-partydrop';
      drop.innerHTML = '<span class="select2-dropdown select2-dropdown--below"><span class="select2-results"><ul class="select2-results__options" role="listbox"></ul></span></span>';
      document.body.appendChild(drop); container.classList.add('select2-container--open', 'select2-container--focus'); place(); render();
      window.addEventListener('scroll', place, true); window.addEventListener('resize', place);
      drop.addEventListener('mousedown', function (e) { e.preventDefault(); var li = e.target.closest('[data-v]'); if (li) pick(li.dataset.v); });
      drop.addEventListener('mousemove', function (e) { var li = e.target.closest('[data-v]'); if (li) { var k = options().map(function (o) { return o.v; }).indexOf(li.dataset.v); if (k !== hi) { hi = k; render(); } } });
    }
    function place() { if (!drop) return; var r = sel.getBoundingClientRect(); drop.style.top = Math.round(r.bottom + 6) + 'px'; drop.style.left = Math.round(r.left) + 'px'; drop.style.width = Math.round(r.width) + 'px'; }
    function close() { if (drop) { drop.remove(); drop = null; window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); } container.classList.remove('select2-container--open', 'select2-container--focus'); }
    function pick(p) {
      chosen.push(p);
      var li = document.createElement('li'); li.className = 'select2-selection__choice'; li.title = p;
      li.innerHTML = '<span class="select2-selection__choice__remove" role="presentation">&#215;</span>' + esc(p);
      li.querySelector('.select2-selection__choice__remove').addEventListener('mousedown', function (e) { e.preventDefault(); e.stopPropagation(); remove(p, li); });
      list.insertBefore(li, searchLi); input.value = ''; hi = 0; render(); sync();
    }
    function remove(p, li) { chosen = chosen.filter(function (x) { return x !== p; }); li.remove(); sync(); if (drop) render(); }
    function sync() { container.dataset.selected = chosen.join('|'); document.dispatchEvent(new CustomEvent('l2-select', { detail: { kind: grouped ? 'stakeholders' : 'parties', chosen: chosen.slice() } })); }
    /* small API so other parts of the page (chart Add to Filters, Reset feed) can add or clear tokens */
    window.l2Select = window.l2Select || {};
    window.l2Select[grouped ? 'stakeholders' : 'parties'] = {
      pick: function (p) { if (chosen.indexOf(p) === -1) pick(p); },
      remove: function (p) { var li = [].slice.call(list.querySelectorAll('.select2-selection__choice')).filter(function (x) { return x.title === p; })[0]; if (li) remove(p, li); },
      clear: function () { chosen.slice().forEach(function (p) { window.l2Select[grouped ? 'stakeholders' : 'parties'].remove(p); }); },
      chosen: function () { return chosen.slice(); }
    };
    input.addEventListener('focus', open); input.addEventListener('click', open); sel.addEventListener('mousedown', function (e) { if (e.target === input || e.target.closest('.select2-selection__choice__remove')) return; e.preventDefault(); input.focus(); });
    input.addEventListener('input', function () { hi = 0; open(); });
    input.addEventListener('keydown', function (e) {
      var opts = options();
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); hi = Math.min(hi + 1, opts.length - 1); render(); var on = drop && drop.querySelector('.select2-results__option--highlighted'); if (on) on.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(hi - 1, 0); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (drop && opts[hi]) pick(opts[hi].v); }
      else if (e.key === 'Backspace' && !input.value && chosen.length) { var last = list.querySelectorAll('.select2-selection__choice'); remove(chosen[chosen.length - 1], last[last.length - 1]); }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
  });
})();
