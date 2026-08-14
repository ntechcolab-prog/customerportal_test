/**
 * NETZSCH Customer Portal — Machine production-line selector.
 * Replaces the free-text line field on a machine detail page with a dropdown
 * of the company's managed lines (from MachineLines). Assigning writes to the
 * store so it stays consistent everywhere. Creating a new line is Admin-only.
 */
(function () {
  var wrap = document.querySelector('.hero-meta[data-store="netzsch_line"]');
  if (!wrap || !window.MachineLines) return;
  var valueEl = wrap.querySelector('.hero-meta-value');
  if (!valueEl) return;
  wrap.setAttribute('data-editable', 'true'); // keep the free-text editor off this field

  var page = (location.pathname.split('/').pop() || '');
  var id = page.replace(/^machine-/, '').replace(/\.html$/, '');
  var isAdmin = (localStorage.getItem('netzsch_user_role') || 'administrator') === 'administrator';
  var T = (window.NetzschI18n && NetzschI18n.t) ? function (k, d) { return NetzschI18n.t(k, d); } : function (k, d) { return d; };
  var warn = '⚠︎ ';
  var open = false;

  if (!document.getElementById('hml-styles')) {
    var st = document.createElement('style');
    st.id = 'hml-styles';
    st.textContent = [
      '.hml { position:relative; display:inline-block; }',
      '.hml-trigger { display:inline-flex; align-items:center; gap:8px; height:32px; padding:0 10px; border:1px solid #007167; border-radius:8px; background:#fff; font-family:"Inter",sans-serif; font-size:13px; font-weight:600; color:#1d1d1f; cursor:pointer; transition:background .15s; }',
      '.hml-trigger:hover { background:#fafbfc; }',
      '.hml-trigger.none { color:#8a5a00; }',
      '.hml-trigger .cv { width:11px; height:11px; }',
      '.hml-panel { position:absolute; top:38px; left:0; z-index:60; width:238px; background:#fff; border:1px solid #eaeaea; border-radius:10px; box-shadow:0 12px 32px rgba(0,0,0,0.14); padding:6px; }',
      '.hml-opt { padding:9px 10px; border-radius:7px; font-size:14px; color:#3d4246; cursor:pointer; display:flex; align-items:center; gap:8px; }',
      '.hml-opt:hover { background:#f6f7f8; }',
      '.hml-opt.cur { background:#eef6f5; color:#007167; font-weight:600; }',
      '.hml-new { border-top:1px solid #eaeaea; margin-top:4px; padding-top:9px; color:#007167; font-weight:600; }',
      '.hml-new .adm { font-size:10px; background:#eef6f5; color:#007167; border-radius:4px; padding:1px 5px; margin-left:auto; letter-spacing:.4px; }',
      '.hml-newrow { display:flex; gap:6px; padding:6px 4px 4px; }',
      '.hml-newinput { flex:1; height:34px; border:1px solid #007167; border-radius:7px; padding:0 9px; font-family:"Inter",sans-serif; font-size:13px; color:#1d1d1f; outline:none; }',
      '.hml-newinput:focus { box-shadow:0 0 0 3px rgba(0,113,103,0.12); }',
      '.hml-newsave { background:#007167; color:#fff; border:none; border-radius:7px; padding:0 13px; font-size:12px; font-weight:600; cursor:pointer; }',
      '.hml-err { color:#b42318; font-size:12px; padding:2px 8px 6px; }'
    ].join('\n');
    document.head.appendChild(st);
  }

  var chev = '<svg class="cv" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6l4 4 4-4"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function noLineLabel() { return T('machines.noLine', 'No line'); }

  valueEl.classList.add('hml');

  function render() {
    var line = MachineLines.getMachineLine(id);
    valueEl.innerHTML = '<button type="button" class="hml-trigger' + (line ? '' : ' none') + '">' +
      (line ? esc(line) : warn + esc(noLineLabel())) + chev + '</button>';
    valueEl.querySelector('.hml-trigger').addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
  }

  function toggle() { if (open) { close(); } else { openPanel(); } }

  function openPanel() {
    close();
    open = true;
    var line = MachineLines.getMachineLine(id);
    var lines = MachineLines.getLines();
    var panel = document.createElement('div');
    panel.className = 'hml-panel';
    var html = '<div class="hml-opt' + (line ? '' : ' cur') + '" data-line="">' + esc(noLineLabel()) + '</div>';
    html += lines.map(function (l) {
      return '<div class="hml-opt' + (l === line ? ' cur' : '') + '" data-line="' + esc(l) + '">' + esc(l) + '</div>';
    }).join('');
    if (isAdmin) {
      html += '<div class="hml-opt hml-new" data-new="1">+ ' + esc(T('machine.newLine', 'New line')) + '<span class="adm">ADMIN</span></div>';
    }
    panel.innerHTML = html;
    valueEl.appendChild(panel);
    panel.addEventListener('click', function (e) {
      var opt = e.target.closest('.hml-opt'); if (!opt) return;
      e.stopPropagation();
      if (opt.getAttribute('data-new')) { showNewRow(panel); return; }
      assign(opt.getAttribute('data-line') || '');
    });
  }

  function showNewRow(panel) {
    panel.innerHTML =
      '<div class="hml-newrow">' +
        '<input class="hml-newinput" type="text" maxlength="40" placeholder="' + esc(T('admin.machines.newLinePlaceholder', 'New line name')) + '" aria-label="New line name">' +
        '<button type="button" class="hml-newsave">' + esc(T('admin.machines.save', 'Save')) + '</button>' +
      '</div><div class="hml-err" hidden></div>';
    var inp = panel.querySelector('.hml-newinput'); inp.focus();
    var err = panel.querySelector('.hml-err');
    function create() {
      var val = (inp.value || '').trim();
      if (!val) { err.textContent = T('admin.machines.errEmpty', 'Enter a line name.'); err.hidden = false; return; }
      var r = MachineLines.addLine(val);
      var name;
      if (r.ok) { name = r.name; }
      else if (r.err === 'dup') {
        name = MachineLines.getLines().filter(function (l) { return l.toLowerCase() === val.toLowerCase(); })[0] || val;
      } else { err.textContent = T('admin.machines.errEmpty', 'Enter a line name.'); err.hidden = false; return; }
      assign(name);
    }
    panel.querySelector('.hml-newsave').addEventListener('click', function (e) { e.stopPropagation(); create(); });
    inp.addEventListener('click', function (e) { e.stopPropagation(); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); create(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });
  }

  function assign(line) {
    MachineLines.setMachineLine(id, line);
    close();
    render();
    showToast(T('machine.lineUpdated', 'Production line updated'));
  }

  function close() {
    open = false;
    var p = valueEl.querySelector('.hml-panel'); if (p) p.remove();
  }
  document.addEventListener('click', function (e) { if (!valueEl.contains(e.target)) close(); });

  function showToast(msg) {
    var existing = document.querySelector('.hourmeter-toast');
    if (existing) { existing.textContent = msg; existing.classList.add('show'); setTimeout(function () { existing.classList.remove('show'); }, 2500); return; }
    var t = document.createElement('div'); t.className = 'hourmeter-toast show'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.remove('show'); }, 2500);
    setTimeout(function () { t.remove(); }, 3000);
  }

  render();
})();
