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
  var ctxCard = function (o) {
    return '<div class="ctx">' +
        '<div class="ctx-from">' + esc(o.from || 'From your computer') + '</div>' +
        '<h1>' + esc(o.title) + '</h1>' +
        (o.sub ? '<div class="ctx-sub">' + esc(o.sub) + '</div>' : '') +
        (o.badge ? '<div class="ctx-badges">' + o.badge + '</div>' : '') +
        '<div class="ctx-session">Signed in as <strong>' + esc(o.role || 'Technician') +
          '</strong>, no new login</div>' +
      '</div>';
  };

  /* Badge de status na linguagem do portal (.badge + .is-*). Recebe já a classe
     do estado para não espalhar o mapeamento pelas telas. */
  var badge = function (label, cls) {
    return '<span class="badge' + (cls ? ' ' + esc(cls) : '') + '">' + esc(label) + '</span>';
  };

  var noteCard = function (html) {
    return '<p class="note">' + html + '</p>';
  };

  var specs = function (pairs) {
    return '<div class="card"><dl>' + pairs.map(function (p) {
      return '<div class="spec"><dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd></div>';
    }).join('') + '</dl></div>';
  };

  var partsList = function (items) {
    return '<div class="card">' + items.map(function (p) {
      return '<div class="part">' +
          '<div class="part-pos">' + esc(p.pos) + '</div>' +
          '<div class="part-body">' +
            '<div class="part-name">' + esc(p.name) + '</div>' +
            '<div class="part-code">' + esc(p.code) + '</div>' +
          '</div>' +
          '<div class="part-right">' +
            (p.price
              ? '<span class="part-price">' + esc(p.price) + '</span>'
              : '<span class="part-price quote">Quotation only</span>') +
            '<button type="button" class="btn copy" data-copy="' + esc(p.code) + '" ' +
              'aria-label="Copy material number ' + esc(p.code) + '">Copy</button>' +
          '</div>' +
        '</div>';
    }).join('') + '</div>';
  };

  /* Copiar código de peça é o gesto central do "levar comigo": a pessoa está
     na frente da máquina e precisa do número na mão. */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var label = btn.textContent;
    var done = function () {
      btn.textContent = 'Copied';
      btn.classList.add('is-done');
      setTimeout(function () {
        btn.textContent = label;
        btn.classList.remove('is-done');
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(done, done);
    } else {
      done();
    }
  });

  window.M = {
    esc: esc,
    param: param,
    isExpired: isExpired,
    expiredMarkup: expiredMarkup,
    ctxCard: ctxCard,
    badge: badge,
    noteCard: noteCard,
    specs: specs,
    partsList: partsList
  };
})();
