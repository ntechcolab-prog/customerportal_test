/**
 * NETZSCH Customer Portal — Editable Hourmeter
 * Renders an editable "Hourmeter" row inside the Machine Information block.
 *  - Old layout: appends to the ".card" (title "Machine Information") > ".fields".
 *  - New hero layout: appends a ".detail-row" to the "Machine Information" ".detail-col".
 * Value persists per machine in localStorage. Pencil in NETZSCH green.
 * Input accepts digits only; saving requires confirmation (critical machine data).
 */
(function () {
  var titleEl = document.querySelector('.hero-machine-name') || document.querySelector('.machine-title');
  var machineKey = titleEl ? titleEl.textContent.trim().replace(/\s+/g, '_').toLowerCase() : 'machine';
  var storageKey = 'netzsch_hourmeter_' + machineKey;

  var defaults = {
    'discus_30': '6.120',
    'zeta_60': '8.452',
    'mastermix_45': '10.256',
    'alpha_zeta_10': '10.256',
    'prophi': '6.580',
    'zeta_500': '210'
  };
  var currentHours = localStorage.getItem(storageKey) || defaults[machineKey] || '0';
  var pendingDigits = '';

  // ── Locate target container (old .fields OR new .detail-col) ──
  var fields = null, detailCol = null;
  var cardTitles = document.querySelectorAll('.card-title');
  for (var i = 0; i < cardTitles.length; i++) {
    if (cardTitles[i].textContent.trim() === 'Machine Information') {
      var card = cardTitles[i].closest('.card');
      if (card) fields = card.querySelector('.fields');
      break;
    }
  }
  if (!fields) {
    var colTitles = document.querySelectorAll('.detail-col-title');
    for (var j = 0; j < colTitles.length; j++) {
      if (colTitles[j].textContent.trim() === 'Machine Information') {
        detailCol = colTitles[j].closest('.detail-col');
        break;
      }
    }
  }
  if (!fields && !detailCol) return;

  var mode = fields ? 'old' : 'detail';
  var container = fields || detailCol;

  // ── Format a digit string with thousands separators (6120 → "6.120") ──
  function formatHours(digits) {
    digits = String(digits).replace(/\D/g, '').replace(/^0+(?=\d)/, '');
    if (!digits) digits = '0';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.hourmeter-row { display:grid; grid-template-columns:110px 1fr; gap:12px; align-items:center; }',
    '.hourmeter-value { display:inline-flex; align-items:center; gap:8px; }',
    '.hourmeter-value .hm-text { font-size:12px; font-weight:600; color:#374151; letter-spacing:-0.05px; font-variant-numeric:tabular-nums; }',
    '.hm-detail-value { display:inline-flex; align-items:center; gap:6px; justify-content:flex-end; }',
    '.hm-edit-btn { width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#007167; padding:0; transition:color 0.15s; flex-shrink:0; }',
    '.hm-edit-btn:hover { color:#005f57; }',
    '.hm-edit-btn svg { width:11px; height:11px; }',
    '.hm-input { width:78px; height:24px; border:1px solid #007167; border-radius:6px; padding:0 6px; font-family:"Inter",sans-serif; font-size:11px; font-weight:600; color:#374151; outline:none; font-variant-numeric:tabular-nums; }',
    '.hm-input:focus { box-shadow:0 0 0 2px rgba(0,113,103,0.15); }',
    '.hm-unit { font-size:11px; color:#9ca3af; }',
    '.hm-save, .hm-cancel { width:22px; height:22px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; border:none; cursor:pointer; transition:background 0.15s; flex-shrink:0; }',
    '.hm-save { background:#007167; color:#fff; }',
    '.hm-save:hover { background:#005f57; }',
    '.hm-cancel { background:#f3f4f6; color:#6b6e73; }',
    '.hm-cancel:hover { background:#e5e7eb; }',
    '.hm-save svg, .hm-cancel svg { width:11px; height:11px; }',
    '.hourmeter-toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:#007167; color:#fff; padding:12px 24px; border-radius:10px; font-family:"Inter",sans-serif; font-size:14px; font-weight:500; box-shadow:0 8px 24px rgba(0,0,0,0.15); z-index:600; opacity:0; transition:transform 0.3s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease; pointer-events:none; }',
    '.hourmeter-toast.show { transform:translateX(-50%) translateY(0); opacity:1; }',
    /* ── Confirmation modal (padrão do projeto — modal centralizado) ── */
    '.hm-modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:1000; align-items:center; justify-content:center; }',
    '.hm-modal-overlay.open { display:flex; }',
    '.hm-modal { background:#fff; border-radius:14px; padding:32px; width:420px; max-width:90vw; box-shadow:0 20px 60px rgba(0,0,0,0.15); text-align:center; }',
    '.hm-modal-icon { width:48px; height:48px; border-radius:50%; background:#e5f5f4; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; }',
    '.hm-modal-icon svg { width:24px; height:24px; color:#007167; }',
    '.hm-modal-title { font-size:18px; font-weight:700; color:#1f2937; margin-bottom:8px; }',
    '.hm-modal-text { font-size:14px; color:#6b7280; line-height:1.5; margin-bottom:24px; }',
    '.hm-modal-text .hm-old { color:#9ca3af; text-decoration:line-through; font-weight:600; font-variant-numeric:tabular-nums; }',
    '.hm-modal-text .hm-new { color:#007167; font-weight:700; font-variant-numeric:tabular-nums; }',
    '.hm-modal-actions { display:flex; gap:12px; justify-content:center; }'
  ].join('\n');
  document.head.appendChild(style);

  var pencilSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var closeSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var clockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';

  // ── Toast ──
  var toast = document.querySelector('.hourmeter-toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'hourmeter-toast'; document.body.appendChild(toast); }
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 2500);
  }

  // ── Confirmation modal (built once, reused) ──
  var modalOverlay = document.createElement('div');
  modalOverlay.className = 'hm-modal-overlay';
  modalOverlay.innerHTML = [
    '<div class="hm-modal" role="dialog" aria-modal="true" aria-labelledby="hmModalTitle">',
    '  <div class="hm-modal-icon">' + clockSvg + '</div>',
    '  <div class="hm-modal-title" id="hmModalTitle">Confirm hourmeter update</div>',
    '  <div class="hm-modal-text">You are about to change this machine’s hourmeter from <span class="hm-old" id="hmModalOld"></span> to <span class="hm-new" id="hmModalNew"></span>. This is critical data used for maintenance planning and service — please confirm the new reading is correct.</div>',
    '  <div class="hm-modal-actions">',
    '    <button type="button" class="btn btn-secondary" id="hmModalCancel">Cancel</button>',
    '    <button type="button" class="btn btn-primary" id="hmModalConfirm">Confirm update</button>',
    '  </div>',
    '</div>'
  ].join('\n');
  document.body.appendChild(modalOverlay);

  function openConfirm(newDigits) {
    pendingDigits = newDigits;
    modalOverlay.querySelector('#hmModalOld').textContent = currentHours + 'h';
    modalOverlay.querySelector('#hmModalNew').textContent = formatHours(newDigits) + 'h';
    modalOverlay.classList.add('open');
    modalOverlay.querySelector('#hmModalConfirm').focus();
  }
  function closeConfirm() { modalOverlay.classList.remove('open'); }
  function confirmSave() {
    currentHours = formatHours(pendingDigits);
    try { localStorage.setItem(storageKey, currentHours); } catch (e) {}
    closeConfirm();
    renderDisplay();
    showToast('Hourmeter updated to ' + currentHours + 'h');
  }
  modalOverlay.querySelector('#hmModalConfirm').addEventListener('click', confirmSave);
  modalOverlay.querySelector('#hmModalCancel').addEventListener('click', closeConfirm);
  modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeConfirm(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) { e.preventDefault(); closeConfirm(); }
  });

  // ── Row ──
  var rowEl = document.createElement('div');
  rowEl.className = (mode === 'old') ? 'hourmeter-row' : 'detail-row';
  container.appendChild(rowEl);

  function renderDisplay() {
    var display =
      '<span class="hm-text">' + currentHours + 'h</span>' +
      '<button class="hm-edit-btn" title="Update hourmeter" aria-label="Update hourmeter">' + pencilSvg + '</button>';
    if (mode === 'old') {
      rowEl.innerHTML = '<span class="field-label">Hourmeter:</span><div class="hourmeter-value">' + display + '</div>';
    } else {
      rowEl.innerHTML = '<span class="detail-label">Hourmeter</span><span class="detail-value hm-detail-value">' + display + '</span>';
    }
    rowEl.querySelector('.hm-edit-btn').addEventListener('click', renderEdit);
  }

  function renderEdit() {
    var edit =
      '<input class="hm-input" type="text" inputmode="numeric" maxlength="7" value="' + currentHours.replace(/\D/g, '') + '" aria-label="Hourmeter value (numbers only)">' +
      '<span class="hm-unit">h</span>' +
      '<button class="hm-save" title="Save" aria-label="Save">' + checkSvg + '</button>' +
      '<button class="hm-cancel" title="Cancel" aria-label="Cancel">' + closeSvg + '</button>';
    if (mode === 'old') {
      rowEl.innerHTML = '<span class="field-label">Hourmeter:</span><div class="hourmeter-value">' + edit + '</div>';
    } else {
      rowEl.innerHTML = '<span class="detail-label">Hourmeter</span><span class="detail-value hm-detail-value">' + edit + '</span>';
    }
    var input = rowEl.querySelector('.hm-input');
    input.focus();
    input.select();
    // números apenas — remove qualquer coisa que não seja dígito (inclui colar)
    input.addEventListener('input', function () {
      var caret = this.selectionStart;
      var before = this.value;
      this.value = this.value.replace(/\D/g, '');
      if (this.value !== before) { try { this.setSelectionRange(caret - 1, caret - 1); } catch (e) {} }
    });
    rowEl.querySelector('.hm-save').addEventListener('click', save);
    rowEl.querySelector('.hm-cancel').addEventListener('click', renderDisplay);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); save(); }
      else if (e.key === 'Escape') { e.preventDefault(); renderDisplay(); }
    });
  }

  function save() {
    var raw = rowEl.querySelector('.hm-input').value.replace(/\D/g, '');
    if (!raw) return;                                   // vazio/inválido → mantém edição
    if (formatHours(raw) === currentHours) { renderDisplay(); return; }  // sem mudança → não confirma
    openConfirm(raw);                                   // dado sensível → pede confirmação
  }

  renderDisplay();
})();
