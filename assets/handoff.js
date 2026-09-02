/* handoff.js — protótipo de handoff desktop → celular (CP-638 / CP-640).
 *
 * O QUE ISSO PROVA: a jornada. O usuário está no desktop, aciona um método que
 * o telefone faz melhor, escaneia e o celular abre já na tela certa daquela peça.
 *
 * O QUE ISSO NÃO PROVA: segurança e sessão. O token aqui é gerado no cliente e
 * não vale nada — quem responde isso é o spike CP-640. E o retorno (desktop
 * saber que o telefone terminou) exige backend; por isso não está simulado.
 *
 * Depende de qr.js. Uso: <script src="../assets/qr.js"></script>
 *                        <script src="../assets/handoff.js"></script>
 * O gatilho vem de data-handoff="<contexto>" ou dos métodos da Milla.
 */
(function () {
  'use strict';

  var TTL_MIN = 10;

  var CONTEXTS = {
    'zeta60': { label: 'Zeta 60 — machine details', machine: 'zeta60', route: '/m/machine.html?m=zeta60' },
    'discus30': { label: 'Discus 30 — machine details', machine: 'discus30', route: '/m/machine.html?m=discus30' },
    'inlet-flange': { label: 'Inlet Flange Complete — parts list', machine: 'discus30', subset: 'inlet-flange', route: '/m/parts.html?ctx=inlet-flange' },
    'spare-parts': { label: 'Spare parts search', machine: 'zeta60', route: '/m/parts.html?ctx=search-zeta60' },
    // Os dois métodos que só fazem sentido no telefone (CP-674 / CP-678):
    // o botão morto do desktop passa o bastão pra tela de captura no companion.
    'milla-photo': { label: 'Milla — search a part by photo', machine: 'zeta60', route: '/m/scan.html?method=photo',
      sub: 'Scan to point your phone camera at the part, already signed in.' },
    'milla-code': { label: 'Milla — read the part code', machine: 'zeta60', route: '/m/scan.html?method=code',
      sub: 'Scan to read the part code with your phone camera, already signed in.' }
  };

  // O companion tem endereço próprio; o portal de produção não o serve na mesma
  // origem. Em local e em preview os dois saem do mesmo deploy.
  var APP_HOST = 'https://m-customerportal.vercel.app';
  var PORTAL_HOSTS = ['customerportal-test.vercel.app'];

  function token() {
    var bytes = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) {
      return b.toString(16).padStart(2, '0');
    }).join('');
  }

  function baseUrl() {
    // localStorage.handoffBase permite apontar pro deploy enquanto se testa local
    var override = null;
    try { override = window.localStorage.getItem('handoffBase'); } catch (e) { /* storage bloqueado */ }
    if (override) return override.replace(/\/$/, '');
    if (window.location.protocol === 'file:') return null;
    if (PORTAL_HOSTS.indexOf(window.location.hostname) > -1) return APP_HOST;
    return window.location.origin;
  }

  function buildUrl(ctxKey) {
    var base = baseUrl();
    if (!base) return null;
    var ctx = CONTEXTS[ctxKey] || CONTEXTS['zeta60'];
    return base + ctx.route +
      '&t=' + token() +
      '&exp=' + (Math.floor(Date.now() / 1000) + TTL_MIN * 60);
  }

  var overlay, dialog, state = { ctx: null, url: null, expiresAt: 0, timer: null };

  /* O encoder do qr.js gera matriz até a versão 10, mas só decodifica de verdade
     até a v6 — acima disso o QR sai bonito e a câmera não lê. v6 em byte mode/ECC M
     termina em 108 bytes; abaixo desse teto com folga, o código é confiável. */
  var QR_SAFE_BYTES = 104;

  function render() {
    var ctx = CONTEXTS[state.ctx] || CONTEXTS['zeta60'];
    var tooLong = state.url && state.url.length > QR_SAFE_BYTES;
    var noBase = !state.url || tooLong;

    dialog.innerHTML =
      '<div class="ho-head">' +
        '<h2 class="ho-title" id="ho-title">Take this to the machine</h2>' +
        '<button type="button" class="ho-close" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
        '</button>' +
      '</div>' +
      '<p class="ho-sub">' + (ctx.sub || 'Scan to open this part list on your phone, already signed in. ' +
        'No writing part numbers on paper.') + '</p>' +
      (tooLong
        ? '<div class="ho-warn"><strong>Link longo demais para este gerador de QR.</strong> ' +
          'Acima de ' + QR_SAFE_BYTES + ' bytes o código sai ilegível para a câmera. ' +
          'Abra no celular por este link: <a href="' + state.url + '">' + state.url + '</a></div>'
        : noBase
        ? '<div class="ho-warn"><strong>Sirva as páginas por HTTP para gerar o QR.</strong> ' +
          'Em <code>file://</code> não existe URL que o celular consiga abrir. ' +
          'Rode <code>python3 -m http.server</code> na raiz do repo, ou defina ' +
          '<code>localStorage.handoffBase</code> com a URL do deploy.</div>'
        : '<div class="ho-qr-wrap">' +
            '<div class="ho-qr" id="ho-qr"></div>' +
            '<div class="ho-meta">' +
              '<p class="ho-ctx">' + ctx.label + '</p>' +
              '<p class="ho-expiry" id="ho-expiry">&nbsp;</p>' +
            '</div>' +
            '<button type="button" class="ho-regen" id="ho-regen">Generate a new code</button>' +
          '</div>' +
          '<ol class="ho-steps">' +
            '<li>Point your phone camera at the code.</li>' +
            '<li>Tap the link that appears.</li>' +
            '<li>Carry the part list to the machine.</li>' +
          '</ol>' +
          '<p class="ho-fallback">No camera? Open <a href="' + state.url + '">this link</a>.</p>' +
          '<div class="ho-note"><strong>Protótipo de descoberta.</strong> O token é gerado ' +
            'no navegador e não autentica ninguém — o modelo real de sessão é a pergunta do ' +
            'spike CP-640. O caminho de volta (o desktop saber que o telefone terminou) ' +
            'precisa de backend e por isso não está simulado aqui.</div>'
      );

    dialog.querySelector('.ho-close').addEventListener('click', close);
    if (!noBase) {
      dialog.querySelector('#ho-qr').innerHTML = window.QR.svg(state.url, {
        dark: '#1d2123', light: '#ffffff',
        label: 'QR code para abrir ' + ctx.label + ' no celular'
      });
      dialog.querySelector('#ho-regen').addEventListener('click', function () {
        regenerate();
      });
      tick();
    }
  }

  function tick() {
    var el = dialog.querySelector('#ho-expiry');
    if (!el) return;
    var left = Math.max(0, Math.floor((state.expiresAt - Date.now()) / 1000));
    if (left <= 0) {
      el.textContent = 'Code expired — generate a new one';
      el.classList.add('is-expired');
      clearInterval(state.timer);
      return;
    }
    var m = Math.floor(left / 60), s = left % 60;
    el.textContent = 'Expires in ' + m + ':' + String(s).padStart(2, '0');
    el.classList.remove('is-expired');
  }

  function regenerate() {
    state.url = buildUrl(state.ctx);
    state.expiresAt = Date.now() + TTL_MIN * 60 * 1000;
    clearInterval(state.timer);
    render();
    state.timer = setInterval(tick, 1000);
  }

  function ensureShell() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'ho-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ho-title');
    dialog = document.createElement('div');
    dialog.className = 'ho-dialog';
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });
  }

  var lastFocus = null;

  function open(ctxKey) {
    ensureShell();
    lastFocus = document.activeElement;
    state.ctx = ctxKey;
    regenerate();
    overlay.classList.add('is-open');
    var btn = dialog.querySelector('.ho-close');
    if (btn) btn.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    clearInterval(state.timer);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function guessContext() {
    var f = (window.location.pathname.split('/').pop() || '').replace('.html', '');
    if (f.indexOf('inlet-flange') > -1) return 'inlet-flange';
    if (f.indexOf('discus30') > -1) return 'discus30';
    if (f.indexOf('spare-parts') > -1) return 'spare-parts';
    return 'zeta60';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // 1. gatilhos explícitos
    document.querySelectorAll('[data-handoff]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        open(el.getAttribute('data-handoff') || guessContext());
      });
    });

    // 2. os dois métodos da Milla que só fazem sentido no telefone: o handoff
    //    abre já na tela de captura do método certo (CP-674 foto / CP-678 código).
    document.querySelectorAll('.method-card[data-method="photo"], .method-card[data-method="code"]')
      .forEach(function (el) {
        el.addEventListener('click', function (e) {
          e.preventDefault();
          open(el.getAttribute('data-method') === 'code' ? 'milla-code' : 'milla-photo');
        });
      });
  });

  window.Handoff = { open: open, close: close };
})();
