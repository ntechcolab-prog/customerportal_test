/**
 * NETZSCH Customer Portal — G&D Digital Products licenses store (prototype, CP-732)
 * Single source of truth for products, pricing rules and the customer's
 * subscriptions. Persists in localStorage.
 *
 * Pricing model (example values — need business validation):
 *  - Production Monitoring: one license per machine, volume price per machine.
 *  - Performance Tracking, Bead Wear Detection, Maintenance Tool: one license
 *    covers all the customer's machines (fleet-wide).
 *  - Bundle: progressive discount by number of distinct products in the plan.
 *  - Billing: yearly (base price) or monthly (yearly / 10 → yearly = 2 months free).
 *
 * Demo helpers: ?demo=reset restores the sample state, ?demo=none clears all
 * licenses (empty state, IRIS Cloud access hidden).
 */
(function () {
  'use strict';

  var KEY = 'netzsch_licenses';
  var IRIS_URL = 'https://iris.netzsch.com';

  var PRODUCTS = [
    { id: 'pm', name: 'Production Monitoring', model: 'machine', price: 1000,
      desc: 'Real-time output, uptime and alerts for each machine.' },
    { id: 'pt', name: 'Performance Tracking', model: 'fleet', price: 2400,
      desc: 'KPIs and trends across your whole fleet.' },
    { id: 'bw', name: 'Bead Wear Detection', model: 'fleet', price: 1800,
      desc: 'Know when grinding media wears out before quality drops.' },
    { id: 'mt', name: 'Maintenance Tool', model: 'fleet', price: 1200,
      desc: 'Plan, log and schedule maintenance for every machine.' }
  ];

  // Production Monitoring price per machine by quantity
  var PM_TIERS = [
    { min: 1, price: 1000 },
    { min: 2, price: 800 },
    { min: 4, price: 700 }
  ];

  // Bundle discount by number of distinct products
  var BUNDLE = { 1: 0, 2: 0.10, 3: 0.15, 4: 0.20 };

  function iso(daysFromToday) {
    var d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().slice(0, 10);
  }

  function sample() {
    return {
      cycle: 'year',
      subs: {
        pm: { status: 'active', machines: ['discus30', 'zeta60'], renewsOn: iso(18), autoRenew: false, since: iso(-347) },
        bw: { status: 'active', renewsOn: iso(217), autoRenew: true, since: iso(-148) },
        mt: { status: 'expired', renewsOn: iso(-41), autoRenew: false, since: iso(-406) }
      },
      invoices: [
        { id: 'INV-DP-2026-014', date: iso(-148), items: 'Bead Wear Detection', total: 1620 },
        { id: 'INV-DP-2025-087', date: iso(-347), items: 'Production Monitoring ×2, Maintenance Tool', total: 2700 }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    var s = sample();
    save(s);
    return s;
  }

  function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  // Demo switches via query string
  (function () {
    var m = /[?&]demo=(reset|none)/.exec(location.search);
    if (!m) return;
    if (m[1] === 'reset') save(sample());
    else save({ cycle: 'year', subs: {}, invoices: [] });
  })();

  function product(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  function pmUnitPrice(qty) {
    var p = PM_TIERS[0].price;
    PM_TIERS.forEach(function (t) { if (qty >= t.min) p = t.price; });
    return p;
  }

  function daysUntil(isoDate) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var d = new Date(isoDate + 'T00:00:00');
    return Math.round((d - today) / 86400000);
  }

  // Effective status: active | expiring (≤ 30 days, no auto-renew) | expired | none
  function statusOf(id) {
    var s = load().subs[id];
    if (!s) return 'none';
    if (s.status === 'expired' || daysUntil(s.renewsOn) < 0) return 'expired';
    if (!s.autoRenew && daysUntil(s.renewsOn) <= 30) return 'expiring';
    return 'active';
  }

  function hasActive() {
    return PRODUCTS.some(function (p) {
      var st = statusOf(p.id);
      return st === 'active' || st === 'expiring';
    });
  }

  /**
   * Quote a plan.
   * plan = { pm: ['discus30', ...], pt: true, bw: false, mt: true, cycle: 'year'|'month' }
   * Returns line items, discounts and totals for the chosen cycle.
   */
  function quote(plan) {
    var cycle = plan.cycle || 'year';
    var div = cycle === 'month' ? 10 : 1;
    var lines = [];
    var list = 0, volume = 0;

    var qty = (plan.pm || []).length;
    if (qty > 0) {
      var unit = pmUnitPrice(qty);
      list += 1000 * qty;
      volume += (1000 - unit) * qty;
      lines.push({ id: 'pm', name: 'Production Monitoring', qty: qty, unit: unit / div, listUnit: 1000 / div, total: unit * qty / div });
    }
    ['pt', 'bw', 'mt'].forEach(function (id) {
      if (!plan[id]) return;
      var p = product(id);
      list += p.price;
      lines.push({ id: id, name: p.name, qty: 1, unit: p.price / div, listUnit: p.price / div, total: p.price / div });
    });

    var count = lines.length;
    var rate = BUNDLE[count] || 0;
    var afterVolume = list - volume;
    var bundle = Math.round(afterVolume * rate);
    var total = afterVolume - bundle;

    return {
      cycle: cycle,
      lines: lines,
      productCount: count,
      list: list / div,
      volumeDiscount: volume / div,
      bundleRate: rate,
      bundleDiscount: bundle / div,
      total: total / div,
      yearlySaving: cycle === 'year' ? (total * 12 / 10) - total : 0
    };
  }

  // Current subscriptions as a plan (used to prefill renewal)
  function currentPlan() {
    var subs = load().subs;
    var plan = { pm: [], pt: false, bw: false, mt: false, cycle: load().cycle || 'year' };
    if (subs.pm) plan.pm = subs.pm.machines.slice();
    ['pt', 'bw', 'mt'].forEach(function (id) { if (subs[id]) plan[id] = true; });
    return plan;
  }

  // Apply a purchased/renewed plan: every product in it is active for one cycle
  function applyPlan(plan) {
    var state = load();
    var q = quote(plan);
    var renews = iso(plan.cycle === 'month' ? 30 : 365);
    var names = [];
    if ((plan.pm || []).length) {
      state.subs.pm = { status: 'active', machines: plan.pm.slice(), renewsOn: renews, autoRenew: true, since: (state.subs.pm && state.subs.pm.since) || iso(0) };
      names.push('Production Monitoring ×' + plan.pm.length);
    }
    ['pt', 'bw', 'mt'].forEach(function (id) {
      if (!plan[id]) return;
      state.subs[id] = { status: 'active', renewsOn: renews, autoRenew: true, since: (state.subs[id] && state.subs[id].since) || iso(0) };
      names.push(product(id).name);
    });
    state.cycle = plan.cycle;
    var id = 'INV-DP-' + new Date().getFullYear() + '-' + String(Math.floor(100 + Math.random() * 900));
    state.invoices.unshift({ id: id, date: iso(0), items: names.join(', '), total: q.total });
    save(state);
    return { invoice: id, total: q.total, renewsOn: renews };
  }

  function setAutoRenew(id, on) {
    var state = load();
    if (!state.subs[id]) return;
    state.subs[id].autoRenew = !!on;
    save(state);
  }

  function cancel(id) {
    var state = load();
    if (!state.subs[id]) return;
    state.subs[id].autoRenew = false;
    save(state);
  }

  function money(v) {
    return '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formatDate(isoDate) {
    var lang = (window.NetzschI18n && NetzschI18n.getLang()) || 'en';
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  window.Licenses = {
    IRIS_URL: IRIS_URL,
    PRODUCTS: PRODUCTS,
    PM_TIERS: PM_TIERS,
    BUNDLE: BUNDLE,
    get: load,
    product: product,
    statusOf: statusOf,
    hasActive: hasActive,
    daysUntil: daysUntil,
    pmUnitPrice: pmUnitPrice,
    quote: quote,
    currentPlan: currentPlan,
    applyPlan: applyPlan,
    setAutoRenew: setAutoRenew,
    cancel: cancel,
    money: money,
    formatDate: formatDate
  };
})();
