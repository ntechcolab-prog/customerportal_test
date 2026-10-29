/**
 * NETZSCH Customer Portal — Feedback widget (CP-337)
 *
 * Userback-style feedback experience, available across the authenticated app:
 *  - Left-edge "Feedback" tab launcher.
 *  - Top annotation toolbar: select, pen, line, arrow, rectangle, text, record.
 *  - On-screen drawing on a full-viewport canvas overlay (functional).
 *  - Feedback panel: name + email (prefilled from role persona), comment,
 *    attach-screenshot toggle, Send feedback → confirmation with reference.
 *  - Real screenshot capture via vendored html2canvas (lazy-loaded).
 *
 * Self-contained: injects its own scoped styles (.nfb-*). i18n via NetzschI18n.
 * Deep link: open directly with #feedback (or #report-bug).
 */
(function () {
  'use strict';
  if (window.__nfbInit) return;
  window.__nfbInit = true;

  var ACCENT = '#ec8043';        /* Userback-style orange */
  var ACCENT_DK = '#d96e2e';
  var INK_ANNOT = '#e8402c';     /* annotation colour */

  var personas = {
    administrator: { name: 'Marcus Weber',  email: 'marcus.weber@acme-corp.com' },
    buyer:         { name: 'Sarah Mitchell', email: 'sarah.mitchell@acme-corp.com' },
    technician:    { name: 'Carlos Andrade', email: 'carlos.andrade@acme-corp.com' },
    approver:      { name: 'Daniel Costa',   email: 'daniel.costa@acme-corp.com' }
  };
  function me() {
    var r = localStorage.getItem('netzsch_user_role') || 'administrator';
    return personas[r] || personas.administrator;
  }

  function T(k, f) { return (window.NetzschI18n && NetzschI18n.t) ? NetzschI18n.t(k, f) : f; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function scriptBase() {
    var sc = document.querySelector('script[src*="bug-report.js"]');
    if (sc) { var src = sc.getAttribute('src'); return src.substring(0, src.lastIndexOf('/') + 1); }
    return '../assets/';
  }

  /* ── Icons ─── */
  var I = {
    nav: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l8.5 18.5-8.5-4.6-8.5 4.6z"/></svg>',
    back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    select: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4l5 5L9 20l-5 1 1-5z"/></svg>',
    line: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M5 19L19 5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19L19 5M11 5h8v8"/></svg>',
    rect: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/></svg>',
    text: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 6h14M12 6v13"/></svg>',
    record: '<svg viewBox="0 0 24 24" fill="#e8402c" aria-hidden="true"><circle cx="12" cy="12" r="7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
    cam: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h3l1.3-2h5.4L16 6h1a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z"/><circle cx="10" cy="11" r="3"/></svg>'
  };

  /* ── Styles ─── */
  var css = [
    '.nfb-tab{position:fixed;left:0;top:44%;z-index:2000;display:flex;flex-direction:column;align-items:center;gap:7px;',
      'padding:15px 7px;border:none;border-radius:0 9px 9px 0;background:' + ACCENT + ';color:#fff;cursor:pointer;',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:2px 3px 14px rgba(0,0,0,.18);',
      'transition:background .15s,transform .15s,box-shadow .15s;}',
    '.nfb-tab:hover{background:' + ACCENT_DK + ';transform:translateX(3px);box-shadow:4px 4px 20px rgba(0,0,0,.22);}',
    '.nfb-tab:focus-visible{outline:3px solid #fff;outline-offset:-4px;}',
    '.nfb-tab svg{width:16px;height:16px;}',
    '.nfb-tab .t{writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;font-weight:600;letter-spacing:.04em;}',

    '.nfb-canvas{position:fixed;inset:0;z-index:3000;}',

    '.nfb-toolbar{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:3002;display:flex;align-items:center;gap:3px;',
      'background:#fff;border-radius:999px;padding:7px 9px;box-shadow:0 8px 28px rgba(0,0,0,.2);',
      'font-family:Inter,sans-serif;}',
    '.nfb-tool{width:38px;height:38px;border:none;background:none;border-radius:50%;color:#3d4246;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;transition:background .13s;}',
    '.nfb-tool:hover{background:#f1f2f3;}',
    '.nfb-tool.active{background:#edeef0;color:#1f2937;}',
    '.nfb-tool:focus-visible{outline:3px solid ' + ACCENT + ';outline-offset:2px;}',
    '.nfb-tool svg{width:20px;height:20px;}',
    '.nfb-tool-sep{width:1px;height:22px;background:#e5e7eb;margin:0 3px;}',

    '.nfb-panel{position:fixed;top:70px;left:64px;z-index:3002;width:368px;max-width:calc(100vw - 32px);max-height:calc(100vh - 90px);',
      'overflow-y:auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.26);',
      'font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#2d2e33;}',
    '.nfb-head{background:' + ACCENT + ';color:#fff;padding:20px 22px 24px;position:relative;}',
    '.nfb-logo{width:30px;height:30px;}',
    '.nfb-head-btns{position:absolute;top:16px;right:14px;display:flex;gap:4px;}',
    '.nfb-hbtn{width:30px;height:30px;border:none;background:rgba(255,255,255,.16);color:#fff;border-radius:7px;cursor:pointer;',
      'display:flex;align-items:center;justify-content:center;transition:background .13s;}',
    '.nfb-hbtn:hover{background:rgba(255,255,255,.28);}',
    '.nfb-hbtn:focus-visible{outline:3px solid #fff;outline-offset:2px;}',
    '.nfb-hbtn svg{width:15px;height:15px;}',
    '.nfb-greet{font-size:21px;font-weight:800;line-height:1.25;letter-spacing:-.01em;margin:14px 0 0;}',

    '.nfb-body{padding:20px 22px 8px;display:flex;flex-direction:column;gap:12px;}',
    '.nfb-input,.nfb-ta{width:100%;border:1px solid #d7dadd;border-radius:10px;padding:12px 14px;font-family:inherit;font-size:14px;',
      'color:#2d2e33;outline:none;transition:border-color .15s,box-shadow .15s;}',
    '.nfb-ta{min-height:112px;resize:vertical;line-height:1.5;}',
    '.nfb-input:focus,.nfb-ta:focus{border-color:' + ACCENT + ';box-shadow:0 0 0 3px rgba(236,128,67,.16);}',
    '.nfb-ta.nfb-err{border-color:#c73e20;}',
    '.nfb-errmsg{display:none;font-size:12px;color:#c73e20;margin:-4px 0 0;}',
    '.nfb-errmsg.show{display:block;}',
    '.nfb-shot{display:flex;align-items:center;gap:10px;border:1px solid #e3e6e8;border-radius:10px;padding:11px 14px;cursor:pointer;color:#4c4d57;font-size:13.5px;}',
    '.nfb-shot:hover{background:#fafbfb;}',
    '.nfb-shot svg{width:18px;height:18px;color:#9ca3af;flex-shrink:0;}',
    '.nfb-shot .lbl{flex:1;font-weight:500;}',
    '.nfb-switch{position:relative;width:38px;height:22px;flex-shrink:0;border-radius:999px;background:#cfd3d6;transition:background .15s;}',
    '.nfb-switch::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 2px rgba(0,0,0,.25);}',
    '.nfb-shot.on .nfb-switch{background:' + ACCENT + ';}',
    '.nfb-shot.on .nfb-switch::after{transform:translateX(16px);}',

    '.nfb-foot{padding:6px 22px 18px;}',
    '.nfb-send{width:100%;height:48px;border:none;border-radius:999px;background:' + ACCENT + ';color:#fff;font-family:inherit;',
      'font-size:15px;font-weight:700;cursor:pointer;transition:background .15s;}',
    '.nfb-send:hover{background:' + ACCENT_DK + ';}',
    '.nfb-send:disabled{opacity:.7;cursor:default;}',
    '.nfb-send:focus-visible{outline:3px solid ' + ACCENT_DK + ';outline-offset:2px;}',
    '.nfb-credit{text-align:center;font-size:11.5px;color:#aeb4b8;padding:0 0 14px;}',

    '.nfb-success{padding:34px 26px 28px;text-align:center;}',
    '.nfb-success-ico{width:56px;height:56px;border-radius:50%;background:#fbede3;color:' + ACCENT_DK + ';display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}',
    '.nfb-success-ico svg{width:28px;height:28px;}',
    '.nfb-success h3{font-size:18px;font-weight:800;color:#1f2937;margin:0 0 6px;}',
    '.nfb-success p{font-size:14px;color:#6b7280;margin:0;line-height:1.5;}',
    '.nfb-ref{display:inline-block;margin:10px 0 16px;font-family:ui-monospace,Menlo,monospace;font-size:15px;font-weight:700;color:' + ACCENT_DK + ';background:#fbede3;border-radius:8px;padding:6px 13px;}',
    '.nfb-thumb{display:block;max-width:100%;border:1px solid #e5e7eb;border-radius:8px;margin:0 auto 18px;}',
    '.nfb-success-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;}',
    '.nfb-btn{height:40px;padding:0 18px;border-radius:999px;font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;}',
    '.nfb-btn-ghost{background:#fff;border:1px solid #d7dadd;color:#4c4d57;}',
    '.nfb-btn-ghost:hover{background:#f4f6f6;}',
    '.nfb-btn-primary{background:' + ACCENT + ';border:1px solid ' + ACCENT + ';color:#fff;}',
    '.nfb-btn-primary:hover{background:' + ACCENT_DK + ';}',

    '.nfb-toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);z-index:3006;background:#1f2937;color:#fff;',
      'font-family:Inter,sans-serif;font-size:13.5px;padding:11px 18px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.3);}',
    '.nfb-textedit{position:fixed;z-index:3004;border:1px dashed ' + INK_ANNOT + ';background:rgba(255,255,255,.9);color:' + INK_ANNOT + ';',
      'font-family:Inter,sans-serif;font-size:16px;font-weight:700;padding:2px 5px;outline:none;min-width:60px;border-radius:3px;}',

    '@media(max-width:560px){.nfb-panel{left:12px;top:64px;}}',
    '@media(prefers-reduced-motion:reduce){.nfb-tab,.nfb-tool,.nfb-send,.nfb-switch,.nfb-switch::after,.nfb-input,.nfb-ta,.nfb-hbtn{transition:none!important;}}'
  ].join('');
  var style = document.createElement('style');
  style.id = 'nfb-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Launcher tab ─── */
  var tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'nfb-tab';
  tab.innerHTML = I.nav + '<span class="t"></span>';
  function syncTab() {
    tab.querySelector('.t').textContent = T('fb.tab', 'Feedback');
    tab.setAttribute('aria-label', T('fb.tab', 'Feedback'));
  }
  syncTab();

  /* ── State ─── */
  var open = false, tool = 'select';
  var shapes = [], drawing = false, start = null, cur = null, penPts = null;
  var canvas, ctx, toolbar, panel, textInput = null;
  var lastFocus = null;

  /* ── Annotation canvas ─── */
  function p(e) { return { x: e.clientX, y: e.clientY }; }
  function resize() { if (!canvas) return; canvas.width = window.innerWidth; canvas.height = window.innerHeight; redraw(); }
  function drawShape(s) {
    ctx.strokeStyle = INK_ANNOT; ctx.fillStyle = INK_ANNOT; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (s.t === 'pen') {
      if (!s.pts.length) return;
      ctx.beginPath(); ctx.moveTo(s.pts[0].x, s.pts[0].y);
      for (var i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x, s.pts[i].y);
      ctx.stroke();
    } else if (s.t === 'line' || s.t === 'arrow') {
      ctx.beginPath(); ctx.moveTo(s.a.x, s.a.y); ctx.lineTo(s.b.x, s.b.y); ctx.stroke();
      if (s.t === 'arrow') {
        var ang = Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x), h = 13;
        ctx.beginPath(); ctx.moveTo(s.b.x, s.b.y);
        ctx.lineTo(s.b.x - h * Math.cos(ang - Math.PI / 7), s.b.y - h * Math.sin(ang - Math.PI / 7));
        ctx.moveTo(s.b.x, s.b.y);
        ctx.lineTo(s.b.x - h * Math.cos(ang + Math.PI / 7), s.b.y - h * Math.sin(ang + Math.PI / 7));
        ctx.stroke();
      }
    } else if (s.t === 'rect') {
      ctx.strokeRect(Math.min(s.a.x, s.b.x), Math.min(s.a.y, s.b.y), Math.abs(s.b.x - s.a.x), Math.abs(s.b.y - s.a.y));
    } else if (s.t === 'text') {
      ctx.font = '700 16px Inter, sans-serif'; ctx.textBaseline = 'top';
      ctx.fillText(s.text, s.a.x, s.a.y);
    }
  }
  function redraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < shapes.length; i++) drawShape(shapes[i]);
    if (drawing) {
      if (tool === 'pen') drawShape({ t: 'pen', pts: penPts });
      else if (cur) drawShape({ t: tool, a: start, b: cur });
    }
  }
  function onDown(e) {
    if (tool === 'select' || tool === 'record') return;
    if (tool === 'text') { placeText(p(e)); return; }
    drawing = true; start = p(e); cur = start;
    if (tool === 'pen') penPts = [start];
    try { if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId); } catch (err) {}
  }
  function onMove(e) { if (!drawing) return; cur = p(e); if (tool === 'pen') penPts.push(cur); redraw(); }
  function onUp() {
    if (!drawing) return; drawing = false;
    if (tool === 'pen') { if (penPts.length > 1) shapes.push({ t: 'pen', pts: penPts.slice() }); penPts = null; }
    else if (cur && (Math.abs(cur.x - start.x) > 3 || Math.abs(cur.y - start.y) > 3)) shapes.push({ t: tool, a: start, b: cur });
    cur = null; redraw();
  }
  function placeText(at) {
    if (textInput) commitText();
    textInput = document.createElement('input');
    textInput.type = 'text'; textInput.className = 'nfb-textedit';
    textInput.style.left = at.x + 'px'; textInput.style.top = at.y + 'px';
    textInput._at = at;
    document.body.appendChild(textInput); textInput.focus();
    textInput.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); commitText(); }
      else if (ev.key === 'Escape') { ev.stopPropagation(); if (textInput) { textInput.remove(); textInput = null; } }
    });
    textInput.addEventListener('blur', commitText);
  }
  function commitText() {
    if (!textInput) return;
    var v = textInput.value.trim(), at = textInput._at;
    textInput.remove(); textInput = null;
    if (v) { shapes.push({ t: 'text', a: at, text: v }); redraw(); }
  }

  function setTool(t) {
    tool = t;
    var btns = toolbar.querySelectorAll('.nfb-tool');
    for (var i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-tool') === t);
    var drawMode = (t !== 'select' && t !== 'record');
    canvas.style.pointerEvents = drawMode ? 'auto' : 'none';
    canvas.style.cursor = t === 'text' ? 'text' : (drawMode ? 'crosshair' : 'default');
  }

  /* ── Toolbar ─── */
  function buildToolbar() {
    toolbar = document.createElement('div');
    toolbar.className = 'nfb-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', T('fb.toolbar', 'Annotation tools'));
    var tools = [
      ['select', I.select, T('fb.toolSelect', 'Select')],
      ['pen', I.pen, T('fb.toolPen', 'Pen')],
      ['line', I.line, T('fb.toolLine', 'Line')],
      ['arrow', I.arrow, T('fb.toolArrow', 'Arrow')],
      ['rect', I.rect, T('fb.toolRect', 'Rectangle')],
      ['text', I.text, T('fb.toolText', 'Text')]
    ];
    var html = '';
    for (var i = 0; i < tools.length; i++) {
      html += '<button type="button" class="nfb-tool' + (tools[i][0] === 'select' ? ' active' : '') +
        '" data-tool="' + tools[i][0] + '" aria-label="' + esc(tools[i][2]) + '" title="' + esc(tools[i][2]) + '">' + tools[i][1] + '</button>';
    }
    html += '<span class="nfb-tool-sep"></span>' +
      '<button type="button" class="nfb-tool" data-tool="record" aria-label="' + esc(T('fb.toolRecord', 'Record')) + '" title="' + esc(T('fb.toolRecord', 'Record')) + '">' + I.record + '</button>';
    toolbar.innerHTML = html;
    toolbar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.nfb-tool') : null;
      if (!b) return;
      var t = b.getAttribute('data-tool');
      if (t === 'record') { toast(T('fb.recordNA', "Screen recording isn't available in the prototype.")); return; }
      setTool(t);
    });
  }

  function toast(msg) {
    var el = document.createElement('div');
    el.className = 'nfb-toast'; el.textContent = msg; el.setAttribute('role', 'status');
    document.body.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2600);
  }

  /* ── Panel ─── */
  function panelFormHTML() {
    var u = me();
    return '' +
      '<div class="nfb-head">' +
        '<div class="nfb-logo">' + I.nav + '</div>' +
        '<div class="nfb-head-btns">' +
          '<button type="button" class="nfb-hbtn" data-act="back" aria-label="' + esc(T('fb.close', 'Close')) + '">' + I.back + '</button>' +
          '<button type="button" class="nfb-hbtn" data-act="close" aria-label="' + esc(T('fb.close', 'Close')) + '">' + I.close + '</button>' +
        '</div>' +
        '<h2 class="nfb-greet" id="nfb-greet">' + esc(T('fb.greeting', 'Hi, please share your thoughts')) + '</h2>' +
      '</div>' +
      '<div class="nfb-body">' +
        '<input type="text" class="nfb-input" id="nfb-name" value="' + esc(u.name) + '" placeholder="' + esc(T('fb.namePh', 'Your name')) + '" aria-label="' + esc(T('fb.namePh', 'Your name')) + '">' +
        '<input type="email" class="nfb-input" id="nfb-email" value="' + esc(u.email) + '" placeholder="' + esc(T('fb.emailPh', 'Your email')) + '" aria-label="' + esc(T('fb.emailPh', 'Your email')) + '">' +
        '<textarea class="nfb-ta" id="nfb-comment" aria-describedby="nfb-cerr" placeholder="' + esc(T('fb.commentPh', 'Leave us your comment')) + '"></textarea>' +
        '<span class="nfb-errmsg" id="nfb-cerr">' + esc(T('fb.err', 'Please leave a comment.')) + '</span>' +
        '<div class="nfb-shot on" id="nfb-shot" role="switch" aria-checked="true" tabindex="0">' + I.cam +
          '<span class="lbl">' + esc(T('fb.screenshot', 'Screenshot')) + '</span><span class="nfb-switch"></span></div>' +
      '</div>' +
      '<div class="nfb-foot"><button type="button" class="nfb-send" id="nfb-send">' + esc(T('fb.send', 'Send feedback')) + '</button></div>' +
      '<div class="nfb-credit">' + esc(T('fb.credit', 'NETZSCH Customer Portal')) + '</div>';
  }

  function buildPanel() {
    panel = document.createElement('div');
    panel.className = 'nfb-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', 'nfb-greet');
    panel.innerHTML = panelFormHTML();
    wirePanel();
  }

  function wirePanel() {
    panel.querySelector('[data-act="close"]').addEventListener('click', close);
    panel.querySelector('[data-act="back"]').addEventListener('click', close);
    var shot = panel.querySelector('#nfb-shot');
    if (shot) {
      var toggle = function () {
        var on = shot.classList.toggle('on');
        shot.setAttribute('aria-checked', on ? 'true' : 'false');
      };
      shot.addEventListener('click', toggle);
      shot.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    }
    var comment = panel.querySelector('#nfb-comment'), cerr = panel.querySelector('#nfb-cerr');
    comment.addEventListener('input', function () { if (comment.value.trim()) { comment.classList.remove('nfb-err'); cerr.classList.remove('show'); } });
    panel.querySelector('#nfb-send').addEventListener('click', function () {
      if (!comment.value.trim()) { comment.classList.add('nfb-err'); cerr.classList.add('show'); comment.focus(); return; }
      var wantShot = panel.querySelector('#nfb-shot').classList.contains('on');
      var sendBtn = panel.querySelector('#nfb-send');
      if (wantShot) {
        sendBtn.disabled = true; sendBtn.textContent = T('fb.capturing', 'Capturing…');
        capture(function (dataUrl) { showSuccess(dataUrl); });
      } else {
        showSuccess(null);
      }
    });
  }

  function makeRef() {
    var t = Date.now().toString(36).toUpperCase().slice(-4);
    var r = Math.floor(Math.random() * 46656).toString(36).toUpperCase();
    while (r.length < 3) r = '0' + r;
    return 'FB-' + t + r;
  }

  function showSuccess(dataUrl) {
    var ref = makeRef();
    panel.innerHTML =
      '<div class="nfb-success">' +
        '<div class="nfb-success-ico">' + I.check + '</div>' +
        '<h3>' + esc(T('fb.successTitle', 'Thanks for your feedback!')) + '</h3>' +
        '<p>' + esc(T('fb.successDesc', "We've received it. Reference:")) + '</p>' +
        '<span class="nfb-ref">' + esc(ref) + '</span>' +
        (dataUrl ? '<img class="nfb-thumb" alt="Captured screenshot" src="' + dataUrl + '">' : '') +
        '<div class="nfb-success-cta">' +
          '<button type="button" class="nfb-btn nfb-btn-ghost" id="nfb-again">' + esc(T('fb.another', 'Send another')) + '</button>' +
          '<button type="button" class="nfb-btn nfb-btn-primary" id="nfb-done">' + esc(T('fb.close', 'Close')) + '</button>' +
        '</div>' +
      '</div>';
    panel.querySelector('#nfb-done').addEventListener('click', close);
    panel.querySelector('#nfb-again').addEventListener('click', function () {
      shapes = []; redraw(); panel.innerHTML = panelFormHTML(); wirePanel();
      var c = panel.querySelector('#nfb-comment'); if (c) c.focus();
    });
    var d = panel.querySelector('#nfb-done'); if (d) d.focus();
  }

  /* ── Screenshot capture (lazy html2canvas) ─── */
  function loadH2C(cb) {
    if (window.html2canvas) { cb(); return; }
    var s = document.createElement('script');
    s.src = scriptBase() + 'vendor/html2canvas.min.js';
    s.onload = function () { cb(); };
    s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }
  function capture(cb) {
    loadH2C(function () {
      if (!window.html2canvas) { cb(null); return; }
      var hidden = [toolbar, panel];
      for (var i = 0; i < hidden.length; i++) if (hidden[i]) hidden[i].style.visibility = 'hidden';
      try {
        window.html2canvas(document.body, { logging: false, useCORS: true, backgroundColor: '#ffffff', scale: 1 }).then(function (cv) {
          for (var j = 0; j < hidden.length; j++) if (hidden[j]) hidden[j].style.visibility = '';
          var url = null; try { url = cv.toDataURL('image/png'); } catch (e) { url = null; }
          cb(url);
        })['catch'](function () {
          for (var k = 0; k < hidden.length; k++) if (hidden[k]) hidden[k].style.visibility = '';
          cb(null);
        });
      } catch (e) {
        for (var m = 0; m < hidden.length; m++) if (hidden[m]) hidden[m].style.visibility = '';
        cb(null);
      }
    });
  }

  /* ── Open / close ─── */
  function openWidget() {
    if (open) return; open = true;
    lastFocus = document.activeElement;
    canvas = document.createElement('canvas'); canvas.className = 'nfb-canvas';
    document.body.appendChild(canvas); ctx = canvas.getContext('2d'); resize();
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('resize', resize);
    buildToolbar(); document.body.appendChild(toolbar);
    buildPanel(); document.body.appendChild(panel);
    setTool('select');
    tab.style.display = 'none';
    document.addEventListener('keydown', onKeydown);
    var c = panel.querySelector('#nfb-comment'); if (c) c.focus();
  }
  function close() {
    if (!open) return; open = false;
    if (textInput) { textInput.remove(); textInput = null; }
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('resize', resize);
    document.removeEventListener('keydown', onKeydown);
    [canvas, toolbar, panel].forEach(function (el) { if (el && el.parentNode) el.parentNode.removeChild(el); });
    canvas = ctx = toolbar = panel = null;
    shapes = []; drawing = false;
    tab.style.display = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKeydown(e) {
    if (e.key === 'Escape') { if (textInput) return; close(); }
  }

  tab.addEventListener('click', function () { open ? close() : openWidget(); });

  /* ── Mount ─── */
  function mount() {
    if (!document.body.contains(tab)) document.body.appendChild(tab);
    syncTab();
    if (location.hash === '#feedback' || location.hash === '#report-bug') openWidget();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();

  window.NetzschFeedback = { open: openWidget, close: close };
  window.NetzschBugReport = window.NetzschFeedback;
})();
