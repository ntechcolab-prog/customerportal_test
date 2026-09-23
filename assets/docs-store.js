/**
 * NETZSCH Customer Portal — Equipment Documents store (prototype)
 *
 * Single source of truth for equipment documents & manuals. Both the
 * customer-facing "Documents and Manuals" modal (docs-modal.js) and the
 * Admin documentation area (admin-documents.html) read/write this store.
 * Persists in localStorage.
 *
 * Model (from the real NETZSCH structure): each machine's documents are
 * delivered as PDFs organised in 5 top-level categories. Document type,
 * language and revision live in the file name — so here they are fields,
 * not categories:
 *
 *   { id, machineId, category, title, fileName, docType, position,
 *     languages: ['en'|'pt'|'de'|'es'], version, sizeLabel,
 *     uploadedAt, uploadedBy, visibility: [roleKey...], versions: [...] }
 *
 * Visibility is per document, controlled by the Admin in the documentation
 * area (CP-687). A customer only sees a document if their role is listed in
 * `visibility`.
 */
(function () {
  'use strict';

  var DOCS_KEY = 'netzsch_docs';
  var SEED_FLAG = 'netzsch_docs_seeded_v1';
  var SEED_VER_KEY = 'netzsch_docs_seed_ver';
  // Bump this string whenever seedDocs() changes so existing users auto-reseed
  // on the next page load (no manual DocsStore.reset() needed).
  var SEED_VERSION = 'v2-buyer-no-access';

  // ── The 5 real categories (stable keys, order = display order) ──
  var CATEGORIES = [
    { key: 'drawings',     label: 'Drawings & Part List', shortLabel: 'Drawings' },
    { key: 'instructions', label: 'Instructions Manual',  shortLabel: 'Instructions' },
    { key: 'electrical',   label: 'Electrical Doc',       shortLabel: 'Electrical' },
    { key: 'suppliers',    label: 'Suppliers',            shortLabel: 'Suppliers' },
    { key: 'certificates', label: 'Certificates',         shortLabel: 'Certificates' }
  ];

  // ── Customer roles (keys match `netzsch_user_role` / login data-role) ──
  var ROLES = [
    { key: 'administrator', label: 'Admin' },
    { key: 'buyer',         label: 'Buyer' },
    { key: 'approver',      label: 'Approver' },
    { key: 'technician',    label: 'Technician' }
  ];
  var ALL_ROLE_KEYS = ROLES.map(function (r) { return r.key; });

  // ── Languages (codes match the customer modal filter) ──
  var LANGUAGES = [
    { code: 'de', label: 'Deutsch' },
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  // ── Per-category icon + muted tint (kept sober per NETZSCH brand) ──
  // svg = inner paths of a 24×24 line icon; color = stroke; bg = soft tile tint.
  var CATEGORY_ICONS = {
    drawings:     { color: '#2563eb', bg: '#eaf0fe', svg: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>' },
    instructions: { color: '#007167', bg: '#e6f2f0', svg: '<path d="M5 4a1 1 0 011-1h13v18H6a1 1 0 00-1 1V4z"/><path d="M5 4v15"/>' },
    electrical:   { color: '#b45309', bg: '#fbf0e4', svg: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>' },
    suppliers:    { color: '#475569', bg: '#eef1f5', svg: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>' },
    certificates: { color: '#a16207', bg: '#f8f1e0', svg: '<circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 22l5-3 5 3-1.21-8.11"/>' }
  };
  function categoryIcon(key) { return CATEGORY_ICONS[key] || CATEGORY_ICONS.instructions; }

  // ── Recency badge: "new" (recently added) or "updated" (recently re-versioned) ──
  var DAY = 86400000;
  var RECENCY_WINDOW = 21 * DAY;
  function recencyBadge(doc) {
    var now = Date.now();
    var multi = doc.versions && doc.versions.length > 1;
    if (multi && doc.updatedTs && (now - doc.updatedTs) <= RECENCY_WINDOW) return 'updated';
    if (!multi && doc.createdTs && (now - doc.createdTs) <= RECENCY_WINDOW) return 'new';
    return null;
  }

  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  // ── Machine roster: reuse MachineLines when present so ids/names stay in sync ──
  var FALLBACK_MACHINES = [
    { id: 'discus30',    name: 'Discus 30' },
    { id: 'zeta60',      name: 'Zeta 60' },
    { id: 'mastermix45', name: 'MasterMix 45' },
    { id: 'prophi',      name: 'ProPhi' },
    { id: 'alphazeta10', name: 'Alpha Zeta 10' },
    { id: 'zeta500',     name: 'Zeta 500' }
  ];
  function machines() {
    if (window.MachineLines && typeof window.MachineLines.getMachines === 'function') {
      return window.MachineLines.getMachines().map(function (m) { return { id: m.id, name: m.name }; });
    }
    return FALLBACK_MACHINES.slice();
  }
  function machineName(id) {
    var found = machines().filter(function (m) { return m.id === id; })[0];
    return found ? found.name : id;
  }

  // ── Seed data — the real MC10 (order 15203320) set, mapped onto Zeta 60 ──
  // Other machines get lighter, plausible sets; Alpha Zeta 10 is left empty
  // on purpose to exercise the empty state.
  function seedDocs() {
    var d = [];
    var n = 0;
    var seedNow = Date.now();
    // Prototype access model: the Buyer profile has no equipment-document access,
    // so seeded documents default to every profile EXCEPT Buyer. (An Admin can
    // still grant Buyer access per document in the documentation-team area.)
    var SEED_DEFAULT_VIS = ALL_ROLE_KEYS.filter(function (k) { return k !== 'buyer'; });
    function doc(machineId, category, o) {
      n++;
      var createdDaysAgo = (o.createdDaysAgo != null) ? o.createdDaysAgo : 300;
      var updatedDaysAgo = (o.updatedDaysAgo != null) ? o.updatedDaysAgo : createdDaysAgo;
      var versions = [{ version: o.version || 'R00', fileName: o.fileName, uploadedAt: o.uploadedAt || 'Jul 2026' }];
      if (o.prevVersion) versions.push({ version: o.prevVersion, fileName: o.fileName, uploadedAt: o.prevUploadedAt || 'Jan 2026' });
      d.push({
        id: 'doc-' + machineId + '-' + n,
        machineId: machineId,
        category: category,
        title: o.title,
        fileName: o.fileName,
        docType: o.docType || '',
        position: o.position || '',
        languages: o.languages || ['en'],
        version: o.version || 'R00',
        sizeLabel: o.sizeLabel || '',
        uploadedAt: o.uploadedAt || 'Jul 2026',
        uploadedBy: o.uploadedBy || 'Documentation Team',
        visibility: o.visibility || SEED_DEFAULT_VIS.slice(),
        versions: versions,
        createdTs: seedNow - createdDaysAgo * DAY,
        updatedTs: seedNow - updatedDaysAgo * DAY
      });
    }

    // ── ZETA 60 — full real MC10 structure (order 15203320, v1.2) ──
    // 1. Drawings & Part List
    doc('zeta60', 'drawings', { title: 'Drawings & Part List — MC10', fileName: '15203320-10-MC10-D&PL-EN-R00.pdf', docType: 'D&PL', position: 'POS. 10', sizeLabel: '1.8 MB', languages: ['en'] });
    doc('zeta60', 'drawings', { title: 'Drawings & Part List — Feeding System', fileName: '15203320-20-FEEDING SYSTEM-D&PL-EN-R00.pdf', docType: 'D&PL', position: 'POS. 20', sizeLabel: '936 KB', languages: ['en'] });
    // 2. Instructions Manual
    doc('zeta60', 'instructions', { title: 'Operating Manual — MC10', fileName: '15203320-MC10-OM-EN-R00.pdf', docType: 'OM', sizeLabel: '1.2 MB', languages: ['en'] });
    doc('zeta60', 'instructions', { title: 'Data Sheet — MC10', fileName: '15203320-MC10-DS-EN-R00.pdf', docType: 'DS', sizeLabel: '372 KB', languages: ['en'] });
    // 3. Electrical Doc
    doc('zeta60', 'electrical', { title: 'Electrical Documentation', fileName: 'KMCC22440_02.pdf', docType: 'Electrical', version: 'R02', prevVersion: 'R01', sizeLabel: '2.2 MB', languages: ['en'], createdDaysAgo: 220, updatedDaysAgo: 5 });
    // 4. Suppliers (POS. 10 — internal component docs, restricted from Buyer)
    var supVis = ['administrator', 'approver', 'technician'];
    doc('zeta60', 'suppliers', { title: 'Motor B34E 160M — CE', fileName: '140124928 - MOTOR TRIF. ESP. B34E 160M - CE.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '84 KB', languages: ['en'], visibility: supVis });
    doc('zeta60', 'suppliers', { title: 'Gear Motor — Flange & Hollow Shaft', fileName: '140126212 - MOTOREDUTOR COM FLANGE E EIXO OCO.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '34 MB', languages: ['pt', 'en'], visibility: supVis });
    doc('zeta60', 'suppliers', { title: 'Temperature Transmitter — IFM TA2232', fileName: '354143 - EN - TEMP TRANSM- IFM - TA2232-00.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '184 KB', languages: ['en'], visibility: supVis });
    doc('zeta60', 'suppliers', { title: 'Mini Valve 2-Way MGA', fileName: '449263 - PT -VALVULA MINI 2 VIAS MGA.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '1.3 MB', languages: ['pt'], visibility: supVis });
    doc('zeta60', 'suppliers', { title: 'Mini Ball Valve 2-Way', fileName: '449265 - EN - MINI BALL VALVE 2 VIAS - END-KUGEL.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '124 KB', languages: ['en'], visibility: supVis });
    doc('zeta60', 'suppliers', { title: 'Level Switch — LMT121', fileName: '4709715 - LEVEL SIWTCH - LMT121-01_EN-US.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '236 KB', languages: ['en'], visibility: supVis });
    // 5. Certificates
    doc('zeta60', 'certificates', { title: 'Material Certificate 2.1', fileName: '2.1 Material Certificate.pdf', docType: 'Material Cert', sizeLabel: '76 KB', languages: ['en'], createdDaysAgo: 6 });
    var fdaVis = ['administrator', 'approver'];
    doc('zeta60', 'certificates', { title: 'FDA Certificate — NF 62264', fileName: '4716594_2354487 - NF_62264.pdf', docType: 'FDA', sizeLabel: '264 KB', languages: ['en'], visibility: fdaVis });
    doc('zeta60', 'certificates', { title: 'FDA Certificate — NF 61466', fileName: '517261_2346192-20 - NF_61466.pdf', docType: 'FDA', sizeLabel: '44 KB', languages: ['en'], visibility: fdaVis });
    doc('zeta60', 'certificates', { title: 'FDA Certificate — NF 61926', fileName: '535617_2351671-NF_61926.pdf', docType: 'FDA', sizeLabel: '596 KB', languages: ['en'], visibility: fdaVis });
    doc('zeta60', 'certificates', { title: 'FDA Certificate — NF 61840', fileName: '545703_2351238-NF_61840.pdf', docType: 'FDA', sizeLabel: '268 KB', languages: ['en'], visibility: fdaVis });

    // ── DISCUS 30 — moderate set ──
    doc('discus30', 'drawings', { title: 'Drawings & Part List — Discus 30', fileName: '15104120-10-DISCUS30-D&PL-EN-R00.pdf', docType: 'D&PL', position: 'POS. 10', sizeLabel: '1.6 MB', languages: ['en'] });
    doc('discus30', 'instructions', { title: 'Operating Manual — Discus 30', fileName: '15104120-DISCUS30-OM-EN-R01.pdf', docType: 'OM', version: 'R01', prevVersion: 'R00', sizeLabel: '3.4 MB', languages: ['en', 'de'], createdDaysAgo: 180, updatedDaysAgo: 12 });
    doc('discus30', 'instructions', { title: 'Data Sheet — Discus 30', fileName: '15104120-DISCUS30-DS-EN-R00.pdf', docType: 'DS', sizeLabel: '410 KB', languages: ['en', 'de'] });
    doc('discus30', 'electrical', { title: 'Electrical Documentation', fileName: 'KMCC21980_01.pdf', docType: 'Electrical', version: 'R01', sizeLabel: '1.9 MB', languages: ['en'] });
    doc('discus30', 'certificates', { title: 'CE Declaration of Conformity', fileName: 'DISCUS30-CE-DECLARATION.pdf', docType: 'CE', sizeLabel: '420 KB', languages: ['en', 'de'] });

    // ── MASTERMIX 45 — moderate set ──
    doc('mastermix45', 'drawings', { title: 'Drawings & Part List — MasterMix 45', fileName: '15208840-10-MM45-D&PL-EN-R00.pdf', docType: 'D&PL', position: 'POS. 10', sizeLabel: '2.1 MB', languages: ['en'] });
    doc('mastermix45', 'instructions', { title: 'Operating Manual — MasterMix 45', fileName: '15208840-MM45-OM-EN-R00.pdf', docType: 'OM', sizeLabel: '4.0 MB', languages: ['en'] });
    doc('mastermix45', 'suppliers', { title: 'Drive Motor — Datasheet', fileName: '140130551 - DRIVE MOTOR - MM45.pdf', docType: 'Supplier', position: 'POS. 10', sizeLabel: '120 KB', languages: ['en'], visibility: supVis });
    doc('mastermix45', 'certificates', { title: 'Material Certificate 3.1', fileName: 'MM45-3.1-MATERIAL-CERT.pdf', docType: 'Material Cert', sizeLabel: '88 KB', languages: ['en'] });

    // ── PROPHI — few docs ──
    doc('prophi', 'instructions', { title: 'Operating Manual — ProPhi', fileName: '15301100-PROPHI-OM-EN-R00.pdf', docType: 'OM', sizeLabel: '2.8 MB', languages: ['en'] });
    doc('prophi', 'certificates', { title: 'CE Declaration of Conformity', fileName: 'PROPHI-CE-DECLARATION.pdf', docType: 'CE', sizeLabel: '390 KB', languages: ['en', 'de'] });

    // ── ZETA 500 & ALPHA ZETA 10 — intentionally empty (empty-state demo) ──

    return d;
  }

  function getAll() {
    var stored = read(DOCS_KEY, null);
    if (stored && read(SEED_VER_KEY, null) === SEED_VERSION) return stored;
    // First run OR the seed changed (version bumped) → (re)seed.
    // Prototype note: reseeding overwrites local admin edits made in a previous version.
    var seeded = seedDocs();
    write(DOCS_KEY, seeded);
    write(SEED_FLAG, true);
    write(SEED_VER_KEY, SEED_VERSION);
    return seeded;
  }
  function saveAll(arr) { write(DOCS_KEY, arr); }

  // ── Queries ──
  function list(opts) {
    opts = opts || {};
    var all = getAll();
    return all.filter(function (doc) {
      if (opts.machineId && doc.machineId !== opts.machineId) return false;
      if (opts.category && doc.category !== opts.category) return false;
      if (opts.language && opts.language !== 'all' && doc.languages.indexOf(opts.language) === -1) return false;
      if (opts.role && doc.visibility.indexOf(opts.role) === -1) return false;
      return true;
    });
  }

  // Returns [{ key, label, docs: [...] }] in canonical category order, only
  // for categories that have at least one matching document.
  function listByCategory(opts) {
    var docs = list(opts);
    return CATEGORIES.map(function (c) {
      return { key: c.key, label: c.label, docs: docs.filter(function (doc) { return doc.category === c.key; }) };
    }).filter(function (g) { return g.docs.length > 0; });
  }

  function get(id) { return getAll().filter(function (d) { return d.id === id; })[0] || null; }

  function categoryLabel(key) {
    var c = CATEGORIES.filter(function (x) { return x.key === key; })[0];
    return c ? c.label : key;
  }

  // ── Mutations ──
  function uid() {
    // Deterministic-enough unique id for a prototype (no Date/random reliance issues in-browser).
    return 'doc-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
  }
  function nowLabel() {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dt = new Date();
    return months[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  function add(doc) {
    var all = getAll();
    var rec = {
      id: uid(),
      machineId: doc.machineId,
      category: doc.category,
      title: (doc.title || '').trim(),
      fileName: (doc.fileName || '').trim(),
      docType: doc.docType || '',
      position: doc.position || '',
      languages: (doc.languages && doc.languages.length) ? doc.languages.slice() : ['en'],
      version: doc.version || 'R00',
      sizeLabel: doc.sizeLabel || '',
      uploadedAt: doc.uploadedAt || nowLabel(),
      uploadedBy: doc.uploadedBy || 'Documentation Team',
      visibility: (doc.visibility && doc.visibility.length) ? doc.visibility.slice() : ALL_ROLE_KEYS.slice(),
      versions: [{ version: doc.version || 'R00', fileName: (doc.fileName || '').trim(), uploadedAt: doc.uploadedAt || nowLabel() }],
      createdTs: Date.now(),
      updatedTs: Date.now()
    };
    all.push(rec);
    saveAll(all);
    return rec;
  }

  // Bump a document to a new revision, keeping the previous one in history.
  function replaceVersion(id, o) {
    var all = getAll();
    var rec = all.filter(function (d) { return d.id === id; })[0];
    if (!rec) return { ok: false, err: 'notfound' };
    rec.versions = rec.versions || [];
    rec.versions.unshift({ version: rec.version, fileName: rec.fileName, uploadedAt: rec.uploadedAt });
    rec.version = o.version || rec.version;
    if (o.fileName) rec.fileName = o.fileName;
    if (o.sizeLabel) rec.sizeLabel = o.sizeLabel;
    rec.uploadedAt = o.uploadedAt || nowLabel();
    rec.updatedTs = Date.now();
    if (!rec.createdTs) rec.createdTs = rec.updatedTs;
    saveAll(all);
    return { ok: true, doc: rec };
  }

  function remove(id) {
    var all = getAll();
    var next = all.filter(function (d) { return d.id !== id; });
    saveAll(next);
    return { ok: true, removed: all.length - next.length };
  }

  function setVisibility(id, roleKeys) {
    var all = getAll();
    var rec = all.filter(function (d) { return d.id === id; })[0];
    if (!rec) return { ok: false, err: 'notfound' };
    // Keep only valid role keys, preserve canonical order.
    rec.visibility = ALL_ROLE_KEYS.filter(function (k) { return roleKeys.indexOf(k) !== -1; });
    saveAll(all);
    return { ok: true, doc: rec };
  }

  function countForMachine(machineId) { return list({ machineId: machineId }).length; }

  function reset() {
    try { localStorage.removeItem(DOCS_KEY); localStorage.removeItem(SEED_FLAG); localStorage.removeItem(SEED_VER_KEY); } catch (e) {}
    return getAll();
  }

  window.DocsStore = {
    CATEGORIES: CATEGORIES,
    ROLES: ROLES,
    LANGUAGES: LANGUAGES,
    machines: machines,
    machineName: machineName,
    categoryLabel: categoryLabel,
    categoryIcon: categoryIcon,
    recencyBadge: recencyBadge,
    list: list,
    listByCategory: listByCategory,
    get: get,
    add: add,
    replaceVersion: replaceVersion,
    remove: remove,
    setVisibility: setVisibility,
    countForMachine: countForMachine,
    reset: reset
  };
})();
