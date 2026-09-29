/* Service Requests store — single source of truth for the Services list, the
   Service Request form and the confirmation/detail page.
   Seeded with the 8 sample services; new submissions from the form are appended.
   Prototype only: everything lives in localStorage, no backend. */
(function () {
  'use strict';

  var KEY = 'netzsch_service_requests';
  var VKEY = 'netzsch_service_requests_seed_ver';
  var SEED_VERSION = 'v1';
  var DASH = '—'; // —

  var TYPE_LABEL = {
    'repair': 'Repair',
    'spare-parts': 'Spare Parts',
    'maintenance': 'Maintenance',
    'consultation': 'Consultation'
  };
  var STATUS_LABEL = {
    'submitted': 'Submitted',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };
  // Best-effort machine artwork by display name (unknown machines fall back to none).
  var MACHINE_IMG = {
    'Discus 30': '../assets/machine-discus30.png',
    'Zeta 60': '../assets/machine-zeta60.png',
    'Zeta 300': '../assets/machine-zeta60.png',
    'MasterMix 45': '../assets/machine-mastermix45.png',
    'ProPhi': '../assets/machine-prophi.png',
    'Alpha Zeta 10': '../assets/machine-zeta60.png'
  };

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Build a machine-spec object. Known fields are filled; anything unknown renders as —.
  function specs(name, serial, extra) {
    var s = {
      name: name,
      serial: serial || DASH,
      country: 'Brazil',
      equipName: name,
      commission: serial || DASH,
      machineType: 'Bead Mill Stirrer',
      figNr: DASH,
      serviceBy: 'NEM',
      purchaseDate: DASH,
      installDate: DASH,
      warranty: DASH,
      image: MACHINE_IMG[name] || ''
    };
    if (extra) { for (var k in extra) { if (extra.hasOwnProperty(k) && extra[k]) s[k] = extra[k]; } }
    return s;
  }

  // The 8 sample services that also render as the static rows of services.html.
  function seed() {
    return [
      { id: '15345678', date: 'Feb 2, 2026', type: 'repair', status: 'in-progress', title: 'Repair request', desc: 'Strange noise during operation at high RPM', machine: specs('Zeta 300', '232345') },
      { id: '15345679', date: 'Feb 2, 2026', type: 'spare-parts', status: 'in-progress', title: 'Spare parts request', desc: 'I need a spare part for this machine.', machine: specs('Zeta 300', '232345') },
      { id: '15345680', date: 'Jan 20, 2026', type: 'maintenance', status: 'completed', title: 'Maintenance request', desc: 'Scheduled preventive maintenance.', machine: specs('Zeta 300', '232345') },
      { id: '15345681', date: 'Jan 10, 2026', type: 'consultation', status: 'submitted', title: 'Consultation request', desc: 'Need expert advice on grinding parameters.', machine: specs('Discus 30', '456123') },
      { id: '15345682', date: 'Dec 15, 2025', type: 'repair', status: 'cancelled', title: 'Repair request', desc: 'Issue resolved before service visit.', machine: specs('ProPhi', '789123') },
      { id: '15345683', date: 'Nov 28, 2025', type: 'maintenance', status: 'in-progress', title: 'Maintenance request', desc: 'Annual calibration and alignment check.', machine: specs('Alpha Zeta 10', '334455') },
      { id: '15345684', date: 'Nov 15, 2025', type: 'spare-parts', status: 'completed', title: 'Spare parts request', desc: 'Replacement grinding discs for quarterly swap.', machine: specs('Discus 30', '456123') },
      { id: '15345685', date: 'Nov 3, 2025', type: 'consultation', status: 'submitted', title: 'Consultation request', desc: 'Process optimization for new material batch.', machine: specs('MasterMix 45', '667788') }
    ];
  }

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }

  // Return the full list, (re)seeding when empty or when the seed version changed.
  // User-created requests (ids not in the seed) survive a reseed.
  function getAll() {
    var stored = read();
    var ver = null;
    try { ver = localStorage.getItem(VKEY); } catch (e) {}
    if (!stored || ver !== SEED_VERSION) {
      var base = seed();
      var seedIds = {};
      base.forEach(function (r) { seedIds[r.id] = true; });
      if (stored && stored.length) {
        // keep any request the user created on top of the fresh seed
        for (var i = stored.length - 1; i >= 0; i--) {
          if (!seedIds[stored[i].id]) base.unshift(stored[i]);
        }
      }
      write(base);
      try { localStorage.setItem(VKEY, SEED_VERSION); } catch (e) {}
      return base;
    }
    return stored;
  }

  window.ServiceRequestsStore = {
    KEY: KEY,
    typeLabel: function (t) { return TYPE_LABEL[t] || t; },
    statusLabel: function (s) { return STATUS_LABEL[s] || s; },
    specs: specs,
    list: function () { return getAll(); },
    get: function (id) {
      var all = getAll();
      id = String(id);
      for (var i = 0; i < all.length; i++) { if (all[i].id === id) return all[i]; }
      return null;
    },
    add: function (req) {
      var all = getAll();
      all.unshift(req);
      write(all);
      return req;
    },
    // Next id in the list's numbering space (max existing + 1).
    newId: function () {
      var max = 15345685;
      getAll().forEach(function (r) { var v = parseInt(r.id, 10); if (!isNaN(v) && v > max) max = v; });
      return String(max + 1);
    },
    // "Mon D, YYYY" for a given Date (defaults to now).
    todayLabel: function (d) {
      d = d || new Date();
      return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }
  };
})();
