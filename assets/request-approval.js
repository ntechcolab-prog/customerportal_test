/**
 * NETZSCH Customer Portal — Request for Approval flow (Technician only)
 * Injects modal, handles form submission, shows confirmation.
 */
(function () {
  if (window.netzschUserRole !== 'technician') return;

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.rfa-overlay { position:fixed; inset:0; background:rgba(0,30,27,0.45); z-index:500; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.3s ease; }',
    '.rfa-overlay.open { opacity:1; pointer-events:auto; }',
    '.rfa-modal { width:520px; max-height:90vh; background:#fff; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden; transform:scale(0.95) translateY(10px); transition:transform 0.3s cubic-bezier(0.32,0.72,0,1); }',
    '.rfa-overlay.open .rfa-modal { transform:scale(1) translateY(0); }',

    '.rfa-header { background:linear-gradient(176deg,#007167 0%,#0b9c92 60%,#048a7f 100%); padding:20px 24px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }',
    '.rfa-header-title { font-size:17px; font-weight:600; color:#fff; letter-spacing:-0.38px; }',
    '.rfa-header-close { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; transition:background 0.15s; }',
    '.rfa-header-close:hover { background:rgba(255,255,255,0.15); }',
    '.rfa-header-close svg { width:16px; height:16px; stroke:#fff; }',

    '.rfa-body { padding:24px; overflow-y:auto; display:flex; flex-direction:column; gap:20px; }',

    '.rfa-product { display:flex; align-items:center; gap:16px; padding:16px; background:#f8f9fa; border-radius:12px; }',
    '.rfa-product-img { width:56px; height:56px; border-radius:8px; object-fit:contain; background:#fff; flex-shrink:0; }',
    '.rfa-product-img-placeholder { width:56px; height:56px; border-radius:8px; background:#eef0f2; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#9ca3af; }',
    '.rfa-product-info { display:flex; flex-direction:column; gap:2px; }',
    '.rfa-product-name { font-size:15px; font-weight:600; color:#2d2e33; letter-spacing:-0.23px; }',
    '.rfa-product-ref { font-size:13px; color:#6b6e73; }',

    '.rfa-field { display:flex; flex-direction:column; gap:6px; }',
    '.rfa-label { font-size:14px; font-weight:500; color:#4c4d57; letter-spacing:-0.15px; }',
    '.rfa-input, .rfa-select, .rfa-textarea { width:100%; border:1px solid #d4d6d8; border-radius:10px; padding:10px 16px; font-family:"Inter",sans-serif; font-size:14px; color:#2d2e33; background:#fff; outline:none; transition:border-color 0.15s; }',
    '.rfa-input:focus, .rfa-select:focus, .rfa-textarea:focus { border-color:#007167; }',
    '.rfa-select { appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' fill=\'none\'%3E%3Cpath d=\'M1 1.5l5 5 5-5\' stroke=\'%236b6e73\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 16px center; padding-right:40px; cursor:pointer; }',
    '.rfa-textarea { min-height:80px; resize:vertical; line-height:22px; }',
    '.rfa-input::placeholder, .rfa-textarea::placeholder { color:#9ca0a5; }',

    '.rfa-row { display:flex; gap:16px; }',
    '.rfa-row .rfa-field { flex:1; }',

    '.rfa-footer { padding:16px 24px 24px; flex-shrink:0; }',
    '.rfa-btn-submit { width:100%; height:48px; background:#007167; color:#fff; border:none; border-radius:999px; font-family:"Inter",sans-serif; font-size:16px; font-weight:600; letter-spacing:-0.31px; cursor:pointer; transition:background 0.15s; }',
    '.rfa-btn-submit:hover { background:#005f57; }',

    /* Confirmation state */
    '.rfa-confirmation { display:flex; flex-direction:column; align-items:center; gap:20px; padding:40px 24px; text-align:center; }',
    '.rfa-check-circle { width:64px; height:64px; border-radius:50%; background:#e8f5f3; display:flex; align-items:center; justify-content:center; }',
    '.rfa-check-circle svg { width:32px; height:32px; stroke:#007167; stroke-width:2.5; }',
    '.rfa-confirmation-title { font-size:20px; font-weight:600; color:#2d2e33; letter-spacing:-0.38px; }',
    '.rfa-confirmation-desc { font-size:14px; color:#6b6e73; line-height:22px; max-width:360px; }',
    '.rfa-confirmation-id { font-size:14px; font-weight:600; color:#007167; background:#e8f5f3; padding:8px 16px; border-radius:8px; }',
    '.rfa-btn-done { width:100%; height:48px; background:#007167; color:#fff; border:none; border-radius:999px; font-family:"Inter",sans-serif; font-size:16px; font-weight:600; cursor:pointer; transition:background 0.15s; margin-top:8px; }',
    '.rfa-btn-done:hover { background:#005f57; }',
  ].join('\n');
  document.head.appendChild(style);

  // ── Inject Modal HTML ──
  var overlay = document.createElement('div');
  overlay.className = 'rfa-overlay';
  overlay.id = 'rfaOverlay';
  overlay.innerHTML = [
    '<div class="rfa-modal">',
    '  <div class="rfa-header">',
    '    <span class="rfa-header-title">Request for Approval</span>',
    '    <button class="rfa-header-close" id="rfaClose" aria-label="Close">',
    '      <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    '    </button>',
    '  </div>',

    '  <div id="rfaForm">',
    '    <div class="rfa-body">',
    '      <div class="rfa-product" id="rfaProduct"></div>',

    '      <div class="rfa-row">',
    '        <div class="rfa-field">',
    '          <label class="rfa-label">Quantity *</label>',
    '          <input class="rfa-input" type="number" id="rfaQty" value="1" min="1">',
    '        </div>',
    '        <div class="rfa-field">',
    '          <label class="rfa-label">Priority *</label>',
    '          <select class="rfa-select" id="rfaPriority">',
    '            <option value="low">Low</option>',
    '            <option value="medium" selected>Medium</option>',
    '            <option value="high">High</option>',
    '            <option value="urgent">Urgent</option>',
    '          </select>',
    '        </div>',
    '      </div>',

    '      <div class="rfa-field">',
    '        <label class="rfa-label">Related Machine</label>',
    '        <select class="rfa-select" id="rfaMachine">',
    '          <option value="">Select a machine (optional)</option>',
    '          <option value="alpha-zeta-10">Alpha Zeta 10 — Grinding</option>',
    '          <option value="discus-30">Discus 30 — Dispersing</option>',
    '          <option value="zeta-60">Zeta 60 — Wet Grinding</option>',
    '          <option value="neos-03">NEOS 03 — Nano Milling</option>',
    '        </select>',
    '      </div>',

    '      <div class="rfa-field">',
    '        <label class="rfa-label">Justification *</label>',
    '        <textarea class="rfa-textarea" id="rfaJustification" placeholder="Explain why this part is needed (e.g., scheduled maintenance, component wear, machine failure)..."></textarea>',
    '      </div>',
    '    </div>',

    '    <div class="rfa-footer">',
    '      <button class="rfa-btn-submit" id="rfaSubmit">Request for Approval</button>',
    '    </div>',
    '  </div>',

    '  <div id="rfaConfirmation" style="display:none;">',
    '    <div class="rfa-confirmation">',
    '      <div class="rfa-check-circle">',
    '        <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    '      </div>',
    '      <div class="rfa-confirmation-title">Request Submitted</div>',
    '      <div class="rfa-confirmation-id" id="rfaRequestId"></div>',
    '      <div class="rfa-confirmation-desc">Your request has been sent to the approver for review. You will be notified when a decision is made.</div>',
    '      <button class="rfa-btn-done" id="rfaDone">Done</button>',
    '    </div>',
    '  </div>',

    '</div>'
  ].join('\n');
  document.body.appendChild(overlay);

  // ── State ──
  var currentProduct = {};

  // ── Open modal ──
  function openRfa(name, ref, imgSrc) {
    currentProduct = { name: name || 'Product', ref: ref || '', img: imgSrc || '' };

    // Build product preview
    var productEl = document.getElementById('rfaProduct');
    var imgHtml = currentProduct.img
      ? '<img class="rfa-product-img" src="' + currentProduct.img + '" alt="">'
      : '<div class="rfa-product-img-placeholder"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
    productEl.innerHTML = imgHtml +
      '<div class="rfa-product-info">' +
      '  <span class="rfa-product-name">' + currentProduct.name + '</span>' +
      (currentProduct.ref ? '  <span class="rfa-product-ref">Ref: ' + currentProduct.ref + '</span>' : '') +
      '</div>';

    // Reset form
    document.getElementById('rfaQty').value = 1;
    document.getElementById('rfaPriority').value = 'medium';
    document.getElementById('rfaMachine').value = '';
    document.getElementById('rfaJustification').value = '';
    document.getElementById('rfaForm').style.display = '';
    document.getElementById('rfaConfirmation').style.display = 'none';

    overlay.classList.add('open');
  }

  // ── Close modal ──
  function closeRfa() {
    overlay.classList.remove('open');
  }

  // ── Submit ──
  function submitRfa() {
    var justification = document.getElementById('rfaJustification').value.trim();
    if (!justification) {
      document.getElementById('rfaJustification').style.borderColor = '#c73e20';
      document.getElementById('rfaJustification').focus();
      return;
    }

    // Generate fake request ID
    var reqId = 'REQ-2026-' + String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById('rfaRequestId').textContent = reqId;

    // Show confirmation
    document.getElementById('rfaForm').style.display = 'none';
    document.getElementById('rfaConfirmation').style.display = '';
  }

  // ── Wire events ──
  document.getElementById('rfaClose').addEventListener('click', closeRfa);
  document.getElementById('rfaSubmit').addEventListener('click', submitRfa);
  document.getElementById('rfaDone').addEventListener('click', closeRfa);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeRfa(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeRfa();
  });

  // Reset justification border on input
  document.getElementById('rfaJustification').addEventListener('input', function () {
    this.style.borderColor = '';
  });

  // ── Intercept "Request for Approval" button clicks ──

  // Text-style buttons in spare parts tables (.add-to-cart)
  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    var row = btn.closest('tr');
    if (!row) return;
    var tds = row.querySelectorAll('td');
    var name = tds[3] ? tds[3].textContent.trim() : 'Spare Part';
    var ref = tds[2] ? tds[2].textContent.trim() : '';

    // Remove old event listeners by cloning
    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openRfa(name, ref, '');
    });
  });

  // Solid buttons in wishlist (.btn-add-cart) and shop product pages
  document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
    // Try to find product info from surrounding context
    var card = btn.closest('.wishlist-card, .product-detail, .product-sidebar, [class*="product"]');
    var name = 'Product';
    var ref = '';
    var imgSrc = '';

    if (card) {
      var nameEl = card.querySelector('.card-title, .product-name, .product-title, h1, h2');
      if (nameEl) name = nameEl.textContent.trim();
      var refEl = card.querySelector('.card-ref, .product-ref, .product-meta');
      if (refEl) ref = refEl.textContent.replace(/^Ref:\s*/i, '').trim();
      var imgEl = card.querySelector('img');
      if (imgEl) imgSrc = imgEl.src;
    }

    // Also try page-level product info (shop-product-detail pages)
    if (name === 'Product') {
      var h1 = document.querySelector('.product-title, .detail-title, h1');
      if (h1) name = h1.textContent.trim();
      var metaRef = document.querySelector('.product-ref, .product-meta, .detail-ref');
      if (metaRef) ref = metaRef.textContent.replace(/^Ref:\s*/i, '').trim();
      var mainImg = document.querySelector('.product-image img, .product-gallery img');
      if (mainImg) imgSrc = mainImg.src;
    }

    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openRfa(name, ref, imgSrc);
    });
  });

  // Expose for external use
  window.openRequestApproval = openRfa;
})();
