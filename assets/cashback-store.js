/**
 * NETZSCH Customer Portal — NETZSCH Credits store (prototype, CP-733)
 * Single source of truth for the company's credit balance, its movements and
 * the earning rules. Persists in localStorage.
 *
 * NETZSCH Credits are not cash: they are shown in the currency the user buys in
 * (€ or $), so there is no currency conversion between regions.
 *
 * Rules (example values — need business validation):
 *  - 2% back in credits on grinding media (beads) and spare parts. Services are out.
 *  - Credit belongs to the COMPANY, not to the person who ordered.
 *  - Earned credit is "pending" until the order is delivered, then "available"
 *    for 12 months.
 *  - Applied at checkout before approval; the budget consumes the net amount.
 *  - Visibility: Admin and Buyer see and use it, Approver only sees the
 *    applied line on the order, Technician does not see it.
 *
 * Demo helpers: ?credit=reset restores the sample state, ?credit=empty clears
 * all movements (empty state), ?credit=expiring adds a large amount that
 * expires in a few days (reminder flow).
 */
(function () {
  'use strict';

  var KEY = 'netzsch_credit_v4';

  var DEFAULT_RULES = {
    rate: 0.02,
    eligible: ['beads', 'parts'],
    validityMonths: 12,
    remindDays: 30
  };

  var VISIBLE = ['administrator', 'buyer'];

  function iso(daysFromToday) {
    var d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    return d.toISOString().slice(0, 10);
  }

  function addMonths(isoDate, months) {
    var d = new Date(isoDate + 'T00:00:00');
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
  }

  // Sample history: delivered orders (available), orders on the way (pending),
  // one credit already used and one that is close to expiring. Amounts are 2% of
  // the order totals in the orders list (4.000 / 2.700 / 900 €).
  function sample() {
    var e = [];
    function earn(order, amount, daysAgo, status) {
      var date = iso(-daysAgo);
      e.push({ id: 'e-' + order, type: 'earn', order: order, amount: amount, date: date,
        status: status, expires: status === 'available' ? addMonths(date, DEFAULT_RULES.validityMonths) : null });
    }
    earn('2800991-14', 130, 342, 'available');   // 12 € left, expires in ~3 weeks
    earn('2800997-02', 38, 20, 'available');
    earn('2800998-05', 18, 12, 'pending');
    earn('2800998-01', 54, 9, 'pending');
    earn('2800998-30', 80, 2, 'pending');
    e.push({ id: 'r-2800997-11', type: 'redeem', order: '2800997-11', amount: 118, date: iso(-70) });
    return { entries: e, rules: DEFAULT_RULES };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) { /* private mode or corrupted */ }
    var s = sample();
    save(s);
    return s;
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('netzsch:credit-changed'));
  }

  function rules() { return load().rules || DEFAULT_RULES; }

  function daysUntil(isoDate) {
    var today = new Date(iso(0) + 'T00:00:00');
    return Math.round((new Date(isoDate + 'T00:00:00') - today) / 86400000);
  }

  // Redemptions and expirations consume the oldest available credit first
  function lots(state) {
    var avail = state.entries
      .filter(function (x) { return x.type === 'earn' && x.status === 'available'; })
      .sort(function (a, b) { return a.expires < b.expires ? -1 : 1; })
      .map(function (x) { return { expires: x.expires, left: x.amount }; });
    var used = state.entries
      .filter(function (x) { return x.type === 'redeem' || x.type === 'expire'; })
      .reduce(function (s, x) { return s + x.amount; }, 0);
    avail.forEach(function (l) {
      var take = Math.min(l.left, used);
      l.left -= take; used -= take;
    });
    return avail.filter(function (l) { return l.left > 0 && daysUntil(l.expires) >= 0; });
  }

  function balance() {
    var state = load();
    var r = state.rules || DEFAULT_RULES;
    var open = lots(state);
    var available = open.reduce(function (s, l) { return s + l.left; }, 0);
    var pending = state.entries
      .filter(function (x) { return x.type === 'earn' && x.status === 'pending'; })
      .reduce(function (s, x) { return s + x.amount; }, 0);
    var soon = open.filter(function (l) { return daysUntil(l.expires) <= r.remindDays; });
    var year = String(new Date().getFullYear());
    var saved = state.entries
      .filter(function (x) { return x.type === 'redeem' && x.date.slice(0, 4) === year; })
      .reduce(function (s, x) { return s + x.amount; }, 0);
    return {
      available: available,
      pending: pending,
      expiring: soon.length ? { amount: soon.reduce(function (s, l) { return s + l.left; }, 0), date: soon[0].expires } : null,
      savedThisYear: saved
    };
  }

  function movements(limit) {
    var list = load().entries.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    return limit ? list.slice(0, limit) : list;
  }

  function hasHistory() { return load().entries.length > 0; }

  // Credit an order earns, given its eligible subtotal
  function earnFor(eligibleAmount) {
    return Math.round(eligibleAmount * rules().rate); // whole credits
  }

  function addEarn(order, amount) {
    var state = load();
    state.entries.push({ id: 'e-' + order, type: 'earn', order: order, amount: amount, date: iso(0), status: 'pending', expires: null });
    save(state);
  }

  function redeem(order, amount) {
    var state = load();
    state.entries.push({ id: 'r-' + order, type: 'redeem', order: order, amount: amount, date: iso(0) });
    save(state);
  }

  // Delivery releases pending credit for the next 12 months
  function release(order) {
    var state = load();
    state.entries.forEach(function (x) {
      if (x.type === 'earn' && x.order === order && x.status === 'pending') {
        x.status = 'available';
        x.expires = addMonths(iso(0), (state.rules || DEFAULT_RULES).validityMonths);
      }
    });
    save(state);
  }

  function role() {
    try { return localStorage.getItem('netzsch_user_role') || 'administrator'; } catch (err) { return 'administrator'; }
  }

  function canSee() { return VISIBLE.indexOf(role()) !== -1; }

  // Currency the user buys in. The portal only sells in € today; a US account
  // would return USD here and every credit amount follows.
  function currency() { return 'EUR'; }

  function money(v, decimals) {
    // Same format as the cart and payment cards (1.240,00 € / $1,240.00)
    var d = decimals === false ? 0 : 2;
    var opts = { minimumFractionDigits: d, maximumFractionDigits: d };
    if (currency() === 'USD') return '$' + Number(v).toLocaleString('en-US', opts);
    return Number(v).toLocaleString('de-DE', opts) + ' €';
  }

  // Credit amounts are shown in the local currency, like any other price
  function credits(v) { return money(Math.round(v)); }

  function formatDate(isoDate) {
    var lang = (window.NetzschI18n && NetzschI18n.getLang()) || 'en';
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }.replace('Sept', 'Sep');
  }

  // Demo helpers
  (function demo() {
    var m = /[?&]credit=(reset|empty|expiring)/.exec(location.search);
    if (!m) return;
    var s = sample();
    if (m[1] === 'empty') s.entries = [];
    if (m[1] === 'expiring') {
      s.entries.push({ id: 'e-2800990-33', type: 'earn', order: '2800990-33', amount: 640, date: iso(-360),
        status: 'available', expires: iso(5) });
    }
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (err) { /* ignore */ }
  })();

  window.Credit = {
    get: load,
    rules: rules,
    balance: balance,
    movements: movements,
    hasHistory: hasHistory,
    earnFor: earnFor,
    addEarn: addEarn,
    redeem: redeem,
    release: release,
    daysUntil: daysUntil,
    canSee: canSee,
    role: role,
    currency: currency,
    money: money,
    credits: credits,
    formatDate: formatDate
  };
})();
