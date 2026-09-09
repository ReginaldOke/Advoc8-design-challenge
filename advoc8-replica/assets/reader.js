/* Reader (redesign): the expand button on a card opens the item in a full-screen reading view with a comfortable column, the full text, Share and Save, and a clear way back. */
(function () {
  if (!document.body.classList.contains('l2-body')) return;
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var view = null, lastFocus = null;
  /* continuation copy so the reading view has a full piece to read; picked by what the item is about */
  function continuation(kind, title, who) {
    var t = (title || '').toLowerCase(), topic;
    if (/solar|batter|renewab|energy|electric|grid/.test(t)) topic = 'energy';
    else if (/farm|crop|grain|agri|water|drought|livestock|bird flu|wastewater/.test(t)) topic = 'agriculture';
    else if (/data cent|ai\b|digital|cyber|technology/.test(t)) topic = 'technology';
    else if (/health|hospital|care|patient|emergency/.test(t)) topic = 'health';
    else topic = 'general';
    var P = {
      energy: [
        'The announcement follows months of consultation with industry, community groups and state agencies. Officials say the changes are designed to bring down costs for households while keeping the network reliable through the transition.',
        'Installers and manufacturers have welcomed the certainty, noting that clear timelines allow them to plan investment and hiring. Consumer advocates want to see the fine print on eligibility, and have asked for a simple online tool so people can check what they qualify for before they commit.',
        'The next milestone is the release of guidance material in the coming weeks, followed by a review after the first twelve months. The review will look at uptake by region, the effect on peak demand and whether the program has reached renters and apartment residents as intended.',
        'Members on all sides used the debate to raise local examples, from community batteries in regional towns to schools that have cut their power bills. The Minister said the government would report back to the Parliament on progress before the end of the year.'
      ],
      agriculture: [
        'Growers have been asking for a clearer picture of the season ahead, and the figures released today go some way to providing it. Rainfall across the main growing regions was close to average, and soil moisture is holding up better than at the same point last year.',
        'Industry bodies say the outlook is encouraging but stress that input costs remain the biggest pressure on farm budgets. Fertiliser, fuel and freight are all running above their five-year averages, and margins are tight for smaller operations in particular.',
        'The department will update its forecast again after the winter crop is harvested. It has also flagged new biosecurity guidance for producers, following recent detections interstate, and is urging anyone who notices unusual signs in stock or crops to report them early.',
        'Local members welcomed the news and called for continued support for regional infrastructure, including road upgrades that would shorten the trip from farm gate to port for many producers.'
      ],
      technology: [
        'The proposal sets out how large facilities would be assessed, what they would need to disclose about their energy and water use, and how communities near proposed sites would be consulted. Submissions are open for six weeks.',
        'Operators say they support clear rules, provided approvals move at a pace that lets them keep up with demand. Several pointed to overseas examples where slow processes pushed investment to other markets.',
        'Community groups have focused on grid capacity and the risk of higher bills for nearby households. The paper acknowledges this and proposes that new facilities contribute to local network upgrades in proportion to their load.',
        'A working group made up of industry, unions, local government and energy market bodies will meet monthly, with a first progress report due early next year.'
      ],
      health: [
        'The report draws on data from every public hospital in the state and compares performance against the same period last year. It notes improvements in waiting times for the most urgent cases and flags areas where demand continues to outpace capacity.',
        'Clinicians interviewed for the report describe the pressures on emergency departments, particularly at weekends and during winter, and call for more community-based care so that fewer people need to present in the first place.',
        'The Minister said the findings would inform the next round of funding decisions and pointed to recruitment programs already under way. Opposition members argued that the measures announced so far do not go far enough for regional hospitals.',
        'The full dataset is available to researchers and the public, with the next update due in three months.'
      ],
      general: [
        'The statement sets out the background to the decision, the consultation that led to it and the steps that will follow over the coming months. Stakeholders have been invited to respond in writing and through a series of regional briefings.',
        'Reaction has been mixed. Supporters describe the move as overdue and practical, while critics question whether the timeline is realistic and have asked for more detail on costs and who will carry them.',
        'Further guidance is expected shortly, along with a dedicated contact point for questions from organisations affected by the change. Progress will be reported publicly at regular intervals.',
        'The matter is expected to return to the Parliament later in the session, when the relevant committee tables its findings.'
      ]
    };
    return P[topic].map(function (x) { return '<p>' + x + '</p>'; }).join('');
  }
  function open(card) {
    close();
    lastFocus = document.activeElement;
    var body = card.querySelector('.card-body') || card, pre = card.querySelector('.card-text.small, .small.card-text'), title = card.querySelector('.card-title, h3, .rd-title'), badges = card.querySelectorAll('.badge-soft-primary, .badge.badge-light, .badge-light');
    var kind = card.closest('[data-card-type]') ? card.closest('[data-card-type]').getAttribute('data-card-type') : '';
    var meta = card.querySelector('.text-muted.small, .small.text-muted, .card-body .text-muted'), author = card.querySelector('.text-gray-800.mb-2, .d-flex.align-items-center.flex-gap-2, .rd-author');
    var contentEl = [].slice.call(card.querySelectorAll('.card-body')).slice(-1)[0];
    var content = '';
    if (contentEl) { var clone = contentEl.cloneNode(true); clone.querySelectorAll('.hover-reveal__hidden, .badge-soft-primary, .btn, .dropdown').forEach(function (x) { x.remove(); }); content = clone.innerHTML; }
    /* posts without a headline use the author or organisation name as the title */
    var titleText, nameEl = null;
    if (title) titleText = title.textContent.trim();
    else { nameEl = card.querySelector('.text-gray-800 a, .text-gray-800 .font-weight-bold, .font-weight-bold'); if (nameEl) { var nc = nameEl.cloneNode(true); nc.querySelectorAll('.badge').forEach(function (x) { x.remove(); }); titleText = nc.textContent.replace(/\s+/g, ' ').trim(); } else titleText = 'Post'; }
    var head = ''; var top = card.querySelector('.border-bottom.card-body');
    if (top) {
      var hc = top.cloneNode(true); hc.querySelectorAll('.hover-reveal__hidden, .card-title, h3, .stretched-link').forEach(function (x) { x.remove(); });
      if (nameEl) hc.querySelectorAll('a, .font-weight-bold').forEach(function (x) { var xc = x.cloneNode(true); xc.querySelectorAll('.badge').forEach(function (b) { b.remove(); }); if (xc.textContent.replace(/\s+/g, ' ').trim() === titleText) { var frag = document.createDocumentFragment(); x.querySelectorAll('.badge').forEach(function (b) { frag.appendChild(b); }); x.replaceWith(frag); } });
      head = hc.innerHTML;
    }
    view = document.createElement('div'); view.className = 'rd'; view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', titleText);
    view.innerHTML = '<div class="rd__scrim"></div><div class="rd__scroll"><article class="rd__panel">' +
      '<header class="rd__bar"><button type="button" class="rd__back"><i class="far fa-arrow-left fa-fw"></i>Back</button><div class="rd__acts"><button type="button" class="btn btn-white btn-sm"><i class="far fa-share-from-square fa-fw mr-1"></i>Share</button><button type="button" class="btn btn-white btn-sm js-save-btn"><i class="fa-regular fa-bookmark fa-fw mr-1"></i> Save</button><button type="button" class="rd__close" aria-label="Close">&#215;</button></div></header>' +
      '<div class="rd__body">' + (pre ? '<p class="rd__pre">' + esc(pre.textContent.trim()) + '</p>' : '') + '<h1 class="rd__title">' + esc(titleText) + '</h1>' +
      '<div class="rd__head">' + head + '</div>' +
      '<div class="rd__content">' + content + continuation(kind, titleText) + '</div>' +
      (badges.length ? '<div class="rd__tags">' + [].map.call(badges, function (b) { return '<span class="badge badge-soft-primary">' + esc(b.textContent.trim()) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="rd__foot"><button type="button" class="btn btn-white rd__done"><i class="far fa-arrow-left fa-fw mr-2"></i>Back to results</button></div>' +
      '</div></article></div>';
    document.body.appendChild(view); document.body.classList.add('rd-open');
    requestAnimationFrame(function () { view.classList.add('show'); });
    view.querySelectorAll('.rd__back, .rd__close, .rd__done, .rd__scrim').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', onKey);
    setTimeout(function () { var c = view && view.querySelector('.rd__close'); if (c) c.focus(); }, 260);
  }
  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
  function close() { if (!view) return; var v = view; view = null; v.classList.remove('show'); document.body.classList.remove('rd-open'); document.removeEventListener('keydown', onKey); setTimeout(function () { v.remove(); }, 240); if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} } }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.js-expand-btn'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var card = b.closest('.card'); if (card) open(card);
  }, true);
  /* the reader's own title/expand clicks shouldn't re-open */
})();
