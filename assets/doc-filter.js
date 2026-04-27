/**
 * NETZSCH Customer Portal — Document tab with dropdown language + type chips + table
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

  var categoryLabels = {
    'product-data': 'Product Data',
    'safety': 'Safety',
    'certificates': 'Certificate',
    'technical': 'Technical',
    'installation': 'Installation',
    'maintenance': 'Maintenance'
  };

  var langs = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'es', label: 'Español' }
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
        title: type,
        type: type,
        category: typeCategories[type],
        categoryLabel: categoryLabels[typeCategories[type]],
        lang: lang.code,
        langName: lang.label
      });
    });
  });

  // ── State ──
  var activeLang = 'en';
  var activeCategory = 'all';

  // ── Build UI ──
  container.innerHTML = '';

  // Top bar: language dropdown + type chips
  var topBar = document.createElement('div');
  topBar.className = 'doc-top-bar';

  // Language dropdown
  var langWrap = document.createElement('div');
  langWrap.className = 'doc-lang-wrap';
  langWrap.innerHTML =
    '<label class="doc-lang-label" for="docLangSelect">Language:</label>' +
    '<select class="doc-lang-select" id="docLangSelect">' +
      langs.map(function (l) {
        return '<option value="' + l.code + '"' + (l.code === activeLang ? ' selected' : '') + '>' + l.label + '</option>';
      }).join('') +
    '</select>';
  topBar.appendChild(langWrap);
  container.appendChild(topBar);

  // Type chips
  var typeBar = document.createElement('div');
  typeBar.className = 'doc-type-bar';
  var typeChips = document.createElement('div');
  typeChips.className = 'doc-chips';
  filterCategories.forEach(function (cat) {
    var chip = document.createElement('button');
    chip.className = 'doc-chip' + (cat.key === activeCategory ? ' active' : '');
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

  // Table
  var tableWrap = document.createElement('div');
  tableWrap.className = 'doc-table-wrap';
  container.appendChild(tableWrap);

  // Counter
  var counter = document.createElement('div');
  counter.className = 'doc-counter';
  container.appendChild(counter);

  // Wire language dropdown
  document.getElementById('docLangSelect').addEventListener('change', function () {
    activeLang = this.value;
    render();
  });

  // ── Render ──
  function render() {
    // Update type chips
    typeChips.querySelectorAll('.doc-chip').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-category') === activeCategory);
    });

    // Filter docs
    var filtered = docs.filter(function (d) {
      if (d.lang !== activeLang) return false;
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      return true;
    });

    // Build table
    var html = '<table class="doc-table">' +
      '<thead><tr>' +
      '<th>Name</th>' +
      '<th>Type</th>' +
      '<th>Format</th>' +
      '<th></th>' +
      '</tr></thead><tbody>';

    filtered.forEach(function (d) {
      html += '<tr>' +
        '<td class="doc-td-name">' +
          '<svg class="doc-file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>' +
          d.title +
        '</td>' +
        '<td><span class="doc-type-badge doc-type-' + d.category + '">' + d.categoryLabel + '</span></td>' +
        '<td class="doc-td-format">PDF</td>' +
        '<td class="doc-td-action">' +
          '<a href="#" class="doc-download-btn" aria-label="Download ' + d.title + '">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
          '</a>' +
        '</td>' +
      '</tr>';
    });

    html += '</tbody></table>';

    if (filtered.length === 0) {
      html = '<div class="doc-empty">No documents found for the selected filters.</div>';
    }

    tableWrap.innerHTML = html;

    var totalForLang = docs.filter(function (d) { return d.lang === activeLang; }).length;
    counter.textContent = 'Showing ' + filtered.length + ' of ' + totalForLang + ' documents';
  }

  render();
})();
