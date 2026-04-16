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

  // 2. Hide menu items
  var hidden = hiddenMenus[role] || [];
  if (hidden.length > 0) {
    document.querySelectorAll('.nav-tab').forEach(function (tab) {
      var label = tab.textContent.trim();
      if (hidden.indexOf(label) !== -1) {
        tab.style.display = 'none';
      }
    });
  }

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

  // 7. Expose role for other scripts
  window.netzschUserRole = role;
})();
