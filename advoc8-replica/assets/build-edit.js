/* Feed builder (redesign): edit mode. Opened from a feed's "..." menu with ?edit=, the builder is filled in with that feed's topic, keywords, sources and stakeholders, and Save changes writes them back to the feed. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  if (!/[?&]edit=/.test(location.search)) return;
  var st = null; try { st = JSON.parse(localStorage.getItem('advoc8-edit-feed') || 'null'); } catch (e) {}
  if (!st) return;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* heading, footer and page title */
  var h1 = document.querySelector('.setup-title'); if (h1) h1.textContent = 'Edit feed';
  document.title = 'Edit ' + st.name + ' (Layout 2)';
  var cancel = document.querySelector('.setup-footer a.text-danger'); if (cancel) { cancel.textContent = 'Cancel'; cancel.href = st.back; }
  var create = document.getElementById('buildCreate'); if (create) { create.innerHTML = '<i class="far fa-check mr-2"></i>Save changes'; if (window.applyTablerIcons) window.applyTablerIcons(create); }

  function fillTopic() {
    if (!st.topic) return;
    var g = document.querySelector('.topic-group[data-name="' + st.topic + '"]'), emoji = g ? g.dataset.emoji : '';
    var sel = document.getElementById('topicSelected'), lbl = document.getElementById('topicSelectedLabel'), btn = document.getElementById('topicSelect');
    if (!sel) return;
    sel.innerHTML = '<div class="topic-pick"><span>' + emoji + '</span><span>' + esc(st.topic) + '</span></div>';
    sel.classList.remove('d-none'); if (lbl) lbl.classList.remove('d-none'); if (btn) btn.classList.add('d-none');
    var cb = g && g.querySelector('.js-topic-group-cb'); if (cb) cb.checked = true;
  }
  function fillKeywords() {
    var rows = document.getElementById('keywordRows'); if (!rows) return;
    rows.querySelectorAll('.keyword-row').forEach(function (r, i) { if (i > 0) r.remove(); });
    var first = rows.querySelector('input'); if (!first) return;
    first.value = ''; first.dispatchEvent(new Event('input', { bubbles: true }));
    (st.terms || []).forEach(function (t) {
      var inputs = rows.querySelectorAll('input'), target = [].slice.call(inputs).filter(function (i) { return !i.value.trim(); })[0];
      if (!target) return;
      target.value = t.text; target.dispatchEvent(new Event('input', { bubbles: true })); /* setup.js classifies it and adds the next empty row */
    });
  }
  function fillSources() {
    if (!st.sources || !window.buildSources) return;
    var on = {}; st.sources.forEach(function (x) { on[x.v] = !!x.on; });
    window.buildSources.set({ media: on.media !== false, parliament: on.parliament !== false, social: on.social !== false });
  }
  function fillStakeholders() {
    if (!window.buildAddStakeholder) return;
    (st.stakeholders || []).forEach(function (n) { window.buildAddStakeholder(n); });
  }
  function prefill() {
    fillTopic(); fillKeywords(); fillSources(); fillStakeholders();
    if (window.buildSyncPlaceholders) window.buildSyncPlaceholders();
    if (window.buildFeedUpdate) window.buildFeedUpdate();
  }
  if (document.readyState === 'complete') setTimeout(prefill, 0); else window.addEventListener('load', function () { setTimeout(prefill, 0); });

  /* Save changes: write the builder back onto the feed and return to it */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('#buildCreate'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var topic = (document.querySelector('#topicSelected .topic-pick span:last-child') || {}).textContent || '';
    var terms = [].slice.call(document.querySelectorAll('#keywordRows .keyword-row input')).map(function (i) { return i.value.trim(); }).filter(Boolean).map(function (t) { return { text: t, neg: false }; });
    var feed = null; try { feed = JSON.parse(localStorage.getItem(st.key) || 'null'); } catch (err) {}
    feed = feed || { name: st.name, match: 'any', date: st.date || 'Last 6 months' };
    feed.topic = topic ? topic.split(' › ')[0] : undefined;
    feed.terms = terms;
    var src = window.buildSources ? window.buildSources.get() : null;
    feed.sources = (st.sources || []).map(function (x) { var c = { v: x.v, label: x.label, on: x.on }; if (src && x.v in src) c.on = !!src[x.v]; return c; });
    feed.stakeholders = [].slice.call(document.querySelectorAll('#stakeholderRows .stakeholder-row .font-weight-bold')).map(function (el) { return el.textContent.trim(); });
    localStorage.setItem(st.key, JSON.stringify(feed));
    localStorage.removeItem('advoc8-edit-feed');
    try { localStorage.setItem('advoc8-feed-saved-toast', '1'); } catch (err) {}
    location.href = st.back;
  }, true);
})();
