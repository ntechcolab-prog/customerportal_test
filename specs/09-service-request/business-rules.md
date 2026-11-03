# Business rules — Service Request

Labels: **Confirmed** (agreed with the business owner) · **Assumption** (needs `Accepted by:`) · **Open question** (blocks ready).
Source "Prototype" = observed in `customerportal_test` at commit 91a99df; not yet confirmed by the business.

| ID | Rule | Label | Source | Accepted by |
|---|---|---|---|---|
| BR-SR-001 | Every role (Admin, Buyer, Approver, Technician) can create a service request. | Assumption | flows.md, flow 09 matrix | |
| BR-SR-002 | A request is always for exactly one machine, chosen from the user's company machines. | Assumption | Prototype: pages/service-request.html | |
| BR-SR-003 | Request type is required and is one of: Repair, Maintenance, Spare Parts Request, Consultation. | Assumption | Prototype: pages/service-request.html | |
| BR-SR-004 | Title is required, 3 to 100 characters. | Assumption | Prototype: FormValidator rules | |
| BR-SR-005 | Problem description is required, at least 10 characters. Maximum length not defined. | Open question | Prototype: FormValidator rules; OQ-SR-001 | |
| BR-SR-006 | Attachments are optional; accepted types PDF, JPG, JPEG, PNG. Size and count limits not defined. | Open question | Prototype: accept attribute; OQ-SR-002 | |
| BR-SR-007 | Each request gets a unique number when it is created. | Assumption | Prototype: ServiceRequestsStore.newId; OQ-SR-006 | |
| BR-SR-008 | A new request starts with status Submitted. Later statuses: In Progress, Completed, Cancelled. | Assumption | Prototype: assets/service-requests-store.js; OQ-SR-003 | |
