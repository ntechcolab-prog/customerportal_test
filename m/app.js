/* Customer Portal · mobile companion — utilitários compartilhados. */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var param = function (n, fallback) {
    var v = new URLSearchParams(window.location.search).get(n);
    return v === null || v === '' ? (fallback === undefined ? null : fallback) : v;
  };

  /* Carrinho do celular: peças que você seleciona na máquina para ENVIAR ao
     desktop (a "perna de volta" do handoff). Persiste na sessão para acumular
     de várias listas antes de enviar. */
  var CART_KEY = 'cp_cart';
  function cartGet() { try { return JSON.parse(sessionStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; } }
  function cartSet(a) { try { sessionStorage.setItem(CART_KEY, JSON.stringify(a)); } catch (e) {} }
  var cart = {
    items: cartGet,
    count: function () { return cartGet().length; },
    has: function (code) { return cartGet().some(function (x) { return x.code === code; }); },
    add: function (p) {
      var a = cartGet(), found = false;
      for (var k = 0; k < a.length; k++) { if (a[k].code === p.code) { a[k] = p; found = true; break; } }
      if (!found) a.push(p);
      cartSet(a);
      return a.length;
    },
    remove: function (code) { cartSet(cartGet().filter(function (x) { return x.code !== code; })); },
    clear: function () { cartSet([]); }
  };

  /* O link do handoff carrega ?exp= (epoch em segundos). Nada aqui é segurança
     de verdade — o token é gerado no cliente. É o spike CP-640 que responde
     como a sessão do celular se sustenta. */
  var isExpired = function () {
    var exp = parseInt(param('exp', '0'), 10);
    return exp > 0 && Date.now() / 1000 > exp;
  };

  var expiredMarkup =
    '<div class="card empty">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 7v5l3 2"/></svg>' +
      '<h3>This link has expired</h3>' +
      '<p>Handoff codes are short-lived. Generate a new one on your computer.</p>' +
    '</div>';

  /* Cartão de contexto do topo. `from` diz de onde a pessoa veio — é o que
     diferencia chegar por QR (proximidade) de chegar por link (entrada direta). */
  /* Header padrão das telas: título grande (page-head), no lugar do card antigo
     com eyebrow. Mantém sub e badge de status (service/decisões). */
  var ctxCard = function (o) {
    return '<div class="page-head">' +
        '<h1>' + esc(o.title) + '</h1>' +
        (o.sub ? '<p class="page-head-sub">' + esc(o.sub) + '</p>' : '') +
        (o.badge ? '<div class="page-head-badge">' + o.badge + '</div>' : '') +
      '</div>';
  };

  /* Badge de status na linguagem do portal (.badge + .is-*). Recebe já a classe
     do estado para não espalhar o mapeamento pelas telas. */
  var badge = function (label, cls) {
    return '<span class="badge' + (cls ? ' ' + esc(cls) : '') + '">' + esc(label) + '</span>';
  };

  var specs = function (pairs) {
    return '<div class="card"><dl>' + pairs.map(function (p) {
      return '<div class="spec"><dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd></div>';
    }).join('') + '</dl></div>';
  };

  var PART_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h11L22 12l-4.5 8.5h-11L2 12z"/>' +
    '<circle cx="12" cy="12" r="3.2"/></svg>';

  var partsList = function (items) {
    return '<div class="card">' + items.map(function (p) {
      var meta = (p.pos ? 'Pos. ' + esc(p.pos) + ' · ' : '') + esc(p.code);
      return '<div class="part is-stacked">' +
          '<div class="part-top">' +
            '<span class="part-icon" aria-hidden="true">' + PART_ICON + '</span>' +
            '<div class="part-body">' +
              '<div class="part-name">' + esc(p.name) + '</div>' +
              '<div class="part-meta">' + meta + '</div>' +
            '</div>' +
            (p.price
              ? '<span class="part-price">' + esc(p.price) + '</span>'
              : '<span class="part-price quote">Quotation only</span>') +
          '</div>' +
          '<div class="part-actions">' +
            '<span class="qstep">' +
              '<button type="button" class="qstep-btn part-step" data-step="-" aria-label="Decrease quantity">−</button>' +
              '<span class="qstep-val"><b class="part-qty">1</b></span>' +
              '<button type="button" class="qstep-btn part-step" data-step="+" aria-label="Increase quantity">+</button>' +
            '</span>' +
            '<button type="button" class="btn btn-primary part-add"' +
              ' data-add-code="' + esc(p.code) + '" data-add-name="' + esc(p.name) + '"' +
              ' data-add-price="' + esc(p.price || 'Quotation only') + '"' +
              ' aria-label="Add ' + esc(p.name) + ' to your order">Add</button>' +
          '</div>' +
        '</div>';
    }).join('') + '</div>';
  };

  /* Peças: stepper de quantidade por linha + "Add" que monta o pedido no
     celular. O envio pro desktop acontece em cart.html (perna de volta). */
  document.addEventListener('click', function (e) {
    var step = e.target.closest('.part-step');
    if (step) {
      var row = step.closest('.part');
      var qEl = row && row.querySelector('.part-qty');
      if (qEl) {
        var q = (parseInt(qEl.textContent, 10) || 1) + (step.getAttribute('data-step') === '+' ? 1 : -1);
        qEl.textContent = String(Math.max(1, Math.min(99, q)));
      }
      return;
    }
    var btn = e.target.closest('[data-add-code]');
    if (!btn) return;
    var prow = btn.closest('.part');
    var pq = prow && prow.querySelector('.part-qty');
    cart.add({
      code: btn.getAttribute('data-add-code'),
      name: btn.getAttribute('data-add-name'),
      price: btn.getAttribute('data-add-price'),
      qty: pq ? (parseInt(pq.textContent, 10) || 1) : 1
    });
    btn.textContent = 'Added';                              /* flash rápido; volta pra "Add" */
    setTimeout(function () { btn.textContent = 'Add'; }, 1100);
    renderCartBar();
  });

  /* Barra fixa: N peças prontas para enviar ao desktop. Some quando vazio ou
     quando você já está no próprio carrinho. */
  function renderCartBar() {
    if (/cart\.html/.test(window.location.pathname)) return;
    var n = cart.count();
    var bar = document.getElementById('cartbar');
    if (!n) { if (bar) bar.parentNode.removeChild(bar); return; }
    if (!bar) {
      bar = document.createElement('a');
      bar.id = 'cartbar';
      bar.className = 'cartbar';
      bar.href = 'cart.html';
      document.body.appendChild(bar);
    }
    bar.innerHTML =
      '<span class="cartbar-count">' + n + '</span>' +
      '<span class="cartbar-label">' + (n === 1 ? 'part' : 'parts') + ' for your desktop</span>' +
      '<span class="cartbar-cta">Review ›</span>';
  }
  renderCartBar();

  window.M = {
    esc: esc,
    param: param,
    isExpired: isExpired,
    expiredMarkup: expiredMarkup,
    ctxCard: ctxCard,
    badge: badge,
    specs: specs,
    partsList: partsList,
    cart: cart
  };
})();

/* Navegação: hamburger + drawer, espelhando o mobile do portal desktop.
   O drawer é GERADO a partir de <div class="topbar" data-nav="KEY"> — assim o
   markup vive num lugar só e cada tela só declara qual item está ativo. Telas
   de fluxo (detalhe, captura, scan…) não têm data-nav e mantêm o botão voltar.
   Fecha por overlay, botão X e Escape; trava o scroll e devolve o foco. */
(function () {
  'use strict';
  var esc = (window.M && M.esc) || function (s) { return s; };

  function ic(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var NAV = [
    { key: 'home',          label: 'Home',                  href: 'index.html',         icon: ic('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h14v-9"/>') },
    { key: 'machines',      label: 'Machines',              href: 'machines.html',      icon: ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 11v5"/>') },
    { key: 'notifications', label: 'Notifications',         href: 'notifications.html', icon: ic('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>'), count: '3' },
    { key: 'services',      label: 'Services',              href: 'service.html',       icon: ic('<path d="M14.5 4.5a4 4 0 0 0-5.2 5.2L4 15v3h3l5.3-5.3a4 4 0 0 0 5.2-5.2l-2.4 2.4-2.1-.6-.6-2.1z"/>') },
    { key: 'orders',        label: 'Orders',                href: 'order.html',         icon: ic('<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18.5" r="1.7"/><circle cx="17.5" cy="18.5" r="1.7"/>') },
    { key: 'budget',        label: 'Budget',                href: 'budget.html',        icon: ic('<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 14.5h4"/>') },
    { key: 'monitoring',    label: 'Production Monitoring', href: 'monitoring.html',    icon: ic('<path d="M4 19V5"/><path d="M4 19h16"/><path d="m7.5 15 3.2-4.2 3 2.4L18 8"/>') },
    { key: 'help',          label: 'Help',                  href: 'help.html',          icon: ic('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.4"/><path d="M12 17.2h.01"/>') }
  ];

  var bar = document.querySelector('.topbar[data-nav]');
  if (bar) {
    var active = bar.getAttribute('data-nav');
    var user = (window.CP && CP.user) ? (CP.user.name + ' · ' + CP.user.role) : 'John Doe · Technician';
    /* Voltar à esquerda (menos na home, que é a raiz); hamburger à direita. */
    if (active !== 'home') {
      bar.insertAdjacentHTML('afterbegin',
        '<a class="topbar-back" id="navback" href="index.html" aria-label="Back">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5 8 12l7 7"/></svg></a>');
    }
    bar.insertAdjacentHTML('beforeend',
      '<button class="hamburger-btn" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-nav">' +
        '<span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span></button>');
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '" class="mobile-nav-link' + (n.key === active ? ' active' : '') + '"' +
        (n.key === active ? ' aria-current="page"' : '') + '>' + n.icon + esc(n.label) +
        (n.count ? '<span class="mobile-nav-count">' + n.count + '</span>' : '') + '</a>';
    }).join('');
    bar.insertAdjacentHTML('afterend',
      '<nav class="mobile-nav" id="mobile-nav" aria-label="Main navigation">' +
        '<div class="mobile-nav-overlay"></div>' +
        '<div class="mobile-nav-drawer">' +
          '<div class="mobile-nav-head"><span class="mobile-nav-brand">Menu</span>' +
            '<button class="mobile-nav-close" type="button" aria-label="Close menu">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button></div>' +
          links +
          '<div class="mobile-nav-foot"><div class="mobile-nav-user">' + esc(user) + '</div>' +
            '<div class="mobile-nav-note">Open the full portal on your computer</div></div>' +
        '</div>' +
      '</nav>');
  }

  var btn = document.querySelector('.hamburger-btn');
  var nav = document.querySelector('.mobile-nav');
  if (!btn || !nav) return;

  var overlay = nav.querySelector('.mobile-nav-overlay');
  var closeBtn = nav.querySelector('.mobile-nav-close');
  var firstLink = nav.querySelector('.mobile-nav-link');

  function setOpen(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open && firstLink) { firstLink.focus(); }
    else if (!open) { btn.focus(); }
  }

  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  if (overlay) overlay.addEventListener('click', function () { setOpen(false); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false);
  });
})();
