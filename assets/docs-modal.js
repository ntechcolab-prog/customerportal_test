/**
 * NETZSCH Customer Portal — Equipment Documents & Manuals Modal
 * Opens when clicking "Browse equipment documents and manuals" link.
 */
(function () {
  var docsLink = document.querySelector('.docs-link');
  if (!docsLink) return;

  // Get machine name from page
  var machineTitle = 'Equipment';
  var titleEl = document.querySelector('.machine-title');
  if (titleEl) machineTitle = titleEl.textContent.trim();

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = [
    '.docs-overlay { position:fixed; inset:0; background:rgba(0,30,27,0.45); z-index:500; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.3s ease; }',
    '.docs-overlay.open { opacity:1; pointer-events:auto; }',
    '.docs-modal { width:680px; max-height:85vh; background:#fff; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden; transform:scale(0.95) translateY(10px); transition:transform 0.3s cubic-bezier(0.32,0.72,0,1); }',
    '.docs-overlay.open .docs-modal { transform:scale(1) translateY(0); }',

    '.docs-header { padding:20px 24px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eaeaea; flex-shrink:0; }',
    '.docs-header-left { display:flex; flex-direction:column; gap:2px; }',
    '.docs-header-title { font-size:18px; font-weight:600; color:#2d2e33; letter-spacing:-0.38px; }',
    '.docs-header-subtitle { font-size:13px; color:#6b6e73; }',
    '.docs-header-close { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; font-size:18px; color:#6b6e73; transition:background 0.15s; }',
    '.docs-header-close:hover { background:#f3f4f6; }',

    '.docs-search { padding:16px 24px 0; flex-shrink:0; }',
    '.docs-search-input { width:100%; height:40px; border:1px solid #d4d6d8; border-radius:10px; padding:0 16px 0 40px; font-family:"Inter",sans-serif; font-size:14px; color:#2d2e33; background:#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca0a5\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cline x1=\'21\' y1=\'21\' x2=\'16.65\' y2=\'16.65\'/%3E%3C/svg%3E") no-repeat 14px center; outline:none; transition:border-color 0.15s; }',
    '.docs-search-input:focus { border-color:#007167; }',
    '.docs-search-input::placeholder { color:#9ca0a5; }',
    '.docs-no-results { padding:32px 0; text-align:center; color:#9ca0a5; font-size:14px; display:none; }',

    '.docs-body { flex:1; overflow-y:auto; padding:24px; }',

    '.docs-category { margin-bottom:24px; }',
    '.docs-category:last-child { margin-bottom:0; }',
    '.docs-category-title { font-size:12px; font-weight:700; color:#007167; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #eaeaea; }',

    '.docs-list { display:flex; flex-direction:column; gap:8px; }',

    '.docs-item { display:flex; align-items:center; gap:14px; padding:12px 16px; border-radius:10px; border:1px solid #eef0f2; transition:background 0.15s, border-color 0.15s; cursor:pointer; }',
    '.docs-item:hover { background:#f8f9fa; border-color:#d4d6d8; }',

    '.docs-item-icon { width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:11px; font-weight:700; color:#fff; }',
    '.docs-item-icon.pdf { background:#c73e20; }',
    '.docs-item-icon.dwg { background:#2563eb; }',

    '.docs-item-info { flex:1; display:flex; flex-direction:column; gap:2px; }',
    '.docs-item-name { font-size:14px; font-weight:500; color:#2d2e33; letter-spacing:-0.15px; }',
    '.docs-item-meta { font-size:12px; color:#9ca0a5; }',

    '.docs-item-download { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#007167; transition:background 0.15s; flex-shrink:0; }',
    '.docs-item-download:hover { background:#e8f5f3; }',
    '.docs-item-download svg { width:18px; height:18px; }',
  ].join('\n');
  document.head.appendChild(style);

  // ── Documents data (per machine) ──
  var docsData = {
    'Discus 30': {
      'Operating Manuals': [
        { name: 'Discus 30 — Operating Manual v3.2', type: 'pdf', size: '4.2 MB', date: 'Jan 2026' },
        { name: 'Discus 30 — Quick Start Guide', type: 'pdf', size: '1.1 MB', date: 'Jan 2026' },
      ],
      'Maintenance Guides': [
        { name: 'Discus 30 — Preventive Maintenance Schedule', type: 'pdf', size: '2.8 MB', date: 'Dec 2025' },
        { name: 'Discus 30 — Troubleshooting Guide', type: 'pdf', size: '3.5 MB', date: 'Nov 2025' },
      ],
      'Spare Parts Catalog': [
        { name: 'Discus 30 — Spare Parts Catalog 2026', type: 'pdf', size: '8.6 MB', date: 'Feb 2026' },
        { name: 'Discus 30 — Wear Parts Reference', type: 'pdf', size: '1.9 MB', date: 'Oct 2025' },
      ],
      'Certificates & Compliance': [
        { name: 'Discus 30 — CE Declaration of Conformity', type: 'pdf', size: '420 KB', date: 'Aug 2024' },
        { name: 'Discus 30 — Calibration Certificate', type: 'pdf', size: '380 KB', date: 'Mar 2026' },
        { name: 'Discus 30 — ATEX Compliance Report', type: 'pdf', size: '1.2 MB', date: 'Aug 2024' },
      ],
      'Technical Drawings': [
        { name: 'Discus 30 — General Assembly Drawing', type: 'dwg', size: '5.4 MB', date: 'Aug 2024' },
        { name: 'Discus 30 — Inlet Flange Detail', type: 'dwg', size: '2.1 MB', date: 'Aug 2024' },
      ],
    }
  };

  // Fallback for unknown machines
  var defaultDocs = docsData['Discus 30'];
  var machineDocs = docsData[machineTitle] || defaultDocs;

  // ── Build modal HTML ──
  var downloadSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  var bodyHtml = '';
  Object.keys(machineDocs).forEach(function (category) {
    bodyHtml += '<div class="docs-category">';
    bodyHtml += '<div class="docs-category-title">' + category + '</div>';
    bodyHtml += '<div class="docs-list">';
    machineDocs[category].forEach(function (doc) {
      bodyHtml += '<div class="docs-item">';
      bodyHtml += '<div class="docs-item-icon ' + doc.type + '">' + doc.type.toUpperCase() + '</div>';
      bodyHtml += '<div class="docs-item-info">';
      bodyHtml += '<span class="docs-item-name">' + doc.name + '</span>';
      bodyHtml += '<span class="docs-item-meta">' + doc.size + ' · Updated ' + doc.date + '</span>';
      bodyHtml += '</div>';
      bodyHtml += '<button class="docs-item-download" title="Download" aria-label="Download ' + doc.name + '">' + downloadSvg + '</button>';
      bodyHtml += '</div>';
    });
    bodyHtml += '</div></div>';
  });

  var overlay = document.createElement('div');
  overlay.className = 'docs-overlay';
  overlay.innerHTML =
    '<div class="docs-modal">' +
    '  <div class="docs-header">' +
    '    <div class="docs-header-left">' +
    '      <span class="docs-header-title">Documents & Manuals</span>' +
    '      <span class="docs-header-subtitle">' + machineTitle + '</span>' +
    '    </div>' +
    '    <button class="docs-header-close" aria-label="Close">&#x2715;</button>' +
    '  </div>' +
    '  <div class="docs-search"><input class="docs-search-input" type="text" placeholder="Search documents..." id="docsSearch"></div>' +
    '  <div class="docs-no-results" id="docsNoResults">No documents found.</div>' +
    '  <div class="docs-body" id="docsBody">' + bodyHtml + '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // ── Search / filter ──
  var searchInput = document.getElementById('docsSearch');
  var noResults = document.getElementById('docsNoResults');
  var docsBody = document.getElementById('docsBody');

  searchInput.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    var totalVisible = 0;

    docsBody.querySelectorAll('.docs-category').forEach(function (cat) {
      var catVisible = 0;
      cat.querySelectorAll('.docs-item').forEach(function (item) {
        var name = item.querySelector('.docs-item-name').textContent.toLowerCase();
        var meta = item.querySelector('.docs-item-meta').textContent.toLowerCase();
        var match = !q || name.indexOf(q) !== -1 || meta.indexOf(q) !== -1;
        item.style.display = match ? '' : 'none';
        if (match) catVisible++;
      });
      cat.style.display = catVisible > 0 ? '' : 'none';
      totalVisible += catVisible;
    });

    noResults.style.display = totalVisible === 0 ? '' : 'none';
  });

  // ── Events ──
  function openDocs(e) {
    e.preventDefault();
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
    overlay.classList.add('open');
    setTimeout(function () { searchInput.focus(); }, 300);
  }
  function closeDocs() {
    overlay.classList.remove('open');
  }

  docsLink.addEventListener('click', openDocs);
  overlay.querySelector('.docs-header-close').addEventListener('click', closeDocs);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDocs(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDocs();
  });
})();
