/**
 * NETZSCH Customer Portal — NETZSCH Credit profile entry + balance drawer (prototype, CP-733)
 * Adds a balance entry to the profile dropdown (Admin and Buyer only) and opens a drawer with available / pending / expiring credit, savings this
 * year, recent activity and how it works. Needs cashback-store.js.
 */
(function () {
  'use strict';
  if (!window.Credit || !Credit.canSee()) return;

  var STR = {
    en: {
      title: 'NETZSCH Credit',
      chip: 'NETZSCH Credit balance',
      available: 'Available',
      availableNote: 'Company balance. Apply it at checkout.',
      pending: 'Pending',
      pendingNote: 'Released on delivery',
      chipExpiring: 'Some credit expires soon',
      entryExpiring: '{amount} expires {date}',
      alert: '{amount} expires on {date}. Use it on your next order.',
      saved: 'Saved this year',
      savedNote: 'Credit used on orders',
      activity: 'Recent activity',
      earned: 'Earned',
      used: 'Used on order',
      expired: 'Expired',
      tagPending: 'Pending',
      tagAvailable: 'Available',
      order: 'Order',
      how: 'How it works',
      how1: 'Earn {rate} back on grinding media and spare parts. Services are not included.',
      how2: 'Credit is pending until the order is delivered, then available for {months} months.',
      how3: 'Apply it at checkout. It is deducted before approval and before VAT.',
      how4: 'The balance belongs to your company. Every buyer can use it.',
      shop: 'Go to Shop',
      emptyTitle: 'Start earning credit',
      emptyText: 'Earn {rate} back on every order of grinding media and spare parts. Use it on your next order.',
      close: 'Close'
    },
    de: {
      title: 'NETZSCH Guthaben',
      chip: 'NETZSCH Guthaben',
      available: 'Verfügbar',
      availableNote: 'Firmenguthaben. Im Checkout einlösbar.',
      pending: 'Ausstehend',
      pendingNote: 'Freigabe bei Lieferung',
      chipExpiring: 'Ein Teil läuft bald ab',
      entryExpiring: '{amount} läuft am {date} ab',
      alert: '{amount} läuft am {date} ab. Lösen Sie es bei Ihrer nächsten Bestellung ein.',
      saved: 'Dieses Jahr gespart',
      savedNote: 'Bei Bestellungen eingelöst',
      activity: 'Letzte Aktivität',
      earned: 'Erhalten',
      used: 'Eingelöst bei Bestellung',
      expired: 'Abgelaufen',
      tagPending: 'Ausstehend',
      tagAvailable: 'Verfügbar',
      order: 'Bestellung',
      how: 'So funktioniert es',
      how1: '{rate} Guthaben auf Mahlkörper und Ersatzteile. Services sind ausgenommen.',
      how2: 'Das Guthaben ist bis zur Lieferung ausstehend und danach {months} Monate verfügbar.',
      how3: 'Im Checkout einlösen. Es wird vor der Freigabe und vor der MwSt. abgezogen.',
      how4: 'Das Guthaben gehört Ihrem Unternehmen. Alle Einkäufer können es nutzen.',
      shop: 'Zum Shop',
      emptyTitle: 'Guthaben sammeln',
      emptyText: 'Erhalten Sie {rate} auf jede Bestellung von Mahlkörpern und Ersatzteilen. Lösen Sie es bei der nächsten Bestellung ein.',
      close: 'Schließen'
    }
  };

  function s(key, vars) {
    var lang = (window.NetzschI18n && NetzschI18n.getLang()) === 'de' ? 'de' : 'en';
    var out = STR[lang][key] || STR.en[key];
    Object.keys(vars || {}).forEach(function (k) { out = out.replace('{' + k + '}', vars[k]); });
    return out;
  }

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.6A4 4 0 0 0 9 11.4v1.2a4 4 0 0 0 6.5 2.8M7.5 11h5M7.5 13.5h5"/></svg>';
  var WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>';

  var chip, overlay, drawer, lastFocus;

  function pct() { return Math.round(Credit.rules().rate * 100) + '%'; }

  function renderChip() {
    var b = Credit.balance();
    chip.innerHTML = '<span class="credit-entry-icon">' + ICON + '</span>' +
      '<span class="credit-entry-text"><span class="credit-entry-label">' + s('title') + '</span>' +
      (b.expiring ? '<span class="credit-entry-note">' + s('entryExpiring', { amount: Credit.money(b.expiring.amount, false), date: Credit.formatDate(b.expiring.date) }) + '</span>' : '') +
      '</span><span class="credit-entry-value">' + Credit.money(b.available, false) + '</span>';
    chip.setAttribute('aria-label', s('chip') + ': ' + Credit.money(b.available) + (b.expiring ? '. ' + s('chipExpiring') : ''));
  }

  function rowHtml(m) {
    var label, sub, amount, cls, tag = '';
    if (m.type === 'earn') {
      label = s('earned');
      cls = 'is-plus'; amount = '+' + Credit.money(m.amount);
      tag = '<span class="credit-tag">' + s(m.status === 'pending' ? 'tagPending' : 'tagAvailable') + '</span>';
    } else if (m.type === 'redeem') {
      label = s('used');
      cls = 'is-minus'; amount = '−' + Credit.money(m.amount);
    } else {
      label = s('expired');
      cls = 'is-minus'; amount = '−' + Credit.money(m.amount);
    }
    sub = s('order') + ' <a href="order-detail.html">' + m.order + '</a> · ' + Credit.formatDate(m.date);
    return '<li class="credit-row"><div class="credit-row-main"><div>' + label + '</div><div class="credit-row-sub">' + sub + '</div></div>' +
      '<div class="credit-row-amount ' + cls + '">' + amount + '<br>' + tag + '</div></li>';
  }

  function renderDrawer() {
    var r = Credit.rules();
    var body;
    if (!Credit.hasHistory()) {
      body = '<div class="credit-empty"><div class="credit-empty-icon">' + ICON.replace('<svg ', '<svg width="28" height="28" ') + '</div>' +
        '<h3>' + s('emptyTitle') + '</h3><p>' + s('emptyText', { rate: pct() }) + '</p>' +
        '<a class="btn btn-primary btn-md" href="shop.html">' + s('shop') + '</a></div>';
    } else {
      var b = Credit.balance();
      body =
        '<div class="credit-hero"><div class="credit-hero-label">' + s('available') + '</div>' +
          '<div class="credit-hero-value">' + Credit.money(b.available) + '</div>' +
          '<div class="credit-hero-note">' + s('availableNote') + '</div></div>' +
        (b.expiring ? '<div class="credit-alert" role="note">' + WARN + '<span>' +
          s('alert', { amount: '<strong>' + Credit.money(b.expiring.amount) + '</strong>', date: '<strong>' + Credit.formatDate(b.expiring.date) + '</strong>' }) +
          '</span></div>' : '') +
        '<div class="credit-split">' +
          '<div class="credit-stat"><div class="credit-stat-label">' + s('pending') + '</div>' +
            '<div class="credit-stat-value">' + Credit.money(b.pending) + '</div>' +
            '<div class="credit-stat-note">' + s('pendingNote') + '</div></div>' +
          '<div class="credit-stat"><div class="credit-stat-label">' + s('saved') + '</div>' +
            '<div class="credit-stat-value">' + Credit.money(b.savedThisYear) + '</div>' +
            '<div class="credit-stat-note">' + s('savedNote') + '</div></div></div>' +
        '<h3 class="credit-section-title">' + s('activity') + '</h3>' +
        '<ul class="credit-list">' + Credit.movements(5).map(rowHtml).join('') + '</ul>';
    }
    body +=
      '<details class="credit-how"' + (Credit.hasHistory() ? '' : ' open') + '><summary>' + s('how') + '</summary><ol>' +
        '<li>' + s('how1', { rate: pct() }) + '</li>' +
        '<li>' + s('how2', { months: r.validityMonths }) + '</li>' +
        '<li>' + s('how3') + '</li>' +
        '<li>' + s('how4') + '</li></ol></details>';

    drawer.innerHTML =
      '<div class="credit-drawer-head"><h2 id="credit-drawer-title">' + s('title') + '</h2>' +
        '<button type="button" class="credit-close" aria-label="' + s('close') + '">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<div class="credit-drawer-body">' + body + '</div>' +
      (Credit.hasHistory() ? '<div class="credit-drawer-foot"><a class="btn btn-secondary btn-md btn-full" href="shop.html">' + s('shop') + '</a></div>' : '');
    drawer.querySelector('.credit-close').addEventListener('click', close);
  }

  function open(keepFocus) {
    if (!keepFocus) lastFocus = document.activeElement;
    renderDrawer();
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.removeAttribute('inert');
    chip.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { drawer.querySelector('.credit-close').focus(); }, 50);
  }

  function close() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('inert', '');
    chip.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function trapFocus(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = drawer.querySelectorAll('a[href], button, summary, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function init() {
    var menu = document.querySelector('#profileDropdown .profile-dropdown-menu');
    if (!menu || document.querySelector('.credit-entry')) return;

    // Account area: first block of the profile dropdown, under name and email
    chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'credit-entry';
    chip.setAttribute('aria-haspopup', 'dialog');
    chip.setAttribute('aria-expanded', 'false');
    chip.setAttribute('aria-controls', 'credit-drawer');
    chip.addEventListener('click', function (e) {
      e.stopPropagation();
      var dd = document.getElementById('profileDropdown');
      if (dd) dd.classList.remove('open');
      lastFocus = document.querySelector('.profile-avatar, [onclick*="rofile"]');
      open(true);
    });
    menu.parentNode.insertBefore(chip, menu);

    overlay = document.createElement('div');
    overlay.className = 'credit-overlay';
    overlay.addEventListener('click', close);
    drawer = document.createElement('aside');
    drawer.className = 'credit-drawer';
    drawer.id = 'credit-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'credit-drawer-title');
    drawer.setAttribute('inert', '');
    drawer.addEventListener('keydown', trapFocus);
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    renderChip();
    document.addEventListener('netzsch:credit-changed', function () {
      renderChip();
      if (drawer.classList.contains('open')) renderDrawer();
    });
    document.addEventListener('netzsch:i18n-applied', function () {
      renderChip();
      if (drawer.classList.contains('open')) renderDrawer();
    });
  }

  window.CreditUI = { open: open, close: close };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
