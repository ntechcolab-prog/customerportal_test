/**
 * NETZSCH Customer Portal — Role-based navigation guard
 * Reads `netzsch_user_role` from localStorage and hides menu items / features
 * that the current role should not access.
 *
 * Roles: administrator, buyer, approver, technician
 */
(function () {
  var role = localStorage.getItem('netzsch_user_role') || 'administrator';

  // Menu items to hide per role (nav-tab text content → hide if listed)
  var hiddenMenus = {
    administrator: [],
    buyer: [],
    approver: ['Shop'],
    technician: ['Quotes']
  };

  // Pages that should redirect to dashboard if role has no access
  var blockedPages = {
    technician: [
      'checkout.html', 'checkout-cart.html', 'checkout-review.html',
      'checkout-confirmation.html', 'checkout-order-details.html', 'checkout-quote.html',
      'quotes.html', 'quote-detail.html',
      'admin-company.html', 'admin-users.html', 'admin-roles.html',
      'admin-requests.html', 'admin-notifications.html'
    ],
    approver: [
      'shop.html', 'shop-product-detail.html', 'shop-product-glassbeads.html',
      'shop-product-steelbeads-micro.html', 'shop-product-steelbeads-q.html',
      'shop-product-zetabeads-nano.html', 'shop-product-zetabeads-plus.html',
      'shop-product-zs-beads.html',
      'checkout.html', 'checkout-cart.html', 'checkout-review.html',
      'checkout-confirmation.html', 'checkout-order-details.html', 'checkout-quote.html',
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
    var label = tab.textContent.trim();
    if (hidden.indexOf(label) !== -1) {
      tab.style.display = 'none';
    }
    // Rename "Orders" to "Requests" for technician
    if (role === 'technician' && label === 'Orders') {
      tab.textContent = 'Requests';
    }
  });

  // 3. Hide Admin link in profile dropdown for non-admin roles
  if (role !== 'administrator') {
    document.querySelectorAll('.profile-dropdown-item').forEach(function (item) {
      if (item.textContent.trim() === 'Admin') {
        item.closest('li').style.display = 'none';
      }
    });
  }

  // 4. Hide cart icon for technician (no shop access)
  if (role === 'technician') {
    var cartBtn = document.getElementById('btn-cart');
    if (cartBtn) cartBtn.style.display = 'none';
    var cartDropdown = document.getElementById('cart-dropdown');
    if (cartDropdown) cartDropdown.style.display = 'none';
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
    document.querySelectorAll('th').forEach(function (th) {
      var text = th.textContent.trim().toLowerCase();
      if (text === 'unit price' || text === 'total' || text === 'price') {
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
      btn.style.color = '#d97706';
    });

    // Solid buttons in wishlist cards
    document.querySelectorAll('.btn-add-cart').forEach(function (btn) {
      // Replace inner content (SVG + text) with new label
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Request for Approval';
      btn.style.background = '#d97706';
    });
  }

  // 7. Transform Orders page into Requests page for technician
  if (role === 'technician' && currentPage === 'orders.html') {
    // Rename title and breadcrumb
    var h1 = document.querySelector('.title-bar h1');
    if (h1) h1.textContent = 'Requests';
    document.querySelectorAll('.breadcrumb-current').forEach(function (el) {
      if (el.textContent.trim() === 'Orders') el.textContent = 'Requests';
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
          pending: '<span class="status-badge status-placed"><span class="status-dot"></span>Pending Approval</span>',
          approved: '<span class="status-badge status-delivered"><span class="status-dot"></span>Approved</span>',
          rejected: '<span class="status-badge" style="background:#fce8e6;color:#c73e20;"><span class="status-dot" style="background:#c73e20;"></span>Rejected</span>'
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
        pending: '<span class="status-badge status-placed" style="font-size:13px;"><span class="status-dot"></span>Pending Approval</span>',
        approved: '<span class="status-badge status-delivered" style="font-size:13px;"><span class="status-dot"></span>Approved</span>',
        rejected: '<span class="status-badge" style="background:#fce8e6;color:#c73e20;font-size:13px;"><span class="status-dot" style="background:#c73e20;"></span>Rejected</span>'
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

  // 9. Expose role for other scripts
  window.netzschUserRole = role;
})();
