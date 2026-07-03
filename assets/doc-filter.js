/**
 * NETZSCH Customer Portal — Document tab with dropdown language + type chips + table + pagination
 * Reads data-product from #tab-documents to build the doc list dynamically.
 */
(function () {
  var container = document.getElementById('tab-documents');
  if (!container) return;

  var productName = container.getAttribute('data-product') || 'PRODUCT';
  var perPage = 8;

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
  var currentPage = 1;

  // ── Build UI ──
  container.innerHTML = '';

  // Filter bar (integrated toolbar: search + pills + lang)
  var filterBar = document.createElement('div');
  filterBar.className = 'doc-filter-bar';

  // Search input
  var searchWrap = document.createElement('div');
  searchWrap.className = 'doc-filter-search';
  searchWrap.innerHTML =
    '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5.25" stroke="currentColor" stroke-width="1.5"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
    '<input type="search" id="docFilterSearch" placeholder="Search document...">';
  filterBar.appendChild(searchWrap);

  // Divider
  var div1 = document.createElement('div');
  div1.className = 'doc-filter-divider';
  filterBar.appendChild(div1);

  // Filter pills
  var typeChips = document.createElement('div');
  typeChips.className = 'doc-filter-pills';
  filterCategories.forEach(function (cat) {
    var chip = document.createElement('button');
    chip.className = 'doc-filter-pill' + (cat.key === activeCategory ? ' active' : '');
    chip.textContent = cat.label;
    chip.setAttribute('data-category', cat.key);
    chip.addEventListener('click', function () {
      activeCategory = cat.key;
      currentPage = 1;
      render();
    });
    typeChips.appendChild(chip);
  });
  filterBar.appendChild(typeChips);

  // Divider
  var div2 = document.createElement('div');
  div2.className = 'doc-filter-divider';
  filterBar.appendChild(div2);

  // Language dropdown
  var langWrap = document.createElement('div');
  langWrap.className = 'doc-lang-wrap';
  langWrap.innerHTML =
    '<span class="doc-lang-label">Lang</span>' +
    '<select class="doc-lang-select" id="docLangSelect">' +
      langs.map(function (l) {
        return '<option value="' + l.code + '"' + (l.code === activeLang ? ' selected' : '') + '>' + l.label + '</option>';
      }).join('') +
    '</select>';
  filterBar.appendChild(langWrap);

  container.appendChild(filterBar);

  // Table
  var tableWrap = document.createElement('div');
  tableWrap.className = 'doc-table-wrap';
  container.appendChild(tableWrap);

  // Search input handler
  var searchInput = document.getElementById('docFilterSearch');
  var searchTerm = '';
  searchInput.addEventListener('input', function () {
    searchTerm = this.value.trim().toLowerCase();
    currentPage = 1;
    render();
  });

  // Wire language dropdown
  document.getElementById('docLangSelect').addEventListener('change', function () {
    activeLang = this.value;
    currentPage = 1;
    render();
  });

  // ── SVG arrows ──
  var svgPrev = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var svgNext = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ── Render ──
  function render() {
    // Update filter pills
    typeChips.querySelectorAll('.doc-filter-pill').forEach(function (c) {
      c.classList.toggle('active', c.getAttribute('data-category') === activeCategory);
    });

    // Filter docs
    var filtered = docs.filter(function (d) {
      if (d.lang !== activeLang) return false;
      if (activeCategory !== 'all' && d.category !== activeCategory) return false;
      if (searchTerm && d.title.toLowerCase().indexOf(searchTerm) === -1) return false;
      return true;
    });

    var totalFiltered = filtered.length;
    var totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * perPage;
    var end = Math.min(start + perPage, totalFiltered);
    var pageItems = filtered.slice(start, end);

    // Build table
    var html = '<table class="doc-table">' +
      '<thead><tr>' +
      '<th>Name</th>' +
      '<th>Type</th>' +
      '<th>Format</th>' +
      '<th></th>' +
      '</tr></thead><tbody>';

    pageItems.forEach(function (d) {
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

    // Fill empty rows to keep table height stable
    var emptyCount = perPage - pageItems.length;
    for (var e = 0; e < emptyCount; e++) {
      html += '<tr class="doc-row-empty"><td colspan="4">&nbsp;</td></tr>';
    }

    html += '</tbody></table>';

    // Pagination footer
    html += '<div class="doc-pagination">';
    html += '<span class="doc-pagination-info">Showing ' + (totalFiltered === 0 ? '0' : (start + 1)) + '\u2013' + end + ' of ' + totalFiltered + ' documents</span>';
    html += '<div class="doc-pagination-controls">';

    // Prev button
    html += '<button class="doc-page-btn' + (currentPage === 1 ? ' disabled' : '') + '" data-page="prev" aria-label="Previous page">' + svgPrev + '</button>';

    // Page numbers
    for (var i = 1; i <= totalPages; i++) {
      html += '<button class="doc-page-btn' + (i === currentPage ? ' active' : '') + '" data-page="' + i + '" aria-label="Page ' + i + '"' + (i === currentPage ? ' aria-current="page"' : '') + '>' + i + '</button>';
    }

    // Next button
    html += '<button class="doc-page-btn' + (currentPage === totalPages ? ' disabled' : '') + '" data-page="next" aria-label="Next page">' + svgNext + '</button>';

    html += '</div></div>';

    if (totalFiltered === 0) {
      html = '<div class="doc-empty">No documents found for the selected filters.</div>';
    }

    tableWrap.innerHTML = html;

    // Wire pagination buttons
    tableWrap.querySelectorAll('.doc-page-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-page');
        if (p === 'prev') goTo(currentPage - 1);
        else if (p === 'next') goTo(currentPage + 1);
        else goTo(parseInt(p));
      });
    });
  }

  function goTo(page) {
    if (page < 1) return;
    currentPage = page;
    render();
  }

  render();
})();
