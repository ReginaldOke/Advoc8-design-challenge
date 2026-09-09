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
  var KIND = { media: 'Media Release', parliament: 'Parliament', social: 'Social Media', other: 'Document' };
  var MONTHS = 'January February March April May June July August September October November December'.split(' ');
  function slug(n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function initials(n) { return n.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function domainFor(name, isOrg) { if (isOrg) return slug(name).replace(/-/g, '') + '.gov.au'; var p = name.split(/\s+/); return (p.length > 1 ? (p[0] + p[p.length - 1]) : p[0]).toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.au'; }
  function opener(kind, title, who) {
    if (kind === 'parliament') return 'The following is drawn from the official record of proceedings. Members spoke to the matter at length, and the exchange below has been lightly condensed for readability.';
    if (kind === 'social') return 'Posted this morning and already doing the rounds. The full thread, with replies from constituents and colleagues, is summarised here.';
    return 'Big news today. ' + (who ? who + ' has ' : 'The office has ') + 'released the following statement, reproduced here in full with the key points summarised above.';
  }
  function open(card) {
    close();
    lastFocus = document.activeElement;
    var kindKey = card.closest('[data-card-type]') ? card.closest('[data-card-type]').getAttribute('data-card-type') : 'media';
    var pre = card.querySelector('.card-text.small, .small.card-text'), title = card.querySelector('.card-title, h3, .rd-title');
    var metaEl = card.querySelector('.border-bottom.card-body > p.small.card-text.mb-0') || card.querySelector('.card-body .text-muted.small');
    var metaText = metaEl ? metaEl.textContent.replace(/\s+/g, ' ').trim() : '';
    var kindLabel = KIND[kindKey] || 'Document', dateText = '';
    var mm = metaText.match(/^(.*?)\s*[•·]\s*(.*)$/); if (mm) { if (mm[1] && !KIND[kindKey]) kindLabel = mm[1]; dateText = mm[2]; } else if (pre) dateText = pre.textContent.trim();
    if (dateText && !/\d{4}/.test(dateText)) dateText += ' ' + new Date().getFullYear();
    if (!dateText) { var d = new Date(); dateText = d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
    /* who it is from: the first author (name, party, jurisdiction, role) or the organisation */
    var who = null, nameEl = card.querySelector('.text-gray-800 h4.font-weight-bold, .text-gray-800 .font-weight-bold, .rd-author .font-weight-bold') || [].filter.call(card.querySelectorAll('.font-weight-bold'), function (x) { return !x.classList.contains('card-title') && !x.closest('.card-title, .feed-body'); })[0];
    if (nameEl) {
      var nc = nameEl.cloneNode(true); var badges = [].map.call(nc.querySelectorAll('.badge'), function (b) { return { text: b.textContent.trim(), party: b.classList.contains('party'), style: b.getAttribute('style') || '' }; });
      nc.querySelectorAll('.badge').forEach(function (x) { x.remove(); });
      var roleEl = nameEl.parentElement && nameEl.parentElement.querySelector('h5, .text-muted');
      who = { name: nc.textContent.replace(/\s+/g, ' ').trim(), badges: badges, role: roleEl ? roleEl.textContent.trim() : '', org: !badges.some(function (b) { return b.party; }) };
    }
    /* the card's bullets become the summary; the body is the full piece */
    var bullets = [].map.call(card.querySelectorAll('.feed-body li'), function (li) { return li.textContent.trim(); }).filter(Boolean).slice(0, 4);
    var text = card.querySelector('.feed-body'); var social = (!bullets.length && text) ? text.textContent.trim() : '';
    var titleText = title ? title.textContent.trim() : (who ? who.name : 'Post');
    if (!bullets.length && social) bullets = social.split(/(?<=[.!?])\s+/).slice(0, 3);
    var tags = [].map.call(card.querySelectorAll('.badge-soft-primary'), function (b) { return b.textContent.trim(); });
    var body = '<p>' + esc(opener(kindKey, titleText, who && !who.org ? who.name : '')) + '</p>' + (social ? '<p>' + esc(social) + '</p>' : '') + continuation(kindKey, titleText) + continuation('general', '') +
      '<p>Anyone with questions about what this means for them can contact the office directly. Further updates will be posted as they come to hand, and the full text of any related documents will be linked from this page.</p>';
    var side = '';
    if (who) {
      var av = who.org ? '<span class="rd__ini">' + esc(initials(who.name)) + '</span>' : '<img class="rd__avimg" src="assets/avatars/' + slug(who.name) + '.jpg" alt="" onerror="this.hidden=true;this.nextSibling.hidden=false"><span class="rd__ini" hidden>' + esc(initials(who.name)) + '</span>';
      side = '<a class="rd__who" href="' + (who.org ? '#' : 'person2.html') + '"><span class="rd__av">' + av + '</span><span class="rd__whotxt"><span class="rd__whoname">' + esc(who.name) +
        who.badges.map(function (b) { return '<span class="badge ' + (b.party ? 'party' : 'bg-secondary-soft text-dark') + '"' + (b.style ? ' style="' + esc(b.style) + '"' : '') + '>' + esc(b.text) + '</span>'; }).join('') + '</span>' +
        (who.role ? '<span class="rd__whorole">' + esc(who.role) + '</span>' : '') + '</span></a>';
    }
    view = document.createElement('div'); view.className = 'rd'; view.setAttribute('role', 'dialog'); view.setAttribute('aria-modal', 'true'); view.setAttribute('aria-label', titleText);
    view.innerHTML = '<div class="rd__scrim"></div><div class="rd__panel">' +
      '<header class="rd__bar"><span class="rd__kind">' + esc(kindLabel) + '</span><button type="button" class="rd__close" aria-label="Close">&#215;</button></header>' +
      '<div class="rd__scroll"><div class="rd__grid">' +
        '<article class="rd__doc">' +
          '<div class="rd__dochead"><h1 class="rd__title">' + esc(titleText) + '</h1><p class="rd__meta">' + esc(dateText) + ' <span class="rd__dot">•</span> via <a class="rd__src" href="#">' + esc(domainFor(who ? who.name : titleText, who && who.org)) + '<i class="far fa-arrow-up-right-from-square"></i></a></p></div>' +
          '<div class="rd__docbody">' +
            (bullets.length ? '<div class="rd__ai"><div class="rd__ailbl"><i class="fas fa-sparkles"></i>AI Summary</div><ul>' + bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul></div>' : '') +
            '<div class="rd__content">' + body + '</div>' +
            (tags.length ? '<div class="rd__tags">' + tags.map(function (t) { return '<span class="badge badge-soft-primary">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
          '</div>' +
        '</article>' +
        '<aside class="rd__side">' +
          '<div class="rd__acts"><button type="button" class="btn btn-white"><i class="far fa-share-from-square fa-fw"></i>Share</button><button type="button" class="btn btn-white js-save-btn"><i class="fa-regular fa-bookmark fa-fw"></i>Save</button><button type="button" class="btn btn-white rd__find"><i class="far fa-search fa-fw"></i>Find</button></div>' +
          side +
        '</aside>' +
      '</div></div></div>';
    document.body.appendChild(view); document.body.classList.add('rd-open');
    if (window.applyTablerIcons) window.applyTablerIcons(view);
    requestAnimationFrame(function () { view.classList.add('show'); });
    view.querySelectorAll('.rd__close, .rd__scrim').forEach(function (b) { b.addEventListener('click', close); });
    var find = view.querySelector('.rd__find'); if (find) find.addEventListener('click', function () { try { window.find(''); } catch (e) {} var first = view.querySelector('.rd__content'); if (first) { var sel = window.getSelection(); var r = document.createRange(); r.selectNodeContents(first); r.collapse(true); sel.removeAllRanges(); sel.addRange(r); } });
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
