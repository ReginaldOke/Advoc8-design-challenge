/* Filters window (redesign): each section shows how many of its filters are applied, in the same small pill the chips use. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  var modal = document.getElementById('filterModal'); if (!modal) return;
  var HEADS = ['topics', 'jurisdictions', 'parties', 'stakeholders'];
  HEADS.forEach(function (k) {
    var h = document.getElementById(k + '-header'); if (!h || h.querySelector('.fm-count')) return;
    var b = document.createElement('span'); b.className = 'fm-count'; b.hidden = true; b.setAttribute('aria-label', 'filters applied');
    var chev = h.querySelector('.accordion-chevron');
    if (chev) h.insertBefore(b, chev); else h.appendChild(b);
  });
  function count(k) {
    if (k === 'topics') return modal.querySelectorAll('#topics-list input[id^="feeds_v2_topic_group_"]:checked, #topics-list input[id^="feeds_v2_topic_group_"]:indeterminate').length;
    if (k === 'jurisdictions') return modal.querySelectorAll('#jurisdictions input.btn-check:not([id^="select_all"]):checked').length;
    var sel = window.l2Select && window.l2Select[k];
    if (sel && sel.chosen) return sel.chosen().length;
    return modal.querySelectorAll('#' + k + ' .select2-selection__choice').length;
  }
  function sync() {
    HEADS.forEach(function (k) {
      var b = document.querySelector('#' + k + '-header .fm-count'); if (!b) return;
      var n = count(k); b.textContent = n; b.hidden = !n;
    });
  }
  var t; function later() { clearTimeout(t); t = setTimeout(sync, 40); }
  modal.addEventListener('change', later); modal.addEventListener('click', later);
  document.addEventListener('l2-select', later);
  document.addEventListener('click', later); /* chips removed outside the window clear their inputs */
  new MutationObserver(later).observe(modal, { attributes: true, attributeFilter: ['class'] });
  window.l2SyncFilterCounts = sync;
  sync();
})();
