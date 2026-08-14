/**
 * NETZSCH Customer Portal — Production Lines store (prototype)
 * Single source of truth for the company's production lines and each
 * machine's line assignment. Persists in localStorage.
 *
 * A "line" is a managed entity: users pick from this list, they never type
 * a free-form line name (except an Admin creating a new line). This keeps
 * the machines filter and grouping free of typos.
 */
(function () {
  'use strict';

  var LINES_KEY = 'netzsch_lines';
  var ASSIGN_KEY = 'netzsch_machine_lines';
  var CUSTOM_KEY = 'netzsch_custom_machines';

  // Canonical machine roster (the prototype "database").
  var MACHINES = [
    { id: 'discus30',    name: 'Discus 30',     page: 'machine-discus30.html',    img: 'machine-discus30.png',    defaultLine: 'Line 1' },
    { id: 'zeta60',      name: 'Zeta 60',       page: 'machine-zeta60.html',      img: 'machine-zeta60.png',      defaultLine: 'Black Production Only' },
    { id: 'mastermix45', name: 'MasterMix 45',  page: 'machine-mastermix45.html', img: 'machine-mastermix45.png', defaultLine: 'Line 3' },
    { id: 'prophi',      name: 'ProPhi',        page: 'machine-prophi.html',      img: 'machine-prophi.png',      defaultLine: 'Line 4' },
    { id: 'alphazeta10', name: 'Alpha Zeta 10', page: 'machine-alphazeta10.html', img: 'machine-zeta60.png',      defaultLine: 'White Production Only' },
    { id: 'zeta500',     name: 'Zeta 500',      page: 'machine-zeta500.html',     img: 'machine-zeta60.png',      defaultLine: '' }
  ];

  var DEFAULT_LINES = ['Line 1', 'Black Production Only', 'Line 3', 'Line 4', 'White Production Only'];

  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function getLines() { return read(LINES_KEY, DEFAULT_LINES.slice()); }
  function saveLines(arr) { write(LINES_KEY, arr); }

  function getAssignments() {
    var a = read(ASSIGN_KEY, null);
    if (a) return a;
    a = {};
    MACHINES.forEach(function (m) { a[m.id] = m.defaultLine; });
    write(ASSIGN_KEY, a);
    return a;
  }
  function saveAssignments(a) { write(ASSIGN_KEY, a); }

  function getCustomMachines() { return read(CUSTOM_KEY, []); }
  function saveCustomMachines(arr) { write(CUSTOM_KEY, arr); }
  function allMachines() { return MACHINES.concat(getCustomMachines()); }

  function getMachines() {
    var a = getAssignments();
    return allMachines().map(function (m) {
      return { id: m.id, name: m.name, page: m.page || '', img: m.img || 'machine-zeta60.png', custom: !!m.custom, line: (a[m.id] != null ? a[m.id] : (m.defaultLine || '')) };
    });
  }

  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  function addMachine(name, line) {
    name = (name || '').trim();
    if (!name) return { ok: false, err: 'empty' };
    var custom = getCustomMachines();
    var allIds = allMachines().map(function (m) { return m.id; });
    var base = 'custom-' + (slug(name) || 'machine'); var id = base; var i = 2;
    while (allIds.indexOf(id) !== -1) { id = base + '-' + (i++); }
    custom.push({ id: id, name: name, page: '', img: 'machine-zeta60.png', custom: true });
    saveCustomMachines(custom);
    if (line) { var a = getAssignments(); a[id] = line; saveAssignments(a); }
    return { ok: true, id: id };
  }
  function getMachineLine(id) { var a = getAssignments(); return a[id] != null ? a[id] : ''; }
  function setMachineLine(id, line) { var a = getAssignments(); a[id] = line || ''; saveAssignments(a); }

  function countForLine(line) {
    return getMachines().filter(function (m) { return m.line === line; }).length;
  }
  function machinesWithoutLine() { return getMachines().filter(function (m) { return !m.line; }); }
  function unassignedCount() { return machinesWithoutLine().length; }

  function addLine(name) {
    name = (name || '').trim();
    if (!name) return { ok: false, err: 'empty' };
    var lines = getLines();
    if (lines.some(function (l) { return l.toLowerCase() === name.toLowerCase(); })) return { ok: false, err: 'dup' };
    lines.push(name);
    saveLines(lines);
    return { ok: true, name: name };
  }

  function renameLine(oldName, newName) {
    newName = (newName || '').trim();
    if (!newName) return { ok: false, err: 'empty' };
    if (newName === oldName) return { ok: true, name: newName };
    var lines = getLines();
    if (lines.some(function (l) { return l.toLowerCase() === newName.toLowerCase() && l !== oldName; })) return { ok: false, err: 'dup' };
    var idx = lines.indexOf(oldName);
    if (idx < 0) return { ok: false, err: 'notfound' };
    lines[idx] = newName;
    saveLines(lines);
    // Propagate to every machine on the renamed line.
    var a = getAssignments();
    Object.keys(a).forEach(function (k) { if (a[k] === oldName) a[k] = newName; });
    saveAssignments(a);
    return { ok: true, name: newName };
  }

  function deleteLine(name) {
    var c = countForLine(name);
    if (c > 0) return { ok: false, err: 'hasMachines', count: c };
    saveLines(getLines().filter(function (l) { return l !== name; }));
    return { ok: true };
  }

  window.MachineLines = {
    getLines: getLines,
    getMachines: getMachines,
    getMachineLine: getMachineLine,
    setMachineLine: setMachineLine,
    countForLine: countForLine,
    machinesWithoutLine: machinesWithoutLine,
    unassignedCount: unassignedCount,
    addLine: addLine,
    renameLine: renameLine,
    deleteLine: deleteLine,
    addMachine: addMachine
  };
})();
