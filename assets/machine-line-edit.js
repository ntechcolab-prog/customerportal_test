/**
 * NETZSCH Customer Portal — Machine line/subtitle inline edit
 * Makes the subtitle below the machine name editable.
 */
(function () {
  var lineEl = document.querySelector('.machine-line');
  if (!lineEl) return;

  // Use existing edit button (pencil next to machine name) to trigger edit
  var editBtn = document.querySelector('.machine-edit-btn');

  // Storage key based on machine name
  var titleEl = document.querySelector('.machine-title');
  var machineKey = titleEl ? titleEl.textContent.trim().replace(/\s+/g, '_').toLowerCase() : 'machine';
  var storageKey = 'netzsch_line_' + machineKey;

  // Restore saved value
  var saved = localStorage.getItem(storageKey);
  if (saved) lineEl.textContent = saved;

  var currentValue = lineEl.textContent.trim();

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.machine-line-editing { display:inline-flex; align-items:center; gap:6px; margin-top:2px; }',
    '.machine-line-input { height:24px; border:1px solid #007167; border-radius:6px; padding:0 8px; font-family:"Inter",sans-serif; font-size:11px; font-weight:500; color:#374151; text-transform:uppercase; letter-spacing:0.5px; outline:none; width:180px; }',
    '.machine-line-input:focus { box-shadow:0 0 0 2px rgba(0,113,103,0.15); }',
    '.machine-line-save, .machine-line-cancel { width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:background 0.15s; }',
    '.machine-line-save { background:#007167; color:#fff; }',
    '.machine-line-save:hover { background:#005f57; }',
    '.machine-line-cancel { background:#f3f4f6; color:#6b6e73; }',
    '.machine-line-cancel:hover { background:#e5e7eb; }',
    '.machine-line-save svg, .machine-line-cancel svg { width:10px; height:10px; }',
    '.machine-line-edit-btn { width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#007167; padding:0; transition:color 0.15s; flex-shrink:0; }',
    '.machine-line-edit-btn:hover { color:#005f57; }',
    '.machine-line-edit-btn svg { width:11px; height:11px; }',
  ].join('\n');
  document.head.appendChild(style);

  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function startEdit() {
    var parent = lineEl.parentNode;
    var wrap = document.createElement('div');
    wrap.className = 'machine-line-editing';
    wrap.innerHTML =
      '<input class="machine-line-input" type="text" value="' + currentValue + '">' +
      '<button class="machine-line-save" title="Save" aria-label="Save">' + checkSvg + '</button>' +
      '<button class="machine-line-cancel" title="Cancel" aria-label="Cancel">' + closeSvg + '</button>';

    lineEl.style.display = 'none';
    parent.insertBefore(wrap, lineEl.nextSibling);

    var input = wrap.querySelector('.machine-line-input');
    input.focus();
    input.select();

    wrap.querySelector('.machine-line-save').addEventListener('click', function () { save(wrap, input); });
    wrap.querySelector('.machine-line-cancel').addEventListener('click', function () { cancel(wrap); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') save(wrap, input);
      if (e.key === 'Escape') cancel(wrap);
    });
  }

  function restoreLineEl() {
    lineEl.textContent = currentValue;
    lineEl.style.display = 'inline-flex';
    lineEl.style.alignItems = 'center';
    lineEl.style.gap = '6px';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'machine-line-edit-btn';
    btn.setAttribute('aria-label', 'Edit label');
    btn.title = 'Edit label';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    lineEl.appendChild(btn);
    btn.addEventListener('click', function (e) { e.preventDefault(); startEdit(); });
  }

  function save(wrap, input) {
    var val = input.value.trim();
    if (!val) return;
    currentValue = val;
    localStorage.setItem(storageKey, currentValue);
    wrap.remove();
    restoreLineEl();
    showToast('Machine label updated');
  }

  function cancel(wrap) {
    wrap.remove();
    restoreLineEl();
  }

  // ── Toast (reuse existing or create) ──
  function showToast(msg) {
    var existing = document.querySelector('.hourmeter-toast');
    if (existing) {
      existing.textContent = msg;
      existing.classList.add('show');
      setTimeout(function () { existing.classList.remove('show'); }, 2500);
      return;
    }
    var t = document.createElement('div');
    t.className = 'hourmeter-toast show';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.remove('show'); }, 2500);
    setTimeout(function () { t.remove(); }, 3000);
  }

  // Move edit button next to subtitle and restyle
  if (editBtn) {
    editBtn.remove();
    lineEl.style.display = 'inline-flex';
    lineEl.style.alignItems = 'center';
    lineEl.style.gap = '6px';

    var inlineBtn = document.createElement('button');
    inlineBtn.type = 'button';
    inlineBtn.className = 'machine-line-edit-btn';
    inlineBtn.setAttribute('aria-label', 'Edit label');
    inlineBtn.title = 'Edit label';
    inlineBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    lineEl.appendChild(inlineBtn);

    inlineBtn.addEventListener('click', function (e) {
      e.preventDefault();
      startEdit();
    });
  }
})();

/**
 * New hero layout (machine-discus30, machine-zeta60): make the production-line
 * badge (.hero-line-badge, e.g. "LINE 1") editable via a small pencil button.
 * Self-contained; no-ops on pages without the badge.
 */
(function () {
  var badge = document.querySelector('.hero-line-badge');
  if (!badge || badge.getAttribute('data-line-editable')) return;
  badge.setAttribute('data-line-editable', 'true');

  // Persist per machine
  var titleEl = document.querySelector('.hero-machine-name') || document.querySelector('.machine-title');
  var machineKey = titleEl ? titleEl.textContent.trim().replace(/\s+/g, '_').toLowerCase() : 'machine';
  var storageKey = 'netzsch_line_' + machineKey;
  var saved = null;
  try { saved = localStorage.getItem(storageKey); } catch (e) {}
  if (saved) badge.textContent = saved;

  // ── Inject CSS (once) ──
  if (!document.getElementById('hero-line-edit-styles')) {
    var style = document.createElement('style');
    style.id = 'hero-line-edit-styles';
    style.textContent = [
      '.hero-line-row { display:flex; align-items:center; gap:6px; margin-bottom:8px; align-self:flex-start; }',
      '.hero-line-row .hero-line-badge { margin-bottom:0; }',
      '.hero-line-edit-btn { width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; border-radius:6px; cursor:pointer; color:#007167; padding:0; transition:background 0.15s, color 0.15s; flex-shrink:0; }',
      '.hero-line-edit-btn:hover { background:#e8f5f3; color:#005f57; }',
      '.hero-line-edit-btn:focus-visible { outline:2px solid #007167; outline-offset:2px; }',
      '.hero-line-edit-btn svg { width:12px; height:12px; }',
      '.hero-line-input { height:24px; border:1px solid #007167; border-radius:6px; padding:0 8px; font-family:"Inter",sans-serif; font-size:10px; font-weight:600; color:#1d1d1f; text-transform:uppercase; letter-spacing:0.08em; outline:none; width:160px; }',
      '.hero-line-input:focus { box-shadow:0 0 0 3px rgba(0,113,103,0.12); }',
      '.hero-line-save, .hero-line-cancel { width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:background 0.15s; flex-shrink:0; }',
      '.hero-line-save { background:#007167; color:#fff; }',
      '.hero-line-save:hover { background:#005f57; }',
      '.hero-line-cancel { background:#f3f4f6; color:#6b6e73; }',
      '.hero-line-cancel:hover { background:#e5e7eb; }',
      '.hero-line-save svg, .hero-line-cancel svg { width:11px; height:11px; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  var pencilSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  // Wrap badge in a row and add the pencil button next to it
  var row = document.createElement('span');
  row.className = 'hero-line-row';
  badge.parentNode.insertBefore(row, badge);
  row.appendChild(badge);

  var editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'hero-line-edit-btn';
  editBtn.setAttribute('aria-label', 'Edit production line name');
  editBtn.title = 'Edit production line';
  editBtn.innerHTML = pencilSvg;
  row.appendChild(editBtn);
  editBtn.addEventListener('click', function (e) { e.preventDefault(); startEdit(); });

  function startEdit() {
    var currentValue = badge.textContent.trim();
    badge.style.display = 'none';
    editBtn.style.display = 'none';

    var editWrap = document.createElement('span');
    editWrap.className = 'hero-line-editing';
    editWrap.style.cssText = 'display:inline-flex; align-items:center; gap:6px;';
    editWrap.innerHTML =
      '<input class="hero-line-input" type="text" maxlength="40" value="' + currentValue.replace(/"/g, '&quot;') + '" aria-label="Production line name">' +
      '<button type="button" class="hero-line-save" title="Save" aria-label="Save">' + checkSvg + '</button>' +
      '<button type="button" class="hero-line-cancel" title="Cancel" aria-label="Cancel">' + closeSvg + '</button>';
    row.appendChild(editWrap);

    var input = editWrap.querySelector('.hero-line-input');
    input.focus();
    input.select();

    function finishSave() {
      var val = input.value.trim();
      if (val) {
        badge.textContent = val;
        try { localStorage.setItem(storageKey, val); } catch (e) {}
        showToast('Production line updated');
      }
      cleanup();
    }
    function cleanup() {
      editWrap.remove();
      badge.style.display = '';
      editBtn.style.display = '';
    }

    editWrap.querySelector('.hero-line-save').addEventListener('click', finishSave);
    editWrap.querySelector('.hero-line-cancel').addEventListener('click', cleanup);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); finishSave(); }
      else if (e.key === 'Escape') { e.preventDefault(); cleanup(); }
    });
  }

  function showToast(msg) {
    var existing = document.querySelector('.hourmeter-toast');
    if (existing) {
      existing.textContent = msg;
      existing.classList.add('show');
      setTimeout(function () { existing.classList.remove('show'); }, 2500);
      return;
    }
    var t = document.createElement('div');
    t.className = 'hourmeter-toast show';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.remove('show'); }, 2500);
    setTimeout(function () { t.remove(); }, 3000);
  }
})();

/**
 * Hero layout (machine-discus30): standardized editable meta rows (.hero-meta).
 * One row = label + value + pencil. Driven by data-attributes on .hero-meta:
 *   data-field="text"|"date", data-store=<key prefix>, data-aria, data-toast.
 * Text edits inline; date edits via a native picker, shown as dd/mm/yyyy.
 * Persists locally per machine. Self-contained; no-ops without .hero-meta.
 */
(function () {
  var fields = document.querySelectorAll('.hero-meta');
  if (!fields.length) return;

  var titleEl = document.querySelector('.hero-machine-name') || document.querySelector('.machine-title');
  var machineKey = titleEl ? titleEl.textContent.trim().replace(/\s+/g, '_').toLowerCase() : 'machine';

  function formatDMY(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || '');
  }
  function isISO(v) { return /^\d{4}-\d{2}-\d{2}$/.test(v || ''); }
  function esc(s) { return String(s).replace(/"/g, '&quot;'); }

  // ── Inject CSS (once) — pencil in NETZSCH green ──
  if (!document.getElementById('hero-meta-edit-styles')) {
    var style = document.createElement('style');
    style.id = 'hero-meta-edit-styles';
    style.textContent = [
      '.hero-meta-edit-btn { width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; border-radius:6px; cursor:pointer; color:#007167; padding:0; transition:background 0.15s, color 0.15s; flex-shrink:0; }',
      '.hero-meta-edit-btn:hover { background:#e8f5f3; color:#005f57; }',
      '.hero-meta-edit-btn:focus-visible { outline:2px solid #007167; outline-offset:2px; }',
      '.hero-meta-edit-btn svg { width:12px; height:12px; }',
      '.hero-meta-input { height:26px; width:160px; max-width:60vw; border:1px solid #007167; border-radius:6px; padding:0 8px; font-family:"Inter",sans-serif; font-size:12px; color:#374151; outline:none; }',
      '.hero-meta-input:focus { box-shadow:0 0 0 3px rgba(0,113,103,0.12); }',
      '.hero-meta-editing { display:inline-flex; align-items:center; gap:6px; }',
      '.hero-meta-save, .hero-meta-cancel { width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:background 0.15s; flex-shrink:0; }',
      '.hero-meta-save { background:#007167; color:#fff; }',
      '.hero-meta-save:hover { background:#005f57; }',
      '.hero-meta-cancel { background:#f3f4f6; color:#6b6e73; }',
      '.hero-meta-cancel:hover { background:#e5e7eb; }',
      '.hero-meta-save svg, .hero-meta-cancel svg { width:11px; height:11px; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  var pencilSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  for (var i = 0; i < fields.length; i++) initField(fields[i]);

  function initField(wrap) {
    if (wrap.getAttribute('data-editable')) return;
    // The production-line field is handled by machine-line-select.js (dropdown
    // from the managed lines store), not by this free-text editor.
    if (wrap.getAttribute('data-store') === 'netzsch_line') return;
    var valueEl = wrap.querySelector('.hero-meta-value');
    if (!valueEl) return;
    wrap.setAttribute('data-editable', 'true');

    var type = wrap.getAttribute('data-field') === 'date' ? 'date' : 'text';
    var storageKey = (wrap.getAttribute('data-store') || 'netzsch_meta') + '_' + machineKey;
    var toast = wrap.getAttribute('data-toast') || 'Updated';
    var aria = wrap.getAttribute('data-aria') || 'Edit';

    // Restore saved value
    var saved = null;
    try { saved = localStorage.getItem(storageKey); } catch (e) {}
    if (saved) {
      if (type === 'date') {
        if (isISO(saved)) { valueEl.setAttribute('data-date', saved); valueEl.textContent = formatDMY(saved); }
      } else {
        valueEl.textContent = saved;
      }
    }

    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'hero-meta-edit-btn';
    editBtn.setAttribute('aria-label', aria);
    editBtn.title = aria;
    editBtn.innerHTML = pencilSvg;
    wrap.appendChild(editBtn);
    editBtn.addEventListener('click', function (e) { e.preventDefault(); startEdit(); });

    function startEdit() {
      valueEl.style.display = 'none';
      editBtn.style.display = 'none';

      var editWrap = document.createElement('span');
      editWrap.className = 'hero-meta-editing';
      var inputHtml = type === 'date'
        ? '<input class="hero-meta-input" type="date" value="' + (valueEl.getAttribute('data-date') || '') + '" aria-label="' + esc(aria) + '">'
        : '<input class="hero-meta-input" type="text" maxlength="40" value="' + esc(valueEl.textContent.trim()) + '" aria-label="' + esc(aria) + '">';
      editWrap.innerHTML = inputHtml +
        '<button type="button" class="hero-meta-save" title="Save" aria-label="Save">' + checkSvg + '</button>' +
        '<button type="button" class="hero-meta-cancel" title="Cancel" aria-label="Cancel">' + closeSvg + '</button>';
      wrap.appendChild(editWrap);

      var input = editWrap.querySelector('.hero-meta-input');
      input.focus();
      if (type !== 'date') input.select();

      function finishSave() {
        var val = input.value;
        if (type === 'date') {
          if (isISO(val)) {
            valueEl.setAttribute('data-date', val);
            valueEl.textContent = formatDMY(val);
            persist(val);
            showToast(toast);
          }
        } else {
          val = val.trim();
          if (val) { valueEl.textContent = val; persist(val); showToast(toast); }
        }
        cleanup();
      }
      function persist(v) { try { localStorage.setItem(storageKey, v); } catch (e) {} }
      function cleanup() {
        editWrap.remove();
        valueEl.style.display = '';
        editBtn.style.display = '';
      }

      editWrap.querySelector('.hero-meta-save').addEventListener('click', finishSave);
      editWrap.querySelector('.hero-meta-cancel').addEventListener('click', cleanup);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); finishSave(); }
        else if (e.key === 'Escape') { e.preventDefault(); cleanup(); }
      });
    }
  }

  function showToast(msg) {
    var existing = document.querySelector('.hourmeter-toast');
    if (existing) {
      existing.textContent = msg;
      existing.classList.add('show');
      setTimeout(function () { existing.classList.remove('show'); }, 2500);
      return;
    }
    var t = document.createElement('div');
    t.className = 'hourmeter-toast show';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.remove('show'); }, 2500);
    setTimeout(function () { t.remove(); }, 3000);
  }
})();
