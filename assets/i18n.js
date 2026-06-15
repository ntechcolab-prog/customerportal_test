/**
 * i18n — Internationalisation helper
 *
 * Usage in HTML:
 *   <span data-i18n="nav.orders">Orders</span>
 *   <input data-i18n-placeholder="milla.placeholder" placeholder="Ask Milla AI...">
 *   <img data-i18n-alt="cart.title" alt="Cart">
 *   <button data-i18n-aria-label="common.close" aria-label="Close">
 *   <html data-i18n-lang>  (updates the lang attribute)
 *
 * The lang-btn dropdown toggles between languages.
 * Selected language is stored in localStorage('netzsch_lang').
 */
(function () {
  'use strict';

  var SUPPORTED = ['en', 'de'];
  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'netzsch_lang';
  var cache = {};

  /* ── Detect language ─── */
  function getLang() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    return DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  /* ── Load JSON ─── */
  function loadTranslations(lang, callback) {
    if (cache[lang]) { callback(cache[lang]); return; }

    var basePath = '';
    var scripts = document.querySelectorAll('script[src*="i18n.js"]');
    if (scripts.length) {
      var src = scripts[0].getAttribute('src');
      basePath = src.substring(0, src.lastIndexOf('/') + 1);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', basePath + 'lang/' + lang + '.json', true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          cache[lang] = JSON.parse(xhr.responseText);
        } catch (e) {
          cache[lang] = {};
        }
      } else {
        cache[lang] = {};
      }
      callback(cache[lang]);
    };
    xhr.onerror = function () { cache[lang] = {}; callback(cache[lang]); };
    xhr.send();
  }

  /* ── Apply translations ─── */
  function applyTranslations(dict) {
    /* Text content */
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        /* Preserve child elements (icons etc.) — only replace text nodes */
        var children = els[i].childNodes;
        var replaced = false;
        for (var j = 0; j < children.length; j++) {
          if (children[j].nodeType === 3 && children[j].textContent.trim() !== '') {
            children[j].textContent = dict[key];
            replaced = true;
            break;
          }
        }
        if (!replaced && els[i].children.length === 0) {
          els[i].textContent = dict[key];
        }
      }
    }

    /* Placeholders */
    var phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (var p = 0; p < phs.length; p++) {
      var pk = phs[p].getAttribute('data-i18n-placeholder');
      if (dict[pk] !== undefined) phs[p].setAttribute('placeholder', dict[pk]);
    }

    /* Alt text */
    var alts = document.querySelectorAll('[data-i18n-alt]');
    for (var a = 0; a < alts.length; a++) {
      var ak = alts[a].getAttribute('data-i18n-alt');
      if (dict[ak] !== undefined) alts[a].setAttribute('alt', dict[ak]);
    }

    /* Aria-label */
    var arias = document.querySelectorAll('[data-i18n-aria-label]');
    for (var r = 0; r < arias.length; r++) {
      var rk = arias[r].getAttribute('data-i18n-aria-label');
      if (dict[rk] !== undefined) arias[r].setAttribute('aria-label', dict[rk]);
    }

    /* HTML lang attribute */
    var html = document.documentElement;
    var lang = getLang();
    html.setAttribute('lang', lang);
  }

  /* ── Lang switcher ─── */
  function setupLangSwitcher() {
    var lang = getLang();

    var switchers = document.querySelectorAll('.lang-switcher');
    for (var i = 0; i < switchers.length; i++) {
      var sw = switchers[i];
      if (sw.getAttribute('data-i18n-init')) continue;
      sw.setAttribute('data-i18n-init', 'true');

      /* Update label to current lang */
      var label = sw.querySelector('.lang-label');
      if (label) label.textContent = lang.toUpperCase();

      /* Mark active option */
      var options = sw.querySelectorAll('.lang-option');
      for (var o = 0; o < options.length; o++) {
        var optLang = options[o].getAttribute('data-lang').toLowerCase();
        if (optLang === lang) {
          options[o].classList.add('active');
        } else {
          options[o].classList.remove('active');
        }

        /* Click handler */
        (function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            var newLang = opt.getAttribute('data-lang').toLowerCase();
            if (newLang !== getLang()) {
              setLang(newLang);
              window.location.reload();
            }
          });
        })(options[o]);
      }

      /* Toggle open/close */
      (function (swRef) {
        swRef.addEventListener('click', function (e) {
          e.stopPropagation();
          swRef.classList.toggle('open');
        });
      })(sw);
    }

    /* Close all on outside click */
    document.addEventListener('click', function () {
      for (var d = 0; d < switchers.length; d++) {
        switchers[d].classList.remove('open');
      }
    });
  }

  /* ── Init ─── */
  function init() {
    var lang = getLang();
    setupLangSwitcher();
    loadTranslations(lang, function (dict) {
      applyTranslations(dict);
    });
  }

  /* Run on DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose for programmatic use */
  window.NetzschI18n = {
    getLang: getLang,
    setLang: setLang,
    reload: function () {
      var lang = getLang();
      loadTranslations(lang, applyTranslations);
    }
  };

})();
