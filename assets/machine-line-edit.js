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

  function save(wrap, input) {
    var val = input.value.trim();
    if (!val) return;
    currentValue = val;
    lineEl.textContent = currentValue;
    localStorage.setItem(storageKey, currentValue);
    wrap.remove();
    lineEl.style.display = '';
    showToast('Machine label updated');
  }

  function cancel(wrap) {
    wrap.remove();
    lineEl.style.display = '';
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

  // Wire the existing edit button
  if (editBtn) {
    editBtn.addEventListener('click', function (e) {
      e.preventDefault();
      startEdit();
    });
  }
})();
