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

    '.docs-search { padding:16px 24px 0; flex-shrink:0; display:flex; align-items:center; gap:12px; }',
    '.docs-search-input { flex:1; min-width:0; height:40px; border:1px solid #d4d6d8; border-radius:10px; padding:0 16px 0 40px; font-family:"Inter",sans-serif; font-size:14px; color:#2d2e33; background:#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca0a5\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'8\'/%3E%3Cline x1=\'21\' y1=\'21\' x2=\'16.65\' y2=\'16.65\'/%3E%3C/svg%3E") no-repeat 14px center; outline:none; transition:border-color 0.15s; }',
    '.docs-search-input:focus { border-color:#007167; }',
    '.docs-search-input::placeholder { color:#9ca0a5; }',
    '.docs-no-results { display:none; flex-direction:column; align-items:center; text-align:center; padding:40px 24px; }',
    '.docs-no-results-icon { width:48px; height:48px; margin-bottom:16px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
    '.docs-no-results-icon svg { width:24px; height:24px; color:#9ca3af; }',
    '.docs-no-results-title { font-size:15px; font-weight:600; color:#374151; margin:0 0 4px; line-height:1.35; }',
    '.docs-no-results-desc { font-size:13px; color:#4b5563; margin:0; line-height:1.5; }',

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

  // ── Languages available in the filter (order per portal: DE, PT, EN, ES) ──
  var docLangs = [
    { code: 'all', label: 'All languages' },
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ];

  // ── Documents data (dynamic per machine) ──
  // `langs` = languages each document is available in (drives the language filter).
  var m = machineTitle;
  var machineDocs = {
    'Operating Manuals': [
      { name: m + ' — Operating Manual v3.2', type: 'pdf', size: '4.2 MB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Operating Manual v3.1 (legacy)', type: 'pdf', size: '4.0 MB', date: 'Jun 2025', langs: ['de', 'en'] },
      { name: m + ' — Quick Start Guide', type: 'pdf', size: '1.1 MB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Control Panel Reference', type: 'pdf', size: '2.3 MB', date: 'Dec 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — HMI User Guide', type: 'pdf', size: '3.1 MB', date: 'Nov 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Operator Handbook', type: 'pdf', size: '5.6 MB', date: 'Feb 2026', langs: ['de', 'en'] },
      { name: m + ' — Daily Operation Checklist', type: 'pdf', size: '640 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
    ],
    'Installation & Commissioning': [
      { name: m + ' — Installation Manual', type: 'pdf', size: '3.8 MB', date: 'Oct 2025', langs: ['de', 'en'] },
      { name: m + ' — Commissioning Report Template', type: 'pdf', size: '720 KB', date: 'Sep 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Site Preparation Guide', type: 'pdf', size: '1.4 MB', date: 'Aug 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Foundation and Anchoring Plan', type: 'dwg', size: '2.6 MB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Utility Connection Guide', type: 'pdf', size: '1.9 MB', date: 'Jul 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Alignment Procedure', type: 'pdf', size: '2.2 MB', date: 'Sep 2025', langs: ['de', 'en'] },
      { name: m + ' — Transport and Handling Instructions', type: 'pdf', size: '1.0 MB', date: 'Jun 2025', langs: ['de', 'pt', 'en', 'es'] },
    ],
    'Maintenance Guides': [
      { name: m + ' — Preventive Maintenance Schedule', type: 'pdf', size: '2.8 MB', date: 'Dec 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Maintenance Manual', type: 'pdf', size: '6.2 MB', date: 'Nov 2025', langs: ['de', 'en'] },
      { name: m + ' — Lubrication Chart', type: 'pdf', size: '850 KB', date: 'Oct 2025', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Seal Replacement Procedure', type: 'pdf', size: '1.7 MB', date: 'Sep 2025', langs: ['de', 'en'] },
      { name: m + ' — Bearing Service Guide', type: 'pdf', size: '2.0 MB', date: 'Aug 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Grinding Chamber Maintenance', type: 'pdf', size: '3.3 MB', date: 'Dec 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Annual Service Checklist', type: 'pdf', size: '700 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Maintenance Log Template', type: 'pdf', size: '480 KB', date: 'Nov 2025', langs: ['de', 'en'] },
    ],
    'Troubleshooting': [
      { name: m + ' — Troubleshooting Guide', type: 'pdf', size: '3.5 MB', date: 'Nov 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Fault Code Reference', type: 'pdf', size: '1.6 MB', date: 'Dec 2025', langs: ['de', 'en'] },
      { name: m + ' — Vibration Diagnostics', type: 'pdf', size: '2.4 MB', date: 'Oct 2025', langs: ['de', 'en'] },
      { name: m + ' — Common Issues FAQ', type: 'pdf', size: '900 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Emergency Stop Recovery', type: 'pdf', size: '620 KB', date: 'Sep 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Noise and Overheating Guide', type: 'pdf', size: '1.3 MB', date: 'Aug 2025', langs: ['de', 'en', 'es'] },
    ],
    'Spare Parts Catalog': [
      { name: m + ' — Spare Parts Catalog 2026', type: 'pdf', size: '8.6 MB', date: 'Feb 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Spare Parts Catalog 2025', type: 'pdf', size: '8.1 MB', date: 'Feb 2025', langs: ['de', 'en'] },
      { name: m + ' — Wear Parts Reference', type: 'pdf', size: '1.9 MB', date: 'Oct 2025', langs: ['de', 'en'] },
      { name: m + ' — Recommended Spare Parts Kit', type: 'pdf', size: '1.2 MB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Grinding Media Selection Guide', type: 'pdf', size: '2.7 MB', date: 'Nov 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Consumables Price List', type: 'pdf', size: '540 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Parts Cross-Reference Table', type: 'pdf', size: '1.1 MB', date: 'Dec 2025', langs: ['de', 'en'] },
    ],
    'Certificates & Compliance': [
      { name: m + ' — CE Declaration of Conformity', type: 'pdf', size: '420 KB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Calibration Certificate', type: 'pdf', size: '380 KB', date: 'Mar 2026', langs: ['de', 'en', 'es'] },
      { name: m + ' — ATEX Compliance Report', type: 'pdf', size: '1.2 MB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Material Certificate 3.1', type: 'pdf', size: '460 KB', date: 'Jul 2024', langs: ['de', 'en'] },
      { name: m + ' — Factory Acceptance Test Report', type: 'pdf', size: '2.1 MB', date: 'Aug 2024', langs: ['de', 'en', 'es'] },
      { name: m + ' — Noise Emission Certificate', type: 'pdf', size: '340 KB', date: 'Jun 2024', langs: ['de', 'en'] },
      { name: m + ' — RoHS Compliance Statement', type: 'pdf', size: '300 KB', date: 'May 2024', langs: ['de', 'en'] },
      { name: m + ' — Pressure Equipment Certificate', type: 'pdf', size: '520 KB', date: 'Aug 2024', langs: ['de', 'en'] },
    ],
    'Safety & Regulatory': [
      { name: m + ' — Safety Manual', type: 'pdf', size: '2.9 MB', date: 'Oct 2025', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Risk Assessment Report', type: 'pdf', size: '1.8 MB', date: 'Sep 2025', langs: ['de', 'en'] },
      { name: m + ' — Lockout/Tagout Procedure', type: 'pdf', size: '900 KB', date: 'Aug 2025', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Safety Data Sheet (Hydraulic Oil)', type: 'pdf', size: '260 KB', date: 'Jul 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — PPE Requirements Sheet', type: 'pdf', size: '410 KB', date: 'Jun 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Machine Safety Labels Guide', type: 'pdf', size: '720 KB', date: 'May 2025', langs: ['de', 'en'] },
      { name: m + ' — Emergency Procedures Poster', type: 'pdf', size: '1.1 MB', date: 'Apr 2025', langs: ['de', 'pt', 'en', 'es'] },
    ],
    'Technical Drawings': [
      { name: m + ' — General Assembly Drawing', type: 'dwg', size: '5.4 MB', date: 'Aug 2024', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Inlet Flange Detail', type: 'dwg', size: '2.1 MB', date: 'Aug 2024', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Grinding Chamber Assembly', type: 'dwg', size: '4.7 MB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Rotor Detail Drawing', type: 'dwg', size: '3.2 MB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Sealing System Layout', type: 'dwg', size: '2.8 MB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Cooling Circuit Diagram', type: 'dwg', size: '1.9 MB', date: 'Aug 2024', langs: ['de', 'en', 'es'] },
      { name: m + ' — Foundation Plan', type: 'dwg', size: '2.4 MB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Piping and Instrumentation Diagram', type: 'dwg', size: '3.6 MB', date: 'Aug 2024', langs: ['de', 'en'] },
    ],
    'Electrical & Automation': [
      { name: m + ' — Electrical Wiring Diagram', type: 'dwg', size: '4.1 MB', date: 'Sep 2024', langs: ['de', 'en'] },
      { name: m + ' — Control Cabinet Layout', type: 'dwg', size: '2.9 MB', date: 'Sep 2024', langs: ['de', 'en'] },
      { name: m + ' — PLC Program Documentation', type: 'pdf', size: '3.4 MB', date: 'Oct 2025', langs: ['de', 'en'] },
      { name: m + ' — I/O List', type: 'pdf', size: '780 KB', date: 'Sep 2025', langs: ['de', 'en'] },
      { name: m + ' — Motor Datasheet', type: 'pdf', size: '1.3 MB', date: 'Aug 2024', langs: ['de', 'en', 'es'] },
      { name: m + ' — Frequency Converter Manual', type: 'pdf', size: '5.2 MB', date: 'Jul 2025', langs: ['de', 'en'] },
      { name: m + ' — Sensor Configuration Guide', type: 'pdf', size: '1.6 MB', date: 'Nov 2025', langs: ['de', 'en', 'es'] },
    ],
    'Process & Application Notes': [
      { name: m + ' — Application Note: Nano Grinding', type: 'pdf', size: '1.5 MB', date: 'Dec 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Application Note: Dispersing', type: 'pdf', size: '1.4 MB', date: 'Nov 2025', langs: ['de', 'en'] },
      { name: m + ' — Process Optimization Guide', type: 'pdf', size: '2.6 MB', date: 'Oct 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Bead Size Selection Chart', type: 'pdf', size: '680 KB', date: 'Sep 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Scale-Up Guidelines', type: 'pdf', size: '1.9 MB', date: 'Aug 2025', langs: ['de', 'en'] },
      { name: m + ' — Cleaning and CIP Procedure', type: 'pdf', size: '1.2 MB', date: 'Jul 2025', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Product Changeover Guide', type: 'pdf', size: '940 KB', date: 'Jun 2025', langs: ['de', 'en'] },
    ],
    'Software & Firmware': [
      { name: m + ' — Control Software Release Notes v4.5', type: 'pdf', size: '620 KB', date: 'Feb 2026', langs: ['de', 'en'] },
      { name: m + ' — Firmware Update Guide', type: 'pdf', size: '1.1 MB', date: 'Jan 2026', langs: ['de', 'en', 'es'] },
      { name: m + ' — Data Logging Manual', type: 'pdf', size: '2.2 MB', date: 'Dec 2025', langs: ['de', 'en'] },
      { name: m + ' — Remote Monitoring Setup', type: 'pdf', size: '1.8 MB', date: 'Nov 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — OPC-UA Integration Guide', type: 'pdf', size: '1.5 MB', date: 'Oct 2025', langs: ['de', 'en'] },
      { name: m + ' — Recipe Management Manual', type: 'pdf', size: '2.0 MB', date: 'Sep 2025', langs: ['de', 'pt', 'en'] },
    ],
    'Training Materials': [
      { name: m + ' — Operator Training Handbook', type: 'pdf', size: '4.8 MB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Maintenance Training Slides', type: 'pdf', size: '6.1 MB', date: 'Dec 2025', langs: ['de', 'en'] },
      { name: m + ' — Safety Induction Presentation', type: 'pdf', size: '3.2 MB', date: 'Nov 2025', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Video Tutorial Index', type: 'pdf', size: '320 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Competency Assessment Form', type: 'pdf', size: '410 KB', date: 'Oct 2025', langs: ['de', 'en'] },
      { name: m + ' — Quick Reference Card', type: 'pdf', size: '280 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Hands-On Exercise Workbook', type: 'pdf', size: '2.4 MB', date: 'Sep 2025', langs: ['de', 'en'] },
    ],
    'Warranty & Service': [
      { name: m + ' — Warranty Terms and Conditions', type: 'pdf', size: '340 KB', date: 'Aug 2024', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Service Contract Overview', type: 'pdf', size: '720 KB', date: 'Jan 2026', langs: ['de', 'en', 'es'] },
      { name: m + ' — Return Material Authorization Form', type: 'pdf', size: '260 KB', date: 'Dec 2025', langs: ['de', 'en'] },
      { name: m + ' — Service Report Template', type: 'pdf', size: '480 KB', date: 'Nov 2025', langs: ['de', 'en'] },
      { name: m + ' — Spare Parts Order Form', type: 'pdf', size: '300 KB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
    ],
    'Datasheets & Specifications': [
      { name: m + ' — Technical Datasheet', type: 'pdf', size: '1.2 MB', date: 'Jan 2026', langs: ['de', 'pt', 'en', 'es'] },
      { name: m + ' — Performance Specification', type: 'pdf', size: '900 KB', date: 'Dec 2025', langs: ['de', 'en'] },
      { name: m + ' — Dimensional Data Sheet', type: 'pdf', size: '640 KB', date: 'Aug 2024', langs: ['de', 'en', 'es'] },
      { name: m + ' — Capacity and Throughput Chart', type: 'pdf', size: '720 KB', date: 'Nov 2025', langs: ['de', 'en'] },
      { name: m + ' — Energy Consumption Report', type: 'pdf', size: '1.1 MB', date: 'Oct 2025', langs: ['de', 'en', 'es'] },
      { name: m + ' — Materials of Construction List', type: 'pdf', size: '540 KB', date: 'Sep 2025', langs: ['de', 'en'] },
      { name: m + ' — Weight and Load Data', type: 'pdf', size: '380 KB', date: 'Aug 2024', langs: ['de', 'en'] },
      { name: m + ' — Environmental Conditions Spec', type: 'pdf', size: '460 KB', date: 'Jul 2025', langs: ['de', 'pt', 'en'] },
      { name: m + ' — Acoustic Performance Data', type: 'pdf', size: '420 KB', date: 'Jun 2025', langs: ['de', 'en'] },
      { name: m + ' — Certified Dimension Drawing', type: 'dwg', size: '2.2 MB', date: 'Aug 2024', langs: ['de', 'en'] },
    ],
  };

  // ── Build modal HTML ──
  var downloadSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';

  var bodyHtml = '';
  Object.keys(machineDocs).forEach(function (category) {
    bodyHtml += '<div class="docs-category">';
    bodyHtml += '<div class="docs-category-title">' + category + '</div>';
    bodyHtml += '<div class="docs-list">';
    machineDocs[category].forEach(function (doc) {
      bodyHtml += '<div class="docs-item" data-langs="' + doc.langs.join(',') + '">';
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
    '  <div class="docs-search">' +
    '    <input class="docs-search-input" type="text" placeholder="Search documents..." id="docsSearch">' +
    '    <div class="docs-lang-wrap">' +
    '      <span class="docs-lang-label" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></span>' +
    '      <select class="docs-lang-select" id="docsLangSelect" aria-label="Filter documents by language">' +
    docLangs.map(function (l) {
      return '<option value="' + l.code + '">' + l.label + '</option>';
    }).join('') +
    '      </select>' +
    '    </div>' +
    '  </div>' +
    '  <div class="docs-no-results" id="docsNoResults">' +
    '    <div class="docs-no-results-icon"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
    '    <p class="docs-no-results-title">No results found</p>' +
    '    <p class="docs-no-results-desc">Try adjusting your search or filters</p>' +
    '  </div>' +
    '  <div class="docs-body" id="docsBody">' + bodyHtml + '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  // ── Search / filter (text + language, combined) ──
  var searchInput = document.getElementById('docsSearch');
  var langSelect = document.getElementById('docsLangSelect');
  var noResults = document.getElementById('docsNoResults');
  var docsBody = document.getElementById('docsBody');

  function applyFilter() {
    var q = searchInput.value.trim().toLowerCase();
    var lang = langSelect.value;
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

    noResults.style.display = totalVisible === 0 ? 'flex' : 'none';
  }

  searchInput.addEventListener('input', applyFilter);
  langSelect.addEventListener('change', applyFilter);

  // ── Events ──
  function openDocs(e) {
    e.preventDefault();
    searchInput.value = '';
    langSelect.value = 'all';
    applyFilter();
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
