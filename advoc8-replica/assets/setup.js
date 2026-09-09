/* Setup Custom Feed wizard (build.html + alerts.html) */
(function () {
  'use strict';

  /* ---------------- Build page ---------------- */

  var TOPICS = [
    ['🐑', 'Agriculture'], ['🎨', 'Arts and Culture'], ['🔍', 'Consumer Affairs'],
    ['👔', 'Corporate Affairs'], ['🪖', 'Defence'], ['📈', 'Economics'],
    ['🎓', 'Education'], ['🚨', 'Emergency Management'], ['⚡', 'Energy and Mining'],
    ['🌳', 'Environment'], ['💳', 'Finance'], ['🥤', 'Food and Beverage'],
    ['🤝', 'Foreign Affairs and Trade'], ['💶', 'Government Grants'], ['⚕️', 'Health'],
    ['🛂', 'Home Affairs'], ['🌏', 'Indigenous Affairs'], ['🌐', 'Industry, Science and Innovation'],
    ['⚖️', 'Legal Affairs'], ['📰', 'Media and Communications'], ['📋', 'Planning and Development'],
    ['🏛️', 'Social Services'], ['🏉', 'Sport and Recreation'], ['💸', 'Taxation'],
    ['🖥️', 'Technology'], ['🏖️', 'Tourism and Hospitality'], ['🚘', 'Transport'],
    ['💼', 'Workplace Relations']
  ];

  var topicWrap = document.getElementById('topicSelectWrap');
  if (topicWrap) {
    var TOPIC_TREE = (window.SETUP_TOPICS || TOPICS.map(function (t) { return [t[0], t[1], []]; }));
    var topicSel = document.getElementById('topicSelect');
    var topicDd = document.getElementById('topicDd');
    var topicList = document.getElementById('topicList');
    function renderTopicOptions(q) {
      q = (q || '').toLowerCase();
      topicList.innerHTML = TOPIC_TREE.map(function (t, i) {
        var groupMatch = t[1].toLowerCase().indexOf(q) !== -1;
        var subs = (t[2] || []).filter(function (s) { return !q || groupMatch || s.toLowerCase().indexOf(q) !== -1; });
        if (q && !groupMatch && !subs.length) return '';
        var out = '<div class="topic-option topic-option--group" data-value="' + t[1] + '">' +
          '<span class="mr-2">' + t[0] + '</span>' + t[1] + '</div>';
        out += subs.map(function (s) {
          return '<div class="topic-option topic-option--sub" data-value="' + t[1] + ' &rsaquo; ' + s + '">' + s + '</div>';
        }).join('');
        return out;
      }).join('');
    }
    function closeTopicDd() {
      topicDd.classList.add('d-none');
    }
    topicSel.addEventListener('click', function () {
      var wasOpen = !topicDd.classList.contains('d-none');
      closeTopicDd();
      if (!wasOpen) {
        topicDd.classList.remove('d-none');
        renderTopicOptions('');
        var s = document.getElementById('topicSearch');
        s.value = '';
        s.focus();
      }
    });
    document.getElementById('topicSearch').addEventListener('input', function () {
      renderTopicOptions(this.value.trim());
    });
    topicList.addEventListener('click', function (e) {
      var opt = e.target.closest('.topic-option');
      if (!opt) return;
      topicSel.innerHTML = opt.classList.contains('topic-option--group')
        ? opt.innerHTML
        : opt.getAttribute('data-value');
      topicSel.style.color = '#12263f';
      closeTopicDd();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#topicSelectWrap')) closeTopicDd();
    });
  }

  /* Keyword rows: classify Phrase vs Word, keep one trailing empty row */
  var kwContainer = document.getElementById('keywordRows');
  if (kwContainer) {
    function classify(input) {
      var suffix = input.parentElement.querySelector('.keyword-input__type');
      var v = input.value.trim();
      if (!v) { suffix.textContent = ''; return; }
      if (/["()]|\bAND\b|\bOR\b|\bNOT\b/.test(v)) suffix.textContent = 'Boolean';
      else if (v.indexOf(' ') !== -1) suffix.textContent = 'Phrase';
      else suffix.textContent = 'Word';
    }
    function ensureTrailingEmpty() {
      var rows = kwContainer.querySelectorAll('.keyword-row');
      var last = rows[rows.length - 1];
      if (last && last.querySelector('input').value.trim() !== '') {
        var row = document.createElement('div');
        row.className = 'keyword-row';
        row.innerHTML =
          '<div class="keyword-input">' +
            '<input class="form-control" type="text" placeholder="Enter a single word, phrase or boolean query...">' +
            '<span class="keyword-input__type"></span>' +
          '</div>' +
          '<button type="button" class="kw-remove"><i class="fal fa-times fa-lg"></i></button>';
        kwContainer.appendChild(row);
      }
    }
    kwContainer.addEventListener('input', function (e) {
      if (e.target.matches('input')) { classify(e.target); ensureTrailingEmpty(); }
    });
    kwContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.kw-remove');
      if (btn) {
        var rows = kwContainer.querySelectorAll('.keyword-row');
        if (rows.length > 1) btn.closest('.keyword-row').remove();
        else {
          var inp = btn.closest('.keyword-row').querySelector('input');
          inp.value = '';
          classify(inp);
        }
        ensureTrailingEmpty();
      }
    });
  }

  /* Stakeholder remove */
  document.addEventListener('click', function (e) {
    var x = e.target.closest('.sh-x');
    if (x) x.closest('.stakeholder-row').remove();
  });

  /* ---------------- Alerts page ---------------- */

  var FREQS = [
    { key: 'off', icon: 'far fa-ban', title: 'Off', sub: 'Disable alerts for this content' },
    { key: 'asap', icon: 'fas fa-bolt', title: 'ASAP', sub: "You'll know when we know" },
    { key: 'daily', icon: 'far fa-clock', title: 'Daily Digest', sub: 'Each day at 8:00 AM' },
    { key: 'twice', icon: 'far fa-circle-2', title: 'Twice Daily Digest', sub: 'Each day at 8:00 AM and 3:00 PM' },
    { key: 'weekly', icon: 'far fa-calendar', title: 'Weekly Digest', sub: 'Each Monday at 8:00 AM' }
  ];

  var alertRows = document.getElementById('alertRows');
  if (alertRows) {
    function closeFreqDropdowns() {
      document.querySelectorAll('.freq-dropdown').forEach(function (d) { d.remove(); });
    }
    alertRows.addEventListener('click', function (e) {
      var sel = e.target.closest('.freq-select');
      if (!sel) return;
      var wrap = sel.parentElement;
      var existing = wrap.querySelector('.freq-dropdown');
      closeFreqDropdowns();
      if (existing) return;
      var current = wrap.getAttribute('data-value');
      var dd = document.createElement('div');
      dd.className = 'freq-dropdown';
      dd.innerHTML =
        '<div class="freq-dropdown__search"><input type="text" autocomplete="off"></div>' +
        '<div class="freq-dropdown__list">' +
        FREQS.map(function (f) {
          return '<div class="freq-option' + (f.key === current ? ' selected' : '') + '" data-key="' + f.key + '">' +
                   '<i class="' + f.icon + '"></i>' +
                   '<div><div class="freq-option__title">' + f.title + '</div>' +
                   '<div class="freq-option__sub">' + f.sub + '</div></div>' +
                 '</div>';
        }).join('') +
        '</div>';
      wrap.appendChild(dd);
      var caret = sel.querySelector('.freq-caret');
      caret.classList.remove('fa-caret-down');
      caret.classList.add('fa-caret-up');
      dd.querySelector('input').focus();

      dd.querySelector('input').addEventListener('input', function () {
        var q = this.value.toLowerCase();
        dd.querySelectorAll('.freq-option').forEach(function (o) {
          o.style.display = o.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
      dd.addEventListener('click', function (ev) {
        var opt = ev.target.closest('.freq-option');
        if (!opt) return;
        var f = FREQS.find(function (x) { return x.key === opt.getAttribute('data-key'); });
        wrap.setAttribute('data-value', f.key);
        var icon = sel.querySelector('.freq-icon');
        icon.className = f.icon + ' freq-icon';
        sel.querySelector('.freq-label').textContent = f.title;
        closeFreqDropdowns();
        resetCarets();
      });
    });
    function resetCarets() {
      document.querySelectorAll('.freq-caret').forEach(function (c) {
        c.classList.remove('fa-caret-up');
        c.classList.add('fa-caret-down');
      });
    }
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.freq-select-wrap')) { closeFreqDropdowns(); resetCarets(); }
    });

    /* Confirm -> Setup Complete modal */
    var confirmBtn = document.getElementById('confirmSetup');
    confirmBtn.addEventListener('click', function () {
      var modal = document.getElementById('setupCompleteModal');
      modal.style.display = 'block';
      requestAnimationFrame(function () { modal.classList.add('show'); });
      document.body.classList.add('modal-open');
      var backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade';
      backdrop.id = 'replica-backdrop';
      document.body.appendChild(backdrop);
      requestAnimationFrame(function () { backdrop.classList.add('show'); });
      setTimeout(function () { document.getElementById('feedNameInput').select(); }, 100);
    });

    document.addEventListener('click', function (e) {
      var choice = e.target.closest('.emoji-choice');
      if (choice) {
        e.preventDefault();
        document.getElementById('feedEmojiBtn').textContent = choice.textContent;
      }
    });
  }
})();
