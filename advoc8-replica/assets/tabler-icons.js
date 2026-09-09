/* Tabler Icons for the redesign. Every Font Awesome <i> keeps its original classes (so styling and any code that reads them still work)
   and gets a Tabler SVG inside it; the FA glyph is suppressed by CSS. Set TABLER_ICONS to false to go back to Font Awesome. */
var TABLER_ICONS = true;
(function () {
  if (!TABLER_ICONS || !document.body.classList.contains('l2-body')) return;
  var LC = document.documentElement.classList.contains('lc'); /* option B keeps the original Font Awesome icons, except inside the prototype panel */
  var SPRITE = '/assets/tabler-sprite-nostroke.svg#tabler-';
  var MAP = {
    'plus': 'plus', 'sitemap': 'sitemap', 'pen-to-square': 'edit', 'regular-list-circle-plus': 'list-details', 'user-plus': 'user-plus',
    'ellipsis-h': 'dots', 'ellipsis': 'dots', 'chevron-down': 'chevron-down', 'chevron-right': 'chevron-right', 'chevron-up': 'chevron-up', 'chevron-left': 'chevron-left',
    'newspaper': 'news', 'bookmark': 'bookmark', 'facebook': 'brand-facebook', 'layer-group': 'stack-2', 'search': 'search', 'magnifying-glass': 'search',
    'users': 'users', 'question-circle': 'help-circle', 'circle-question': 'help-circle', 'calendar-alt': 'calendar', 'calendar': 'calendar',
    'message-lines': 'message', 'comment-alt-lines': 'message', 'landmark-dome': 'building-bank', 'landmark': 'building-bank', 'landmark-flag': 'building-bank',
    'flag': 'flag', 'id-badge': 'id-badge', 'handshake': 'heart-handshake', 'copy': 'copy', 'messages-question': 'message-question', 'history': 'history', 'arrow-rotate-left': 'arrow-back-up', 'floppy-disk': 'device-floppy', 'sparkles': 'sparkles', 'droplet': 'droplet',
    'gear': 'settings', 'cog': 'settings', 'calendar-check': 'calendar-check', 'book': 'book', 'user-tie': 'user-star', 'people-group': 'users-group',
    'city': 'building-community', 'building-columns': 'building-bank', 'building': 'building', 'times': 'x', 'share-from-square': 'share', 'paper-plane': 'send',
    'sliders-v': 'adjustments', 'sliders-h': 'adjustments-horizontal', 'tag': 'tag', 'file-export': 'file-export', 'file-import': 'file-import',
    'caret-down': 'chevron-down', 'caret-right': 'chevron-right', 'bell-slash': 'bell-off', 'bell': 'bell', 'play': 'player-play', 'folder': 'folder', 'user': 'user', 'map-location-dot': 'map-2', 'sort': 'arrows-sort',
    'quote-left': 'quote', 'hashtag': 'hash', 'folder-plus': 'folder-plus', 'chart-simple': 'chart-bar', 'trash-alt': 'trash', 'regular-bell-gear': 'bell-cog',
    'bell-on': 'bell-ringing', 'linkedin': 'brand-linkedin', 'circle': 'circle', 'envelope': 'mail', 'rectangle-list': 'list-details', 'clock': 'clock',
    'circle-info': 'info-circle', 'circle-check': 'circle-check', 'ban': 'ban', 'x-twitter': 'brand-x', 'twitter': 'brand-x', 'wave-pulse': 'activity',
    'square-plus': 'square-plus', 'sidebar': 'layout-sidebar', 'microsoft': 'brand-windows', 'magnifying-glass-plus': 'zoom-in', 'google': 'brand-google',
    'file-word': 'file-text', 'file-lines': 'file-text', 'check': 'check', 'arrow-up-arrow-down': 'arrows-up-down', 'arrow-right': 'arrow-right',
    'sun': 'sun', 'percent': 'percentage', 'moon': 'moon', 'list-ol': 'list-numbers', 'list': 'list', 'link': 'link', 'filter': 'filter',
    'file-csv': 'file-type-csv', 'file': 'file', 'eye': 'eye', 'calendar-plus': 'calendar-plus', 'arrows-maximize': 'arrows-maximize',
    'arrow-up-from-bracket': 'upload', 'arrow-to-right': 'arrow-bar-to-right', 'arrow-left': 'arrow-left', 'apple': 'brand-apple', 'arrow-up': 'arrow-up', 'arrow-down': 'arrow-down', 'bolt': 'bolt', 'circle-half-stroke': 'contrast'
  };
  var FILL = { 'bookmark': 1, 'circle': 1, 'bell-on': 1, 'bell-slash': 1, 'bell': 1 }; /* solid FA icons that read as filled shapes */
  var SKIP = /^(fw|xs|sm|lg|xl|2x|3x|kit|regular|solid|light|thin|duotone|brands|advoc8)$/;
  function convert(i) {
    if (i.dataset.fa !== undefined) return;
    if (LC && !i.closest('.proto')) return;
    var m = i.className.match(/\bfa-([a-z0-9-]+)\b/g); if (!m) return;
    var names = m.map(function (x) { return x.slice(3); }).filter(function (n) { return !SKIP.test(n); });
    var name = names[0], t = name && MAP[name]; if (!t) return;
    var solid = /\bfas\b|\bfa-solid\b/.test(i.className);
    i.dataset.fa = i.className;
    i.classList.add('ti-ico'); if (solid && FILL[name]) i.classList.add('ti-fill');
    if (solid && name === 'bell-on') { i.classList.add('ti-inline'); i.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5a2 2 0 0 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6z" fill="currentColor" stroke="none"/><path d="M9 17v1a3 3 0 0 0 6 0v-1z" fill="currentColor" stroke="none"/><path d="M21 6.727a11.05 11.05 0 0 0 -2.794 -3.727"/><path d="M3 6.727a11.05 11.05 0 0 1 2.792 -3.727"/></svg>'; return; }
    i.innerHTML = '<svg aria-hidden="true" focusable="false"><use href="' + SPRITE + t + '"></use></svg>';
  }
  function sweep(root) {
    if (root.nodeType !== 1) return;
    if (root.matches('i[class*="fa-"]')) convert(root);
    root.querySelectorAll('i[class*="fa-"]').forEach(convert);
  }
  sweep(document.body);
  new MutationObserver(function (muts) { muts.forEach(function (m) { m.addedNodes.forEach(sweep); }); }).observe(document.documentElement, { childList: true, subtree: true });
})();
