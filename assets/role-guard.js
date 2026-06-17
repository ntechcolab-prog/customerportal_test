/**
 * NETZSCH Customer Portal — Role-based navigation guard
 * Reads `netzsch_user_role` from localStorage and hides menu items / features
 * that the current role should not access.
 *
 * Roles: administrator, buyer, approver, technician
 */
(function () {
  var role = localStorage.getItem('netzsch_user_role') || 'administrator';

  // Menu items to hide per role (data-i18n key → hide if listed)
  var hiddenMenus = {
    administrator: [],
    buyer: ['nav.labTests'],
    approver: ['nav.shop', 'nav.labTests'],
    technician: ['nav.quotes']
  };

  // Pages that should redirect to dashboard if role has no access
  var blockedPages = {
    technician: [
      'checkout.html', 'checkout-cart.html', 'checkout-review.html',
      'checkout-confirmation.html', 'checkout-order-details.html', 'checkout-quote.html',
      'quotes.html', 'quote-detail.html', 'contracts.html',
      'budget.html',
      'admin-company.html', 'admin-users.html', 'admin-roles.html',
      'admin-requests.html', 'admin-notifications.html'
    ],
    buyer: [
      'lab-tests.html', 'contracts.html',
      'admin-company.html', 'admin-users.html', 'admin-roles.html',
      'admin-requests.html', 'admin-notifications.html'
    ],
    administrator: [
      'budget.html'
    ],
    approver: [
      'shop.html', 'shop-product-detail.html', 'shop-product-glassbeads.html',
      'shop-product-steelbeads-micro.html', 'shop-product-steelbeads-q.html',
      'shop-product-zetabeads-nano.html', 'shop-product-zetabeads-plus.html',
      'shop-product-zs-beads.html',
      'checkout.html', 'checkout-cart.html', 'checkout-review.html',
      'checkout-confirmation.html', 'checkout-order-details.html', 'checkout-quote.html',
      'budget.html',
      'lab-tests.html', 'contracts.html',
      'admin-company.html', 'admin-users.html', 'admin-roles.html',
      'admin-requests.html', 'admin-notifications.html'
    ]
  };

  // 1. Redirect if on blocked page
  var currentPage = window.location.pathname.split('/').pop();
  var blocked = blockedPages[role] || [];
  if (blocked.indexOf(currentPage) !== -1) {
    window.location.href = 'dashboard.html';
    return;
  }

  // 2. Hide or rename menu items
  var hidden = hiddenMenus[role] || [];
  document.querySelectorAll('.nav-tab').forEach(function (tab) {
    var i18nKey = tab.getAttribute('data-i18n') || '';
    if (hidden.indexOf(i18nKey) !== -1) {
      tab.style.display = 'none';
    }
    // Rename "Orders" to "Requests" for technician (change i18n key so translation picks up)
    if (role === 'technician' && i18nKey === 'nav.orders') {
      tab.setAttribute('data-i18n', 'nav.requests');
      tab.textContent = 'Requests';
    }
  });

  // 3. Hide specific links in profile dropdown per role (match by data-i18n key)
  if (role !== 'administrator') {
    document.querySelectorAll('.profile-dropdown-item').forEach(function (item) {
      var i18nKey = item.getAttribute('data-i18n') || '';
      if (i18nKey === 'profile.admin') {
        item.closest('li').style.display = 'none';
      }
    });
  }
  if (role === 'technician' || role === 'buyer' || role === 'approver') {
    document.querySelectorAll('.profile-dropdown-item').forEach(function (item) {
      var i18nKey = item.getAttribute('data-i18n') || '';
      if (i18nKey === 'profile.contracts') {
        item.closest('li').style.display = 'none';
      }
    });
  }

  // 4. Hide cart icon for technician and approver (no shop access)
  if (role === 'technician' || role === 'approver') {
    var cartBtn = document.getElementById('btn-cart');
    if (cartBtn) cartBtn.style.display = 'none';
    var cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) cartDropdown.style.display = 'none';
  }

  // 4b. Set persona (name, email, initials, color) per role
  var personas = {
    administrator: { name: 'Marcus Weber',   email: 'marcus.weber@acme-corp.com',   initials: 'MW', color: '#007167' },
    buyer:         { name: 'Sarah Mitchell',  email: 'sarah.mitchell@acme-corp.com',  initials: 'SM', color: '#0b9c92' },
    technician:    { name: 'Carlos Andrade',  email: 'carlos.andrade@acme-corp.com',  initials: 'CA', color: '#3d4246' },
    approver:      { name: 'Daniel Costa',    email: 'daniel.costa@acme-corp.com',    initials: 'DC', color: '#5c5f62' }
  };

  // Helper: create initials circle element
  function createInitialsEl(initials, bg, size, fontSize) {
    var el = document.createElement('div');
    el.textContent = initials;
    el.setAttribute('aria-label', initials);
    el.style.cssText = 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg +
      ';color:#fff;display:flex;align-items:center;justify-content:center;font-family:"Inter",sans-serif;' +
      'font-size:' + fontSize + 'px;font-weight:600;letter-spacing:0.5px;cursor:pointer;flex-shrink:0;user-select:none;';
    return el;
  }

  var persona = personas[role];
  if (persona) {
    // Inject avatar styles
    var avatarStyle = document.createElement('style');
    avatarStyle.textContent = '.profile-dropdown { width: 280px !important; } .profile-dropdown-email { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }';
    document.head.appendChild(avatarStyle);

    // Header avatar → initials
    var headerAvatar = document.querySelector('.user-avatar');
    if (headerAvatar) {
      var headerInitials = createInitialsEl(persona.initials, persona.color, 44, 15);
      headerInitials.setAttribute('onclick', 'toggleProfileDropdown(event)');
      headerAvatar.parentNode.replaceChild(headerInitials, headerAvatar);
    }

    // Dropdown avatar → initials
    var dropdownAvatar = document.querySelector('.profile-dropdown-avatar');
    if (dropdownAvatar) {
      var ddInitials = createInitialsEl(persona.initials, persona.color, 36, 13);
      ddInitials.style.border = '1px solid #fff';
      ddInitials.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      ddInitials.style.cursor = 'default';
      dropdownAvatar.parentNode.replaceChild(ddInitials, dropdownAvatar);
    }

    // Dropdown name + email
    var dropdownName = document.querySelector('.profile-dropdown-name');
    if (dropdownName) dropdownName.textContent = persona.name;
    var dropdownEmail = document.querySelector('.profile-dropdown-email');
    if (dropdownEmail) dropdownEmail.textContent = persona.email;

    // Profile page — large avatar → initials
    var profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      var profileInitials = createInitialsEl(persona.initials, persona.color, 80, 26);
      profileInitials.style.border = '3px solid rgba(255,255,255,0.3)';
      profileInitials.style.cursor = 'default';
      profileAvatar.parentNode.replaceChild(profileInitials, profileAvatar);
    }

    // Profile name
    var profileName = document.querySelector('.profile-name');
    if (profileName) profileName.textContent = persona.name;

    // Role labels (used in multiple places below)
    var badgeLabels = {
      administrator: 'Administrator',
      buyer:         'Buyer',
      technician:    'Technician',
      approver:      'Approver'
    };

    // Info fields on profile page (Full Name, Email, Role, Job Title, Department)
    var jobTitles = {
      administrator: 'Operations Manager',
      buyer:         'Procurement Specialist',
      technician:    'Field Technician',
      approver:      'Procurement Manager'
    };
    var departments = {
      administrator: 'Operations',
      buyer:         'Procurement',
      technician:    'Engineering',
      approver:      'Procurement'
    };
    document.querySelectorAll('.info-field[data-field]').forEach(function (field) {
      var dataField = field.getAttribute('data-field');
      var value = field.querySelector('.info-field-value');
      if (!value) return;
      if (dataField === 'fullname' && value.textContent.trim() === 'John Doe') value.textContent = persona.name;
      if (dataField === 'email' && value.textContent.trim() === 'john.doe@acme-corp.com') value.textContent = persona.email;
      if (dataField === 'role') value.textContent = badgeLabels[role] || value.textContent;
      if (dataField === 'jobtitle') value.textContent = jobTitles[role] || value.textContent;
      if (dataField === 'department') value.textContent = departments[role] || value.textContent;
    });

    // Hide Admin Panel sidebar link for non-admin roles (match by href)
    if (role !== 'administrator') {
      document.querySelectorAll('.account-nav-item').forEach(function (item) {
        var href = item.getAttribute('href') || '';
        if (href.indexOf('admin-users') !== -1) {
          item.style.display = 'none';
        }
      });
    }

    // Profile role subtitle
    var roles = {
      administrator: 'System Administrator at ACME Corporation',
      buyer:         'Procurement Specialist at ACME Corporation',
      technician:    'Field Technician at ACME Corporation',
      approver:      'Procurement Manager at ACME Corporation'
    };
    var profileRole = document.querySelector('.profile-role');
    if (profileRole) profileRole.textContent = roles[role] || profileRole.textContent;

    // Email in profile-meta-item (plain text next to SVG icon)
    document.querySelectorAll('.profile-meta-item').forEach(function (el) {
      var text = el.textContent.trim();
      if (text.indexOf('john.doe@acme-corp.com') !== -1) {
        el.childNodes.forEach(function (node) {
          if (node.nodeType === 3 && node.textContent.trim().indexOf('john.doe@acme-corp.com') !== -1) {
            node.textContent = '\n          ' + persona.email + '\n        ';
          }
        });
      }
    });

    // Role badge on profile page
    var badgeAdmin = document.querySelector('.badge-admin');
    if (badgeAdmin) {
      // Replace text only, keep the SVG icon
      badgeAdmin.childNodes.forEach(function (node) {
        if (node.nodeType === 3 && node.textContent.trim().length > 0) {
          node.textContent = '\n            ' + (badgeLabels[role] || role) + '\n          ';
        }
      });
    }

    // Only admin can edit profile — hide edit buttons for other roles
    if (role !== 'administrator') {
      var avatarEditBtn = document.querySelector('.profile-avatar-edit');
      if (avatarEditBtn) avatarEditBtn.style.display = 'none';

      document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.style.display = 'none';
      });
    }
  }

  // 5. Hide all prices/monetary values for technician (Price = "-" in CRUD matrix)
  if (role === 'technician') {
    // Hide € symbols in table cells (orders, spare parts, wishlist, etc.)
    document.querySelectorAll('td').forEach(function (td) {
      var text = td.textContent.trim();
      if (/€/.test(text) || /\d+[.,]\d{2}\s*€/.test(text)) {
        td.textContent = '—';
        td.style.color = '#a0a3a8';
      }
    });

    // Hide table header columns that say "price" or "total"
    var priceI18nKeys = ['table.unitPrice', 'common.total', 'common.price', 'orders.total'];
    document.querySelectorAll('th').forEach(function (th) {
      var i18nKey = th.getAttribute('data-i18n') || '';
      var text = th.textContent.trim().toLowerCase();
      if (priceI18nKeys.indexOf(i18nKey) !== -1 || text === 'unit price' || text === 'total' || text === 'price') {
        var idx = th.cellIndex;
        th.textContent = '—';
        th.style.color = '#a0a3a8';
        // Also hide corresponding td cells in same column
        var table = th.closest('table');
        if (table) {
          table.querySelectorAll('tbody tr').forEach(function (row) {
            var cell = row.cells[idx];
            if (cell) {
              cell.textContent = '—';
              cell.style.color = '#a0a3a8';
            }
          });
        }
      }
    });

    // Hide payment details card (order-detail)
    document.querySelectorAll('.payment-card').forEach(function (el) {
      el.style.display = 'none';
    });

    // Hide price spans in cards (wishlist, shop, product cards)
    document.querySelectorAll('.card-price, .product-price, .price, .item-price, .product-card-price, .table-price, .price-value').forEach(function (el) {
      el.textContent = '—';
      el.style.color = '#a0a3a8';
    });

    // Hide price labels (shop product detail)
    document.querySelectorAll('.price-label').forEach(function (el) {
      el.textContent = '';
    });

    // Hide bulk pricing card (shop product detail)
    document.querySelectorAll('.bulk-card').forEach(function (el) {
      el.style.display = 'none';
    });

    // Hide € in notification descriptions
    document.querySelectorAll('.notif-item-desc').forEach(function (el) {
      el.textContent = el.textContent.replace(/\s*—\s*€[\d,.]+/g, '');
    });
  }

  // 6. Replace "Add to cart" with "Request for Approval" for technician
  if (role === 'technician') {
    // Text-style buttons in spare parts tables
    document.querySelectorAll('.add-to-cart').forEach(function (btn) {
      btn.textContent = 'Request for Approval';
      btn.style.color = '#fff';
      btn.style.background = '#007167';
      btn.style.border = 'none';
      btn.style.borderRadius = '999px';
      btn.style.padding = '6px 16px';
      btn.style.fontWeight = '500';
      btn.style.cursor = 'pointer';
    });

    // Solid buttons in wishlist cards
    document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      // Replace inner content (SVG + text) with new label
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Request for Approval';
      btn.style.background = '#007167';
      btn.style.color = '#fff';
    });
  }

  // 7. Transform Orders page into Requests page for technician
  if (role === 'technician' && currentPage === 'orders.html') {
    // Rename title and breadcrumb
    var h1 = document.querySelector('.title-bar h1');
    if (h1) {
      h1.setAttribute('data-i18n', 'technician.requests');
      h1.textContent = 'Requests';
    }
    document.querySelectorAll('.breadcrumb-current').forEach(function (el) {
      var i18nKey = el.getAttribute('data-i18n') || '';
      if (i18nKey === 'orders.title' || el.textContent.trim() === 'Orders') {
        el.setAttribute('data-i18n', 'technician.requests');
        el.textContent = 'Requests';
      }
    });
    document.title = 'Requests — NETZSCH Customer Portal';

    // Transform drawer into Request Details
    var drawerTitle = document.querySelector('.drawer-title');
    if (drawerTitle) drawerTitle.textContent = 'Request Details';
    var drawer = document.getElementById('trackingDrawer');
    if (drawer) drawer.setAttribute('aria-label', 'Request Details');

    // Replace table with requests data
    var sortSvg = '<svg class="sort-icon" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var table = document.querySelector('.orders-table');
    if (table) {
      var thead = table.querySelector('thead tr');
      if (thead) {
        thead.innerHTML =
          '<th>Request ' + sortSvg + '</th>' +
          '<th>Product ' + sortSvg + '</th>' +
          '<th>Machine ' + sortSvg + '</th>' +
          '<th>Priority ' + sortSvg + '</th>' +
          '<th>Submitted ' + sortSvg + '</th>' +
          '<th>Status ' + sortSvg + '</th>' +
          '<th>Actions</th>';
      }

      var tbody = table.querySelector('tbody');
      if (tbody) {
        var requests = [
          { id: 'REQ-2026-4781', product: 'NETZSCH CERABEADS 0.4', machine: 'Alpha Zeta 10', priority: 'high', date: 'Apr 15, 2026', status: 'pending' },
          { id: 'REQ-2026-4756', product: 'O-Ring (517225)', machine: 'Discus 30', priority: 'urgent', date: 'Apr 14, 2026', status: 'approved' },
          { id: 'REQ-2026-4730', product: 'Ring - AISI 304', machine: 'Zeta 60', priority: 'medium', date: 'Apr 12, 2026', status: 'approved' },
          { id: 'REQ-2026-4698', product: 'Inlet Flange Set', machine: 'Alpha Zeta 10', priority: 'low', date: 'Apr 10, 2026', status: 'rejected' },
          { id: 'REQ-2026-4652', product: 'ZetaBeads Plus 0.3mm', machine: 'NEOS 03', priority: 'medium', date: 'Apr 8, 2026', status: 'approved' },
          { id: 'REQ-2026-4619', product: 'Steel Beads Micro 0.1mm', machine: 'Zeta 60', priority: 'high', date: 'Apr 5, 2026', status: 'pending' },
        ];

        var statusMap = {
          pending: '<span class="status-badge status-placed">Pending Approval</span>',
          approved: '<span class="status-badge status-delivered">Approved</span>',
          rejected: '<span class="status-badge" style="background:#fce8e6;color:#c73e20;">Rejected</span>'
        };

        var priorityMap = {
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          urgent: 'Urgent'
        };

        tbody.innerHTML = requests.map(function (r) {
          return '<tr>' +
            '<td><a class="order-link" href="order-detail.html">' + r.id + '</a></td>' +
            '<td>' + r.product + '</td>' +
            '<td>' + r.machine + '</td>' +
            '<td>' + (priorityMap[r.priority] || r.priority) + '</td>' +
            '<td>' + r.date + '</td>' +
            '<td>' + (statusMap[r.status] || r.status) + '</td>' +
            '<td><div class="actions-cell"><button class="action-btn" title="View details"><img src="../assets/icon-order-eye.svg" alt="View"></button></div></td>' +
            '</tr>';
        }).join('');
      }
    }
  }

  // 8. Wire request detail drawer for technician
  if (role === 'technician' && currentPage === 'orders.html') {
    var drawerBody = document.querySelector('.drawer-body');
    var drawerEl = document.getElementById('trackingDrawer');
    var overlayEl = document.getElementById('drawerOverlay');

    if (drawerBody && drawerEl && overlayEl) {
      var requestsData = [
        { id:'REQ-2026-4781', product:'NETZSCH CERABEADS 0.4', ref:'443385', machine:'Alpha Zeta 10', priority:'High', date:'Apr 15, 2026', status:'pending', justification:'Scheduled maintenance — current grinding beads showing signs of wear after 2,400 operating hours. Replacement needed before next production cycle.' },
        { id:'REQ-2026-4756', product:'O-Ring (517225)', ref:'517225', machine:'Discus 30', priority:'Urgent', date:'Apr 14, 2026', status:'approved', justification:'Seal failure detected during routine inspection. Machine currently offline. Urgent replacement required to resume production.', approver:'Daniel Costa', approvedDate:'Apr 14, 2026' },
        { id:'REQ-2026-4730', product:'Ring - AISI 304', ref:'509812', machine:'Zeta 60', priority:'Medium', date:'Apr 12, 2026', status:'approved', justification:'Preventive replacement as part of quarterly maintenance schedule.', approver:'Daniel Costa', approvedDate:'Apr 13, 2026' },
        { id:'REQ-2026-4698', product:'Inlet Flange Set', ref:'FL-2200', machine:'Alpha Zeta 10', priority:'Low', date:'Apr 10, 2026', status:'rejected', justification:'Minor corrosion on current flange. Requesting replacement as precaution.', approver:'Daniel Costa', rejectedDate:'Apr 11, 2026', rejectReason:'Current flange inspected and deemed within acceptable tolerance. Re-evaluate in next quarterly review.' },
        { id:'REQ-2026-4652', product:'ZetaBeads Plus 0.3mm', ref:'ZB-030P', machine:'NEOS 03', priority:'Medium', date:'Apr 8, 2026', status:'approved', justification:'New batch needed for nano milling project starting Apr 20.', approver:'Daniel Costa', approvedDate:'Apr 9, 2026' },
        { id:'REQ-2026-4619', product:'Steel Beads Micro 0.1mm', ref:'SB-010M', machine:'Zeta 60', priority:'High', date:'Apr 5, 2026', status:'pending', justification:'Current stock running low. Estimated depletion within 2 weeks at current usage rate.' },
      ];

      var statusLabels = {
        pending: '<span class="status-badge status-placed" style="font-size:13px;">Pending Approval</span>',
        approved: '<span class="status-badge status-delivered" style="font-size:13px;">Approved</span>',
        rejected: '<span class="status-badge" style="background:#fce8e6;color:#c73e20;font-size:13px;">Rejected</span>'
      };

      function openRequestDrawer(index) {
        var r = requestsData[index];
        if (!r) return;

        var html = '<div class="drawer-order-id" style="margin-bottom:4px;">' + r.id + '</div>';
        html += '<div style="font-size:13px; color:#6b6e73; margin-bottom:20px;">Submitted on ' + r.date + '</div>';
        html += '<div style="margin-bottom:20px;">' + (statusLabels[r.status] || r.status) + '</div>';

        html += '<div class="drawer-section"><div class="drawer-section-title">Product</div>';
        html += '<div class="drawer-section-text"><strong>' + r.product + '</strong><br>Ref: ' + r.ref + '</div></div>';

        html += '<div class="drawer-section"><div class="drawer-section-title">Related Machine</div>';
        html += '<div class="drawer-section-text">' + r.machine + '</div></div>';

        html += '<div class="drawer-section"><div class="drawer-section-title">Priority</div>';
        html += '<div class="drawer-section-text">' + r.priority + '</div></div>';

        html += '<div class="drawer-section"><div class="drawer-section-title">Justification</div>';
        html += '<div class="drawer-section-text">' + r.justification + '</div></div>';

        if (r.status === 'approved') {
          html += '<div class="drawer-section"><div class="drawer-section-title">Approved by</div>';
          html += '<div class="drawer-section-text"><strong>' + r.approver + '</strong><br>' + r.approvedDate + '</div></div>';
        }

        if (r.status === 'rejected') {
          html += '<div class="drawer-section"><div class="drawer-section-title">Rejected by</div>';
          html += '<div class="drawer-section-text"><strong>' + r.approver + '</strong><br>' + r.rejectedDate + '</div></div>';
          html += '<div class="drawer-section"><div class="drawer-section-title">Reason</div>';
          html += '<div class="drawer-section-text" style="color:#c73e20;">' + r.rejectReason + '</div></div>';
        }

        drawerBody.innerHTML = html;
        overlayEl.classList.add('show');
        drawerEl.classList.add('show');
      }

      // Wire view buttons
      document.querySelectorAll('.action-btn[title="View details"]').forEach(function (btn, i) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          openRequestDrawer(i);
        });
      });

      // Also wire request ID links
      document.querySelectorAll('.order-link').forEach(function (link, i) {
        link.href = '#';
        link.addEventListener('click', function (e) {
          e.preventDefault();
          openRequestDrawer(i);
        });
      });
    }
  }

  // 9. Transform Services page for technician — remove type icons, add detail drawer
  if (role === 'technician' && currentPage === 'services.html') {
    // Remove type icons, keep text only in black
    document.querySelectorAll('.type-cell').forEach(function (cell) {
      var icon = cell.querySelector('.type-icon');
      if (icon) icon.remove();
      cell.style.color = '#2d2e33';
    });

    // Inject drawer CSS
    var drawerStyle = document.createElement('style');
    drawerStyle.textContent = [
      '.svc-drawer-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.3); z-index:500; display:none; }',
      '.svc-drawer-overlay.show { display:block; }',
      '.svc-drawer { position:fixed; top:0; right:0; width:440px; height:100vh; background:#fff; box-shadow:-4px 0 24px rgba(0,0,0,0.12); z-index:501; transform:translateX(100%); transition:transform 0.3s cubic-bezier(0.32,0.72,0,1); display:flex; flex-direction:column; }',
      '.svc-drawer.show { transform:translateX(0); }',
      '.svc-drawer-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #eaeaea; flex-shrink:0; }',
      '.svc-drawer-title { font-size:17px; font-weight:600; color:#2d2e33; letter-spacing:-0.38px; }',
      '.svc-drawer-close { width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; font-size:18px; color:#6b6e73; transition:background 0.15s; }',
      '.svc-drawer-close:hover { background:#f3f4f6; }',
      '.svc-drawer-body { flex:1; overflow-y:auto; padding:24px; }',
      '.svc-detail-section { margin-bottom:20px; }',
      '.svc-detail-label { font-size:12px; font-weight:700; color:#9ca0a5; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }',
      '.svc-detail-value { font-size:14px; color:#2d2e33; line-height:22px; }',
      '.svc-detail-value strong { font-weight:600; }',
    ].join('\n');
    document.head.appendChild(drawerStyle);

    // Inject drawer HTML
    var drawerOverlay = document.createElement('div');
    drawerOverlay.className = 'svc-drawer-overlay';
    drawerOverlay.id = 'svcDrawerOverlay';
    document.body.appendChild(drawerOverlay);

    var drawerEl = document.createElement('div');
    drawerEl.className = 'svc-drawer';
    drawerEl.id = 'svcDrawer';
    drawerEl.innerHTML = '<div class="svc-drawer-header"><span class="svc-drawer-title">Service Details</span><button class="svc-drawer-close" id="svcDrawerClose">&#x2715;</button></div><div class="svc-drawer-body" id="svcDrawerBody"></div>';
    document.body.appendChild(drawerEl);

    // Service data matching the table rows
    var servicesData = [
      { id:'#15345678', date:'Feb 2, 2026', type:'Repair', status:'In Progress', statusClass:'status-in-progress', desc:'Strange noise during operation at high RPM', machine:'Zeta 300', serial:'S/N: 232345', technician:'Carla Mendes', notes:'Bearing inspection scheduled. Possible rotor imbalance detected during preliminary diagnostics. Awaiting replacement parts.' },
      { id:'#15345679', date:'Feb 2, 2026', type:'Spare Parts', status:'In Progress', statusClass:'status-in-progress', desc:'I need a spare part for this machine.', machine:'Zeta 300', serial:'S/N: 232345', technician:'Carla Mendes', notes:'Spare part identified: O-Ring set (517225). Ordered from warehouse, expected delivery in 3 business days.' },
      { id:'#15345680', date:'Jan 20, 2026', type:'Maintenance', status:'Completed', statusClass:'status-completed', desc:'Scheduled preventive maintenance.', machine:'Zeta 300', serial:'S/N: 232345', technician:'Carla Mendes', notes:'Full preventive maintenance completed. All wear parts inspected and replaced as needed. Machine recalibrated and tested. Next maintenance due in 6 months.' },
      { id:'#15345681', date:'Jan 10, 2026', type:'Consultation', status:'Submitted', statusClass:'status-submitted', desc:'Need expert advice on grinding parameters.', machine:'Discus 30', serial:'S/N: 456123', technician:'Carla Mendes', notes:'Awaiting assignment to technical specialist.' },
      { id:'#15345682', date:'Dec 15, 2025', type:'Repair', status:'Cancelled', statusClass:'status-cancelled', desc:'Issue resolved before service visit.', machine:'ProPhi', serial:'S/N: 789123', technician:'Carla Mendes', notes:'Customer reported issue resolved after machine restart. Service request cancelled by technician.' },
    ];

    function openSvcDrawer(index) {
      var s = servicesData[index];
      if (!s) return;
      var body = document.getElementById('svcDrawerBody');

      var html = '';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Service ID</div><div class="svc-detail-value"><strong>' + s.id + '</strong></div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Date</div><div class="svc-detail-value">' + s.date + '</div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Status</div><div class="svc-detail-value"><span class="status-badge ' + s.statusClass + '">' + s.status + '</span></div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Type</div><div class="svc-detail-value">' + s.type + '</div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Description</div><div class="svc-detail-value">' + s.desc + '</div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Machine</div><div class="svc-detail-value"><strong>' + s.machine + '</strong><br>' + s.serial + '</div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Assigned Technician</div><div class="svc-detail-value">' + s.technician + '</div></div>';
      html += '<div class="svc-detail-section"><div class="svc-detail-label">Notes</div><div class="svc-detail-value">' + s.notes + '</div></div>';

      body.innerHTML = html;
      drawerOverlay.classList.add('show');
      drawerEl.classList.add('show');
    }

    function closeSvcDrawer() {
      drawerOverlay.classList.remove('show');
      drawerEl.classList.remove('show');
    }

    document.getElementById('svcDrawerClose').addEventListener('click', closeSvcDrawer);
    drawerOverlay.addEventListener('click', closeSvcDrawer);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawerEl.classList.contains('show')) closeSvcDrawer();
    });

    // Wire view buttons
    document.querySelectorAll('.action-btn[title="View details"]').forEach(function (btn, i) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openSvcDrawer(i);
      });
    });

    // Wire service ID links
    document.querySelectorAll('.service-link').forEach(function (link, i) {
      link.href = '#';
      link.addEventListener('click', function (e) {
        e.preventDefault();
        openSvcDrawer(i);
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // 10. BUYER — Transform Orders page with approval workflow
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'buyer' && currentPage === 'orders.html') {

    // ── 10a. Replace stat cards with approval-centric metrics ──
    var statCards = document.querySelector('.stat-cards');
    if (statCards) {
      statCards.innerHTML = [
        '<div class="stat-card">',
        '  <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">12</span><span class="stat-label">Total Orders</span></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon" style="background:#fff8e1;"><svg viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#b8860b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">3</span><span class="stat-label">Pending Approval</span></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon" style="background:#e8f5e9;"><svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">7</span><span class="stat-label">Approved</span></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon" style="background:#fce8e6;"><svg viewBox="0 0 24 24" fill="none"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#c73e20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">2</span><span class="stat-label">Rejected</span></div>',
        '</div>'
      ].join('\n');
    }

    // ── 10b. Inject approval-specific status badge styles ──
    var buyerStyle = document.createElement('style');
    buyerStyle.textContent = [
      '.status-pending-approval { background:#fff8e1; color:#b8860b; }',
      '.status-approved { background:#e8f5e9; color:#2e7d32; }',
      '.status-rejected { background:#fce8e6; color:#c73e20; }',
      '.status-converted { background:#e8f5f3; color:#007167; }',
      '.approval-tag { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:500; color:#6b7280; margin-left:8px; }',
      '.approval-tag svg { width:12px; height:12px; }',
      /* Drawer approval sections */
      '.drawer-approval-status { display:flex; align-items:center; gap:8px; margin-bottom:20px; }',
      '.drawer-approval-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; font-size:13px; font-weight:600; }',
      '.drawer-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }',
      '.drawer-info-item { display:flex; flex-direction:column; gap:2px; }',
      '.drawer-info-label { font-size:11px; font-weight:700; color:#9ca0a5; text-transform:uppercase; letter-spacing:0.5px; }',
      '.drawer-info-value { font-size:14px; color:#2d2e33; font-weight:500; }',
      '.drawer-divider { border:none; border-top:1px solid #e5e7eb; margin:0 0 20px 0; }',
      '.drawer-items-title { font-size:13px; font-weight:700; color:#1f2937; margin-bottom:12px; }',
      '.drawer-item-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f3f4f6; }',
      '.drawer-item-row:last-child { border-bottom:none; }',
      '.drawer-item-img { width:40px; height:40px; border-radius:8px; background:#f8f9fa; object-fit:contain; }',
      '.drawer-item-info { flex:1; }',
      '.drawer-item-name { font-size:13px; font-weight:600; color:#1f2937; }',
      '.drawer-item-meta { font-size:12px; color:#6b7280; }',
      '.drawer-item-qty { font-size:13px; color:#374151; font-weight:500; text-align:right; }',
      '.drawer-rejection { background:#fef7f6; border:1px solid #fce8e6; border-radius:10px; padding:16px; margin-top:16px; }',
      '.drawer-rejection-title { font-size:12px; font-weight:700; color:#c73e20; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; display:flex; align-items:center; gap:6px; }',
      '.drawer-rejection-title svg { width:14px; height:14px; }',
      '.drawer-rejection-text { font-size:13px; color:#374151; line-height:20px; }',
      '.drawer-timeline { display:flex; flex-direction:column; gap:0; margin:16px 0; }',
      '.drawer-timeline-item { display:flex; gap:12px; padding-bottom:16px; position:relative; }',
      '.drawer-timeline-item:last-child { padding-bottom:0; }',
      '.drawer-timeline-item::before { content:""; position:absolute; left:11px; top:26px; bottom:0; width:2px; background:#e5e7eb; }',
      '.drawer-timeline-item:last-child::before { display:none; }',
      '.drawer-timeline-dot { width:24px; height:24px; border-radius:50%; background:#f3f4f6; display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index:1; }',
      '.drawer-timeline-dot.active { background:#007167; }',
      '.drawer-timeline-dot.warning { background:#fff8e1; }',
      '.drawer-timeline-dot.danger { background:#fce8e6; }',
      '.drawer-timeline-dot svg { width:12px; height:12px; }',
      '.drawer-timeline-content { flex:1; padding-top:2px; }',
      '.drawer-timeline-title { font-size:13px; font-weight:600; color:#1f2937; }',
      '.drawer-timeline-desc { font-size:12px; color:#6b7280; margin-top:2px; }',
      '.drawer-timeline-date { font-size:11px; color:#9ca0a5; margin-top:2px; }',
      '.btn-resubmit { width:100%; height:44px; border-radius:999px; border:none; background:#007167; color:#fff; font-family:"Inter",sans-serif; font-size:14px; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:20px; transition:background 0.15s; }',
      '.btn-resubmit:hover { background:#005f57; }',
      '.btn-resubmit svg { width:16px; height:16px; }',
    ].join('\n');
    document.head.appendChild(buyerStyle);

    // ── 10c. Replace table with buyer order data (includes approval statuses) ──
    var sortSvg = '<svg class="sort-icon" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var table = document.querySelector('.orders-table');
    if (table) {
      var thead = table.querySelector('thead tr');
      if (thead) {
        thead.innerHTML =
          '<th>Order ' + sortSvg + '</th>' +
          '<th>Product ' + sortSvg + '</th>' +
          '<th>Placed On ' + sortSvg + '</th>' +
          '<th>Total ' + sortSvg + '</th>' +
          '<th>Approval ' + sortSvg + '</th>' +
          '<th>Approver ' + sortSvg + '</th>' +
          '<th>Actions</th>';
      }

      var tbody = table.querySelector('tbody');
      if (tbody) {
        var buyerOrders = [
          { id:'2800998-30', product:'LMZ60 spares', date:'Apr 28, 2026', total:'4.000,00 €', approval:'pending', approver:'Daniel Costa' },
          { id:'2800998-29', product:'NETZSCH CERABEADS 0.4 (x3)', date:'Apr 25, 2026', total:'119,25 €', approval:'pending', approver:'Daniel Costa' },
          { id:'2800998-28', product:'ZetaBeads Plus 0.3mm', date:'Apr 22, 2026', total:'850,00 €', approval:'pending', approver:'Ana Ferreira' },
          { id:'2800998-27', product:'Steel Beads Micro 0.1mm', date:'Apr 20, 2026', total:'1.200,00 €', approval:'approved', approver:'Daniel Costa', approvedDate:'Apr 21, 2026' },
          { id:'2800998-26', product:'O-Ring Set (517225)', date:'Apr 18, 2026', total:'340,00 €', approval:'approved', approver:'Daniel Costa', approvedDate:'Apr 18, 2026' },
          { id:'2800998-25', product:'Mastermix 45 spares', date:'Apr 15, 2026', total:'12.000,00 €', approval:'rejected', approver:'Daniel Costa', rejectedDate:'Apr 16, 2026', reason:'Budget limit exceeded for Q2. Please split into two orders under €8.000 or request budget extension from finance.' },
          { id:'2800998-24', product:'Inlet Flange Set', date:'Apr 12, 2026', total:'2.700,00 €', approval:'approved', approver:'Ana Ferreira', approvedDate:'Apr 13, 2026' },
          { id:'2800998-23', product:'Glass Beads 0.8mm (x5)', date:'Apr 10, 2026', total:'475,00 €', approval:'converted', approver:'Daniel Costa', approvedDate:'Apr 11, 2026', orderNum:'ORD-2026-7821' },
          { id:'2800998-22', product:'ProPhi spares', date:'Apr 5, 2026', total:'3.200,00 €', approval:'rejected', approver:'Ana Ferreira', rejectedDate:'Apr 6, 2026', reason:'Duplicate request — same items already ordered under 2800998-20. Please verify before resubmitting.' },
          { id:'2800998-21', product:'Ring - AISI 304', date:'Apr 2, 2026', total:'900,00 €', approval:'converted', approver:'Daniel Costa', approvedDate:'Apr 3, 2026', orderNum:'ORD-2026-7798' },
          { id:'2800998-20', product:'Zeta 60 spares', date:'Mar 28, 2026', total:'5.600,00 €', approval:'converted', approver:'Daniel Costa', approvedDate:'Mar 29, 2026', orderNum:'ORD-2026-7764' },
          { id:'2800998-19', product:'CERABEADS 0.6 (x10)', date:'Mar 25, 2026', total:'795,00 €', approval:'converted', approver:'Ana Ferreira', approvedDate:'Mar 26, 2026', orderNum:'ORD-2026-7750' },
        ];

        var approvalBadges = {
          pending: '<span class="status-badge status-pending-approval">Pending Approval</span>',
          approved: '<span class="status-badge status-approved">Approved</span>',
          rejected: '<span class="status-badge status-rejected">Rejected</span>',
          converted: '<span class="status-badge status-converted">Converted to Order</span>'
        };

        tbody.innerHTML = buyerOrders.map(function (o) {
          var approverCell = '<span style="color:#374151;">' + o.approver + '</span>';
          if (o.approval === 'approved' || o.approval === 'converted') {
            approverCell += '<br><span style="font-size:11px;color:#6b7280;">' + (o.approvedDate || '') + '</span>';
          }
          if (o.approval === 'rejected') {
            approverCell += '<br><span style="font-size:11px;color:#c73e20;">' + (o.rejectedDate || '') + '</span>';
          }

          return '<tr>' +
            '<td><a class="order-link" href="order-detail.html">' + o.id + '</a></td>' +
            '<td>' + o.product + '</td>' +
            '<td>' + o.date + '</td>' +
            '<td>' + o.total + '</td>' +
            '<td>' + (approvalBadges[o.approval] || o.approval) + '</td>' +
            '<td>' + approverCell + '</td>' +
            '<td><div class="actions-cell">' +
              '<button class="action-btn" title="View details"><img src="../assets/icon-order-eye.svg" alt="View"></button>' +
              '<button class="action-btn" title="Download"><img src="../assets/icon-order-download.svg" alt="Download"></button>' +
            '</div></td>' +
            '</tr>';
        }).join('');
      }

      // Update pagination text
      var pagInfo = document.querySelector('.pagination-info');
      if (pagInfo) pagInfo.textContent = 'Showing 1–12 of 12 orders';
    }

    // ── 10d. Wire drawer with approval details for buyer ──
    var drawerBody = document.querySelector('.drawer-body');
    var drawerEl = document.getElementById('trackingDrawer');
    var overlayEl = document.getElementById('drawerOverlay');
    var drawerTitle = document.querySelector('.drawer-title');

    if (drawerBody && drawerEl && overlayEl) {
      if (drawerTitle) drawerTitle.textContent = 'Order Details';

      var buyerOrdersData = [
        { id:'2800998-30', product:'LMZ60 spares', items:[{name:'LMZ60 Grinding Chamber Set', ref:'GC-LMZ60', qty:'1 pc'}], date:'Apr 28, 2026', total:'4.000,00 €', approval:'pending', approver:'Daniel Costa', approverRole:'Procurement Manager',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order for approval.', date:'Apr 28, 2026 — 09:15', status:'done'},
            {title:'Pending Approval', desc:'Waiting for Daniel Costa to review.', date:'Estimated: Apr 29, 2026', status:'current'}
          ]
        },
        { id:'2800998-29', product:'NETZSCH CERABEADS 0.4 (x3)', items:[{name:'NETZSCH CERABEADS 0.4', ref:'443385', qty:'3 kg'}], date:'Apr 25, 2026', total:'119,25 €', approval:'pending', approver:'Daniel Costa', approverRole:'Procurement Manager',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order for approval.', date:'Apr 25, 2026 — 14:30', status:'done'},
            {title:'Pending Approval', desc:'Waiting for Daniel Costa to review.', date:'Estimated: Apr 28, 2026', status:'current'}
          ]
        },
        { id:'2800998-28', product:'ZetaBeads Plus 0.3mm', items:[{name:'ZetaBeads Plus 0.3mm', ref:'ZB-030P', qty:'2 kg'}], date:'Apr 22, 2026', total:'850,00 €', approval:'pending', approver:'Ana Ferreira', approverRole:'Finance Director',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order for approval.', date:'Apr 22, 2026 — 11:00', status:'done'},
            {title:'Pending Approval', desc:'Waiting for Ana Ferreira to review.', date:'Estimated: Apr 25, 2026', status:'current'}
          ]
        },
        { id:'2800998-27', product:'Steel Beads Micro 0.1mm', items:[{name:'Steel Beads Micro 0.1mm', ref:'SB-010M', qty:'5 kg'}], date:'Apr 20, 2026', total:'1.200,00 €', approval:'approved', approver:'Daniel Costa', approverRole:'Procurement Manager', approvedDate:'Apr 21, 2026',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order for approval.', date:'Apr 20, 2026 — 10:00', status:'done'},
            {title:'Approved', desc:'Daniel Costa approved this order.', date:'Apr 21, 2026 — 08:45', status:'done'},
            {title:'Processing', desc:'Order converted and being processed.', date:'Apr 21, 2026 — 09:00', status:'current'}
          ]
        },
        { id:'2800998-26', product:'O-Ring Set (517225)', items:[{name:'O-Ring (517225)', ref:'517225', qty:'2 pcs'}], date:'Apr 18, 2026', total:'340,00 €', approval:'approved', approver:'Daniel Costa', approverRole:'Procurement Manager', approvedDate:'Apr 18, 2026',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Apr 18, 2026 — 08:30', status:'done'},
            {title:'Approved', desc:'Daniel Costa approved this order.', date:'Apr 18, 2026 — 11:20', status:'done'},
            {title:'Processing', desc:'Order converted and being processed.', date:'Apr 18, 2026 — 11:30', status:'current'}
          ]
        },
        { id:'2800998-25', product:'Mastermix 45 spares', items:[{name:'Mastermix 45 Full Spare Kit', ref:'MX45-KIT', qty:'1 set'}], date:'Apr 15, 2026', total:'12.000,00 €', approval:'rejected', approver:'Daniel Costa', approverRole:'Procurement Manager', rejectedDate:'Apr 16, 2026',
          reason:'Budget limit exceeded for Q2. Please split into two orders under €8.000 or request budget extension from finance.',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order for approval.', date:'Apr 15, 2026 — 09:00', status:'done'},
            {title:'Rejected', desc:'Daniel Costa rejected this order.', date:'Apr 16, 2026 — 14:10', status:'rejected'}
          ]
        },
        { id:'2800998-24', product:'Inlet Flange Set', items:[{name:'Inlet Flange Set', ref:'FL-2200', qty:'1 pc'}], date:'Apr 12, 2026', total:'2.700,00 €', approval:'approved', approver:'Ana Ferreira', approverRole:'Finance Director', approvedDate:'Apr 13, 2026',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Apr 12, 2026 — 16:00', status:'done'},
            {title:'Approved', desc:'Ana Ferreira approved this order.', date:'Apr 13, 2026 — 09:30', status:'done'},
            {title:'Processing', desc:'Being prepared for shipment.', date:'Apr 13, 2026 — 10:00', status:'current'}
          ]
        },
        { id:'2800998-23', product:'Glass Beads 0.8mm (x5)', items:[{name:'Glass Beads 0.8mm', ref:'GB-080', qty:'5 kg'}], date:'Apr 10, 2026', total:'475,00 €', approval:'converted', approver:'Daniel Costa', approverRole:'Procurement Manager', approvedDate:'Apr 11, 2026', orderNum:'ORD-2026-7821',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Apr 10, 2026 — 11:15', status:'done'},
            {title:'Approved', desc:'Daniel Costa approved this order.', date:'Apr 11, 2026 — 08:00', status:'done'},
            {title:'Converted to Order', desc:'Now tracked as ORD-2026-7821.', date:'Apr 11, 2026 — 08:15', status:'done'}
          ]
        },
        { id:'2800998-22', product:'ProPhi spares', items:[{name:'ProPhi Maintenance Kit', ref:'PP-MK01', qty:'1 set'}], date:'Apr 5, 2026', total:'3.200,00 €', approval:'rejected', approver:'Ana Ferreira', approverRole:'Finance Director', rejectedDate:'Apr 6, 2026',
          reason:'Duplicate request — same items already ordered under 2800998-20. Please verify before resubmitting.',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Apr 5, 2026 — 13:40', status:'done'},
            {title:'Rejected', desc:'Ana Ferreira rejected this order.', date:'Apr 6, 2026 — 10:15', status:'rejected'}
          ]
        },
        { id:'2800998-21', product:'Ring - AISI 304', items:[{name:'Ring - AISI 304', ref:'509812', qty:'2 pcs'}], date:'Apr 2, 2026', total:'900,00 €', approval:'converted', approver:'Daniel Costa', approverRole:'Procurement Manager', approvedDate:'Apr 3, 2026', orderNum:'ORD-2026-7798',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Apr 2, 2026 — 09:00', status:'done'},
            {title:'Approved', desc:'Daniel Costa approved this order.', date:'Apr 3, 2026 — 07:45', status:'done'},
            {title:'Converted to Order', desc:'Now tracked as ORD-2026-7798.', date:'Apr 3, 2026 — 08:00', status:'done'}
          ]
        },
        { id:'2800998-20', product:'Zeta 60 spares', items:[{name:'Zeta 60 Wear Parts Kit', ref:'Z60-WPK', qty:'1 set'}], date:'Mar 28, 2026', total:'5.600,00 €', approval:'converted', approver:'Daniel Costa', approverRole:'Procurement Manager', approvedDate:'Mar 29, 2026', orderNum:'ORD-2026-7764',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Mar 28, 2026 — 10:30', status:'done'},
            {title:'Approved', desc:'Daniel Costa approved.', date:'Mar 29, 2026 — 09:00', status:'done'},
            {title:'Converted to Order', desc:'Now tracked as ORD-2026-7764.', date:'Mar 29, 2026 — 09:15', status:'done'}
          ]
        },
        { id:'2800998-19', product:'CERABEADS 0.6 (x10)', items:[{name:'NETZSCH CERABEADS 0.6', ref:'443386', qty:'10 kg'}], date:'Mar 25, 2026', total:'795,00 €', approval:'converted', approver:'Ana Ferreira', approverRole:'Finance Director', approvedDate:'Mar 26, 2026', orderNum:'ORD-2026-7750',
          timeline:[
            {title:'Order Submitted', desc:'You submitted this order.', date:'Mar 25, 2026 — 14:00', status:'done'},
            {title:'Approved', desc:'Ana Ferreira approved.', date:'Mar 26, 2026 — 11:00', status:'done'},
            {title:'Converted to Order', desc:'Now tracked as ORD-2026-7750.', date:'Mar 26, 2026 — 11:20', status:'done'}
          ]
        }
      ];

      var badgeMap = {
        pending:   '<span class="drawer-approval-badge status-pending-approval"><svg viewBox="0 0 16 16" fill="none"><path d="M8 4v4l2.5 2.5M14 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Pending Approval</span>',
        approved:  '<span class="drawer-approval-badge status-approved"><svg viewBox="0 0 16 16" fill="none"><path d="M4.5 8.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Approved</span>',
        rejected:  '<span class="drawer-approval-badge status-rejected"><svg viewBox="0 0 16 16" fill="none"><path d="M5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Rejected</span>',
        converted: '<span class="drawer-approval-badge status-converted"><svg viewBox="0 0 16 16" fill="none"><path d="M4.5 8.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Converted to Order</span>'
      };

      function openBuyerDrawer(index) {
        var o = buyerOrdersData[index];
        if (!o) return;

        var html = '';

        // Order ID + date
        html += '<div class="drawer-order-id" style="margin-bottom:4px;">' + o.id + '</div>';
        html += '<div style="font-size:13px;color:#6b6e73;margin-bottom:16px;">Submitted on ' + o.date + '</div>';

        // Approval badge
        html += '<div class="drawer-approval-status">' + (badgeMap[o.approval] || '') + '</div>';

        // Info grid
        html += '<div class="drawer-info-grid">';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Total</span><span class="drawer-info-value">' + o.total + '</span></div>';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Approver</span><span class="drawer-info-value">' + o.approver + '</span></div>';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Product</span><span class="drawer-info-value">' + o.product + '</span></div>';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Role</span><span class="drawer-info-value">' + o.approverRole + '</span></div>';
        html += '</div>';

        // Converted order reference
        if (o.approval === 'converted' && o.orderNum) {
          html += '<div style="background:#e8f5f3;border:1px solid #d0ebe7;border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">';
          html += '  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007167" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
          html += '  <div><span style="font-size:12px;color:#007167;font-weight:600;">Converted to Purchase Order</span><br><a href="order-detail.html" style="font-size:14px;color:#007167;font-weight:700;text-decoration:none;">' + o.orderNum + '</a></div>';
          html += '</div>';
        }

        // Rejection reason
        if (o.approval === 'rejected' && o.reason) {
          html += '<div class="drawer-rejection">';
          html += '  <div class="drawer-rejection-title"><svg viewBox="0 0 16 16" fill="none"><path d="M8 5v3m0 3h.01M14 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Reason for Rejection</div>';
          html += '  <div class="drawer-rejection-text">' + o.reason + '</div>';
          html += '</div>';
        }

        html += '<hr class="drawer-divider" style="margin-top:20px;">';

        // Timeline
        html += '<div class="drawer-items-title">Approval Timeline</div>';
        html += '<div class="drawer-timeline">';
        o.timeline.forEach(function (step) {
          var dotClass = 'drawer-timeline-dot';
          var dotIcon = '';
          if (step.status === 'done') {
            dotClass += ' active';
            dotIcon = '<svg viewBox="0 0 12 12" fill="none"><path d="M3 6.5l2 2 4-4" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          } else if (step.status === 'current') {
            dotClass += ' warning';
            dotIcon = '<svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="3" fill="#b8860b"/></svg>';
          } else if (step.status === 'rejected') {
            dotClass += ' danger';
            dotIcon = '<svg viewBox="0 0 12 12" fill="none"><path d="M4 4l4 4m0-4l-4 4" stroke="#c73e20" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          }

          html += '<div class="drawer-timeline-item">';
          html += '  <div class="' + dotClass + '">' + dotIcon + '</div>';
          html += '  <div class="drawer-timeline-content">';
          html += '    <div class="drawer-timeline-title">' + step.title + '</div>';
          html += '    <div class="drawer-timeline-desc">' + step.desc + '</div>';
          html += '    <div class="drawer-timeline-date">' + step.date + '</div>';
          html += '  </div>';
          html += '</div>';
        });
        html += '</div>';

        // Items
        html += '<hr class="drawer-divider">';
        html += '<div class="drawer-items-title">Items</div>';
        o.items.forEach(function (item) {
          html += '<div class="drawer-item-row">';
          html += '  <div class="drawer-item-info"><div class="drawer-item-name">' + item.name + '</div><div class="drawer-item-meta">Ref: ' + item.ref + '</div></div>';
          html += '  <div class="drawer-item-qty">' + item.qty + '</div>';
          html += '</div>';
        });

        // CTA for rejected
        if (o.approval === 'rejected') {
          html += '<button class="btn-resubmit" onclick="window.location.href=\'checkout-cart.html\'">';
          html += '  <svg viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 0110.3-4.2M14 8a6 6 0 01-10.3 4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2v2.5h-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v-2.5h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          html += '  Edit &amp; Resubmit';
          html += '</button>';
        }

        // CTA for approved/converted — Reorder
        if (o.approval === 'approved' || o.approval === 'converted') {
          html += '<button class="btn-resubmit" data-reorder="' + index + '" style="background:#007167;">';
          html += '  <svg viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 0110.3-4.2M14 8a6 6 0 01-10.3 4.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 2v2.5h-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v-2.5h2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          html += '  Reorder';
          html += '</button>';
        }

        drawerBody.innerHTML = html;
        overlayEl.classList.add('show');
        drawerEl.classList.add('show');
      }

      function closeBuyerDrawer() {
        overlayEl.classList.remove('show');
        drawerEl.classList.remove('show');
      }

      // Close handlers
      var closeBtn = document.querySelector('.drawer-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeBuyerDrawer);
      }
      overlayEl.addEventListener('click', closeBuyerDrawer);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawerEl.classList.contains('show')) closeBuyerDrawer();
      });

      // Wire view buttons
      document.querySelectorAll('.action-btn[title="View details"]').forEach(function (btn, i) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          openBuyerDrawer(i);
        });
      });

      // Wire order ID links
      document.querySelectorAll('.order-link').forEach(function (link, i) {
        link.href = '#';
        link.addEventListener('click', function (e) {
          e.preventDefault();
          openBuyerDrawer(i);
        });
      });

      // Wire Reorder buttons inside drawer (event delegation)
      drawerBody.addEventListener('click', function (e) {
        var reorderBtn = e.target.closest('[data-reorder]');
        if (!reorderBtn) return;
        var idx = parseInt(reorderBtn.dataset.reorder);
        var o = buyerOrdersData[idx];
        if (!o) return;

        // Parse unit price from total / qty approximation
        function parseEur(text) {
          var clean = text.replace(/[^\d,]/g, '').replace('.', '').replace(',', '.');
          return parseFloat(clean) || 0;
        }

        var cart;
        try { cart = JSON.parse(localStorage.getItem('netzsch_cart') || '{}'); } catch(ex) { cart = {}; }
        var cartItems = cart.items || [];

        o.items.forEach(function (item) {
          var qty = parseInt(item.qty) || 1;
          var totalPrice = parseEur(o.total);
          var unitPrice = o.items.length === 1 ? totalPrice / qty : totalPrice;

          var existing = cartItems.find(function (c) { return c.ref === item.ref; });
          if (existing) {
            existing.qty += qty;
          } else {
            cartItems.push({ name: item.name, ref: item.ref, qty: qty, unitPrice: unitPrice, img: '' });
          }
        });

        cart.items = cartItems;
        localStorage.setItem('netzsch_cart', JSON.stringify(cart));

        // Update cart badge
        var badge = document.getElementById('cart-badge');
        if (badge) {
          var total = cartItems.reduce(function (s, i) { return s + i.qty; }, 0);
          badge.textContent = total;
          badge.classList.add('is-visible');
        }

        // Visual feedback on button
        reorderBtn.textContent = 'Added to cart';
        reorderBtn.style.background = '#2e7d32';
        reorderBtn.disabled = true;

        // Close drawer after short delay and navigate to cart
        setTimeout(function () {
          closeBuyerDrawer();
          window.location.href = 'checkout-cart.html';
        }, 800);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 11. BUYER — Transform Order Detail page with approval info
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'buyer' && currentPage === 'order-detail.html') {

    // Inject buyer styles for order detail
    var buyerDetailStyle = document.createElement('style');
    buyerDetailStyle.textContent = [
      '.approval-card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:24px; margin-bottom:16px; }',
      '.approval-card-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }',
      '.approval-card-title { font-size:16px; font-weight:700; color:#1f2937; }',
      '.approval-card-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:999px; font-size:13px; font-weight:600; }',
      '.approval-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }',
      '.approval-info-item { display:flex; flex-direction:column; gap:4px; }',
      '.approval-info-label { font-size:12px; font-weight:700; color:#9ca0a5; text-transform:uppercase; letter-spacing:0.5px; }',
      '.approval-info-value { font-size:14px; color:#2d2e33; font-weight:500; line-height:20px; }',
      '.approval-note { margin-top:20px; background:#f8f9fa; border-radius:10px; padding:16px; }',
      '.approval-note-label { font-size:12px; font-weight:700; color:#9ca0a5; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px; }',
      '.approval-note-text { font-size:14px; color:#374151; line-height:22px; }',
      '.status-pending-approval { background:#fff8e1; color:#b8860b; }',
      '.status-approved-detail { background:#e8f5e9; color:#2e7d32; }',
    ].join('\n');
    document.head.appendChild(buyerDetailStyle);

    // Activate the "Pending Approval" step in the progress bar
    var progressSteps = document.querySelectorAll('.progress-step');
    if (progressSteps.length >= 2) {
      // First step is already active ("Received"), activate second too
      progressSteps[0].classList.add('active');
      progressSteps[1].classList.add('active');
    }

    // Insert Approval Status card before the two-col layout
    var twoCol = document.querySelector('.two-col');
    if (twoCol) {
      var approvalCard = document.createElement('div');
      approvalCard.className = 'approval-card';
      approvalCard.innerHTML = [
        '<div class="approval-card-header">',
        '  <span class="approval-card-title">Approval Status</span>',
        '  <span class="approval-card-badge status-pending-approval">',
        '    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 4v4l2.5 2.5M14 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '    Pending Approval',
        '  </span>',
        '</div>',
        '<div class="approval-info-grid">',
        '  <div class="approval-info-item">',
        '    <span class="approval-info-label">Assigned Approver</span>',
        '    <span class="approval-info-value">Daniel Costa</span>',
        '  </div>',
        '  <div class="approval-info-item">',
        '    <span class="approval-info-label">Role</span>',
        '    <span class="approval-info-value">Procurement Manager</span>',
        '  </div>',
        '  <div class="approval-info-item">',
        '    <span class="approval-info-label">Submitted On</span>',
        '    <span class="approval-info-value">Apr 28, 2026 — 09:15</span>',
        '  </div>',
        '  <div class="approval-info-item">',
        '    <span class="approval-info-label">Expected Response</span>',
        '    <span class="approval-info-value">Apr 29, 2026</span>',
        '  </div>',
        '</div>',
        '<div class="approval-note">',
        '  <div class="approval-note-label">Your Note to Approver</div>',
        '  <div class="approval-note-text">Replacement parts for LMZ60 — scheduled maintenance next week. Priority: normal.</div>',
        '</div>'
      ].join('\n');

      twoCol.parentNode.insertBefore(approvalCard, twoCol);
    }

    // Update back link and breadcrumb text
    var backLink = document.querySelector('.back-link');
    if (backLink) backLink.setAttribute('href', 'orders.html');
  }

  // ══════════════════════════════════════════════════════════════════════
  // 12. BUYER — Personalized Dashboard
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'buyer' && currentPage === 'dashboard.html') {

    // ── 12a. Inject buyer dashboard styles ──
    var buyerDashStyle = document.createElement('style');
    buyerDashStyle.textContent = [
      '.status-pending-approval{background:#fff8e1;color:#b8860b;}',
      '.status-approved{background:#e8f5e9;color:#2e7d32;}',
      '.status-rejected{background:#fce8e6;color:#c73e20;}',
      '.status-converted{background:#e8f5f3;color:#007167;}',
      /* Approval summary card */
      '.approval-summary{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px 24px;display:flex;align-items:center;gap:20px;margin-bottom:0;}',
      '.approval-summary-icon{width:48px;height:48px;border-radius:50%;background:#fff8e1;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.approval-summary-icon svg{width:24px;height:24px;color:#b8860b;}',
      '.approval-summary-content{flex:1;}',
      '.approval-summary-title{font-size:15px;font-weight:600;color:#1f2937;margin-bottom:2px;}',
      '.approval-summary-desc{font-size:13px;color:#6b7280;line-height:20px;}',
      '.approval-summary-link{font-size:13px;font-weight:600;color:#007167;text-decoration:none;flex-shrink:0;display:flex;align-items:center;gap:4px;}',
      '.approval-summary-link:hover{text-decoration:underline;}',
      '.approval-summary-link svg{width:14px;height:14px;}',
      /* Middle row override — 3 columns */
      '.middle-row{grid-template-columns:1fr 300px 300px !important;}',
      /* Reorder card inside insights */
      '.insight-reorder-card{background:#f0faf9;border:1px solid #d0ebe7;border-radius:10px;padding:12px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;}',
      '.insight-reorder-icon{width:34px;height:34px;border-radius:50%;background:#007167;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.insight-reorder-body{flex:1;min-width:0;}',
      '.insight-reorder-title{font-size:13px;font-weight:600;color:#1f2937;}',
      '.insight-reorder-desc{font-size:11px;color:#6b7280;line-height:16px;}',
      '.insight-reorder-btn{background:#007167;color:#fff;border:none;border-radius:999px;padding:6px 14px;font-family:Inter,sans-serif;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background 0.15s;}',
      '.insight-reorder-btn:hover{background:#005f57;}',
      /* Spending card */
      '.spending-card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:20px;}',
      '.spending-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}',
      '.spending-title{font-size:14px;font-weight:700;color:#1f2937;}',
      '.spending-period{font-size:11px;color:#9ca0a5;font-weight:500;}',
      '.spending-total{font-size:24px;font-weight:700;color:#1f2937;margin-bottom:2px;letter-spacing:-0.5px;}',
      '.spending-label{font-size:11px;color:#6b7280;margin-bottom:14px;}',
      '.spending-bar-wrap{height:8px;background:#f3f4f6;border-radius:999px;overflow:hidden;margin-bottom:14px;}',
      '.spending-bar{height:100%;background:#007167;border-radius:999px;transition:width 0.6s cubic-bezier(0.32,0.72,0,1);}',
      '.spending-breakdown{display:flex;flex-direction:column;gap:10px;}',
      '.spending-item{display:flex;align-items:center;justify-content:space-between;}',
      '.spending-item-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;}',
      '.spending-item-label{font-size:12px;color:#6b7280;display:flex;align-items:center;}',
      '.spending-item-value{font-size:13px;font-weight:600;color:#1f2937;}',
      '.spending-view-all{display:inline-flex;align-items:center;gap:4px;margin-top:14px;font-size:12px;font-weight:600;color:#007167;text-decoration:none;}',
      '.spending-view-all:hover{text-decoration:underline;}',
    ].join('\n');
    document.head.appendChild(buyerDashStyle);

    // ── 12b. Welcome banner — change name ──
    var welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      var hour = new Date().getHours();
      var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      welcomeTitle.textContent = greeting + ', Sarah';
    }

    // ── 12c. Replace stat cards with buyer-centric metrics ──
    var statCards = document.querySelector('.stat-cards');
    if (statCards) {
      statCards.innerHTML = [
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#fff8e1;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#b8860b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">3</div><div class="stat-label">Pending Approval</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#e8f5e9;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">7</div><div class="stat-label">Approved</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">12</div><div class="stat-label">Total Orders</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">4</div><div class="stat-label">Wishlist Items</div></div>',
        '</div>',
      ].join('\n');
    }

    // ── 12d. Replace AI Insights content with buyer-relevant insights ──
    var insightCardTitle = document.querySelector('.middle-row .card-header .card-title');
    if (insightCardTitle) insightCardTitle.textContent = 'Buyer Insights';
    var insightIcon = document.querySelector('.middle-row .card-header img');
    if (insightIcon) insightIcon.style.display = 'none';

    var insightList = document.querySelector('.insight-list');
    if (insightList) {
      insightList.innerHTML = [
        // 1. Reorder card (highlighted)
        '<div class="insight-reorder-card">',
        '  <div class="insight-reorder-icon">',
        '    <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M3.33 10a6.67 6.67 0 0111.44-4.71M16.67 10a6.67 6.67 0 01-11.44 4.71" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.17 2.5v3.33h-3.34" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.83 17.5v-3.33h3.34" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '  </div>',
        '  <div class="insight-reorder-body">',
        '    <div class="insight-reorder-title">Steel Beads Micro 0.1mm</div>',
        '    <div class="insight-reorder-desc">5 kg — last ordered 17 days ago (usual cycle: 20 days)</div>',
        '  </div>',
        '  <button class="insight-reorder-btn" id="btnInsightReorder">Reorder</button>',
        '</div>',
        // 2. Reorder card 2
        '<div class="insight-reorder-card">',
        '  <div class="insight-reorder-icon">',
        '    <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M3.33 10a6.67 6.67 0 0111.44-4.71M16.67 10a6.67 6.67 0 01-11.44 4.71" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.17 2.5v3.33h-3.34" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.83 17.5v-3.33h3.34" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        '  </div>',
        '  <div class="insight-reorder-body">',
        '    <div class="insight-reorder-title">CERABEADS 0.4mm</div>',
        '    <div class="insight-reorder-desc">3 pcs — last ordered 25 days ago (usual cycle: 30 days)</div>',
        '  </div>',
        '  <button class="insight-reorder-btn" id="btnInsightReorder2">Reorder</button>',
        '</div>',
        // 3. Approval alert
        '<div class="insight-item">',
        '  <div class="insight-dot yellow"></div>',
        '  <div class="insight-body">',
        '    <div class="insight-label"><span class="insight-label-text">Pending Approvals</span></div>',
        '    <div class="insight-text">3 orders awaiting approval. Most recent (#2800998-30) is being reviewed by Daniel Costa.</div>',
        '  </div>',
        '  <button class="btn-insight" onclick="window.location.href=\'orders.html\'">View Orders <img src="../assets/icon-arrow-right.svg" alt=""></button>',
        '</div>',
        // 3. Budget alert — link to budget page
        '<div class="insight-item">',
        '  <div class="insight-dot red"></div>',
        '  <div class="insight-body">',
        '    <div class="insight-label"><span class="insight-label-text">Monthly Budget</span></div>',
        '    <div class="insight-text">61% of budget used (24.279,25 € of 40.000,00 €). Spare Parts: 60%.</div>',
        '  </div>',
        '  <button class="btn-insight" onclick="window.location.href=\'budget.html\'">View Budget <img src="../assets/icon-arrow-right.svg" alt=""></button>',
        '</div>',
      ].join('\n');

      // Wire Reorder button in insight card
      var insightReorder = document.getElementById('btnInsightReorder');
      if (insightReorder) {
        insightReorder.addEventListener('click', function () {
          var cart;
          try { cart = JSON.parse(localStorage.getItem('netzsch_cart') || '{}'); } catch(ex) { cart = {}; }
          var cartItems = cart.items || [];
          var existing = cartItems.find(function (c) { return c.ref === 'SB-010M'; });
          if (existing) { existing.qty += 5; } else {
            cartItems.push({ name: 'Steel Beads Micro 0.1mm', ref: 'SB-010M', qty: 5, unitPrice: 240, img: '' });
          }
          cart.items = cartItems;
          localStorage.setItem('netzsch_cart', JSON.stringify(cart));
          insightReorder.textContent = 'Added!';
          insightReorder.style.background = '#2e7d32';
          var badge = document.getElementById('cart-badge');
          if (badge) {
            var total = cartItems.reduce(function (s, i) { return s + i.qty; }, 0);
            badge.textContent = total;
            badge.classList.add('is-visible');
          }
          setTimeout(function () { window.location.href = 'checkout-cart.html'; }, 800);
        });
      }

      // Wire 2nd Reorder button
      var insightReorder2 = document.getElementById('btnInsightReorder2');
      if (insightReorder2) {
        insightReorder2.addEventListener('click', function () {
          var cart;
          try { cart = JSON.parse(localStorage.getItem('netzsch_cart') || '{}'); } catch(ex) { cart = {}; }
          var cartItems = cart.items || [];
          var existing = cartItems.find(function (c) { return c.ref === 'CB-04'; });
          if (existing) { existing.qty += 3; } else {
            cartItems.push({ name: 'CERABEADS 0.4mm', ref: 'CB-04', qty: 3, unitPrice: 39.75, img: '' });
          }
          cart.items = cartItems;
          localStorage.setItem('netzsch_cart', JSON.stringify(cart));
          insightReorder2.textContent = 'Added!';
          insightReorder2.style.background = '#2e7d32';
          var badge = document.getElementById('cart-badge');
          if (badge) {
            var total = cartItems.reduce(function (s, i) { return s + i.qty; }, 0);
            badge.textContent = total;
            badge.classList.add('is-visible');
          }
          setTimeout(function () { window.location.href = 'checkout-cart.html'; }, 800);
        });
      }
    }

    // ── 12e. Inject Spending Card inside middle-row (2nd column) ──
    (function injectSpendingCard() {
      var middleRow = document.querySelector('.middle-row');
      if (!middleRow) return;
      var quickActionsCard = middleRow.querySelector('.card:last-child');
      if (!quickActionsCard) return;

      var spendCard = document.createElement('div');
      spendCard.className = 'spending-card';
      spendCard.setAttribute('role', 'region');
      spendCard.setAttribute('aria-label', 'Monthly spending overview');
      spendCard.innerHTML = [
        '<div class="spending-header">',
        '  <span class="spending-title">Monthly Spending</span>',
        '  <span class="spending-period">May 2026</span>',
        '</div>',
        '<div class="spending-total">16.967,55 €</div>',
        '<div class="spending-label">of 40.000,00 € budget (42%)</div>',
        '<div class="spending-bar-wrap" role="progressbar" aria-valuenow="42" aria-valuemin="0" aria-valuemax="100" aria-label="Budget usage 42%">',
        '  <div class="spending-bar" style="width:0%;"></div>',
        '</div>',
        '<div class="spending-breakdown">',
        '  <div class="spending-item">',
        '    <span class="spending-item-label"><span class="spending-item-dot" style="background:#007167;"></span>Spare Parts</span>',
        '    <span class="spending-item-value">14.567,55 €</span>',
        '  </div>',
        '  <div class="spending-item">',
        '    <span class="spending-item-label"><span class="spending-item-dot" style="background:#8b8e91;"></span>Services</span>',
        '    <span class="spending-item-value">2.400,00 €</span>',
        '  </div>',
        '</div>',
        '<a href="budget.html" class="spending-view-all">View Budget <svg viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>',
      ].join('\n');

      // Insert as 2nd child of middle-row (between Insights and Quick Actions)
      middleRow.insertBefore(spendCard, quickActionsCard);

      // Animate bar after paint
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var bar = spendCard.querySelector('.spending-bar');
          if (bar) bar.style.width = '42%';
        });
      });
    })();

    // ── 12f. Replace Recent Orders table with approval-centric data ──
    // (was 12e before spending card insertion)
    var ordersHeader = document.querySelector('.orders-header');
    if (ordersHeader) {
      ordersHeader.querySelector('.card-title').textContent = 'Recent Orders';
      var viewAllBtn = ordersHeader.querySelector('.btn-view-all');
      if (viewAllBtn) {
        viewAllBtn.onclick = function () { window.location.href = 'orders.html'; };
      }
    }

    var ordersTable = document.querySelector('.orders-table');
    if (ordersTable) {
      var thead = ordersTable.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = '<th>Order #</th><th>Product</th><th>Date</th><th>Total</th><th>Approval</th><th>Approver</th>';
      }

      var tbody = ordersTable.querySelector('tbody');
      if (tbody) {
        var recentOrders = [
          { id:'2800998-30', product:'LMZ60 spares', date:'Apr 28, 2026', total:'4.000,00 €', status:'pending', statusLabel:'Pending Approval', approver:'Daniel Costa' },
          { id:'2800998-29', product:'CERABEADS 0.4 (x3)', date:'Apr 25, 2026', total:'119,25 €', status:'pending', statusLabel:'Pending Approval', approver:'Daniel Costa' },
          { id:'2800998-28', product:'ZetaBeads Plus 0.3mm', date:'Apr 22, 2026', total:'850,00 €', status:'pending', statusLabel:'Pending Approval', approver:'Ana Ferreira' },
          { id:'2800998-27', product:'Steel Beads Micro', date:'Apr 20, 2026', total:'1.200,00 €', status:'approved', statusLabel:'Approved', approver:'Daniel Costa' },
          { id:'2800998-25', product:'Mastermix 45 spares', date:'Apr 15, 2026', total:'12.000,00 €', status:'rejected', statusLabel:'Rejected', approver:'Daniel Costa' },
        ];

        var statusClasses = {
          pending: 'status-pending-approval',
          approved: 'status-approved',
          rejected: 'status-rejected',
          converted: 'status-converted'
        };

        tbody.innerHTML = recentOrders.map(function (o) {
          return '<tr>' +
            '<td><a class="order-link" href="orders.html">' + o.id + '</a></td>' +
            '<td>' + o.product + '</td>' +
            '<td><span class="order-date"><img src="../assets/icon-package.svg" alt="">' + o.date + '</span></td>' +
            '<td>' + o.total + '</td>' +
            '<td><span class="status-badge ' + statusClasses[o.status] + '">' + o.statusLabel + '</span></td>' +
            '<td>' + o.approver + '</td>' +
            '</tr>';
        }).join('');
      }
    }

    // ── 12g. Quick Actions — reorder card + buyer actions ──
    var quickActionsCard = document.querySelector('.middle-row .card:last-child');
    if (quickActionsCard) {
      quickActionsCard.innerHTML = [
        '<div class="card-header">',
        '  <span class="card-title">Quick Actions</span>',
        '</div>',
        '<div class="quick-actions-list">',
        '  <button class="btn-quick-action" onclick="window.location.href=\'shop.html\'">Browse Shop</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'orders.html\'">My Orders</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'quotes.html\'">Request Quote</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'wishlist.html\'">My Wishlist</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'budget.html\'">View Budget</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'help.html\'">Contact Support</button>',
        '</div>',
      ].join('\n');
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 13. BUYER — Notification dropdown customization (all pages)
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'buyer') {
    var notifList = document.querySelector('.notif-list');
    var notifBadge = document.querySelector('.notif-badge');
    var notifCountBadge = document.querySelector('.notif-count-badge');
    var notifViewAll = document.querySelector('.notif-view-all');

    if (notifList) {
      // Add approval icon style
      var approvalStyle = document.createElement('style');
      approvalStyle.textContent = '.notif-item-icon.approval{background:#e8f5e9;} .notif-item-icon.rejection{background:#fce8e6;}';
      document.head.appendChild(approvalStyle);

      notifList.innerHTML = [
        // 1. Order approved (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon approval"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">Order #2800998-27 approved</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">Daniel Costa approved your order — Steel Beads Micro (1.200,00 €)</div>',
        '    <div class="notif-item-time">20 min ago</div>',
        '    <a href="orders.html" class="notif-item-action">View Order</a>',
        '  </div>',
        '</div>',
        // 2. Order rejected (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon rejection"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">Order #2800998-25 rejected</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">Daniel Costa rejected your order — &quot;Exceeds Q2 budget limit for spare parts&quot;</div>',
        '    <div class="notif-item-time">2 hours ago</div>',
        '    <a href="orders.html" class="notif-item-action">Edit &amp; Resubmit</a>',
        '  </div>',
        '</div>',
        // 3. Order shipped (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon order"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">Order #2800998-24 shipped</span>',
        '    <div class="notif-item-desc">Your order has been dispatched — tracking available.</div>',
        '    <div class="notif-item-time">1 day ago</div>',
        '  </div>',
        '</div>',
        // 4. Quote ready for review (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon quote"><img src="../assets/icon-notif-quote.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">Quote #QT-2026-0041 ready for review</span>',
        '    <div class="notif-item-desc">Spare parts for Alpha Zeta 10 — 12.450,00 €</div>',
        '    <div class="notif-item-time">2 days ago</div>',
        '  </div>',
        '</div>',
        // 5. Approval reminder (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon approval"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">Reminder: 3 orders pending approval</span>',
        '    <div class="notif-item-desc">Orders #2800998-28, #29, #30 are awaiting approver review.</div>',
        '    <div class="notif-item-time">3 days ago</div>',
        '  </div>',
        '</div>',
      ].join('\n');
    }

    // Update badge count (2 unread)
    if (notifBadge) notifBadge.textContent = '2';
    if (notifCountBadge) notifCountBadge.textContent = '2';

    // Link to buyer notifications page instead of admin
    if (notifViewAll) notifViewAll.setAttribute('href', 'notifications.html');
  }

  // ══════════════════════════════════════════════════════════════════════
  // 14. NON-ADMIN — Redirect "View all notifications" to notifications.html
  // ══════════════════════════════════════════════════════════════════════
  if (role !== 'administrator') {
    var notifViewAllNonAdmin = document.querySelector('.notif-view-all');
    if (notifViewAllNonAdmin) notifViewAllNonAdmin.setAttribute('href', 'notifications.html');
  }

  // ══════════════════════════════════════════════════════════════════════
  // 15. "Mark all as read" handler for notification dropdown (all roles)
  // ══════════════════════════════════════════════════════════════════════
  var markReadBtn = document.querySelector('.notif-mark-read');
  if (markReadBtn) {
    markReadBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var dropdown = document.getElementById('notifDropdown');
      if (!dropdown) return;
      // Remove unread state from items
      dropdown.querySelectorAll('.notif-item.unread').forEach(function (item) {
        item.classList.remove('unread');
        var dot = item.querySelector('.notif-unread-dot');
        if (dot) dot.remove();
      });
      // Update badges to 0
      var badge = document.querySelector('.notif-badge');
      var countBadge = document.querySelector('.notif-count-badge');
      if (badge) badge.style.display = 'none';
      if (countBadge) countBadge.textContent = '0';
      // Hide the button itself
      markReadBtn.style.display = 'none';
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // 16. BUYER — Budget alert on checkout-review page
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'buyer' && currentPage === 'checkout-review.html') {
    (function injectBudgetAlert() {
      // Inject alert styles
      var alertStyle = document.createElement('style');
      alertStyle.textContent = [
        '.budget-alert{background:#fffbeb;border:1px solid #f5d572;border-radius:10px;padding:14px 20px;display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;}',
        '.budget-alert-icon{width:20px;height:20px;flex-shrink:0;margin-top:1px;color:#b8860b;}',
        '.budget-alert-body{flex:1;min-width:0;}',
        '.budget-alert-title{font-size:13px;font-weight:600;color:#92400e;margin-bottom:2px;}',
        '.budget-alert-desc{font-size:12px;color:#78716c;line-height:18px;}',
        '.budget-alert-link{font-size:12px;font-weight:600;color:#007167;text-decoration:none;margin-left:4px;}',
        '.budget-alert-link:hover{text-decoration:underline;}',
      ].join('\n');
      document.head.appendChild(alertStyle);

      // Find the payment summary section to insert before the Place Order button
      var termsRow = document.querySelector('.terms-row');
      if (!termsRow) return;

      var alert = document.createElement('div');
      alert.className = 'budget-alert';
      alert.setAttribute('role', 'alert');
      alert.innerHTML = [
        '<svg class="budget-alert-icon" viewBox="0 0 20 20" fill="none">',
        '  <path d="M10 6v4m0 3h.01M2.93 15.5h14.14c1.13 0 1.85-1.22 1.3-2.2L11.3 2.8a1.5 1.5 0 00-2.6 0L1.63 13.3c-.55.98.17 2.2 1.3 2.2z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
        '</svg>',
        '<div class="budget-alert-body">',
        '  <div class="budget-alert-title">Approaching monthly budget limit</div>',
        '  <div class="budget-alert-desc">',
        '    You have spent 24.279,25 € of your 40.000,00 € monthly budget (61%). This order may require approver review.',
        '    <a href="budget.html" class="budget-alert-link">View Budget</a>',
        '  </div>',
        '</div>',
      ].join('\n');

      termsRow.parentNode.insertBefore(alert, termsRow);
    })();
  }

  // ══════════════════════════════════════════════════════════════════════
  // 17. APPROVER — Transform Orders page into Approval Queue
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'approver' && currentPage === 'orders.html') {

    // ── 17a. Title + breadcrumb ──
    var h1 = document.querySelector('.title-bar h1');
    if (h1) {
      h1.setAttribute('data-i18n', 'approver.orderApprovals');
      h1.textContent = 'Order Approvals';
    }
    document.querySelectorAll('.breadcrumb-current').forEach(function (el) {
      var i18nKey = el.getAttribute('data-i18n') || '';
      if (i18nKey === 'orders.title' || el.textContent.trim() === 'Orders') {
        el.setAttribute('data-i18n', 'approver.orderApprovals');
        el.textContent = 'Order Approvals';
      }
    });
    document.title = 'Order Approvals — NETZSCH Customer Portal';

    var drawerTitle = document.querySelector('.drawer-title');
    if (drawerTitle) drawerTitle.textContent = 'Approval Details';

    // ── 17b. Inject approver styles ──
    var approverStyle = document.createElement('style');
    approverStyle.textContent = [
      '.status-pending-approval{background:#fff8e1;color:#b8860b;}',
      '.status-approved{background:#e8f5e9;color:#2e7d32;}',
      '.status-rejected{background:#fce8e6;color:#c73e20;}',
      /* Drawer approve/reject styles */
      '.drawer-approval-status{display:flex;align-items:center;gap:8px;margin-bottom:20px;}',
      '.drawer-approval-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:13px;font-weight:600;}',
      '.drawer-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;}',
      '.drawer-info-item{display:flex;flex-direction:column;gap:2px;}',
      '.drawer-info-label{font-size:11px;font-weight:700;color:#9ca0a5;text-transform:uppercase;letter-spacing:0.5px;}',
      '.drawer-info-value{font-size:14px;color:#2d2e33;font-weight:500;}',
      '.drawer-divider{border:none;border-top:1px solid #e5e7eb;margin:0 0 20px 0;}',
      '.drawer-items-title{font-size:13px;font-weight:700;color:#1f2937;margin-bottom:12px;}',
      '.drawer-item-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;}',
      '.drawer-item-row:last-child{border-bottom:none;}',
      '.drawer-item-info{flex:1;}',
      '.drawer-item-name{font-size:13px;font-weight:600;color:#1f2937;}',
      '.drawer-item-meta{font-size:12px;color:#6b7280;}',
      '.drawer-item-qty{font-size:13px;color:#374151;font-weight:500;text-align:right;}',
      '.drawer-note-section{background:#f8f9fa;border-radius:10px;padding:16px;margin-bottom:16px;}',
      '.drawer-note-label{font-size:12px;font-weight:700;color:#9ca0a5;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;}',
      '.drawer-note-text{font-size:13px;color:#374151;line-height:20px;}',
      /* Action buttons */
      '.approver-actions{display:flex;gap:10px;margin-top:20px;}',
      '.btn-approve{flex:1;height:44px;border-radius:999px;border:none;background:#2e7d32;color:#fff;font-family:"Inter",sans-serif;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;}',
      '.btn-approve:hover{background:#1b5e20;}',
      '.btn-reject{flex:1;height:44px;border-radius:999px;border:2px solid #c73e20;background:#fff;color:#c73e20;font-family:"Inter",sans-serif;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;}',
      '.btn-reject:hover{background:#fef7f6;}',
      '.btn-approve svg,.btn-reject svg{width:16px;height:16px;}',
      /* Rejection modal */
      '.reject-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:600;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.2s ease;}',
      '.reject-modal-overlay.show{opacity:1;pointer-events:auto;}',
      '.reject-modal{background:#fff;border-radius:14px;width:480px;max-width:90vw;box-shadow:0 25px 50px rgba(0,0,0,0.25);transform:scale(0.95);transition:transform 0.2s ease;}',
      '.reject-modal-overlay.show .reject-modal{transform:scale(1);}',
      '.reject-modal-header{padding:20px 24px 0;display:flex;align-items:center;gap:12px;}',
      '.reject-modal-icon{width:40px;height:40px;border-radius:50%;background:#fce8e6;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#c73e20;}',
      '.reject-modal-icon svg{width:20px;height:20px;}',
      '.reject-modal-title{font-size:17px;font-weight:700;color:#1f2937;}',
      '.reject-modal-body{padding:16px 24px;}',
      '.reject-modal-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;}',
      '.reject-modal-textarea{width:100%;height:100px;border:1px solid #d1d5db;border-radius:10px;padding:12px;font-family:"Inter",sans-serif;font-size:13px;color:#2d2e33;resize:vertical;outline:none;transition:border-color 0.15s;}',
      '.reject-modal-textarea:focus{border-color:#007167;box-shadow:0 0 0 3px rgba(0,113,103,0.1);}',
      '.reject-modal-textarea::placeholder{color:#9ca0a5;}',
      '.reject-modal-footer{padding:0 24px 20px;display:flex;gap:10px;justify-content:flex-end;}',
      '.reject-modal-cancel{height:40px;padding:0 20px;border-radius:999px;border:1px solid #d1d5db;background:#fff;color:#374151;font-family:"Inter",sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background 0.15s;}',
      '.reject-modal-cancel:hover{background:#f9fafb;}',
      '.reject-modal-confirm{height:40px;padding:0 20px;border-radius:999px;border:none;background:#c73e20;color:#fff;font-family:"Inter",sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s;}',
      '.reject-modal-confirm:hover{background:#a83219;}',
      '.reject-modal-confirm:disabled{opacity:0.5;cursor:not-allowed;}',
      /* Toast */
      '.approver-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:#1f2937;color:#fff;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:500;z-index:700;opacity:0;transition:transform 0.3s cubic-bezier(0.32,0.72,0,1),opacity 0.3s ease;pointer-events:none;display:flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,0.2);}',
      '.approver-toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}',
      '.approver-toast svg{width:16px;height:16px;flex-shrink:0;}',
      /* Rejection badge in drawer */
      '.drawer-rejection{background:#fef7f6;border:1px solid #fce8e6;border-radius:10px;padding:16px;margin-top:16px;}',
      '.drawer-rejection-title{font-size:12px;font-weight:700;color:#c73e20;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;display:flex;align-items:center;gap:6px;}',
      '.drawer-rejection-title svg{width:14px;height:14px;}',
      '.drawer-rejection-text{font-size:13px;color:#374151;line-height:20px;}',
    ].join('\n');
    document.head.appendChild(approverStyle);

    // ── 17c. Replace stat cards ──
    var statCards = document.querySelector('.stat-cards');
    if (statCards) {
      statCards.innerHTML = [
        '<div class="stat-card">',
        '  <div class="stat-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#b8860b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">5</span><span class="stat-label">Pending Reviews</span></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon" style="background:#e8f5e9;"><svg viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">18</span><span class="stat-label">Approved (May)</span></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon" style="background:#fce8e6;"><svg viewBox="0 0 24 24" fill="none"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#c73e20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">3</span><span class="stat-label">Rejected (May)</span></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon" style="background:#e5f5f4;"><svg viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#007167" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="stat-info"><span class="stat-number">26</span><span class="stat-label">Total Processed</span></div>',
        '</div>'
      ].join('\n');
    }

    // ── 17d. Replace table with approver data ──
    var sortSvg = '<svg class="sort-icon" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M3 7l3 3 3-3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var table = document.querySelector('.orders-table');
    if (table) {
      var thead = table.querySelector('thead tr');
      if (thead) {
        thead.innerHTML =
          '<th>Order ' + sortSvg + '</th>' +
          '<th>Requester ' + sortSvg + '</th>' +
          '<th>Product ' + sortSvg + '</th>' +
          '<th>Total ' + sortSvg + '</th>' +
          '<th>Submitted ' + sortSvg + '</th>' +
          '<th>Status ' + sortSvg + '</th>' +
          '<th>Actions</th>';
      }

      var approverOrders = [
        { id:'2800998-30', requester:'Sarah Mitchell', product:'LMZ60 spares', total:'4.000,00 €', date:'Apr 28, 2026', status:'pending' },
        { id:'2800998-29', requester:'Sarah Mitchell', product:'CERABEADS 0.4 (x3)', total:'119,25 €', date:'Apr 25, 2026', status:'pending' },
        { id:'2800998-28', requester:'James Cooper', product:'ZetaBeads Plus 0.3mm', total:'850,00 €', date:'Apr 22, 2026', status:'pending' },
        { id:'REQ-2026-4781', requester:'Carlos Andrade', product:'CERABEADS 0.4', total:'—', date:'Apr 15, 2026', status:'pending', type:'technician' },
        { id:'REQ-2026-4619', requester:'Carlos Andrade', product:'Steel Beads Micro 0.1mm', total:'—', date:'Apr 5, 2026', status:'pending', type:'technician' },
        { id:'2800998-27', requester:'Sarah Mitchell', product:'Steel Beads Micro 0.1mm', total:'1.200,00 €', date:'Apr 20, 2026', status:'approved', decidedDate:'Apr 21, 2026' },
        { id:'2800998-26', requester:'Sarah Mitchell', product:'O-Ring Set (517225)', total:'340,00 €', date:'Apr 18, 2026', status:'approved', decidedDate:'Apr 18, 2026' },
        { id:'2800998-25', requester:'Sarah Mitchell', product:'Mastermix 45 spares', total:'12.000,00 €', date:'Apr 15, 2026', status:'rejected', decidedDate:'Apr 16, 2026', reason:'Budget limit exceeded for Q2. Please split into two orders under €8.000 or request budget extension from finance.' },
        { id:'2800998-24', requester:'James Cooper', product:'Inlet Flange Set', total:'2.700,00 €', date:'Apr 12, 2026', status:'approved', decidedDate:'Apr 13, 2026' },
        { id:'2800998-23', requester:'Sarah Mitchell', product:'Glass Beads 0.8mm (x5)', total:'475,00 €', date:'Apr 10, 2026', status:'approved', decidedDate:'Apr 11, 2026' },
      ];

      var approvalBadges = {
        pending: '<span class="status-badge status-pending-approval">Pending Review</span>',
        approved: '<span class="status-badge status-approved">Approved</span>',
        rejected: '<span class="status-badge status-rejected">Rejected</span>'
      };

      var tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.innerHTML = approverOrders.map(function (o) {
          return '<tr>' +
            '<td><a class="order-link" href="#">' + o.id + '</a></td>' +
            '<td>' + o.requester + '</td>' +
            '<td>' + o.product + '</td>' +
            '<td>' + o.total + '</td>' +
            '<td>' + o.date + '</td>' +
            '<td>' + (approvalBadges[o.status] || o.status) + '</td>' +
            '<td><div class="actions-cell"><button class="action-btn" title="View details"><img src="../assets/icon-order-eye.svg" alt="View"></button></div></td>' +
            '</tr>';
        }).join('');
      }

      // Update pagination
      var pagInfo = document.querySelector('.pagination-info');
      if (pagInfo) pagInfo.textContent = 'Showing 1–10 of 10 orders';
    }

    // ── 17e. Inject rejection modal + toast ──
    var rejectModal = document.createElement('div');
    rejectModal.className = 'reject-modal-overlay';
    rejectModal.id = 'rejectModalOverlay';
    rejectModal.innerHTML = [
      '<div class="reject-modal">',
      '  <div class="reject-modal-header">',
      '    <div class="reject-modal-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
      '    <span class="reject-modal-title">Reject Order</span>',
      '  </div>',
      '  <div class="reject-modal-body">',
      '    <div class="reject-modal-label">Reason for rejection <span style="color:#c73e20;">*</span></div>',
      '    <textarea class="reject-modal-textarea" id="rejectReason" placeholder="Explain why this order is being rejected..."></textarea>',
      '  </div>',
      '  <div class="reject-modal-footer">',
      '    <button class="reject-modal-cancel" id="rejectCancel">Cancel</button>',
      '    <button class="reject-modal-confirm" id="rejectConfirm" disabled>Reject Order</button>',
      '  </div>',
      '</div>',
    ].join('\n');
    document.body.appendChild(rejectModal);

    var toast = document.createElement('div');
    toast.className = 'approver-toast';
    toast.id = 'approverToast';
    document.body.appendChild(toast);

    // ── 17f. Drawer with details + approve/reject ──
    var drawerBody = document.querySelector('.drawer-body');
    var drawerEl = document.getElementById('trackingDrawer');
    var overlayEl = document.getElementById('drawerOverlay');

    if (drawerBody && drawerEl && overlayEl) {
      var approverOrdersData = [
        { id:'2800998-30', requester:'Sarah Mitchell', requesterRole:'Procurement Specialist', product:'LMZ60 spares', items:[{name:'LMZ60 Grinding Chamber Set',ref:'GC-LMZ60',qty:'1 pc'}], total:'4.000,00 €', date:'Apr 28, 2026', status:'pending', note:'Replacement parts for LMZ60 — scheduled maintenance next week. Priority: normal.' },
        { id:'2800998-29', requester:'Sarah Mitchell', requesterRole:'Procurement Specialist', product:'CERABEADS 0.4 (x3)', items:[{name:'NETZSCH CERABEADS 0.4',ref:'443385',qty:'3 kg'}], total:'119,25 €', date:'Apr 25, 2026', status:'pending', note:'Routine restock for Zeta 60 milling line.' },
        { id:'2800998-28', requester:'James Cooper', requesterRole:'Procurement Specialist', product:'ZetaBeads Plus 0.3mm', items:[{name:'ZetaBeads Plus 0.3mm',ref:'ZB-030P',qty:'2 kg'}], total:'850,00 €', date:'Apr 22, 2026', status:'pending', note:'New batch for nano milling project starting May 5.' },
        { id:'REQ-2026-4781', requester:'Carlos Andrade', requesterRole:'Field Technician', product:'CERABEADS 0.4', items:[{name:'NETZSCH CERABEADS 0.4',ref:'443385',qty:'1 kg'}], total:'—', date:'Apr 15, 2026', status:'pending', note:'Scheduled maintenance — current grinding beads showing signs of wear after 2,400 operating hours.', type:'technician', machine:'Alpha Zeta 10' },
        { id:'REQ-2026-4619', requester:'Carlos Andrade', requesterRole:'Field Technician', product:'Steel Beads Micro 0.1mm', items:[{name:'Steel Beads Micro 0.1mm',ref:'SB-010M',qty:'5 kg'}], total:'—', date:'Apr 5, 2026', status:'pending', note:'Current stock running low. Estimated depletion within 2 weeks.', type:'technician', machine:'Zeta 60' },
        { id:'2800998-27', requester:'Sarah Mitchell', requesterRole:'Procurement Specialist', product:'Steel Beads Micro 0.1mm', items:[{name:'Steel Beads Micro 0.1mm',ref:'SB-010M',qty:'5 kg'}], total:'1.200,00 €', date:'Apr 20, 2026', status:'approved', decidedDate:'Apr 21, 2026' },
        { id:'2800998-26', requester:'Sarah Mitchell', requesterRole:'Procurement Specialist', product:'O-Ring Set (517225)', items:[{name:'O-Ring (517225)',ref:'517225',qty:'2 pcs'}], total:'340,00 €', date:'Apr 18, 2026', status:'approved', decidedDate:'Apr 18, 2026' },
        { id:'2800998-25', requester:'Sarah Mitchell', requesterRole:'Procurement Specialist', product:'Mastermix 45 spares', items:[{name:'Mastermix 45 Full Spare Kit',ref:'MX45-KIT',qty:'1 set'}], total:'12.000,00 €', date:'Apr 15, 2026', status:'rejected', decidedDate:'Apr 16, 2026', reason:'Budget limit exceeded for Q2. Please split into two orders under €8.000 or request budget extension from finance.' },
        { id:'2800998-24', requester:'James Cooper', requesterRole:'Procurement Specialist', product:'Inlet Flange Set', items:[{name:'Inlet Flange Set',ref:'FL-2200',qty:'1 pc'}], total:'2.700,00 €', date:'Apr 12, 2026', status:'approved', decidedDate:'Apr 13, 2026' },
        { id:'2800998-23', requester:'Sarah Mitchell', requesterRole:'Procurement Specialist', product:'Glass Beads 0.8mm (x5)', items:[{name:'Glass Beads 0.8mm',ref:'GB-080',qty:'5 kg'}], total:'475,00 €', date:'Apr 10, 2026', status:'approved', decidedDate:'Apr 11, 2026' },
      ];

      var currentDrawerIndex = -1;

      var badgeMap = {
        pending:  '<span class="drawer-approval-badge status-pending-approval"><svg viewBox="0 0 16 16" fill="none"><path d="M8 4v4l2.5 2.5M14 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Pending Review</span>',
        approved: '<span class="drawer-approval-badge status-approved"><svg viewBox="0 0 16 16" fill="none"><path d="M4.5 8.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Approved</span>',
        rejected: '<span class="drawer-approval-badge status-rejected"><svg viewBox="0 0 16 16" fill="none"><path d="M5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Rejected</span>'
      };

      function openApproverDrawer(index) {
        var o = approverOrdersData[index];
        if (!o) return;
        currentDrawerIndex = index;

        var html = '';
        html += '<div class="drawer-order-id" style="margin-bottom:4px;">' + o.id + '</div>';
        html += '<div style="font-size:13px;color:#6b6e73;margin-bottom:16px;">Submitted on ' + o.date + '</div>';
        html += '<div class="drawer-approval-status">' + (badgeMap[o.status] || '') + '</div>';

        // Info grid
        html += '<div class="drawer-info-grid">';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Requester</span><span class="drawer-info-value">' + o.requester + '</span></div>';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Role</span><span class="drawer-info-value">' + o.requesterRole + '</span></div>';
        html += '  <div class="drawer-info-item"><span class="drawer-info-label">Total</span><span class="drawer-info-value">' + o.total + '</span></div>';
        if (o.machine) {
          html += '  <div class="drawer-info-item"><span class="drawer-info-label">Machine</span><span class="drawer-info-value">' + o.machine + '</span></div>';
        } else {
          html += '  <div class="drawer-info-item"><span class="drawer-info-label">Type</span><span class="drawer-info-value">' + (o.type === 'technician' ? 'Technician Request' : 'Purchase Order') + '</span></div>';
        }
        html += '</div>';

        // Requester note
        if (o.note) {
          html += '<div class="drawer-note-section">';
          html += '  <div class="drawer-note-label">Requester Note</div>';
          html += '  <div class="drawer-note-text">' + o.note + '</div>';
          html += '</div>';
        }

        html += '<hr class="drawer-divider">';

        // Items
        html += '<div class="drawer-items-title">Items</div>';
        o.items.forEach(function (item) {
          html += '<div class="drawer-item-row">';
          html += '  <div class="drawer-item-info"><div class="drawer-item-name">' + item.name + '</div><div class="drawer-item-meta">Ref: ' + item.ref + '</div></div>';
          html += '  <div class="drawer-item-qty">' + item.qty + '</div>';
          html += '</div>';
        });

        // Rejection reason (for already rejected)
        if (o.status === 'rejected' && o.reason) {
          html += '<div class="drawer-rejection" style="margin-top:16px;">';
          html += '  <div class="drawer-rejection-title"><svg viewBox="0 0 16 16" fill="none"><path d="M8 5v3m0 3h.01M14 8a6 6 0 11-12 0 6 6 0 0112 0z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>Reason for Rejection</div>';
          html += '  <div class="drawer-rejection-text">' + o.reason + '</div>';
          html += '</div>';
        }

        // Decided date for approved/rejected
        if (o.decidedDate && o.status !== 'pending') {
          html += '<div style="font-size:12px;color:#9ca0a5;margin-top:12px;">Decision made on ' + o.decidedDate + '</div>';
        }

        // Approve/Reject buttons (only for pending)
        if (o.status === 'pending') {
          html += '<div class="approver-actions">';
          html += '  <button class="btn-approve" id="btnDrawerApprove"><svg viewBox="0 0 16 16" fill="none"><path d="M4.5 8.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Approve</button>';
          html += '  <button class="btn-reject" id="btnDrawerReject"><svg viewBox="0 0 16 16" fill="none"><path d="M5.5 5.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Reject</button>';
          html += '</div>';
        }

        drawerBody.innerHTML = html;
        overlayEl.classList.add('show');
        drawerEl.classList.add('show');

        // Wire approve button
        var approveBtn = document.getElementById('btnDrawerApprove');
        if (approveBtn) {
          approveBtn.addEventListener('click', function () {
            approverOrdersData[currentDrawerIndex].status = 'approved';
            approverOrdersData[currentDrawerIndex].decidedDate = 'May 11, 2026';
            refreshApproverTable();
            closeApproverDrawer();
            showToast('approved', approverOrdersData[currentDrawerIndex].id);
          });
        }

        // Wire reject button → open modal
        var rejectBtn = document.getElementById('btnDrawerReject');
        if (rejectBtn) {
          rejectBtn.addEventListener('click', function () {
            var modalOverlay = document.getElementById('rejectModalOverlay');
            var textarea = document.getElementById('rejectReason');
            var confirmBtn = document.getElementById('rejectConfirm');
            textarea.value = '';
            confirmBtn.disabled = true;
            modalOverlay.classList.add('show');
            setTimeout(function () { textarea.focus(); }, 200);
          });
        }
      }

      function closeApproverDrawer() {
        overlayEl.classList.remove('show');
        drawerEl.classList.remove('show');
      }

      function refreshApproverTable() {
        var tbody = document.querySelector('.orders-table tbody');
        if (!tbody) return;
        var approvalBadges = {
          pending: '<span class="status-badge status-pending-approval">Pending Review</span>',
          approved: '<span class="status-badge status-approved">Approved</span>',
          rejected: '<span class="status-badge status-rejected">Rejected</span>'
        };
        tbody.innerHTML = approverOrdersData.map(function (o) {
          return '<tr>' +
            '<td><a class="order-link" href="#">' + o.id + '</a></td>' +
            '<td>' + o.requester + '</td>' +
            '<td>' + o.product + '</td>' +
            '<td>' + o.total + '</td>' +
            '<td>' + o.date + '</td>' +
            '<td>' + (approvalBadges[o.status] || o.status) + '</td>' +
            '<td><div class="actions-cell"><button class="action-btn" title="View details"><img src="../assets/icon-order-eye.svg" alt="View"></button></div></td>' +
            '</tr>';
        }).join('');
        wireTableButtons();

        // Update stat card for pending count
        var pendingCount = approverOrdersData.filter(function (o) { return o.status === 'pending'; }).length;
        var approvedCount = approverOrdersData.filter(function (o) { return o.status === 'approved'; }).length;
        var rejectedCount = approverOrdersData.filter(function (o) { return o.status === 'rejected'; }).length;
        var statNums = document.querySelectorAll('.stat-number');
        if (statNums[0]) statNums[0].textContent = pendingCount;
        if (statNums[1]) statNums[1].textContent = approvedCount;
        if (statNums[2]) statNums[2].textContent = rejectedCount;
        if (statNums[3]) statNums[3].textContent = approvedCount + rejectedCount;
      }

      function showToast(action, orderId) {
        var toastEl = document.getElementById('approverToast');
        if (!toastEl) return;
        if (action === 'approved') {
          toastEl.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M4.5 8.5l2.5 2.5 4.5-4.5" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Order ' + orderId + ' approved successfully';
        } else {
          toastEl.innerHTML = '<svg viewBox="0 0 16 16" fill="none"><path d="M5.5 5.5l5 5m0-5l-5 5" stroke="#f87171" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>Order ' + orderId + ' rejected';
        }
        toastEl.classList.add('show');
        setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
      }

      function wireTableButtons() {
        document.querySelectorAll('.action-btn[title="View details"]').forEach(function (btn, i) {
          btn.addEventListener('click', function (e) {
            e.stopPropagation();
            openApproverDrawer(i);
          });
        });
        document.querySelectorAll('.order-link').forEach(function (link, i) {
          link.href = '#';
          link.addEventListener('click', function (e) {
            e.preventDefault();
            openApproverDrawer(i);
          });
        });
      }

      // Initial wiring
      wireTableButtons();

      // Close handlers
      var closeBtn = document.querySelector('.drawer-close');
      if (closeBtn) closeBtn.addEventListener('click', closeApproverDrawer);
      overlayEl.addEventListener('click', closeApproverDrawer);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          var modalOverlay = document.getElementById('rejectModalOverlay');
          if (modalOverlay && modalOverlay.classList.contains('show')) {
            modalOverlay.classList.remove('show');
          } else if (drawerEl.classList.contains('show')) {
            closeApproverDrawer();
          }
        }
      });

      // ── Rejection modal handlers ──
      var rejectTextarea = document.getElementById('rejectReason');
      var rejectConfirmBtn = document.getElementById('rejectConfirm');
      var rejectCancelBtn = document.getElementById('rejectCancel');
      var rejectModalOverlay = document.getElementById('rejectModalOverlay');

      if (rejectTextarea && rejectConfirmBtn) {
        rejectTextarea.addEventListener('input', function () {
          rejectConfirmBtn.disabled = rejectTextarea.value.trim().length === 0;
        });
      }

      if (rejectCancelBtn) {
        rejectCancelBtn.addEventListener('click', function () {
          rejectModalOverlay.classList.remove('show');
        });
      }

      if (rejectConfirmBtn) {
        rejectConfirmBtn.addEventListener('click', function () {
          var reason = rejectTextarea.value.trim();
          if (!reason) return;
          approverOrdersData[currentDrawerIndex].status = 'rejected';
          approverOrdersData[currentDrawerIndex].decidedDate = 'May 11, 2026';
          approverOrdersData[currentDrawerIndex].reason = reason;
          rejectModalOverlay.classList.remove('show');
          refreshApproverTable();
          closeApproverDrawer();
          showToast('rejected', approverOrdersData[currentDrawerIndex].id);
        });
      }

      if (rejectModalOverlay) {
        rejectModalOverlay.addEventListener('click', function (e) {
          if (e.target === rejectModalOverlay) rejectModalOverlay.classList.remove('show');
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 18. APPROVER — Personalized Dashboard
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'approver' && currentPage === 'dashboard.html') {

    // ── 17a. Inject approver dashboard styles ──
    var approverDashStyle = document.createElement('style');
    approverDashStyle.textContent = [
      '.status-pending-approval{background:#fff8e1;color:#b8860b;}',
      '.status-approved{background:#e8f5e9;color:#2e7d32;}',
      '.status-rejected{background:#fce8e6;color:#c73e20;}',
      /* Approval queue card */
      '.approval-queue-item{border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;transition:background 0.15s;}',
      '.approval-queue-item:hover{background:#f8f9fa;}',
      '.approval-queue-icon{width:36px;height:36px;border-radius:50%;background:#fff8e1;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.approval-queue-icon svg{width:18px;height:18px;color:#b8860b;}',
      '.approval-queue-body{flex:1;min-width:0;}',
      '.approval-queue-title{font-size:13px;font-weight:600;color:#1f2937;}',
      '.approval-queue-desc{font-size:12px;color:#6b7280;line-height:18px;}',
      '.approval-queue-meta{font-size:11px;color:#9ca0a5;margin-top:2px;}',
      '.btn-review{background:#007167;color:#fff;border:none;border-radius:999px;padding:6px 14px;font-family:Inter,sans-serif;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background 0.15s;text-decoration:none;display:inline-flex;align-items:center;gap:4px;}',
      '.btn-review:hover{background:#005f57;}',
      /* Middle row — 2 columns for Approver */
      '.middle-row{grid-template-columns:1fr 340px !important;}',
    ].join('\n');
    document.head.appendChild(approverDashStyle);

    // ── 17b. Welcome banner — change name ──
    var welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      var hour = new Date().getHours();
      var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      welcomeTitle.textContent = greeting + ', Daniel';
    }

    // ── 17c. Replace stat cards with approver-centric metrics ──
    var statCards = document.querySelector('.stat-cards');
    if (statCards) {
      statCards.innerHTML = [
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#fff8e1;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#b8860b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">5</div><div class="stat-label">Pending Reviews</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#e8f5e9;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">18</div><div class="stat-label">Approved (May)</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#fce8e6;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#c73e20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">3</div><div class="stat-label">Rejected (May)</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">26</div><div class="stat-label">Total Processed</div></div>',
        '</div>',
      ].join('\n');
    }

    // ── 17d. Replace AI Insights with Approval Queue ──
    var insightCardTitle = document.querySelector('.middle-row .card-header .card-title');
    if (insightCardTitle) insightCardTitle.textContent = 'Approval Queue';
    var insightIcon = document.querySelector('.middle-row .card-header img');
    if (insightIcon) {
      insightIcon.outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007167" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 14l2 2 4-4"/></svg>';
    }

    var insightList = document.querySelector('.insight-list');
    if (insightList) {
      var queueItems = [
        { id:'2800998-30', requester:'Sarah Mitchell', product:'LMZ60 spares', total:'4.000,00 €', date:'Apr 28, 2026', urgency:'normal' },
        { id:'2800998-29', requester:'Sarah Mitchell', product:'CERABEADS 0.4 (x3)', total:'119,25 €', date:'Apr 25, 2026', urgency:'normal' },
        { id:'2800998-28', requester:'James Cooper', product:'ZetaBeads Plus 0.3mm', total:'850,00 €', date:'Apr 22, 2026', urgency:'normal' },
        { id:'REQ-2026-4781', requester:'Carlos Andrade', product:'CERABEADS 0.4', total:'—', date:'Apr 15, 2026', urgency:'high', type:'technician' },
        { id:'REQ-2026-4619', requester:'Carlos Andrade', product:'Steel Beads Micro 0.1mm', total:'—', date:'Apr 5, 2026', urgency:'high', type:'technician' },
      ];

      insightList.innerHTML = queueItems.map(function (q) {
        var urgencyBadge = q.urgency === 'high'
          ? ' <span style="display:inline-block;background:#fce8e6;color:#c73e20;font-size:10px;font-weight:600;padding:1px 6px;border-radius:999px;margin-left:4px;">Urgent</span>'
          : '';
        var typeLabel = q.type === 'technician' ? 'Technician Request' : 'Purchase Order';
        return '<div class="approval-queue-item">' +
          '<div class="approval-queue-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>' +
          '<div class="approval-queue-body">' +
            '<div class="approval-queue-title">' + q.id + urgencyBadge + '</div>' +
            '<div class="approval-queue-desc">' + q.product + ' — ' + q.total + '</div>' +
            '<div class="approval-queue-meta">' + typeLabel + ' by ' + q.requester + ' · ' + q.date + '</div>' +
          '</div>' +
          '<a href="orders.html" class="btn-review">Review</a>' +
        '</div>';
      }).join('');
    }

    // ── 17e. Quick Actions — Approver-specific ──
    var quickActionsCard = document.querySelector('.middle-row .card:last-child');
    if (quickActionsCard) {
      quickActionsCard.innerHTML = [
        '<div class="card-header">',
        '  <span class="card-title">Quick Actions</span>',
        '</div>',
        '<div class="quick-actions-list">',
        '  <button class="btn-quick-action" onclick="window.location.href=\'orders.html\'">Review Pending Orders</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'quotes.html\'">Review Quotes</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'machines.html\'">View Machines</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'services.html\'">View Services</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'help.html\'">Contact Support</button>',
        '</div>',
      ].join('\n');
    }

    // ── 17f. Recent Orders table → Recent Approvals ──
    var ordersHeader = document.querySelector('.orders-header');
    if (ordersHeader) {
      ordersHeader.querySelector('.card-title').textContent = 'Recent Approvals';
      var viewAllBtn = ordersHeader.querySelector('.btn-view-all');
      if (viewAllBtn) {
        viewAllBtn.textContent = 'View All';
        viewAllBtn.onclick = function () { window.location.href = 'orders.html'; };
      }
    }

    var ordersTable = document.querySelector('.orders-table');
    if (ordersTable) {
      var thead = ordersTable.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = '<th>Order #</th><th>Requester</th><th>Product</th><th>Total</th><th>Decision</th><th>Date</th>';
      }

      var tbody = ordersTable.querySelector('tbody');
      if (tbody) {
        var recentApprovals = [
          { id:'2800998-27', requester:'Sarah Mitchell', product:'Steel Beads Micro', total:'1.200,00 €', decision:'approved', date:'Apr 21, 2026' },
          { id:'2800998-26', requester:'Sarah Mitchell', product:'O-Ring Set (517225)', total:'340,00 €', decision:'approved', date:'Apr 18, 2026' },
          { id:'2800998-25', requester:'Sarah Mitchell', product:'Mastermix 45 spares', total:'12.000,00 €', decision:'rejected', date:'Apr 16, 2026' },
          { id:'2800998-24', requester:'James Cooper', product:'Inlet Flange Set', total:'2.700,00 €', decision:'approved', date:'Apr 13, 2026' },
          { id:'2800998-23', requester:'Sarah Mitchell', product:'Glass Beads 0.8mm', total:'475,00 €', decision:'approved', date:'Apr 11, 2026' },
        ];

        var decisionBadges = {
          approved: '<span class="status-badge status-approved">Approved</span>',
          rejected: '<span class="status-badge status-rejected">Rejected</span>'
        };

        tbody.innerHTML = recentApprovals.map(function (a) {
          return '<tr>' +
            '<td><a class="order-link" href="orders.html">' + a.id + '</a></td>' +
            '<td>' + a.requester + '</td>' +
            '<td>' + a.product + '</td>' +
            '<td>' + a.total + '</td>' +
            '<td>' + (decisionBadges[a.decision] || a.decision) + '</td>' +
            '<td>' + a.date + '</td>' +
            '</tr>';
        }).join('');
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 19. APPROVER — Notification dropdown customization (all pages)
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'approver') {
    var notifList = document.querySelector('.notif-list');
    var notifBadge = document.querySelector('.notif-badge');
    var notifCountBadge = document.querySelector('.notif-count-badge');
    var notifViewAll = document.querySelector('.notif-view-all');

    if (notifList) {
      var approverNotifStyle = document.createElement('style');
      approverNotifStyle.textContent = '.notif-item-icon.approval-pending{background:#fff8e1;} .notif-item-icon.approval-done{background:#e8f5e9;}';
      document.head.appendChild(approverNotifStyle);

      notifList.innerHTML = [
        // 1. New order pending (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon approval-pending"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">New order #2800998-30 awaiting your approval</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">Sarah Mitchell — LMZ60 spares (4.000,00 €)</div>',
        '    <div class="notif-item-time">30 min ago</div>',
        '    <a href="orders.html" class="notif-item-action">Review Now</a>',
        '  </div>',
        '</div>',
        // 2. Technician request (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon approval-pending"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">Technician request REQ-2026-4781 needs review</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">Carlos Andrade — CERABEADS 0.4 for Alpha Zeta 10</div>',
        '    <div class="notif-item-time">2 hours ago</div>',
        '    <a href="orders.html" class="notif-item-action">Review Now</a>',
        '  </div>',
        '</div>',
        // 3. Reminder (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon approval-pending"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">Reminder: 5 orders pending your review</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">Oldest request is 36 days old — please review promptly.</div>',
        '    <div class="notif-item-time">1 day ago</div>',
        '  </div>',
        '</div>',
        // 4. Approved confirmation (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon approval-done"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">You approved order #2800998-27</span>',
        '    <div class="notif-item-desc">Steel Beads Micro 0.1mm — 1.200,00 €</div>',
        '    <div class="notif-item-time">3 days ago</div>',
        '  </div>',
        '</div>',
        // 5. Quote for review (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon quote"><img src="../assets/icon-notif-quote.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">Quote #QT-2026-0042 ready for your review</span>',
        '    <div class="notif-item-desc">Spare parts for Alpha Zeta 10 — 12.450,00 €</div>',
        '    <div class="notif-item-time">4 days ago</div>',
        '  </div>',
        '</div>',
      ].join('\n');
    }

    // Update badge count (3 unread)
    if (notifBadge) notifBadge.textContent = '3';
    if (notifCountBadge) notifCountBadge.textContent = '3';

    // Link to notifications page
    if (notifViewAll) notifViewAll.setAttribute('href', 'notifications.html');
  }

  // ══════════════════════════════════════════════════════════════════════
  // 20. TECHNICIAN — Personalized Dashboard
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'technician' && currentPage === 'dashboard.html') {

    // ── 20a. Inject technician dashboard styles ──
    var techDashStyle = document.createElement('style');
    techDashStyle.textContent = [
      '.status-pending-approval{background:#fff8e1;color:#b8860b;}',
      '.status-in-progress-dash{background:#e0f2ee;color:#007167;}',
      /* Machine alert card */
      '.machine-alert-card{border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;transition:background 0.15s;}',
      '.machine-alert-card:hover{background:#f8f9fa;}',
      '.machine-alert-icon{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
      '.machine-alert-icon.warning{background:#fff8e1;}',
      '.machine-alert-icon.warning svg{color:#b8860b;}',
      '.machine-alert-icon.critical{background:#fce8e6;}',
      '.machine-alert-icon.critical svg{color:#c73e20;}',
      '.machine-alert-icon.info{background:#e0f2ee;}',
      '.machine-alert-icon.info svg{color:#007167;}',
      '.machine-alert-body{flex:1;min-width:0;}',
      '.machine-alert-title{font-size:13px;font-weight:600;color:#1f2937;}',
      '.machine-alert-desc{font-size:12px;color:#6b7280;line-height:18px;}',
      '.machine-alert-meta{font-size:11px;color:#9ca0a5;margin-top:2px;}',
      /* Middle row — 2 columns for Technician */
      '.middle-row{grid-template-columns:1fr 340px !important;}',
    ].join('\n');
    document.head.appendChild(techDashStyle);

    // ── 20b. Welcome banner — change name ──
    var welcomeTitle = document.querySelector('.welcome-title');
    if (welcomeTitle) {
      var hour = new Date().getHours();
      var greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      welcomeTitle.textContent = greeting + ', Carlos';
    }

    // ── 20c. Replace stat cards with technician metrics ──
    var statCards = document.querySelector('.stat-cards');
    if (statCards) {
      statCards.innerHTML = [
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#fff8e1;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#b8860b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">2</div><div class="stat-label">Pending Requests</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">5</div><div class="stat-label">Assigned Machines</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#e0f2ee;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#007167" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">2</div><div class="stat-label">Active Services</div></div>',
        '</div>',
        '<div class="stat-card">',
        '  <div class="stat-icon-wrap" style="background:#e8f5e9;"><svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div><div class="stat-number">3</div><div class="stat-label">Approved Requests</div></div>',
        '</div>',
      ].join('\n');
    }

    // ── 20d. Replace AI Insights with Machine Alerts ──
    var insightCardTitle = document.querySelector('.middle-row .card-header .card-title');
    if (insightCardTitle) insightCardTitle.textContent = 'Machine Alerts';
    var insightIcon = document.querySelector('.middle-row .card-header img');
    if (insightIcon) {
      insightIcon.outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007167" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    }

    var insightList = document.querySelector('.insight-list');
    if (insightList) {
      insightList.innerHTML = [
        // 1. Critical alert
        '<div class="machine-alert-card">',
        '  <div class="machine-alert-icon critical"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="1.5"/></svg></div>',
        '  <div class="machine-alert-body">',
        '    <div class="machine-alert-title">Discus 30 — Seal failure detected</div>',
        '    <div class="machine-alert-desc">O-Ring needs urgent replacement. Machine offline.</div>',
        '    <div class="machine-alert-meta">Detected during routine inspection · 2 hours ago</div>',
        '  </div>',
        '  <button class="btn-insight" onclick="window.location.href=\'services.html\'">View <img src="../assets/icon-arrow-right.svg" alt=""></button>',
        '</div>',
        // 2. Maintenance due
        '<div class="machine-alert-card">',
        '  <div class="machine-alert-icon warning"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="machine-alert-body">',
        '    <div class="machine-alert-title">Alpha Zeta 10 — Maintenance due</div>',
        '    <div class="machine-alert-desc">Grinding beads at 2,400 hrs. Replacement recommended before next cycle.</div>',
        '    <div class="machine-alert-meta">Scheduled maintenance · Due in 3 days</div>',
        '  </div>',
        '  <button class="btn-insight" onclick="window.location.href=\'machines.html\'">View <img src="../assets/icon-arrow-right.svg" alt=""></button>',
        '</div>',
        // 3. Request approved
        '<div class="machine-alert-card">',
        '  <div class="machine-alert-icon info"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>',
        '  <div class="machine-alert-body">',
        '    <div class="machine-alert-title">REQ-2026-4756 approved</div>',
        '    <div class="machine-alert-desc">O-Ring (517225) for Discus 30 — approved by Daniel Costa.</div>',
        '    <div class="machine-alert-meta">Approved · Apr 14, 2026</div>',
        '  </div>',
        '  <button class="btn-insight" onclick="window.location.href=\'orders.html\'">View <img src="../assets/icon-arrow-right.svg" alt=""></button>',
        '</div>',
        // 4. Bead wear warning
        '<div class="machine-alert-card">',
        '  <div class="machine-alert-icon warning"><svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="1.5"/></svg></div>',
        '  <div class="machine-alert-body">',
        '    <div class="machine-alert-title">Zeta 60 — Bead stock running low</div>',
        '    <div class="machine-alert-desc">Steel Beads Micro 0.1mm — estimated depletion in 2 weeks.</div>',
        '    <div class="machine-alert-meta">Inventory alert · Apr 5, 2026</div>',
        '  </div>',
        '  <button class="btn-insight" onclick="window.location.href=\'orders.html\'">View <img src="../assets/icon-arrow-right.svg" alt=""></button>',
        '</div>',
      ].join('\n');
    }

    // ── 20e. Quick Actions — Technician-specific ──
    var quickActionsCard = document.querySelector('.middle-row .card:last-child');
    if (quickActionsCard) {
      quickActionsCard.innerHTML = [
        '<div class="card-header">',
        '  <span class="card-title">Quick Actions</span>',
        '</div>',
        '<div class="quick-actions-list">',
        '  <button class="btn-quick-action" onclick="window.location.href=\'machines.html\'">My Machines</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'services.html\'">Service Requests</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'orders.html\'">My Requests</button>',
        '  <button class="btn-quick-action" onclick="window.location.href=\'help.html\'">Contact Support</button>',
        '</div>',
      ].join('\n');
    }

    // ── 20f. Recent Orders → Recent Requests ──
    var ordersHeader = document.querySelector('.orders-header');
    if (ordersHeader) {
      ordersHeader.querySelector('.card-title').textContent = 'Recent Requests';
      var viewAllBtn = ordersHeader.querySelector('.btn-view-all');
      if (viewAllBtn) {
        viewAllBtn.textContent = 'View All';
        viewAllBtn.onclick = function () { window.location.href = 'orders.html'; };
      }
    }

    var ordersTable = document.querySelector('.orders-table');
    if (ordersTable) {
      var thead = ordersTable.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = '<th>Request #</th><th>Product</th><th>Machine</th><th>Priority</th><th>Status</th><th>Submitted</th>';
      }

      var tbody = ordersTable.querySelector('tbody');
      if (tbody) {
        var techRequests = [
          { id:'REQ-2026-4781', product:'CERABEADS 0.4', machine:'Alpha Zeta 10', priority:'High', status:'pending', date:'Apr 15, 2026' },
          { id:'REQ-2026-4756', product:'O-Ring (517225)', machine:'Discus 30', priority:'Urgent', status:'approved', date:'Apr 14, 2026' },
          { id:'REQ-2026-4730', product:'Ring - AISI 304', machine:'Zeta 60', priority:'Medium', status:'approved', date:'Apr 12, 2026' },
          { id:'REQ-2026-4698', product:'Inlet Flange Set', machine:'Alpha Zeta 10', priority:'Low', status:'rejected', date:'Apr 10, 2026' },
          { id:'REQ-2026-4619', product:'Steel Beads Micro', machine:'Zeta 60', priority:'High', status:'pending', date:'Apr 5, 2026' },
        ];

        var statusBadges = {
          pending: '<span class="status-badge status-pending-approval">Pending Approval</span>',
          approved: '<span class="status-badge" style="background:#e8f5e9;color:#2e7d32;">Approved</span>',
          rejected: '<span class="status-badge" style="background:#fce8e6;color:#c73e20;">Rejected</span>'
        };

        tbody.innerHTML = techRequests.map(function (r) {
          return '<tr>' +
            '<td><a class="order-link" href="orders.html">' + r.id + '</a></td>' +
            '<td>' + r.product + '</td>' +
            '<td>' + r.machine + '</td>' +
            '<td>' + r.priority + '</td>' +
            '<td>' + (statusBadges[r.status] || r.status) + '</td>' +
            '<td>' + r.date + '</td>' +
            '</tr>';
        }).join('');
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // 21. TECHNICIAN — Notification dropdown customization (all pages)
  // ══════════════════════════════════════════════════════════════════════
  if (role === 'technician') {
    var notifList = document.querySelector('.notif-list');
    var notifBadge = document.querySelector('.notif-badge');
    var notifCountBadge = document.querySelector('.notif-count-badge');
    var notifViewAll = document.querySelector('.notif-view-all');

    if (notifList) {
      var techNotifStyle = document.createElement('style');
      techNotifStyle.textContent = '.notif-item-icon.machine{background:#fce8e6;} .notif-item-icon.request-status{background:#e8f5e9;}';
      document.head.appendChild(techNotifStyle);

      notifList.innerHTML = [
        // 1. Machine alert (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon machine"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">Discus 30 — Seal failure detected</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">O-Ring needs urgent replacement. Machine offline.</div>',
        '    <div class="notif-item-time">2 hours ago</div>',
        '    <a href="services.html" class="notif-item-action">Open Service</a>',
        '  </div>',
        '</div>',
        // 2. Request approved (UNREAD)
        '<div class="notif-item unread">',
        '  <div class="notif-item-icon request-status"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <div class="notif-item-title-row">',
        '      <span class="notif-item-title">REQ-2026-4756 approved by Daniel Costa</span>',
        '      <span class="notif-unread-dot"></span>',
        '    </div>',
        '    <div class="notif-item-desc">O-Ring (517225) for Discus 30 — order being processed.</div>',
        '    <div class="notif-item-time">1 day ago</div>',
        '  </div>',
        '</div>',
        // 3. Maintenance reminder (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon service"><img src="../assets/icon-notif-service.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">Maintenance due: Alpha Zeta 10</span>',
        '    <div class="notif-item-desc">Grinding beads at 2,400 hrs — replacement recommended.</div>',
        '    <div class="notif-item-time">2 days ago</div>',
        '  </div>',
        '</div>',
        // 4. Request rejected (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon machine"><img src="../assets/icon-notif-order.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">REQ-2026-4698 rejected</span>',
        '    <div class="notif-item-desc">Inlet Flange Set — current flange within acceptable tolerance.</div>',
        '    <div class="notif-item-time">4 days ago</div>',
        '  </div>',
        '</div>',
        // 5. Service completed (read)
        '<div class="notif-item">',
        '  <div class="notif-item-icon service"><img src="../assets/icon-notif-service.svg" alt=""></div>',
        '  <div class="notif-item-content">',
        '    <span class="notif-item-title">Service #15345680 completed</span>',
        '    <div class="notif-item-desc">Preventive maintenance on Zeta 300 — all wear parts replaced.</div>',
        '    <div class="notif-item-time">1 week ago</div>',
        '  </div>',
        '</div>',
      ].join('\n');
    }

    // Update badge count (2 unread)
    if (notifBadge) notifBadge.textContent = '2';
    if (notifCountBadge) notifCountBadge.textContent = '2';

    // Link to notifications page
    if (notifViewAll) notifViewAll.setAttribute('href', 'notifications.html');
  }

  // 22. Expose role for other scripts
  window.netzschUserRole = role;
})();
