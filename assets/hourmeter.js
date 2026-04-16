/**
 * NETZSCH Customer Portal — Hourmeter inline edit
 * Adds editable Hourmeter field to Machine Information card.
 */
(function () {
  // Find Machine Information card
  var cards = document.querySelectorAll('.card-title');
  var machineInfoCard = null;
  cards.forEach(function (t) {
    if (t.textContent.trim() === 'Machine Information') machineInfoCard = t.closest('.card');
  });
  if (!machineInfoCard) return;

  // Get machine name for localStorage key
  var titleEl = document.querySelector('.machine-title');
  var machineKey = titleEl ? titleEl.textContent.trim().replace(/\s+/g, '_').toLowerCase() : 'machine';
  var storageKey = 'netzsch_hourmeter_' + machineKey;

  // Default hours per machine
  var defaults = {
    'discus_30': '6.120',
    'zeta_60': '8.452',
    'mastermix_45': '10.256',
    'alpha_zeta_10': '10.256'
  };
  var currentHours = localStorage.getItem(storageKey) || defaults[machineKey] || '0';

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.hourmeter-row { display:grid; grid-template-columns:110px 1fr; gap:12px; align-items:center; }',
    '.hourmeter-value { display:inline-flex; align-items:center; gap:8px; }',
    '.hourmeter-text { font-size:12px; font-weight:600; color:#374151; letter-spacing:-0.05px; font-variant-numeric:tabular-nums; }',
    '.hourmeter-edit-btn { width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#9ca3af; padding:0; transition:color 0.15s; flex-shrink:0; }',
    '.hourmeter-edit-btn:hover { color:#007167; }',
    '.hourmeter-edit-btn svg { width:11px; height:11px; }',
    '.hourmeter-input-wrap { display:inline-flex; align-items:center; gap:6px; }',
    '.hourmeter-input { width:90px; height:28px; border:1px solid #007167; border-radius:6px; padding:0 8px; font-family:"Inter",sans-serif; font-size:12px; font-weight:600; color:#374151; outline:none; font-variant-numeric:tabular-nums; }',
    '.hourmeter-input:focus { box-shadow:0 0 0 2px rgba(0,113,103,0.15); }',
    '.hourmeter-unit { font-size:12px; color:#9ca3af; }',
    '.hourmeter-save, .hourmeter-cancel { width:24px; height:24px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:background 0.15s; }',
    '.hourmeter-save { background:#007167; color:#fff; }',
    '.hourmeter-save:hover { background:#005f57; }',
    '.hourmeter-cancel { background:#f3f4f6; color:#6b6e73; }',
    '.hourmeter-cancel:hover { background:#e5e7eb; }',
    '.hourmeter-save svg, .hourmeter-cancel svg { width:12px; height:12px; }',
    '.hourmeter-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:#007167; color:#fff; padding:12px 24px; border-radius:10px; font-family:"Inter",sans-serif; font-size:14px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,0.15); z-index:600; opacity:0; transition:transform 0.3s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease; pointer-events:none; }',
    '.hourmeter-toast.show { transform:translateX(-50%) translateY(0); opacity:1; }',
  ].join('\n');
  document.head.appendChild(style);

  // ── Build hourmeter row ──
  var fields = machineInfoCard.querySelector('.fields');
  if (!fields) return;

  var row = document.createElement('div');
  row.className = 'hourmeter-row';

  var pencilSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function renderDisplay() {
    row.innerHTML =
      '<span class="field-label">Hourmeter:</span>' +
      '<div class="hourmeter-value">' +
      '  <span class="hourmeter-text">' + currentHours + 'h</span>' +
      '  <button class="hourmeter-edit-btn" title="Update hourmeter" aria-label="Update hourmeter">' + pencilSvg + '</button>' +
      '</div>';
    row.querySelector('.hourmeter-edit-btn').addEventListener('click', renderEdit);
  }

  function renderEdit() {
    row.innerHTML =
      '<span class="field-label">Hourmeter:</span>' +
      '<div class="hourmeter-input-wrap">' +
      '  <input class="hourmeter-input" type="text" value="' + currentHours + '" id="hourmeterInput">' +
      '  <span class="hourmeter-unit">h</span>' +
      '  <button class="hourmeter-save" title="Save" aria-label="Save">' + checkSvg + '</button>' +
      '  <button class="hourmeter-cancel" title="Cancel" aria-label="Cancel">' + closeSvg + '</button>' +
      '</div>';

    var input = row.querySelector('.hourmeter-input');
    input.focus();
    input.select();

    row.querySelector('.hourmeter-save').addEventListener('click', save);
    row.querySelector('.hourmeter-cancel').addEventListener('click', renderDisplay);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') renderDisplay();
    });
  }

  function save() {
    var input = row.querySelector('.hourmeter-input');
    var val = input.value.trim();
    if (!val) return;
    currentHours = val;
    localStorage.setItem(storageKey, currentHours);
    renderDisplay();
    showToast('Hourmeter updated to ' + currentHours + 'h');
  }

  // ── Toast ──
  var toast = document.createElement('div');
  toast.className = 'hourmeter-toast';
  document.body.appendChild(toast);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

  // ── Insert row ──
  fields.appendChild(row);
  renderDisplay();
})();
