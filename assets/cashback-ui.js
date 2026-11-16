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
      title: 'NETZSCH Credits',
      chip: 'NETZSCH Credits balance',
      available: 'Available',
      availableNote: 'Company balance. 1 credit = 1 € or 1 $ on your next order.',
      pending: 'Pending',
      pendingNote: 'Released on delivery',
      chipExpiring: 'Some credits expire soon',
      entryExpiring: '{amount} expire {date}',
      alert: '{amount} expire on {date}. Use them on your next order.',
      saved: 'Saved this year',
      savedNote: 'Credits used on orders',
      activity: 'Recent activity',
      earned: 'Earned',
      used: 'Used on order',
      expired: 'Expired',
      tagPending: 'Pending',
      tagAvailable: 'Available',
      order: 'Order',
      how: 'How it works',
      how1: 'Earn 2 credits for every 100 spent on grinding media and spare parts. Services are not included.',
      how2: 'Credits are pending until the order is delivered, then available for {months} months.',
      how3: '1 credit = 1 unit of your order currency (1 € or 1 $), so there is no currency conversion. Credits are a discount on your next order, not cash.',
      how4: 'Apply them at checkout, before approval and before VAT. The balance belongs to your company.',
      shop: 'Go to Shop',
      emptyTitle: 'Start earning credits',
      emptyText: 'Earn 2 credits for every 100 spent on grinding media and spare parts. Use them on your next order.',
      close: 'Close',
      earns: 'This order earns {amount}',
      earnsNote: 'Available after delivery, valid for {months} months.',
      orderCredit: 'NETZSCH Credits',
      orderPending: 'Pending. Available after delivery.',
      useCredit: 'Use NETZSCH Credits',
      availableAmount: '{amount} available',
      applied: 'NETZSCH Credits applied',
      appliedNote: '',
      nowEarned: 'Earned on this order',
      nowEarnedNote: 'Pending. Available after delivery.',
      homeTitle: 'NETZSCH Credits',
      homeDesc: '{amount} expire {date}',
      homeCta: 'Use credits',
      homeSubtitle: 'Contracts, licenses and credits expiring within the next 30 days',
      nExpTitle: '{amount} expire on {date}',
      nExpDesc: 'Use it on your next order of grinding media or spare parts.',
      nRelTitle: '{amount} are now available',
      nRelDesc: 'Order #{order} was delivered. Use your credits until {date}.',
      nShop: 'Go to Shop',
      nView: 'View credits',
      today: 'Today',
      daysAgo: '{n} days ago',
      dayAgo: '1 day ago'
    },
    de: {
      title: 'NETZSCH Credits',
      chip: 'NETZSCH Credits',
      available: 'Verfügbar',
      availableNote: 'Firmenguthaben. 1 Credit = 1 € oder 1 $ bei Ihrer nächsten Bestellung.',
      pending: 'Ausstehend',
      pendingNote: 'Freigabe bei Lieferung',
      chipExpiring: 'Ein Teil läuft bald ab',
      entryExpiring: '{amount} laufen am {date} ab',
      alert: '{amount} laufen am {date} ab. Lösen Sie sie bei Ihrer nächsten Bestellung ein.',
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
      how1: '2 Credits je 100 Ausgaben für Mahlkörper und Ersatzteile. Services sind ausgenommen.',
      how2: 'Credits sind bis zur Lieferung ausstehend und danach {months} Monate verfügbar.',
      how3: '1 Credit = 1 Einheit Ihrer Bestellwährung (1 € oder 1 $), ohne Währungsumrechnung. Credits sind ein Rabatt auf die nächste Bestellung, kein Bargeld.',
      how4: 'Im Checkout einlösen, vor der Freigabe und vor der MwSt. Das Guthaben gehört Ihrem Unternehmen.',
      shop: 'Zum Shop',
      emptyTitle: 'Credits sammeln',
      emptyText: '2 Credits je 100 Ausgaben für Mahlkörper und Ersatzteile. Lösen Sie sie bei der nächsten Bestellung ein.',
      close: 'Schließen',
      earns: 'Diese Bestellung bringt {amount}',
      earnsNote: 'Nach der Lieferung {months} Monate verfügbar.',
      orderCredit: 'NETZSCH Credits',
      orderPending: 'Ausstehend. Nach der Lieferung verfügbar.',
      useCredit: 'NETZSCH Credits einlösen',
      availableAmount: '{amount} verfügbar',
      applied: 'NETZSCH Credits eingelöst',
      appliedNote: '',
      nowEarned: 'Mit dieser Bestellung erhalten',
      nowEarnedNote: 'Ausstehend. Nach der Lieferung verfügbar.',
      homeTitle: 'NETZSCH Credits',
      homeDesc: '{amount} laufen am {date} ab',
      homeCta: 'Credits nutzen',
      homeSubtitle: 'Verträge, Lizenzen und Credits, die in den nächsten 30 Tagen ablaufen',
      nExpTitle: '{amount} laufen am {date} ab',
      nExpDesc: 'Lösen Sie es bei Ihrer nächsten Bestellung von Mahlkörpern oder Ersatzteilen ein.',
      nRelTitle: '{amount} sind jetzt verfügbar',
      nRelDesc: 'Bestellung #{order} wurde geliefert. Credits gültig bis {date}.',
      nShop: 'Zum Shop',
      nView: 'Credits ansehen',
      today: 'Heute',
      daysAgo: 'vor {n} Tagen',
      dayAgo: 'vor 1 Tag'
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

  // Day + month only, so the profile menu line never wraps
  function shortDate(isoDate) {
    var de = window.NetzschI18n && NetzschI18n.getLang() === 'de';
    return new Date(isoDate + 'T00:00:00').toLocaleDateString(de ? 'de-DE' : 'en-GB', { day: '2-digit', month: 'short' });
  }

  function renderChip() {
    var b = Credit.balance();
    chip.innerHTML = '<span class="credit-entry-icon">' + ICON + '</span>' +
      '<span class="credit-entry-text"><span class="credit-entry-label">' + s('title') + '</span>' +
      (b.expiring ? '<span class="credit-entry-note">' + s('entryExpiring', { amount: Credit.credits(b.expiring.amount), date: shortDate(b.expiring.date) }) + '</span>' : '') +
      '</span><span class="credit-entry-value">' + Credit.credits(b.available) + '</span>';
    chip.setAttribute('aria-label', s('chip') + ': ' + Credit.credits(b.available) + (b.expiring ? '. ' + s('chipExpiring') : ''));
  }

  function rowHtml(m) {
    var label, sub, amount, cls, tag = '';
    if (m.type === 'earn') {
      label = s('earned');
      cls = 'is-plus'; amount = '+' + Credit.credits(m.amount);
      tag = '<span class="credit-tag">' + s(m.status === 'pending' ? 'tagPending' : 'tagAvailable') + '</span>';
    } else if (m.type === 'redeem') {
      label = s('used');
      cls = 'is-minus'; amount = '−' + Credit.credits(m.amount);
    } else {
      label = s('expired');
      cls = 'is-minus'; amount = '−' + Credit.credits(m.amount);
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
          '<div class="credit-hero-value">' + Credit.credits(b.available) + '</div>' +
          '<div class="credit-hero-note">' + s('availableNote') + '</div></div>' +
        (b.expiring ? '<div class="credit-alert" role="note">' + WARN + '<span>' +
          s('alert', { amount: '<strong>' + Credit.credits(b.expiring.amount) + '</strong>', date: '<strong>' + Credit.formatDate(b.expiring.date) + '</strong>' }) +
          '</span></div>' : '') +
        '<div class="credit-split">' +
          '<div class="credit-stat"><div class="credit-stat-label">' + s('pending') + '</div>' +
            '<div class="credit-stat-value">' + Credit.credits(b.pending) + '</div>' +
            '<div class="credit-stat-note">' + s('pendingNote') + '</div></div>' +
          '<div class="credit-stat"><div class="credit-stat-label">' + s('saved') + '</div>' +
            '<div class="credit-stat-value">' + Credit.credits(b.savedThisYear) + '</div>' +
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


  // ---------- Earn: cart dropdown, cart page and order detail ----------

  var appliedCredit = 0;

  function parseEuro(text) {
    var n = parseFloat(String(text).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  // All shop items are grinding media or spare parts (eligible); quotations have no price yet
  function cartEligible() {
    var items = [];
    try { items = (JSON.parse(localStorage.getItem('netzsch_cart') || '{}').items) || []; } catch (err) { /* ignore */ }
    if (items.some(function (i) { return i.quotation; })) return 0;
    return items.reduce(function (sum, i) { return sum + (i.unitPrice || 0) * (i.qty || 0); }, 0);
  }

  function earnLine(cls, withNote) {
    var amount = Credit.earnFor(Math.max(0, cartEligible() - appliedCredit));
    var el = document.createElement('div');
    el.className = 'credit-earn ' + cls;
    el.hidden = !amount;
    el.innerHTML = '<span class="credit-earn-icon">' + ICON + '</span><span>' +
      s('earns', { amount: '<strong>' + Credit.credits(amount) + '</strong>' }) +
      (withNote ? '<span class="credit-earn-sub">' + s('earnsNote', { months: Credit.rules().validityMonths }) + '</span>' : '') + '</span>';
    return el;
  }

  function mountEarn(anchor, cls, withNote, watch) {
    var line;
    function render() {
      var next = earnLine(cls, withNote);
      var row = document.getElementById(anchor.id);
      if (row && row.style.display === 'none') next.hidden = true;
      if (line) line.replaceWith(next); else anchor.insertAdjacentElement('afterend', next);
      line = next;
    }
    render();
    new MutationObserver(render).observe(watch, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    document.addEventListener('netzsch:i18n-applied', render);
  }

  function initEarn() {
    // Cart dropdown in the header (two markups across pages)
    ['cart-subtotal-row', 'cart-dd-subtotal-row'].forEach(function (id) {
      var row = document.getElementById(id);
      if (row) mountEarn(row, 'credit-earn--dropdown', false, row);
    });
    // Cart page: under the order total
    var total = document.getElementById('payOrderTotal');
    if (/checkout-confirmation/.test(location.pathname)) return;
    if (total && total.parentNode.classList.contains('order-total-row')) {
      mountEarn(total.parentNode, 'credit-earn--summary', true, total);
      return;
    }
    // Order detail: credit earned on this order, pending until delivery
    var orderTotal = document.querySelector('.payment-card .payment-row.total');
    var subtotal = document.querySelector('.payment-card .payment-row .payment-value');
    if (orderTotal && subtotal) {
      var amount = Credit.earnFor(parseEuro(subtotal.textContent));
      var box = document.createElement('div');
      box.className = 'credit-earn credit-earn--order';
      function paint() {
        box.innerHTML = '<span class="credit-earn-icon">' + ICON + '</span><span class="credit-earn-main">' +
          '<span class="credit-earn-row"><span>' + s('orderCredit') + '</span><strong>+' + Credit.credits(amount) + '</strong></span>' +
          '<span class="credit-earn-sub">' + s('orderPending') + '</span></span>';
      }
      paint();
      orderTotal.insertAdjacentElement('afterend', box);
      document.addEventListener('netzsch:i18n-applied', paint);
    }
  }

  // ---------- Use: checkout review toggle + confirmation ----------

  var CHECKOUT_KEY = 'netzsch_credit_checkout';

  // Shown in every checkout step (checkout, order details, review). Off by default;
  // the choice follows the buyer through the steps.
  function initCheckout() {
    var before = document.getElementById('payTotalBefore');
    var total = document.getElementById('payOrderTotal');
    if (!before || !total || !/checkout(-order-details|-review)?\.html/.test(location.pathname)) return;
    var coupon = before.closest('.sidebar-card, .payment-card').querySelector('.coupon-link');
    var available = Credit.balance().available;
    if (!coupon || !available) return;
    var on = false;
    try { on = sessionStorage.getItem(CHECKOUT_KEY + '_on') === '1'; } catch (err) { /* ignore */ }

    var row = document.createElement('div');
    row.className = 'credit-apply';
    row.innerHTML =
      '<button type="button" class="credit-switch" role="switch" aria-labelledby="credit-apply-label" aria-describedby="credit-apply-note">' +
        '<span class="credit-switch-track"><span class="credit-switch-thumb"></span></span></button>' +
      '<span class="credit-apply-text"><span id="credit-apply-label" class="credit-apply-label"></span>' +
        '<span id="credit-apply-note" class="credit-apply-note"></span></span>' +
      '<span class="credit-apply-value"></span>';
    coupon.closest('.payment-row').insertAdjacentElement('afterend', row);
    var sw = row.querySelector('.credit-switch');

    var pageTotal = 0; // total as the page computed it (may include VAT)
    function update() {
      var base = parseEuro(before.textContent);
      row.hidden = !cartEligible(); // quotations have no price yet
      var max = Math.min(available, base || available);
      appliedCredit = on ? max : 0;
      sw.setAttribute('aria-checked', String(on));
      row.querySelector('.credit-apply-label').textContent = s('useCredit');
      row.querySelector('.credit-apply-note').textContent = s('availableAmount', { amount: Credit.credits(available) }) +
        '';
      row.querySelector('.credit-apply-value').textContent = appliedCredit ? '−' + Credit.money(appliedCredit) : '';
      // Credit is deducted before VAT: scale it by the page's total/subtotal ratio
      if (base && pageTotal) total.textContent = Credit.money(pageTotal - appliedCredit * (pageTotal / base));
      var earn = document.querySelector('.credit-earn--summary');
      if (earn) earn.replaceWith(earnLine('credit-earn--summary', true));
    }
    function capture() {
      pageTotal = parseEuro(total.textContent);
      update();
    }
    sw.addEventListener('click', function () {
      on = !on;
      try { sessionStorage.setItem(CHECKOUT_KEY + '_on', on ? '1' : '0'); } catch (err) { /* ignore */ }
      update();
    });
    capture();
    // Page scripts recalculate totals (delivery method, quantities): follow them
    new MutationObserver(capture).observe(before, { childList: true, characterData: true, subtree: true });
    document.addEventListener('netzsch:i18n-applied', update);

    // Place Order (review step): hand the applied credit to the confirmation page
    var place = document.getElementById('btnPlaceOrder');
    if (place) place.addEventListener('click', function () {
      if (place.classList.contains('disabled-btn')) return;
      try {
        sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({
          applied: appliedCredit,
          earn: Credit.earnFor(Math.max(0, cartEligible() - appliedCredit))
        }));
      } catch (err) { /* ignore */ }
    }, true);
  }

  function initConfirmation() {
    if (!/checkout-confirmation/.test(location.pathname)) return;
    var data;
    try { data = JSON.parse(sessionStorage.getItem(CHECKOUT_KEY) || 'null'); } catch (err) { data = null; }
    var totalRow = document.getElementById('payOrderTotal');
    var title = document.getElementById('orderTitle');
    if (!data || !totalRow) return;
    var orderNo = title ? title.textContent.replace(/[^\d-]/g, '') : 'new';
    // Record once per confirmation
    if (!data.done) {
      if (data.applied) Credit.redeem(orderNo, data.applied);
      if (data.earn) Credit.addEarn(orderNo, data.earn);
      data.done = orderNo;
      try { sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify(data)); } catch (err) { /* ignore */ }
    }
    var before = document.getElementById('payTotalBefore');
    if (data.applied && before) {
      var r = document.createElement('div');
      r.className = 'payment-row credit-applied-row';
      r.innerHTML = '<span class="label">' + s('applied') + '</span><span class="value">−' + Credit.money(data.applied) + '</span>';
      var sep = totalRow.closest('.order-total-row').previousElementSibling;
      sep.parentNode.insertBefore(r, sep);
      totalRow.textContent = Credit.money(Math.max(0, parseEuro(before.textContent) - data.applied));
    }
    if (data.earn) {
      var box = document.createElement('div');
      box.className = 'credit-earn credit-earn--order';
      box.innerHTML = '<span class="credit-earn-icon">' + ICON + '</span><span class="credit-earn-main">' +
        '<span class="credit-earn-row"><span>' + s('nowEarned') + '</span><strong>+' + Credit.credits(data.earn) + '</strong></span>' +
        '<span class="credit-earn-sub">' + s('nowEarnedNote') + '</span></span>';
      totalRow.closest('.order-total-row').insertAdjacentElement('afterend', box);
    }
  }

  // ---------- Remind: home card row + notifications ----------

  function ago(isoDate) {
    var d = -Credit.daysUntil(isoDate);
    return d <= 0 ? s('today') : d === 1 ? s('dayAgo') : s('daysAgo', { n: d });
  }

  function lastReleased() {
    return Credit.movements().filter(function (m) { return m.type === 'earn' && m.status === 'available'; })[0];
  }

  function initHome() {
    var lic = document.getElementById('licAlerts');
    var b = Credit.balance();
    if (!lic || !b.expiring) return;
    var row = document.createElement('a');
    row.href = 'shop.html';
    row.className = 'contract-alert credit-home-row';
    function paint() {
      row.innerHTML = '<div class="contract-alert-icon credit-home-icon">' + ICON + '</div>' +
        '<div class="contract-alert-info"><div class="contract-alert-id">' + s('homeTitle') + '</div>' +
        '<div class="contract-alert-desc">' + s('homeDesc', { amount: Credit.credits(b.expiring.amount), date: Credit.formatDate(b.expiring.date) }) + '</div></div>' +
        '<span class="btn btn-primary btn-sm">' + s('homeCta') + '</span>';
      var sub = lic.parentNode.querySelector('.card-subtitle');
      if (sub) sub.textContent = s('homeSubtitle');
    }
    paint();
    lic.insertAdjacentElement('afterend', row);
    document.addEventListener('netzsch:i18n-applied', paint);
  }

  function notifications() {
    var b = Credit.balance(), list = [];
    if (b.expiring) list.push({ unread: true, title: s('nExpTitle', { amount: Credit.credits(b.expiring.amount), date: Credit.formatDate(b.expiring.date) }),
      desc: s('nExpDesc'), time: s('today'), href: 'shop.html', cta: s('nShop') });
    var rel = lastReleased();
    if (rel) list.push({ unread: false, last: true, title: s('nRelTitle', { amount: Credit.credits(rel.amount) }),
      desc: s('nRelDesc', { order: rel.order, date: Credit.formatDate(rel.expires) }), time: ago(rel.date), cta: s('nView'), drawer: true });
    return list;
  }

  function bumpBadges(extra) {
    if (!extra) return;
    ['.notif-badge', '.notif-count-badge'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var n = parseInt(el.textContent, 10) || 0;
        el.textContent = n + extra;
        el.style.display = '';
      });
    });
  }

  function initNotifications() {
    var items = notifications();
    if (!items.length) return;
    // Header dropdown
    var dd = document.querySelector('.notif-list');
    if (dd) {
      var html = items.filter(function (n) { return !n.last; }).map(function (n) {
        return '<div class="notif-item' + (n.unread ? ' unread' : '') + ' credit-notif">' +
          '<div class="notif-item-icon credit-notif-icon">' + ICON + '</div><div class="notif-item-content">' +
          (n.unread ? '<div class="notif-item-title-row"><span class="notif-item-title">' + n.title + '</span><span class="notif-unread-dot"></span></div>'
                    : '<span class="notif-item-title">' + n.title + '</span>') +
          '<div class="notif-item-desc">' + n.desc + '</div><div class="notif-item-time">' + n.time + '</div>' +
          '<a href="' + (n.href || '#') + '" class="notif-item-action"' + (n.drawer ? ' data-credit-open' : '') + '>' + n.cta + '</a></div></div>';
      }).join('');
      dd.insertAdjacentHTML('afterbegin', html);
      dd.insertAdjacentHTML('beforeend', items.filter(function (n) { return n.last; }).map(function (n) {
        return '<div class="notif-item credit-notif"><div class="notif-item-icon credit-notif-icon">' + ICON + '</div><div class="notif-item-content">' +
          '<span class="notif-item-title">' + n.title + '</span><div class="notif-item-desc">' + n.desc + '</div><div class="notif-item-time">' + n.time + '</div>' +
          '<a href="#" class="notif-item-action" data-credit-open>' + n.cta + '</a></div></div>';
      }).join(''));
    }
    // Notifications page
    var page = document.getElementById('ncList');
    if (page) {
      var pitem = function (n) {
        return '<div class="nc-item' + (n.unread ? ' unread' : '') + ' credit-notif" data-type="orders">' +
          '<div class="nc-icon credit-notif-icon">' + ICON + '</div><div class="nc-content"><div class="nc-content-top">' +
          '<span class="nc-item-title">' + n.title + '</span><div class="nc-right"><span class="nc-time">' + n.time + '</span>' +
          (n.unread ? '<span class="nc-unread-dot"></span>' : '') + '</div></div>' +
          '<div class="nc-desc">' + n.desc + '</div>' +
          '<a href="' + (n.href || '#') + '" class="nc-action"' + (n.drawer ? ' data-credit-open' : '') + '>' + n.cta + '</a></div></div>';
      };
      page.insertAdjacentHTML('afterbegin', items.filter(function (n) { return !n.last; }).map(pitem).join(''));
      page.insertAdjacentHTML('beforeend', items.filter(function (n) { return n.last; }).map(pitem).join(''));
    }
    bumpBadges(items.filter(function (n) { return n.unread; }).length);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-credit-open]');
      if (!a) return;
      e.preventDefault();
      var nd = document.getElementById('notifDropdown');
      if (nd) nd.classList.remove('open', 'is-open', 'show');
      open();
    });
  }

  window.CreditUI = { open: open, close: close };

  function boot() { init(); initEarn(); initCheckout(); initConfirmation(); initHome(); initNotifications(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
