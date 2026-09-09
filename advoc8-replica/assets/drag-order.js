/* Drag to reorder (redesign): feed cards on Your Feeds, the feeds list and the saved item labels in the side panel.
   Pointer based, vertical, with FLIP animation for the items that move out of the way. Order is remembered per list. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var EASE = 'cubic-bezier(.2,.8,.2,1)';
  function key(el) { return (el.querySelector('.text-nowrap, .card-title, .stretched-link, .fe-name, h3, h4') || el).textContent.replace(/\s+/g, ' ').trim(); }
  function setup(container, itemSel, storeKey, opts) {
    if (!container) return;
    opts = opts || {};
    var items = function () { return [].slice.call(container.querySelectorAll(itemSel)).filter(function (i) { return !opts.skip || !opts.skip(i); }); };
    /* restore a remembered order: remembered items first in that order, anything new after them, fixed items (like View all) stay put */
    try {
      var saved = JSON.parse(localStorage.getItem(storeKey) || 'null');
      if (saved && saved.length) {
        var list = items(), byKey = {}; list.forEach(function (i) { byKey[key(i)] = i; });
        var order = saved.map(function (k) { return byKey[k]; }).filter(Boolean).concat(list.filter(function (i) { return saved.indexOf(key(i)) === -1; }));
        var anchor = list[list.length - 1].nextElementSibling;
        order.forEach(function (i) { container.insertBefore(i, anchor); });
      }
    } catch (e) {}
    var drag = null;
    container.addEventListener('dragstart', function (e) { e.preventDefault(); }); /* links would otherwise start a native drag and steal the pointer */
    items().forEach(function (i) { i.setAttribute('draggable', 'false'); i.querySelectorAll('a, img').forEach(function (x) { x.setAttribute('draggable', 'false'); }); });
    container.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var item = e.target.closest(itemSel); if (!item || item.parentNode !== container) return;
      item.setAttribute('draggable', 'false');
      if (opts.skip && opts.skip(item)) return;
      if (e.target.closest('button, input, .x, .badge, .dropdown, .clear')) return;
      drag = { item: item, startX: e.clientX, startY: e.clientY, active: false, id: e.pointerId };
      var r = item.getBoundingClientRect(); drag.grab = e.clientY - r.top; drag.height = r.height;
    });
    document.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.startY, dx = e.clientX - drag.startX;
      if (!drag.active) { if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return; if (Math.abs(dx) > Math.abs(dy) * 1.5) { drag = null; return; } start(e); }
      e.preventDefault(); move(e);
    }, { passive: false });
    document.addEventListener('pointerup', end); document.addEventListener('pointercancel', end);
    function start(e) {
      drag.active = true; var it = drag.item;
      try { it.setPointerCapture(drag.id); } catch (err) {}
      it.classList.add('is-dragging'); container.classList.add('is-reordering');
      drag.placeholderTop = it.getBoundingClientRect().top;
      it.style.transition = 'none'; it.style.zIndex = '20'; it.style.position = 'relative'; it.style.willChange = 'transform';
      document.body.classList.add('l2-dragging');
    }
    function move(e) {
      var it = drag.item, list = items();
      var rect = it.getBoundingClientRect();
      var y = e.clientY - drag.grab;                      /* where the top of the card wants to be */
      var slotTop = rect.top - getTranslate(it);         /* its layout slot */
      it.style.transform = 'translateY(' + (y - slotTop) + 'px) scale(1.02)';
      /* find the item whose middle the pointer has crossed */
      var idx = list.indexOf(it), target = idx;
      list.forEach(function (o, i) { if (o === it) return; var r = o.getBoundingClientRect(); var mid = r.top + r.height / 2; if (i < idx && e.clientY < mid) target = Math.min(target, i); if (i > idx && e.clientY > mid) target = Math.max(target, i); });
      if (target !== idx) reorder(it, list, target);
    }
    function getTranslate(el) { var m = /translateY\((-?[\d.]+)px\)/.exec(el.style.transform || ''); return m ? parseFloat(m[1]) : 0; }
    function reorder(it, list, target) {
      var before = {}; list.forEach(function (o) { if (o !== it) before[key(o)] = o.getBoundingClientRect().top; });
      var ref = list[target];
      if (target > list.indexOf(it)) container.insertBefore(it, ref.nextSibling); else container.insertBefore(it, ref);
      /* the item follows the pointer: keep its visual position while its slot moves */
      var itRect = it.getBoundingClientRect(); var wanted = drag.lastY !== undefined ? drag.lastY : itRect.top;
      list.forEach(function (o) {
        if (o === it) return;
        var now = o.getBoundingClientRect().top, was = before[key(o)]; var d = was - now; if (!d) return;
        o.style.transition = 'none'; o.style.transform = 'translateY(' + d + 'px)';
        requestAnimationFrame(function () { o.style.transition = 'transform .28s ' + EASE; o.style.transform = ''; });
      });
    }
    function end(e) {
      if (!drag) return; if (e && e.pointerId !== drag.id) return;
      var it = drag.item, was = drag.active; var d = drag; drag = null;
      if (!was) return;
      it.style.transition = 'transform .26s ' + EASE; it.style.transform = '';
      setTimeout(function () { it.style.transition = ''; it.style.zIndex = ''; it.style.position = ''; it.style.willChange = ''; it.classList.remove('is-dragging'); container.classList.remove('is-reordering'); document.body.classList.remove('l2-dragging'); }, 280);
      /* a real drag should not also count as a click */
      var cancel = function (ev) { ev.preventDefault(); ev.stopPropagation(); }; it.addEventListener('click', cancel, true); setTimeout(function () { it.removeEventListener('click', cancel, true); }, 50);
      try { localStorage.setItem(storeKey, JSON.stringify(items().map(key))); } catch (err) {}
    }
    container.classList.add('l2-sortable');
  }
  function railSetup() { var r = document.querySelector('.l3rail__nav'); if (r && !r.classList.contains('l2-sortable')) setup(r, '.l3rail__item', 'advoc8-order-rail'); }
  railSetup(); document.addEventListener('DOMContentLoaded', railSetup); window.addEventListener('load', railSetup);
  setup(document.getElementById('feedList'), '.list-group-item', 'advoc8-order-feeds');
  setup(document.getElementById('feeds_sidebar_collapse'), 'a.nav-link', 'advoc8-order-feednav', { skip: function (a) { return /View all/.test(a.textContent); } });
  setup(document.querySelector('#sidebar .saved-labels'), 'a.nav-link', 'advoc8-order-labels');
})();
