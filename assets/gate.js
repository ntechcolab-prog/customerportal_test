/**
 * NETZSCH Customer Portal — Access Gate
 * Blocks page content until correct password is entered.
 * Authenticated state persists in sessionStorage.
 */
(function () {
  var PASS = '@NETZSCH2026';
  var KEY = 'netzsch_gate_ok';

  // Already authenticated this session
  if (sessionStorage.getItem(KEY) === '1') return;

  // Hide page content
  document.documentElement.style.overflow = 'hidden';

  // ── Inject styles ──
  var style = document.createElement('style');
  style.textContent = [
    '.gate-overlay{position:fixed;inset:0;z-index:9999;background:#f5f6f7;display:flex;align-items:center;justify-content:center;font-family:"Inter",sans-serif;}',
    '.gate-card{width:400px;background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.10);padding:40px 36px;text-align:center;}',
    '.gate-logo{width:140px;margin:0 auto 28px;}',
    '.gate-title{font-size:18px;font-weight:600;color:#2d2e33;margin-bottom:6px;letter-spacing:-0.3px;}',
    '.gate-subtitle{font-size:13px;color:#6b7280;margin-bottom:28px;line-height:20px;}',
    '.gate-field{position:relative;margin-bottom:16px;text-align:left;}',
    '.gate-label{display:block;font-size:13px;font-weight:500;color:#4c4d57;margin-bottom:6px;}',
    '.gate-input{width:100%;height:44px;border:1px solid #d4d6d8;border-radius:10px;padding:0 44px 0 16px;font-family:"Inter",sans-serif;font-size:14px;color:#2d2e33;outline:none;transition:border-color 0.15s;}',
    '.gate-input:focus{border-color:#007167;}',
    '.gate-input.error{border-color:#c73e20;}',
    '.gate-toggle{position:absolute;right:12px;top:31px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;color:#9ca3af;border-radius:6px;transition:background 0.15s;}',
    '.gate-toggle:hover{background:#f3f4f6;color:#6b7280;}',
    '.gate-error{font-size:12px;color:#c73e20;margin-top:6px;display:none;text-align:left;}',
    '.gate-error.show{display:block;}',
    '.gate-btn{width:100%;height:44px;background:#007167;color:#fff;border:none;border-radius:999px;font-family:"Inter",sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:background 0.15s;letter-spacing:-0.2px;}',
    '.gate-btn:hover{background:#005f57;}'
  ].join('\n');
  document.head.appendChild(style);

  // ── i18n for gate (loads before main i18n system) ──
  var gateStrings = {
    en: {
      title: 'Customer Portal',
      subtitle: 'Enter the access password to continue.',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
      errorMessage: 'Incorrect password. Please try again.',
      accessButton: 'Access Portal'
    },
    de: {
      title: 'Kundenportal',
      subtitle: 'Geben Sie das Zugangspasswort ein, um fortzufahren.',
      passwordLabel: 'Passwort',
      passwordPlaceholder: 'Passwort eingeben',
      showPassword: 'Passwort anzeigen',
      hidePassword: 'Passwort ausblenden',
      errorMessage: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
      accessButton: 'Portal öffnen'
    }
  };
  var gateLang = localStorage.getItem('netzsch_lang') || 'en';
  var gt = gateStrings[gateLang] || gateStrings.en;

  // ── Inject overlay ──
  var overlay = document.createElement('div');
  overlay.className = 'gate-overlay';
  overlay.innerHTML =
    '<div class="gate-card">' +
      '<img class="gate-logo" src="../assets/gd-logo-dark.svg" alt="NETZSCH Grinding & Dispersing">' +
      '<div class="gate-title">' + gt.title + '</div>' +
      '<div class="gate-subtitle">' + gt.subtitle + '</div>' +
      '<div class="gate-field">' +
        '<label class="gate-label" for="gatePass">' + gt.passwordLabel + '</label>' +
        '<input class="gate-input" type="password" id="gatePass" placeholder="' + gt.passwordPlaceholder + '" autocomplete="off">' +
        '<button class="gate-toggle" id="gateToggle" type="button" aria-label="' + gt.showPassword + '">' +
          '<svg id="gateEyeOpen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>' +
          '<svg id="gateEyeClosed" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>' +
        '</button>' +
        '<div class="gate-error" id="gateError">' + gt.errorMessage + '</div>' +
      '</div>' +
      '<button class="gate-btn" id="gateSubmit">' + gt.accessButton + '</button>' +
    '</div>';
  document.body.appendChild(overlay);

  // ── Logic ──
  var input = document.getElementById('gatePass');
  var btn = document.getElementById('gateSubmit');
  var err = document.getElementById('gateError');
  var toggle = document.getElementById('gateToggle');
  var eyeOpen = document.getElementById('gateEyeOpen');
  var eyeClosed = document.getElementById('gateEyeClosed');

  function attempt() {
    if (input.value === PASS) {
      sessionStorage.setItem(KEY, '1');
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s ease';
      setTimeout(function () {
        overlay.remove();
        style.remove();
        document.documentElement.style.overflow = '';
      }, 300);
    } else {
      input.classList.add('error');
      err.classList.add('show');
      input.focus();
    }
  }

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attempt();
  });
  input.addEventListener('input', function () {
    input.classList.remove('error');
    err.classList.remove('show');
  });

  // Toggle password visibility
  toggle.addEventListener('click', function () {
    var isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    eyeOpen.style.display = isPassword ? 'none' : '';
    eyeClosed.style.display = isPassword ? '' : 'none';
    toggle.setAttribute('aria-label', isPassword ? gt.hidePassword : gt.showPassword);
    input.focus();
  });

  input.focus();
})();
