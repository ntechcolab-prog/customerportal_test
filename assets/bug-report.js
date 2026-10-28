/**
 * NETZSCH Customer Portal — Help Desk: Report a Bug (CP-337)
 *
 * Global floating widget available across the authenticated app.
 * - Bottom-right FAB opens a modal with a bug-report form.
 * - Auto-captures context (page, role, browser, screen size).
 * - Fields: what went wrong (required), steps to reproduce, severity, screenshot.
 * - Submit shows an in-modal confirmation with a reference code.
 *
 * Self-contained: injects its own scoped styles (.nbug-*) so it looks the same
 * on every page regardless of that page's local CSS. i18n via window.NetzschI18n.
 * Deep link: open directly with the URL hash #report-bug.
 */
(function () {
  'use strict';
  if (window.__nbugInit) return;
  window.__nbugInit = true;

  /* ── i18n helper (safe before i18n.js has loaded) ─── */
  function T(key, fallback) {
    return (window.NetzschI18n && NetzschI18n.t) ? NetzschI18n.t(key, fallback) : fallback;
  }

  /* ── Scoped styles ─── */
  var css = [
    '.nbug-fab{position:fixed;right:22px;bottom:22px;z-index:2000;display:inline-flex;align-items:center;gap:9px;',
      'height:46px;padding:0 18px;border:none;border-radius:999px;background:#007167;color:#fff;',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;font-weight:600;',
      'cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.18);transition:background .15s,transform .15s,box-shadow .15s;}',
    '.nbug-fab:hover{background:#005f57;box-shadow:0 8px 26px rgba(0,0,0,0.22);}',
    '.nbug-fab:active{transform:translateY(1px);}',
    '.nbug-fab:focus-visible{outline:3px solid #0b9c92;outline-offset:2px;}',
    '.nbug-fab svg{width:18px;height:18px;flex-shrink:0;}',
    '@media(max-width:560px){.nbug-fab{padding:0;width:50px;height:50px;justify-content:center;}.nbug-fab .nbug-fab-txt{display:none;}}',

    '.nbug-overlay{position:fixed;inset:0;z-index:3000;background:rgba(17,24,23,0.46);',
      '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;',
      'padding:20px;opacity:0;pointer-events:none;transition:opacity .2s ease;}',
    '.nbug-overlay.open{opacity:1;pointer-events:auto;}',
    '.nbug-panel{width:100%;max-width:524px;max-height:90vh;overflow-y:auto;background:#fff;border-radius:16px;',
      'box-shadow:0 20px 60px rgba(0,0,0,0.28);transform:translateY(12px) scale(.98);transition:transform .22s cubic-bezier(.32,.72,0,1);',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#2d2e33;}',
    '.nbug-overlay.open .nbug-panel{transform:none;}',

    '.nbug-head{display:flex;align-items:flex-start;gap:12px;padding:22px 24px 16px;border-bottom:1px solid #eef0f2;}',
    '.nbug-head-ico{flex:0 0 auto;width:38px;height:38px;border-radius:10px;background:#e4efed;color:#007167;display:flex;align-items:center;justify-content:center;}',
    '.nbug-head-ico svg{width:20px;height:20px;}',
    '.nbug-head-txt{flex:1;min-width:0;}',
    '.nbug-title{font-size:17px;font-weight:700;color:#1f2937;margin:0;letter-spacing:-.01em;}',
    '.nbug-subtitle{font-size:13px;color:#6b7280;margin:3px 0 0;line-height:1.4;}',
    '.nbug-close{flex:0 0 auto;width:32px;height:32px;border:none;border-radius:8px;background:#f3f4f6;color:#6b7280;',
      'cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}',
    '.nbug-close:hover{background:#e5e7eb;color:#374151;}',
    '.nbug-close:focus-visible{outline:3px solid #0b9c92;outline-offset:2px;}',

    '.nbug-body{padding:18px 24px 4px;}',
    '.nbug-ctx-label{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#9ca3af;margin:0 0 9px;}',
    '.nbug-ctx{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:20px;}',
    '.nbug-chip{display:inline-flex;align-items:baseline;gap:5px;background:#f4f6f6;border:1px solid #e6e9e8;border-radius:7px;padding:4px 9px;font-size:12px;color:#4c4d57;max-width:100%;}',
    '.nbug-chip b{color:#9ca3af;font-weight:600;}',
    '.nbug-chip .v{font-weight:600;color:#2d2e33;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',

    '.nbug-field{margin-bottom:17px;}',
    '.nbug-flabel{display:block;font-size:13px;font-weight:600;color:#4c4d57;margin-bottom:6px;}',
    '.nbug-req{color:#c73e20;margin-left:2px;}',
    '.nbug-opt{color:#9ca3af;font-weight:400;margin-left:4px;}',
    '.nbug-textarea{width:100%;min-height:84px;resize:vertical;border:1px solid #c7cbce;border-radius:10px;padding:10px 12px;',
      'font-family:inherit;font-size:14px;color:#2d2e33;line-height:1.5;outline:none;transition:border-color .15s,box-shadow .15s;}',
    '.nbug-textarea:focus{border-color:#007167;box-shadow:0 0 0 3px rgba(0,113,103,.14);}',
    '.nbug-textarea.nbug-err{border-color:#c73e20;}',
    '.nbug-errmsg{display:none;font-size:12px;color:#c73e20;margin-top:6px;}',
    '.nbug-errmsg.show{display:block;}',

    '.nbug-sev{display:flex;gap:8px;}',
    '.nbug-sev label{flex:1;position:relative;cursor:pointer;}',
    '.nbug-sev input{position:absolute;opacity:0;width:0;height:0;}',
    '.nbug-sev .pill{display:block;text-align:center;padding:9px 6px;border:1px solid #c7cbce;border-radius:9px;',
      'font-size:13px;font-weight:600;color:#4c4d57;transition:all .13s;}',
    '.nbug-sev label:hover .pill{border-color:#9aa0a3;}',
    '.nbug-sev input:checked + .pill{background:#007167;border-color:#007167;color:#fff;}',
    '.nbug-sev input:focus-visible + .pill{outline:3px solid #0b9c92;outline-offset:2px;}',

    '.nbug-drop{display:flex;align-items:center;gap:10px;width:100%;border:1px dashed #c7cbce;border-radius:10px;',
      'padding:12px 14px;background:#fafbfb;cursor:pointer;color:#6b7280;font-size:13px;font-family:inherit;text-align:left;transition:border-color .15s,background .15s;}',
    '.nbug-drop:hover{border-color:#007167;background:#f4f8f7;}',
    '.nbug-drop:focus-visible{outline:3px solid #0b9c92;outline-offset:2px;}',
    '.nbug-drop svg{width:18px;height:18px;flex-shrink:0;color:#9ca3af;}',
    '.nbug-drop .hint{color:#9ca3af;margin-left:auto;font-size:12px;}',
    '.nbug-file{display:none;align-items:center;gap:8px;margin-top:9px;font-size:13px;color:#2d2e33;}',
    '.nbug-file.show{display:flex;}',
    '.nbug-file .name{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.nbug-file button{border:none;background:#f3f4f6;color:#6b7280;border-radius:6px;width:22px;height:22px;cursor:pointer;flex-shrink:0;}',
    '.nbug-file button:hover{background:#e5e7eb;}',

    '.nbug-foot{display:flex;gap:10px;justify-content:flex-end;padding:16px 24px 22px;border-top:1px solid #eef0f2;margin-top:6px;}',
    '.nbug-btn{height:42px;padding:0 20px;border-radius:999px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s;}',
    '.nbug-btn:focus-visible{outline:3px solid #0b9c92;outline-offset:2px;}',
    '.nbug-btn-ghost{background:#fff;border:1px solid #c7cbce;color:#4c4d57;}',
    '.nbug-btn-ghost:hover{background:#f4f6f6;border-color:#9aa0a3;}',
    '.nbug-btn-primary{background:#007167;border:1px solid #007167;color:#fff;}',
    '.nbug-btn-primary:hover{background:#005f57;border-color:#005f57;}',

    '.nbug-success{padding:36px 28px 32px;text-align:center;}',
    '.nbug-success-ico{width:58px;height:58px;border-radius:50%;background:#e4efed;color:#007167;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}',
    '.nbug-success-ico svg{width:30px;height:30px;}',
    '.nbug-success h3{font-size:18px;font-weight:700;color:#1f2937;margin:0 0 7px;}',
    '.nbug-success p{font-size:14px;color:#6b7280;margin:0 0 4px;line-height:1.5;}',
    '.nbug-ref{display:inline-block;margin:10px 0 22px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;font-weight:700;color:#007167;background:#f4f8f7;border:1px solid #d9e6e3;border-radius:8px;padding:7px 14px;letter-spacing:.02em;}',
    '.nbug-success-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}',

    '@media(prefers-reduced-motion:reduce){.nbug-fab,.nbug-overlay,.nbug-panel,.nbug-btn,.nbug-sev .pill,.nbug-drop,.nbug-textarea,.nbug-close{transition:none!important;}}'
  ].join('');

  var style = document.createElement('style');
  style.id = 'nbug-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Icons ─── */
  var BUG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="6" width="8" height="12" rx="4"/><path d="M12 6V4m-4 4L5 6m3 6H3m5 4-3 2m11-12 3-2m-3 6h5m-5 4 3 2"/></svg>';
  var CLOSE_SVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
  var IMG_SVG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="2"/><circle cx="7" cy="8" r="1.5"/><path d="M3 14l4-3 3 2 4-3 3 3"/></svg>';

  /* ── Context capture ─── */
  function roleLabel() {
    var r = (localStorage.getItem('netzsch_user_role') || 'administrator');
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
  function pageLabel() {
    var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    return file || (document.title || 'portal');
  }
  function browserLabel() {
    var ua = navigator.userAgent, b = 'Browser';
    if (/Edg\//.test(ua)) b = 'Edge';
    else if (/OPR\//.test(ua)) b = 'Opera';
    else if (/Chrome\//.test(ua)) b = 'Chrome';
    else if (/Firefox\//.test(ua)) b = 'Firefox';
    else if (/Safari\//.test(ua)) b = 'Safari';
    var os = /Macintosh/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' :
             /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : '';
    return os ? b + ' · ' + os : b;
  }
  function screenLabel() {
    return window.innerWidth + '×' + window.innerHeight;
  }

  /* ── Build FAB ─── */
  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'nbug-fab';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML = BUG_SVG + '<span class="nbug-fab-txt"></span>';
  function syncFabText() {
    fab.querySelector('.nbug-fab-txt').textContent = T('bug.fabLabel', 'Report a bug');
    fab.setAttribute('aria-label', T('bug.fabLabel', 'Report a bug'));
  }
  syncFabText();

  /* ── Build overlay + panel (lazily populated on first open) ─── */
  var overlay = document.createElement('div');
  overlay.className = 'nbug-overlay';
  overlay.setAttribute('role', 'presentation');
  var panel = document.createElement('div');
  panel.className = 'nbug-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'nbug-title');
  overlay.appendChild(panel);

  var lastFocus = null;
  var built = false;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function formMarkup() {
    return '' +
      '<div class="nbug-head">' +
        '<div class="nbug-head-ico">' + BUG_SVG + '</div>' +
        '<div class="nbug-head-txt">' +
          '<h2 class="nbug-title" id="nbug-title">' + esc(T('bug.title', 'Report a bug')) + '</h2>' +
          '<p class="nbug-subtitle">' + esc(T('bug.subtitle', 'Spotted something off? Tell us what happened.')) + '</p>' +
        '</div>' +
        '<button type="button" class="nbug-close" aria-label="' + esc(T('bug.close', 'Close')) + '">' + CLOSE_SVG + '</button>' +
      '</div>' +
      '<div class="nbug-body">' +
        '<p class="nbug-ctx-label">' + esc(T('bug.contextTitle', 'Captured automatically')) + '</p>' +
        '<div class="nbug-ctx">' +
          '<span class="nbug-chip"><b>' + esc(T('bug.ctxPage', 'Page')) + '</b><span class="v" data-ctx="page"></span></span>' +
          '<span class="nbug-chip"><b>' + esc(T('bug.ctxRole', 'Role')) + '</b><span class="v" data-ctx="role"></span></span>' +
          '<span class="nbug-chip"><b>' + esc(T('bug.ctxBrowser', 'Browser')) + '</b><span class="v" data-ctx="browser"></span></span>' +
          '<span class="nbug-chip"><b>' + esc(T('bug.ctxScreen', 'Screen')) + '</b><span class="v" data-ctx="screen"></span></span>' +
        '</div>' +

        '<div class="nbug-field">' +
          '<label class="nbug-flabel" for="nbug-what">' + esc(T('bug.whatLabel', 'What went wrong?')) +
            '<span class="nbug-req" aria-label="' + esc(T('bug.required', 'required')) + '">*</span></label>' +
          '<textarea class="nbug-textarea" id="nbug-what" aria-describedby="nbug-what-err" ' +
            'placeholder="' + esc(T('bug.whatPlaceholder', 'Describe what you expected and what actually happened…')) + '"></textarea>' +
          '<span class="nbug-errmsg" id="nbug-what-err">' + esc(T('bug.errWhat', 'Please describe what went wrong.')) + '</span>' +
        '</div>' +

        '<div class="nbug-field">' +
          '<label class="nbug-flabel" for="nbug-steps">' + esc(T('bug.stepsLabel', 'Steps to reproduce')) +
            '<span class="nbug-opt">' + esc(T('bug.optional', '(optional)')) + '</span></label>' +
          '<textarea class="nbug-textarea" id="nbug-steps" style="min-height:66px" ' +
            'placeholder="' + esc(T('bug.stepsPlaceholder', '1. Go to…  2. Click…  3. See…')) + '"></textarea>' +
        '</div>' +

        '<div class="nbug-field">' +
          '<span class="nbug-flabel">' + esc(T('bug.severityLabel', 'Severity')) + '</span>' +
          '<div class="nbug-sev" role="radiogroup" aria-label="' + esc(T('bug.severityLabel', 'Severity')) + '">' +
            '<label><input type="radio" name="nbug-sev" value="low"><span class="pill">' + esc(T('bug.sevLow', 'Low')) + '</span></label>' +
            '<label><input type="radio" name="nbug-sev" value="medium" checked><span class="pill">' + esc(T('bug.sevMedium', 'Medium')) + '</span></label>' +
            '<label><input type="radio" name="nbug-sev" value="high"><span class="pill">' + esc(T('bug.sevHigh', 'High')) + '</span></label>' +
          '</div>' +
        '</div>' +

        '<div class="nbug-field">' +
          '<span class="nbug-flabel">' + esc(T('bug.attachLabel', 'Screenshot')) +
            '<span class="nbug-opt">' + esc(T('bug.optional', '(optional)')) + '</span></span>' +
          '<button type="button" class="nbug-drop" id="nbug-drop">' + IMG_SVG +
            '<span>' + esc(T('bug.attachCta', 'Add a screenshot')) + '</span>' +
            '<span class="hint">' + esc(T('bug.attachHint', 'PNG or JPG')) + '</span></button>' +
          '<input type="file" id="nbug-file" accept="image/png,image/jpeg" hidden>' +
          '<div class="nbug-file" id="nbug-filebox"><span class="name"></span>' +
            '<button type="button" aria-label="' + esc(T('bug.close', 'Remove')) + '">' + CLOSE_SVG + '</button></div>' +
        '</div>' +
      '</div>' +
      '<div class="nbug-foot">' +
        '<button type="button" class="nbug-btn nbug-btn-ghost" id="nbug-cancel">' + esc(T('bug.cancel', 'Cancel')) + '</button>' +
        '<button type="button" class="nbug-btn nbug-btn-primary" id="nbug-submit">' + esc(T('bug.submit', 'Send report')) + '</button>' +
      '</div>';
  }

  function makeRef() {
    var t = Date.now().toString(36).toUpperCase().slice(-4);
    var r = Math.floor(Math.random() * 46656).toString(36).toUpperCase();
    while (r.length < 3) r = '0' + r;
    return 'BUG-' + t + r;
  }

  function successMarkup(ref) {
    return '' +
      '<div class="nbug-success">' +
        '<div class="nbug-success-ico">' + CHECK_SVG + '</div>' +
        '<h3>' + esc(T('bug.successTitle', 'Thanks — report sent')) + '</h3>' +
        '<p>' + esc(T('bug.successDesc', 'Our team will look into it. Your reference:')) + '</p>' +
        '<span class="nbug-ref">' + esc(ref) + '</span>' +
        '<div class="nbug-success-cta">' +
          '<button type="button" class="nbug-btn nbug-btn-ghost" id="nbug-another">' + esc(T('bug.another', 'Report another')) + '</button>' +
          '<button type="button" class="nbug-btn nbug-btn-primary" id="nbug-done">' + esc(T('bug.close', 'Close')) + '</button>' +
        '</div>' +
      '</div>';
  }

  function fillContext() {
    var map = { page: pageLabel(), role: roleLabel(), browser: browserLabel(), screen: screenLabel() };
    var vs = panel.querySelectorAll('[data-ctx]');
    for (var i = 0; i < vs.length; i++) {
      vs[i].textContent = map[vs[i].getAttribute('data-ctx')] || '';
    }
  }

  function wireForm() {
    var closeBtn = panel.querySelector('.nbug-close');
    var cancel = panel.querySelector('#nbug-cancel');
    var submit = panel.querySelector('#nbug-submit');
    var what = panel.querySelector('#nbug-what');
    var err = panel.querySelector('#nbug-what-err');
    var drop = panel.querySelector('#nbug-drop');
    var file = panel.querySelector('#nbug-file');
    var filebox = panel.querySelector('#nbug-filebox');

    closeBtn.addEventListener('click', close);
    cancel.addEventListener('click', close);

    what.addEventListener('input', function () {
      if (what.value.trim()) { what.classList.remove('nbug-err'); err.classList.remove('show'); }
    });

    drop.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      if (file.files && file.files[0]) {
        filebox.querySelector('.name').textContent = file.files[0].name;
        filebox.classList.add('show');
      }
    });
    filebox.querySelector('button').addEventListener('click', function () {
      file.value = ''; filebox.classList.remove('show');
    });

    submit.addEventListener('click', function () {
      if (!what.value.trim()) {
        what.classList.add('nbug-err'); err.classList.add('show'); what.focus();
        return;
      }
      /* Prototype: no backend — show confirmation with a generated reference. */
      panel.innerHTML = successMarkup(makeRef());
      panel.querySelector('#nbug-done').addEventListener('click', close);
      panel.querySelector('#nbug-another').addEventListener('click', function () {
        render(); fillContext();
        var w = panel.querySelector('#nbug-what'); if (w) w.focus();
      });
      var done = panel.querySelector('#nbug-done'); if (done) done.focus();
    });
  }

  function render() {
    panel.innerHTML = formMarkup();
    wireForm();
    built = true;
  }

  /* ── Open / close ─── */
  function open() {
    lastFocus = document.activeElement;
    render();
    fillContext();
    document.body.appendChild(overlay);
    /* force reflow so the transition runs */
    void overlay.offsetWidth;
    overlay.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    var w = panel.querySelector('#nbug-what');
    if (w) w.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    overlay.classList.remove('open');
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKeydown);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var remove = function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); };
    if (reduce) remove(); else setTimeout(remove, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      /* simple focus trap */
      var f = panel.querySelectorAll('button, textarea, input, [href], [tabindex]:not([tabindex="-1"])');
      var list = [];
      for (var i = 0; i < f.length; i++) { if (f[i].offsetParent !== null || f[i].type === 'radio') list.push(f[i]); }
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  fab.addEventListener('click', open);

  /* ── Mount ─── */
  function mount() {
    if (!document.body.contains(fab)) document.body.appendChild(fab);
    syncFabText();
    if (location.hash === '#report-bug') open();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  /* expose a tiny API (e.g. a "Report a bug" link elsewhere can call it) */
  window.NetzschBugReport = { open: open, close: close };
})();
