/* Stakeholder facets as filter chips (Layout 2 / option 3): builds one chip + popover per facet group
   from the page's #filter_panel, hides the panel, and filters the list client-side. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var panel = document.getElementById('filter_panel'), row = document.querySelector('.l2-searchrow');
  if (!panel || !row) return;
  var filtersChip = row.querySelector('.l2-fchip'); if (filtersChip) filtersChip.classList.add('l2-hidden'); /* keep in DOM: page scripts bind to #filtersToggle */
  panel.classList.add('l2-hidden');
  var PARTY = { 'Australian Labor Party': 'ALP', 'Liberal Party': 'LP', 'Liberal National Party': 'LNP', 'Independent': 'IND', 'The Greens': 'GRN', 'The Nationals': 'NAT', 'One Nation': 'ONP', 'Country Liberal Party': 'CLP' };
  var chips = [];
  function el(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function closeAll(except) { chips.forEach(function (c) { if (c !== except) { c.classList.remove('open'); c.querySelector('.l2-fbtn').setAttribute('aria-expanded', 'false'); } }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  panel.querySelectorAll('.facet-heading').forEach(function (h) {
    var title = h.textContent.trim(), list = h.nextElementSibling; if (!list) return;
    var opts = [].slice.call(list.querySelectorAll('.facet-btn')).map(function (b) {
      var lab = b.querySelector('.show-when-enabled'), n = b.querySelector('.badge');
      return { html: lab ? lab.innerHTML.trim() : b.textContent.trim(), text: lab ? lab.textContent.trim() : b.textContent.trim(), count: n ? n.textContent.trim() : '' };
    });
    if (!opts.length) return;
    var chip = el('div', 'l2-fchip facet-chip'); chip.dataset.facet = title;
    chip.innerHTML = '<button type="button" class="l2-fbtn" aria-haspopup="true" aria-expanded="false"><span class="val" data-ghost="' + esc(title) + '"><span>' + esc(title) + '</span></span><span class="badge text-secondary bg-secondary-soft badge-pill n"></span><i class="fas fa-chevron-down caret"></i></button>' +
      '<button type="button" class="clear" aria-label="Clear ' + esc(title) + '">&#215;</button>' +
      '<div class="l2-pop" role="menu" style="min-width: 280px;">' +
      opts.map(function (o, i) { return '<label class="opt"><input type="checkbox" value="' + esc(o.text) + '">' + '<span class="lab">' + o.html + '</span>' + (o.count ? '<span class="n">' + esc(o.count) + '</span>' : '') + '</label>'; }).join('') +
      '<div class="rule"></div><div class="pfoot"><span class="sel">0 selected</span><button type="button" class="clr">Clear</button></div></div>';
    row.appendChild(chip); chips.push(chip);
    var btn = chip.querySelector('.l2-fbtn');
    btn.onclick = function () { var o = chip.classList.toggle('open'); closeAll(chip); btn.setAttribute('aria-expanded', o); };
    function sync() {
      var on = [].slice.call(chip.querySelectorAll('input:checked'));
      chip.classList.toggle('active', on.length > 0);
      chip.querySelector('.n').textContent = on.length ? String(on.length) : '';
      chip.querySelector('.sel').textContent = on.length + ' selected';
      applyFilters();
    }
    chip.querySelectorAll('input').forEach(function (i) { i.addEventListener('change', sync); });
    chip.querySelector('.clr').onclick = function () { chip.querySelectorAll('input').forEach(function (i) { i.checked = false; }); sync(); };
    chip.querySelector('.clear').onclick = function (e) { e.stopPropagation(); chip.querySelectorAll('input').forEach(function (i) { i.checked = false; }); sync(); };
  });
  document.addEventListener('mousedown', function (e) { if (!e.target.closest('.facet-chip')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  function applyFilters() {
    var rows = document.querySelectorAll('#peopleList > li, #orgsTable tbody > tr'); if (!rows.length) return;
    var groups = chips.map(function (c) { return [].slice.call(c.querySelectorAll('input:checked')).map(function (i) { var v = i.value; return (PARTY[v] || v).toLowerCase(); }); }).filter(function (g) { return g.length; });
    rows.forEach(function (r) {
      var t = r.textContent.toLowerCase();
      var show = groups.every(function (g) { return g.some(function (v) { return t.indexOf(v) !== -1; }); });
      r.classList.toggle('d-none', !show);
    });
  }
})();
