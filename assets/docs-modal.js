/**
 * NETZSCH Customer Portal — Equipment Documents & Manuals Modal
 * Opens when clicking the "Documents and Manuals" card on a machine page.
 *
 * Data comes from the shared DocsStore (assets/docs-store.js): documents are
 * grouped into the 5 real categories and filtered by the current user's role,
 * so a customer only sees the documents an Admin made visible to their profile.
 */
(function () {
  var docsLink = document.querySelector('.docs-link');
  if (!docsLink) return;
  if (!window.DocsStore) return; // store must load before this script

  // ── Which machine + which role are we on? ──
  var file = (location.pathname.split('/').pop() || '');
  var machineId = file.replace(/^machine-/, '').replace(/\.html$/, '');
  var role = 'administrator';
  try { role = localStorage.getItem('netzsch_user_role') || 'administrator'; } catch (e) {}

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

    '.docs-search { padding:16px 24px 0; flex-shrink:0; display:flex; align-items:center; gap:12px; }',
    '.docs-search-input { flex:1; min-width:0; height:40px; border:1px solid #d4d6d8; border-radius:10px; padding:0 16px 0 40px; font-family:"Inter",sans-serif; font-size:14px; color:#2d2e33; background:#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca0a5\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cline x1=\'21\' y1=\'21\' x2=\'16.65\' y2=\'16.65\'/%3E%3C/svg%3E") no-repeat 14px center; outline:none; transition:border-color 0.15s; }',
    '.docs-search-input:focus { border-color:#007167; }',
    '.docs-search-input::placeholder { color:#9ca0a5; }',
    '.docs-no-results { display:none; flex-direction:column; align-items:center; text-align:center; padding:40px 24px; }',
    '.docs-no-results-icon { width:48px; height:48px; margin-bottom:16px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
    '.docs-no-results-icon svg { width:24px; height:24px; color:#9ca3af; }',
    '.docs-no-results-title { font-size:15px; font-weight:600; color:#374151; margin:0 0 4px; line-height:1.35; }',
    '.docs-no-results-desc { font-size:13px; color:#4b5563; margin:0; line-height:1.5; }',
    '.docs-request-access { margin-top:16px; display:inline-flex; align-items:center; gap:8px; height:38px; padding:0 20px; border:none; border-radius:999px; background:#007167; font-family:"Inter",sans-serif; font-size:14px; font-weight:600; color:#fff; cursor:pointer; transition:background 0.15s; }',
    '.docs-request-access:hover { background:#005f57; }',
    '.docs-request-access svg { width:16px; height:16px; }',
    '.docs-access-requested { margin-top:16px; display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:999px; background:rgba(0,113,103,0.08); color:#007167; font-size:13px; font-weight:600; }',
    '.docs-access-requested svg { width:16px; height:16px; }',
    '.docs-lang-wrap { display:flex; align-items:center; gap:6px; flex-shrink:0; }',
    '.docs-lang-label { display:inline-flex; align-items:center; color:#6b6e73; flex-shrink:0; }',
    '.docs-lang-label svg { width:16px; height:16px; }',
    '.docs-lang-select { appearance:none; -webkit-appearance:none; height:40px; border:1px solid #d4d6d8; border-radius:10px; padding:0 34px 0 14px; font-family:"Inter",sans-serif; font-size:13px; font-weight:500; color:#2d2e33; background:#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' fill=\'none\'%3E%3Cpath d=\'M1 1.5l5 5 5-5\' stroke=\'%236b6e73\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") no-repeat right 12px center; cursor:pointer; outline:none; transition:border-color 0.15s, box-shadow 0.15s; }',
    '.docs-lang-select:focus { border-color:#007167; box-shadow:0 0 0 3px rgba(0,113,103,0.1); }',

    '.docs-body { flex:1; overflow-y:auto; padding:24px; }',

    '.docs-category { margin-bottom:24px; }',
    '.docs-category:last-child { margin-bottom:0; }',
    '.docs-category-title { font-size:12px; font-weight:700; color:#007167; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px; padding-bottom:8px; border-bottom:1px solid #eaeaea; }',

    '.docs-list { display:flex; flex-direction:column; gap:8px; }',

    '.docs-item { display:flex; align-items:center; gap:14px; padding:12px 16px; border-radius:10px; border:1px solid #eef0f2; transition:background 0.15s, border-color 0.15s; cursor:pointer; }',
    '.docs-item:hover { background:#f8f9fa; border-color:#d4d6d8; }',

    '.docs-item-icon { width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
    '.docs-item-icon svg { width:20px; height:20px; }',

    '.docs-item-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }',
    '.docs-item-titlerow { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }',
    '.docs-item-name { font-size:14px; font-weight:500; color:#2d2e33; letter-spacing:-0.15px; }',
    '.docs-badge { display:inline-flex; align-items:center; height:18px; padding:0 7px; border-radius:5px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px; }',
    '.docs-badge.new { background:#e6f5ec; color:#127a3e; }',
    '.docs-badge.updated { background:#eaf0fe; color:#2456c9; }',
    '.docs-item-meta { font-size:12px; color:#9ca0a5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',

    '.docs-item-download { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#007167; transition:background 0.15s; flex-shrink:0; }',
    '.docs-item-download:hover { background:#e8f5f3; }',
    '.docs-item-download svg { width:18px; height:18px; }',

    /* Footer + Download all */
    '.docs-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 24px; border-top:1px solid #eaeaea; background:#fbfcfc; flex-shrink:0; }',
    '.docs-footer-info { font-size:13px; color:#6b6e73; }',
    '.docs-downloadall { display:inline-flex; align-items:center; gap:8px; height:40px; padding:0 16px; border-radius:10px; border:none; background:#007167; color:#fff; font-family:"Inter",sans-serif; font-size:13.5px; font-weight:600; cursor:pointer; transition:background 0.15s; }',
    '.docs-downloadall:hover { background:#005f56; }',
    '.docs-downloadall:disabled { opacity:0.55; cursor:default; }',
    '.docs-downloadall svg { width:16px; height:16px; }',

    /* Download progress toast */
    '.docs-dl-toast { position:fixed; left:50%; bottom:28px; transform:translateX(-50%) translateY(12px); z-index:600; display:none; align-items:center; gap:12px; width:360px; max-width:calc(100vw - 32px); padding:13px 16px; border-radius:12px; background:#0f3f39; color:#fff; box-shadow:0 12px 30px rgba(0,0,0,0.24); opacity:0; transition:opacity 0.2s ease, transform 0.2s ease; }',
    '.docs-dl-toast.show { display:flex; opacity:1; transform:translateX(-50%) translateY(0); }',
    '.docs-dl-toast-icon { width:22px; height:22px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#7ee0d0; }',
    '.docs-dl-toast-icon svg { width:20px; height:20px; }',
    '.docs-dl-toast-main { flex:1; min-width:0; }',
    '.docs-dl-toast-label { font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }',
    '.docs-dl-bar { margin-top:8px; height:4px; border-radius:2px; background:rgba(255,255,255,0.2); overflow:hidden; }',
    '.docs-dl-toast.done .docs-dl-bar { display:none; }',
    '.docs-dl-bar-fill { height:100%; width:0; background:#7ee0d0; border-radius:2px; }',
    '.docs-dl-spin { width:18px; height:18px; border:2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:docs-dl-rot 0.7s linear infinite; }',
    '@keyframes docs-dl-rot { to { transform:rotate(360deg); } }',
    '@media (prefers-reduced-motion: reduce) { .docs-dl-toast { transition:none; } .docs-dl-spin { animation:none; } .docs-dl-bar-fill { transition:none !important; } }',
  ].join('\n');
  document.head.appendChild(style);

  // ── Language filter options (only the languages actually present here) ──
  var LANG_LABEL = {};
  DocsStore.LANGUAGES.forEach(function (l) { LANG_LABEL[l.code] = l.label; });
  var present = {};
  DocsStore.list({ machineId: machineId, role: role }).forEach(function (d) {
    d.languages.forEach(function (c) { present[c] = true; });
  });
  var docLangs = [{ code: 'all', label: 'All languages' }].concat(
    DocsStore.LANGUAGES.filter(function (l) { return present[l.code]; })
  );

  // ── Build modal HTML from the store, grouped by category ──
  var downloadSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function iconType(fileName) {
    var ext = (fileName.split('.').pop() || '').toLowerCase();
    return (ext === 'dwg' || ext === 'dxf') ? 'dwg' : 'pdf';
  }

  function metaLine(doc) {
    var parts = [];
    if (doc.docType) parts.push(doc.docType);
    if (doc.position) parts.push(doc.position);
    if (doc.version) parts.push(doc.version);
    if (doc.sizeLabel) parts.push(doc.sizeLabel);
    if (doc.languages && doc.languages.length) parts.push(doc.languages.map(function (c) { return c.toUpperCase(); }).join('/'));
    if (doc.uploadedAt) parts.push('Updated ' + doc.uploadedAt);
    return parts.join(' · ');
  }

  var groups = DocsStore.listByCategory({ machineId: machineId, role: role });
  var hasAnyDocs = groups.length > 0;

  var bodyHtml = '';
  groups.forEach(function (group) {
    bodyHtml += '<div class="docs-category">';
    bodyHtml += '<div class="docs-category-title">' + esc(group.label) + '</div>';
    bodyHtml += '<div class="docs-list">';
    group.docs.forEach(function (doc) {
      var ic = DocsStore.categoryIcon(doc.category);
      var badge = DocsStore.recencyBadge(doc);
      var badgeHtml = badge ? '<span class="docs-badge ' + badge + '">' + (badge === 'new' ? 'New' : 'Updated') + '</span>' : '';
      var name = doc.title || doc.fileName;
      bodyHtml += '<div class="docs-item" data-langs="' + esc(doc.languages.join(',')) + '" data-file="' + esc(doc.fileName) + '">';
      bodyHtml += '<div class="docs-item-icon" style="background:' + ic.bg + ';color:' + ic.color + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic.svg + '</svg></div>';
      bodyHtml += '<div class="docs-item-info">';
      bodyHtml += '<span class="docs-item-titlerow"><span class="docs-item-name">' + esc(name) + '</span>' + badgeHtml + '</span>';
      bodyHtml += '<span class="docs-item-meta">' + esc(metaLine(doc)) + '</span>';
      bodyHtml += '</div>';
      bodyHtml += '<button class="docs-item-download" title="Download" aria-label="Download ' + esc(name) + '">' + downloadSvg + '</button>';
      bodyHtml += '</div>';
    });
    bodyHtml += '</div></div>';
  });

  // Empty state — distinguish "this machine has no documents at all" from
  // "documents exist, but none are visible to the current profile" (no access).
  var totalOnMachine = DocsStore.list({ machineId: machineId }).length;
  var alreadyRequested = DocsStore.listAccessRequests({ machineId: machineId, role: role, status: 'pending' }).length > 0;
  var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
  var requestCta = alreadyRequested
    ? '<div class="docs-access-requested" data-i18n="docs.accessRequested">' + checkSvg + 'Access requested</div>'
    : '<button type="button" class="docs-request-access" id="docsRequestAccess" data-i18n="docs.requestAccess">Request access</button>';
  var emptyDocsHtml = (totalOnMachine > 0)
    ? ('<div class="docs-no-results docs-no-access" style="display:flex">' +
       '  <div class="docs-no-results-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
       '  <p class="docs-no-results-title" data-i18n="docs.noAccessTitle">You don\'t have access to these documents</p>' +
       '  <p class="docs-no-results-desc" data-i18n="docs.noAccessDesc">This equipment has documentation, but none of it is available for your profile. Request access below and your company administrator will review it.</p>' +
       '  ' + requestCta +
       '</div>')
    : ('<div class="docs-no-results" style="display:flex">' +
       '  <div class="docs-no-results-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
       '  <p class="docs-no-results-title" data-i18n="docs.noDocsTitle">No documents available yet</p>' +
       '  <p class="docs-no-results-desc" data-i18n="docs.noDocsDesc">Documents for this equipment haven\'t been published yet.</p>' +
       '</div>');

  var overlay = document.createElement('div');
  overlay.className = 'docs-overlay';
  overlay.innerHTML =
    '<div class="docs-modal">' +
    '  <div class="docs-header">' +
    '    <div class="docs-header-left">' +
    '      <span class="docs-header-title">Documents &amp; Manuals</span>' +
    '      <span class="docs-header-subtitle">' + esc(machineTitle) + '</span>' +
    '    </div>' +
    '    <button class="docs-header-close" aria-label="Close">&#x2715;</button>' +
    '  </div>' +
    (hasAnyDocs ?
    ('  <div class="docs-search">' +
    '    <input class="docs-search-input" type="text" placeholder="Search documents..." id="docsSearch">' +
    '    <div class="docs-lang-wrap">' +
    '      <span class="docs-lang-label" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></span>' +
    '      <select class="docs-lang-select" id="docsLangSelect" aria-label="Filter documents by language">' +
    docLangs.map(function (l) { return '<option value="' + l.code + '">' + esc(l.label) + '</option>'; }).join('') +
    '      </select>' +
    '    </div>' +
    '  </div>' +
    '  <div class="docs-no-results" id="docsNoResults">' +
    '    <div class="docs-no-results-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
    '    <p class="docs-no-results-title">No results found</p>' +
    '    <p class="docs-no-results-desc">Try adjusting your search or filters</p>' +
    '  </div>' +
    '  <div class="docs-body" id="docsBody">' + bodyHtml + '</div>' +
    '  <div class="docs-footer" id="docsFooter">' +
    '    <span class="docs-footer-info" id="docsFooterInfo"></span>' +
    '    <button class="docs-downloadall" id="docsDownloadAll" type="button">' + downloadSvg + '<span id="docsDownloadAllLabel">Download all</span></button>' +
    '  </div>')
    : ('  <div class="docs-body" id="docsBody">' + emptyDocsHtml + '</div>')) +
    '  <div class="docs-dl-toast" id="docsDlToast" role="status" aria-live="polite">' +
    '    <div class="docs-dl-toast-icon" id="docsDlIcon"></div>' +
    '    <div class="docs-dl-toast-main">' +
    '      <div class="docs-dl-toast-label" id="docsDlLabel"></div>' +
    '      <div class="docs-dl-bar"><div class="docs-dl-bar-fill" id="docsDlBar"></div></div>' +
    '    </div>' +
    '  </div>' +
    '</div>';
  document.body.appendChild(overlay);
  // Translate the freshly-built modal (it's created on open, after i18n loaded).
  if (window.NetzschI18n && window.NetzschI18n.reload) window.NetzschI18n.reload();

  // ── Request access (shown in the no-access state) ──
  var requestBtn = overlay.querySelector('#docsRequestAccess');
  if (requestBtn) {
    requestBtn.addEventListener('click', function () {
      DocsStore.addAccessRequest(machineId, role);
      var label = (window.NetzschI18n ? NetzschI18n.t('docs.accessRequested', 'Access requested') : 'Access requested');
      requestBtn.outerHTML = '<div class="docs-access-requested">' + checkSvg + label + '</div>';
    });
  }

  // ── Search / filter (text + language, combined) ──
  var searchInput = document.getElementById('docsSearch');
  var langSelect = document.getElementById('docsLangSelect');
  var noResults = document.getElementById('docsNoResults');
  var docsBody = document.getElementById('docsBody');

  // ── Download simulation (prototype: visual only, no real file leaves the browser) ──
  var footerInfo = document.getElementById('docsFooterInfo');
  var downloadAllBtn = document.getElementById('docsDownloadAll');
  var downloadAllLabel = document.getElementById('docsDownloadAllLabel');
  var dlToast = document.getElementById('docsDlToast');
  var dlIcon = document.getElementById('docsDlIcon');
  var dlLabel = document.getElementById('docsDlLabel');
  var dlBar = document.getElementById('docsDlBar');
  var totalItems = docsBody ? docsBody.querySelectorAll('.docs-item').length : 0;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var spinnerHtml = '<span class="docs-dl-spin" aria-hidden="true"></span>';
  var checkHtml = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
  var dlT1 = null, dlT2 = null;

  function countVisible() {
    if (!docsBody) return 0;
    var c = 0;
    docsBody.querySelectorAll('.docs-item').forEach(function (it) { if (it.style.display !== 'none') c++; });
    return c;
  }

  function updateFooter(visible) {
    if (!downloadAllBtn) return;
    if (visible == null) visible = countVisible();
    downloadAllLabel.textContent = 'Download all' + (visible ? ' (' + visible + ')' : '');
    footerInfo.textContent = (visible === totalItems)
      ? (totalItems + (totalItems === 1 ? ' document' : ' documents'))
      : (visible + ' of ' + totalItems + ' documents');
    downloadAllBtn.disabled = visible === 0;
  }

  function runDownload(label, doneLabel, duration) {
    if (!dlToast) return;
    if (reduceMotion) duration = 200;
    clearTimeout(dlT1); clearTimeout(dlT2);
    dlToast.classList.remove('done');
    dlIcon.innerHTML = spinnerHtml;
    dlLabel.textContent = label;
    dlBar.style.transition = 'none';
    dlBar.style.width = '0%';
    dlToast.classList.add('show');
    void dlBar.offsetWidth; // reflow so the width animates from 0
    dlBar.style.transition = 'width ' + duration + 'ms linear';
    dlBar.style.width = '100%';
    dlT1 = setTimeout(function () {
      dlToast.classList.add('done');
      dlIcon.innerHTML = checkHtml;
      dlLabel.textContent = doneLabel;
      if (downloadAllBtn) downloadAllBtn.disabled = countVisible() === 0;
      dlT2 = setTimeout(function () { dlToast.classList.remove('show'); }, 1500);
    }, duration + 80);
  }

  // Individual download (delegated on the list)
  if (docsBody) {
    docsBody.addEventListener('click', function (e) {
      var btn = e.target.closest('.docs-item-download');
      if (!btn) return;
      e.preventDefault(); e.stopPropagation();
      var item = e.target.closest('.docs-item');
      var file = item ? (item.getAttribute('data-file') || (item.querySelector('.docs-item-name') || {}).textContent) : 'document';
      runDownload('Downloading ' + file + '…', 'Download complete', 950);
    });
  }

  // Download all (respects the current search / language filter)
  if (downloadAllBtn) {
    downloadAllBtn.addEventListener('click', function () {
      var n = countVisible();
      if (!n) return;
      downloadAllBtn.disabled = true;
      runDownload('Preparing ' + n + (n === 1 ? ' document' : ' documents') + '…', n + (n === 1 ? ' document downloaded' : ' documents downloaded'), 1500);
    });
  }

  function applyFilter() {
    if (!searchInput || !docsBody) return;
    var q = searchInput.value.trim().toLowerCase();
    var lang = langSelect ? langSelect.value : 'all';
    var totalVisible = 0;

    docsBody.querySelectorAll('.docs-category').forEach(function (cat) {
      var catVisible = 0;
      cat.querySelectorAll('.docs-item').forEach(function (item) {
        var name = item.querySelector('.docs-item-name').textContent.toLowerCase();
        var meta = item.querySelector('.docs-item-meta').textContent.toLowerCase();
        var itemLangs = (item.getAttribute('data-langs') || '').split(',');
        var textMatch = !q || name.indexOf(q) !== -1 || meta.indexOf(q) !== -1;
        var langMatch = lang === 'all' || itemLangs.indexOf(lang) !== -1;
        var match = textMatch && langMatch;
        item.style.display = match ? '' : 'none';
        if (match) catVisible++;
      });
      cat.style.display = catVisible > 0 ? '' : 'none';
      totalVisible += catVisible;
    });

    if (noResults) noResults.style.display = totalVisible === 0 ? 'flex' : 'none';
    updateFooter(totalVisible);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);
  if (langSelect) langSelect.addEventListener('change', applyFilter);

  // ── Events ──
  function openDocs(e) {
    e.preventDefault();
    if (searchInput) { searchInput.value = ''; }
    if (langSelect) { langSelect.value = 'all'; }
    applyFilter();
    overlay.classList.add('open');
    if (searchInput) setTimeout(function () { searchInput.focus(); }, 300);
  }
  function closeDocs() {
    overlay.classList.remove('open');
    if (dlToast) { clearTimeout(dlT1); clearTimeout(dlT2); dlToast.classList.remove('show'); }
  }

  docsLink.addEventListener('click', openDocs);
  overlay.querySelector('.docs-header-close').addEventListener('click', closeDocs);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeDocs(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDocs();
  });
})();
