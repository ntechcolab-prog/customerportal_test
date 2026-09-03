/* Customer Portal · mobile companion — catálogo.
   Todo dado aqui foi copiado das telas do protótipo desktop
   (machine-zeta60, machine-discus30, machine-subset-inlet-flange,
   machine-spare-parts-results, order-detail, budget, help).
   Nada foi inventado: se um campo não existe no portal, ele não existe aqui. */
window.CP = (function () {
  'use strict';

  var MACHINES = {
    zeta60: {
      id: 'zeta60',
      name: 'Zeta 60',
      line: 'Black Production Only',
      sn: '15202531-10',
      country: 'Brazil',
      installed: 'Jun 2024',
      desktop: 'machine-zeta60.html',
      info: [
        ['Equipment', 'Zeta 60'],
        ['Type', 'Dispersing'],
        ['Serial Number', '15202531-10'],
        ['Commission Nr.', '15202531-10'],
        ['Service by', 'NEM'],
        ['Fig nr.', '12634'],
        ['Purchase Date', '2024-04-10'],
        ['Install Date', '2024-06-15'],
        ['Country', 'Brazil'],
        ['Warranty', '2026-07-01']
      ],
      technical: [
        ['Grinding System', 'Dispersing'],
        ['Grinding Chamber', 'Closed batch tank'],
        ['Grinding Shaft', 'Stainless steel'],
        ['Sealing Material', 'Mechanical seal'],
        ['Integrated Pump', 'No']
      ],
      parts: 'search-zeta60'
    },
    discus30: {
      id: 'discus30',
      name: 'Discus 30',
      line: 'Line 1',
      sn: '2801548-10',
      country: 'Brazil',
      installed: 'Aug 2024',
      desktop: 'machine-discus30.html',
      info: [
        ['Equipment', 'Discus 30'],
        ['Machine Type', 'Bead Mill Stirrer'],
        ['Serial Number', '2801548-10'],
        ['Commission Number', '2801548-10'],
        ['Service by', 'NEM'],
        ['Fig nr.', '12633'],
        ['Purchase Date', '2024-05-12'],
        ['Install Date', '2024-08-20'],
        ['Country', 'Brazil'],
        ['Warranty Expiration', '2026-08-01']
      ],
      technical: [
        ['Grinding System', 'Dissolver'],
        ['Grinding Chamber', 'Open batch tank'],
        ['Grinding Shaft', 'Stainless steel'],
        ['Sealing Material', 'Mechanical seal'],
        ['Integrated Pump', 'No integrated pump']
      ],
      parts: 'inlet-flange'
    }
  };

  var PARTS = {
    'inlet-flange': {
      machine: 'discus30',
      title: 'Inlet Flange Complete',
      sub: 'Subset parts list',
      origin: 'Assembly / subset picked on the desktop · Discus 30',
      items: [
        { pos: '900', code: '517225', name: 'O-Ring', price: '€30.00' },
        { pos: '901', code: '535214', name: 'O-ring - CERTS', price: '€30.00' },
        { pos: '902', code: '535841', name: 'O-ring', price: '€30.00' },
        { pos: '903', code: '545802', name: 'O-ring', price: '€45.00' },
        { pos: '904', code: '528256', name: 'O-Ring', price: null }
      ]
    },
    'search-zeta60': {
      machine: 'zeta60',
      title: 'Spare parts found',
      sub: 'Search results · 2 results',
      origin: '"I need to replace the ring from the inner chamber of my mill"',
      items: [
        { pos: '801', code: '140045213', name: 'Ring - AISI 304', price: '€75.89' },
        { pos: '802', code: '140023995', name: 'Ring for inner pipe', price: null }
      ]
    },
    'search-discus30': {
      machine: 'discus30',
      title: 'Spare parts found',
      sub: 'Search results · 2 results',
      origin: '"I need to replace the ring from the inner chamber of my mill"',
      items: [
        { pos: '801', code: '140045213', name: 'Ring - AISI 304', price: '€75.89' },
        { pos: '802', code: '140023995', name: 'Ring for inner pipe', price: null }
      ]
    }
  };

  /* order-detail.html — o cabeçalho e o bloco de tracking do protótipo trazem
     números diferentes (#2800998-06 no pedido, #15345678 no rastreio).
     Mantido como está no portal, sem reconciliar. */
  var ORDER = {
    id: '2800998-06',
    trackingRef: '15345678',
    tracking: 'PK367366373',
    carrier: 'Fedex Express',
    eta: 'Nov 13, 2025 by 16:00',
    item: {
      name: 'NETZSCH CERABEADS 0.4',
      ref: '443385',
      size: '0,40 - 0,60 mm',
      qty: '1 Kilogram (kg)',
      unit: '39,75 €'
    },
    total: '37,75 €',
    address: ['John Doe', '123 Main Street, Apt 4B', 'New York, NY 10001', 'United States', '+1 (555) 123-4567'],
    steps: [
      { title: 'Order Placed', note: 'Your order has been confirmed.', state: 'Confirmed: Nov 13, 2025 at 12:30 AM', done: true },
      { title: 'Dispatched', note: 'Your order has been dispatched.', state: 'Pending', done: false },
      { title: 'Out for Delivery', note: 'Your order is out for delivery.', state: 'Pending', done: false },
      { title: 'Delivered', note: 'Your order has been delivered.', state: 'Pending Completion', done: false }
    ]
  };

  var BUDGET = {
    period: 'May 2026',
    spent: '16.967,55 €',
    limit: '40.000,00 €',
    remaining: '23.032,45 €',
    used: 42,
    thresholds: [70, 90],
    split: [
      { label: 'Spare Parts', value: '14.567,55 €', share: '86% of spending', orders: '5 orders', avg: '2.913,51 €' },
      { label: 'Services', value: '2.400,00 €', share: '14% of spending', orders: '1 order', avg: '2.400,00 €' }
    ],
    history: [
      { period: 'May 2026', value: '16.967,55 €', pct: 42 },
      { period: 'Apr 2026', value: '31.200,00 €', pct: 78 },
      { period: 'Mar 2026', value: '36.800,00 €', pct: 92 },
      { period: 'Feb 2026', value: '22.000,00 €', pct: 55 },
      { period: 'Jan 2026', value: '27.200,00 €', pct: 68 },
      { period: 'Dec 2025', value: '34.000,00 €', pct: 85 }
    ]
  };

  /* help.html — 37 artigos, na ordem do portal. */
  var HELP = [
    ['How to download a service report', 'Service & Maintenance', 'All Machines', 'Jun 18, 2026'],
    ['Understanding your invoice', 'Orders & Invoices', '', 'Jun 15, 2026'],
    ['Machine error codes explained', 'Machine Documentation', 'Zeta 60, Alpha Zeta 10', 'Jun 12, 2026'],
    ['How to request maintenance', 'Service & Maintenance', 'All Machines', 'Jun 10, 2026'],
    ['Uploading documents to the portal', 'Customer Portal Guides', '', 'Jun 05, 2026'],
    ['How to schedule a preventive maintenance visit', 'Service & Maintenance', 'Discus 30', 'Jun 02, 2026'],
    ['Tracking your shipment in real-time', 'Orders & Invoices', '', 'May 30, 2026'],
    ['Discus 30 — Operating manual overview', 'Machine Documentation', 'Discus 30', 'May 28, 2026'],
    ['Getting started with the customer portal', 'Customer Portal Guides', '', 'May 25, 2026'],
    ['Troubleshooting grinding chamber vibration', 'Service & Maintenance', 'Zeta 60', 'May 22, 2026'],
    ['How to place a bulk order', 'Orders & Invoices', '', 'May 20, 2026'],
    ['Replacing mechanical seals — step by step', 'Service & Maintenance', 'MasterMix 45', 'May 18, 2026'],
    ['Zeta 60 — Technical specifications', 'Machine Documentation', 'Zeta 60', 'May 15, 2026'],
    ['Managing user roles and permissions', 'Customer Portal Guides', '', 'May 12, 2026'],
    ['Cleaning procedures for wet grinding machines', 'Service & Maintenance', 'Discus 30, Zeta 60', 'May 10, 2026'],
    ['Understanding payment terms', 'Orders & Invoices', '', 'May 08, 2026'],
    ['MasterMix 45 — Installation guide', 'Machine Documentation', 'MasterMix 45', 'May 05, 2026'],
    ['Understanding service contract coverage', 'Service & Maintenance', 'All Machines', 'May 02, 2026'],
    ['How to use the spare parts finder', 'Customer Portal Guides', 'All Machines', 'Apr 30, 2026'],
    ['How to request a credit note', 'Orders & Invoices', '', 'Apr 28, 2026'],
    ['Calibrating the temperature monitoring system', 'Service & Maintenance', 'ProPhi', 'Apr 25, 2026'],
    ['ProPhi — Production monitoring setup', 'Machine Documentation', 'ProPhi', 'Apr 22, 2026'],
    ['Downloading invoices as PDF', 'Orders & Invoices', '', 'Apr 20, 2026'],
    ['Bead wear analysis — when to replace grinding media', 'Service & Maintenance', 'Discus 30, Zeta 60', 'Apr 18, 2026'],
    ['Alpha Zeta 10 — Spare parts catalog', 'Machine Documentation', 'Alpha Zeta 10', 'Apr 15, 2026'],
    ['Setting up email notifications', 'Customer Portal Guides', '', 'Apr 12, 2026'],
    ['Emergency shutdown procedures', 'Service & Maintenance', 'All Machines', 'Apr 10, 2026'],
    ['Export documentation requirements', 'Orders & Invoices', '', 'Apr 08, 2026'],
    ['Understanding machine serial numbers', 'Machine Documentation', 'All Machines', 'Apr 05, 2026'],
    ['Lubrication schedule and recommended oils', 'Service & Maintenance', 'MasterMix 45', 'Apr 02, 2026'],
    ['Setting up automatic reorders', 'Orders & Invoices', '', 'Mar 30, 2026'],
    ['Recommended grinding parameters by material', 'Machine Documentation', 'Discus 30, MasterMix 45', 'Mar 28, 2026'],
    ['Dashboard customization options', 'Customer Portal Guides', '', 'Mar 25, 2026'],
    ['How to read the service report', 'Service & Maintenance', 'All Machines', 'Mar 22, 2026'],
    ['Order modification and cancellation policy', 'Orders & Invoices', '', 'Mar 20, 2026'],
    ['Machine commissioning checklist', 'Machine Documentation', 'All Machines', 'Mar 18, 2026'],
    ['Seal inspection intervals and wear indicators', 'Service & Maintenance', 'Zeta 60', 'Mar 15, 2026']
  ].map(function (a) {
    return { title: a[0], category: a[1], machine: a[2], updated: a[3] };
  });

  /* notifications.html — copiado 1:1 da lista do portal (pages/notifications.html).
     `type` segue os data-type do portal (approvals, orders, quotes, contracts,
     services); `unread` reproduz os 3 não lidos. `to` só existe quando a tela
     daquele assunto já existe no companion — senão o item abre no portal. */
  var NOTIFICATIONS = [
    { type: 'approvals', unread: true,  title: 'Order #2800998-27 approved by Daniel Costa', time: '20 min ago',  desc: 'Your order for Steel Beads Micro (1.200,00 €) has been approved and is now being processed.' },
    { type: 'approvals', unread: true,  title: 'Order #2800998-25 rejected by Daniel Costa', time: '2 hours ago', desc: 'Reason: "Exceeds Q2 budget limit for spare parts." You can edit and resubmit this order for approval.' },
    { type: 'orders',    unread: false, title: 'Order #2800998-24 shipped',                  time: '1 day ago',    desc: 'Your order has been dispatched from Selb, Germany. Estimated delivery: May 12, 2026. Tracking number: DHL-4829103847.' },
    { type: 'approvals', unread: false, title: 'Order #2800998-26 approved by Ana Ferreira',  time: '1 day ago',    desc: 'Your order for ZetaBeads Plus 0.3mm (850,00 €) has been approved.' },
    { type: 'quotes',    unread: false, title: 'Quote #QT-2026-0041 ready for review',        time: '2 days ago',   desc: 'Spare parts for Alpha Zeta 10 — 12.450,00 €. Valid until May 31, 2026.' },
    { type: 'contracts', unread: true,  title: 'Contract CTR-S-2025-002 expiring soon',       time: '3 days ago',   desc: 'Service contract for Epsilon + PMD (5 units) expires on Jul 31, 2026. Review and renew to maintain coverage and discounts.' },
    { type: 'contracts', unread: false, title: 'Service visit scheduled — CTR-S-2026-001',    time: '5 days ago',   desc: 'Preventive maintenance visit confirmed for Jul 15–17, 2026. NEOS 10 (3 units). 1 NETZSCH technician, 3 business days.' },
    { type: 'approvals', unread: false, title: 'Reminder: 3 orders pending approval',         time: '3 days ago',   desc: 'Orders #2800998-28, #29, #30 are awaiting approver review. Average approval time: 1.5 business days.', to: 'approve.html' },
    { type: 'orders',    unread: false, title: 'Order #2800998-23 delivered',                 time: '4 days ago',   desc: 'Your order for CERABEADS 0.4 has been delivered successfully. Signed by: Reception desk.' },
    { type: 'services',  unread: false, title: 'Service Request #SR-1192 updated',            time: '1 week ago',   desc: 'Technician assigned — scheduled maintenance for your Zeta 60 on May 20, 2026.', to: 'service.html' },
    { type: 'approvals', unread: false, title: 'Order #2800998-22 rejected by Daniel Costa',  time: '1 week ago',   desc: 'Reason: "Duplicate order — already processed under #2800998-21." No action needed.' },
    { type: 'quotes',    unread: false, title: 'Quote #QT-2026-0038 expired',                 time: '2 weeks ago',  desc: 'Your quote for Grinding beads bundle for Zeta 60 (8.720,00 €) has expired. Request a new quote if still needed.' },
    { type: 'orders',    unread: false, title: 'Order #2800998-21 confirmed by NETZSCH',      time: '2 weeks ago',  desc: 'Your order has been received and is being processed. Expected shipment: May 1, 2026.' }
  ];

  /* service-request-submitted.html — o mesmo Service Request da notificação
     (SR-1192). O modelo de status é o do portal: Submitted → In Progress →
     Completed. `machine` referencia MACHINES.zeta60; `serviceBy` sai do
     "Service by: NEM" da ficha da máquina. `notify` marca quais mudanças de
     status valem um aviso no celular (é a decisão de discovery do CP-671):
     técnico designado e concluído pingam; o "Submitted" inicial não. */
  var SERVICE = {
    id: 'SR-1192',
    type: 'Maintenance',
    machine: 'zeta60',
    scheduled: 'May 20, 2026',
    serviceBy: 'NEM',
    status: 'in-progress',
    event: {
      title: 'Technician assigned',
      note: 'Scheduled maintenance for your Zeta 60 on May 20, 2026.',
      time: '1 week ago'
    },
    steps: [
      { key: 'submitted',   title: 'Submitted',   note: 'Request received by NETZSCH.',                        state: 'Received', done: true,  notify: false },
      { key: 'in-progress', title: 'In Progress', note: 'Technician assigned · visit scheduled May 20, 2026.', state: 'Current',  done: true,  notify: true  },
      { key: 'completed',   title: 'Completed',   note: 'The service report will appear here.',                state: 'Pending',  done: false, notify: true  }
    ]
  };

  /* Approver decision (CP-667) — a aprovação de pedido NÃO existe como tela no
     desktop; ela aparece só no feed de notificações (pages/notifications.html):
     "approved/rejected by Daniel Costa", e o lembrete "3 orders pending
     approval" (#2800998-28/29/30). Este objeto reúne o que o portal de fato
     mostra: o approver (Daniel Costa), o outro approver que cobre o estado
     "outra pessoa já decidiu" (Ana Ferreira, também do feed), o pedido pendente
     com dados reais do dashboard (#2800998-30: data, total, descrição, itens) e
     os motivos de recusa que o próprio feed traz. `requestedBy` sai de
     CP.user.name. Nada inventado. */
  var APPROVAL = {
    approver: 'Daniel Costa',
    otherApprover: 'Ana Ferreira',
    pendingCount: 3,                 /* "3 orders pending approval" */
    order: {
      id: '2800998-30',
      date: 'Feb 28, 2026',
      requestedBy: 'John Doe',
      desc: 'LMZ60 spares',
      items: 3,
      total: '4.000,00 EUR'
    },
    /* motivos que o feed do portal traz em recusas reais (#2800998-25 / -22) */
    reasons: [
      'Exceeds budget limit for spare parts',
      'Duplicate order'
    ]
  };

  return {
    user: { name: 'John Doe', role: 'Technician', company: 'Acme Corp' },
    machines: MACHINES,
    parts: PARTS,
    order: ORDER,
    budget: BUDGET,
    help: HELP,
    notifications: NOTIFICATIONS,
    service: SERVICE,
    approval: APPROVAL
  };
})();
