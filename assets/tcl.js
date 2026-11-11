/**
 * Links this prototype to the Customer Portal Design System (customerportal-ds)
 * for MIRA's Dev Mode.
 *
 * The DS was extracted from this prototype: every DS component names, in its
 * source, the prototype classes it replaces. This script stamps those elements
 * with the same attributes the DS components emit (`data-tcl`, `data-tcl-ds`,
 * `data-tcl-props`, see customerportal-ds src/helpers/tcl.ts), so clicking an
 * element in MIRA shows which DS component it is and links to its page.
 *
 * The attributes are inert: no styling, no behaviour. Elements added later by
 * the prototype's own scripts (header, dropdowns, Milla, modals) are stamped by
 * a MutationObserver. An element that already has `data-tcl` is left alone.
 */
(function () {
  'use strict';

  var DS = 'customerportal';

  function hasAny(el, classes) {
    for (var i = 0; i < classes.length; i++) if (el.classList.contains(classes[i])) return classes[i];
    return null;
  }

  function buttonProps(el) {
    var p = {};
    var variant = hasAny(el, ['btn-primary', 'btn-outline', 'btn-gray-outline', 'btn-cta', 'btn-secondary', 'btn-ghost', 'btn-danger', 'btn-link']);
    if (variant) p.variant = variant.replace('btn-', '');
    var size = hasAny(el, ['btn-sm', 'btn-lg']);
    if (size) p.size = size.replace('btn-', '');
    if (el.classList.contains('btn-full')) p.fullWidth = true;
    if (el.disabled) p.disabled = true;
    return p;
  }

  // Order matters: the first rule an element matches names it. Specific
  // components come before the generic ones (Card, Button) they contain.
  var RULES = [
    // Shell
    ['.app-header', 'AppHeader'],
    ['.topbar', 'Topbar'],
    ['.account-sidebar, .admin-sidebar', 'SideNav'],
    ['.breadcrumb-bar, .breadcrumb', 'Breadcrumb'],
    ['.back-link', 'BackLink'],
    ['.title-bar', 'TitleBar'],
    ['.lang-switcher', 'LanguageSwitcher'],
    ['.profile-dropdown', 'ProfileMenu'],
    ['.profile-dropdown-item', 'MenuItem'],
    ['.notif-dropdown', 'NotificationsPopover'],
    ['.notif-item', 'NotificationItem'],
    ['.notif-section', 'NotificationSettingRow'],
    ['.cart-dropdown', 'CartPopover'],
    ['.welcome-card', 'WelcomeCard'],
    ['.user-initials', 'Avatar'],
    ['.user-cell', 'UserCell'],
    // Milla
    ['.milla-chat', 'MillaChat'],
    ['.milla-fab', 'MillaFab'],
    ['.milla-searchbar', 'MillaSearchbar'],
    ['.method-card, .milla-banner', 'SearchMethodSelector'],
    // Dashboard, machines, documents
    ['.stat-card', 'StatCard'],
    ['.contract-alert', 'ContractAlert'],
    ['.insight-item', 'InsightItem'],
    ['.hero-card', 'MachineHero'],
    ['.hero-action-item', 'HeroActionItem'],
    ['.hero-details-toggle', 'Accordion'],
    ['.machine-card', 'MachineCard'],
    ['.drawing-hotspot', 'DrawingHotspots'],
    ['.hotspot-tip', 'Tooltip'],
    ['.results-card, .selection-bar', 'SparePartRow'],
    ['.docs-item', 'DocumentListItem'],
    ['.permissions-table', 'PermissionMatrix'],
    // Shop, checkout, orders
    ['.product-card', 'ProductCard'],
    ['.product-gallery-main, .product-thumbs', 'ProductGallery'],
    ['.bulk-card', 'BulkPricing'],
    ['.product-row', 'CartLineItem'],
    ['.quantity-controls', 'QuantityStepper'],
    ['.shipping-section', 'ShippingBlock'],
    ['.shipment-toggle', 'SegmentedControl'],
    ['.payment-card', 'PaymentCard'],
    ['.order-panel', 'OrderPanel'],
    ['.address-card, .delivery-option, .sr-radio-card', 'RadioCardGroup'],
    ['.progress-bar', 'ChevronStepper'],
    // Generic components
    ['.filter-bar', 'FilterBar'],
    ['.filter-search', 'SearchField'],
    ['.pagination', 'Pagination'],
    ['.nc-filter-tab, .product-tab', 'Tabs'],
    ['.tracking-drawer', 'Drawer'],
    ['.drawer-section', 'DrawerSection'],
    ['.modal', 'Modal'],
    ['.nc-toast, .wishlist-toast', 'Toast'],
    ['.partial-alert', 'Banner'],
    ['.empty-state', 'EmptyState'],
    ['.dropzone, .sr-dropzone', 'FileDropzone'],
    ['.detail-row, .info-row, .info-item, .payment-row', 'InfoGrid'],
    ['.status-badge', 'StatusBadge', function (el) { return { label: el.textContent.trim() }; }],
    ['.cat-badge, .ai-badge, .avail-badge, .delivery-tag, .docs-badge, .quotation-only, .role-special', 'Tag', function (el) { return { label: el.textContent.trim() }; }],
    ['.skeleton-card', 'SkeletonCard'],
    ['.skeleton', 'Skeleton'],
    ['.docadm-spinner, .spinner-icon', 'Spinner'],
    ['.form-group, .field-row', 'FormField'],
    ['.form-input', 'TextField'],
    ['.form-select', 'Select'],
    ['.form-textarea', 'Textarea'],
    ['.terms-row', 'TermsCheckbox'],
    ['.row-checkbox', 'Checkbox'],
    ['.radio-circle', 'Radio'],
    ['table', 'Table'],
    ['.action-btn, .header-icon-btn', 'IconButton', function (el) { var l = el.getAttribute('aria-label') || el.getAttribute('title'); return l ? { label: l } : {}; }],
    ['.btn', 'Button', buttonProps],
    ['.card', 'Card']
  ];

  var ALL = RULES.map(function (r) { return r[0]; }).join(', ');

  function stamp(el) {
    if (el.hasAttribute('data-tcl')) return;
    for (var i = 0; i < RULES.length; i++) {
      if (!el.matches(RULES[i][0])) continue;
      el.setAttribute('data-tcl', RULES[i][1]);
      el.setAttribute('data-tcl-ds', DS);
      var props = RULES[i][2] ? RULES[i][2](el) : null;
      if (props) {
        for (var k in props) if (typeof props[k] === 'string' && props[k].length > 80) props[k] = props[k].slice(0, 79) + '…';
        var json = JSON.stringify(props);
        if (json !== '{}' && json.length <= 600) el.setAttribute('data-tcl-props', json);
      }
      return;
    }
  }

  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.matches(ALL)) stamp(root);
    var found = root.querySelectorAll(ALL);
    for (var i = 0; i < found.length; i++) stamp(found[i]);
  }

  function start() {
    scan(document.body);
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var added = records[i].addedNodes;
        for (var j = 0; j < added.length; j++) scan(added[j]);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
