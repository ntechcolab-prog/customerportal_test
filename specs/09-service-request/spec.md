---
feature: 09-service-request
status: draft
owner: Gabriel Bastos (UX/UI)
jira: CP-724
mira: https://mira.ntechcolab.com/p/customer-portal/v/1/
prototype: pages/service-request.html, pages/service-request-submitted.html, pages/services.html, assets/service-request-modal.js, assets/service-requests-store.js
---

# Service Request

Pilot of the spec-driven procedure. Content is taken from the prototype at `main` (commit 91a99df).
Everything observed in the prototype is labeled **Assumption** until the business owner confirms it.

## Goal
A customer user asks NETZSCH for service on one of their machines and gets a request number to follow it.

## Users and roles
| Role | Access | Notes |
|---|---|---|
| Admin | Sees and creates | |
| Buyer | Sees and creates | |
| Approver | Sees and creates | |
| Technician | Sees and creates | Main journey of this role (flows.md, flow 09) |

## User stories
- As a customer user, I want to send a service request for one of my machines, so that NETZSCH can repair, maintain, supply parts or advise.
- As a customer user, I want a request number and a confirmation, so that I can follow the request later.

## Scope
**In scope**
- Service Request form (full page and the modal opened from a machine page).
- Confirmation page after sending.
- New request appearing in the Services list with status Submitted.

**Out of scope**
- How NETZSCH processes the request internally (status changes after Submitted).
- Lab Tests and Contracts (same flow 09, separate specs).
- Editing or cancelling a request after it is sent.

## Screens and flow
| Screen | Route / file | Entry points | Exits |
|---|---|---|---|
| Services list | pages/services.html | Nav "Services" | "New request" → Service Request |
| Service Request | pages/service-request.html | Services list; machine page (modal variant) | Send → Confirmation |
| Confirmation | pages/service-request-submitted.html?id=<id>&new=1 | After Send | Services list |

## Data
| Field | Shown / entered | Source | Format | Required | Validation |
|---|---|---|---|---|---|
| Machine | Entered (select) | Customer's installed machines | Machine name | Yes | Must be one of the user's machines |
| Machine information | Shown after machine selection | Machine record | Equipment name, commission, machine type, fig. nr., serviced by, purchase date, install date, warranty | — | Read only |
| Request type | Entered (radio cards) | Fixed list | Repair · Maintenance · Spare Parts Request · Consultation | Yes | One option |
| Title | Entered | User | Text | Yes | 3 to 100 characters |
| Problem description | Entered | User | Text | Yes | At least 10 characters |
| Attachments | Entered (drop zone) | User | PDF, JPG, JPEG, PNG | No | Accepted types only |
| Request number | Shown on confirmation | System | Numeric id | — | Unique |
| Status | Shown in list | System | Submitted · In Progress · Completed · Cancelled | — | New request = Submitted |

## States
| ID | State | Trigger | What the user sees |
|---|---|---|---|
| ST-SR-001 | Default | Form opened | Machine select empty, machine card placeholder, Send disabled |
| ST-SR-002 | Machine selected | User picks a machine | Machine image, serial, country, install date and the Machine Information card |
| ST-SR-003 | Field error | Field left invalid on blur | Inline message under the field (e.g. "This field is required.") |
| ST-SR-004 | Ready to send | All required fields valid | Send enabled |
| ST-SR-005 | Loading | Sending the request | TODO: not designed in the prototype (see OQ-SR-004) |
| ST-SR-006 | Error | Request cannot be created | TODO: not designed in the prototype (see OQ-SR-004) |
| ST-SR-007 | Empty | User has no machines | TODO: not designed in the prototype (see OQ-SR-005) |
| ST-SR-008 | No permission | — | N/A — every role can create a service request (BR-SR-001) |
| ST-SR-009 | Success | Request created | Confirmation page with the request number |

## Business rules
Full list with labels in `business-rules.md`.

## Acceptance criteria
### AC-SR-001 — Every role can open the form
Covers: BR-SR-001, ST-SR-001, ST-SR-008
- **Given** a signed-in user with any role
- **When** the user opens Services and chooses to create a request
- **Then** the Service Request form opens with no machine selected and Send disabled

### AC-SR-002 — Machine selection shows the machine data
Covers: BR-SR-002, ST-SR-002
- **Given** the form is open
- **When** the user selects a machine
- **Then** the machine image, serial, country, install date and the Machine Information card show that machine's data

### AC-SR-003 — Title and description are validated inline
Covers: BR-SR-004, BR-SR-005, ST-SR-003
- **Given** the form is open
- **When** the user leaves Title with fewer than 3 or more than 100 characters, or Description with fewer than 10 characters
- **Then** an inline error appears under that field and is announced to assistive technology

### AC-SR-004 — Send is enabled only when the form is valid
Covers: BR-SR-002, BR-SR-003, BR-SR-004, BR-SR-005, ST-SR-004
- **Given** the form is open
- **When** machine, request type, a valid title and a valid description are all filled
- **Then** Send becomes enabled, and it is disabled again as soon as one of them becomes invalid

### AC-SR-005 — Only accepted file types are attached
Covers: BR-SR-006
- **Given** the form is open
- **When** the user drops or picks files
- **Then** only PDF, JPG, JPEG and PNG files are added to the list

### AC-SR-006 — Sending creates a Submitted request
Covers: BR-SR-007, BR-SR-008, ST-SR-009
- **Given** a valid form
- **When** the user clicks Send
- **Then** a request is created with a new unique number, status Submitted and today's date, and the Confirmation page shows that number

### AC-SR-007 — New request appears in the Services list
Covers: BR-SR-008
- **Given** a request was just sent
- **When** the user opens the Services list
- **Then** the new request is listed with status Submitted, its type, title and machine

### AC-SR-008 — Sending feedback and failure
Covers: ST-SR-005, ST-SR-006
- **Given** a valid form
- **When** the user clicks Send and the request is being created, or creation fails
- **Then** TODO: define after OQ-SR-004

### AC-SR-009 — User without machines
Covers: ST-SR-007
- **Given** a user whose company has no machines registered
- **When** the user opens the form
- **Then** TODO: define after OQ-SR-005

## Open questions
| ID | Question | Owner | Answer |
|---|---|---|---|
| OQ-SR-001 | Is there a maximum length for Problem description? | Business owner | |
| OQ-SR-002 | Attachments: maximum file size and number of files? The full page accepts one file; the modal accepts several. Which is right? | UX/UI | |
| OQ-SR-003 | Who changes the status after Submitted, and does the customer get notified? | Business owner | |
| OQ-SR-004 | Loading and error states when sending are not designed. What does the user see? | UX/UI | |
| OQ-SR-005 | What does a user with no registered machines see? | UX/UI | |
| OQ-SR-006 | Is the request number the SAP / service system number or a portal number? | Development | |
