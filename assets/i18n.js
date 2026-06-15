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

  /* ── Lang button dropdown ─── */
  function setupLangButton() {
    var lang = getLang();

    /* Find all lang-btn and convert to dropdown */
    var buttons = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];

      /* Avoid double-init */
      if (btn.getAttribute('data-i18n-init')) continue;
      btn.setAttribute('data-i18n-init', 'true');

      /* Build dropdown structure */
      var wrapper = document.createElement('div');
      wrapper.className = 'lang-dropdown-wrap';
      wrapper.style.position = 'relative';

      btn.parentNode.insertBefore(wrapper, btn);
      wrapper.appendChild(btn);

      /* Update button label */
      var textNodes = btn.childNodes;
      for (var t = 0; t < textNodes.length; t++) {
        if (textNodes[t].nodeType === 3 && textNodes[t].textContent.trim().length <= 3) {
          textNodes[t].textContent = ' ' + lang.toUpperCase() + ' ';
        }
      }

      /* Create dropdown */
      var dd = document.createElement('div');
      dd.className = 'lang-dropdown';
      dd.style.cssText = 'display:none;position:absolute;top:calc(100% + 4px);right:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);z-index:300;overflow:hidden;min-width:120px;';

      for (var s = 0; s < SUPPORTED.length; s++) {
        var option = document.createElement('button');
        option.type = 'button';
        option.className = 'lang-dropdown-option';
        option.setAttribute('data-lang', SUPPORTED[s]);
        option.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:10px 16px;border:none;background:none;font-family:Inter,sans-serif;font-size:14px;color:#3d4246;cursor:pointer;text-align:left;transition:background 0.15s;';
        if (SUPPORTED[s] === lang) {
          option.style.background = '#f0faf9';
          option.style.color = '#007167';
          option.style.fontWeight = '600';
        }
        option.textContent = SUPPORTED[s] === 'en' ? 'English' : SUPPORTED[s] === 'de' ? 'Deutsch' : SUPPORTED[s].toUpperCase();

        option.addEventListener('mouseenter', function () { this.style.background = this.getAttribute('data-lang') === getLang() ? '#f0faf9' : '#f3f4f6'; });
        option.addEventListener('mouseleave', function () { this.style.background = this.getAttribute('data-lang') === getLang() ? '#f0faf9' : ''; });

        (function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            var newLang = opt.getAttribute('data-lang');
            setLang(newLang);
            /* Reload to apply everywhere cleanly */
            window.location.reload();
          });
        })(option);

        dd.appendChild(option);
      }

      wrapper.appendChild(dd);

      /* Toggle dropdown */
      (function (btnRef, ddRef) {
        btnRef.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = ddRef.style.display !== 'none';
          ddRef.style.display = open ? 'none' : 'block';
        });
      })(btn, dd);
    }

    /* Close dropdown when clicking outside */
    document.addEventListener('click', function () {
      var dds = document.querySelectorAll('.lang-dropdown');
      for (var d = 0; d < dds.length; d++) {
        dds[d].style.display = 'none';
      }
    });
  }

  /* ── Init ─── */
  function init() {
    var lang = getLang();
    setupLangButton();
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
