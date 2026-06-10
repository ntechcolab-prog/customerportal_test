/**
 * NETZSCH Customer Portal — Form Validation Library
 * Centralised, accessible, inline validation for all portal forms.
 *
 * Usage:
 *   <script src="../assets/form-validation.js"></script>
 *   <script>
 *     FormValidator.init({
 *       fields: [
 *         { id: 'email',    rules: ['required', 'email'] },
 *         { id: 'password', rules: ['required', { minLength: 8 }] },
 *       ],
 *       submitBtn: 'btn-login',        // id — disabled until valid
 *       onSubmit: function () { … }    // optional callback
 *     });
 *   </script>
 *
 * CSS expected (already present in most pages):
 *   .field-input.error   { border-color: #d93025; }
 *   .field-error         { font-size:12px; color:#d93025; display:none; }
 *
 * If the page does NOT include those styles the library injects a minimal
 * fallback <style> block automatically.
 */

var FormValidator = (function () {
  'use strict';

  /* ─── Built-in validators ────────────────────────────────── */
  var validators = {
    required: function (v) {
      return v.trim() !== '' ? null : 'This field is required.';
    },

    email: function (v) {
      if (v.trim() === '') return null; // let "required" handle empty
      // RFC-5322 simplified — good enough for client-side
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return re.test(v) ? null : 'Please enter a valid email address.';
    },

    password: function (v) {
      if (v === '') return null;
      if (v.length < 8)                      return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(v))                  return 'Include at least one uppercase letter.';
      if (!/[a-z]/.test(v))                  return 'Include at least one lowercase letter.';
      if (!/[0-9]/.test(v))                  return 'Include at least one number.';
      if (!/[^A-Za-z0-9]/.test(v))           return 'Include at least one special character.';
      return null;
    },

    numeric: function (v) {
      if (v.trim() === '') return null;
      return /^\d+$/.test(v.trim()) ? null : 'Only numbers are allowed.';
    },

    url: function (v) {
      if (v.trim() === '') return null;
      try { new URL(v.trim().indexOf('://') === -1 ? 'https://' + v.trim() : v.trim()); return null; }
      catch (_) { return 'Please enter a valid URL.'; }
    },

    domain: function (v) {
      if (v.trim() === '') return null;
      return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(v.trim())
        ? null : 'Please enter a valid domain (letters, numbers and hyphens).';
    }
  };

  /* Parametric validators — return a validator function */
  var paramValidators = {
    minLength: function (n) {
      return function (v) {
        if (v.trim() === '') return null;
        return v.trim().length >= n ? null : 'Must be at least ' + n + ' characters.';
      };
    },
    maxLength: function (n) {
      return function (v) {
        return v.trim().length <= n ? null : 'Must be at most ' + n + ' characters.';
      };
    },
    matches: function (otherId) {
      return function (v) {
        var other = document.getElementById(otherId);
        if (!other || v === '') return null;
        return v === other.value ? null : 'Fields do not match.';
      };
    },
    pattern: function (cfg) {
      // cfg = { regex: '...', message: '...' }
      return function (v) {
        if (v.trim() === '') return null;
        return new RegExp(cfg.regex).test(v) ? null : (cfg.message || 'Invalid format.');
      };
    },
    fileTypes: function (types) {
      // types = ['pdf','jpg','png']
      return function (_v, el) {
        if (!el || !el.files || el.files.length === 0) return null;
        for (var i = 0; i < el.files.length; i++) {
          var ext = el.files[i].name.split('.').pop().toLowerCase();
          if (types.indexOf(ext) === -1) return 'Allowed file types: ' + types.join(', ') + '.';
        }
        return null;
      };
    },
    maxFiles: function (n) {
      return function (_v, el) {
        if (!el || !el.files) return null;
        return el.files.length <= n ? null : 'Maximum ' + n + ' files allowed.';
      };
    },
    maxFileSize: function (mb) {
      return function (_v, el) {
        if (!el || !el.files) return null;
        for (var i = 0; i < el.files.length; i++) {
          if (el.files[i].size > mb * 1024 * 1024) {
            return 'Each file must be under ' + mb + ' MB.';
          }
        }
        return null;
      };
    }
  };

  /* ─── Helpers ────────────────────────────────────────────── */

  /** Resolve a rule definition into a validator function */
  function resolveRule(rule) {
    if (typeof rule === 'string') return validators[rule] || null;
    if (typeof rule === 'object') {
      var key = Object.keys(rule)[0];
      if (paramValidators[key]) return paramValidators[key](rule[key]);
    }
    if (typeof rule === 'function') return rule;
    return null;
  }

  /** Ensure the page has the base error CSS (idempotent) */
  function ensureStyles() {
    if (document.getElementById('fv-styles')) return;
    var style = document.createElement('style');
    style.id = 'fv-styles';
    style.textContent =
      '.field-input.error{border-color:#d93025!important;}' +
      '.field-error{font-size:12px;color:#d93025;font-weight:400;line-height:16px;margin-top:4px;display:none;}' +
      '.field-error.visible{display:block;}' +
      '.field-input.valid{border-color:#007167!important;}' +
      '.field-success-icon{display:none;position:absolute;right:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;pointer-events:none;}' +
      '.field-input.valid~.field-success-icon{display:block;}';
    document.head.appendChild(style);
  }

  /** Get or create the error <span> for a field */
  function getErrorEl(input) {
    // Look for existing .field-error inside the same .field wrapper
    var wrapper = input.closest('.field') || input.parentElement;
    var existing = wrapper.querySelector('.field-error');
    if (existing) return existing;

    // Create one
    var span = document.createElement('span');
    span.className = 'field-error';
    span.setAttribute('role', 'alert');

    // Generate a stable id for aria-describedby
    var errId = (input.id || 'field') + '-error';
    span.id = errId;
    input.setAttribute('aria-describedby', errId);

    wrapper.appendChild(span);
    return span;
  }

  /** Show error on a field */
  function showError(input, msg) {
    var errEl = getErrorEl(input);
    errEl.textContent = msg;
    errEl.style.display = 'block';
    errEl.classList.add('visible');
    input.classList.add('error');
    input.classList.remove('valid');
    input.setAttribute('aria-invalid', 'true');
  }

  /** Clear error on a field */
  function clearError(input) {
    var errEl = getErrorEl(input);
    errEl.textContent = '';
    errEl.style.display = 'none';
    errEl.classList.remove('visible');
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
  }

  /** Mark field as valid (green border) */
  function markValid(input) {
    clearError(input);
    if (input.value.trim() !== '') {
      input.classList.add('valid');
    }
  }

  /* ─── Core ───────────────────────────────────────────────── */

  function init(config) {
    ensureStyles();

    var fields = config.fields || [];
    var submitBtnId = config.submitBtn;
    var submitBtn = submitBtnId ? document.getElementById(submitBtnId) : null;
    var onSubmit = config.onSubmit || null;
    var validateOnBlur = config.validateOnBlur !== false;  // default true
    var validateOnInput = config.validateOnInput !== false; // default true

    // Build internal field map
    var fieldMap = [];
    fields.forEach(function (f) {
      var el = document.getElementById(f.id);
      if (!el) return;
      var compiledRules = (f.rules || []).map(resolveRule).filter(Boolean);
      var entry = { el: el, rules: compiledRules, customMsg: f.message || null };
      fieldMap.push(entry);

      // Wire up real-time validation
      if (validateOnBlur) {
        el.addEventListener('blur', function () { validateField(entry); updateSubmitBtn(); });
      }
      if (validateOnInput) {
        el.addEventListener('input', function () {
          // On input: clear error immediately, re-validate quietly for submit btn
          if (el.classList.contains('error')) {
            var msg = runRules(entry);
            if (!msg) markValid(el);
            else showError(el, msg);
          }
          updateSubmitBtn();
        });
      }
      // For file inputs
      if (el.type === 'file') {
        el.addEventListener('change', function () { validateField(entry); updateSubmitBtn(); });
      }
    });

    /** Run rules for one field, return first error message or null */
    function runRules(entry) {
      var val = entry.el.value || '';
      for (var i = 0; i < entry.rules.length; i++) {
        var msg = entry.rules[i](val, entry.el);
        if (msg) return entry.customMsg || msg;
      }
      return null;
    }

    /** Validate a single field, show/clear error */
    function validateField(entry) {
      var msg = runRules(entry);
      if (msg) { showError(entry.el, msg); return false; }
      markValid(entry.el);
      return true;
    }

    /** Check if all fields are currently valid (without showing errors) */
    function isAllValid() {
      for (var i = 0; i < fieldMap.length; i++) {
        if (runRules(fieldMap[i])) return false;
      }
      return true;
    }

    /** Enable/disable submit button */
    function updateSubmitBtn() {
      if (!submitBtn) return;
      submitBtn.disabled = !isAllValid();
    }

    /** Validate all fields and show errors, return true if all pass */
    function validateAll() {
      var allGood = true;
      var firstBad = null;
      fieldMap.forEach(function (entry) {
        if (!validateField(entry)) {
          allGood = false;
          if (!firstBad) firstBad = entry.el;
        }
      });
      // Focus the first invalid field
      if (firstBad) firstBad.focus();
      return allGood;
    }

    // Wire submit button
    if (submitBtn && onSubmit) {
      submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (validateAll()) onSubmit();
      });
    }

    // Initial state
    updateSubmitBtn();

    // Public API for this instance
    return {
      validateAll: validateAll,
      isAllValid: isAllValid,
      updateSubmitBtn: updateSubmitBtn,
      showError: showError,
      clearError: clearError,
      validateField: function (id) {
        for (var i = 0; i < fieldMap.length; i++) {
          if (fieldMap[i].el.id === id) return validateField(fieldMap[i]);
        }
      }
    };
  }

  /* ─── Public API ─────────────────────────────────────────── */
  return {
    init: init,
    validators: validators,
    paramValidators: paramValidators
  };
})();
