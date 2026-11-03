---
feature: <NN-feature-name>
status: draft            # draft | ready
owner: <UX/UI designer>
jira: <CP-XXX>
mira: <https://mira.ntechcolab.com/p/<project>/v/<n>/>
prototype: <pages/<screen>.html, ...>
---

# <Feature name>

## Goal
<One sentence: what the user achieves.>

## Users and roles
| Role | Access | Notes |
|---|---|---|
| <role> | <sees / acts / hidden> | |

## User stories
- As a <role>, I want <action>, so that <outcome>.

## Scope
**In scope**
- <item>

**Out of scope**
- <item>

## Screens and flow
| Screen | Route / file | Entry points | Exits |
|---|---|---|---|
| <name> | <pages/x.html> | <from> | <to> |

## Data
| Field | Shown / entered | Source | Format | Required | Validation |
|---|---|---|---|---|---|
| <field> | | | | | |

## States
Required: default, loading, empty, error, no permission. Use `N/A — <reason>` when a state cannot happen.

| ID | State | Trigger | What the user sees |
|---|---|---|---|
| ST-<FEAT>-001 | Default | | |
| ST-<FEAT>-002 | Loading | | |
| ST-<FEAT>-003 | Empty | | |
| ST-<FEAT>-004 | Error | | |
| ST-<FEAT>-005 | No permission | | |

## Business rules
Full list with labels in `business-rules.md`.

## Acceptance criteria
### AC-<FEAT>-001 — <short name>
Covers: BR-<FEAT>-001, ST-<FEAT>-001
- **Given** <context>
- **When** <action>
- **Then** <observable result>

## Open questions
| ID | Question | Owner | Answer |
|---|---|---|---|
| OQ-<FEAT>-001 | | | |
