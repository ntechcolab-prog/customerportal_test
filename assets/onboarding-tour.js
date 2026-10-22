/* Onboarding Tour (CP-589)
   A dependency-free coach-mark tour. Steps are anchored to header elements that
   exist for every role, so hidden targets are simply skipped. Auto-runs once on
   the dashboard (localStorage flag); replayable from any [data-tour-start] element.
   Requires assets/onboarding-tour.css and (for translation) assets/i18n.js. */
(function () {
  'use strict';

  var SEEN_KEY = 'netzsch_onboarding_seen';

  // key → i18n keys are tour.<key>.title / tour.<key>.body. English fallbacks
  // below are only a safety net; en.json/de.json are the source of truth.
  var STEPS = [
    { key: 'welcome', center: true,
      t: 'Welcome to your Customer Portal',
      b: 'A quick tour of the main areas. It takes less than a minute — you can skip anytime.' },
    { key: 'nav', selector: '.header-nav',
      t: 'Main navigation',
      b: "Jump between the portal's sections from here: machines, shop, orders, quotes, services and more." },
    { key: 'machines', selector: '.header-nav a[href="machines.html"]',
      t: 'Your machines',
      b: 'See your fleet, machine details, documents and service history in one place.' },
    { key: 'shop', selector: '.header-nav a[href="shop.html"]',
      t: 'Shop spare parts',
      b: 'Browse and order genuine NETZSCH spare parts and grinding beads, with pricing and quotations.' },
    { key: 'orders', selector: '.header-nav a[href="orders.html"]',
      t: 'Orders',
      b: 'Track every order and its status, from submission to delivery.' },
    { key: 'milla', selector: '#btn-milla-search',
      t: 'Search with Milla',
      b: 'Find spare parts, documents and answers fast — just ask Milla, your portal assistant.' },
    { key: 'notifications', selector: '.notif-wrapper',
      t: 'Notifications',
      b: 'Quotes, approvals and order updates land here so nothing slips by.' },
    { key: 'help', selector: '.header-nav a[href="help.html"]',
      t: 'Help is always here',
      b: 'Browse the FAQ and knowledge base, or contact support whenever you need a hand.' },
    { key: 'finish', center: true, finish: true,
      t: "You're all set",
      b: 'Jump in wherever you like — you can reopen this tour anytime from your profile menu.' }
  ];

  // Finish-step CTAs. First two whose nav tab is visible are shown, so they are
  // always role-valid (e.g. Approver has no Shop → falls back to machines/orders).
  var FINISH_CTAS = [
    { href: 'shop.html',     key: 'tour.cta.shop',     fb: 'Browse the shop',   sel: '.header-nav a[href="shop.html"]' },
    { href: 'machines.html', key: 'tour.cta.machines', fb: 'View my machines',  sel: '.header-nav a[href="machines.html"]' },
    { href: 'orders.html',   key: 'tour.cta.orders',   fb: 'View my orders',    sel: '.header-nav a[href="orders.html"]' }
  ];

  var root = null, steps = [], i = 0, lastFocused = null, built = false;

  function t(key, fb) { return (window.NetzschI18n && NetzschI18n.t) ? NetzschI18n.t(key, fb) : fb; }

  function isVisible(el) {
    if (!el) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function build() {
    if (built) return;
    root = document.createElement('div');
    root.className = 'tour-root';
    root.setAttribute('hidden', '');
    root.innerHTML =
      '<div class="tour-blocker"></div>' +
      '<div class="tour-spotlight"></div>' +
      '<div class="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">' +
        '<div class="tour-progress" aria-hidden="true"></div>' +
        '<h3 id="tour-title"></h3>' +
        '<p class="tour-body"></p>' +
        '<div class="tour-cta"></div>' +
        '<div class="tour-actions">' +
          '<button type="button" class="tour-skip" data-i18n="tour.skip">Skip tour</button>' +
          '<span class="tour-count"></span>' +
          '<button type="button" class="tour-back" data-i18n="tour.back" hidden>Back</button>' +
          '<button type="button" class="tour-next" data-i18n="tour.next">Next</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    root.querySelector('.tour-skip').addEventListener('click', function () { end(true); });
    root.querySelector('.tour-back').addEventListener('click', function () { go(i - 1); });
    root.querySelector('.tour-next').addEventListener('click', function () {
      if (i >= steps.length - 1) end(true); else go(i + 1);
    });
    root.querySelector('.tour-blocker').addEventListener('click', function (e) { e.stopPropagation(); });
    root.querySelector('.tour-cta').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.tour-cta-btn') : null;
      if (b) { markSeen(); window.location.href = b.getAttribute('data-href'); }
    });
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', reposition);
    built = true;
  }

  function onKey(e) {
    if (root.hasAttribute('hidden')) return;
    if (e.key === 'Escape') { e.preventDefault(); end(true); return; }
    if (e.key === 'Tab') {
      var f = Array.prototype.filter.call(
        root.querySelectorAll('.tour-card button'),
        function (b) { return !b.hidden; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function dots() {
    return steps.map(function (s, n) {
      return '<span class="tour-dot' + (n === i ? ' is-active' : '') + '"></span>';
    }).join('');
  }

  function reposition() {
    if (!root || root.hasAttribute('hidden')) return;
    var step = steps[i], sp = root.querySelector('.tour-spotlight'), card = root.querySelector('.tour-card');
    var vw = window.innerWidth, vh = window.innerHeight;
    if (step.center || !step._el) {
      sp.style.width = '0px'; sp.style.height = '0px';
      sp.style.top = (vh / 2) + 'px'; sp.style.left = (vw / 2) + 'px';
      card.style.top = Math.max(16, (vh - card.offsetHeight) / 2) + 'px';
      card.style.left = Math.max(16, (vw - card.offsetWidth) / 2) + 'px';
      return;
    }
    var r = step._el.getBoundingClientRect(), pad = 8;
    sp.style.top = (r.top - pad) + 'px';
    sp.style.left = (r.left - pad) + 'px';
    sp.style.width = (r.width + pad * 2) + 'px';
    sp.style.height = (r.height + pad * 2) + 'px';
    var cardH = card.offsetHeight, cardW = card.offsetWidth, gap = 14;
    var top = r.bottom + gap;
    if (top + cardH > vh - 16) {
      var above = r.top - gap - cardH;
      top = above >= 16 ? above : Math.max(16, vh - cardH - 16);
    }
    var left = r.left + r.width / 2 - cardW / 2;
    left = Math.max(16, Math.min(left, vw - cardW - 16));
    card.style.top = top + 'px';
    card.style.left = left + 'px';
  }

  function go(n) {
    i = Math.max(0, Math.min(n, steps.length - 1));
    var step = steps[i], card = root.querySelector('.tour-card');
    var titleEl = root.querySelector('#tour-title'), bodyEl = root.querySelector('.tour-body');
    titleEl.setAttribute('data-i18n', 'tour.' + step.key + '.title');
    bodyEl.setAttribute('data-i18n', 'tour.' + step.key + '.body');
    titleEl.textContent = t('tour.' + step.key + '.title', step.t);
    bodyEl.textContent = t('tour.' + step.key + '.body', step.b);
    root.querySelector('.tour-progress').innerHTML = dots();
    root.querySelector('.tour-count').textContent = (i + 1) + ' / ' + steps.length;
    var back = root.querySelector('.tour-back');
    back.hidden = (i === 0);
    var next = root.querySelector('.tour-next');
    var last = (i === steps.length - 1);
    next.setAttribute('data-i18n', last ? 'tour.done' : 'tour.next');
    next.textContent = t(last ? 'tour.done' : 'tour.next', last ? 'Done' : 'Next');
    // Finish step: show role-valid CTAs and drop the (now redundant) Skip.
    var cta = root.querySelector('.tour-cta'), skip = root.querySelector('.tour-skip');
    if (step.finish) {
      var picks = FINISH_CTAS.filter(function (c) { return isVisible(document.querySelector(c.sel)); }).slice(0, 2);
      cta.innerHTML = picks.map(function (c, idx) {
        var variant = idx === 0 ? 'btn-primary' : 'btn-secondary';
        return '<button type="button" class="btn ' + variant + ' btn-md tour-cta-btn" data-href="' + c.href + '" data-i18n="' + c.key + '">' + c.fb + '</button>';
      }).join('');
      skip.hidden = true;
    } else {
      cta.innerHTML = '';
      skip.hidden = false;
    }
    // Let i18n translate the freshly-set keys (handles DE + late-loaded dict).
    if (window.NetzschI18n && NetzschI18n.reload) { try { NetzschI18n.reload(); } catch (e) {} }
    card.classList.add('is-in');
    reposition();
    requestAnimationFrame(reposition); // re-place once text/size settles
    var firstCta = cta.querySelector('.tour-cta-btn');
    (firstCta || next).focus();
  }

  function markSeen() { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {} }

  function end(seen) {
    if (!root) return;
    root.setAttribute('hidden', '');
    root.querySelector('.tour-card').classList.remove('is-in');
    if (seen) markSeen();
    if (lastFocused && typeof lastFocused.focus === 'function') { try { lastFocused.focus(); } catch (e) {} }
  }

  function start() {
    build();
    lastFocused = document.activeElement;
    // Resolve targets now (after role-guard has hidden role-specific items).
    steps = STEPS.filter(function (s) {
      if (s.center) return true;
      s._el = document.querySelector(s.selector);
      return isVisible(s._el);
    });
    if (!steps.length) return;
    i = 0;
    root.removeAttribute('hidden');
    go(0);
  }

  function init() {
    // Replay triggers anywhere.
    Array.prototype.forEach.call(document.querySelectorAll('[data-tour-start]'), function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); start(); });
    });
    // Auto-run once, only on the dashboard (the post-login landing).
    var onDashboard = /(^|\/)dashboard\.html$/.test(location.pathname);
    var seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch (e) {}
    if (onDashboard && !seen) {
      // Defer so role-guard's DOMContentLoaded work (hiding tabs) runs first.
      setTimeout(start, 400);
    }
  }

  window.NetzschTour = { start: start, _reset: function () { try { localStorage.removeItem(SEEN_KEY); } catch (e) {} } };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
