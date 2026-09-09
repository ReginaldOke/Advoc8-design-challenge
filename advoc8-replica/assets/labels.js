/* Save on a card (redesign): opens a label picker. Tick a label to save the item under it; the button then shows the label. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var LABELS = ['solar panels', 'AI', 'biosecurity', 'agriculture', 'water', 'housing'];
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var pop = null, btn = null, chosen = null;
  function render() {
    var q = pop.querySelector('input[type=search]').value.trim(), ql = q.toLowerCase();
    var html = LABELS.filter(function (l) { return !ql || l.toLowerCase().indexOf(ql) !== -1; }).map(function (l) { return '<label class="opt"><input type="checkbox" value="' + esc(l) + '"' + (chosen.indexOf(l) !== -1 ? ' checked' : '') + '>' + esc(l) + '</label>'; }).join('');
    if (q && !LABELS.some(function (l) { return l.toLowerCase() === ql; })) html += '<button type="button" class="opt l2-labels__new" data-v="' + esc(q) + '"><i class="far fa-plus"></i>Create “' + esc(q) + '”</button>';
    if (!html) html = '<div class="l2-labels__none">No labels match</div>';
    pop.querySelector('.l2-labels__list').innerHTML = html;
  }
  function syncBtn(b) {
    var n = b._labels ? b._labels.length : 0;
    b.innerHTML = n ? '<i class="far fa-tag fa-fw mr-1"></i> ' + esc(b._labels[0]) + (n > 1 ? '<span class="l2-labels__more">+' + (n - 1) + '</span>' : '') : '<i class="fa-regular fa-bookmark fa-fw mr-1"></i> Save';
    b.classList.toggle('is-labelled', n > 0);
  }
  function place() { if (!pop || !btn) return; var r = btn.getBoundingClientRect(), w = pop.offsetWidth; pop.style.top = Math.round(r.bottom + 8) + 'px'; pop.style.left = Math.round(Math.max(8, Math.min(r.right - w, innerWidth - w - 8))) + 'px'; }
  function open(b) {
    close(); btn = b; chosen = b._labels = b._labels || [];
    pop = document.createElement('div'); pop.className = 'l2-pop l2-labels';
    pop.innerHTML = '<div class="l2-labels__search"><i class="far fa-search"></i><input type="search" placeholder="Add Labels…" aria-label="Add labels" autocomplete="off"></div><div class="l2-labels__list"></div>';
    document.body.appendChild(pop); render(); place();
    var card = b.closest('.hover-reveal'); if (card) card.classList.add('active');
    pop.addEventListener('change', function (e) { var i = e.target; if (i.type !== 'checkbox') return; if (i.checked) { if (chosen.indexOf(i.value) === -1) chosen.push(i.value); } else chosen = chosen.filter(function (x) { return x !== i.value; }); b._labels = chosen; syncBtn(b); place(); });
    pop.addEventListener('click', function (e) { var c = e.target.closest('.l2-labels__new'); if (!c) return; LABELS.unshift(c.dataset.v); chosen.push(c.dataset.v); b._labels = chosen; pop.querySelector('input[type=search]').value = ''; render(); syncBtn(b); place(); });
    pop.querySelector('input[type=search]').addEventListener('input', render);
    pop.querySelector('input[type=search]').addEventListener('keydown', function (e) { if (e.key === 'Enter') { var c = pop.querySelector('.l2-labels__new'); if (c) c.click(); e.preventDefault(); } });
    requestAnimationFrame(function () { pop.classList.add('show'); pop.querySelector('input').focus(); });
  }
  function close() { if (!pop) return; var p = pop, b = btn; pop = null; btn = null; p.classList.remove('show'); setTimeout(function () { p.remove(); }, 150); var card = b && b.closest('.hover-reveal'); if (card) card.classList.remove('active'); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.js-save-btn');
    if (b) { e.preventDefault(); e.stopPropagation(); if (btn === b) close(); else open(b); return; }
    if (pop && !pop.contains(e.target)) close();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  document.addEventListener('scroll', place, true); window.addEventListener('resize', place);
})();
