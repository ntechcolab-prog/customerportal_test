/**
 * NETZSCH Customer Portal — Document access-request notifications (admin).
 *
 * Shows pending "document access" requests (raised by a customer profile in the
 * Documents & Manuals modal) as notifications in the admin header bell, on every
 * admin page. Each item has a "Grant access" action that makes the machine's
 * documents visible to the requesting profile.
 *
 * Requires assets/docs-store.js to be loaded first. Only runs for the Admin role.
 */
(function () {
  'use strict';

  function init() {
    if (!window.DocsStore) return;
    var S = window.DocsStore;

    // Only the Admin manages document access.
    var role = 'administrator';
    try { role = localStorage.getItem('netzsch_user_role') || 'administrator'; } catch (e) {}
    if (role !== 'administrator') return;

    var listEl = document.querySelector('.notif-list');
    var notifDd = document.getElementById('notifDropdown');
    if (!listEl || !notifDd) return;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }
    function roleLabel(k) {
      var r = S.ROLES.filter(function (x) { return x.key === k; })[0];
      return r ? r.label : k;
    }
    function relTime(ts) {
      var s = Math.floor((Date.now() - ts) / 1000);
      if (s < 60) return 'just now';
      var m = Math.floor(s / 60); if (m < 60) return m + ' min ago';
      var h = Math.floor(m / 60); if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
      var dd = Math.floor(h / 24); return dd + (dd === 1 ? ' day ago' : ' days ago');
    }
    var lockSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>';

    function toast(msg) {
      var t = document.createElement('div');
      t.textContent = msg;
      t.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(10px);background:#1d1d1f;color:#fff;font:500 13px/1.4 Inter,sans-serif;padding:11px 18px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.2);z-index:2000;opacity:0;transition:opacity .2s ease,transform .2s ease;max-width:90vw;';
      document.body.appendChild(t);
      requestAnimationFrame(function () { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
      setTimeout(function () {
        t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 250);
      }, 2600);
    }

    function render() {
      Array.prototype.forEach.call(listEl.querySelectorAll('.notif-item[data-req]'), function (n) { n.parentNode.removeChild(n); });
      var reqs = S.listAccessRequests({ status: 'pending' });
      reqs.slice().reverse().forEach(function (r) {
        var el = document.createElement('div');
        el.className = 'notif-item unread';
        el.setAttribute('data-req', r.id);
        el.innerHTML =
          '<div class="notif-item-icon service">' + lockSvg + '</div>' +
          '<div class="notif-item-content">' +
            '<div class="notif-item-title-row"><span class="notif-item-title">' + esc(roleLabel(r.role)) + ' requested document access</span></div>' +
            '<div class="notif-item-desc">' + esc(S.machineName(r.machineId)) + ' — Documents &amp; Manuals</div>' +
            '<div class="notif-item-time">' + relTime(r.ts) + '</div>' +
            '<button type="button" class="notif-item-action" data-grant="' + esc(r.id) + '">Grant access</button>' +
          '</div>';
        listEl.insertBefore(el, listEl.firstChild);
      });
      var unread = listEl.querySelectorAll('.notif-item.unread').length;
      var bell = document.querySelector('.notif-badge');
      var head = document.querySelector('.notif-count-badge');
      if (bell) { bell.textContent = unread; bell.style.display = unread ? '' : 'none'; }
      if (head) head.textContent = unread;
    }

    notifDd.addEventListener('click', function (e) {
      var g = e.target.closest('[data-grant]');
      if (!g) return;
      e.preventDefault(); e.stopPropagation();
      var res = S.resolveAccessRequest(g.getAttribute('data-grant'), true);
      render();
      // Let the current page refresh anything that depends on document visibility.
      try { window.dispatchEvent(new CustomEvent('netzsch:docs-changed')); } catch (err) {}
      if (res && res.req) toast(roleLabel(res.req.role) + ' can now access ' + S.machineName(res.req.machineId) + ' documents');
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
