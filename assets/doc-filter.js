/**
 * NETZSCH Customer Portal — Document tab with language + type filters
 * Reads data-product from #tab-documents to build the doc list dynamically.
 */
(function () {
  var container = document.getElementById('tab-documents');
  if (!container) return;

  var productName = container.getAttribute('data-product') || 'PRODUCT';

  // ── Document catalog ──
  var types = [
    'Product Data Sheet',
    'Safety Data Sheet (SDS)',
    'Certificate of Analysis',
    'Certificate of Conformity',
    'Technical Bulletin',
    'Installation Guide',
    'Maintenance Manual',
    'Operating Instructions',
    'Material Compatibility Chart',
    'Wear Rate Analysis Report',
    'Batch Quality Report',
    'Storage & Handling Guide',
    'Regulatory Compliance Sheet'
  ];

  var typeCategories = {
    'Product Data Sheet': 'product-data',
    'Safety Data Sheet (SDS)': 'safety',
    'Certificate of Analysis': 'certificates',
    'Certificate of Conformity': 'certificates',
    'Technical Bulletin': 'technical',
    'Installation Guide': 'installation',
    'Maintenance Manual': 'maintenance',
    'Operating Instructions': 'maintenance',
    'Material Compatibility Chart': 'technical',
    'Wear Rate Analysis Report': 'technical',
    'Batch Quality Report': 'certificates',
    'Storage & Handling Guide': 'installation',
    'Regulatory Compliance Sheet': 'certificates'
  };

  var langs = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
    { code: 'pt', label: 'PT', name: 'Português' },
    { code: 'es', label: 'ES', name: 'Español' }
  ];

  var filterCategories = [
    { key: 'all', label: 'All' },
    { key: 'product-data', label: 'Product Data' },
    { key: 'safety', label: 'Safety' },
    { key: 'certificates', label: 'Certificates' },
    { key: 'technical', label: 'Technical' },
    { key: 'installation', label: 'Installation' },
    { key: 'maintenance', label: 'Maintenance' }
  ];

  // Build docs array
  var docs = [];
  types.forEach(function (type) {
    langs.forEach(function (lang) {
      docs.push({
        title: type + ' — ' + productName,
        type: type,
        category: typeCategories[type],
        lang: lang.code,
        langName: lang.name
      });
    });
  });

  // ── State ──
  var activeLang = 'en';
  var activeCategory = 'all';

  // ── Build UI ──
  container.innerHTML = '';

  // Language filter
  var langBar = document.createElement('div');
  langBar.className = 'doc-filter-bar';

  var langLabel = document.createElement('span');
  langLabel.className = 'doc-filter-label';
  langLabel.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>';
  langBar.appendChild(langLabel);

  var langChips = document.createElement('div');
  langChips.className = 'doc-chips';
  langs.forEach(function (lang) {
    var chip = document.createElement('button');
    chip.className = 'doc-chip' + (lang.code === activeLang ? ' active' : '');
    chip.textContent = lang.label;
    chip.setAttribute('data-lang', lang.code);
    chip.addEventListener('click', function () {
      activeLang = lang.code;
      render();
    });
    langChips.appendChild(chip);
  });
  langBar.appendChild(langChips);
  container.appendChild(langBar);

  // Type filter
  var typeBar = document.createElement('div');
  typeBar.className = 'doc-filter-bar';

  var typeChips = document.createElement('div');
  typeChips.className = 'doc-chips';
  filterCategories.forEach(function (cat) {
    var chip = document.createElement('button');
    chip.className = 'doc-chip doc-chip-type' + (cat.key === activeCategory ? ' active' : '');
    chip.textContent = cat.label;
    chip.setAttribute('data-category', cat.key);
    chip.addEventListener('click', function () {
      activeCategory = cat.key;
      render();
    });
    typeChips.appendChild(chip);
  });
  typeBar.appendChild(typeChips);
  container.appendChild(typeBar);

  // Doc list
  var listWrap = document.createElement('div');
  listWrap.className = 'doc-list-wrap';
  container.appendChild(listWrap);

  // Counter
  var counter = document.createElement('div');
  counter.className = 'doc-counter';
  container.appendChild(counter);

  // ── Render ──
  function render() {
    // Update language chips
    langChips.querySelectorAll('.doc-chip').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-lang') === activeLang);
    });

    // Update type chips
    typeChips.querySelectorAll('.doc-chip-type').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-category') === activeCategory);
    });

    // Filter docs
    var filtered = docs.filter(function (d) {
      if (d.lang !== activeLang) return false;
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      return true;
    });

    // Build list
    var html = '';
    filtered.forEach(function (d) {
      html += '<div class="doc-row">' +
        '<div class="doc-row-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>' +
        '<div class="doc-row-info">' +
          '<span class="doc-row-title">' + d.title + '</span>' +
          '<span class="doc-row-meta">' + d.langName + ' · PDF</span>' +
        '</div>' +
        '<a href="#" class="doc-row-download" aria-label="Download ' + d.title + '">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
        '</a>' +
      '</div>';
    });

    if (filtered.length === 0) {
      html = '<div class="doc-empty">No documents found for the selected filters.</div>';
    }

    listWrap.innerHTML = html;

    var totalForLang = docs.filter(function (d) { return d.lang === activeLang; }).length;
    counter.textContent = 'Showing ' + filtered.length + ' of ' + totalForLang + ' documents';
  }

  render();
})();
