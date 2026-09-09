/* Topic picker (redesign): topics are pills you can multi-select. A topic with sub-topics opens a drill-in list with All subtopics and a Back button, so you can pick a few sub-topics and return to choose more topics. Writes to the original checkboxes so the rest of the page keeps working. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fire(el) { el.dispatchEvent(new Event('change', { bubbles: true })); }
  function setup(list) {
    if (!list || list.dataset.tp) return; list.dataset.tp = '1';
    var drill = document.createElement('div'); drill.className = 'tp-drill'; drill.hidden = true; list.parentNode.insertBefore(drill, list.nextSibling);
    var current = null;
    function groupName(g) { var lab = g.querySelector('.topic-group-header label'); return lab ? lab.textContent.replace(/\s+/g, ' ').trim().replace(/^\S+\s+/, function (m) { return /^[A-Za-z]/.test(m) ? m : ''; }) : ''; }
    function subs(g) { return [].slice.call(g.querySelectorAll('.js-topic-sub')); }
    function syncBadge(g) {
      var all = subs(g); if (!all.length) return;
      var n = all.filter(function (s) { return s.checked; }).length, cb = g.querySelector('.js-topic-group-cb');
      var b = g.querySelector('.tp-count'); if (!b) { b = document.createElement('span'); b.className = 'tp-count'; var lab = g.querySelector('.topic-group-header label'); lab.appendChild(b); }
      b.textContent = (n && n < all.length) ? n + '/' + all.length : ''; b.hidden = !(n && n < all.length);
      g.classList.toggle('is-on', cb.checked); g.classList.toggle('is-part', !cb.checked && n > 0);
    }
    function open(g) {
      current = g; var all = subs(g), img = g.querySelector('.topic-img'), name = groupName(g);
      drill.innerHTML = '<div class="tp-drill__head"><button type="button" class="tp-back" aria-label="Back to topics"><i class="far fa-chevron-left"></i></button>' + (img ? '<img class="topic-img" src="' + img.getAttribute('src') + '" alt="">' : '') + '<h4>' + esc(name) + '</h4><span class="tp-drill__n"></span></div>' +
        '<div class="tp-rows"><label class="tp-row tp-row--all"><input type="checkbox" class="tp-all"><span>All subtopics</span></label>' +
        all.map(function (s, i) { var lab = s.nextElementSibling ? s.nextElementSibling.textContent.trim() : s.value; return '<label class="tp-row"><input type="checkbox" data-i="' + i + '"' + (s.checked ? ' checked' : '') + '><span>' + esc(lab) + '</span></label>'; }).join('') + '</div>' +
        '<div class="tp-drill__foot"><button type="button" class="btn btn-white btn-sm tp-back2"><i class="far fa-chevron-left fa-fw mr-1"></i>Back to topics</button></div>';
      list.classList.add('is-drill'); drill.hidden = false; drill.classList.remove('show'); requestAnimationFrame(function () { drill.classList.add('show'); });
      syncAll(); drill.querySelector('.tp-back').focus();
    }
    function syncAll() {
      if (!current) return; var all = subs(current), rows = drill.querySelectorAll('.tp-row:not(.tp-row--all) input'), n = 0;
      rows.forEach(function (r, i) { r.checked = all[i].checked; if (r.checked) n++; });
      var master = drill.querySelector('.tp-all'); master.checked = n === all.length; master.indeterminate = n > 0 && n < all.length;
      drill.querySelector('.tp-drill__n').textContent = n ? n + ' of ' + all.length + ' selected' : 'None selected';
      syncBadge(current);
    }
    function close() { list.classList.remove('is-drill'); drill.classList.remove('show'); setTimeout(function () { drill.hidden = true; }, 160); var g = current; current = null; if (g) { var lab = g.querySelector('.topic-group-header label'); if (lab) lab.focus(); } }
    drill.addEventListener('change', function (e) {
      if (!current) return; var all = subs(current);
      if (e.target.classList.contains('tp-all')) { var on = e.target.checked; var cb = current.querySelector('.js-topic-group-cb'); cb.checked = on; cb.indeterminate = false; all.forEach(function (s) { s.checked = on; }); fire(cb); }
      else if (e.target.dataset.i !== undefined) { var s = all[+e.target.dataset.i]; s.checked = e.target.checked; fire(s); }
      syncAll();
    });
    drill.addEventListener('click', function (e) { if (e.target.closest('.tp-back, .tp-back2')) close(); });
    /* the chevron on a pill opens the drill; the label still toggles the whole topic */
    list.addEventListener('click', function (e) {
      var chev = e.target.closest('.topic-chevron'); if (!chev) return;
      e.preventDefault(); e.stopPropagation(); open(chev.closest('.topic-group'));
    }, true);
    list.addEventListener('change', function () { setTimeout(function () { list.querySelectorAll('.topic-group').forEach(syncBadge); }, 0); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) { e.stopPropagation(); close(); } }, true);
    list.querySelectorAll('.topic-group').forEach(syncBadge);
    new MutationObserver(function () { list.querySelectorAll('.topic-group').forEach(syncBadge); }).observe(list, { childList: true });
  }
  function init() { setup(document.getElementById('topics-list')); setup(document.getElementById('topics-list-setup')); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);
})();
