/* Shared Service Request modal.
   One component used from two places:
     • the Services list  → machine picker (no machine chosen yet)
     • a machine page      → machine locked (context = the current machine)
   On submit it creates a real request in ServiceRequestsStore and navigates to
   the confirmation page. Requires assets/machine-modals.css (styles) and
   assets/service-requests-store.js (persistence). Exposes window.openServiceRequestModal({machineKey}). */
(function () {
  'use strict';

  // Machine catalog. Full specs where known; ServiceRequestsStore.specs() fills the rest with "—".
  var MACHINES = {
    discus30:    { name: 'Discus 30', serial: '232345', country: 'Brazil', meta: 'SN: 232345 · Brazil', equipName: 'Discus 30 Industrial', commission: 'K-12345', machineType: 'Wet Grinding', figNr: 'FG-789', serviceBy: 'NETZSCH Service Team', purchaseDate: '12/20/2021', installDate: '01/15/2022', warranty: '12/20/2024', image: '../assets/machine-discus30.png' },
    zeta60:      { name: 'Zeta 60', serial: '15202531-10', country: 'Brazil', meta: 'SN: 15202531-10 · BLACK PRODUCTION', equipName: 'Zeta 60 Advanced', commission: 'K-12346', machineType: 'Dispersing', figNr: 'FG-790', serviceBy: 'NETZSCH Service Team', purchaseDate: '02/15/2022', installDate: '03/10/2022', warranty: '02/15/2025', image: '../assets/machine-zeta60.png' },
    mastermix45: { name: 'MasterMix 45', serial: '15202531-10', country: 'Brazil', meta: 'SN: 15202531-10 · Brazil', equipName: 'MasterMix 45 Pro', commission: 'K-12347', machineType: 'Mixing', figNr: 'FG-791', serviceBy: 'NETZSCH Service Team', purchaseDate: '05/10/2023', installDate: '06/20/2023', warranty: '05/10/2026', image: '../assets/machine-mastermix45.png' },
    prophi:      { name: 'ProPhi', serial: '15202530-10', country: 'Brazil', meta: 'SN: 15202530-10 · Brazil', equipName: 'ProPhi Industrial', commission: 'K-12348', machineType: 'Wet Grinding', figNr: 'FG-792', serviceBy: 'NETZSCH Service Team', purchaseDate: '08/01/2023', installDate: '09/05/2023', warranty: '08/01/2026', image: '../assets/machine-prophi.png' },
    alphazeta10: { name: 'Alpha Zeta 10', serial: '80204882', country: 'Brazil', meta: 'SN: 80204882 · WHITE PRODUCTION', machineType: 'Wet Grinding', image: '../assets/machine-zeta60.png' },
    zeta500:     { name: 'Zeta 500', serial: '15202598-10', country: 'Brazil', meta: 'SN: 15202598-10', machineType: 'Dispersing', image: '../assets/machine-zeta60.png' }
  };
  // Machines offered in the picker (Services list) — same set the standalone form used.
  var PICKER_KEYS = ['discus30', 'zeta60', 'mastermix45', 'prophi'];
  // Neutral machine icon shown in the picker thumbnail until a machine is chosen.
  var PLACEHOLDER_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'/%3E%3Cpath d='M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12'/%3E%3C/svg%3E";

  var overlay = null, built = false, lockedKey = null;

  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

  function radioCard(val, title, sub) {
    return '<label class="sr-radio-card"><input type="radio" name="srmType" value="' + val + '">' +
      '<div class="sr-radio-card-title">' + title + '</div>' +
      '<div class="sr-radio-card-sub">' + sub + '</div></label>';
  }

  function build() {
    if (built) return;
    var pickerOptions = '<option value="" disabled selected>Select the machine</option>' +
      PICKER_KEYS.map(function (k) { return '<option value="' + k + '">' + MACHINES[k].name + '</option>'; }).join('');

    overlay = el(
      '<div class="sr-modal-overlay" id="srm-overlay">' +
        '<div class="sr-modal-wrapper">' +
          '<button type="button" class="sr-modal-close" id="srm-close" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
          '<div class="sr-modal">' +
            '<div class="sr-modal-header">' +
              '<div class="sr-modal-header-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007167" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>' +
              '<div><h2>Service Request</h2><p>Schedule maintenance or report an issue</p></div>' +
            '</div>' +
            '<div id="srm-machine-slot"></div>' +
            '<div class="sr-modal-body">' +
              '<div id="srm-machine-field" style="display:none">' +
                '<label class="sr-field-label" for="srm-machine">Machine <span class="required">*</span></label>' +
                '<div class="sr-machine-picker">' +
                  '<img id="srm-machine-thumb" class="sr-machine-thumb is-placeholder" alt="" src="' + PLACEHOLDER_THUMB + '">' +
                  '<select class="sr-input" id="srm-machine">' + pickerOptions + '</select>' +
                '</div>' +
              '</div>' +
              '<div>' +
                '<span class="sr-field-label">Request Type <span class="required">*</span></span>' +
                '<div class="sr-radio-cards" id="srm-radio-cards">' +
                  radioCard('repair', 'Repair', 'Equipment Fix') +
                  radioCard('maintenance', 'Maintenance', 'Preventive care') +
                  radioCard('spare-parts', 'Spare Parts', 'Request Parts') +
                  radioCard('consultation', 'Consultation', 'Expert Advice') +
                '</div>' +
              '</div>' +
              '<div>' +
                '<label class="sr-field-label" for="srm-title">Title <span class="required">*</span></label>' +
                '<input type="text" class="sr-input" id="srm-title" placeholder="Brief summary of the issue...">' +
              '</div>' +
              '<div>' +
                '<label class="sr-field-label" for="srm-desc">Problem Description <span class="required">*</span></label>' +
                '<textarea class="sr-textarea" id="srm-desc" placeholder="Describe the issue in detail..."></textarea>' +
              '</div>' +
              '<div>' +
                '<span class="sr-field-label">Attachments</span>' +
                '<div class="sr-dropzone" id="srm-dropzone"><svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 20V8m0 0l-5 5m5-5l5 5" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 22v2a2 2 0 002 2h16a2 2 0 002-2v-2" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                  '<span class="sr-dropzone-text">Drop files here or click to upload</span>' +
                  '<span class="sr-dropzone-hint">Supports: PDF, JPG, PNG</span>' +
                  '<input type="file" id="srm-file" multiple accept=".pdf,.jpg,.jpeg,.png" style="display:none"></div>' +
              '</div>' +
              '<div class="sr-modal-footer">' +
                '<button type="button" class="sr-btn-cancel" id="srm-cancel">Cancel</button>' +
                '<button type="button" class="btn btn-primary btn-md" id="srm-send" disabled><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Send Request</span></button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    document.body.appendChild(overlay);
    wire();
    built = true;
  }

  function q(id) { return overlay.querySelector('#' + id); }

  function syncSelectPlaceholder() {
    var sel = q('srm-machine');
    if (sel) sel.classList.toggle('is-placeholder', sel.value === '');
  }

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  // Machine context bar (image + name + SN). withChange adds a "Change" button (picker only).
  function machineBar(m, withChange) {
    return '<div class="sr-machine-bar"><img src="' + (m.image || '') + '" alt="' + esc(m.name) + '">' +
      '<div class="sr-machine-bar-info"><div class="sr-machine-bar-name">' + esc(m.name) + '</div>' +
      '<div class="sr-machine-bar-meta">' + esc(m.meta || '') + '</div></div>' +
      (withChange ? '<button type="button" class="sr-machine-change" id="srm-change">Change</button>' : '') +
    '</div>';
  }
  // Picker thumbnail: neutral icon until a machine is chosen, then its photo.
  function syncThumb() {
    var sel = q('srm-machine'), thumb = q('srm-machine-thumb');
    if (!thumb) return;
    var m = sel && sel.value ? MACHINES[sel.value] : null;
    if (m && m.image) { thumb.src = m.image; thumb.alt = m.name; thumb.classList.remove('is-placeholder'); }
    else { thumb.src = PLACEHOLDER_THUMB; thumb.alt = ''; thumb.classList.add('is-placeholder'); }
  }

  function validate() {
    var hasMachine = lockedKey ? true : (q('srm-machine').value !== '');
    var hasType = !!overlay.querySelector('input[name="srmType"]:checked');
    var hasTitle = q('srm-title').value.trim().length > 0;
    var hasDesc = q('srm-desc').value.trim().length > 0;
    q('srm-send').disabled = !(hasMachine && hasType && hasTitle && hasDesc);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function reset() {
    q('srm-title').value = '';
    q('srm-desc').value = '';
    var sel = q('srm-machine'); if (sel) { sel.selectedIndex = 0; }
    syncSelectPlaceholder();
    syncThumb();
    Array.prototype.forEach.call(overlay.querySelectorAll('.sr-radio-card'), function (c) { c.classList.remove('selected'); });
    Array.prototype.forEach.call(overlay.querySelectorAll('input[name="srmType"]'), function (r) { r.checked = false; });
    var file = q('srm-file'); if (file) file.value = '';
    q('srm-dropzone').querySelector('.sr-dropzone-text').textContent = 'Drop files here or click to upload';
    q('srm-send').disabled = true;
  }

  function submit() {
    if (q('srm-send').disabled || !window.ServiceRequestsStore) return;
    var typeEl = overlay.querySelector('input[name="srmType"]:checked');
    var key = lockedKey || q('srm-machine').value;
    var md = MACHINES[key] || { name: key };
    var machine = ServiceRequestsStore.specs(md.name, md.serial, {
      country: md.country, equipName: md.equipName, commission: md.commission,
      machineType: md.machineType, figNr: md.figNr, serviceBy: md.serviceBy,
      purchaseDate: md.purchaseDate, installDate: md.installDate, warranty: md.warranty, image: md.image
    });
    var file = q('srm-file');
    var id = ServiceRequestsStore.newId();
    ServiceRequestsStore.add({
      id: id,
      date: ServiceRequestsStore.todayLabel(),
      type: typeEl.value,
      status: 'submitted',
      title: q('srm-title').value.trim(),
      desc: q('srm-desc').value.trim(),
      files: (file && file.files) ? file.files.length : 0,
      machine: machine
    });
    window.location.href = 'service-request-submitted.html?id=' + id + '&new=1';
  }

  function wire() {
    q('srm-close').addEventListener('click', close);
    q('srm-cancel').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });

    Array.prototype.forEach.call(overlay.querySelectorAll('.sr-radio-card'), function (card) {
      card.addEventListener('click', function () {
        Array.prototype.forEach.call(overlay.querySelectorAll('.sr-radio-card'), function (c) { c.classList.remove('selected'); });
        card.classList.add('selected');
        card.querySelector('input[type="radio"]').checked = true;
        validate();
      });
    });
    q('srm-title').addEventListener('input', validate);
    q('srm-desc').addEventListener('input', validate);
    var sel = q('srm-machine'); if (sel) sel.addEventListener('change', function () { syncSelectPlaceholder(); syncThumb(); validate(); });

    var dz = q('srm-dropzone'), file = q('srm-file');
    dz.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      if (file.files.length > 0) dz.querySelector('.sr-dropzone-text').textContent = file.files.length + ' file(s) selected';
    });

    q('srm-send').addEventListener('click', submit);
  }

  // opts.machineKey → locked mode (machine fixed); otherwise picker mode.
  function open(opts) {
    build();
    opts = opts || {};
    lockedKey = opts.machineKey && MACHINES[opts.machineKey] ? opts.machineKey : null;
    reset();

    if (lockedKey) {
      q('srm-machine-slot').innerHTML = machineBar(MACHINES[lockedKey], false);
      q('srm-machine-field').style.display = 'none';
    } else {
      q('srm-machine-slot').innerHTML = '';
      q('srm-machine-field').style.display = '';
      syncThumb();
    }
    validate();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  window.openServiceRequestModal = open;

  // Auto-wire triggers.
  function init() {
    // Services list (or anywhere): elements marked data-sr-open → picker mode.
    Array.prototype.forEach.call(document.querySelectorAll('[data-sr-open]'), function (t) {
      t.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    // Machine page: the hero "Service Request" trigger → locked to the page's machine.
    var trigger = document.getElementById('service-request-trigger');
    if (trigger) {
      var m = (location.pathname.split('/').pop() || '').match(/^machine-([a-z0-9]+)\.html$/i);
      var key = m ? m[1].toLowerCase() : null;
      if (key && MACHINES[key]) {
        trigger.addEventListener('click', function () { open({ machineKey: key }); });
      }
    }
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
