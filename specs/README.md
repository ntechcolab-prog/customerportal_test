# Spec-driven development — UX/UI kit

The spec is the source of truth. UX/UI writes and agrees the spec **before** code; development
(and its AI coding agents) implements from it. Confluence guide: "UX/UI SPEC Driven" (CP space). Jira: CP-724.

- UX/UI owns the **what and why**: `spec.md`, `business-rules.md`, the prototype.
- Development owns the **how**: `plan.md`, `tasks.md`, the code.

## Folder per feature

```
specs/
  _templates/            copy these to start a feature
  _kit/AGENTS.md         instructions to paste into the product repository (for the dev's AI agent)
  <NN-feature>/
    spec.md              UX/UI — stories, states, acceptance criteria (status: draft | ready)
    business-rules.md    UX/UI — rules with Confirmed / Assumption / Open question labels
    handoff/             generated from MIRA (Handoff › prompt) — screens, components, foundations
    plan.md              Dev — technical plan, written from the spec
    tasks.md             Dev — task breakdown, each task points to AC ids
```

## IDs

Every item has a stable ID so code, tests and Jira can point to it.

| Prefix | Meaning | Example |
|---|---|---|
| `BR-<FEAT>-NNN` | Business rule | `BR-SR-003` |
| `ST-<FEAT>-NNN` | Screen state | `ST-SR-002` |
| `AC-<FEAT>-NNN` | Acceptance criterion | `AC-SR-005` |
| `OQ-<FEAT>-NNN` | Open question | `OQ-SR-001` |

Each acceptance criterion declares what it covers: `Covers: BR-SR-001, ST-SR-002`.

## The flow

1. **Frame** — Jira story with problem, role, in scope, out of scope.
2. **Prototype** — build it; publish in MIRA; review comments until resolved.
3. **Spec** — copy `_templates/` to `specs/<NN-feature>/`, fill `spec.md` and `business-rules.md`.
   Business rules can be generated in MIRA (Handoff › Business rules) and then edited.
4. **Check** — `node scripts/check-spec.mjs specs/<NN-feature>`. It must pass before step 5.
5. **Ready** — set `status: ready` in `spec.md`, run the check again, mark the screens "Ready for dev" in MIRA,
   link the spec folder in the Jira story.
6. **Hand-off** — generate `handoff/` from MIRA; development writes `plan.md` and `tasks.md` from the spec.
7. **Change** — spec first, code second. A behaviour change updates the spec (and a new MIRA version) before the code.

## What the check enforces (Definition of Ready)

Always:
- `spec.md` has every required section and a valid front matter (`feature`, `status`, `owner`, `jira`, `mira`).
- Every `BR-`, `ST-` id is unique and covered by at least one `AC-`.
- Every `AC-` is written as Given / When / Then and references ids that exist.
- The required states exist: default, loading, empty, error, no permission (or are marked `N/A` with a reason).

When `status: ready`:
- No rule labeled **Open question** and no unanswered `OQ-` item.
- Every **Assumption** has `Accepted by:` filled.
- No `TODO` left in the spec.
